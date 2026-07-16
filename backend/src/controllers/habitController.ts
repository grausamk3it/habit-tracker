// backend/src/controllers/habitController.ts
import { Request, Response } from 'express';
import pool from '../db';
import { checkAndUnlockAchievements } from './achievementController'; // <-- Добавлен импорт

const XP_PER_COMPLETION = 10;
const BASE_XP_FOR_LEVEL_UP = 100;
const XP_MULTIPLIER = 1.5;

// backend/src/controllers/habitController.ts

// Вспомогательная функция для сравнения дат (игнорирует время)
const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

export const getHabits = async (req: Request, res: Response) => {
    try {
        // 1. Получаем базовые данные о привычках и статусе на СЕГОДНЯ
        const habitsRes = await pool.query(`
            SELECT 
                h.id, h.title, h.description, 
                CASE WHEN c.id IS NOT NULL THEN true ELSE false END as is_completed_today
            FROM habits h
            LEFT JOIN completions c ON h.id = c.habit_id AND c.completed_at = CURRENT_DATE
            ORDER BY h.created_at DESC
        `);
        
        const habits = habitsRes.rows;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 2. Для каждой привычки считаем серию и график за 7 дней
        const enhancedHabits = await Promise.all(habits.map(async (habit) => {
            // Берем последние 14 выполнений (этого достаточно для расчета серии и 7 дней)
            const compsRes = await pool.query(
                `SELECT completed_at FROM completions WHERE habit_id = $1 ORDER BY completed_at DESC LIMIT 14`,
                [habit.id]
            );
            const completions = compsRes.rows.map(r => {
                const d = new Date(r.completed_at);
                d.setHours(0, 0, 0, 0);
                return d;
            });

            // --- Расчет серии (Streak) ---
            let streak = 0;
            let checkDate = new Date(today);
            
            // Если сегодня не выполнено, начинаем проверку со вчерашнего дня (чтобы не сбрасывать серию до конца дня)
            const isTodayDone = completions.some(d => isSameDay(d, today));
            if (!isTodayDone) {
                checkDate.setDate(checkDate.getDate() - 1);
            }

            for (const compDate of completions) {
                if (isSameDay(compDate, checkDate)) {
                    streak++;
                    checkDate.setDate(checkDate.getDate() - 1); // Сдвигаемся на день назад
                } else {
                    break; // Серия прервалась
                }
            }

            // --- Расчет графика за последние 7 дней ---
            const weeklyActivity = [];
            for (let i = 6; i >= 0; i--) {
                const targetDate = new Date(today);
                targetDate.setDate(targetDate.getDate() - i);
                const isDone = completions.some(d => isSameDay(d, targetDate));
                weeklyActivity.push(isDone);
            }

            return {
                ...habit,
                streak,
                weeklyActivity // Массив вида [false, true, true, false, true, true, false]
            };
        }));

        res.json(enhancedHabits);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении привычек' });
    }
};

export const createHabit = async (req: Request, res: Response) => {
    const { title, description } = req.body;
    try {
        const newHabit = await pool.query(
            'INSERT INTO habits (title, description) VALUES ($1, $2) RETURNING *',
            [title, description]
        );
        res.status(201).json(newHabit.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при создании привычки' });
    }
};

export const deleteHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM habits WHERE id = $1', [id]);
        res.json({ message: 'Привычка удалена' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при удалении' });
    }
};

export const completeHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Создаем запись о выполнении
        await client.query(
            'INSERT INTO completions (habit_id, completed_at) VALUES ($1, CURRENT_DATE)',
            [id]
        );

        // 2. Получаем пользователя
        const userRes = await client.query('SELECT id, level, xp FROM users ORDER BY id LIMIT 1');
        
        let responseData: any = { message: 'Привычка выполнена!', xpGained: XP_PER_COMPLETION };

        if (userRes.rows.length > 0) {
            const user = userRes.rows[0];
            let newXp = user.xp + XP_PER_COMPLETION;
            let newLevel = user.level;

            const xpNeeded = Math.floor(BASE_XP_FOR_LEVEL_UP * Math.pow(XP_MULTIPLIER, user.level - 1));
            
            if (newXp >= xpNeeded) {
                newLevel += 1;
                newXp -= xpNeeded;
            }

            await client.query(
                'UPDATE users SET level = $1, xp = $2 WHERE id = $3',
                [newLevel, newXp, user.id]
            );

            // 3. ПРОВЕРКА АЧИВОК (внутри транзакции!)
            const totalCompletionsRes = await client.query('SELECT COUNT(*) as count FROM completions');
            const totalCompletions = parseInt(totalCompletionsRes.rows[0].count);
            
            const newAchievements = await checkAndUnlockAchievements(user.id, { 
                level: newLevel, 
                totalCompletions 
            });

            const updatedUser = await client.query('SELECT level, xp FROM users WHERE id = $1', [user.id]);
            
            // Формируем единый ответ
            responseData.user = updatedUser.rows[0];
            if (newAchievements.length > 0) {
                responseData.newAchievements = newAchievements;
            }
        }

        await client.query('COMMIT');
        
        // ОТПРАВЛЯЕМ ОТВЕТ ТОЛЬКО ЗДЕСЬ, ПОСЛЕ ВСЕХ ОПЕРАЦИЙ
        res.status(201).json(responseData);

    } catch (error: any) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            res.status(400).json({ message: 'Привычка уже выполнена сегодня' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при выполнении привычки' });
        }
    } finally {
        client.release();
    }
};

export const uncompleteHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query(
            'DELETE FROM completions WHERE habit_id = $1 AND completed_at = CURRENT_DATE',
            [id]
        );
        res.json({ message: 'Выполнение отменено' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при отмене выполнения' });
    }
};
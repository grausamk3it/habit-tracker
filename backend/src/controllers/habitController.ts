// backend/src/controllers/habitController.ts
import { Request, Response } from 'express';
import pool from '../db';
import { checkAndUnlockAchievements } from './achievementController'; // <-- Добавлен импорт

const XP_PER_COMPLETION = 10;
const BASE_XP_FOR_LEVEL_UP = 100;
const XP_MULTIPLIER = 1.5;

export const getHabits = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                h.id, h.title, h.description, 
                CASE WHEN c.id IS NOT NULL THEN true ELSE false END as is_completed_today
            FROM habits h
            LEFT JOIN completions c ON h.id = c.habit_id AND c.completed_at = CURRENT_DATE
            ORDER BY h.created_at DESC
        `);
        res.json(result.rows);
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
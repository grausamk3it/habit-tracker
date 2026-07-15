// backend/src/controllers/achievementController.ts
import { Request, Response } from 'express';
import pool from '../db';

// Вспомогательная функция для проверки и разблокировки
async function tryUnlock(userId: number, achievementId: number) {
    try {
        await pool.query(
            'INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)',
            [userId, achievementId]
        );
        console.log(`🏆 Ачивка ${achievementId} разблокирована для пользователя ${userId}!`);
        return true;
    } catch (error: any) {
        // Если ошибка "уникальное ограничение" (23505), значит ачивка уже есть
        if (error.code !== '23505') console.error(error);
        return false;
    }
}

// Главная функция проверки условий
export const checkAndUnlockAchievements = async (userId: number, context: { level: number, totalCompletions: number }) => {
    const unlocked = [];

    // 1. Первые шаги (1 выполнение)
    if (context.totalCompletions >= 1) {
        if (await tryUnlock(userId, 1)) unlocked.push(1);
    }
    // 2. Трудяга (5 выполнений)
    if (context.totalCompletions >= 5) {
        if (await tryUnlock(userId, 3)) unlocked.push(3);
    }
    // 3. Новичок (2 уровень)
    if (context.level >= 2) {
        if (await tryUnlock(userId, 2)) unlocked.push(2);
    }

    return unlocked;
};

// Отдельная ачивка для ИИ (вызывается из aiController)
export const unlockAIAchievement = async (userId: number) => {
    return await tryUnlock(userId, 4);
};

// Получить список всех ачивок со статусом для текущего пользователя
// backend/src/controllers/achievementController.ts
export const getUserAchievements = async (req: Request, res: Response) => {
    try {
        const userRes = await pool.query('SELECT id FROM users ORDER BY id LIMIT 1');
        if (userRes.rows.length === 0) return res.json([]);
        const userId = userRes.rows[0].id;

        // Получаем ТОЛЬКО ID и статус разблокировки
        const unlockedRes = await pool.query(
            'SELECT achievement_id FROM user_achievements WHERE user_id = $1', 
            [userId]
        );
        const unlockedIds = unlockedRes.rows.map((r: any) => r.achievement_id);

        // Возвращаем полный список ID с их статусом
        // Никакого русского текста из БД!
        const result = [1, 2, 3, 4].map(id => ({
            id,
            is_unlocked: unlockedIds.includes(id)
        }));

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения ачивок' });
    }
};
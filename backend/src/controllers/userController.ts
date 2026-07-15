// backend/src/controllers/userController.ts
import { Request, Response } from 'express';
import pool from '../db';

// Временное решение: всегда возвращаем первого пользователя
export const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT id, level, xp FROM users ORDER BY id LIMIT 1');
        
        if (result.rows.length === 0) {
            // Если пользователей нет, создаем тестового
            const newUser = await pool.query(
                "INSERT INTO users (email, password_hash) VALUES ('test@test.com', 'hashed_password') RETURNING id, level, xp"
            );
            res.json(newUser.rows[0]);
        } else {
            res.json(result.rows[0]);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка получения пользователя' });
    }
};
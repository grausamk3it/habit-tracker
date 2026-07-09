// backend/src/controllers/habitController.ts
import { Request, Response } from 'express';
import pool from '../db';

// Получить все привычки пользователя
export const getHabits = async (req: Request, res: Response) => {
    try {
        // Пока берем все привычки, позже добавим фильтр по user_id
        const result = await pool.query('SELECT * FROM habits ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка при получении привычек' });
    }
};

// Создать новую привычку
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

// Удалить привычку
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
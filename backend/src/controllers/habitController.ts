// backend/src/controllers/habitController.ts
import { Request, Response } from 'express';
import pool from '../db';

// Получить все привычки с флагом выполнения на СЕГОДНЯ
export const getHabits = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT 
                h.id, 
                h.title, 
                h.description, 
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

// Отметить привычку как выполненную СЕГОДНЯ
export const completeHabit = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'INSERT INTO completions (habit_id, completed_at) VALUES ($1, CURRENT_DATE) RETURNING *',
            [id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        // Если запись уже есть (уникальное ограничение), игнорируем или возвращаем ошибку
        if (error.code === '23505') {
            res.status(400).json({ message: 'Привычка уже выполнена сегодня' });
        } else {
            console.error(error);
            res.status(500).json({ message: 'Ошибка при выполнении привычки' });
        }
    }
};

// Отменить выполнение привычки за СЕГОДНЯ
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
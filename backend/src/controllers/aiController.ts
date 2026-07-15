// backend/src/controllers/aiController.ts
import { Request, Response } from 'express';
import OpenAI from 'openai';
import pool from '../db';

// Инициализируем клиент OpenAI, но указываем baseURL для Groq
const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1", // <-- Важное отличие!
});

export const getCoachAdvice = async (req: Request, res: Response) => {
    try {
        // 1. Получаем актуальный список привычек
        const habitsRes = await pool.query(`
            SELECT 
                h.title, 
                CASE WHEN c.id IS NOT NULL THEN true ELSE false END as is_completed_today
            FROM habits h
            LEFT JOIN completions c ON h.id = c.habit_id AND c.completed_at = CURRENT_DATE
            ORDER BY h.created_at DESC
        `);
        const habits = habitsRes.rows;

        if (habits.length === 0) {
            return res.json({ 
                advice: "Привет! Я твой ИИ-коуч. Похоже, у тебя пока нет привычек. Давай создадим первую прямо сейчас? Маленькие шаги ведут к большим переменам! 🚀" 
            });
        }

        // 2. Формируем текст для промпта
        const habitsSummary = habits.map(h => 
            `- ${h.title} (${h.is_completed_today ? '✅ Выполнено' : '⏳ Ожидает'})`
        ).join('\n');

        const completedCount = habits.filter(h => h.is_completed_today).length;
        const totalCount = habits.length;

        // 3. Отправляем запрос в Groq (используем модель Llama 3)
        const completion = await openai.chat.completions.create({
            model: "llama-3.1-8b-instant", // Быстрая и бесплатная модель
            messages: [
                {
                    role: "system",
                    content: "Ты — дружелюбный и мотивирующий ИИ-коуч по привычкам. Твоя задача — дать короткий (2-3 предложения), вдохновляющий совет пользователю на основе его прогресса за сегодня. Используй эмодзи. Если всё выполнено — похвали. Если есть невыполненные — мягко подбодри. Отвечай на русском языке."
                },
                {
                    role: "user",
                    content: `Мой прогресс на сегодня: ${completedCount} из ${totalCount} привычек выполнено.\n\nСписок:\n${habitsSummary}`
                }
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const advice = completion.choices[0].message.content;
        res.json({ advice });

    } catch (error) {
        console.error('Ошибка ИИ:', error);
        
        // FALLBACK на случай ошибок
        res.json({ 
            advice: "🤖 [Тестовый режим] Отличная работа! Помни, что постоянство важнее интенсивности. Даже маленький прогресс сегодня — это шаг к большой цели завтра. Продолжай в том же духе!" 
        });
    }
};
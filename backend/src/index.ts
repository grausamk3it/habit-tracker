import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import habitRoutes from './routes/habitRoutes'; // Импортируем наши роуты
import userRoutes from './routes/userRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Подключаем роуты по адресу /api/habits
app.use('/api/habits', habitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Тестовый роут
app.get('/api/health', async (req, res) => {
    try {
        const dbCheck = await pool.query('SELECT NOW()');
        res.json({ message: 'Backend is working!', dbTime: dbCheck.rows[0].now });
    } catch (error) {
        res.status(500).json({ message: 'DB Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
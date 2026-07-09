import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware (промежуточные обработчики)
app.use(cors()); // Разрешаем запросы с фронтенда
app.use(express.json()); // Учим сервер понимать JSON в теле запросов

// Базовый роут для проверки, что сервер жив
app.get('/api/health', (req, res) => {
    res.json({ message: 'Backend is working! 🚀' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
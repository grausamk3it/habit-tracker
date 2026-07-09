import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
    try {
        const dbCheck = await pool.query('SELECT NOW()');
        res.json({ 
            message: 'Backend and Database are working! 🚀',
            dbTime: dbCheck.rows[0].now 
        });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ message: 'Database connection failed' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
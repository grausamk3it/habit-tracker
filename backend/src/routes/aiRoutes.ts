// backend/src/routes/aiRoutes.ts
import { Router } from 'express';
import { getCoachAdvice } from '../controllers/aiController';

const router = Router();
router.get('/coach', getCoachAdvice);

export default router;
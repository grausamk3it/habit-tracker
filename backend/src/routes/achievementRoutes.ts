import { Router } from 'express';
import { getUserAchievements } from '../controllers/achievementController';

const router = Router();
router.get('/', getUserAchievements);
export default router;
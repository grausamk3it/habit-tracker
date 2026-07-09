// backend/src/routes/habitRoutes.ts
import { Router } from 'express';
import { getHabits, createHabit, deleteHabit } from '../controllers/habitController';

const router = Router();

router.get('/', getHabits);
router.post('/', createHabit);
router.delete('/:id', deleteHabit);

export default router;
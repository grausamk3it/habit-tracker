// backend/src/routes/habitRoutes.ts
import { Router } from 'express';
import { 
    getHabits, 
    createHabit, 
    deleteHabit, 
    completeHabit, 
    uncompleteHabit 
} from '../controllers/habitController';

const router = Router();

router.get('/', getHabits);
router.post('/', createHabit);
router.delete('/:id', deleteHabit);

// Новые маршруты для чекинов
router.post('/:id/complete', completeHabit);
router.delete('/:id/complete', uncompleteHabit);

export default router;
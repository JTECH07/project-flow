import { Router } from 'express';
import {
  getProjectTasks,
  createTask,
  getTask,
  updateTask,
  moveTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/', getProjectTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.patch('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;

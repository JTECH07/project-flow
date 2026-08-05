import { Router } from 'express';
import {
  getProjects,
  getDashboardStats,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import taskRoutes from './task.routes';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/dashboard/stats', getDashboardStats);
router.post('/', createProject);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

// Nested: /api/projects/:projectId/tasks
router.use('/:projectId/tasks', taskRoutes);

export default router;

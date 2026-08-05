import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../services/notification.service';
import { getIO } from '../sockets';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

// Helper: vérifier si l'utilisateur est membre du projet
const checkProjectMember = async (projectId: string, userId: string) => {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
};

// GET /api/projects/:projectId/tasks
export const getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    const member = await checkProjectMember(projectId, req.user!.id);
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/projects/:projectId/tasks
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, assigneeId, dueDate } = createTaskSchema.parse(req.body);

    const member = await checkProjectMember(projectId, req.user!.id);
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    // Position: à la fin des tâches TODO
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: 'TODO' },
      orderBy: { position: 'desc' },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        assigneeId,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        projectId,
        creatorId: req.user!.id,
        position: (lastTask?.position ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });

    // Notifier l'assigné si différent du créateur
    if (assigneeId && assigneeId !== req.user!.id) {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
      await createNotification({
        userId: assigneeId,
        type: 'TASK_ASSIGNED',
        message: `Vous avez été assigné à la tâche "${title}" dans le projet "${project?.name}"`,
        link: `/projects/${projectId}`,
      });

      const io = getIO();
      io.to(`user:${assigneeId}`).emit('notification:new', {
        type: 'TASK_ASSIGNED',
        message: `Vous avez été assigné à la tâche "${title}"`,
      });
    }

    // Broadcast à la room du projet
    const io = getIO();
    io.to(`project:${projectId}`).emit('task:created', task);

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Données invalides', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/tasks/:id
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        comments: {
          include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
        project: { select: { id: true, name: true, color: true } },
      },
    });

    if (!task) {
      res.status(404).json({ message: 'Tâche non trouvée' });
      return;
    }

    const member = await checkProjectMember(task.projectId, req.user!.id);
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, dueDate } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      res.status(404).json({ message: 'Tâche non trouvée' });
      return;
    }

    const member = await checkProjectMember(existingTask.projectId, req.user!.id);
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });

    // Notifier si nouveau assigné
    if (assigneeId && assigneeId !== existingTask.assigneeId && assigneeId !== req.user!.id) {
      const project = await prisma.project.findUnique({ where: { id: existingTask.projectId }, select: { name: true } });
      await createNotification({
        userId: assigneeId,
        type: 'TASK_ASSIGNED',
        message: `Vous avez été assigné à la tâche "${task.title}" dans le projet "${project?.name}"`,
        link: `/projects/${existingTask.projectId}`,
      });
      const io = getIO();
      io.to(`user:${assigneeId}`).emit('notification:new', {
        type: 'TASK_ASSIGNED',
        message: `Vous avez été assigné à la tâche "${task.title}"`,
      });
    }

    const io = getIO();
    io.to(`project:${existingTask.projectId}`).emit('task:updated', task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PATCH /api/tasks/:id/move
export const moveTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      res.status(404).json({ message: 'Tâche non trouvée' });
      return;
    }

    const member = await checkProjectMember(existingTask.projectId, req.user!.id);
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(position !== undefined && { position }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true, email: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });

    const io = getIO();
    io.to(`project:${existingTask.projectId}`).emit('task:moved', task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ message: 'Tâche non trouvée' });
      return;
    }

    const member = await checkProjectMember(task.projectId, req.user!.id);
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    await prisma.task.delete({ where: { id } });

    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task:deleted', { id });

    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

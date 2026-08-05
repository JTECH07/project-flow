import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../services/notification.service';
import { getIO } from '../sockets';

// GET /api/tasks/:taskId/comments
export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      res.status(404).json({ message: 'Tâche non trouvée' });
      return;
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user!.id } },
    });
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/tasks/:taskId/comments
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      res.status(400).json({ message: 'Le contenu du commentaire est requis' });
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { name: true } } },
    });
    if (!task) {
      res.status(404).json({ message: 'Tâche non trouvée' });
      return;
    }

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user!.id } },
    });
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    const comment = await prisma.comment.create({
      data: { content: content.trim(), taskId, authorId: req.user!.id },
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    // Notifier l'assigné (si différent de l'auteur du commentaire)
    if (task.assigneeId && task.assigneeId !== req.user!.id) {
      await createNotification({
        userId: task.assigneeId,
        type: 'TASK_COMMENTED',
        message: `${req.user!.name} a commenté sur la tâche "${task.title}"`,
        link: `/projects/${task.projectId}`,
      });
      const io = getIO();
      io.to(`user:${task.assigneeId}`).emit('notification:new', {
        type: 'TASK_COMMENTED',
        message: `${req.user!.name} a commenté sur la tâche "${task.title}"`,
      });
    }

    // Broadcast à la room du projet
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('comment:added', { taskId, comment });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/comments/:id
export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ message: 'Commentaire non trouvé' });
      return;
    }

    if (comment.authorId !== req.user!.id) {
      res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres commentaires' });
      return;
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
      include: { author: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/comments/:id
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      res.status(404).json({ message: 'Commentaire non trouvé' });
      return;
    }

    if (comment.authorId !== req.user!.id) {
      res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres commentaires' });
      return;
    }

    await prisma.comment.delete({ where: { id } });
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

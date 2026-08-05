import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../services/notification.service';
import { getIO } from '../sockets';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/projects
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: { some: { userId: req.user!.id } },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/projects/dashboard/stats
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const projectsCount = await prisma.project.count({
      where: {
        members: { some: { userId } },
      },
    });

    const userMemberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    const projectIds = userMemberships.map((m) => m.projectId);

    const completedTasksCount = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
        status: 'DONE',
      },
    });

    const totalTasksCount = await prisma.task.count({
      where: {
        projectId: { in: projectIds },
      },
    });

    const assignedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
      },
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({
      projectsCount,
      completedTasksCount,
      totalTasksCount,
      assignedTasks,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// POST /api/projects
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color } = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        color: color || '#6366f1',
        members: {
          create: { userId: req.user!.id, role: 'OWNER' },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Données invalides', errors: error.errors });
      return;
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/projects/:id
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.user!.id } },
    });
    if (!member) {
      res.status(403).json({ message: 'Accès refusé' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true, email: true, avatar: true } },
            _count: { select: { comments: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Projet non trouvé' });
      return;
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/projects/:id
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, color, status } = req.body;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.user!.id } },
    });
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      res.status(403).json({ message: 'Permissions insuffisantes' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(status && { status }),
      },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/projects/:id
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.user!.id } },
    });
    if (!member || member.role !== 'OWNER') {
      res.status(403).json({ message: 'Seul le propriétaire peut supprimer le projet' });
      return;
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/projects/:id/members
export const addMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const adminMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.user!.id } },
    });
    if (!adminMember || !['OWNER', 'ADMIN'].includes(adminMember.role)) {
      res.status(403).json({ message: 'Permissions insuffisantes' });
      return;
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: userToAdd.id } },
    });
    if (existingMember) {
      res.status(409).json({ message: 'Cet utilisateur est déjà membre du projet' });
      return;
    }

    const newMember = await prisma.projectMember.create({
      data: { projectId: id, userId: userToAdd.id, role: role || 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    const project = await prisma.project.findUnique({ where: { id }, select: { name: true } });

    await createNotification({
      userId: userToAdd.id,
      type: 'PROJECT_INVITATION',
      message: `Vous avez été invité au projet "${project?.name}"`,
      link: `/projects/${id}`,
    });

    const io = getIO();
    // Notification toast au nouveau membre
    io.to(`user:${userToAdd.id}`).emit('notification:new', {
      type: 'PROJECT_INVITATION',
      message: `Vous avez été invité au projet "${project?.name}"`,
    });
    // Déclenche le rafraîchissement de la liste de projets en temps réel
    io.to(`user:${userToAdd.id}`).emit('project:member-added', {
      projectId: id,
      projectName: project?.name,
    });

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/projects/:id/members/:userId
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, userId } = req.params;

    const adminMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: id, userId: req.user!.id } },
    });
    if (!adminMember || !['OWNER', 'ADMIN'].includes(adminMember.role)) {
      if (req.user!.id !== userId) {
        res.status(403).json({ message: 'Permissions insuffisantes' });
        return;
      }
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: id, userId } },
    });

    res.json({ message: 'Membre retiré du projet' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

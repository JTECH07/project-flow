import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSockets = (socketServer: Server) => {
  io = socketServer;

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`🔌 Client connecté: ${socket.id} (User: ${userId})`);

    // Rejoindre la room personnelle de l'utilisateur (pour les notifications)
    socket.join(`user:${userId}`);

    // Rejoindre une room de projet
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
      console.log(`👥 User ${userId} a rejoint le projet: ${projectId}`);
    });

    // Quitter une room de projet
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      console.log(`👋 User ${userId} a quitté le projet: ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client déconnecté: ${socket.id}`);
    });
  });
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

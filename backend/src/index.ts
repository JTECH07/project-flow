import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import prisma from './config/database';
import { initSockets } from './sockets';

// Routes
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import commentRoutes from './routes/comment.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} non trouvée` });
});

// Initialize WebSockets
initSockets(io);

// Start server
const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, async () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('✅ Connecté à la base de données PostgreSQL');
  } catch (error) {
    console.error('❌ Erreur de connexion à la DB:', error);
    process.exit(1);
  }
});

export { app, io };
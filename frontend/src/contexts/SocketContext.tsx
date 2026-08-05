import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useQueryClient } from '@tanstack/react-query';
import { Notification } from '../types';
import toast from 'react-hot-toast';

interface SocketContextValue {
  socket: Socket | null;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  joinProject: () => {},
  leaveProject: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      setSocket(null);
      return;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connecté:', newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // Notification en temps réel
    newSocket.on('notification:new', (data: Partial<Notification>) => {
      addNotification(data as Notification);
      toast(data.message || 'Nouvelle notification', {
        icon: '🔔',
        style: { background: '#16161f', color: '#f0f0ff', border: '1px solid #2a2a3a' },
      });
    });

    // Quand on est ajouté à un projet → rafraîchir la liste des projets
    newSocket.on('project:member-added', (data: { projectId: string; projectName: string }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast(`🎉 Vous avez été ajouté au projet "${data.projectName}"`, {
        style: { background: '#16161f', color: '#f0f0ff', border: '1px solid #2a2a3a' },
      });
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token]);

  const joinProject = useCallback((projectId: string) => {
    socket?.emit('project:join', projectId);
  }, [socket]);

  const leaveProject = useCallback((projectId: string) => {
    socket?.emit('project:leave', projectId);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

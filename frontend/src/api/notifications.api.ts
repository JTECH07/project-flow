import api from './axios';
import { Notification } from '../types';

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications').then((r) => r.data),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.patch('/notifications/read-all').then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};

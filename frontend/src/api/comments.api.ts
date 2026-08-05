import api from './axios';
import { Comment } from '../types';

export const commentsApi = {
  getByTask: (taskId: string) =>
    api.get<Comment[]>(`/tasks/${taskId}/comments`).then((r) => r.data),

  create: (taskId: string, content: string) =>
    api.post<Comment>(`/tasks/${taskId}/comments`, { content }).then((r) => r.data),

  update: (commentId: string, content: string) =>
    api.put<Comment>(`/comments/${commentId}`, { content }).then((r) => r.data),

  delete: (commentId: string) =>
    api.delete(`/comments/${commentId}`).then((r) => r.data),
};

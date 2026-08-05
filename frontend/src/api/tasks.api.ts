import api from './axios';
import { Task, TaskStatus, Priority } from '../types';

export const tasksApi = {
  getByProject: (projectId: string) =>
    api.get<Task[]>(`/projects/${projectId}/tasks`).then((r) => r.data),

  getOne: (projectId: string, taskId: string) =>
    api.get<Task>(`/projects/${projectId}/tasks/${taskId}`).then((r) => r.data),

  create: (projectId: string, data: { title: string; description?: string; priority?: Priority; assigneeId?: string; dueDate?: string }) =>
    api.post<Task>(`/projects/${projectId}/tasks`, data).then((r) => r.data),

  update: (projectId: string, taskId: string, data: Partial<Task>) =>
    api.put<Task>(`/projects/${projectId}/tasks/${taskId}`, data).then((r) => r.data),

  move: (projectId: string, taskId: string, data: { status?: TaskStatus; position?: number }) =>
    api.patch<Task>(`/projects/${projectId}/tasks/${taskId}/move`, data).then((r) => r.data),

  delete: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`).then((r) => r.data),
};

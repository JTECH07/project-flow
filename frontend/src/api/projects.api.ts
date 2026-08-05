import api from './axios';
import { Project } from '../types';

export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects').then((r) => r.data),

  getStats: () => api.get<{
    projectsCount: number;
    completedTasksCount: number;
    totalTasksCount: number;
    assignedTasks: any[];
  }>('/projects/dashboard/stats').then((r) => r.data),

  getOne: (id: string) => api.get<Project>(`/projects/${id}`).then((r) => r.data),

  create: (data: { name: string; description?: string; color?: string }) =>
    api.post<Project>('/projects', data).then((r) => r.data),

  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/projects/${id}`).then((r) => r.data),

  addMember: (id: string, email: string, role?: string) =>
    api.post(`/projects/${id}/members`, { email, role }).then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data),
};

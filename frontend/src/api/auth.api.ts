import api from './axios';
import { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getMe: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (data: { name?: string; avatar?: string }) =>
    api.put<User>('/auth/me', data).then((r) => r.data),
};

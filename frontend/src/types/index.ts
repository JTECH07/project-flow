export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: 'ADMIN' | 'MEMBER';
}

export interface ProjectMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: User;
  userId: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number };
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  assigneeId?: string | null;
  creatorId: string;
  assignee?: User | null;
  creator?: User;
  project?: { id: string; name: string; color: string };
  comments?: Comment[];
  _count?: { comments: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  authorId: string;
  author: User;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMMENTED'
  | 'PROJECT_INVITATION'
  | 'TASK_DUE_SOON';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
  userId: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

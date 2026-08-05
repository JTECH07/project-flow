import React from 'react';
import { TaskStatus, Priority } from '../../types';

interface BadgeProps {
  type: 'status' | 'priority';
  value: TaskStatus | Priority;
}

const statusMap: Record<TaskStatus, { label: string; cls: string }> = {
  TODO: { label: 'À faire', cls: 'badge-todo' },
  IN_PROGRESS: { label: 'En cours', cls: 'badge-inprogress' },
  DONE: { label: 'Terminé', cls: 'badge-done' },
};

const priorityMap: Record<Priority, { label: string; cls: string }> = {
  LOW: { label: 'Faible', cls: 'badge-low' },
  MEDIUM: { label: 'Moyenne', cls: 'badge-medium' },
  HIGH: { label: 'Haute', cls: 'badge-high' },
  URGENT: { label: 'Urgente', cls: 'badge-urgent' },
};

const Badge: React.FC<BadgeProps> = ({ type, value }) => {
  const map = type === 'status' ? statusMap : priorityMap;
  const item = (map as any)[value] || { label: value, cls: 'badge-todo' };
  return <span className={`badge ${item.cls}`}>{item.label}</span>;
};

export default Badge;

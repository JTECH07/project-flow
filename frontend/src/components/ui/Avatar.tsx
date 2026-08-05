import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user?: User | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colors = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6',
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const bg = user?.name ? getColor(user.name) : '#6366f1';

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ background: `${bg}22`, color: bg, borderColor: `${bg}44` }}
      title={user?.name}
    >
      {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
    </div>
  );
};

export default Avatar;

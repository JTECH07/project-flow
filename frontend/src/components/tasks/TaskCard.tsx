import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MessageSquare } from 'lucide-react';
import { Task } from '../../types';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="task-card-meta mb-2">
        <Badge type="priority" value={task.priority} />
        {task.dueDate && (
          <div className={`text-xs flex-center gap-1 ${isOverdue ? 'text-accent' : 'text-muted'}`} style={{ color: isOverdue ? 'var(--danger)' : '' }}>
            <Clock size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
      
      <h4 className="task-card-title">{task.title}</h4>
      
      <div className="task-card-footer flex-between">
        <div className="flex-center gap-2 text-muted text-xs">
          {(task._count?.comments ?? 0) > 0 && (
            <span className="flex-center gap-1"><MessageSquare size={12}/> {task._count?.comments}</span>
          )}
        </div>
        <div className="avatar-stack">
          {task.assignee ? <Avatar user={task.assignee} size="sm" /> : <div className="avatar avatar-sm" title="Non assigné">?</div>}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

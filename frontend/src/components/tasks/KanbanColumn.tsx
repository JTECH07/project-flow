import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '../../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, title, tasks, onTaskClick }) => {
  const { setNodeRef } = useSortable({
    id: status,
    data: { type: 'Column', status },
  });

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="kanban-column-header">
        <div className="kanban-column-title">
          {title}
          <span className="kanban-column-count">{tasks.length}</span>
        </div>
      </div>

      <div className="kanban-cards">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export default KanbanColumn;

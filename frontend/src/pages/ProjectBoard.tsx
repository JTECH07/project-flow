import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Settings, Plus, Loader2, Users } from 'lucide-react';
import { projectsApi } from '../api/projects.api';
import { tasksApi } from '../api/tasks.api';
import { useSocket } from '../contexts/SocketContext';
import { Task, TaskStatus } from '../types';
import KanbanColumn from '../components/tasks/KanbanColumn';
import TaskCard from '../components/tasks/TaskCard';
import TaskModal from '../components/tasks/TaskModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

const ProjectBoard: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { joinProject, leaveProject, socket } = useSocket();
  const queryClient = useQueryClient();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch project
  const { data: project, isLoading: loadingProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getOne(projectId!),
    enabled: !!projectId,
  });

  // Fetch tasks
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => tasksApi.getByProject(projectId!),
    enabled: !!projectId,
  });

  // Sync local state when tasks update from server
  useEffect(() => { setLocalTasks(tasks); }, [tasks]);

  // Socket: rejoindre la room du projet
  useEffect(() => {
    if (projectId && socket) {
      joinProject(projectId);
    }
    return () => {
      if (projectId) leaveProject(projectId);
    };
  }, [projectId, socket]);

  // Socket: écouter les events temps réel
  useEffect(() => {
    if (!socket || !projectId) return;

    const onTaskCreated = (task: Task) => {
      setLocalTasks(prev => {
        if (prev.find(t => t.id === task.id)) return prev;
        return [...prev, task];
      });
    };

    const onTaskUpdated = (task: Task) => {
      setLocalTasks(prev => prev.map(t => t.id === task.id ? task : t));
    };

    const onTaskMoved = (task: Task) => {
      setLocalTasks(prev => {
        const filtered = prev.filter(t => t.id !== task.id);
        return [...filtered, task].sort((a, b) => a.position - b.position);
      });
    };

    const onTaskDeleted = ({ id }: { id: string }) => {
      setLocalTasks(prev => prev.filter(t => t.id !== id));
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:moved', onTaskMoved);
    socket.on('task:deleted', onTaskDeleted);

    return () => {
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:moved', onTaskMoved);
      socket.off('task:deleted', onTaskDeleted);
    };
  }, [socket, projectId]);

  const updateTaskMutation = useMutation({
    mutationFn: (variables: { taskId: string; data: { status?: TaskStatus; position?: number } }) =>
      tasksApi.move(projectId!, variables.taskId, variables.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }),
  });

  // Drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'TODO', title: t('tasks.statusTodo'), color: '#6366f1' },
    { id: 'IN_PROGRESS', title: t('tasks.statusInProgress'), color: '#f59e0b' },
    { id: 'DONE', title: t('tasks.statusDone'), color: '#10b981' },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    setLocalTasks((tasks) => {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      if (isOverTask) {
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          tasks[activeIndex] = { ...tasks[activeIndex], status: tasks[overIndex].status };
          return arrayMove(tasks, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      }

      if (isOverColumn) {
        tasks[activeIndex] = { ...tasks[activeIndex], status: overId as TaskStatus };
        return arrayMove(tasks, activeIndex, tasks.length - 1);
      }

      return tasks;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const activeIndex = localTasks.findIndex(t => t.id === activeId);

    if (activeIndex !== -1) {
      const task = localTasks[activeIndex];
      updateTaskMutation.mutate({
        taskId: task.id,
        data: { status: task.status, position: activeIndex },
      });
    }
  };

  if (loadingProject || loadingTasks) {
    return (
      <div className="loading-screen">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header du tableau */}
      <div className="flex-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: project?.color || '#6366f1',
                flexShrink: 0,
              }}
            />
            <h1 className="text-xl font-bold">{project?.name}</h1>
          </div>
          <p className="text-muted text-sm">{project?.description}</p>
          {project && (
            <div className="flex items-center gap-1 mt-1">
              <Users size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs text-muted">
                {project.members?.length || 0} membre(s)
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${projectId}/settings`}
            className="btn btn-ghost btn-icon"
            title="Paramètres du projet"
          >
            <Settings size={18} />
          </Link>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} />
            {t('tasks.create')}
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {columns.map(col => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              tasks={localTasks.filter(t => t.status === col.id).sort((a, b) => a.position - b.position)}
              onTaskClick={(t) => setSelectedTask(t)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} onClick={() => {}} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {project && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={projectId!}
          members={project.members || []}
        />
      )}

      <TaskModal
        task={selectedTask ? (localTasks.find(t => t.id === selectedTask.id) || selectedTask) : null}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        projectId={projectId!}
        members={project?.members || []}
      />
    </div>
  );
};

export default ProjectBoard;

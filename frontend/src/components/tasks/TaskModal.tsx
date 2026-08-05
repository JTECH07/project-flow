import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, MessageSquare, Tag, User, AlignLeft, X, Edit2, Trash2, Save, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, Comment, ProjectMember } from '../../types';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { tasksApi } from '../../api/tasks.api';
import { commentsApi } from '../../api/comments.api';
import { useSocket } from '../../contexts/SocketContext';
import toast from 'react-hot-toast';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, projectId, members }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');

  // Editable fields local states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Sync edit state with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority as any);
      setAssigneeId(task.assigneeId || '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    }
  }, [task, isOpen]);

  // Fetch comments
  const { data: comments = [], isLoading: loadingComments } = useQuery({
    queryKey: ['comments', task?.id],
    queryFn: () => commentsApi.getByTask(task!.id),
    enabled: !!task?.id && isOpen,
  });

  // Listen to comment:added socket event
  useEffect(() => {
    if (!socket || !task?.id || !isOpen) return;

    const onCommentAdded = (data: { taskId: string; comment: Comment }) => {
      if (data.taskId === task.id) {
        queryClient.invalidateQueries({ queryKey: ['comments', task.id] });
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }
    };

    socket.on('comment:added', onCommentAdded);

    return () => {
      socket.off('comment:added', onCommentAdded);
    };
  }, [socket, task?.id, isOpen, queryClient, projectId]);

  // Mutations
  const commentMutation = useMutation({
    mutationFn: () => commentsApi.create(task!.id, newComment),
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', task?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
    onError: () => toast.error('Erreur lors de l\'ajout du commentaire'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Task>) => tasksApi.update(projectId, task!.id, data),
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Tâche mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(projectId, task!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Tâche supprimée');
      onClose();
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  if (!task) return null;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    updateMutation.mutate({
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} wide>
      <div className="flex-between mb-6">
        <div className="flex gap-2">
          <Badge type="status" value={task.status} />
          {!isEditing ? (
            <Badge type="priority" value={task.priority} />
          ) : (
            <select
              className="input text-xs"
              style={{ padding: '2px 8px', height: 'auto', minHeight: 'auto', width: 'auto' }}
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
            >
              <option value="LOW">{t('tasks.priorityLow')}</option>
              <option value="MEDIUM">{t('tasks.priorityMedium')}</option>
              <option value="HIGH">{t('tasks.priorityHigh')}</option>
              <option value="URGENT">{t('tasks.priorityUrgent')}</option>
            </select>
          )}
        </div>
        <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={20}/></button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
        {/* Left side: Content */}
        <div>
          {isEditing ? (
            <div className="mb-6">
              <label className="input-label text-xs">{t('tasks.title')}</label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
              />
            </div>
          ) : (
            <h2 className="text-xl font-bold mb-6">{task.title}</h2>
          )}
          
          <div className="mb-8">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><AlignLeft size={16}/> {t('tasks.description')}</h3>
            {isEditing ? (
              <textarea
                className="input textarea"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{ minHeight: '120px' }}
              />
            ) : (
              <div className="text-muted text-sm bg-secondary p-4 rounded-md" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                {task.description || 'Aucune description fournie.'}
              </div>
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-2 mb-8">
              <button className="btn btn-primary" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save size={16} /> Enregistrer
              </button>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                <XCircle size={16} /> Annuler
              </button>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h3 className="font-semibold flex items-center gap-2 mb-4"><MessageSquare size={16}/> {t('comments.title')}</h3>
            
            <div className="mb-6">
              <div className="flex gap-3">
                <textarea 
                  className="input textarea" 
                  placeholder={t('comments.placeholder')}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  style={{ minHeight: '60px' }}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button 
                  className="btn btn-primary btn-sm"
                  disabled={!newComment.trim() || commentMutation.isPending}
                  onClick={() => commentMutation.mutate()}
                >
                  {t('comments.add')}
                </button>
              </div>
            </div>

            {loadingComments ? (
              <div className="text-muted text-sm text-center py-4">{t('common.loading')}</div>
            ) : comments.length === 0 ? (
              <div className="text-muted text-sm text-center py-4">{t('comments.noComments')}</div>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map((comment: Comment) => (
                  <div key={comment.id} className="comment-item">
                    <Avatar user={comment.author} size="sm" />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author.name}</span>
                        <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="comment-content">{comment.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side: Sidebar info */}
        <div className="flex flex-col gap-6" style={{ paddingLeft: '20px', borderLeft: '1px solid var(--border)' }}>
          {/* Assignee */}
          <div>
            <div className="text-xs font-semibold text-muted mb-2 flex items-center gap-2"><User size={14}/> {t('tasks.assignee')}</div>
            {isEditing ? (
              <select className="input text-sm" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">-- {t('tasks.noAssignee')} --</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <><Avatar user={task.assignee} size="sm" /> <span>{task.assignee.name}</span></>
                ) : (
                  <span className="text-muted text-sm">{t('tasks.noAssignee')}</span>
                )}
              </div>
            )}
          </div>

          {/* Creator */}
          <div>
            <div className="text-xs font-semibold text-muted mb-2 flex items-center gap-2"><Tag size={14}/> {t('tasks.createdBy')}</div>
            <div className="flex items-center gap-2">
              <Avatar user={task.creator} size="sm" /> <span className="text-sm">{task.creator?.name}</span>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <div className="text-xs font-semibold text-muted mb-2 flex items-center gap-2"><Clock size={14}/> {t('tasks.dueDate')}</div>
            {isEditing ? (
              <input
                type="date"
                className="input text-sm"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            ) : task.dueDate ? (
              <div className={`text-sm ${isOverdue ? 'font-bold' : ''}`} style={{ color: isOverdue ? 'var(--danger)' : '' }}>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && <span className="text-xs ml-2">(En retard)</span>}
              </div>
            ) : (
              <span className="text-muted text-sm">Aucune date</span>
            )}
          </div>

          <div className="divider" style={{ height: '1px', background: 'var(--border)', margin: '10px 0' }}></div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex flex-col gap-2">
              <button className="btn btn-secondary flex items-center justify-center gap-2" onClick={() => setIsEditing(true)}>
                <Edit2 size={14} /> Modifier la tâche
              </button>
              <button
                className="btn btn-danger flex items-center justify-center gap-2"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={14} /> Supprimer la tâche
              </button>
            </div>
          )}

          <div className="text-xs text-muted">
            {t('tasks.createdAt')} : {new Date(task.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;

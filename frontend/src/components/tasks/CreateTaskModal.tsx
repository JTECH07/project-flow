import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../api/tasks.api';
import Modal from '../ui/Modal';
import { ProjectMember } from '../../types';
import toast from 'react-hot-toast';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, projectId, members }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW'|'MEDIUM'|'HIGH'|'URGENT'>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  const createMutation = useMutation({
    mutationFn: () => tasksApi.create(projectId, { 
      title, 
      description, 
      priority, 
      assigneeId: assigneeId || undefined, 
      dueDate: dueDate || undefined 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Tâche créée');
      resetAndClose();
    },
    onError: () => toast.error('Erreur lors de la création de la tâche')
  });

  const resetAndClose = () => {
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setAssigneeId('');
    setDueDate('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={resetAndClose} 
      title={t('tasks.create')}
      footer={
        <>
          <button className="btn btn-ghost" onClick={resetAndClose}>{t('common.cancel')}</button>
          <button 
            className="btn btn-primary" 
            onClick={() => createMutation.mutate()}
            disabled={!title.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? t('common.loading') : t('common.create')}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="input-group">
          <label className="input-label">{t('tasks.title')} *</label>
          <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        </div>
        
        <div className="input-group">
          <label className="input-label">{t('tasks.description')}</label>
          <textarea className="input textarea" value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="flex gap-4">
          <div className="input-group flex-1">
            <label className="input-label">{t('tasks.priority')}</label>
            <select className="input" value={priority} onChange={e => setPriority(e.target.value as any)}>
              <option value="LOW">{t('tasks.priorityLow')}</option>
              <option value="MEDIUM">{t('tasks.priorityMedium')}</option>
              <option value="HIGH">{t('tasks.priorityHigh')}</option>
              <option value="URGENT">{t('tasks.priorityUrgent')}</option>
            </select>
          </div>
          
          <div className="input-group flex-1">
            <label className="input-label">{t('tasks.dueDate')}</label>
            <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">{t('tasks.assignee')}</label>
          <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
            <option value="">-- {t('tasks.noAssignee')} --</option>
            {members.map(m => (
              <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTaskModal;

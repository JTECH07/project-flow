import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderKanban, Users } from 'lucide-react';
import { projectsApi } from '../api/projects.api';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const ProjectList: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      toast.success('Projet créé');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  if (isLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="flex-between mb-6">
        <h1 className="text-xl font-bold">{t('projects.title')}</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> {t('projects.create')}
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card">
          <FolderKanban className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h3 className="empty-state-title">{t('projects.noProjects')}</h3>
          <p className="empty-state-desc">{t('projects.noProjectsDesc')}</p>
          <button className="btn btn-primary mx-auto mt-2" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> {t('projects.create')}
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card" style={{ '--project-color': project.color } as any}>
              <h3 className="project-card-name">{project.name}</h3>
              <p className="project-card-desc">{project.description || 'Aucune description'}</p>
              <div className="project-card-footer mt-4 text-muted text-xs flex gap-4">
                <span className="flex-center gap-2"><FolderKanban size={14}/> {project._count?.tasks || 0} {t('projects.tasks')}</span>
                <span className="flex-center gap-2"><Users size={14}/> {project.members?.length || 1} membres</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('projects.create')}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</button>
            <button 
              className="btn btn-primary" 
              onClick={() => createMutation.mutate({ name, description, color })}
              disabled={!name || createMutation.isPending}
            >
              {createMutation.isPending ? t('common.loading') : t('common.create')}
            </button>
          </>
        }
      >
        <div className="input-group mb-4">
          <label className="input-label">{t('projects.name')}</label>
          <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className="input-group mb-4">
          <label className="input-label">{t('projects.description')}</label>
          <textarea className="input textarea" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="input-label">{t('projects.color')}</label>
          <div className="flex gap-2">
            {['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'].map(c => (
              <button 
                key={c} 
                className="btn-icon" 
                style={{ background: c, width: '32px', height: '32px', border: color === c ? '2px solid white' : 'none' }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;

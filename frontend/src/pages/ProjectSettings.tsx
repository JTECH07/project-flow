import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserPlus, ShieldAlert, Save } from 'lucide-react';
import { projectsApi } from '../api/projects.api';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const ProjectSettings: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.user);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getOne(projectId!),
    enabled: !!projectId,
  });

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#6366f1');
    }
  }, [project]);

  const addMemberMutation = useMutation({
    mutationFn: () => projectsApi.addMember(projectId!, email),
    onSuccess: () => {
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Membre ajouté');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('Membre retiré');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; color?: string }) =>
      projectsApi.update(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => projectsApi.delete(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projet supprimé');
      navigate('/projects');
    },
    onError: () => toast.error('Erreur lors de la suppression du projet'),
  });

  if (isLoading || !project) return <div className="loading-screen"><div className="spinner"></div></div>;

  const currentUserRole = project.members.find(m => m.userId === currentUser?.id)?.role;
  const isAdmin = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-2">{t('projects.settings')} - {project.name}</h1>
        <p className="text-muted text-sm">{project.description}</p>
      </div>

      {/* General Settings */}
      {isAdmin && (
        <div className="card mb-8">
          <h2 className="font-bold mb-4">Paramètres généraux</h2>
          
          <div className="input-group mb-4">
            <label className="input-label">{t('projects.name')}</label>
            <input 
              type="text" 
              className="input" 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <div className="input-group mb-4">
            <label className="input-label">{t('projects.description')}</label>
            <textarea 
              className="input textarea" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>

          <div className="input-group mb-6">
            <label className="input-label">{t('projects.color')}</label>
            <div className="flex gap-2">
              {['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'].map(c => (
                <button 
                  key={c} 
                  type="button"
                  className="btn-icon" 
                  style={{ 
                    background: c, 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    border: color === c ? '2px solid white' : 'none',
                    boxShadow: color === c ? '0 0 8px rgba(255,255,255,0.5)' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button 
            className="btn btn-primary"
            onClick={() => updateProjectMutation.mutate({ name, description, color })}
            disabled={!name.trim() || updateProjectMutation.isPending}
          >
            <Save size={18} /> {t('common.save')}
          </button>
        </div>
      )}

      {/* Members Section */}
      <div className="card mb-8">
        <h2 className="font-bold mb-4">{t('projects.members')}</h2>
        
        {isAdmin && (
          <div className="flex gap-2 mb-6">
            <input 
              type="email" 
              className="input flex-1" 
              placeholder={t('projects.memberEmail')} 
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              disabled={!email || addMemberMutation.isPending}
              onClick={() => addMemberMutation.mutate()}
            >
              <UserPlus size={18} /> {t('projects.addMember')}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {project.members.map(member => (
            <div key={member.id} className="flex-between p-3" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex items-center gap-3">
                <Avatar user={member.user} />
                <div>
                  <div className="font-medium text-sm">{member.user.name} {member.userId === currentUser?.id && '(Vous)'}</div>
                  <div className="text-xs text-muted">{member.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="badge badge-todo">{member.role}</span>
                {isAdmin && member.role !== 'OWNER' && (
                  <button 
                    className="btn btn-ghost btn-icon" 
                    onClick={() => removeMemberMutation.mutate(member.userId)}
                    style={{ color: 'var(--danger)' }}
                    title={t('projects.removeMember')}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      {currentUserRole === 'OWNER' && (
        <div className="card" style={{ borderColor: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h2 className="font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--danger)' }}>
            <ShieldAlert size={20} /> Zone de danger
          </h2>
          <p className="text-sm text-muted mb-4">{t('projects.deleteConfirm')}</p>
          <button 
            className="btn btn-danger" 
            onClick={() => {
              if (window.confirm(t('projects.deleteConfirm'))) deleteProjectMutation.mutate();
            }}
          >
            {t('projects.deleteProject')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectSettings;

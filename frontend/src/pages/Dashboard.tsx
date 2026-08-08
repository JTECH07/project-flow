import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FolderKanban, CheckCircle2, Clock, Users, Calendar, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { projectsApi } from '../api/projects.api';
import Badge from '../components/ui/Badge';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: projectsApi.getStats,
  });

  if (loadingProjects || loadingStats) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  const assignedTasks = stats?.assignedTasks || [];

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">{t('dashboard.welcome')}, {user?.name} 👋</h1>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-6" style={{ gap: '14px' }}>
        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-icon" style={{ width: 42, height: 42, background: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>
            <FolderKanban size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '22px' }}>{stats?.projectsCount ?? 0}</div>
            <div className="stat-label" style={{ fontSize: '12px' }}>{t('dashboard.totalProjects')}</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-icon" style={{ width: 42, height: 42, background: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '22px' }}>{stats?.completedTasksCount ?? 0}</div>
            <div className="stat-label" style={{ fontSize: '12px' }}>{t('dashboard.completedTasks')}</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '14px 18px' }}>
          <div className="stat-icon" style={{ width: 42, height: 42, background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '22px' }}>{stats?.totalTasksCount ?? 0}</div>
            <div className="stat-label" style={{ fontSize: '12px' }}>{t('dashboard.totalTasks')}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Left Side: Recent Projects */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="flex-between mb-4">
            <h2 className="font-bold text-base">{t('dashboard.recentProjects')}</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">{t('common.search')}</Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty-state">
              <FolderKanban className="empty-state-icon" style={{ margin: '0 auto' }} />
              <h3 className="empty-state-title">{t('dashboard.noProjects')}</h3>
              <p className="empty-state-desc">{t('dashboard.noProjectsDesc')}</p>
              <Link to="/projects" className="btn btn-primary mt-2">{t('dashboard.createFirstProject')}</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {projects.slice(0, 3).map((project) => (
                <Link
                  to={`/projects/${project.id}`}
                  key={project.id}
                  className="project-card"
                  style={{
                    '--project-color': project.color,
                    padding: '1rem',
                    textDecoration: 'none',
                    display: 'block'
                  } as any}
                >
                  <h3 className="project-card-name" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{project.name}</h3>
                  <p className="project-card-desc" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    {project.description || 'Aucune description'}
                  </p>
                  <div className="project-card-footer mt-3 text-muted text-xs flex gap-3">
                    <span className="flex-center gap-1"><FolderKanban size={14}/> {project._count?.tasks || 0}</span>
                    <span className="flex-center gap-1"><Users size={14}/> {project.members?.length || 1}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: My Tasks */}
        <div className="card" style={{ height: 'fit-content', maxHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          <h2 className="font-bold text-base mb-4">{t('dashboard.myTasks')} ({assignedTasks.length})</h2>

          {assignedTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <CheckCircle2 className="empty-state-icon" style={{ margin: '0 auto', color: 'var(--success)' }} />
              <h3 className="empty-state-title">Aucune tâche en cours</h3>
              <p className="empty-state-desc">Toutes vos tâches assignées sont terminées. Bon travail !</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
              {assignedTasks.map((task: any) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <Link
                    to={`/projects/${task.projectId}`}
                    key={task.id}
                    className="card"
                    style={{
                      padding: '0.875rem',
                      textDecoration: 'none',
                      display: 'block',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                  >
                    <div className="flex-between mb-2">
                      <span
                        className="text-xs font-semibold flex items-center gap-1.5"
                        style={{ color: task.project?.color || 'var(--text-muted)' }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: task.project?.color || 'var(--text-muted)'
                          }}
                        />
                        {task.project?.name}
                      </span>
                      <Badge type="priority" value={task.priority} />
                    </div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                      <span className="flex-center gap-1">
                        <Badge type="status" value={task.status} />
                      </span>
                      {task.dueDate && (
                        <span
                          className="flex items-center gap-1"
                          style={{ color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? '600' : 'normal' }}
                        >
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue && ' (En retard)'}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

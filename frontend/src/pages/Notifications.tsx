import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, FolderKanban, UserPlus, ClipboardList, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../api/notifications.api';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationType } from '../types';
import toast from 'react-hot-toast';

const notifIcon = (type: NotificationType) => {
  switch (type) {
    case 'PROJECT_INVITATION': return <UserPlus size={18} />;
    case 'TASK_ASSIGNED': return <ClipboardList size={18} />;
    case 'TASK_COMMENTED': return <MessageSquare size={18} />;
    default: return <Bell size={18} />;
  }
};

const notifColor = (type: NotificationType) => {
  switch (type) {
    case 'PROJECT_INVITATION': return 'var(--accent)';
    case 'TASK_ASSIGNED': return 'var(--warning)';
    case 'TASK_COMMENTED': return 'var(--success)';
    default: return 'var(--text-muted)';
  }
};

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { setNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
  });

  useEffect(() => {
    if (notifications.length > 0) {
      setNotifications(notifications);
    }
  }, [notifications]);

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
  });

  const unread = notifications.filter(n => !n.read);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{t('nav.notifications')}</h1>
          <p className="text-muted text-sm">
            {unread.length > 0 ? `${unread.length} non lue(s)` : 'Tout est à jour !'}
          </p>
        </div>
        {unread.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCheck size={16} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card empty-state">
          <Bell className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h3 className="empty-state-title">Aucune notification</h3>
          <p className="empty-state-desc">Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="card"
              style={{
                borderLeft: `3px solid ${notifColor(notif.type)}`,
                opacity: notif.read ? 0.6 : 1,
                transition: 'all 0.2s ease',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `${notifColor(notif.type)}22`,
                  color: notifColor(notif.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {notifIcon(notif.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-sm" style={{ marginBottom: '0.25rem', fontWeight: notif.read ? 400 : 600 }}>
                  {notif.message}
                </p>
                <p className="text-xs text-muted">
                  {new Date(notif.createdAt).toLocaleString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {notif.link && (
                  <Link
                    to={notif.link}
                    className="text-xs"
                    style={{ color: 'var(--accent)', marginTop: '0.25rem', display: 'inline-block' }}
                  >
                    Voir le projet →
                  </Link>
                )}
              </div>
              {!notif.read && (
                <button
                  className="btn btn-ghost btn-icon"
                  title="Marquer comme lu"
                  onClick={() => markReadMutation.mutate(notif.id)}
                  style={{ flexShrink: 0 }}
                >
                  <CheckCheck size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

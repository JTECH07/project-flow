import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '../../api/notifications.api';
import { useNotificationStore } from '../../store/notificationStore';

const Layout: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { setNotifications } = useNotificationStore();

  // Globally fetch initial notifications to sync the header count immediately
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (notifications.length > 0) {
      setNotifications(notifications);
    }
  }, [notifications, setNotifications]);

  const getPageTitle = () => {
    if (location.pathname === '/') return t('nav.dashboard');
    if (location.pathname.startsWith('/projects')) return t('nav.projects');
    if (location.pathname.startsWith('/notifications')) return t('nav.notifications');
    return '';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <Header title={getPageTitle()} />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

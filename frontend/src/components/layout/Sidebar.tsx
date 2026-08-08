import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FolderKanban, Bell, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FolderKanban color="white" size={20} />
          </div>
          <div className="sidebar-logo-text">ProjectFlow</div>
        </div>

        <div className="sidebar-section mt-4">
          <div className="sidebar-section-title">Menu principal</div>
          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            {t('nav.dashboard')}
          </NavLink>
          <NavLink
            to="/projects"
            onClick={onClose}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <FolderKanban size={18} />
            {t('nav.projects')}
          </NavLink>
          <NavLink
            to="/notifications"
            onClick={onClose}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <Bell size={18} />
            {t('nav.notifications')}
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  background: 'var(--danger)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {unreadCount}
              </span>
            )}
          </NavLink>
        </div>

        <div className="sidebar-bottom">
          <button onClick={handleLogout} className="sidebar-item" style={{ color: 'var(--text-muted)' }}>
            <LogOut size={18} />
            {t('auth.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

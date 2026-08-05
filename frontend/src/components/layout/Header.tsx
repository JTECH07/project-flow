import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Globe, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import { useNotificationStore } from '../../store/notificationStore';

const Header: React.FC<{ title: string }> = ({ title }) => {
  const { user, logout } = useAuthStore();
  const { i18n } = useTranslation();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('fr') ? 'en' : 'fr');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-title">{title}</div>
      <div className="header-actions">
        {/* Changement de langue */}
        <button className="btn btn-ghost btn-icon" onClick={toggleLanguage} title="Changer de langue">
          <Globe size={18} />
          <span className="text-xs font-bold" style={{ textTransform: 'uppercase' }}>
            {i18n.language.substring(0, 2)}
          </span>
        </button>

        {/* Cloche notifications */}
        <div className="notif-bell">
          <Link to="/notifications" className="btn btn-ghost btn-icon" title="Notifications">
            <Bell size={18} />
            {unreadCount > 0 && <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>}
          </Link>
        </div>

        {/* User info + logout */}
        <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span className="text-sm font-bold">{user?.name}</span>
            <span className="text-xs text-muted">{user?.email}</span>
          </div>
          <Avatar user={user} size="md" />
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title="Se déconnecter"
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Globe, LogOut, Menu, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import { useNotificationStore } from '../../store/notificationStore';

interface HeaderProps {
  title: string;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
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
      <div className="header-left">
        {onToggleSidebar && (
          <button
            className="btn btn-ghost btn-icon mobile-menu-btn"
            onClick={onToggleSidebar}
            title="Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>
        )}
        <div className="header-title">{title}</div>
      </div>

      <div className="header-actions">
        {/* Link to Landing showcase page */}
        <Link
          to="/landing"
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '13px' }}
          title={t('dashboard.discoverLanding')}
        >
          <Sparkles size={16} />
          <span className="hidden-mobile">{t('nav.landing')}</span>
        </Link>

        {/* Changement de langue */}
        <button className="btn btn-ghost btn-icon" onClick={toggleLanguage} title="Switch language / Changer de langue">
          <Globe size={18} />
          <span className="text-xs font-bold" style={{ textTransform: 'uppercase' }}>
            {i18n.language.substring(0, 2)}
          </span>
        </button>

        {/* Cloche notifications */}
        <div className="notif-bell">
          <Link to="/notifications" className="btn btn-ghost btn-icon" title={t('nav.notifications')}>
            <Bell size={18} />
            {unreadCount > 0 && <div className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</div>}
          </Link>
        </div>

        {/* User info + logout */}
        <div className="header-user-container">
          <Link to="/profile" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'inherit' }} title={t('nav.profile')}>
            <div className="header-user-info">
              <span className="text-sm font-bold truncate">{user?.name}</span>
              <span className="text-xs text-muted truncate header-user-email">{user?.email}</span>
            </div>
            <Avatar user={user} size="md" />
          </Link>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title={t('auth.logout')}
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

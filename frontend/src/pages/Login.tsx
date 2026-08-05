import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderKanban, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isRegistering) {
        if (!name.trim()) {
          toast.error('Le nom est requis');
          return;
        }
        const data = await authApi.register({ name, email, password });
        setAuth(data.user, data.token);
        toast.success(t('auth.registerTitle'));
        navigate('/');
      } else {
        try {
          const data = await authApi.login({ email, password });
          setAuth(data.user, data.token);
          toast.success(t('auth.loginTitle'));
          navigate('/');
        } catch (err: any) {
          // Automatic demo account creation if login fails for demo@example.com
          if (err.response?.status === 401 && email === 'demo@example.com') {
            const data = await authApi.register({ name: 'Utilisateur Démo', email, password });
            setAuth(data.user, data.token);
            toast.success(t('auth.loginTitle'));
            navigate('/');
          } else {
            toast.error(err.response?.data?.message || t('common.error'));
          }
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <FolderKanban color="white" size={32} />
          </div>
          <h1 className="auth-title">
            {isRegistering ? t('auth.registerTitle') : t('auth.loginTitle')}
          </h1>
          <p className="auth-subtitle">
            {isRegistering ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label className="input-label">{t('auth.name')}</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.namePlaceholder')}
                required
              />
            </div>
          )}
          
          <div className="input-group">
            <label className="input-label">{t('auth.email')}</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">{t('auth.password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : isRegistering ? (
              t('auth.register')
            ) : (
              t('auth.login')
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.875rem' }}>
          <span className="text-muted">
            {isRegistering ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
          </span>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '0 4px', display: 'inline', height: 'auto', minHeight: 'auto', color: 'var(--accent)', fontWeight: 'bold' }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              // Clean form values
              setName('');
              if (email === 'demo@example.com' && !isRegistering) {
                setEmail('');
                setPassword('');
              } else if (email === '' && isRegistering) {
                setEmail('demo@example.com');
                setPassword('password123');
              }
            }}
          >
            {isRegistering ? t('auth.loginLink') : t('auth.registerLink')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

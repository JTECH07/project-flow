import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderKanban, Loader2 } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('mode') === 'register') {
      setIsRegistering(true);
    }
  }, [searchParams]);

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
        const data = await authApi.login({ email, password });
        setAuth(data.user, data.token);
        toast.success(t('auth.loginTitle'));
        navigate('/');
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
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', marginBottom: '1.25rem' }} 
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
              setName('');
              setEmail('');
              setPassword('');
            }}
          >
            {isRegistering ? t('auth.loginLink') : t('auth.registerLink')}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
          <Link to="/landing" className="text-muted hover:text-primary transition" style={{ textDecoration: 'underline' }}>
            ← Découvrir les fonctionnalités de ProjectFlow
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

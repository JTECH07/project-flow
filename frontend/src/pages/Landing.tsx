import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderKanban, Zap, Users, Bell, Globe, ArrowRight,
  ShieldCheck, Layout, Sparkles, CheckCircle2, Clock, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const STATS = [
  { value: '500+', label: 'Utilisateurs actifs', icon: Users, color: 'var(--accent)' },
  { value: '1 200+', label: 'Projets créés', icon: FolderKanban, color: 'var(--success)' },
  { value: '8 400+', label: 'Tâches complétées', icon: CheckCircle2, color: 'var(--warning)' },
  { value: '< 50ms', label: 'Latence temps réel', icon: Zap, color: '#a855f7' },
];

const Landing: React.FC = () => {
  const { token } = useAuthStore();
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('fr') ? 'en' : 'fr');
  };

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── Navigation ── */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)', background: 'rgba(10,10,15,0.88)',
        position: 'sticky', top: 0, zIndex: 100, gap: '12px', flexWrap: 'wrap',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sidebar-logo-icon"><FolderKanban color="white" size={20} /></div>
          <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.4px' }}>ProjectFlow</span>
        </div>

        {/* Nav actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            title="Changer de langue"
          >
            <Globe size={15} />
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              {i18n.language.substring(0, 2)}
            </span>
          </button>

          {token ? (
            <Link to="/" className="btn btn-primary btn-sm">
              Mon espace <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-primary)' }}>
                Se connecter
              </Link>
              <Link to="/login?mode=register" className="btn btn-primary btn-sm">
                S'inscrire <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '72px 20px 56px', textAlign: 'center', maxWidth: '960px', margin: '0 auto', position: 'relative' }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '80%', maxWidth: '480px', height: '280px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.17) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-inprogress" style={{
            padding: '6px 14px', fontSize: '12px', borderRadius: '99px',
            border: '1px solid rgba(99,102,241,0.4)', display: 'inline-flex', alignItems: 'center',
            gap: '6px', marginBottom: '24px',
          }}>
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            Plateforme Collaborative Nouvelle Génération
          </div>

          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 50px)', fontWeight: 900, lineHeight: 1.12,
            letterSpacing: '-1px', marginBottom: '20px',
            background: 'linear-gradient(135deg,#ffffff 40%,#a5b4fc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Pilotez vos projets en équipe,<br />en temps réel et sans friction.
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 36px', lineHeight: 1.65 }}>
            Tableau Kanban interactif, collaboration WebSocket instantanée,
            gestion des rôles et notifications en temps réel — tout ce dont votre équipe a besoin.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login?mode=register" className="btn btn-primary" style={{ padding: '11px 24px', fontSize: '15px' }}>
              Démarrer gratuitement <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: '11px 24px', fontSize: '15px' }}>
              Voir les fonctionnalités
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ maxWidth: '960px', margin: '0 auto 72px', padding: '0 20px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
          gap: '16px',
        }}>
          {STATS.map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '20px 14px', background: 'var(--bg-secondary)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '10px', margin: '0 auto 10px',
                background: `rgba(${color === 'var(--accent)' ? '99,102,241' : color === 'var(--success)' ? '34,197,94' : color === 'var(--warning)' ? '245,158,11' : '168,85,247'},0.15)`,
                color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Kanban preview ── */}
      <section style={{ maxWidth: '920px', margin: '0 auto 80px', padding: '0 16px' }}>
        <div className="card" style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)', padding: '18px', borderRadius: 'var(--radius-xl)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e' }} />
              <span className="text-xs text-muted" style={{ marginLeft: '6px' }}>Tableau Kanban — ProjectFlow</span>
            </div>
            <span className="badge badge-done" style={{ fontSize: '11px' }}>⚡ WebSocket actif</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {/* To Do column */}
            <div className="card" style={{ background: 'var(--bg-card)', padding: '12px' }}>
              <div className="flex-between mb-2">
                <span className="font-bold text-xs">📌 À faire</span>
                <span className="badge badge-todo" style={{ fontSize: '10px' }}>2</span>
              </div>
              <div className="card mb-2" style={{ padding: '9px 11px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--accent)' }}>
                <span className="text-xs font-bold text-accent">#01 Refonte UI</span>
                <p className="text-xs text-muted" style={{ marginTop: '3px' }}>Composants responsive</p>
              </div>
              <div className="card" style={{ padding: '9px 11px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--border-light)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>#04 Tests E2E</span>
                <p className="text-xs text-muted" style={{ marginTop: '3px' }}>Cypress · Vitest</p>
              </div>
            </div>

            {/* In Progress column */}
            <div className="card" style={{ background: 'var(--bg-card)', padding: '12px' }}>
              <div className="flex-between mb-2">
                <span className="font-bold text-xs">🔥 En cours</span>
                <span className="badge badge-inprogress" style={{ fontSize: '10px' }}>1</span>
              </div>
              <div className="card" style={{ padding: '9px 11px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--warning)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--warning)' }}>#02 PostgreSQL Sync</span>
                <p className="text-xs text-muted" style={{ marginTop: '3px' }}>Migration cloud Railway</p>
              </div>
            </div>

            {/* Done column */}
            <div className="card" style={{ background: 'var(--bg-card)', padding: '12px' }}>
              <div className="flex-between mb-2">
                <span className="font-bold text-xs">✅ Terminé</span>
                <span className="badge badge-done" style={{ fontSize: '10px' }}>3</span>
              </div>
              <div className="card mb-2" style={{ padding: '9px 11px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--success)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>#03 Auth JWT</span>
                <p className="text-xs text-muted" style={{ marginTop: '3px' }}>Endpoints sécurisés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" style={{ maxWidth: '960px', margin: '0 auto 90px', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Tout ce dont votre équipe a besoin</h2>
          <p className="text-muted" style={{ fontSize: '14px' }}>Des fonctionnalités pensées pour la productivité et la clarté.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '18px' }}>
          {[
            { icon: Layout, color: 'var(--accent)', bg: 'rgba(99,102,241,0.12)', title: 'Tableau Kanban', desc: 'Glissez-déposez vos tâches entre colonnes et suivez vos sprints en temps réel.' },
            { icon: Zap, color: 'var(--success)', bg: 'rgba(34,197,94,0.12)', title: 'WebSockets Instantanés', desc: 'Chaque modification s\'affiche immédiatement chez tous vos coéquipiers sans rechargement.' },
            { icon: Users, color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)', title: 'Gestion des Membres', desc: 'Invitez des collaborateurs par email et assignez-leur des tâches spécifiques.' },
            { icon: Bell, color: 'var(--danger)', bg: 'rgba(239,68,68,0.12)', title: 'Notifications Temps Réel', desc: 'Alertes instantanées pour assignations, commentaires et mises à jour de tâches.' },
            { icon: MessageSquare, color: 'var(--info)', bg: 'rgba(59,130,246,0.12)', title: 'Commentaires Intégrés', desc: 'Discussions directement sur chaque tâche pour garder le contexte au bon endroit.' },
            { icon: Globe, color: 'var(--info)', bg: 'rgba(59,130,246,0.12)', title: 'Interface Bilingue', desc: 'Basculez entre Français et Anglais en un clic pour vos équipes internationales.' },
            { icon: Clock, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: 'Priorités & Échéances', desc: 'Niveau de priorité, dates d\'échéance et indicateurs visuels de retard sur chaque tâche.' },
            { icon: ShieldCheck, color: '#a855f7', bg: 'rgba(168,85,247,0.12)', title: 'Cloud Sécurisé', desc: 'PostgreSQL + Prisma ORM, JWT sécurisé, hébergé sur Railway et Vercel.' },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="card" style={{ padding: '20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', flexShrink: 0 }}>
                <Icon size={20} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>{title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ maxWidth: '820px', margin: '0 auto 60px', padding: '0 20px', textAlign: 'center' }}>
        <div className="card" style={{
          padding: '44px 28px',
          background: 'linear-gradient(135deg,rgba(99,102,241,0.13) 0%,rgba(17,11,24,0.95) 100%)',
          border: '1px solid var(--accent)', borderRadius: 'var(--radius-xl)',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>
            Prêt à booster la collaboration de votre équipe ?
          </h2>
          <p className="text-muted" style={{ fontSize: '14px', maxWidth: '440px', margin: '0 auto 26px', lineHeight: 1.6 }}>
            Créez votre compte en moins de 30 secondes et commencez à organiser vos projets dès aujourd'hui.
          </p>
          <Link to="/login?mode=register" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
            Rejoindre ProjectFlow gratuitement <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

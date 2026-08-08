import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Zap, Users, Bell, Globe, ArrowRight, ShieldCheck, CheckCircle2, Layout, Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Landing: React.FC = () => {
  const { token } = useAuthStore();

  return (
    <div className="landing-container" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* ── Landing Header ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 40px',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10, 10, 15, 0.85)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo-icon">
            <FolderKanban color="white" size={22} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>ProjectFlow</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {token ? (
            <Link to="/" className="btn btn-primary">
              Accéder à mon espace <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ color: 'var(--text-primary)' }}>
                Se connecter
              </Link>
              <Link to="/login" className="btn btn-primary">
                S'inscrire gratuitement <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        style={{
          padding: '100px 24px 80px',
          textAlign: 'center',
          maxWidth: '1100px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Glow ambient background */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(0, 0, 0, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="badge badge-inprogress mb-6"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '99px',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--accent)' }} />
            Plateforme Collaborative Nouvelle Génération
          </div>

          <h1
            style={{
              fontSize: 'calc(32px + 2vw)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pilotez vos projets en équipe,<br />en temps réel et sans friction.
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 40px',
              lineHeight: 1.6,
            }}
          >
            Organisez vos tâches avec un tableau Kanban interactif, invitez vos collaborateurs
            et recevez des mises à jour instantanées grâce à notre moteur temps réel.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Démarrer gratuitement <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              Découvrir les fonctionnalités
            </a>
          </div>
        </div>
      </section>

      {/* ── Interactive Preview Showcase ── */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div
          className="card"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-lg)',
            padding: '24px',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
              <span className="text-xs text-muted" style={{ marginLeft: '10px' }}>Aperçu du Tableau ProjectFlow</span>
            </div>
            <span className="badge badge-done">⚡ WebSockets Connecté</span>
          </div>

          <div className="dashboard-grid">
            <div className="card" style={{ background: 'var(--bg-card)' }}>
              <h4 className="font-bold text-sm mb-3 flex-between">
                <span>📌 À faire</span> <span className="badge badge-todo">2</span>
              </h4>
              <div className="card mb-2" style={{ padding: '10px 14px', background: 'var(--bg-secondary)' }}>
                <span className="text-xs font-bold text-accent">#01 Refonte UI</span>
                <p className="text-sm mt-1">Maquettage des composants responsive</p>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-card)' }}>
              <h4 className="font-bold text-sm mb-3 flex-between">
                <span>🔥 En cours</span> <span className="badge badge-inprogress">1</span>
              </h4>
              <div className="card" style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--warning)' }}>
                <span className="text-xs font-bold text-warning">#02 PostgreSQL Sync</span>
                <p className="text-sm mt-1">Migration et déploiement cloud</p>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--bg-card)' }}>
              <h4 className="font-bold text-sm mb-3 flex-between">
                <span>✅ Terminé</span> <span className="badge badge-done">3</span>
              </h4>
              <div className="card" style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderLeft: '3px solid var(--success)' }}>
                <span className="text-xs font-bold text-success">#03 Authentification JWT</span>
                <p className="text-sm mt-1">Sécurisation des endpoints backend</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto 120px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
            Tout ce dont votre équipe a besoin
          </h2>
          <p className="text-muted" style={{ fontSize: '16px' }}>
            Des fonctionnalités pensées pour la productivité et la clarté.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          <div className="card">
            <div className="stat-icon mb-4" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}>
              <Layout size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Tableau Kanban Dynamique</h3>
            <p className="text-secondary text-sm">
              Glissez-déposez vos cartes facilement entre les colonnes et suivez l'avancement de vos sprints.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon mb-4" style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--success)' }}>
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Temps Réel WebSockets</h3>
            <p className="text-secondary text-sm">
              Toutes les modifications apportées par vos coéquipiers apparaissent instantanément sans rafraîchir.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon mb-4" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Gestion des Membres</h3>
            <p className="text-secondary text-sm">
              Invitez des collaborateurs par leur adresse email et attribuez-leur des tâches précises.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon mb-4" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
              <Bell size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Centre de Notifications</h3>
            <p className="text-secondary text-sm">
              Soyez notifié immédiatement dès qu'une tâche vous est assignée ou lorsqu'un commentaire est ajouté.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon mb-4" style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--info)' }}>
              <Globe size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Interface Bilingue</h3>
            <p className="text-secondary text-sm">
              Basculez à tout moment entre le Français et l'Anglais en un clic pour vos équipes internationales.
            </p>
          </div>

          <div className="card">
            <div className="stat-icon mb-4" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Architecture Cloud Sécurisée</h3>
            <p className="text-secondary text-sm">
              Propulsé par PostgreSQL et Prisma ORM, hébergé sur des serveurs haute performance.
            </p>
          </div>
        </div>
      </section>

      {/* ── Call To Action Footer Banner ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto 80px', padding: '0 24px', textAlign: 'center' }}>
        <div
          className="card"
          style={{
            padding: '50px 30px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(17,11,24,0.9) 100%)',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '14px' }}>
            Prêt à booster la collaboration de votre équipe ?
          </h2>
          <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto 28px' }}>
            Créez votre compte en moins de 30 secondes et organisez vos projets dès aujourd'hui.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
            Rejoindre ProjectFlow <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;

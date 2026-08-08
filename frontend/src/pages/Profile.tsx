import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import Avatar from '../components/ui/Avatar';
import { User, Mail, Shield, Calendar, Save, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
];

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customAvatar, setCustomAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom complet ne peut pas être vide');
      return;
    }

    try {
      setSaving(true);
      const finalAvatar = customAvatar.trim() || avatar;
      const updatedUser = await authApi.updateProfile({
        name: name.trim(),
        avatar: finalAvatar,
      });

      updateUser(updatedUser);
      toast.success('Profil mis à jour avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Mon Profil</h1>
          <p className="text-muted text-sm">Gérez vos informations personnelles et votre avatar</p>
        </div>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSave}>
          {/* Header section with avatar preview */}
          <div className="flex items-center gap-6 pb-6 border-b border-border mb-6">
            <Avatar user={user ? { ...user, name, avatar: customAvatar || avatar } : null} size="lg" />
            <div>
              <h2 className="font-bold text-lg">{name || 'Utilisateur'}</h2>
              <p className="text-sm text-muted">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="badge badge-inprogress">
                  <Shield size={12} className="mr-1" />
                  {user?.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
                </span>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <User size={16} /> Nom complet
              </label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label flex items-center gap-2">
                <Mail size={16} /> Adresse email (non modifiable)
              </label>
              <input
                type="email"
                className="input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            {/* Avatar selector presets */}
            <div className="input-group">
              <label className="input-label">Choisir un avatar prédéfini</label>
              <div className="flex items-center gap-3 flex-wrap mt-1">
                <button
                  type="button"
                  onClick={() => { setAvatar(''); setCustomAvatar(''); }}
                  className={`avatar avatar-lg flex-center ${!avatar && !customAvatar ? 'border-accent' : ''}`}
                  style={{ border: !avatar && !customAvatar ? '2px solid var(--accent)' : '1px solid var(--border)' }}
                >
                  Initiales
                </button>

                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setAvatar(preset); setCustomAvatar(''); }}
                    style={{
                      border: avatar === preset && !customAvatar ? '2px solid var(--accent)' : '2px solid transparent',
                      borderRadius: '50%',
                      padding: 2,
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Avatar URL input */}
            <div className="input-group">
              <label className="input-label">Ou coller une URL d'image personnalisée</label>
              <input
                type="url"
                className="input"
                value={customAvatar}
                onChange={(e) => setCustomAvatar(e.target.value)}
                placeholder="https://exemple.com/mon-avatar.jpg"
              />
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} /> Enregistrer le profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account metadata card */}
      <div className="card">
        <h3 className="font-bold text-sm mb-3 text-muted">Informations du compte</h3>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> Membre depuis le {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Récemment'}
          </span>
          <span>•</span>
          <span>ID: {user?.id}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';
import Avatar from '../components/ui/Avatar';
import { User, Mail, Shield, Calendar, Save, Loader2, Lock, Eye, EyeOff, ChevronDown, ChevronUp, Upload, Image as ImageIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

/* DiceBear cartoon/illustrated/nature/abstract avatars */
const AVATAR_PRESETS = [
  { url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Abby&backgroundColor=b6e3f4,c0aede', label: 'Aventurière' },
  { url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Liam&backgroundColor=ffdfbf,ffd5dc', label: 'Aventurier' },
  { url: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=Nova&backgroundColor=b6e3f4', label: 'Pixel' },
  { url: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=Robot&backgroundColor=d1d4f9', label: 'Robot' },
  { url: 'https://api.dicebear.com/8.x/fun-emoji/svg?seed=Felix&backgroundColor=ffdfbf', label: 'Emoji' },
  { url: 'https://api.dicebear.com/8.x/lorelei/svg?seed=Luna&backgroundColor=c0aede', label: 'Art' },
  { url: 'https://api.dicebear.com/8.x/croodles/svg?seed=Milo&backgroundColor=d1d4f9', label: 'Gribouillis' },
  { url: 'https://api.dicebear.com/8.x/micah/svg?seed=Zara&backgroundColor=b6e3f4', label: 'Micah' },
];

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile info state
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customAvatar, setCustomAvatar] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [saving, setSaving] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Helper: resize & compress image using HTML5 Canvas
  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle local image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier d\'image valide (PNG, JPG, WEBP, GIF)');
      return;
    }

    try {
      const compressedDataUrl = await resizeAndCompressImage(file);
      setCustomAvatar(compressedDataUrl);
      setUploadedFileName(file.name);
      toast.success(`Image "${file.name}" optimisée avec succès !`);
    } catch {
      toast.error('Erreur lors de la lecture de l\'image');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom complet ne peut pas être vide');
      return;
    }
    try {
      setSaving(true);
      const finalAvatar = customAvatar.trim() || avatar;
      const updatedUser = await authApi.updateProfile({ name: name.trim(), avatar: finalAvatar });
      updateUser(updatedUser);
      toast.success(t('profile.successUpdated'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t('profile.passwordMinChars'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passwordMismatch'));
      return;
    }
    try {
      setSavingPwd(true);
      await authApi.updateProfile({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() });
      toast.success(t('profile.successPwdUpdated'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSavingPwd(false);
    }
  };

  const previewAvatar = customAvatar.trim() || avatar;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold">{t('profile.title')}</h1>
        <p className="text-muted text-sm">{t('profile.subtitle')}</p>
      </div>

      {/* ── Profile Card ── */}
      <div className="card mb-5">
        <form onSubmit={handleSaveProfile}>
          {/* Avatar preview + user info header */}
          <div className="profile-header">
            <Avatar user={user ? { ...user, name, avatar: previewAvatar || undefined } : null} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 className="font-bold" style={{ fontSize: '16px' }}>{name || 'Utilisateur'}</h2>
              <p className="text-sm text-muted truncate">{user?.email}</p>
              <span className="badge badge-inprogress" style={{ marginTop: '8px', display: 'inline-flex', gap: '4px' }}>
                <Shield size={11} />
                {user?.role === 'ADMIN' ? t('profile.adminRole') : t('profile.memberRole')}
              </span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '20px 0' }} />

          <div className="profile-form-grid">
            {/* Name field */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> {t('profile.fullName')}
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

            {/* Email (readonly) */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} /> {t('profile.emailReadonly')}
              </label>
              <input
                type="email"
                className="input"
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.55, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          {/* Local File Upload Section */}
          <div className="input-group" style={{ marginTop: '20px' }}>
            <label className="input-label flex items-center gap-2">
              <Upload size={15} /> {t('profile.uploadPhoto')}
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
              >
                <ImageIcon size={16} /> {t('profile.importImageBtn')}
              </button>
              {uploadedFileName && (
                <span className="text-xs text-success flex items-center gap-1 font-semibold">
                  <Check size={14} /> {uploadedFileName}
                </span>
              )}
            </div>
            <span className="text-xs text-muted mt-1 display-block">
              {t('profile.allowedFormats')}
            </span>
          </div>

          {/* Avatar presets */}
          <div className="input-group" style={{ marginTop: '20px' }}>
            <label className="input-label">{t('profile.choosePreset')}</label>
            <div className="avatar-presets-grid">
              {/* "Initials" option */}
              <button
                type="button"
                onClick={() => { setAvatar(''); setCustomAvatar(''); setUploadedFileName(''); }}
                className="avatar-preset-btn"
                style={{
                  border: !avatar && !customAvatar ? '2px solid var(--accent)' : '2px solid var(--border)',
                  background: 'var(--bg-hover)',
                  color: !avatar && !customAvatar ? 'var(--accent)' : 'var(--text-secondary)',
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                A–Z
              </button>

              {AVATAR_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setAvatar(preset.url); setCustomAvatar(''); setUploadedFileName(''); }}
                  title={preset.label}
                  style={{
                    border: avatar === preset.url && !customAvatar ? '2px solid var(--accent)' : '2px solid var(--border)',
                    borderRadius: '50%',
                    padding: 2,
                    background: 'var(--bg-hover)',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', background: '#f0f4ff' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL */}
          <div className="input-group" style={{ marginTop: '16px' }}>
            <label className="input-label">{t('profile.pasteUrl')}</label>
            <input
              type="url"
              className="input"
              value={customAvatar}
              onChange={(e) => { setCustomAvatar(e.target.value); setUploadedFileName(''); }}
              placeholder="https://exemple.com/mon-avatar.png"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? <><Loader2 size={15} className="animate-spin" /> {t('profile.saving')}</>
                : <><Save size={15} /> {t('profile.saveProfile')}</>
              }
            </button>
          </div>
        </form>
      </div>

      {/* ── Password Change Card ── */}
      <div className="card mb-5">
        <button
          type="button"
          className="flex-between"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-primary)' }}
          onClick={() => setShowPasswordSection(!showPasswordSection)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="font-bold" style={{ fontSize: '14px' }}>{t('profile.changePassword')}</div>
              <div className="text-muted text-xs">{t('profile.changePasswordSubtitle')}</div>
            </div>
          </div>
          {showPasswordSection ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
        </button>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <div className="flex flex-col gap-4">
              {/* Current Password */}
              <div className="input-group">
                <label className="input-label">{t('profile.currentPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    className="input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={t('profile.currentPassword')}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                  >
                    {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="input-group">
                <label className="input-label">{t('profile.newPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    className="input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('profile.passwordMinChars')}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                  >
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-group">
                <label className="input-label">{t('profile.confirmPassword')}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPwd ? 'text' : 'password'}
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('profile.confirmPassword')}
                    required
                    style={{
                      paddingRight: '44px',
                      borderColor: confirmPassword && newPassword !== confirmPassword ? 'var(--danger)' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
                  >
                    {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <span style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>{t('profile.passwordMismatch')}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowPasswordSection(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={savingPwd || (!!confirmPassword && newPassword !== confirmPassword)}
              >
                {savingPwd
                  ? <><Loader2 size={15} className="animate-spin" /> {t('profile.saving')}</>
                  : <><Lock size={15} /> {t('profile.changePassword')}</>
                }
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Account Info Card ── */}
      <div className="card">
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{t('profile.accountInfo')}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <Calendar size={14} />
          <span>
            {t('profile.memberSince')}{' '}
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(t('common.confirm') === 'Confirm' ? 'en-US' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Récemment'}
          </span>
          <span style={{ color: 'var(--border-light)' }}>•</span>
          <span>{t('profile.role')} : <strong>{user?.role === 'ADMIN' ? t('profile.adminRole') : t('profile.memberRole')}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default Profile;

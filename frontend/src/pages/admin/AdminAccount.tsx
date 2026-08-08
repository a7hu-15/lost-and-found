import React, { useState } from 'react';
import { Settings, Lock, ShieldCheck, CheckCircle2, AlertCircle, Key, QrCode } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminAccount: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // MFA State
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaQrUri, setMfaQrUri] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaSuccess, setMfaSuccess] = useState('');
  const [mfaError, setMfaError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordSuccess('Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSetupMfa = async () => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const res = await api.post('/auth/mfa/setup');
      setMfaSecret(res.data.secret);
      setMfaQrUri(res.data.qr_uri);
    } catch (err: any) {
      setMfaError(err.response?.data?.detail || 'Failed to initialize MFA setup.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaLoading(true);
    setMfaError('');

    try {
      await api.post('/auth/mfa/enable', { code: mfaCode });
      setMfaSuccess('2FA Multi-Factor Authentication successfully enabled for your account!');
      setMfaSecret(null);
      setMfaQrUri(null);
      setMfaCode('');
      await refreshUser();
      setTimeout(() => setMfaSuccess(''), 5000);
    } catch (err: any) {
      setMfaError(err.response?.data?.detail || 'Invalid authenticator verification code.');
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">Account Credentials & Hardening</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Account & Security Settings</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Change Password Card */}
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
            <Lock className="w-4 h-4 text-[var(--admin-accent)]" />
            <h2 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Change Password</h2>
          </div>

          {passwordSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs p-3 rounded font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Current Password *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="admin-input w-full py-2 px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">New Password *</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="admin-input w-full py-2 px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="admin-input w-full py-2 px-3 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="admin-button-primary w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              {passwordLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* 2FA Multi-Factor Authentication Card */}
        <div className="admin-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <h2 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Two-Factor Authentication (MFA)</h2>
            </div>

            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
              user?.mfa_enabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}>
              {user?.mfa_enabled ? 'MFA Active' : 'MFA Inactive'}
            </span>
          </div>

          <p className="text-xs text-[var(--admin-text-secondary)] leading-relaxed">
            Multi-Factor Authentication adds an extra layer of security to your administrative console using a TOTP Authenticator app (Google Authenticator, Authy, 1Password, etc.).
          </p>

          {mfaSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{mfaSuccess}</span>
            </div>
          )}

          {mfaError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs p-3 rounded font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{mfaError}</span>
            </div>
          )}

          {!user?.mfa_enabled && !mfaSecret && (
            <button
              onClick={handleSetupMfa}
              disabled={mfaLoading}
              className="admin-button-primary text-xs w-full py-2.5 flex items-center justify-center gap-2"
            >
              <QrCode className="w-3.5 h-3.5" />
              {mfaLoading ? 'Initializing 2FA...' : 'Configure TOTP Authenticator'}
            </button>
          )}

          {mfaSecret && (
            <div className="space-y-4 pt-2 border-t border-[var(--admin-border)]">
              
              {/* Scannable QR Code & Secret Key */}
              <div className="bg-[var(--admin-surface-subtle)] p-4 rounded border border-[var(--admin-border)] text-xs font-mono flex flex-col sm:flex-row items-center gap-4">
                {mfaQrUri && (
                  <div className="bg-white p-2 rounded border border-[var(--admin-border)] shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(mfaQrUri)}`}
                      alt="Authenticator QR Code"
                      className="w-28 h-28"
                    />
                  </div>
                )}

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="text-[10px] text-[var(--admin-text-muted)] uppercase font-bold">1. Scan QR Code OR Copy Secret Key</div>
                  <div className="text-amber-500 font-bold select-all text-xs tracking-wider break-all bg-[var(--admin-surface)] p-2 rounded border border-[var(--admin-border)]">
                    {mfaSecret}
                  </div>
                  <div className="text-[10px] text-[var(--admin-text-muted)] leading-relaxed font-sans">
                    Open <strong>Google Authenticator</strong> on your phone &rarr; tap <strong>+</strong> &rarr; tap <strong>Scan QR code</strong> (or enter key manually).
                  </div>
                </div>
              </div>

              <form onSubmit={handleEnableMfa} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">
                    2. Enter 6-Digit Code Shown in Google Authenticator *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="123456"
                    className="admin-input w-full py-2.5 px-3 text-xs font-mono text-center tracking-widest text-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={mfaLoading || mfaCode.length !== 6}
                  className="admin-button-primary w-full py-2.5 text-xs bg-emerald-600 hover:bg-emerald-500"
                >
                  Verify Code &amp; Enable 2FA Protection
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

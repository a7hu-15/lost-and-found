import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Logo } from '../../components/Logo';

export const AdminResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token,
        new_password: newPassword
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired password reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text-primary)] flex flex-col justify-center items-center px-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo variant="dark" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)]">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>Reset Password</span>
          </div>
        </div>

        <div className="admin-card p-6 sm:p-8 space-y-6">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[var(--admin-text-primary)]">Password Successfully Reset</h2>
              <p className="text-xs text-[var(--admin-text-secondary)]">
                Your password has been updated. All previous active sessions have been invalidated. Please log in with your new password.
              </p>
              <button
                onClick={() => navigate('/admin/login')}
                className="admin-button-primary w-full py-2.5 text-xs mt-4"
              >
                Log In to Staff Console &rarr;
              </button>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold text-[var(--admin-text-primary)] tracking-tight">Create New Password</h1>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Enter a strong new password for your administrative staff account.</p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs p-3 rounded font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                  className="admin-button-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {loading ? 'Resetting Password...' : 'Reset Password & Invalidate Sessions'}
                </button>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

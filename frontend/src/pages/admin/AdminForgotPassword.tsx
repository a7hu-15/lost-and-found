import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { Logo } from '../../components/Logo';

export const AdminForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
    } catch (err) {
      // Intentionally ignore error to preserve generic privacy response
    } finally {
      setLoading(false);
      setSubmitted(true);
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
            <span>Staff Password Recovery</span>
          </div>
        </div>

        <div className="admin-card p-6 sm:p-8 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[var(--admin-text-primary)]">Password Reset Link Dispatched</h2>
              <p className="text-xs text-[var(--admin-text-secondary)] leading-relaxed">
                If an active account exists for <strong className="text-[var(--admin-text-primary)]">{email}</strong>, we have dispatched a single-use password reset link. Please check your inbox.
              </p>
              <div className="pt-4">
                <Link to="/admin/login" className="admin-button-secondary text-xs inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold text-[var(--admin-text-primary)] tracking-tight">Forgot Password</h1>
                <p className="text-xs text-[var(--admin-text-secondary)] mt-1">Enter your registered staff email address to receive password reset instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Registered Staff Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff.name@university.edu"
                    className="admin-input w-full py-2 px-3 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="admin-button-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {loading ? 'Dispatching Reset Link...' : 'Send Password Reset Link'}
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link to="/admin/login" className="text-xs text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

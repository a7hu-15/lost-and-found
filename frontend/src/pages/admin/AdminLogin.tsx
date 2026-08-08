import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Logo } from '../../components/Logo';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mfaToken) {
        // Step 2: MFA Verification
        const mfaRes = await api.post('/auth/login/mfa', {
          mfa_token: mfaToken,
          code: mfaCode
        });
        const token = mfaRes.data.access_token;
        const userRes = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        login(token, userRes.data);
        navigate('/admin');
        return;
      }

      // Step 1: Initial Login
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.mfa_required) {
        setMfaToken(res.data.mfa_token);
        setLoading(false);
        return;
      }

      const token = res.data.access_token;
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = userRes.data;
      const roleStr = typeof userData.role === 'string' ? userData.role : String(userData.role);
      if (roleStr !== 'ADMIN_OWNER' && roleStr !== 'ADMIN_STAFF' && roleStr !== 'ADMIN' && roleStr !== 'SECURITY_STAFF') {
        setError('Access Restricted: Dedicated administrative or staff credentials required.');
        setLoading(false);
        return;
      }

      login(token, userData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid staff email, password, or authenticator code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text-primary)] flex flex-col justify-center items-center px-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo Lockup */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo variant="dark" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)]">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>Staff Portal • Authorized Personnel Only</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="admin-card p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--admin-text-primary)] tracking-tight">
              {mfaToken ? 'Two-Factor Authentication' : 'Admin & Staff Login'}
            </h1>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
              {mfaToken
                ? 'Enter the 6-digit TOTP code from your authenticator app'
                : 'Authenticate with your campus administration account'
              }
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs p-3 rounded font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!mfaToken ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Staff Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your authorized email address"
                    className="admin-input w-full py-2 px-3 text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-[var(--admin-text-secondary)]">Password</label>
                    <Link to="/admin/forgot-password" className="text-[11px] text-[var(--admin-accent)] hover:underline font-mono">
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="admin-input w-full py-2 px-3 text-xs"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">6-Digit Authenticator Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="admin-input w-full py-2 px-3 text-xs font-mono text-center tracking-widest text-lg"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!mfaToken && (!email.trim() || !password.trim())) || (Boolean(mfaToken) && mfaCode.length !== 6)}
              className="admin-button-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs"
            >
              {mfaToken ? <KeyRound className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {loading ? 'Authenticating Staff...' : mfaToken ? 'Verify 2FA Code' : 'Access Staff Console'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--admin-border)] text-center">
            <span className="text-[11px] text-[var(--admin-text-muted)] font-mono">
              All administrative access attempts are logged for security auditing.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

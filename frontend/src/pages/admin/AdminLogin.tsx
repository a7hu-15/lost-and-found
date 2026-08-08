import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Logo } from '../../components/Logo';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const token = res.data.access_token;
      
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = userRes.data;
      if (userData.role !== 'ADMIN' && userData.role !== 'SECURITY_STAFF') {
        setError('Access Restricted: Dedicated administrative or security staff credentials required.');
        setLoading(false);
        return;
      }

      login(token, userData);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid staff email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col justify-center items-center px-4 font-sans">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo Lockup */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo variant="dark" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff Portal • Authorized Personnel Only</span>
          </div>
        </div>

        {/* Card Form */}
        <div className="saas-card p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin & Security Login</h1>
            <p className="text-xs text-zinc-400 mt-1">Authenticate with your campus administration account</p>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Staff Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@srm.edu"
                className="saas-input w-full py-2 px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="saas-input w-full py-2 px-3 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="saas-button-primary w-full py-2.5 flex items-center justify-center gap-2 text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              {loading ? 'Authenticating Staff...' : 'Access Staff Console'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 text-center">
            <span className="text-[11px] text-zinc-500 font-mono">
              All administrative access attempts are logged for security auditing.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

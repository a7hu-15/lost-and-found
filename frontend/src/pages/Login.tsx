import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Login: React.FC = () => {
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
      
      login(token, userRes.data);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="saas-card p-6 sm:p-8">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Sign in to Lost & Found</h2>
          <p className="text-xs text-zinc-400 mt-1">Enter your credentials to manage reports</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded-md mb-4 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@university.edu"
              className="saas-input w-full py-2 px-3"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="saas-input w-full py-2 px-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="saas-button-primary w-full py-2.5 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-medium hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

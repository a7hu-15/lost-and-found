import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../services/api';
import { UserRole } from '../types';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        role
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="saas-card p-6 sm:p-8">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-xs text-zinc-400 mt-1">Register for campus lost and found access</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded-md mb-4 font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              className="saas-input w-full py-2 px-3"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
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

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="saas-input w-full py-2 px-3 text-xs"
            >
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty Member</option>
              <option value="SECURITY_STAFF">Security Staff</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="saas-button-primary w-full py-2.5 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus className="w-4 h-4" />
                Register
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
          Already registered?{' '}
          <Link to="/login" className="text-white font-medium hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

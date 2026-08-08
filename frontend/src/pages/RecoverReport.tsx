import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export const RecoverReport: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await api.post('/track/recover', { email });
      setSubmitted(true);
    } catch (err) {
      console.error('Recovery request failed', err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="saas-card p-8 text-center space-y-5">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recovery Email Sent</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              If an active report exists for <span className="text-zinc-200 font-semibold">{email}</span>, we have sent your active Report IDs and secure tracking links.
            </p>
          </div>

          <button
            onClick={() => navigate('/track')}
            className="saas-button-primary text-xs w-full py-2.5"
          >
            Return to Check Report Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Recover Your Report</h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Enter the email address used when submitting your report. We'll send your active Report IDs and secure tracking links.
          </p>
        </div>

        <form onSubmit={handleRecover} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Your Email Address *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@university.edu"
                className="saas-input w-full py-2 pl-9 pr-3 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Link to="/track" className="saas-button-secondary text-xs flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="saas-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sending Email...' : 'Send Recovery Email'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

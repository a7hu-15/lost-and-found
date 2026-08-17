import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Send, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export const Support: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return;

    setLoading(true);
    setError('');

    try {
      await api.post('/support', {
        name,
        email,
        subject,
        message
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to send your message. Please try again in a few minutes.');
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
            <h2 className="text-xl font-bold text-white tracking-tight">Message Sent</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Thanks for contacting us. We've received your message and will review it as soon as possible.
            </p>
          </div>

          <p className="text-[11px] text-zinc-500 font-mono">
            If your question is about a report, please include your Report ID in future messages.
          </p>

          <button
            onClick={() => navigate('/')}
            className="saas-button-primary text-xs w-full py-2.5"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Need Help?</h1>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            If you're having trouble with a report, found a bug, or have a question, send us a message and we'll get back to you.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="saas-input w-full py-2 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              className="saas-input w-full py-2 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Subject *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Issue with report LF-SRM-26-8K4P91"
              className="saas-input w-full py-2 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Message *</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or question in detail..."
              className="saas-input w-full p-3 text-xs"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="saas-button-secondary text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim() || !subject.trim() || !message.trim()}
              className="saas-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sending Message...' : 'Send Message'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

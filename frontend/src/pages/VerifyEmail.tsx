import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [moderationStatus, setModerationStatus] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification link. No token provided.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/verification/verify-email?token=${token}`);
        setStatus('success');
        setModerationStatus(res.data.status);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.detail || 'Failed to verify email. The link may have expired or already been used.'
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="saas-card max-w-md w-full p-8 text-center space-y-6">
        
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-white">Verifying your email...</h2>
            <p className="text-sm text-zinc-400">Please wait while we confirm your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Email Verified!</h2>
            <p className="text-sm text-zinc-400">
              Your email has been successfully verified. 
            </p>
            {moderationStatus === 'PENDING_MODERATION' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-300">
                  Your report has been flagged for manual review by our moderation team. You will be notified once it is approved.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-sm text-emerald-300">
                  Your report has been approved and is now live!
                </p>
              </div>
            )}
            <button
              onClick={() => navigate('/')}
              className="saas-button-primary w-full mt-4"
            >
              Return Home
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
              <XCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Verification Failed</h2>
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/')}
              className="saas-button-secondary w-full mt-4"
            >
              Return Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

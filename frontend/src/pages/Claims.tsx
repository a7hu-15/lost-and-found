import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import api from '../services/api';
import { FoundItem } from '../types';

export const Claims: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const foundItem = (location.state as { foundItem?: FoundItem })?.foundItem;

  const [claimantEmail, setClaimantEmail] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [uniqueMarks, setUniqueMarks] = useState('');
  const [insideContents, setInsideContents] = useState('');

  const [submittedClaimId, setSubmittedClaimId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!foundItem) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="saas-card p-8 space-y-4">
          <p className="text-xs font-mono text-zinc-400">No item selected for claim verification.</p>
          <button onClick={() => navigate('/search')} className="saas-button-primary text-xs py-2 px-4">
            Search Found Directory
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/claims/submit', {
        found_item_id: foundItem.id,
        claimant_email: claimantEmail,
        proof_description: proofDescription,
        verification_answers: {
          unique_marks: uniqueMarks,
          inside_contents: insideContents
        }
      });

      setSubmittedClaimId(res.data.id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit ownership claim.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedClaimId) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="saas-card p-8 text-center space-y-5">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Claim Submitted for Review</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Security Staff will review your ownership proof answers and verify against physical item attributes.
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded border border-zinc-800 font-mono space-y-2 text-left">
            <div className="text-[10px] text-zinc-500 uppercase">Item Report ID</div>
            <div className="text-base font-bold text-white tracking-wider">{foundItem.report_id}</div>
            <div className="text-xs text-zinc-400 pt-1">Holding at: {foundItem.storage_location}</div>
          </div>

          <p className="text-[11px] text-zinc-500">
            Once approved, you will receive an email notification with pickup instructions. Please bring your Student ID.
          </p>

          <button onClick={() => navigate('/')} className="saas-button-primary text-xs w-full py-2.5">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      
      {/* Item Summary Banner */}
      <div className="saas-card p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase">Claim Item Verification</span>
            <h1 className="text-lg font-bold text-white tracking-tight">{foundItem.title}</h1>
          </div>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
            {foundItem.report_id}
          </span>
        </div>

        <div className="text-xs text-zinc-400 font-mono space-y-1">
          <div>Category: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{foundItem.category}</span></div>
          <div>Where Found: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{foundItem.location}</span></div>
          <div>Holding Desk: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{foundItem.storage_location}</span></div>
        </div>
      </div>

      {/* Proof Form */}
      <div className="saas-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Ownership Proof Verification
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Answer questions to verify that this item belongs to you.</p>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs p-3 rounded font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitClaim} className="space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Why do you believe this item is yours? *
            </label>
            <textarea
              required
              rows={3}
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              placeholder="e.g. I lost my wallet near the Library 2nd floor yesterday afternoon around 3 PM..."
              className="saas-input w-full p-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Describe unique marks, wallpapers, or stickers *
            </label>
            <input
              type="text"
              required
              value={uniqueMarks}
              onChange={(e) => setUniqueMarks(e.target.value)}
              placeholder="e.g. GitHub Octocat sticker on top left, scratch on bottom corner"
              className="saas-input w-full py-2 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              What is inside the bag / wallet / device? *
            </label>
            <input
              type="text"
              required
              value={insideContents}
              onChange={(e) => setInsideContents(e.target.value)}
              placeholder="e.g. Student ID card with Registration # 202601, library receipt, red pen"
              className="saas-input w-full py-2 px-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Your Email Address * (For pickup notification)
            </label>
            <input
              type="email"
              required
              value={claimantEmail}
              onChange={(e) => setClaimantEmail(e.target.value)}
              placeholder="your.email@university.edu"
              className="saas-input w-full py-2 px-3 text-xs"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-[11px] font-mono text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              Security Staff will cross-verify answers before approving pickup.
            </div>
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
              disabled={loading || !proofDescription.trim() || !claimantEmail.trim()}
              className="saas-button-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
            >
              {loading ? 'Submitting Claim...' : 'Submit Claim Proof'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

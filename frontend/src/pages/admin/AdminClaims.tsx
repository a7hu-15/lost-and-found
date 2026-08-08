import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, FileText, MapPin, Mail, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Claim } from '../../types';

export const AdminClaims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [actionMessage, setActionMessage] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims/all');
      setClaims(res.data);
    } catch (err) {
      console.error('Failed to fetch claim queue', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleReviewClaim = async (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/claims/${claimId}/review`, {
        status,
        admin_notes: `Reviewed by Admin: ${status}`
      });
      setActionMessage(`Claim ${status === 'APPROVED' ? 'Approved & Pickup Email Dispatched' : 'Rejected'}`);
      fetchClaims();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to review claim.');
    }
  };

  const filteredClaims = claims.filter((c) => statusFilter === 'ALL' || c.status === statusFilter);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Verification Queue</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ownership Claim Proof Review</h1>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>Pending Approvals: {claims.filter(c => c.status === 'PENDING').length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs p-3 rounded font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              statusFilter === st
                ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {st} ({st === 'ALL' ? claims.length : claims.filter(c => c.status === st).length})
          </button>
        ))}
      </div>

      {/* Claims Queue List */}
      {loading ? (
        <div className="saas-card p-12 text-center text-xs font-mono text-zinc-500">
          Loading ownership claims queue...
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">
          No claims matching status filter: {statusFilter}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="saas-card p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Item: {claim.found_item?.title}</span>
                  <div className="text-sm font-semibold text-white">Found Report ID: {claim.found_item?.report_id}</div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5 font-mono">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    Storage Desk: {claim.found_item?.storage_location}
                  </div>
                </div>

                <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-bold self-start sm:self-center ${
                  claim.status === 'PENDING' ? 'bg-amber-950/40 text-amber-300 border-amber-900/60' :
                  claim.status === 'APPROVED' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60' :
                  'bg-rose-950/40 text-rose-300 border-rose-900/60'
                }`}>
                  {claim.status}
                </span>
              </div>

              {/* Claimant Proof Breakdown */}
              <div className="bg-zinc-900/90 p-4 rounded border border-zinc-800 text-xs space-y-3 font-mono">
                <div className="flex items-center gap-2 text-zinc-300 border-b border-zinc-800/80 pb-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Claimant Contact Email:</span>
                  <strong className="text-white">{claim.claimant_email || 'N/A'}</strong>
                </div>

                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Ownership Rationale / Description:</span>
                  <p className="text-zinc-200 font-sans mt-1 text-xs leading-relaxed">{claim.proof_description}</p>
                </div>

                {claim.verification_answers?.unique_marks && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Unique Marks / Serial / Stickers:</span>
                    <span className="text-amber-300 font-semibold">{claim.verification_answers.unique_marks}</span>
                  </div>
                )}

                {claim.verification_answers?.inside_contents && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Inside Bag / Wallet Contents:</span>
                    <span className="text-amber-300 font-semibold">{claim.verification_answers.inside_contents}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {claim.status === 'PENDING' && (
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => handleReviewClaim(claim.id, 'REJECTED')}
                    className="saas-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-rose-400"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Claim
                  </button>
                  <button
                    onClick={() => handleReviewClaim(claim.id, 'APPROVED')}
                    className="saas-button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Send Pickup Instructions
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

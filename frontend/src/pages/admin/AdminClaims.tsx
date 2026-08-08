import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, MapPin, Mail, AlertCircle, Eye } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider font-bold">Verification Queue</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Ownership Claim Proof Review</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <span>Pending Approvals: {claims.filter(c => c.status === 'PENDING').length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded-md font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[var(--admin-border)] pb-3 overflow-x-auto">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              statusFilter === st
                ? 'bg-[var(--admin-active-bg)] text-[var(--admin-active-text)] font-bold border border-[var(--admin-accent)]/40'
                : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-subtle)]'
            }`}
          >
            {st} ({st === 'ALL' ? claims.length : claims.filter(c => c.status === st).length})
          </button>
        ))}
      </div>

      {/* Claims Queue List */}
      {loading ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading ownership claims queue...
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          No claims matching status filter: {statusFilter}.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="admin-card p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--admin-border)] pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase font-semibold">Item: {claim.found_item?.title}</span>
                  <div className="text-base font-bold text-[var(--admin-text-primary)]">Found Report ID: {claim.found_item?.report_id}</div>
                  <div className="text-xs text-[var(--admin-text-secondary)] flex items-center gap-1.5 mt-0.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    Storage Desk: <strong className="text-[var(--admin-text-primary)]">{claim.found_item?.storage_location}</strong>
                  </div>
                </div>

                <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-bold self-start sm:self-center ${
                  claim.status === 'PENDING' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                  claim.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                  'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                }`}>
                  {claim.status}
                </span>
              </div>

              {/* Claimant Proof Breakdown - High Contrast Text */}
              <div className="bg-[var(--admin-surface-subtle)] p-4 rounded-md border border-[var(--admin-border)] text-xs space-y-3 font-sans">
                
                <div className="flex items-center gap-2 text-[var(--admin-text-secondary)] border-b border-[var(--admin-border)] pb-2 font-mono">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>Claimant Contact Email:</span>
                  <strong className="text-[var(--admin-text-primary)]">{claim.claimant_email || 'N/A'}</strong>
                </div>

                <div>
                  <span className="text-[var(--admin-text-muted)] block text-[10px] font-mono uppercase font-bold mb-1">
                    OWNERSHIP RATIONALE / DESCRIPTION:
                  </span>
                  <p className="text-[var(--admin-text-primary)] font-medium text-xs leading-relaxed bg-[var(--admin-surface)] p-3 rounded border border-[var(--admin-border)]">
                    {claim.proof_description}
                  </p>
                </div>

                {claim.verification_answers?.unique_marks && (
                  <div>
                    <span className="text-[var(--admin-text-muted)] block text-[10px] font-mono uppercase font-bold mb-1">
                      UNIQUE MARKS / SERIAL / STICKERS:
                    </span>
                    <p className="text-[var(--admin-text-primary)] font-medium text-xs bg-[var(--admin-surface)] p-2.5 rounded border border-[var(--admin-border)]">
                      {claim.verification_answers.unique_marks}
                    </p>
                  </div>
                )}

                {claim.verification_answers?.inside_contents && (
                  <div>
                    <span className="text-[var(--admin-text-muted)] block text-[10px] font-mono uppercase font-bold mb-1">
                      INSIDE BAG / WALLET CONTENTS:
                    </span>
                    <p className="text-[var(--admin-text-primary)] font-medium text-xs bg-[var(--admin-surface)] p-2.5 rounded border border-[var(--admin-border)]">
                      {claim.verification_answers.inside_contents}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions - Explicit Crisp High Contrast Buttons */}
              {claim.status === 'PENDING' && (
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => handleReviewClaim(claim.id, 'REJECTED')}
                    className="admin-btn-danger text-xs py-2 px-4 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Claim
                  </button>
                  <button
                    onClick={() => handleReviewClaim(claim.id, 'APPROVED')}
                    className="admin-btn-success text-xs py-2 px-4 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve &amp; Send Pickup Instructions
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

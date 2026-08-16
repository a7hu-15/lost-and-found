import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, AlertTriangle, FileText, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { Claim, DashboardStats, ItemInformation, LostItem, FoundItem, ModerationStatus } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [tips, setTips] = useState<ItemInformation[]>([]);
  const [flaggedLost, setFlaggedLost] = useState<LostItem[]>([]);
  const [flaggedFound, setFlaggedFound] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, claimsRes, tipsRes, lostRes, foundRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/claims/all'),
        api.get('/admin/information?status=PENDING'),
        api.get('/admin/lost-items?moderation_status=PENDING_MODERATION'),
        api.get('/admin/found-items?moderation_status=PENDING_MODERATION')
      ]);
      setStats(statsRes.data);
      setClaims(claimsRes.data);
      setTips(tipsRes.data);
      setFlaggedLost(lostRes.data);
      setFlaggedFound(foundRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewClaim = async (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/claims/${claimId}/review`, {
        status,
        admin_notes: `Reviewed by Security Staff: ${status}`
      });
      setActionMessage(`Claim ${status === 'APPROVED' ? 'Approved & Pickup Email Sent' : 'Rejected'}`);
      fetchAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to review claim.');
    }
  };

  const handleReviewTip = async (tipId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/information/${tipId}/status`, { status });
      setActionMessage(`Information Tip ${status === 'APPROVED' ? 'Approved & Owner Notified' : 'Rejected'}`);
      fetchAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to review tip.');
    }
  };

  const handleModerateItem = async (itemId: string, itemType: 'LOST' | 'FOUND', status: ModerationStatus) => {
    try {
      await api.patch(`/admin/${itemType.toLowerCase()}-items/${itemId}/moderation`, {
        moderation_status: status,
        admin_notes: `Reviewed by Security Staff`
      });
      setActionMessage(`${itemType} Item ${status}`);
      fetchAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to moderate ${itemType.toLowerCase()} item.`);
    }
  };

  return (
    <div className="space-y-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-blue-400 uppercase">Security Staff Control Center</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin & Verification Panel</h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800">
          <Shield className="w-4 h-4 text-emerald-400" />
          Role: Security Staff / Admin
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs p-3 rounded font-mono">
          {actionMessage}
        </div>
      )}

      {/* Overview Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="saas-card p-4 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Pending Claims</span>
            <div className="text-2xl font-bold text-amber-400">{stats.pending_claims}</div>
          </div>
          <div className="saas-card p-4 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Total Found Items</span>
            <div className="text-2xl font-bold text-white">{stats.total_found}</div>
          </div>
          <div className="saas-card p-4 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Total Lost Reports</span>
            <div className="text-2xl font-bold text-white">{stats.total_lost}</div>
          </div>
          <div className="saas-card p-4 space-y-1">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Resolved Returns</span>
            <div className="text-2xl font-bold text-emerald-400">{stats.resolved_claims}</div>
          </div>
        </div>
      )}

      {/* Claims Review Queue */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <FileText className="w-4 h-4 text-zinc-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Claim Verification Queue ({claims.length})
          </h2>
        </div>

        {loading ? (
          <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">
            Loading claim verification queue...
          </div>
        ) : claims.length === 0 ? (
          <div className="saas-card p-6 text-center text-xs font-mono text-zinc-500">
            No pending claims for review.
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((c) => (
              <div key={c.id} className="saas-card p-5 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Item: {c.found_item?.title}</span>
                    <div className="text-sm font-semibold text-white">Report ID: {c.found_item?.report_id}</div>
                  </div>

                  <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase ${
                    c.status === 'PENDING' ? 'bg-amber-950/40 text-amber-300 border-amber-900/60' :
                    c.status === 'APPROVED' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60' :
                    'bg-rose-950/40 text-rose-300 border-rose-900/60'
                  }`}>
                    {c.status}
                  </span>
                </div>

                {/* Proof Answers Breakdown */}
                <div className="bg-zinc-900 p-4 rounded border border-zinc-800 text-xs space-y-2 font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Claimant Contact Email:</span>
                    <span className="text-zinc-200">{c.claimant_email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Why They Believe It's Theirs:</span>
                    <p className="text-zinc-300 font-sans mt-0.5">{c.proof_description}</p>
                  </div>
                  {c.verification_answers?.unique_marks && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase">Unique Marks / Stickers:</span>
                      <span className="text-zinc-300">{c.verification_answers.unique_marks}</span>
                    </div>
                  )}
                  {c.verification_answers?.inside_contents && (
                    <div>
                      <span className="text-zinc-500 block text-[10px] uppercase">Inside Contents:</span>
                      <span className="text-zinc-300">{c.verification_answers.inside_contents}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {c.status === 'PENDING' && (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleReviewClaim(c.id, 'REJECTED')}
                      className="saas-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-rose-400"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Claim
                    </button>
                    <button
                      onClick={() => handleReviewClaim(c.id, 'APPROVED')}
                      className="saas-button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Send Pickup Email
                    </button>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Tips Review Queue */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Information Tips Queue ({tips.length})
          </h2>
        </div>

        {loading ? (
          <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">
            Loading tips...
          </div>
        ) : tips.length === 0 ? (
          <div className="saas-card p-6 text-center text-xs font-mono text-zinc-500">
            No pending information tips.
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map((t) => (
              <div key={t.id} className="saas-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Lost Item Report ID:</span>
                    <div className="text-sm font-semibold text-white">{t.lost_item_id}</div>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded border uppercase bg-amber-950/40 text-amber-300 border-amber-900/60">
                    {t.status}
                  </span>
                </div>

                <div className="bg-zinc-900 p-4 rounded border border-zinc-800 text-xs space-y-2 font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Submitted By:</span>
                    <span className="text-zinc-200">{t.sender_name || 'Anonymous'} ({t.sender_email || 'No Email'})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Message:</span>
                    <p className="text-zinc-300 font-sans mt-1 whitespace-pre-wrap">{t.message}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleReviewTip(t.id, 'REJECTED')}
                    className="saas-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-rose-400"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Tip
                  </button>
                  <button
                    onClick={() => handleReviewTip(t.id, 'APPROVED')}
                    className="saas-button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Notify Owner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Queue for Lost Items */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Flagged Lost Items Queue ({flaggedLost.length})
          </h2>
        </div>
        {loading ? (
          <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">Loading flagged lost items...</div>
        ) : flaggedLost.length === 0 ? (
          <div className="saas-card p-6 text-center text-xs font-mono text-zinc-500">No flagged lost items.</div>
        ) : (
          <div className="space-y-4">
            {flaggedLost.map((item) => (
              <div key={item.id} className="saas-card p-5 space-y-4 border-l-4 border-l-amber-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Lost Item | {item.report_id}</span>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase bg-amber-950/40 text-amber-300 border-amber-900/60">
                    {item.moderation_status}
                  </span>
                </div>
                <div className="bg-amber-950/20 p-4 rounded border border-amber-900/30 text-xs space-y-2 font-mono">
                  <div>
                    <span className="text-amber-500/70 block text-[10px] uppercase">Flag Reason:</span>
                    <span className="text-amber-200">{item.flag_reason || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-amber-500/70 block text-[10px] uppercase">Description:</span>
                    <p className="text-zinc-300 font-sans mt-0.5 whitespace-pre-wrap">{item.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleModerateItem(item.id, 'LOST', 'REJECTED')} className="saas-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-rose-400">
                    <XCircle className="w-3.5 h-3.5" /> Reject Report
                  </button>
                  <button onClick={() => handleModerateItem(item.id, 'LOST', 'APPROVED')} className="saas-button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Moderation Queue for Found Items */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Flagged Found Items Queue ({flaggedFound.length})
          </h2>
        </div>
        {loading ? (
          <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">Loading flagged found items...</div>
        ) : flaggedFound.length === 0 ? (
          <div className="saas-card p-6 text-center text-xs font-mono text-zinc-500">No flagged found items.</div>
        ) : (
          <div className="space-y-4">
            {flaggedFound.map((item) => (
              <div key={item.id} className="saas-card p-5 space-y-4 border-l-4 border-l-amber-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Found Item | {item.report_id}</span>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase bg-amber-950/40 text-amber-300 border-amber-900/60">
                    {item.moderation_status}
                  </span>
                </div>
                <div className="bg-amber-950/20 p-4 rounded border border-amber-900/30 text-xs space-y-2 font-mono flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div>
                      <span className="text-amber-500/70 block text-[10px] uppercase">Flag Reason:</span>
                      <span className="text-amber-200">{item.flag_reason || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-amber-500/70 block text-[10px] uppercase">Description:</span>
                      <p className="text-zinc-300 font-sans mt-0.5 whitespace-pre-wrap">{item.description}</p>
                    </div>
                  </div>
                  {item.thumbnail_url && (
                    <div className="w-24 h-24 shrink-0 rounded border border-amber-900/30 overflow-hidden bg-black/50">
                      <img src={item.thumbnail_url} alt="Flagged" className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleModerateItem(item.id, 'FOUND', 'REJECTED')} className="saas-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-rose-400">
                    <XCircle className="w-3.5 h-3.5" /> Reject Report
                  </button>
                  <button onClick={() => handleModerateItem(item.id, 'FOUND', 'APPROVED')} className="saas-button-primary text-xs py-1.5 px-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

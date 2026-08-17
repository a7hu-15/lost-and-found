import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Search, CheckCircle2, Clock, MapPin, Calendar, Lock, AlertCircle, ArrowUpRight } from 'lucide-react';
import api from '../services/api';
import { ItemDetailsModal } from '../components/ItemDetailsModal';

export const TrackReport: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryReportId = searchParams.get('report_id') || '';
  const queryToken = searchParams.get('token') || '';

  const [reportIdInput, setReportIdInput] = useState(queryReportId);
  const [tokenInput, setTokenInput] = useState(queryToken);

  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMatchModal, setSelectedMatchModal] = useState<any>(null);

  const handleTrackSubmit = async (e?: React.FormEvent, customId?: string, customToken?: string) => {
    if (e) e.preventDefault();

    const targetId = customId !== undefined ? customId : reportIdInput;
    const targetToken = customToken !== undefined ? customToken : tokenInput;

    if (!targetId.trim()) return;

    setLoading(true);
    setError('');
    setReportData(null);

    try {
      const url = targetToken ? `/track/${targetId}?token=${targetToken}` : `/track/${targetId}`;
      const res = await api.get(url);
      setReportData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired Report ID / Tracking Token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryReportId) {
      handleTrackSubmit(undefined, queryReportId, queryToken);
    }
  }, [queryReportId, queryToken]);

  const item = reportData ? (reportData.report || reportData) : null;
  const matches = reportData ? (reportData.matches || []) : [];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return { label: 'Searching', class: 'bg-amber-950/40 text-amber-300 border-amber-900/60' };
      case 'MATCHED':
        return { label: 'Possible Match', class: 'bg-blue-950/40 text-blue-300 border-blue-900/60' };
      case 'CLAIMED':
        return { label: 'Verification in Progress', class: 'bg-purple-950/40 text-purple-300 border-purple-900/60' };
      case 'RETURNED':
        return { label: 'Returned', class: 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60' };
      default:
        return { label: status || 'Unknown', class: 'bg-zinc-900 text-zinc-400 border-zinc-800' };
    }
  };

  const badge = item ? getStatusBadge(item.status) : null;

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      
      {/* Item Details Modal for Matched Items */}
      {selectedMatchModal && (
        <ItemDetailsModal
          item={selectedMatchModal}
          type="found"
          onClose={() => setSelectedMatchModal(null)}
        />
      )}

      {/* Header Form */}
      <div className="saas-card p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Check Report Status</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Enter your Report ID and access token to view the latest updates.
          </p>
        </div>

        <form onSubmit={handleTrackSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Report ID *</label>
              <input
                type="text"
                required
                value={reportIdInput}
                onChange={(e) => setReportIdInput(e.target.value)}
                placeholder="e.g. LF-SRM-26-8K4P91"
                className="saas-input w-full py-2 px-3 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Access Token (Optional)</label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token from email receipt"
                className="saas-input w-full py-2 px-3 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-zinc-800/80">
            <button
              type="submit"
              disabled={loading || !reportIdInput.trim()}
              className="saas-button-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5 w-full sm:w-auto"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? 'Fetching Status...' : 'Check Report Status'}
            </button>

            <Link
              to="/recover"
              className="text-xs text-blue-400 hover:text-blue-300 font-mono text-center sm:text-right"
            >
              Forgot your Report ID? Recover by email &rarr;
            </Link>
          </div>
        </form>
      </div>

      {error && (
        <div className="saas-card p-6 border-rose-900/60 bg-rose-950/30 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-rose-200">Tracking Error</h3>
          <p className="text-xs text-rose-300 font-mono">{error}</p>
        </div>
      )}

      {/* Report Status View */}
      {item && (
        <div className="saas-card p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400 font-bold">ID: {item.report_id}</span>
                {badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.class}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-1">{item.item_name}</h2>
            </div>

            <div className="text-xs font-mono text-zinc-400 text-right">
              <div>Created: {formatDate(item.created_at)}</div>
              <div>Category: {(item.brand || "N/A") || 'Uncategorized'}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-zinc-400 uppercase block">Status Lifecycle</span>
            
            <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-mono">
              <div className="p-3 rounded border bg-emerald-950/40 border-emerald-800 text-emerald-300 space-y-1">
                <div className="font-bold">1. Report</div>
              </div>

              <div className={`p-3 rounded border space-y-1 ${
                item.status === 'MATCHED' || item.status === 'CLAIMED' || item.status === 'RETURNED'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-800 text-amber-300'
              }`}>
                <div className="font-bold">2. Match</div>
              </div>

              <div className={`p-3 rounded border space-y-1 ${
                item.status === 'CLAIMED' || item.status === 'RETURNED'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}>
                <div className="font-bold">3. Verify</div>
              </div>

              <div className={`p-3 rounded border space-y-1 ${
                item.status === 'RETURNED'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}>
                <div className="font-bold">4. Collect</div>
              </div>
            </div>
          </div>

          {/* Location & Details Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 space-y-0.5">
              <span className="text-zinc-500 text-[10px] uppercase block">Location</span>
              <span className="text-zinc-200 font-semibold">{item.location || 'N/A'}</span>
            </div>
            <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 space-y-0.5">
              <span className="text-zinc-500 text-[10px] uppercase block">Date {reportData.type === 'found' ? 'Found' : 'Lost'}</span>
              <span className="text-zinc-200 font-semibold">{item.lost_date || item.found_date || formatDate(item.created_at)}</span>
            </div>
          </div>

          {item.description && (
            <div className="bg-zinc-900/80 p-3.5 rounded border border-zinc-800 space-y-1 text-xs font-mono">
              <span className="text-zinc-500 text-[10px] uppercase block">Description</span>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>
          )}

          {/* Matched Items */}
          {matches && matches.length > 0 ? (
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Potential Matches Found ({matches.length})
              </h3>

              <div className="space-y-3">
                {matches.map((match: any) => (
                  <div key={match.id} className="bg-zinc-900 p-4 rounded border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          {match.similarity_score.toFixed(0)}% Similarity Match
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{match.found_item?.item_name}</h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{match.found_item?.description}</p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedMatchModal(match.found_item)}
                        className="saas-button-secondary text-xs py-1.5 px-3"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate('/claims', { state: { foundItem: match.found_item } })}
                        className="saas-button-primary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        This is Mine <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="saas-card p-6 text-center text-xs text-zinc-500 font-mono">
              No updates yet. We'll notify you if your report status changes.
            </div>
          )}

        </div>
      )}

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { FileText, Search, Eye, EyeOff, CheckCircle2, ShieldAlert, X, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { LostItem, ItemStatus } from '../../types';

interface ItemInformation {
  id: string;
  lost_item_id: string;
  message: string;
  sender_name?: string;
  sender_email?: string;
  status: string;
  created_at: string;
}

export const AdminLostItems: React.FC = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Moderation Modal state
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<any>('APPROVED');
  const [moderationReason, setModerationReason] = useState('Inappropriate Content');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Information Tips state
  const [tips, setTips] = useState<ItemInformation[]>([]);
  const [tipsLoading, setTipsLoading] = useState(true);
  const [tipActionMessage, setTipActionMessage] = useState('');

  const fetchTips = async () => {
    setTipsLoading(true);
    try {
      const res = await api.get('/admin/information?status=PENDING');
      setTips(res.data);
    } catch (err) {
      console.error('Failed to fetch information tips', err);
    } finally {
      setTipsLoading(false);
    }
  };

  const handleReviewTip = async (tipId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/admin/information/${tipId}/status`, { status });
      const msg = status === 'APPROVED' ? 'Information Tip Approved & Owner Notified' : 'Information Tip Rejected';
      setTipActionMessage(msg);
      fetchTips();
      setTimeout(() => setTipActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to review tip.');
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/lost-items');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch lost items for admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchTips();
  }, []);

  const openModerationModal = (item: LostItem, status: any) => {
    setSelectedItem(item);
    setTargetStatus(status);
    setModerationReason(status === 'HIDDEN' ? 'Inappropriate Content' : 'Status Update');
    setAdminNotes('');
  };

  const handleApplyModeration = async () => {
    if (!selectedItem) return;

    try {
      await api.patch(`/admin/lost-items/${selectedItem.id}/moderation`, {
        moderation_status: targetStatus,
        moderation_reason: moderationReason,
        admin_notes: adminNotes
      });

      setActionMessage(`Report ${selectedItem.report_id} status updated to ${targetStatus}`);
      setSelectedItem(null);
      fetchItems();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update report status.');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(search.toLowerCase()) ||
      item.report_id.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.moderation_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-rose-500 uppercase tracking-wider font-bold">Report Moderation & Governance</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Lost Items Moderation</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-500" />
          <span>Total Logged Reports: {items.length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lost items by ID, title, or contact email..."
            className="admin-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-input py-2 px-3 text-xs w-full sm:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="REPORTED">REPORTED</option>
          <option value="MATCHED">MATCHED</option>
          <option value="CLAIMED">CLAIMED</option>
          <option value="RETURNED">RETURNED</option>
          <option value="CLOSED">CLOSED</option>
          <option value="HIDDEN">HIDDEN (Moderated)</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading lost item reports...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          No lost items match the search query.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--admin-surface-subtle)] border-b border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)] uppercase">
              <tr>
                <th className="py-3 px-4">Report ID / Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Reporter Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filteredItems.map((item) => {
                const isHidden = item.status === 'HIDDEN';
                return (
                  <tr key={item.id} className={`hover:bg-[var(--admin-surface-subtle)] transition-colors ${isHidden ? 'bg-rose-500/5' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold">{item.report_id}</div>
                      <div className="font-semibold text-[var(--admin-text-primary)] truncate max-w-xs">{item.item_name}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--admin-text-secondary)]">
                      {(item.brand || "N/A")}
                    </td>

                    <td className="py-3 px-4 text-[var(--admin-text-secondary)] truncate max-w-xs">
                      {item.location}
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--admin-text-muted)]">
                      {item.email}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        item.status === 'HIDDEN' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                        item.status === 'RETURNED' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' :
                        item.status === 'MATCHED' ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' :
                        'bg-[var(--admin-surface-subtle)] text-[var(--admin-text-secondary)] border-[var(--admin-border)]'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      {isHidden ? (
                        <button
                          onClick={() => openModerationModal(item, 'APPROVED')}
                          className="admin-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 hover:text-emerald-500"
                        >
                          <Eye className="w-3.5 h-3.5" /> Unhide Report
                        </button>
                      ) : (
                        <button
                          onClick={() => openModerationModal(item, 'REJECTED')}
                          className="admin-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 hover:text-rose-500"
                        >
                          <EyeOff className="w-3.5 h-3.5" /> Hide (Soft-Delete)
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Moderation Reason Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Moderate Lost Report</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[var(--admin-surface-subtle)] p-3 rounded border border-[var(--admin-border)] text-xs font-mono space-y-1">
              <div><span className="text-[var(--admin-text-muted)]">Report ID:</span> <span className="text-amber-500 font-bold">{selectedItem.report_id}</span></div>
              <div><span className="text-[var(--admin-text-muted)]">Title:</span> <span className="text-[var(--admin-text-primary)] font-semibold">{selectedItem.item_name}</span></div>
              <div><span className="text-[var(--admin-text-muted)]">Target Action:</span> <span className="text-rose-500 font-bold uppercase">{targetStatus}</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Moderation Reason *</label>
                <select
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="admin-input w-full py-2 px-3 text-xs"
                >
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Abusive Content">Abusive Content</option>
                  <option value="Spam / Malicious">Spam / Malicious</option>
                  <option value="Duplicate Report">Duplicate Report</option>
                  <option value="Resolved Offline">Resolved Offline</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Admin Audit Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Additional context recorded in administrative audit logs..."
                  className="admin-input w-full p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
              <button onClick={() => setSelectedItem(null)} className="admin-button-secondary text-xs py-1.5 px-3">
                Cancel
              </button>
              <button
                onClick={handleApplyModeration}
                className="admin-btn-danger text-xs py-1.5 px-4"
              >
                Apply Moderation Status
              </button>
            </div>

          </div>
        </div>
      )}
      {/* Information Tips Review Queue */}
      <div className="space-y-4 pt-6 border-t border-[var(--admin-border)]">
        <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-semibold text-[var(--admin-text-primary)] tracking-tight">
            Information Tips Queue ({tips.length})
          </h2>
        </div>

        {tipActionMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{tipActionMessage}</span>
          </div>
        )}

        {tipsLoading ? (
          <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
            Loading tips...
          </div>
        ) : tips.length === 0 ? (
          <div className="admin-card p-6 text-center text-xs font-mono text-[var(--admin-text-muted)]">
            No pending information tips.
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map((t) => (
              <div key={t.id} className="admin-card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--admin-border)] pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[var(--admin-text-muted)] uppercase">Lost Item Report ID:</span>
                    <div className="text-sm font-semibold text-[var(--admin-text-primary)] font-mono">{t.lost_item_id}</div>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded border uppercase bg-amber-950/40 text-amber-300 border-amber-900/60">
                    {t.status}
                  </span>
                </div>

                <div className="bg-[var(--admin-surface-subtle)] p-4 rounded border border-[var(--admin-border)] text-xs space-y-2 font-mono">
                  <div>
                    <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase">Submitted By:</span>
                    <span className="text-[var(--admin-text-primary)]">{t.sender_name || 'Anonymous'} ({t.sender_email || 'No Email'})</span>
                  </div>
                  <div>
                    <span className="text-[var(--admin-text-muted)] block text-[10px] uppercase">Message:</span>
                    <p className="text-[var(--admin-text-secondary)] font-sans mt-1 whitespace-pre-wrap">{t.message}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleReviewTip(t.id, 'REJECTED')}
                    className="admin-button-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 hover:text-rose-400"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Tip
                  </button>
                  <button
                    onClick={() => handleReviewTip(t.id, 'APPROVED')}
                    className="admin-button-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Notify Owner
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

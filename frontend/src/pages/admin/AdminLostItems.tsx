import React, { useEffect, useState } from 'react';
import { FileText, Search, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert, X } from 'lucide-react';
import api from '../../services/api';
import { LostItem, ItemStatus } from '../../types';

export const AdminLostItems: React.FC = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Moderation Modal state
  const [selectedItem, setSelectedItem] = useState<LostItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<ItemStatus>('HIDDEN');
  const [moderationReason, setModerationReason] = useState('Inappropriate Content');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

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
  }, []);

  const openModerationModal = (item: LostItem, status: ItemStatus) => {
    setSelectedItem(item);
    setTargetStatus(status);
    setModerationReason(status === 'HIDDEN' ? 'Inappropriate Content' : 'Status Update');
    setAdminNotes('');
  };

  const handleApplyModeration = async () => {
    if (!selectedItem) return;

    try {
      await api.patch(`/admin/lost-items/${selectedItem.id}/status`, {
        status: targetStatus,
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
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.report_id.toLowerCase().includes(search.toLowerCase()) ||
      item.contact_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider">Report Moderation & Governance</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lost Items Moderation</h1>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-rose-400" />
          <span>Total Logged Reports: {items.length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs p-3 rounded font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lost items by ID, title, or contact email..."
            className="saas-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="saas-input py-2 px-3 text-xs w-full sm:w-48"
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
        <div className="saas-card p-12 text-center text-xs font-mono text-zinc-500">
          Loading lost item reports...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">
          No lost items match the search query.
        </div>
      ) : (
        <div className="saas-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase">
              <tr>
                <th className="py-3 px-4">Report ID / Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Reporter Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredItems.map((item) => {
                const isHidden = item.status === 'HIDDEN';
                return (
                  <tr key={item.id} className={`hover:bg-zinc-900/40 transition-colors ${isHidden ? 'bg-rose-950/10' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-amber-400 font-bold">{item.report_id}</div>
                      <div className="font-semibold text-white truncate max-w-xs">{item.title}</div>
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-300">
                      {item.category}
                    </td>

                    <td className="py-3 px-4 text-zinc-300 truncate max-w-xs">
                      {item.location}
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {item.contact_email}
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        item.status === 'HIDDEN' ? 'bg-rose-950/60 text-rose-300 border-rose-900/80' :
                        item.status === 'RETURNED' ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60' :
                        item.status === 'MATCHED' ? 'bg-blue-950/40 text-blue-300 border-blue-900/60' :
                        'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      {isHidden ? (
                        <button
                          onClick={() => openModerationModal(item, 'REPORTED')}
                          className="saas-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 hover:text-emerald-400"
                        >
                          <Eye className="w-3.5 h-3.5" /> Unhide Report
                        </button>
                      ) : (
                        <button
                          onClick={() => openModerationModal(item, 'HIDDEN')}
                          className="saas-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 hover:text-rose-400"
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
          <div className="saas-card max-w-md w-full p-6 space-y-5 bg-[#121215] border-zinc-700">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white tracking-tight">Moderate Lost Report</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 text-xs font-mono space-y-1">
              <div><span className="text-zinc-500">Report ID:</span> <span className="text-amber-400 font-bold">{selectedItem.report_id}</span></div>
              <div><span className="text-zinc-500">Title:</span> <span className="text-white">{selectedItem.title}</span></div>
              <div><span className="text-zinc-500">Target Action:</span> <span className="text-rose-300 font-bold uppercase">{targetStatus}</span></div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Moderation Reason *</label>
                <select
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="saas-input w-full py-2 px-3 text-xs"
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
                <label className="block text-xs font-medium text-zinc-300 mb-1">Admin Audit Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Additional context recorded in administrative audit logs..."
                  className="saas-input w-full p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button onClick={() => setSelectedItem(null)} className="saas-button-secondary text-xs py-1.5 px-3">
                Cancel
              </button>
              <button
                onClick={handleApplyModeration}
                className="saas-button-primary text-xs py-1.5 px-4 bg-rose-600 hover:bg-rose-500"
              >
                Apply Moderation Status
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

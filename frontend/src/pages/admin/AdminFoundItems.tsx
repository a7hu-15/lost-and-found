import React, { useEffect, useState } from 'react';
import { CheckSquare, Search, Eye, EyeOff, CheckCircle2, ShieldAlert, X, MapPin } from 'lucide-react';
import api from '../../services/api';
import { FoundItem, ItemStatus } from '../../types';

export const AdminFoundItems: React.FC = () => {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Moderation Modal state
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
  const [targetStatus, setTargetStatus] = useState<ItemStatus>('HIDDEN');
  const [moderationReason, setModerationReason] = useState('Inappropriate Content');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/found-items');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch found items for admin', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModerationModal = (item: FoundItem, status: ItemStatus) => {
    setSelectedItem(item);
    setTargetStatus(status);
    setModerationReason(status === 'HIDDEN' ? 'Inappropriate Content' : 'Status Update');
    setAdminNotes('');
  };

  const handleApplyModeration = async () => {
    if (!selectedItem) return;

    try {
      await api.patch(`/admin/found-items/${selectedItem.id}/status`, {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wider font-bold">Inventory & Physical Storage</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Found Items Moderation</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-500" />
          <span>Total Turned-In Items: {items.length}</span>
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
            placeholder="Search found items by ID, title, or finder email..."
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
          Loading turned-in item inventory...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          No found items match the search query.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--admin-surface-subtle)] border-b border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)] uppercase">
              <tr>
                <th className="py-3 px-4">Report ID / Title</th>
                <th className="py-3 px-4">Holding Storage Location</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Finder Email</th>
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
                      <div className="font-semibold text-[var(--admin-text-primary)] truncate max-w-xs">{item.title}</div>
                    </td>

                    <td className="py-3 px-4 text-[var(--admin-text-secondary)]">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-xs font-semibold text-[var(--admin-text-primary)]">{item.storage_location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--admin-text-secondary)]">
                      {item.category}
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--admin-text-muted)]">
                      {item.contact_email}
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
                          onClick={() => openModerationModal(item, 'REPORTED')}
                          className="admin-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 hover:text-emerald-500"
                        >
                          <Eye className="w-3.5 h-3.5" /> Unhide Report
                        </button>
                      ) : (
                        <button
                          onClick={() => openModerationModal(item, 'HIDDEN')}
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
                <h3 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Moderate Found Item</h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[var(--admin-surface-subtle)] p-3 rounded border border-[var(--admin-border)] text-xs font-mono space-y-1">
              <div><span className="text-[var(--admin-text-muted)]">Report ID:</span> <span className="text-amber-500 font-bold">{selectedItem.report_id}</span></div>
              <div><span className="text-[var(--admin-text-muted)]">Title:</span> <span className="text-[var(--admin-text-primary)] font-semibold">{selectedItem.title}</span></div>
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

    </div>
  );
};

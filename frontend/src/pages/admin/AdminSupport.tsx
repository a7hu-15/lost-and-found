import React, { useEffect, useState } from 'react';
import { HelpCircle, Search, CheckCircle, Clock, MessageSquare, AlertCircle, Send, X } from 'lucide-react';
import api from '../../services/api';
import { SupportTicket, TicketStatus } from '../../types';

export const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected ticket for admin notes modal/view
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/support-tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to load support tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus, notes?: string) => {
    try {
      await api.patch(`/admin/support-tickets/${ticketId}/status`, {
        status: newStatus,
        admin_notes: notes !== undefined ? notes : adminNotes
      });

      setActionMessage(`Support Ticket status updated to ${newStatus}`);
      setSelectedTicket(null);
      fetchTickets();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update support ticket.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-blue-500 uppercase tracking-wider font-bold">User Assistance & Inquiries</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Support Ticket Center</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <span>Open Tickets: {tickets.filter(t => t.status === 'OPEN').length}</span>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs p-3 rounded font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
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
            placeholder="Search support tickets by Ticket ID, sender, email, or subject..."
            className="admin-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="admin-input py-2 px-3 text-xs w-full sm:w-48"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading support tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          No support tickets match the search query.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="admin-card p-5 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--admin-border)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">{ticket.ticket_id}</span>
                    <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">• {new Date(ticket.created_at).toLocaleString()}</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--admin-text-primary)] mt-0.5">{ticket.subject}</h3>
                </div>

                <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-bold self-start sm:self-center ${
                  ticket.status === 'OPEN' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' :
                  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                }`}>
                  {ticket.status}
                </span>
              </div>

              {/* Sender Details - High Contrast */}
              <div className="bg-[var(--admin-surface-subtle)] p-4 rounded-md border border-[var(--admin-border)] text-xs space-y-3 font-sans">
                <div className="flex flex-wrap gap-4 text-[var(--admin-text-secondary)] border-b border-[var(--admin-border)] pb-2 font-mono">
                  <div>Sender: <strong className="text-[var(--admin-text-primary)]">{ticket.name}</strong></div>
                  <div>Email: <strong className="text-[var(--admin-text-primary)]">{ticket.email}</strong></div>
                  {ticket.ip_address && <div>IP: <span className="text-[var(--admin-text-muted)]">{ticket.ip_address}</span></div>}
                </div>

                <div>
                  <span className="text-[var(--admin-text-muted)] block text-[10px] font-mono uppercase font-bold mb-1">MESSAGE CONTENT:</span>
                  <p className="text-[var(--admin-text-primary)] font-medium text-xs leading-relaxed whitespace-pre-line bg-[var(--admin-surface)] p-3 rounded border border-[var(--admin-border)]">
                    {ticket.message}
                  </p>
                </div>

                {ticket.admin_notes && (
                  <div className="pt-2 border-t border-[var(--admin-border)]">
                    <span className="text-amber-600 dark:text-amber-400 block text-[10px] font-mono uppercase font-bold">ADMIN RESOLUTION NOTES:</span>
                    <p className="text-[var(--admin-text-primary)] font-medium text-xs mt-0.5">{ticket.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Status Update Actions - Crisp Buttons */}
              <div className="flex flex-wrap gap-2 justify-end pt-1">
                {ticket.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleUpdateTicketStatus(ticket.id, 'IN_PROGRESS')}
                    className="admin-button-secondary text-xs py-1.5 px-3 hover:text-amber-500"
                  >
                    Mark In Progress
                  </button>
                )}
                {ticket.status !== 'RESOLVED' && (
                  <button
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setAdminNotes(ticket.admin_notes || '');
                    }}
                    className="admin-btn-success text-xs py-2 px-4"
                  >
                    Resolve Ticket
                  </button>
                )}
                {ticket.status === 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateTicketStatus(ticket.id, 'OPEN')}
                    className="admin-button-secondary text-xs py-1.5 px-3 hover:text-rose-500"
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Resolution Notes Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Resolve Support Ticket</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[var(--admin-surface-subtle)] p-3 rounded border border-[var(--admin-border)] text-xs font-mono">
              <div>Ticket ID: <span className="text-amber-500 font-bold">{selectedTicket.ticket_id}</span></div>
              <div>Subject: <span className="text-[var(--admin-text-primary)] font-semibold">{selectedTicket.subject}</span></div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Resolution Notes / Action Taken</label>
              <textarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Describe how the user inquiry was addressed or resolved..."
                className="admin-input w-full p-2.5 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
              <button onClick={() => setSelectedTicket(null)} className="admin-button-secondary text-xs py-1.5 px-3">
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'RESOLVED', adminNotes)}
                className="admin-btn-success text-xs py-1.5 px-4"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

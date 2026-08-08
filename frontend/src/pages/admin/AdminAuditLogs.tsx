import React, { useEffect, useState } from 'react';
import { Activity, Search, Shield, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import api from '../../services/api';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs?limit=100');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      (log.user_id && log.user_id.toLowerCase().includes(q)) ||
      JSON.stringify(log.details).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider font-bold">Compliance & Security Trail</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Administrative Audit Logs</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span>Total Audit Records: {logs.length}</span>
        </div>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--admin-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by action type, resource, user ID, or payload details..."
          className="admin-input w-full pl-9 pr-3 py-2 text-xs"
        />
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading system audit logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          No audit records match the filter query.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--admin-surface-subtle)] border-b border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)] uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4 text-right">Payload Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)] font-mono">
              {filteredLogs.map((log) => {
                const isExpanded = expandedId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(isExpanded ? null : log.id)}
                      className="hover:bg-[var(--admin-surface-subtle)] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 text-[var(--admin-text-muted)] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--admin-text-primary)] uppercase text-[11px] font-semibold">
                        {log.resource}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--admin-text-muted)] text-[11px]">
                        {log.ip_address || '127.0.0.1'}
                      </td>

                      <td className="py-3.5 px-4 text-right text-[var(--admin-text-secondary)]">
                        <button className="inline-flex items-center gap-1 text-[11px] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] font-semibold">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          {isExpanded ? 'Hide Payload' : 'View Payload'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable JSON details row */}
                    {isExpanded && (
                      <tr className="bg-[var(--admin-surface-subtle)] border-b border-[var(--admin-border)]">
                        <td colSpan={5} className="p-4">
                          <div className="bg-[var(--admin-surface)] p-4 rounded border border-[var(--admin-border)] space-y-2">
                            <div className="flex items-center gap-2 text-[10px] text-[var(--admin-text-muted)] uppercase border-b border-[var(--admin-border)] pb-2 font-mono">
                              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Audit Log ID: {log.id} • User ID: {log.user_id || 'SYSTEM_ANONYMOUS'}</span>
                            </div>
                            <pre className="text-xs text-[var(--admin-text-primary)] font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed bg-[var(--admin-surface-subtle)] p-3 rounded border border-[var(--admin-border)] font-semibold">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

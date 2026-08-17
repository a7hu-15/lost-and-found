import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle, Clock, FileText, Users, HelpCircle,
  BarChart2, ArrowUpRight, Activity, Tag, CheckSquare
} from 'lucide-react';
import api from '../../services/api';
import { DashboardStats, AuditLog, TrendDataPoint } from '../../types';

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes, trendsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/audit-logs?limit=8'),
        api.get('/admin/analytics/trends')
      ]);
      setStats(statsRes.data);
      setAuditLogs(logsRes.data);
      setTrends(trendsRes.data?.trends || []);
    } catch (err) {
      console.error('Failed to fetch admin overview data', err);
    } finally {
      setLoading(false);
    }
  };

  const maxVal = Math.max(1, ...trends.map(t => Math.max(t.lost_count, t.found_count)));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">Internal Security & Administration</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">System Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/claims" className="admin-button-secondary text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            Review Claims
          </Link>
          <Link to="/admin/support" className="admin-button-primary text-xs flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Support Tickets
          </Link>
        </div>
      </div>

      {loading || !stats ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading system metrics & analytics...
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="admin-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[var(--admin-text-muted)] text-[11px] font-mono uppercase">
                <span>Pending Claims</span>
                <Shield className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-500">{stats.pending_claims}</div>
              <p className="text-[10px] text-[var(--admin-text-muted)]">Awaiting security staff verification</p>
            </div>

            <div className="admin-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[var(--admin-text-muted)] text-[11px] font-mono uppercase">
                <span>Open Support Tickets</span>
                <HelpCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-500">{stats.open_support_tickets || 0}</div>
              <p className="text-[10px] text-[var(--admin-text-muted)]">User inquiries in queue</p>
            </div>

            <div className="admin-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[var(--admin-text-muted)] text-[11px] font-mono uppercase">
                <span>Total Lost Reports</span>
                <FileText className="w-4 h-4 text-[var(--admin-text-secondary)]" />
              </div>
              <div className="text-2xl font-bold text-[var(--admin-text-primary)]">{stats.total_lost}</div>
              <p className="text-[10px] text-[var(--admin-text-muted)]">Registered lost items</p>
            </div>

            <div className="admin-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-[var(--admin-text-muted)] text-[11px] font-mono uppercase">
                <span>Total Found Items</span>
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-500">{stats.total_found}</div>
              <p className="text-[10px] text-[var(--admin-text-muted)]">Logged to campus storage</p>
            </div>

          </div>

          {/* Analytics Trend Chart & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 14-Day Activity Bar Chart */}
            <div className="lg:col-span-2 admin-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                  <h2 className="text-sm font-semibold text-[var(--admin-text-primary)] tracking-tight">14-Day Activity Trend</h2>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                    <span className="text-[var(--admin-text-secondary)]">Lost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    <span className="text-[var(--admin-text-secondary)]">Found</span>
                  </div>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-44 flex items-end justify-between gap-1 pt-4 px-2">
                {trends.map((t) => {
                  const lostPct = Math.round((t.lost_count / maxVal) * 100);
                  const foundPct = Math.round((t.found_count / maxVal) * 100);
                  const dateShort = t.date.slice(5);
                  return (
                    <div key={t.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-0.5 h-32">
                        <div
                          style={{ height: `${Math.max(6, lostPct)}%` }}
                          className="w-1.5 sm:w-2.5 bg-rose-500/80 group-hover:bg-rose-400 rounded-t transition-all"
                          title={`${t.date}: ${t.lost_count} Lost`}
                        />
                        <div
                          style={{ height: `${Math.max(6, foundPct)}%` }}
                          className="w-1.5 sm:w-2.5 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                          title={`${t.date}: ${t.found_count} Found`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-[var(--admin-text-muted)] truncate">{dateShort}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="admin-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--admin-border)] pb-3">
                <Tag className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                <h2 className="text-sm font-semibold text-[var(--admin-text-primary)] tracking-tight">Category Distribution</h2>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {Object.entries(stats.status_distribution || {}).length === 0 ? (
                  <div className="text-[var(--admin-text-muted)] text-center py-6">No items logged yet</div>
                ) : (
                  Object.entries(stats.status_distribution || {}).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between items-center bg-[var(--admin-surface-subtle)] p-2.5 rounded border border-[var(--admin-border)]">
                      <span className="text-[var(--admin-text-primary)] font-sans">{cat}</span>
                      <span className="text-[var(--admin-text-primary)] font-bold bg-[var(--admin-surface)] px-2 py-0.5 rounded border border-[var(--admin-border)]">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Audit Log Feed */}
          <div className="admin-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--admin-text-secondary)]" />
                <h2 className="text-sm font-semibold text-[var(--admin-text-primary)] tracking-tight">Recent Administrative Audit Logs</h2>
              </div>
              <Link to="/admin/audit" className="text-xs font-mono text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] flex items-center gap-1">
                View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-[var(--admin-surface-subtle)] border border-[var(--admin-border)] text-xs font-mono gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-[var(--admin-text-muted)]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-amber-600 dark:text-amber-300 font-bold uppercase text-[10px] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-[var(--admin-text-primary)] font-sans">{log.resource}</span>
                  </div>
                  <span className="text-[var(--admin-text-muted)] text-[10px] truncate max-w-xs">{JSON.stringify(log.details)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

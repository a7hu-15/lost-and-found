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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">Internal Security & Administration</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/claims" className="saas-button-secondary text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            Review Claims
          </Link>
          <Link to="/admin/support" className="saas-button-primary text-xs flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Support Tickets
          </Link>
        </div>
      </div>

      {loading || !stats ? (
        <div className="saas-card p-12 text-center text-xs font-mono text-zinc-500">
          Loading system metrics & analytics...
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="saas-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
                <span>Pending Claims</span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-400">{stats.pending_claims}</div>
              <p className="text-[10px] text-zinc-500">Awaiting security staff verification</p>
            </div>

            <div className="saas-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
                <span>Open Support Tickets</span>
                <HelpCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats.open_support_tickets || 0}</div>
              <p className="text-[10px] text-zinc-500">User inquiries in queue</p>
            </div>

            <div className="saas-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
                <span>Total Lost Reports</span>
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.total_lost}</div>
              <p className="text-[10px] text-zinc-500">Registered lost items</p>
            </div>

            <div className="saas-card p-4 space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-[11px] font-mono uppercase">
                <span>Total Found Items</span>
                <CheckSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.total_found}</div>
              <p className="text-[10px] text-zinc-500">Logged to campus storage</p>
            </div>

          </div>

          {/* Analytics Trend Chart & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 14-Day Activity Bar Chart */}
            <div className="lg:col-span-2 saas-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-zinc-400" />
                  <h2 className="text-sm font-semibold text-white tracking-tight">14-Day Activity Trend</h2>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                    <span className="text-zinc-400">Lost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    <span className="text-zinc-400">Found</span>
                  </div>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-44 flex items-end justify-between gap-1 pt-4 px-2">
                {trends.map((t, idx) => {
                  const lostPct = Math.round((t.lost_count / maxVal) * 100);
                  const foundPct = Math.round((t.found_count / maxVal) * 100);
                  const dateShort = t.date.slice(5); // MM-DD
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
                      <span className="text-[9px] font-mono text-zinc-500 truncate">{dateShort}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="saas-card p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
                <Tag className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white tracking-tight">Category Distribution</h2>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {Object.entries(stats.category_distribution || {}).length === 0 ? (
                  <div className="text-zinc-500 text-center py-6">No items logged yet</div>
                ) : (
                  Object.entries(stats.category_distribution || {}).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between items-center bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                      <span className="text-zinc-300 font-sans">{cat}</span>
                      <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Audit Log Feed */}
          <div className="saas-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white tracking-tight">Recent Administrative Audit Logs</h2>
              </div>
              <Link to="/admin/audit" className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1">
                View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded bg-zinc-900/50 border border-zinc-800 text-xs font-mono gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="text-amber-300 font-bold uppercase text-[10px] bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-zinc-300 font-sans">{log.resource}</span>
                  </div>
                  <span className="text-zinc-500 text-[10px] truncate max-w-xs">{JSON.stringify(log.details)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

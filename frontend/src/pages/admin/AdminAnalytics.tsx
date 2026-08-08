import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, MapPin, Shield, Tag } from 'lucide-react';
import api from '../../services/api';
import { TrendDataPoint } from '../../types';

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [trends, setTrends] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, trendsRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/admin/analytics/trends')
      ]);
      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data?.trends || []);
    } catch (err) {
      console.error('Failed to load analytics', err);
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
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Metrics & Trends</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Platform Analytics & Hotspots</h1>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span>Real-time Recovery Metrics</span>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="saas-card p-12 text-center text-xs font-mono text-zinc-500">
          Loading analytics metrics...
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top Activity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="saas-card p-5 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">30-Day Lost Item Volume</span>
              <div className="text-2xl font-bold text-white">{analytics.monthly_lost_reports}</div>
              <p className="text-[10px] text-zinc-500">Reports filed by students & faculty</p>
            </div>

            <div className="saas-card p-5 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">30-Day Found Item Volume</span>
              <div className="text-2xl font-bold text-emerald-400">{analytics.monthly_found_reports}</div>
              <p className="text-[10px] text-zinc-500">Turned-in items in holding</p>
            </div>

            <div className="saas-card p-5 space-y-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">High Confidence Matches (&gt;80%)</span>
              <div className="text-2xl font-bold text-blue-400">{analytics.high_confidence_matches}</div>
              <p className="text-[10px] text-zinc-500">Automated rule engine detections</p>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-white tracking-tight">14-Day Lost vs Found Comparison</h2>
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

            <div className="h-52 flex items-end justify-between gap-2 pt-6 px-2">
              {trends.map((t) => {
                const lostPct = Math.round((t.lost_count / maxVal) * 100);
                const foundPct = Math.round((t.found_count / maxVal) * 100);
                return (
                  <div key={t.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-36">
                      <div
                        style={{ height: `${Math.max(6, lostPct)}%` }}
                        className="w-2 sm:w-4 bg-rose-500/80 group-hover:bg-rose-400 rounded-t transition-all"
                        title={`${t.date}: ${t.lost_count} Lost`}
                      />
                      <div
                        style={{ height: `${Math.max(6, foundPct)}%` }}
                        className="w-2 sm:w-4 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                        title={`${t.date}: ${t.found_count} Found`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 truncate">{t.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Hotspots */}
          <div className="saas-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Top Campus Lost Hotspots</h2>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {Object.entries(analytics.top_lost_locations || {}).length === 0 ? (
                <div className="text-zinc-500 py-4 text-center">No location hotspot data yet</div>
              ) : (
                Object.entries(analytics.top_lost_locations || {}).map(([loc, count]: any) => (
                  <div key={loc} className="flex justify-between items-center bg-zinc-900/60 p-3 rounded border border-zinc-800">
                    <span className="text-zinc-200 font-sans">{loc}</span>
                    <span className="text-amber-400 font-bold bg-zinc-800 px-2.5 py-0.5 rounded">{count} reports</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

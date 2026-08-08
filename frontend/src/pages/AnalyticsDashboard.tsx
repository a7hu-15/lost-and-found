import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, MapPin } from 'lucide-react';
import api from '../services/api';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-zinc-400" />
          Analytics
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Platform recovery metrics & hotspot trends</p>
      </div>

      {loading || !analytics ? (
        <div className="saas-card p-8 text-center text-zinc-500 text-xs font-mono">
          Loading metrics...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Monthly Activity */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">30-Day Activity</h2>
            </div>
            
            <div className="space-y-2 font-mono text-xs pt-1">
              <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-400">Monthly Lost Reports</span>
                <span className="font-bold text-white">{analytics.monthly_lost_reports}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-400">Monthly Found Items</span>
                <span className="font-bold text-white">{analytics.monthly_found_reports}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-400">High Confidence Matches (&gt;80%)</span>
                <span className="font-bold text-white">{analytics.high_confidence_matches}</span>
              </div>
            </div>
          </div>

          {/* Top Hotspots */}
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-white tracking-tight">Top Lost Locations</h2>
            </div>

            <div className="space-y-2 font-mono text-xs pt-1">
              {Object.entries(analytics.top_lost_locations || {}).map(([loc, count]: any) => (
                <div key={loc} className="flex justify-between items-center bg-zinc-900 p-2.5 rounded border border-zinc-800">
                  <span className="text-zinc-300">{loc}</span>
                  <span className="text-white font-semibold">{count} items</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

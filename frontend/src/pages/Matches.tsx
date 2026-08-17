import React, { useEffect, useState } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { MatchScore } from '../types';
import { SimilarityMeter } from '../components/SimilarityMeter';
import { useNavigate } from 'react-router-dom';

export const Matches: React.FC = () => {
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await api.get('/matches?min_score=50.0');
      setMatches(res.data);
    } catch (err) {
      console.error('Failed to load matches', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateClaim = (match: MatchScore) => {
    if (match.found_item) {
      navigate('/claims', { state: { foundItem: match.found_item, matchId: match.id } });
    }
  };

  return (
    <div className="space-y-6 py-4">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-zinc-400" />
          Matching Engine
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Automated multi-attribute similarity scoring comparing lost and found items.
        </p>
      </div>

      {loading ? (
        <div className="saas-card p-12 text-center text-xs font-mono text-zinc-500">
          Calculating match matrix...
        </div>
      ) : matches.length === 0 ? (
        <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">
          No automated matches found exceeding confidence threshold (50%).
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="saas-card p-5 space-y-4">
              
              {/* Header Match Meter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <SimilarityMeter score={match.similarity_score} breakdown={match.breakdown_json} />
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800 self-start sm:self-center">
                  Match Score #{match.id.slice(0, 8)}
                </span>
              </div>

              {/* Side by Side Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Lost Item Side */}
                <div className="bg-zinc-900/60 p-3.5 rounded border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider block">
                    Reported Lost
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    {match.lost_item?.item_name || 'Lost Item'}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {match.lost_item?.description}
                  </p>
                  <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                    <div>Brand: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.lost_item?.brand || 'N/A'}</span></div>
                    <div>Location: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.lost_item?.location}</span></div>
                    <div>Date: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.lost_item?.lost_date}</span></div>
                  </div>
                </div>

                {/* Found Item Side */}
                <div className="bg-zinc-900/60 p-3.5 rounded border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    Discovered Found
                  </span>
                  <h4 className="text-sm font-semibold text-white">
                    {match.found_item?.item_name || 'Found Item'}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {match.found_item?.description}
                  </p>
                  <div className="text-[11px] text-zinc-400 space-y-0.5 font-mono">
                    <div>Brand: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.found_item?.brand || 'N/A'}</span></div>
                    <div>Location: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.found_item?.location}</span></div>
                    <div>Holding: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.found_item?.storage_location}</span></div>
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                <span className="text-xs font-mono text-zinc-400">
                  Status: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{match.status}</span>
                </span>

                <button
                  onClick={() => handleInitiateClaim(match)}
                  className="saas-button-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  Initiate Claim <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

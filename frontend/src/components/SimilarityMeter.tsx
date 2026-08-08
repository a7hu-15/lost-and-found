import React from 'react';

interface SimilarityMeterProps {
  score: number;
  breakdown?: Record<string, number>;
}

export const SimilarityMeter: React.FC<SimilarityMeterProps> = ({ score, breakdown }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-zinc-400">Match Confidence</span>
        <span className="font-bold text-white bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
          {score}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {breakdown && (
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono text-zinc-400">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 flex justify-between capitalize">
              <span>{key}:</span>
              <span className="text-zinc-200 font-medium">{val}pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-[#09090b] py-6 mt-16 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3">
        
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-300">Lost & Found</span>
          <span>•</span>
          <span>Campus Item Recovery System</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            System Operational
          </span>
          <span>FastAPI • PostgreSQL • Redis</span>
        </div>

      </div>
    </footer>
  );
};

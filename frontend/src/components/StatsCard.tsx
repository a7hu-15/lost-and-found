import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  gradient?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend }) => {
  return (
    <div className="saas-card p-4 flex items-center justify-between">
      <div>
        <div className="text-xs font-medium text-zinc-400 mb-1">{title}</div>
        <div className="text-2xl font-bold text-white font-mono tracking-tight">{value}</div>
        {trend && <div className="text-[11px] text-zinc-500 mt-1 font-mono">{trend}</div>}
      </div>

      <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
        {icon}
      </div>
    </div>
  );
};

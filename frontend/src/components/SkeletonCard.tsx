import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="saas-card p-4 flex flex-col justify-between space-y-4 animate-pulse">
      <div>
        {/* Thumbnail Skeleton */}
        <div className="w-full h-36 rounded-md bg-zinc-800/60 mb-3" />

        {/* Badge Skeleton */}
        <div className="w-20 h-4 rounded bg-zinc-800/60 mb-2" />

        {/* Title Skeleton */}
        <div className="w-3/4 h-5 rounded bg-zinc-800/80 mb-2" />

        {/* Location Skeleton */}
        <div className="w-1/2 h-3 rounded bg-zinc-800/60" />
      </div>

      {/* Action Footer Skeleton */}
      <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="w-24 h-4 rounded bg-zinc-800/60" />
      </div>
    </div>
  );
};

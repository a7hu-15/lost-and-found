import React from 'react';
import { MapPin, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { LostItem, FoundItem } from '../types';

interface ItemCardProps {
  item: LostItem | FoundItem;
  type: 'lost' | 'found';
  onClaim?: () => void;
  onViewDetails?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, type, onViewDetails }) => {
  const isLost = type === 'lost';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return { label: 'Searching', class: 'bg-amber-950/40 text-amber-300 border-amber-900/50' };
      case 'MATCHED':
        return { label: 'Possible Match', class: 'bg-blue-950/40 text-blue-300 border-blue-900/50' };
      case 'CLAIMED':
        return { label: 'Verification in Progress', class: 'bg-purple-950/40 text-purple-300 border-purple-900/50' };
      case 'RETURNED':
        return { label: 'Returned', class: 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50' };
      default:
        return { label: status, class: 'bg-zinc-900 text-zinc-400 border-zinc-800' };
    }
  };

  const badge = getStatusBadge(item.status);

  return (
    <div
      onClick={onViewDetails}
      className="saas-card p-4 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all cursor-pointer group"
    >
      <div>
        {/* Top Image or Placeholder */}
        {(item.thumbnail_url || item.image_url) ? (
          <div className="w-full h-40 rounded-md overflow-hidden mb-3 bg-zinc-900 border border-zinc-800/80">
            <img
              src={item.thumbnail_url || item.image_url}
              alt={item.item_name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="w-full h-28 rounded-md mb-3 bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-600 text-xs font-mono gap-1.5">
            <ImageIcon className="w-4 h-4 text-zinc-700" />
            No Image Provided
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-2">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wider ${badge.class}`}>
            {badge.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
          {item.item_name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 font-mono">
          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-medium group-hover:text-white transition-colors flex items-center gap-1">
          View Details <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </span>
      </div>
    </div>
  );
};

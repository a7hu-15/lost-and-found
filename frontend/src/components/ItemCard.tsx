import React from 'react';
import { MapPin, Calendar, ArrowUpRight, ArrowRight, Shield, Tag, Image as ImageIcon, Search } from 'lucide-react';
import { LostItem, FoundItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface ItemCardProps {
  item: LostItem | FoundItem;
  type: 'lost' | 'found';
  onClaim?: () => void;
  onViewDetails?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, type, onClaim, onViewDetails }) => {
  const navigate = useNavigate();
  const isLost = type === 'lost';
  const lostItem = item as LostItem;
  const foundItem = item as FoundItem;

  const dateStr = isLost ? lostItem.lost_date : foundItem.found_date;

  return (
    <div className="saas-card p-4 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors">
      
      <div>
        {/* Top Image or Placeholder Badge */}
        {(item.thumbnail_url || item.image_url) ? (
          <div className="w-full h-36 rounded overflow-hidden mb-3 bg-zinc-900 border border-zinc-800">
            <img src={item.thumbnail_url || item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-24 rounded mb-3 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs font-mono gap-1">
            <ImageIcon className="w-4 h-4 text-zinc-700" />
            No Photo Provided
          </div>
        )}

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
            isLost 
              ? 'bg-rose-950/30 text-rose-300 border-rose-900/50' 
              : 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50'
          }`}>
            {isLost ? 'Lost' : 'Found'}
          </span>
          
          <span className="text-[11px] text-zinc-400 font-mono">
            {item.report_id}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-white mb-1">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
          {item.description}
        </p>

        {/* Metadata */}
        <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>Category: {item.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>{dateStr}</span>
          </div>
          {!isLost && (
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-zinc-500" />
              Holding: {foundItem.storage_location}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400">
          Status: <span className="text-zinc-200">{item.status}</span>
        </span>

        {isLost ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/report-found', { state: { linkedLostItem: lostItem } });
            }}
            className="saas-button-primary text-xs py-1 px-2.5 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500"
          >
            I Found This Item <ArrowUpRight className="w-3 h-3" />
          </button>
        ) : (
          item.status !== 'CLAIMED' && item.status !== 'RETURNED' && onClaim && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClaim();
              }}
              className="saas-button-secondary text-xs py-1 px-2.5 flex items-center gap-1"
            >
              Claim Item <ArrowRight className="w-3 h-3" />
            </button>
          )
        )}
      </div>

    </div>
  );
};

import React from 'react';
import { X, MapPin, Calendar, Shield, Tag, ArrowUpRight, Image as ImageIcon } from 'lucide-react';
import { LostItem, FoundItem } from '../types';
import { useNavigate } from 'react-router-dom';

interface ItemDetailsModalProps {
  item: LostItem | FoundItem | null;
  type: 'lost' | 'found';
  onClose: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ item, type, onClose }) => {
  const navigate = useNavigate();
  if (!item) return null;

  const isLost = type === 'lost';
  const lostItem = item as LostItem;
  const foundItem = item as FoundItem;
  const dateStr = isLost ? lostItem.lost_date : foundItem.found_date;

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="saas-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-full border border-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
            isLost 
              ? 'bg-rose-950/30 text-rose-300 border-rose-900/50' 
              : 'bg-emerald-950/30 text-emerald-300 border-emerald-900/50'
          }`}>
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.class}`}>
            {badge.label}
          </span>

          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {item.report_id}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>

        {/* Main Large Image */}
        {item.image_url ? (
          <div className="w-full h-64 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 font-mono text-xs gap-1.5">
            <ImageIcon className="w-5 h-5 text-zinc-700" />
            No Image Available
          </div>
        )}

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase block">Category</span>
            <span className="text-zinc-200 font-semibold">{item.category}</span>
          </div>

          <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase block">Location</span>
            <span className="text-zinc-200 font-semibold truncate block">{item.location}</span>
          </div>

          <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase block">Date {isLost ? 'Lost' : 'Found'}</span>
            <span className="text-zinc-200 font-semibold">{dateStr}</span>
          </div>

          <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 space-y-0.5">
            <span className="text-zinc-500 text-[10px] uppercase block">Status</span>
            <span className="text-zinc-200 font-semibold">{badge.label}</span>
          </div>
        </div>

        {!isLost && (
          <div className="bg-zinc-900/80 p-3 rounded border border-zinc-800 text-xs font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-zinc-500 text-[10px] uppercase block">Campus Storage Location</span>
              <span className="text-zinc-200 font-medium">{foundItem.storage_location}</span>
            </div>
          </div>
        )}

        {/* Full Description */}
        <div className="bg-zinc-900/80 p-3.5 rounded border border-zinc-800 space-y-1">
          <span className="text-zinc-500 text-[10px] uppercase font-mono block">Description</span>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">{item.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-3">
          {!isLost && item.status !== 'CLAIMED' && item.status !== 'RETURNED' && (
            <button
              onClick={() => {
                onClose();
                navigate('/claims', { state: { foundItem: item } });
              }}
              className="saas-button-primary text-xs w-full py-2.5 flex items-center justify-center gap-1.5"
            >
              This is Mine <ArrowUpRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              navigate(`/track?report_id=${item.report_id}`);
            }}
            className="saas-button-secondary text-xs w-full py-2.5 flex items-center justify-center gap-1.5"
          >
            Track Report
          </button>
        </div>

      </div>
    </div>
  );
};

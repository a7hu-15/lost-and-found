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
        return { label: 'Searching', class: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30' };
      case 'MATCHED':
        return { label: 'Possible Match', class: 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30' };
      case 'CLAIMED':
        return { label: 'Verification in Progress', class: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30' };
      case 'RETURNED':
        return { label: 'Returned', class: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30' };
      default:
        return { label: status, class: 'bg-zinc-500/15 text-zinc-800 dark:text-zinc-300 border-zinc-500/30' };
    }
  };

  const badge = getStatusBadge(item.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="saas-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 relative animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white bg-zinc-900 dark:bg-zinc-900 rounded-full border border-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badges */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
            isLost 
              ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30' 
              : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
          }`}>
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.class}`}>
            {badge.label}
          </span>

          <span className="text-xs font-mono text-zinc-700 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-semibold">
            {item.report_id}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{item.title}</h2>

        {/* Main Large Image */}
        {item.image_url ? (
          <div className="w-full h-64 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-xs gap-1.5 font-medium">
            <ImageIcon className="w-5 h-5 text-zinc-400" />
            No Image Available
          </div>
        )}

        {/* Key Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-zinc-100/90 dark:bg-zinc-900/80 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-0.5">
            <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase block font-semibold">Category</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold block">{item.category}</span>
          </div>

          <div className="bg-zinc-100/90 dark:bg-zinc-900/80 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-0.5">
            <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase block font-semibold">Location</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate block">{item.location}</span>
          </div>

          <div className="bg-zinc-100/90 dark:bg-zinc-900/80 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-0.5">
            <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase block font-semibold">Date {isLost ? 'Lost' : 'Found'}</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold block">{dateStr}</span>
          </div>

          <div className="bg-zinc-100/90 dark:bg-zinc-900/80 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-0.5">
            <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase block font-semibold">Status</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold block">{badge.label}</span>
          </div>
        </div>

        {!isLost && (
          <div className="bg-zinc-100/90 dark:bg-zinc-900/80 p-3 rounded border border-zinc-200 dark:border-zinc-800 text-xs font-mono flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase block font-semibold">Campus Storage Location</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold block">{foundItem.storage_location}</span>
            </div>
          </div>
        )}

        {/* Full Description */}
        <div className="bg-zinc-100/90 dark:bg-zinc-900/80 p-3.5 rounded border border-zinc-200 dark:border-zinc-800 space-y-1">
          <span className="text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-mono block font-semibold">Description</span>
          <p className="text-xs text-zinc-900 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-medium">{item.description}</p>
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

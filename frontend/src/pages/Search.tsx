import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
import api from '../services/api';
import { LostItem, FoundItem } from '../types';
import { ItemCard } from '../components/ItemCard';
import { ImageUploader } from '../components/ImageUploader';
import { ItemDetailsModal } from '../components/ItemDetailsModal';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('');
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');

  const [selectedModalItem, setSelectedModalItem] = useState<{ item: LostItem | FoundItem; type: 'lost' | 'found' } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (color) params.append('color', color);

      const res = await api.get(`/search?${params.toString()}`);
      setLostItems(res.data.lost_items);
      setFoundItems(res.data.found_items);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIDetectSearch = (detected: { category: string; brand: string; color: string }) => {
    if (detected.category) setCategory(detected.category);
    if (detected.color) setColor(detected.color);
    if (detected.brand) setQuery(detected.brand);
    handleSearch();
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="space-y-6 py-4">
      
      {/* Item Details Modal */}
      {selectedModalItem && (
        <ItemDetailsModal
          item={selectedModalItem.item}
          type={selectedModalItem.type}
          onClose={() => setSelectedModalItem(null)}
        />
      )}

      {/* Search Header Form */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Search Directory</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Search lost and found items by keywords or image match</p>
          </div>

          <div className="flex gap-1 bg-zinc-900 p-1 rounded border border-zinc-800 text-xs">
            <button
              onClick={() => setSearchMode('text')}
              className={`px-3 py-1 rounded font-medium ${searchMode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
            >
              Text Search
            </button>
            <button
              onClick={() => setSearchMode('image')}
              className={`px-3 py-1 rounded font-medium flex items-center gap-1 ${searchMode === 'image' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
            >
              <Sparkles className="w-3 h-3 text-blue-400" /> Image Search
            </button>
          </div>
        </div>

        {searchMode === 'image' ? (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-300">Upload item image to find visually similar reports</label>
            <ImageUploader
              onImageChange={() => {}}
              onAIDetect={handleAIDetectSearch}
            />
          </div>
        ) : (
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <SearchIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keyword (e.g. Wallet, iPhone, Library)..."
                className="saas-input w-full py-2 pl-9 pr-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="saas-input w-full py-1.5 px-2 text-xs"
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Wallet">Wallet / Purse</option>
                  <option value="Keys">Keys</option>
                  <option value="ID Card">ID Card</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Books">Books & Bags</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Library"
                  className="saas-input w-full py-1.5 px-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-400 mb-1">Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Black"
                  className="saas-input w-full py-1.5 px-2 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="saas-button-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Searching...' : 'Search Directory'}
            </button>
          </form>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight mb-3">
            Lost Reports ({lostItems.length})
          </h2>
          {lostItems.length === 0 ? (
            <div className="saas-card p-6 text-center text-xs text-zinc-500 font-mono">
              No matching lost reports.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lostItems.map((item) => (
                <div key={item.id} onClick={() => setSelectedModalItem({ item, type: 'lost' })} className="cursor-pointer">
                  <ItemCard item={item} type="lost" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight mb-3">
            Found Items ({foundItems.length})
          </h2>
          {foundItems.length === 0 ? (
            <div className="saas-card p-6 text-center text-xs text-zinc-500 font-mono">
              No matching found items.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {foundItems.map((item) => (
                <div key={item.id} onClick={() => setSelectedModalItem({ item, type: 'found' })} className="cursor-pointer">
                  <ItemCard item={item} type="found" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

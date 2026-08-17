import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { FoundItem } from '../types';
import { ItemCard } from '../components/ItemCard';

export const FoundItems: React.FC = () => {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    setLoading(true);
    try {
      const url = '/found/all';
      const res = await api.get(url);
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load found items', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = (item: FoundItem) => {
    navigate('/claims', { state: { foundItem: item } });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Found Items</h1>
          <p className="text-xs text-zinc-400">Items safely held at Security offices</p>
        </div>

        <div className="flex items-center gap-2">


          <Link to="/report-found" className="saas-button-primary text-xs py-1.5 px-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            Report Found Item
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="saas-card p-8 text-center text-zinc-500 text-xs font-mono">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="saas-card p-8 text-center text-zinc-500 text-xs font-mono">
          No found items currently listed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} type="found" onClaim={() => handleClaim(item)} />
          ))}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, Search, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-12">
      
      {/* Hero Section with Value-Focused Headline */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full border border-blue-900/60 inline-block">
          Official Campus Item Recovery
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Lost something on campus?<br />We'll help you get it back.
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          One trusted, secure platform for reporting lost items, logging found items, and coordinating verified handovers at the Campus Security Office.
        </p>
      </div>

      {/* Four Large Task Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 1. Report Lost Item */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-rose-500 hover:border-zinc-700 transition-colors">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400">Lost Something?</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">Report Lost Item</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Report in under 60 seconds. If someone turns it in, our matching engine will notify you automatically.
            </p>
          </div>
          <Link to="/report-lost" className="saas-button-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Report Lost Item
          </Link>
        </div>

        {/* 2. Report Found Item */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-emerald-500 hover:border-zinc-700 transition-colors">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">Found An Item?</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">Report Found Item</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Help someone recover their item by logging it to the Campus Security Office holding desk.
            </p>
          </div>
          <Link to="/report-found" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Report Found Item
          </Link>
        </div>

        {/* 3. Track My Report */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-blue-500 hover:border-zinc-700 transition-colors">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">Already Submitted?</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">Track My Report</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Check match confidence scores and claim status anytime using your private Report ID.
            </p>
          </div>
          <Link to="/track" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Track My Report
          </Link>
        </div>

        {/* 4. Search Directory */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-purple-500 hover:border-zinc-700 transition-colors">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">Looking For Something?</span>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1">Search Directory</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Search all reported lost and found items across campus by keyword, category, or photo.
            </p>
          </div>
          <Link to="/search" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            Search Directory
          </Link>
        </div>

      </div>

      {/* Visible "How It Works" Section */}
      <div className="saas-card p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">How It Works</h2>
          <p className="text-xs text-zinc-400">4 simple steps from lost item to verified return</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto">1</div>
            <h3 className="text-xs font-bold text-white">📄 Report</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Log lost or found item details in under 60 seconds.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto">2</div>
            <h3 className="text-xs font-bold text-white">⚙️ Match</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Rule engine compares vector attributes automatically.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto">3</div>
            <h3 className="text-xs font-bold text-white">📧 Verify</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Receive email alerts & submit ownership proof online.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto">4</div>
            <h3 className="text-xs font-bold text-white">🏢 Collect</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Verify Student ID and collect at Security Office Gate 1.</p>
          </div>

        </div>
      </div>

    </div>
  );
};

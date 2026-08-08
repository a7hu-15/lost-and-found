import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, Search, FileText, CheckCircle2, Clock, Mail, Lock } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-12">
      
      {/* Hero Section */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Lost & Found
        </h1>
        <p className="text-sm font-medium text-zinc-300">
          Helping campus items find their way home.
        </p>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Report an item in under a minute. If a matching report is found, we'll notify you automatically.
        </p>
      </div>

      {/* Four Equal Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 1. Lost Something */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-rose-500 hover:border-zinc-700 transition-all">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Lost Something?</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              We'll keep an eye out.
            </p>
          </div>
          <Link to="/report-lost" className="saas-button-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Report Lost Item
          </Link>
        </div>

        {/* 2. Found Something */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-emerald-500 hover:border-zinc-700 transition-all">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Found Something?</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Help return an item safely through the campus security office.
            </p>
          </div>
          <Link to="/report-found" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Report Found Item
          </Link>
        </div>

        {/* 3. Looking for Something */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-purple-500 hover:border-zinc-700 transition-all">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Looking for Something?</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Search reported lost and found items across campus.
            </p>
          </div>
          <Link to="/search" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            Search Items
          </Link>
        </div>

        {/* 4. Already Submitted a Report */}
        <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-blue-500 hover:border-zinc-700 transition-all">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Already Submitted a Report?</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Check your latest report status anytime.
            </p>
          </div>
          <Link to="/track" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Track Report
          </Link>
        </div>

      </div>

      {/* How It Works Section */}
      <div className="saas-card p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">How It Works</h2>
          <p className="text-xs text-zinc-400">Simple 4-step recovery process</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <FileText className="w-5 h-5 text-zinc-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Report</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Submit item details in under 60 seconds.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <Search className="w-5 h-5 text-zinc-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Match</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Rule engine compares vector attributes.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <Mail className="w-5 h-5 text-zinc-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Verify</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Receive updates & submit ownership proof.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Collect</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Verify Student ID and collect at Security Office.</p>
          </div>

        </div>
      </div>

      {/* Trust Section */}
      <div className="flex flex-wrap justify-center gap-6 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure Reports</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800">
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <span>Email Updates</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded border border-zinc-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Under 60 Seconds</span>
        </div>
      </div>

    </div>
  );
};

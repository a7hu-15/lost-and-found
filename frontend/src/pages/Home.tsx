import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Shield, Search, FileText, CheckCircle2, Clock, Mail, Lock } from 'lucide-react';
import { LogoIcon } from '../components/Logo';

export const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-md mb-1">
          <LogoIcon sizeClass="w-12 h-12" idPrefix="hero-lf" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          How can we help today?
        </h1>
        <p className="text-sm font-medium text-[#FF8A00]">
          Campus Item Recovery System
        </p>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          Report an item in under a minute. If a matching report is found, we'll notify you automatically.
        </p>
      </div>

      {/* Main Journey Options - Neutral SaaS Cards with Hover Lift */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Journey 1: I Lost Something */}
          <div className="saas-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-xl transition-all duration-200">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Report Missing</span>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">I Lost Something</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Report a missing item. We'll notify you if there's a potential match.
              </p>
            </div>
            <Link to="/report-lost" className="saas-button-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Report Lost Item
            </Link>
          </div>

          {/* Journey 2: I Found Something */}
          <div className="saas-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-xl transition-all duration-200">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Turn In Item</span>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">I Found Something</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Help return an item to its owner safely through campus security.
              </p>
            </div>
            <Link to="/report-found" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Report Found Item
            </Link>
          </div>

          {/* Journey 3: Track Report */}
          <div className="saas-card p-6 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-xl transition-all duration-200">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Check Status</span>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">I Already Submitted</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Track status or recover your lost Report ID anytime.
              </p>
            </div>
            <Link to="/track" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-[#FF8A00]" />
              Track Report
            </Link>
          </div>

        </div>
      </div>

      {/* Search Items Option */}
      <div className="saas-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-700 transition-all">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Directory Search</span>
          <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Looking to browse all reports?</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Search reported lost and found items across campus by keyword, category, or photo.</p>
        </div>
        <Link to="/search" className="saas-button-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-zinc-400" />
          Search Items
        </Link>
      </div>

      {/* How It Works Section */}
      <div className="saas-card p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">How It Works</h2>
          <p className="text-xs text-zinc-400">Simple 4-step recovery process</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-2 text-center">
            <FileText className="w-5 h-5 text-zinc-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Report</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Submit item details in under 60 seconds.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-2 text-center">
            <Search className="w-5 h-5 text-zinc-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Match</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Rule engine compares vector attributes.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-2 text-center">
            <Mail className="w-5 h-5 text-zinc-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Verify</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Receive updates & submit ownership proof.</p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-2 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
            <h3 className="text-xs font-bold text-white">Collect</h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Verify Student ID and collect at Security Office.</p>
          </div>

        </div>
      </div>

      {/* Trust Section */}
      <div className="flex flex-wrap justify-center gap-6 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
          <span>Secure Reports</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-zinc-400" />
          <span>Email Updates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span>Privacy First</span>
        </div>
      </div>

    </div>
  );
};

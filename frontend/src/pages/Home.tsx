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

      {/* Main Journey Section: What brings you here today? */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
            What brings you here today?
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Journey 1: I Lost Something */}
          <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-rose-500 hover:border-zinc-700 transition-all">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">I Lost Something</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Report a missing item. We'll notify you if there's a potential match.
              </p>
            </div>
            <Link to="/report-lost" className="saas-button-primary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Report Lost
            </Link>
          </div>

          {/* Journey 2: I Found Something */}
          <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-emerald-500 hover:border-zinc-700 transition-all">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">I Found Something</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Help return an item to its owner safely through campus security.
              </p>
            </div>
            <Link to="/report-found" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Report Found
            </Link>
          </div>

          {/* Journey 3: I Already Submitted a Report */}
          <div className="saas-card p-6 flex flex-col justify-between space-y-4 border-l-4 border-l-blue-500 hover:border-zinc-700 transition-all">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">I Already Submitted</h2>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Track report status or recover your lost Report ID anytime.
              </p>
            </div>
            <Link to="/track" className="saas-button-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Track Report
            </Link>
          </div>

        </div>
      </div>

      {/* Secondary Search Option Banner */}
      <div className="saas-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-purple-500">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400">Search Directory</span>
          <h2 className="text-base font-bold text-white tracking-tight mt-0.5">Looking to browse all reports?</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Search reported lost and found items across campus by keyword, category, or photo.</p>
        </div>
        <Link to="/search" className="saas-button-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-purple-400" />
          Search Directory
        </Link>
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

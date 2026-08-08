import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Shield, Layers, CheckCircle2, Lock } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 text-center space-y-2">
        <span className="saas-badge text-zinc-300">Campus Item Recovery Protocol</span>
        <h1 className="text-3xl font-bold text-white tracking-tight">How Lost & Found Works</h1>
        <p className="text-xs text-zinc-400 max-w-xl mx-auto">
          A secure digital middleman for campus lost and found item recovery without exposing personal contact details.
        </p>
      </div>

      {/* 4 Steps Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="saas-card p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-white">
            01
          </div>
          <h3 className="text-base font-semibold text-white">1. Report in 60 Seconds</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No account required. Submit details (title, category, location, date, description) and your email address. The system generates a private Report ID and tracking link.
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-white">
            02
          </div>
          <h3 className="text-base font-semibold text-white">2. Automated Match Scoring</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            When a matching found item is logged, our rule engine evaluates vector similarity (category 30%, brand 15%, color 15%, location 15%, date 15%, text 10%).
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-white">
            03
          </div>
          <h3 className="text-base font-semibold text-white">3. Secure Verification</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The platform sends a match notification link to your email. You review the match and answer ownership proof questions (inside contents, wallpaper, serial number).
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs flex items-center justify-center text-white">
            04
          </div>
          <h3 className="text-base font-semibold text-white">4. Verified Campus Pickup</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Security Staff verifies your proof in the Admin Panel and sends pickup instructions. Visit Security Desk Gate 1 with your Student ID to collect your item.
          </p>
        </div>

      </div>

      {/* Privacy Guarantee */}
      <div className="saas-card p-6 border-blue-900/40 bg-zinc-950 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Lock className="w-4 h-4 text-blue-400" />
          Privacy & Trusted Middleman Guarantee
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your contact email and phone number are stored encrypted and are <strong>never shared publicly</strong> with third parties or finders. All notifications and claim communications route exclusively through the Lost & Found platform.
        </p>
      </div>

    </div>
  );
};

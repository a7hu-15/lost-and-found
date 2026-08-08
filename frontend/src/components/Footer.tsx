import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#09090b] py-10 mt-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Help Banner Section */}
        <div className="saas-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              Need Help?
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
              Having trouble with your report or noticed an issue?
            </h3>
          </div>

          <Link
            to="/support"
            className="saas-button-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5 shrink-0"
          >
            Contact Support <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Footer Bottom Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/60 pt-6 text-xs text-zinc-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} Lost &amp; Found. Campus Item Recovery Platform.
          </div>

          <div className="flex items-center gap-6">
            <Link to="/how-it-works" className="hover:text-zinc-300 transition-colors">
              How It Works
            </Link>
            <Link to="/search" className="hover:text-zinc-300 transition-colors">
              Search Items
            </Link>
            <Link to="/support" className="hover:text-zinc-300 transition-colors">
              Support
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

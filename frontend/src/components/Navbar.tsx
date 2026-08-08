import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, LayoutDashboard, Shield, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#09090b]/90 border-b border-[#27272a] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="group">
          <Logo />
        </Link>

        {/* Primary Nav Links */}
        <nav className="flex items-center gap-1 text-xs">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              isActive('/') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Home
          </Link>
          <Link
            to="/report-lost"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              isActive('/report-lost') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Report Lost
          </Link>
          <Link
            to="/report-found"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              isActive('/report-found') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Report Found
          </Link>
          <Link
            to="/search"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/search') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </Link>
          <Link
            to="/track"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/track') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Track Report
          </Link>
          <Link
            to="/how-it-works"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/how-it-works') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How It Works
          </Link>
        </nav>

        {/* Authenticated Admin Badge Only */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <Link
              to="/admin"
              className="saas-button-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400" />
              Admin
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-md transition-colors"
              title="Log Out Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

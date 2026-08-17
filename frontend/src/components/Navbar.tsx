import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, LayoutDashboard, Shield, HelpCircle } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isLight = theme === 'light';

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-sm transition-colors duration-150 ${
        isLight
          ? 'bg-[#F8F8F6]/90 border-b border-zinc-200 text-zinc-900'
          : 'bg-[#09090b]/90 border-b border-[#27272a] text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Master LF Logo & Brand Lockup */}
        <Link to="/" className="group shrink-0 mr-4">
          <Logo variant={isLight ? 'light' : 'dark'} />
        </Link>

        {/* Primary Nav Links */}
        <nav className="flex items-center justify-end gap-1 text-xs font-sans overflow-x-auto whitespace-nowrap hide-scrollbar flex-nowrap pr-2 w-full">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              isActive('/')
                ? isLight ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-white'
                : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Home
          </Link>

          <Link
            to="/report-lost"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              isActive('/report-lost')
                ? isLight ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-white'
                : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Report Lost
          </Link>

          <Link
            to="/report-found"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              isActive('/report-found')
                ? isLight ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-white'
                : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Report Found
          </Link>

          <Link
            to="/search"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/search')
                ? isLight ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-white'
                : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
            Search
          </Link>

          <Link
            to="/track"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/track')
                ? isLight ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-white'
                : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
            Track Report
          </Link>

          <Link
            to="/how-it-works"
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/how-it-works')
                ? isLight ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-white'
                : isLight ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`} />
            How It Works
          </Link>

        </nav>

        {/* Theme Toggle Button */}
        <div className={`shrink-0 ml-2 pl-4 border-l ${isLight ? 'border-zinc-300' : 'border-[#27272a]'}`}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

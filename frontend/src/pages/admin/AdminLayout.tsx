import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, HelpCircle, Shield, FileText,
  BarChart2, Activity, LogOut, Menu, X, CheckSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Lost Items', path: '/admin/lost', icon: FileText },
    { label: 'Found Items', path: '/admin/found', icon: CheckSquare },
    { label: 'Claims', path: '/admin/claims', icon: Shield },
    { label: 'Support', path: '/admin/support', icon: HelpCircle },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { label: 'Audit Logs', path: '/admin/audit', icon: Activity },
  ];

  return (
    <div className="min-h-screen flex bg-[#09090b] text-slate-100 font-sans">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-[#0c0c0e] shrink-0">
        
        {/* Brand Header */}
        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Logo variant="dark" />
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 font-semibold">
              Admin Console
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin User Footer Profile */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-medium text-white truncate">{user?.full_name || 'Administrator'}</div>
            <div className="text-[10px] font-mono text-zinc-500 truncate">{user?.email}</div>
            <span className="inline-block mt-1 text-[9px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/80 px-1.5 py-0.2 rounded uppercase">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out Staff Console"
            className="p-2 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Navbar Header */}
        <header className="md:hidden h-14 border-b border-zinc-800 bg-[#0c0c0e] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo variant="dark" />
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700">
              Admin
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0c0c0e] border-b border-zinc-800 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium ${
                      isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between px-3">
              <span className="text-xs font-mono text-zinc-400">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 font-medium py-1 px-2 hover:bg-zinc-900 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, HelpCircle, Shield, FileText,
  BarChart2, Activity, LogOut, Menu, X, CheckSquare, KeyRound,
  UserCheck, Settings, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isOwner, hasPermission } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true, show: true },
    { label: 'Users', path: '/admin/users', icon: Users, show: hasPermission('view_users') },
    { label: 'Lost Items', path: '/admin/lost', icon: FileText, show: hasPermission('view_lost_items') },
    { label: 'Found Items', path: '/admin/found', icon: CheckSquare, show: hasPermission('view_found_items') },
    { label: 'Claims', path: '/admin/claims', icon: Shield, show: hasPermission('view_claims') },
    { label: 'Support', path: '/admin/support', icon: HelpCircle, show: hasPermission('view_support') },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart2, show: hasPermission('view_analytics') },
    { label: 'Audit Logs', path: '/admin/audit', icon: Activity, show: hasPermission('view_audit_logs') },
  ];

  const visibleNavItems = navItems.filter((i) => i.show);
  const isLight = theme === 'light';

  return (
    <div className="min-h-screen flex bg-[var(--admin-bg)] text-[var(--admin-text-primary)] font-sans transition-colors duration-150">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[var(--admin-border)] bg-[var(--admin-surface)] shrink-0">
        
        {/* Brand Header */}
        <div className="h-16 border-b border-[var(--admin-border)] flex items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <Logo variant={isLight ? 'light' : 'dark'} />
            <span className="text-[10px] font-mono uppercase bg-[var(--admin-surface-subtle)] text-[var(--admin-text-secondary)] px-2 py-0.5 rounded border border-[var(--admin-border)] font-semibold">
              Admin
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--admin-active-bg)] text-[var(--admin-active-text)] font-semibold border border-[var(--admin-accent)]/30'
                      : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-subtle)]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Administration Owner Section */}
          {isOwner && (
            <div className="pt-4 mt-4 border-t border-[var(--admin-border)] space-y-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-muted)] block mb-1">
                Administration
              </span>
              <NavLink
                to="/admin/staff"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--admin-active-bg)] text-[var(--admin-active-text)] font-semibold border border-[var(--admin-accent)]/30'
                      : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-subtle)]'
                  }`
                }
              >
                <UserCheck className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Staff & Access</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* Admin Profile Footer */}
        <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-subtle)] flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-[var(--admin-text-primary)] truncate">{user?.full_name || 'Administrator'}</div>
            <div className="text-[10px] font-mono text-[var(--admin-text-muted)] truncate">{user?.email}</div>
            <span className="inline-block mt-1 text-[9px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded uppercase font-bold">
              {user?.role === 'ADMIN_OWNER' ? 'PLATFORM OWNER' : user?.role === 'ADMIN_STAFF' ? 'STAFF MEMBER' : user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out Staff Console"
            className="p-2 rounded-md text-[var(--admin-text-secondary)] hover:text-rose-500 hover:bg-[var(--admin-surface)] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header Bar */}
        <header className="h-14 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 sm:px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <span className="hidden sm:inline-block text-xs font-mono text-[var(--admin-text-muted)]">
              Campus Recovery Platform • Staff Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Account & Security Quick Link */}
            <NavLink
              to="/admin/account"
              className="text-xs font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] px-2.5 py-1.5 rounded-md hover:bg-[var(--admin-surface-subtle)] flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-[var(--admin-text-muted)]" />
              <span>Account & Security</span>
            </NavLink>

            {/* Theme Toggle Button */}
            <div className="pl-2 border-l border-[var(--admin-border)]">
              <ThemeToggle />
            </div>

          </div>

        </header>

        {/* Mobile Dropdown Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-[var(--admin-surface)] border-b border-[var(--admin-border)] p-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium ${
                      isActive ? 'bg-[var(--admin-active-bg)] text-[var(--admin-active-text)]' : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-subtle)]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {isOwner && (
              <NavLink
                to="/admin/staff"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-amber-500 hover:bg-[var(--admin-surface-subtle)]"
              >
                <UserCheck className="w-4 h-4" />
                <span>Staff & Access</span>
              </NavLink>
            )}

            <div className="pt-2 border-t border-[var(--admin-border)] flex items-center justify-between px-3">
              <span className="text-xs font-mono text-[var(--admin-text-muted)]">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-500 font-medium py-1 px-2 hover:bg-[var(--admin-surface-subtle)] rounded"
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

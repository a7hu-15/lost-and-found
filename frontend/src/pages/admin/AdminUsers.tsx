import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, AlertCircle, CheckCircle, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminUsers: React.FC = () => {
  const { user: currentUser, isOwner } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (targetUserId === currentUser?.id) {
      setErrorMessage('Self-protection enabled: You cannot modify or demote your own owner role.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    try {
      await api.patch(`/admin/users/${targetUserId}/role`, { role: newRole });
      setActionMessage(`User role successfully updated to ${newRole}`);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update user role');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const handleStatusToggle = async (targetUserId: string, currentStatus: boolean) => {
    if (targetUserId === currentUser?.id) {
      setErrorMessage('Self-protection enabled: You cannot deactivate your own account.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    try {
      await api.patch(`/admin/users/${targetUserId}/status`, { is_active: !currentStatus });
      setActionMessage(`User account status updated to ${!currentStatus ? 'Active' : 'Deactivated'}`);
      fetchUsers();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update user status');
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-blue-500 uppercase tracking-wider">Identity & Access Control</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">User Directory</h1>
        </div>
        <div className="text-xs font-mono text-[var(--admin-text-secondary)] bg-[var(--admin-surface-subtle)] px-3 py-1.5 rounded border border-[var(--admin-border)] flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <span>Total Registered Users: {users.length}</span>
        </div>
      </div>

      {/* Action Notices */}
      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--admin-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email address..."
            className="admin-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="admin-input py-2 px-3 text-xs w-full sm:w-48"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN_OWNER">ADMIN_OWNER</option>
          <option value="ADMIN_STAFF">ADMIN_STAFF</option>
          <option value="USER">USER</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="admin-card p-8 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          No users match the search criteria.
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--admin-surface-subtle)] border-b border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)] uppercase">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-[var(--admin-surface-subtle)] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[var(--admin-text-primary)] flex items-center gap-1.5">
                        {u.full_name}
                        {isSelf && (
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded border border-amber-500/30">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--admin-text-muted)]">{u.email}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-[var(--admin-border)] bg-[var(--admin-surface-subtle)] text-[var(--admin-text-secondary)]">
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        u.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--admin-text-muted)]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={isSelf || !isOwner}
                        onClick={() => handleStatusToggle(u.id, u.is_active)}
                        className={`admin-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 disabled:opacity-40 ${
                          u.is_active ? 'hover:text-rose-500' : 'hover:text-emerald-500'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <UserX className="w-3.5 h-3.5" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Users, Search, Shield, AlertCircle, CheckCircle, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminUsers: React.FC = () => {
  const { user: currentUser } = useAuth();
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
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (targetUserId === currentUser?.id) {
      setErrorMessage('Self-protection enabled: You cannot modify or demote your own ADMIN role.');
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
      setErrorMessage('Self-protection enabled: You cannot deactivate your own administrative account.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider">Identity & Access Control</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span>Total Registered Users: {users.length}</span>
        </div>
      </div>

      {/* Action Notices */}
      {actionMessage && (
        <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs p-3 rounded font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3 rounded font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email address..."
            className="saas-input w-full pl-9 pr-3 py-2 text-xs"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="saas-input py-2 px-3 text-xs w-full sm:w-48"
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SECURITY_STAFF">SECURITY_STAFF</option>
          <option value="FACULTY">FACULTY</option>
          <option value="STUDENT">STUDENT</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="saas-card p-12 text-center text-xs font-mono text-zinc-500">
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="saas-card p-8 text-center text-xs font-mono text-zinc-500">
          No users match the search criteria.
        </div>
      ) : (
        <div className="saas-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        {u.full_name}
                        {isSelf && (
                          <span className="text-[9px] font-mono bg-zinc-800 text-amber-400 px-1.5 py-0.2 rounded border border-zinc-700">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">{u.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <select
                        disabled={isSelf || currentUser?.role !== 'ADMIN'}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs py-1 px-2 rounded focus:outline-none focus:border-amber-500 font-mono disabled:opacity-60"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="FACULTY">FACULTY</option>
                        <option value="SECURITY_STAFF">SECURITY_STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        u.is_active
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60'
                          : 'bg-rose-950/40 text-rose-300 border-rose-900/60'
                      }`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        disabled={isSelf || currentUser?.role !== 'ADMIN'}
                        onClick={() => handleStatusToggle(u.id, u.is_active)}
                        className={`saas-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 disabled:opacity-40 ${
                          u.is_active ? 'hover:text-rose-400' : 'hover:text-emerald-400'
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

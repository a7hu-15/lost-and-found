import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Shield, AlertCircle, CheckCircle, Lock, X, Edit2, UserX } from 'lucide-react';
import api from '../../services/api';
import { StaffMemberOut } from '../../types';
import { useAuth } from '../../context/AuthContext';

const PERMISSION_OPTIONS = [
  { key: 'view_users', label: 'View Users' },
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'view_lost_items', label: 'View Lost Reports' },
  { key: 'moderate_lost_items', label: 'Moderate Lost Reports' },
  { key: 'view_found_items', label: 'View Found Reports' },
  { key: 'moderate_found_items', label: 'Moderate Found Reports' },
  { key: 'view_claims', label: 'View Claims' },
  { key: 'manage_claims', label: 'Review & Manage Claims' },
  { key: 'view_support', label: 'View Support Tickets' },
  { key: 'manage_support', label: 'Resolve Support Tickets' },
  { key: 'view_analytics', label: 'View Analytics' },
  { key: 'view_audit_logs', label: 'View Audit Logs' },
];

export const AdminStaff: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Add Staff Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [invitePermissions, setInvitePermissions] = useState<Record<string, boolean>>({
    view_lost_items: true,
    moderate_lost_items: true,
    view_found_items: true,
    moderate_found_items: true,
    view_claims: true,
    manage_claims: true,
    view_support: true,
    manage_support: true,
    view_analytics: true,
  });

  // Edit Permissions Modal State
  const [editStaff, setEditStaff] = useState<any | null>(null);
  const [editPermissions, setEditPermissions] = useState<Record<string, boolean>>({});
  const [confirmPassword, setConfirmPassword] = useState('');

  // Revoke/Reactivate Modal State
  const [statusStaff, setStatusStaff] = useState<any | null>(null);
  const [statusTarget, setStatusTarget] = useState<boolean>(false);
  const [statusPassword, setStatusPassword] = useState('');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/staff');
      setStaffList(res.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to load staff accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.post('/admin/staff/invite', {
        full_name: fullName,
        email: email,
        permissions: invitePermissions
      });
      setActionMessage(`Staff invitation dispatched to ${email}`);
      setAddModalOpen(false);
      setFullName('');
      setEmail('');
      fetchStaff();
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to send staff invitation.');
    }
  };

  const handleSavePermissions = async () => {
    if (!editStaff || !confirmPassword) return;
    setErrorMessage('');
    try {
      await api.patch(`/admin/staff/${editStaff.id}/permissions`, {
        permissions: editPermissions,
        current_password: confirmPassword
      });
      setActionMessage(`Permissions successfully updated for ${editStaff.email}`);
      setEditStaff(null);
      setConfirmPassword('');
      fetchStaff();
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update permissions.');
    }
  };

  const handleToggleStaffStatus = async () => {
    if (!statusStaff || !statusPassword) return;
    setErrorMessage('');
    try {
      await api.patch(`/admin/staff/${statusStaff.id}/status`, {
        is_active: statusTarget,
        current_password: statusPassword
      });
      setActionMessage(`Staff access status updated to ${statusTarget ? 'ACTIVE' : 'REVOKED'} for ${statusStaff.email}`);
      setStatusStaff(null);
      setStatusPassword('');
      fetchStaff();
      setTimeout(() => setActionMessage(''), 5000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update staff access status.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--admin-border)] pb-4">
        <div>
          <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">Platform Owner Control</span>
          <h1 className="text-2xl font-bold text-[var(--admin-text-primary)] tracking-tight">Staff & Access Management</h1>
          <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">Manage personnel who can access the administrative console.</p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="admin-button-primary text-xs flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-md font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-md font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Staff Table */}
      {loading ? (
        <div className="admin-card p-12 text-center text-xs font-mono text-[var(--admin-text-muted)]">
          Loading administrative staff records...
        </div>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[var(--admin-surface-subtle)] border-b border-[var(--admin-border)] text-[11px] font-mono text-[var(--admin-text-secondary)] uppercase">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Assigned Permissions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {staffList.map((s) => {
                const isOwner = s.role === 'ADMIN_OWNER' || s.role === 'ADMIN';
                const isSelf = s.id === currentUser?.id;
                const enabledPerms = Object.entries(s.permissions || {})
                  .filter(([_, enabled]) => enabled)
                  .map(([key, _]) => key.replace('view_', '').replace('manage_', '').replace('moderate_', ''));

                return (
                  <tr key={s.id} className="hover:bg-[var(--admin-surface-subtle)] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[var(--admin-text-primary)] flex items-center gap-1.5">
                        {s.full_name}
                        {isSelf && (
                          <span className="text-[9px] font-mono bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded border border-amber-500/30">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--admin-text-muted)]">{s.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        isOwner
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}>
                        {isOwner ? 'ADMIN_OWNER' : 'ADMIN_STAFF'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isOwner ? (
                        <span className="text-[11px] font-mono text-amber-500 font-semibold">Full System Privileges</span>
                      ) : enabledPerms.length === 0 ? (
                        <span className="text-[11px] font-mono text-[var(--admin-text-muted)]">No permissions assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {enabledPerms.map((p) => (
                            <span key={p} className="text-[9px] font-mono bg-[var(--admin-surface-subtle)] text-[var(--admin-text-secondary)] px-1.5 py-0.5 rounded border border-[var(--admin-border)] uppercase">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        s.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}>
                        {s.is_active ? 'Active' : 'Revoked'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isOwner ? (
                        <span className="text-[10px] font-mono text-[var(--admin-text-muted)]">Protected (Platform Owner)</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditStaff(s);
                              setEditPermissions({ ...(s.permissions || {}) });
                              setConfirmPassword('');
                            }}
                            className="admin-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" /> Edit Permissions
                          </button>
                          <button
                            onClick={() => {
                              setStatusStaff(s);
                              setStatusTarget(!s.is_active);
                              setStatusPassword('');
                            }}
                            className={`admin-button-secondary text-xs py-1 px-2.5 inline-flex items-center gap-1 ${
                              s.is_active ? 'hover:text-rose-500' : 'hover:text-emerald-500'
                            }`}
                          >
                            <UserX className="w-3 h-3" /> {s.is_active ? 'Revoke Access' : 'Reactivate'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-card max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Invite Staff Member</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="admin-input w-full py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Staff Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff.name@university.edu"
                  className="admin-input w-full py-2 px-3 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--admin-text-secondary)] mb-2">Assigned Permissions</label>
                <div className="grid grid-cols-2 gap-2 bg-[var(--admin-surface-subtle)] p-3 rounded-md border border-[var(--admin-border)] max-h-48 overflow-y-auto">
                  {PERMISSION_OPTIONS.map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2 text-xs text-[var(--admin-text-primary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invitePermissions[opt.key] || false}
                        onChange={(e) =>
                          setInvitePermissions({
                            ...invitePermissions,
                            [opt.key]: e.target.checked
                          })
                        }
                        className="rounded border-[var(--admin-border)] text-amber-500 focus:ring-amber-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
                <button type="button" onClick={() => setAddModalOpen(false)} className="admin-button-secondary text-xs py-1.5 px-3">
                  Cancel
                </button>
                <button type="submit" className="admin-button-primary text-xs py-1.5 px-4">
                  Send Invitation Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal with Sensitive Action Re-authentication */}
      {editStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">Edit Staff Permissions</h3>
              <button onClick={() => setEditStaff(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-mono text-[var(--admin-text-secondary)]">
              Staff: <strong className="text-[var(--admin-text-primary)]">{editStaff.full_name}</strong> ({editStaff.email})
            </div>

            <div className="grid grid-cols-2 gap-2 bg-[var(--admin-surface-subtle)] p-3 rounded-md border border-[var(--admin-border)] max-h-48 overflow-y-auto">
              {PERMISSION_OPTIONS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 text-xs text-[var(--admin-text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPermissions[opt.key] || false}
                    onChange={(e) =>
                      setEditPermissions({
                        ...editPermissions,
                        [opt.key]: e.target.checked
                      })
                    }
                    className="rounded border-[var(--admin-border)] text-amber-500 focus:ring-amber-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            {/* Re-authentication password prompt */}
            <div className="pt-2 border-t border-[var(--admin-border)] space-y-1">
              <label className="block text-xs font-medium text-amber-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Re-authenticate (Enter Owner Password) *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your owner password to confirm..."
                className="admin-input w-full py-2 px-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
              <button onClick={() => setEditStaff(null)} className="admin-button-secondary text-xs py-1.5 px-3">
                Cancel
              </button>
              <button
                disabled={!confirmPassword}
                onClick={handleSavePermissions}
                className="admin-button-primary text-xs py-1.5 px-4 disabled:opacity-50"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke/Reactivate Confirmation Modal */}
      {statusStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="admin-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-3">
              <h3 className="text-base font-bold text-[var(--admin-text-primary)] tracking-tight">
                {statusTarget ? 'Reactivate Staff Access' : 'Revoke Staff Access'}
              </h3>
              <button onClick={() => setStatusStaff(null)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text-primary)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--admin-text-secondary)]">
              {statusTarget
                ? `Are you sure you want to reactivate access for ${statusStaff.full_name} (${statusStaff.email})?`
                : `Revoking access for ${statusStaff.full_name} (${statusStaff.email}) will invalidate all active sessions and block console access immediately. Historical audit records remain intact.`
              }
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-amber-500 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Re-authenticate (Enter Owner Password) *
              </label>
              <input
                type="password"
                required
                value={statusPassword}
                onChange={(e) => setStatusPassword(e.target.value)}
                placeholder="Enter your owner password..."
                className="admin-input w-full py-2 px-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--admin-border)]">
              <button onClick={() => setStatusStaff(null)} className="admin-button-secondary text-xs py-1.5 px-3">
                Cancel
              </button>
              <button
                disabled={!statusPassword}
                onClick={handleToggleStaffStatus}
                className={`admin-button-primary text-xs py-1.5 px-4 disabled:opacity-50 ${
                  statusTarget ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {statusTarget ? 'Confirm Reactivation' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

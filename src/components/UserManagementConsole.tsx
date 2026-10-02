import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, UserRole } from '../types';
import { FCTA_CADRES, FCTA_GRADE_LEVELS, getTierForGradeLevel, DIFFICULTY_TIERS } from '../data/cadresAndLevels';
import {
  getAllUsers,
  syncUsersFromFirestore,
  createUserByAdmin,
  updateUserByAdmin,
  resetUserPasswordByAdmin,
  deleteUserByAdmin,
  exportUsersCSV
} from '../services/authService';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Edit2,
  KeyRound,
  Trash2,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sparkles,
  ArrowUpDown,
  Lock,
  UserCheck,
  Building2,
  Award
} from 'lucide-react';

interface UserManagementConsoleProps {
  currentUser: UserProfile;
}

export const UserManagementConsole: React.FC<UserManagementConsoleProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [cadreFilter, setCadreFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'staffId' | 'tier' | 'date'>('date');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [resettingUser, setResettingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // Create User Form State
  const [createFullName, setCreateFullName] = useState('');
  const [createStaffId, setCreateStaffId] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('fcta2026');
  const [createRole, setCreateRole] = useState<UserRole>('candidate');
  const [createCadre, setCreateCadre] = useState(FCTA_CADRES[0].name);
  const [createGradeLevel, setCreateGradeLevel] = useState('GL 08');
  const [createMustChange, setCreateMustChange] = useState(true);

  // Edit User Form State
  const [editFullName, setEditFullName] = useState('');
  const [editStaffId, setEditStaffId] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('candidate');
  const [editCadre, setEditCadre] = useState('');
  const [editGradeLevel, setEditGradeLevel] = useState('');

  // Reset Password State
  const [newPasswordVal, setNewPasswordVal] = useState('fcta2026!');
  const [resetMustChange, setResetMustChange] = useState(true);
  const [copiedPass, setCopiedPass] = useState(false);

  const isSuperAdmin = currentUser.role === 'superadmin';

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list);
    } catch (e: any) {
      console.error(e);
      setStatusMsg({ type: 'error', text: 'Failed to load user directory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSyncFirestore = async () => {
    setSyncing(true);
    setStatusMsg(null);
    try {
      const list = await syncUsersFromFirestore();
      setUsers(list);
      setStatusMsg({
        type: 'success',
        text: `Cloud database synchronized. ${list.length} user records verified.`
      });
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Cloud sync encountered network warning.' });
    } finally {
      setSyncing(false);
    }
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        // Role filter
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        // Cadre filter
        if (cadreFilter !== 'all' && u.cadre !== cadreFilter) return false;
        // Tier filter
        if (tierFilter !== 'all' && u.difficultyTier !== Number(tierFilter)) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const inName = u.fullName.toLowerCase().includes(q);
          const inUsername = u.username.toLowerCase().includes(q);
          const inStaffId = u.staffId.toLowerCase().includes(q);
          const inEmail = u.email.toLowerCase().includes(q);
          return inName || inUsername || inStaffId || inEmail;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'staffId') return a.staffId.localeCompare(b.staffId);
        if (sortBy === 'tier') return (b.difficultyTier || 1) - (a.difficultyTier || 1);
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
  }, [users, roleFilter, cadreFilter, tierFilter, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const candidates = users.filter((u) => u.role === 'candidate').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const superadmins = users.filter((u) => u.role === 'superadmin').length;
    const cadresSet = new Set(users.map((u) => u.cadre));
    return { total, candidates, admins, superadmins, cadresCount: cadresSet.size };
  }, [users]);

  // Handle Create User Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    try {
      const created = await createUserByAdmin({
        fullName: createFullName,
        staffId: createStaffId,
        username: createUsername,
        email: createEmail,
        password: createPassword,
        role: createRole,
        cadre: createCadre,
        gradeLevel: createGradeLevel,
        mustChangePassword: createMustChange
      });

      setShowCreateModal(false);
      resetCreateForm();
      setStatusMsg({
        type: 'success',
        text: `Officer ${created.fullName} (${created.username}) registered successfully.`
      });
      loadUsers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to create user.' });
    }
  };

  const resetCreateForm = () => {
    setCreateFullName('');
    setCreateStaffId('');
    setCreateUsername('');
    setCreateEmail('');
    setCreatePassword('fcta2026');
    setCreateRole('candidate');
    setCreateCadre(FCTA_CADRES[0].name);
    setCreateGradeLevel('GL 08');
    setCreateMustChange(true);
  };

  // Open Edit Modal
  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditFullName(user.fullName);
    setEditStaffId(user.staffId);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditCadre(user.cadre);
    setEditGradeLevel(user.gradeLevel);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setStatusMsg(null);
    try {
      const updated = await updateUserByAdmin(editingUser.id, {
        fullName: editFullName.trim(),
        staffId: editStaffId.trim().toUpperCase(),
        email: editEmail.trim().toLowerCase(),
        role: editRole,
        cadre: editCadre,
        gradeLevel: editGradeLevel
      });

      setEditingUser(null);
      setStatusMsg({
        type: 'success',
        text: `Profile for ${updated.fullName} updated successfully.`
      });
      loadUsers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to update user profile.' });
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setStatusMsg(null);
    try {
      await resetUserPasswordByAdmin(resettingUser.id, newPasswordVal, resetMustChange);
      const name = resettingUser.fullName;
      setResettingUser(null);
      setStatusMsg({
        type: 'success',
        text: `Password for ${name} reset successfully to "${newPasswordVal}".`
      });
      loadUsers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to reset password.' });
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setStatusMsg(null);
    try {
      await deleteUserByAdmin(deletingUser.id);
      const name = deletingUser.fullName;
      setDeletingUser(null);
      setStatusMsg({
        type: 'success',
        text: `Account for ${name} permanently removed from registry.`
      });
      loadUsers();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Failed to delete user.' });
    }
  };

  // Generate a random temporary password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'FCTA#';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordVal(res);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportUsersCSV(filteredUsers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `FCTA_Civil_Service_User_Roster_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.setAttribute('download', `fcta_users_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Console Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Administrative User Governance
            </span>
            <span className="text-xs text-slate-400">
              Role: <strong className="text-slate-200 capitalize">{currentUser.role}</strong>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            User Management Console
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Supervise registered civil service personnel, candidates, invigilators, and administrators. Manage cadre alignments, grade levels, tiers, and credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleSyncFirestore}
            disabled={syncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 disabled:opacity-50 min-h-[40px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              resetCreateForm();
              setShowCreateModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition shrink-0 min-h-[40px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New User</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Officers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled in portal directory</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Candidates</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {stats.candidates}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Eligible CBT exam testees</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Administrators</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {stats.admins + stats.superadmins}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.superadmins} Superadmin / {stats.admins} Admins
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cadres Represented</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
            {stats.cadresCount} / 23
          </div>
          <p className="text-[11px] text-slate-500 mt-1">FCTA professional cadres</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Name, Staff ID, Username, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[38px]"
            />
          </div>

          {/* Role Filter */}
          <div className="lg:col-span-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[38px]"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="candidate">Candidates</option>
              <option value="admin">Administrators</option>
              <option value="superadmin">Super Administrators</option>
            </select>
          </div>

          {/* Cadre Filter */}
          <div className="lg:col-span-3">
            <select
              value={cadreFilter}
              onChange={(e) => setCadreFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[38px] truncate"
            >
              <option value="all">All Professional Cadres</option>
              {FCTA_CADRES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div className="lg:col-span-3">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[38px]"
            >
              <option value="all">All Difficulty Tiers</option>
              <option value="1">Tier 1: Junior (GL 03-06)</option>
              <option value="2">Tier 2: Officer (GL 07-10)</option>
              <option value="3">Tier 3: Senior (GL 12-14)</option>
              <option value="4">Tier 4: Directorate (GL 15-17)</option>
            </select>
          </div>
        </div>

        {/* Sub-bar: Count & Sort */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-white">{filteredUsers.length}</strong> of{' '}
            <strong className="text-white">{users.length}</strong> registered officers
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="date">Newest Registered</option>
              <option value="name">Name (A - Z)</option>
              <option value="staffId">Staff / File No.</option>
              <option value="tier">Grade Tier (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / Responsive Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Officer & Account</th>
                <th className="py-3 px-4">Staff / File No.</th>
                <th className="py-3 px-4">Cadre & Grade Level</th>
                <th className="py-3 px-4">Access Role</th>
                <th className="py-3 px-4">Security Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    No registered officers match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isSuper = u.role === 'superadmin';
                  const isAdminRole = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Account */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {isSuper && <span title="Super Administrator">👑</span>}
                          {isAdminRole && <span title="Administrator">🛡️</span>}
                          <span>{u.fullName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>@{u.username}</span>
                          <span>•</span>
                          <span className="truncate max-w-[160px]">{u.email}</span>
                        </div>
                      </td>

                      {/* Staff File No */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-300 font-semibold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {u.staffId}
                        </span>
                      </td>

                      {/* Cadre & Grade Level */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{u.cadre}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-amber-400 font-bold">{u.gradeLevel}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            Tier {u.difficultyTier}
                          </span>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-4">
                        {isSuper ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            Super Admin
                          </span>
                        ) : isAdminRole ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40 inline-flex items-center gap-1">
                            <Shield className="w-3 h-3 text-blue-400" />
                            Admin
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            Candidate
                          </span>
                        )}
                      </td>

                      {/* Security Status */}
                      <td className="py-3 px-4">
                        {u.mustChangePassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Lock className="w-3 h-3" />
                            Must Change Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Active & Verified
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(u)}
                            title="Edit Officer Profile"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password Button */}
                          <button
                            onClick={() => {
                              setResettingUser(u);
                              generateRandomPassword();
                              setResetMustChange(true);
                              setCopiedPass(false);
                            }}
                            title="Reset Officer Password"
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account (protected if freelander) */}
                          <button
                            disabled={u.username.toLowerCase() === 'freelander' || isCurrent}
                            onClick={() => setDeletingUser(u)}
                            title={
                              u.username.toLowerCase() === 'freelander'
                                ? 'Super Administrator cannot be removed'
                                : isCurrent
                                ? 'Cannot delete your own active session'
                                : 'Delete Officer'
                            }
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: REGISTER NEW USER */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                Register New Officer in Directory
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name (Surname First) *
                  </label>
                  <input
                    type="text"
                    required
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    placeholder="e.g. Aliyu Mohammed Sani"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    FCTA Staff / File No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={createStaffId}
                    onChange={(e) => setCreateStaffId(e.target.value.toUpperCase())}
                    placeholder="e.g. FCTA/ADM/2024/774"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Login Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. asani"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder={createUsername ? `${createUsername}@fcta.gov.ng` : 'officer@fcta.gov.ng'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Account Access Role *
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="candidate">Candidate (Exam Testee)</option>
                    <option value="admin">Administrator</option>
                    {isSuperAdmin && <option value="superadmin">Super Administrator</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Grade Level *
                  </label>
                  <select
                    value={createGradeLevel}
                    onChange={(e) => setCreateGradeLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {FCTA_GRADE_LEVELS.map((gl) => (
                      <option key={gl.level} value={gl.level}>
                        {gl.level} ({gl.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Calculated Tier
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">
                    Tier {getTierForGradeLevel(createGradeLevel)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Designated FCTA Cadre *
                </label>
                <select
                  value={createCadre}
                  onChange={(e) => setCreateCadre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {FCTA_CADRES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Initial Portal Password (min. 6 chars) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Enter password"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
                      let res = 'FCTA#';
                      for (let i = 0; i < 6; i++) {
                        res += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setCreatePassword(res);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    Random
                  </button>
                </div>

                <label className="flex items-center gap-2 pt-1 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createMustChange}
                    onChange={(e) => setCreateMustChange(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Enforce mandatory password update on first login</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/40"
                >
                  Register Officer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT USER */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-blue-400" />
                  Edit Officer Profile
                </h3>
                <p className="text-xs text-slate-400 font-mono">@{editingUser.username}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff / File No.</label>
                  <input
                    type="text"
                    required
                    value={editStaffId}
                    onChange={(e) => setEditStaffId(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">System Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="candidate">Candidate</option>
                    <option value="admin">Administrator</option>
                    {isSuperAdmin && <option value="superadmin">Super Administrator</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Grade Level</label>
                  <select
                    value={editGradeLevel}
                    onChange={(e) => setEditGradeLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {FCTA_GRADE_LEVELS.map((gl) => (
                      <option key={gl.level} value={gl.level}>
                        {gl.level} ({gl.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty Tier</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">
                    Tier {getTierForGradeLevel(editGradeLevel)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">FCTA Cadre</label>
                <select
                  value={editCadre}
                  onChange={(e) => setEditCadre(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {FCTA_CADRES.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: RESET PASSWORD */}
      {/* ========================================================= */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Reset Officer Password
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Assign a new temporary password for{' '}
              <strong className="text-white">{resettingUser.fullName}</strong> (@{resettingUser.username}).
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password (min. 6 characters)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newPasswordVal}
                    onChange={(e) => setNewPasswordVal(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    Random
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(newPasswordVal);
                      setCopiedPass(true);
                      setTimeout(() => setCopiedPass(false), 2000);
                    }}
                    title="Copy to clipboard"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    {copiedPass ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetMustChange}
                  onChange={(e) => setResetMustChange(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Force officer to change this password on next login</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold uppercase tracking-wider"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DELETE CONFIRMATION */}
      {/* ========================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Confirm Officer Deletion</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to permanently delete the profile and records for{' '}
              <strong className="text-white">{deletingUser.fullName}</strong> (Staff ID: {deletingUser.staffId})?
              All past exam test attempts and cycle progress for this candidate will also be removed.
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-rose-950/40"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { FCTA_CADRES, FCTA_GRADE_LEVELS, getTierForGradeLevel, DIFFICULTY_TIERS } from '../data/cadresAndLevels';
import { loginUser, registerCandidate, DEFAULT_ACCOUNTS } from '../services/authService';
import { UserProfile } from '../types';
import {
  LogIn,
  UserPlus,
  KeyRound,
  User,
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface AuthModalOrCardProps {
  onSuccess: (user: UserProfile) => void;
}

export const AuthModalOrCard: React.FC<AuthModalOrCardProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regStaffId, setRegStaffId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCadre, setRegCadre] = useState(FCTA_CADRES[0].name);
  const [regGradeLevel, setRegGradeLevel] = useState('GL 08');

  const selectedTierNum = getTierForGradeLevel(regGradeLevel);
  const selectedTierInfo = DIFFICULTY_TIERS.find((t) => t.tier === selectedTierNum);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const user = await loginUser(loginIdentifier, loginPassword);
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regFullName.trim() || !regStaffId.trim() || !regUsername.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerCandidate({
        fullName: regFullName,
        staffId: regStaffId,
        username: regUsername,
        email: regEmail || `${regUsername.toLowerCase()}@fcta.gov.ng`,
        password: regPassword,
        cadre: regCadre,
        gradeLevel: regGradeLevel
      });
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (type: 'superadmin' | 'admin' | 'candidate') => {
    setErrorMsg(null);
    if (type === 'superadmin') {
      setLoginIdentifier(DEFAULT_ACCOUNTS.superadmin.username);
      setLoginPassword(DEFAULT_ACCOUNTS.superadmin.password);
    } else if (type === 'admin') {
      setLoginIdentifier(DEFAULT_ACCOUNTS.admin.username);
      setLoginPassword(DEFAULT_ACCOUNTS.admin.password);
    } else {
      setLoginIdentifier('ibrahim');
      setLoginPassword('password123');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-8 backdrop-blur text-white w-full">
      {/* Tab Switcher */}
      <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-6 gap-1">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setErrorMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
            tab === 'login'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Staff Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('register');
            setErrorMsg(null);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
            tab === 'register'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>New Registration</span>
        </button>
      </div>

      {/* Quick-Access Test Credentials */}
      <div className="mb-6 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo / Admin Logins:
          </span>
          <span className="text-[10px] text-slate-500 hidden xs:inline">Auto-fill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              handleQuickLogin('superadmin');
            }}
            className="px-2.5 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition flex items-center gap-1 min-h-[36px]"
          >
            👑 Freelander (Super Admin)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              handleQuickLogin('admin');
            }}
            className="px-2.5 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold transition flex items-center gap-1 min-h-[36px]"
          >
            🛡️ system (Admin)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              handleQuickLogin('candidate');
            }}
            className="px-2.5 py-1.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition flex items-center gap-1 min-h-[36px]"
          >
            👤 Candidate (Ibrahim GL 09)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Staff Username or Official Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. Freelander, system, or your username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password (e.g. 654321 for Freelander)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 min-h-[46px]"
          >
            {loading ? 'Authenticating Officer...' : 'Authenticate & Enter CBT Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        /* REGISTRATION FORM */
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Full Name (Surname First)
              </label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Bello Usman Mohammed"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                FCTA Staff / File No.
              </label>
              <input
                type="text"
                required
                value={regStaffId}
                onChange={(e) => setRegStaffId(e.target.value)}
                placeholder="e.g. FCTA/ADM/2024/098"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Desired Login Username
              </label>
              <input
                type="text"
                required
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="e.g. busman"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Official Email (Optional)
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. busman@fcta.gov.ng"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                FCTA Professional Cadre
              </label>
              <select
                value={regCadre}
                onChange={(e) => setRegCadre(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[42px]"
              >
                {FCTA_CADRES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Current Grade Level
              </label>
              <select
                value={regGradeLevel}
                onChange={(e) => setRegGradeLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 min-h-[42px]"
              >
                {FCTA_GRADE_LEVELS.map((gl) => (
                  <option key={gl.level} value={gl.level}>
                    {gl.level} ({gl.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Tier Indicator */}
          {selectedTierInfo && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Mapped Difficulty Tier:
              </span>
              <span className="font-bold text-emerald-400">
                Tier {selectedTierNum} ({selectedTierInfo.title})
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Create Portal Password (min. 6 chars)
            </label>
            <input
              type="password"
              required
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition disabled:opacity-50 min-h-[46px]"
          >
            {loading ? 'Registering Officer...' : 'Complete Registration & Open Dashboard'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

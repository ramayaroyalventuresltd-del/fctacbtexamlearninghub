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
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  FileText,
  Mail,
  ShieldAlert
} from 'lucide-react';

interface AuthModalOrCardProps {
  onSuccess: (user: UserProfile) => void;
}

export const AuthModalOrCard: React.FC<AuthModalOrCardProps> = ({ onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regStaffId, setRegStaffId] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCadre, setRegCadre] = useState(FCTA_CADRES[0].name);
  const [regGradeLevel, setRegGradeLevel] = useState('GL 08');

  const selectedTierNum = getTierForGradeLevel(regGradeLevel);
  const selectedTierInfo = DIFFICULTY_TIERS.find((t) => t.tier === selectedTierNum);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setErrorMsg('Please enter your Staff Username, Email, or FCTA Staff/File No.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(cleanId, loginPassword);
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanFullName = regFullName.trim();
    const cleanStaffId = regStaffId.trim();
    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim();

    if (!cleanFullName || cleanFullName.length < 3) {
      setErrorMsg('Please enter officer full name (at least 3 characters).');
      return;
    }

    if (!cleanStaffId) {
      setErrorMsg('Please enter your official FCTA Staff or File Number.');
      return;
    }

    if (!cleanUsername) {
      setErrorMsg('Please choose a login username.');
      return;
    }

    if (/\s/.test(cleanUsername)) {
      setErrorMsg('Username cannot contain spaces. Use alphanumeric characters and underscores only.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = await registerCandidate({
        fullName: cleanFullName,
        staffId: cleanStaffId,
        username: cleanUsername,
        email: cleanEmail || `${cleanUsername}@fcta.gov.ng`,
        password: regPassword,
        cadre: regCadre,
        gradeLevel: regGradeLevel
      });
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please review your details and try again.');
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
      <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Test & Administrative Logins:
          </span>
          <span className="text-[10px] text-slate-500 hidden xs:inline">1-Click Auto-Fill</span>
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
        <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {tab === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Staff Username, File No., or Official Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. Freelander, system, FCTA/AGS/2019/4412"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition min-h-[44px]"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              You can log in with your desired username, official email, or FCTA Staff/File No.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your portal password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regStaffId}
                  onChange={(e) => setRegStaffId(e.target.value.toUpperCase())}
                  placeholder="e.g. FCTA/ADM/2024/098"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px] uppercase"
                />
              </div>
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
                onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
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
                placeholder={regUsername ? `${regUsername.toLowerCase()}@fcta.gov.ng` : 'officer@fcta.gov.ng'}
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
                Mapped Civil Service Difficulty Tier:
              </span>
              <span className="font-bold text-emerald-400">
                Tier {selectedTierNum} ({selectedTierInfo.title})
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Password (min. 6 chars)
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[42px]"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {regConfirmPassword && regPassword !== regConfirmPassword && (
                <p className="text-[10px] text-rose-400 mt-1">Passwords do not match</p>
              )}
              {regConfirmPassword && regPassword === regConfirmPassword && (
                <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>
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

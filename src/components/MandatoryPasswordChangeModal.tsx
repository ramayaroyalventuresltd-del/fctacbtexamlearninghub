import React, { useState } from 'react';
import { UserProfile } from '../types';
import { changeUserPassword, logoutUser } from '../services/authService';
import { ShieldAlert, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MandatoryPasswordChangeModalProps {
  user: UserProfile;
  onPasswordChanged: (updatedUser: UserProfile) => void;
  onLogout: () => void;
}

export const MandatoryPasswordChangeModal: React.FC<MandatoryPasswordChangeModalProps> = ({
  user,
  onPasswordChanged,
  onLogout
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isSuperAdmin = user.role === 'superadmin';
  const defaultHint = isSuperAdmin ? '654321' : '123456';

  // Password strength calculation
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score, label: 'Moderate', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please provide your current default password.');
      return;
    }

    if (!newPassword || newPassword.trim().length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your initial default password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      const updated = await changeUserPassword(user.id, currentPassword, newPassword);
      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onPasswordChanged(updated);
      }, 1400);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-6 border-b border-amber-500/30 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-lg text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/50">
                Security Policy Enforcement
              </span>
              <span className="text-[10px] text-slate-400 font-mono">FCTA-SEC-01</span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">
              Mandatory First-Login Password Change
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Federal Capital Territory Administration • Directorate of Human Resources
            </p>
          </div>
        </div>

        {/* User context info */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="text-slate-400 text-[11px]">Authenticated Administrator</div>
              <div className="font-bold text-white text-sm">{user.fullName}</div>
              <div className="text-slate-400 font-mono text-[11px]">Staff ID: {user.staffId}</div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {user.role === 'superadmin' ? 'SUPER ADMINISTRATOR' : 'SYSTEM ADMINISTRATOR'}
              </span>
              <div className="text-[10px] text-amber-400/90 font-mono mt-1">Default Pass: {defaultHint}</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            In accordance with Federal Civil Service Cybersecurity Standards (ISO/IEC 27001), newly provisioned administrative accounts must change their factory default credentials upon first login before accessing the administration suite and candidate evaluation databases.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Password updated successfully! Redirecting to Administrative Portal...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Current default password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Current Initial Password</span>
                <span className="text-[10px] text-slate-400 font-mono">Factory default: {defaultHint}</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={`Enter ${defaultHint}`}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>New Secure Password</span>
                {newPassword && (
                  <span className="text-[10px] font-bold text-slate-400">
                    Strength: <span className="font-bold text-white">{strength.label}</span>
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="mt-1.5 flex gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-rose-400 hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition order-2 sm:order-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cancel & Sign Out</span>
              </button>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full sm:w-auto flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition disabled:opacity-50 order-1 sm:order-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{loading ? 'Securing Account...' : 'Set Password & Continue'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

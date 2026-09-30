import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  ShieldCheck,
  LogOut,
  BookOpen,
  Building2,
  Globe2,
  Menu,
  X,
  ChevronRight,
  Zap,
  TrendingUp,
  History,
  Trophy
} from 'lucide-react';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  user: UserProfile | null;
  onLogout: () => void;
  activeView: 'cbt' | 'admin';
  onChangeView?: (view: 'cbt' | 'admin') => void;
  questionBankCount?: number;
  onOpenStandards?: () => void;
  activeNavTab?: 'sets' | 'achievements' | 'reports' | 'history' | 'admin';
  onSelectNavTab?: (tab: 'sets' | 'achievements' | 'reports' | 'history' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeView,
  onChangeView,
  questionBankCount = 0,
  onOpenStandards,
  activeNavTab = 'sets',
  onSelectNavTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminOrSuper = user?.role === 'superadmin' || user?.role === 'admin';

  const handleMobileNav = (tab: 'sets' | 'achievements' | 'reports' | 'history' | 'admin') => {
    if (tab === 'admin') {
      onChangeView?.('admin');
      onSelectNavTab?.('admin');
    } else {
      onChangeView?.('cbt');
      onSelectNavTab?.(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 border-b border-slate-800 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* ZONE 1: Brand Wordmark & Emblem */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-950/40 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-1.5">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-emerald-400 uppercase truncate">
                  FCTA
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">·</span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline uppercase">
                  Civil Service Promotion
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase truncate">
                FCTA CBT EXAM HUB
              </h1>
            </div>
          </div>

          {/* ZONE 2: Middle Navigation (Desktop & Tablet) */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  onChangeView?.('cbt');
                  onSelectNavTab?.('sets');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'cbt' && activeNavTab === 'sets'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Exam Sets</span>
              </button>

              <button
                onClick={() => {
                  onChangeView?.('cbt');
                  onSelectNavTab?.('achievements');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'cbt' && activeNavTab === 'achievements'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Badges & Honors</span>
              </button>

              <button
                onClick={() => {
                  onChangeView?.('cbt');
                  onSelectNavTab?.('reports');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeView === 'cbt' && activeNavTab === 'reports'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Trends & Analytics</span>
              </button>

              {isAdminOrSuper && (
                <button
                  onClick={() => {
                    onChangeView?.('admin');
                    onSelectNavTab?.('admin');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeView === 'admin'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Admin Portal</span>
                </button>
              )}
            </nav>
          )}

          {/* ZONE 3: Primary Actions, Connectivity, Profile & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Question Bank count (hidden on mobile, visible on desktop) */}
            {questionBankCount > 0 && (
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Bank:</span>
                <span className="font-bold text-white font-mono">{questionBankCount.toLocaleString()}+</span>
              </div>
            )}

            {/* Offline/Online status badge */}
            <div className="hidden sm:block">
              <OfflineStatusIndicator />
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* ISO Standards Button (Desktop & Tablet) */}
            {onOpenStandards && (
              <button
                onClick={onOpenStandards}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white transition min-h-[40px]"
                title="International Standards (ISO/IEC 23988)"
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">Standards</span>
              </button>
            )}

            {/* User Profile Pill or Login State */}
            {user ? (
              <div className="flex items-center gap-2">
                {/* User avatar & summary info */}
                <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 pl-2 sm:pl-3 pr-2 py-1 sm:py-1.5 rounded-xl">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs uppercase shrink-0">
                    {user.fullName.substring(0, 2)}
                  </div>

                  <div className="hidden md:block text-left text-xs">
                    <div className="font-bold text-white flex items-center gap-1 truncate max-w-[130px] lg:max-w-[160px]">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[130px] lg:max-w-[160px]">
                      {user.gradeLevel} · {user.role === 'superadmin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Candidate'}
                    </div>
                  </div>

                  {/* Sign out button (Desktop & Tablet) */}
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Mobile Hamburger Drawer Trigger (visible on < 1024px) */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center transition"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile & Tablet Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          {user && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-bold text-white">{user.fullName}</div>
              <div className="text-[11px] text-emerald-400 mt-0.5">
                Staff ID: {user.staffId} · {user.gradeLevel} · {user.cadre}
              </div>
            </div>
          )}

          {user && (
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => handleMobileNav('sets')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between min-h-[44px] ${
                  activeView === 'cbt' && activeNavTab === 'sets'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Exam Sets & Progression</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNav('achievements')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between min-h-[44px] ${
                  activeView === 'cbt' && activeNavTab === 'achievements'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Badges & Honors System</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNav('reports')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between min-h-[44px] ${
                  activeView === 'cbt' && activeNavTab === 'reports'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Score Trends & Analytics</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                onClick={() => handleMobileNav('history')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between min-h-[44px] ${
                  activeView === 'cbt' && activeNavTab === 'history'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <span>Attempt History & Reviews</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {isAdminOrSuper && (
                <button
                  onClick={() => handleMobileNav('admin')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between min-h-[44px] ${
                    activeView === 'admin'
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Portal</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between sm:hidden">
              <span className="text-xs text-slate-400">Offline Status:</span>
              <OfflineStatusIndicator />
            </div>

            {onOpenStandards && (
              <button
                onClick={() => {
                  onOpenStandards();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-2 min-h-[44px]"
              >
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <span>ISO/IEC 23988 & Global Assessment Standards</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Session</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

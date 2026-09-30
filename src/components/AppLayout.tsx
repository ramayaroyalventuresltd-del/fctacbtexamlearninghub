import React, { ReactNode } from 'react';
import { UserProfile } from '../types';
import { Navbar } from './Navbar';
import { MobileBottomBar } from './MobileBottomBar';

interface AppLayoutProps {
  children: ReactNode;
  user: UserProfile | null;
  onLogout: () => void;
  activeView: 'cbt' | 'admin';
  onChangeView?: (view: 'cbt' | 'admin') => void;
  questionBankCount?: number;
  onOpenStandards?: () => void;
  activeNavTab?: 'sets' | 'achievements' | 'reports' | 'history' | 'admin';
  onSelectNavTab?: (tab: 'sets' | 'achievements' | 'reports' | 'history' | 'admin') => void;
  hideHeader?: boolean;
}

/**
 * AppLayout: Production Responsive Layout Shell
 *
 * Implements strict responsive framing:
 * - Mobile (< 768px): Single-column stacking, collapsed drawers, mobile thumb bar, px-4 padding
 * - Tablet (768px - 1023px): 2-column or adaptable grid layouts, compact nav, px-6 padding
 * - Desktop (>= 1024px): Full multi-column layout, expanded navigation, px-8 to px-12 padding
 * - Max container width: max-w-7xl (1280px - 1440px) centered via mx-auto
 * - Viewport fill: min-h-screen min-h-[100dvh] flex flex-col to pin footers cleanly
 * - Root overflow control: overflow-x-hidden w-full
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  user,
  onLogout,
  activeView,
  onChangeView,
  questionBankCount = 0,
  onOpenStandards,
  activeNavTab,
  onSelectNavTab,
  hideHeader = false
}) => {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950 font-sans antialiased">
      {/* Responsive Top Bar */}
      {!hideHeader && (
        <Navbar
          user={user}
          onLogout={onLogout}
          activeView={activeView}
          onChangeView={onChangeView}
          questionBankCount={questionBankCount}
          onOpenStandards={onOpenStandards}
          activeNavTab={activeNavTab}
          onSelectNavTab={onSelectNavTab}
        />
      )}

      {/* Main Centered Responsive Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 flex flex-col pb-20 md:pb-8">
        {children}
      </main>

      {/* Responsive Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-6 sm:py-8 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-bold text-slate-400 text-xs sm:text-sm">
                FCTA CBT EXAM HUB
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Federal Capital Territory Administration • Statutory Civil Service Promotion System
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-1 text-[11px] text-slate-500">
              {onOpenStandards && (
                <button
                  onClick={onOpenStandards}
                  className="hover:text-emerald-400 transition underline underline-offset-4"
                >
                  ISO/IEC 23988 Standards
                </button>
              )}
              <span>•</span>
              <span>PSR & FR Compliant</span>
              <span>•</span>
              <span>© {new Date().getFullYear()} FCTA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile-Only Bottom Thumb Navigation (visible only on < 768px when logged in) */}
      {user && (
        <MobileBottomBar
          activeTab={activeNavTab || (activeView === 'admin' ? 'admin' : 'sets')}
          onSelectTab={(tab) => {
            if (tab === 'admin') {
              onChangeView?.('admin');
              onSelectNavTab?.('admin');
            } else {
              if (activeView === 'admin') {
                onChangeView?.('cbt');
              }
              onSelectNavTab?.(tab);
            }
          }}
          isAdmin={user.role === 'superadmin' || user.role === 'admin'}
          onOpenStandards={onOpenStandards}
        />
      )}
    </div>
  );
};

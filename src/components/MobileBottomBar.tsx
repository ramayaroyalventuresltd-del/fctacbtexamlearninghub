import React from 'react';
import { Zap, Trophy, TrendingUp, History, ShieldCheck, Globe2 } from 'lucide-react';

interface MobileBottomBarProps {
  activeTab: 'sets' | 'achievements' | 'reports' | 'history' | 'admin';
  onSelectTab: (tab: 'sets' | 'achievements' | 'reports' | 'history' | 'admin') => void;
  isAdmin: boolean;
  onOpenStandards?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  onSelectTab,
  isAdmin,
  onOpenStandards
}) => {
  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-1.5 py-1 shadow-2xl"
    >
      <div className={`grid ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'} items-center h-14 max-w-lg mx-auto`}>
        <button
          onClick={() => onSelectTab('sets')}
          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors py-1 ${
            activeTab === 'sets'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Sets</span>
          {activeTab === 'sets' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('achievements')}
          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors py-1 ${
            activeTab === 'achievements'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[10px] tracking-tight">Badges</span>
          {activeTab === 'achievements' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors py-1 ${
            activeTab === 'reports'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Trends</span>
          {activeTab === 'reports' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />
          )}
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors py-1 ${
            activeTab === 'history'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">History</span>
          {activeTab === 'history' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5" />
          )}
        </button>

        {isAdmin && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`min-h-[44px] flex flex-col items-center justify-center rounded-lg transition-colors py-1 ${
              activeTab === 'admin'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-0.5 text-amber-400" />
            <span className="text-[10px] tracking-tight">Admin</span>
            {activeTab === 'admin' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-0.5" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
};

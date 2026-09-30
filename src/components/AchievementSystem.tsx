import React, { useState, useMemo } from 'react';
import { ExamAttempt, UserProgress } from '../types';
import {
  evaluateAchievements,
  AchievementBadge,
  BadgeCategory,
  BadgeRarity
} from '../data/achievementEngine';
import confetti from 'canvas-confetti';
import {
  Award,
  Crown,
  Flame,
  Compass,
  Trophy,
  Zap,
  BookOpen,
  Landmark,
  Scale,
  Building2,
  Briefcase,
  RefreshCw,
  Lock,
  CheckCircle2,
  Sparkles,
  Sun,
  ShieldCheck,
  ShieldAlert,
  Star,
  X,
  Filter,
  ArrowRight,
  TrendingUp,
  Medal,
  ChevronRight
} from 'lucide-react';

interface AchievementSystemProps {
  attempts: ExamAttempt[];
  progress: UserProgress | null;
  onLaunchExamSet?: () => void;
  compact?: boolean;
  onViewAll?: () => void;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  attempts,
  progress,
  onLaunchExamSet,
  compact = false,
  onViewAll
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [unlockedOnly, setUnlockedOnly] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  // Compute all metrics deterministically
  const summary = useMemo(() => {
    return evaluateAchievements(attempts, progress);
  }, [attempts, progress]);

  // Filtered badges list
  const filteredBadges = useMemo(() => {
    return summary.badges.filter((b) => {
      if (unlockedOnly && !b.isUnlocked) return false;
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;
      return true;
    });
  }, [summary.badges, selectedCategory, unlockedOnly]);

  const handleBadgeClick = (badge: AchievementBadge) => {
    setSelectedBadge(badge);
    if (badge.isUnlocked) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const getBadgeIcon = (iconName: string, isUnlocked: boolean, rarity: BadgeRarity) => {
    const iconClass = `w-6 h-6 sm:w-7 sm:h-7 ${
      isUnlocked
        ? rarity === 'legendary'
          ? 'text-amber-300'
          : rarity === 'epic'
          ? 'text-purple-300'
          : rarity === 'rare'
          ? 'text-emerald-300'
          : 'text-blue-300'
        : 'text-slate-500'
    }`;

    switch (iconName) {
      case 'Sunrise':
        return <Sun className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'ShieldAlert':
        return <ShieldAlert className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Zap':
        return <Zap className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'Landmark':
        return <Landmark className={iconClass} />;
      case 'Scale':
        return <Scale className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Briefcase':
        return <Briefcase className={iconClass} />;
      case 'RefreshCw':
        return <RefreshCw className={iconClass} />;
      default:
        return <Medal className={iconClass} />;
    }
  };

  const getRarityBadgeStyle = (rarity: BadgeRarity, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-slate-950/60 border-slate-800/80 text-slate-500',
        cardBorder: 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700',
        glow: ''
      };
    }

    switch (rarity) {
      case 'legendary':
        return {
          bg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 text-amber-300 border-amber-500/40',
          cardBorder: 'border-amber-500/50 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-900 shadow-amber-950/30 shadow-lg',
          glow: 'from-amber-500/10 to-transparent'
        };
      case 'epic':
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-600/20 text-purple-300 border-purple-500/40',
          cardBorder: 'border-purple-500/50 bg-gradient-to-b from-slate-900 via-purple-950/20 to-slate-900 shadow-purple-950/30 shadow-lg',
          glow: 'from-purple-500/10 to-transparent'
        };
      case 'rare':
        return {
          bg: 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-600/20 text-emerald-300 border-emerald-500/40',
          cardBorder: 'border-emerald-500/50 bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-900 shadow-emerald-950/30 shadow-lg',
          glow: 'from-emerald-500/10 to-transparent'
        };
      case 'common':
      default:
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          cardBorder: 'border-blue-500/40 bg-gradient-to-b from-slate-900 via-blue-950/20 to-slate-900 shadow-blue-950/30 shadow-lg',
          glow: 'from-blue-500/10 to-transparent'
        };
    }
  };

  // COMPACT MODE: Preview ribbon on main dashboard
  if (compact) {
    const recentUnlocked = summary.badges.filter((b) => b.isUnlocked).slice(-4);
    const nextLocked = summary.badges.filter((b) => !b.isUnlocked).slice(0, 2);
    const previewList = [...recentUnlocked, ...nextLocked].slice(0, 5);

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Officer Achievements & Honors
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {summary.totalUnlocked} / {summary.totalBadges} Earned
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rank: <strong className={summary.officerRank.color}>{summary.officerRank.title}</strong> • {summary.totalPoints.toLocaleString()} Merit Points
              </p>
            </div>
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto min-h-[36px]"
            >
              <span>View All Badges ({summary.totalBadges})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Horizontal Mini Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {previewList.map((badge) => {
            const styles = getRarityBadgeStyle(badge.rarity, badge.isUnlocked);
            return (
              <div
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between ${
                  badge.isUnlocked
                    ? styles.cardBorder
                    : 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="relative mb-1.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 border ${
                      badge.isUnlocked
                        ? 'bg-slate-950/90 border-slate-700/80 shadow-md'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {getBadgeIcon(badge.iconName, badge.isUnlocked, badge.rarity)}
                  </div>
                  {!badge.isUnlocked && (
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-400">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="font-bold text-xs text-white truncate w-full">{badge.title}</div>
                <div className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                  {badge.isUnlocked ? `+${badge.points} pts` : badge.tagline}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // FULL VIEW
  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Gamification Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Statutory Civil Service Honors
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Level {summary.officerRank.level} Cadre Rank
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Trophy className="w-7 h-7 text-amber-400" />
              <span>Officer Achievement System</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Earn prestigious merit badges across promotion examination speed, domain mastery (PSR, FR, PPA, FCTA GK), score distinction, and continuous study consistency.
            </p>
          </div>

          {/* Gamified Rank & Points Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-950/90 border border-slate-800 p-3 sm:p-4 rounded-xl shrink-0">
            <div className="text-center px-1 sm:px-3 border-r border-slate-800">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tabular-nums">
                {summary.totalUnlocked}/{summary.totalBadges}
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
                Badges Won
              </div>
            </div>

            <div className="text-center px-1 sm:px-3 border-r border-slate-800">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
                {summary.totalPoints.toLocaleString()}
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
                Merit Points
              </div>
            </div>

            <div className="text-center px-1 sm:px-3">
              <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono tabular-nums">
                {summary.completionPercentage}%
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">
                Mastery
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar towards next rank */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-semibold">
              Current Rank: <strong className={summary.officerRank.color}>{summary.officerRank.title}</strong>
            </span>
            <span className="text-slate-400 font-mono">
              {summary.totalPoints.toLocaleString()} / {summary.officerRank.nextRankAt.toLocaleString()} pts
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2.5 border border-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 transition-all duration-500"
              style={{
                width: `${Math.min(
                  Math.round((summary.totalPoints / summary.officerRank.nextRankAt) * 100),
                  100
                )}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Unlocked Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'All Badges' },
            { id: 'milestones', label: 'Milestones' },
            { id: 'mastery', label: 'Mastery' },
            { id: 'dedication', label: 'Dedication' },
            { id: 'speed', label: 'Speed' },
            { id: 'subjects', label: 'Domain Mastery' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap min-h-[36px] ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Unlocked Only Filter Toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer self-start sm:self-auto select-none min-h-[36px]">
          <input
            type="checkbox"
            checked={unlockedOnly}
            onChange={(e) => setUnlockedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
          />
          <span>Unlocked Only ({summary.totalUnlocked})</span>
        </label>
      </div>

      {/* Badges Responsive Grid: 1 col (<768px), 2 cols (tablet), 3 or 4 cols (desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const styles = getRarityBadgeStyle(badge.rarity, badge.isUnlocked);
          const progressPercent = Math.min(
            Math.round((badge.progressCurrent / badge.progressTarget) * 100),
            100
          );

          return (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                badge.isUnlocked
                  ? `${styles.cardBorder} hover:scale-[1.01]`
                  : 'bg-slate-900/60 border-slate-800/90 opacity-80 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row: Rarity badge & Lock/Check status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles.bg}`}
                  >
                    {badge.rarity}
                  </span>

                  {badge.isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      <Lock className="w-3 h-3" />
                      LOCKED
                    </span>
                  )}
                </div>

                {/* Badge Icon Emblem */}
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center p-2.5 border shrink-0 transition-transform group-hover:scale-105 ${
                      badge.isUnlocked
                        ? 'bg-slate-950 border-slate-700/80 shadow-inner'
                        : 'bg-slate-950/90 border-slate-800'
                    }`}
                  >
                    {getBadgeIcon(badge.iconName, badge.isUnlocked, badge.rarity)}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-white tracking-tight truncate">
                      {badge.title}
                    </h4>
                    <div className="text-[11px] font-semibold text-emerald-400 truncate">
                      {badge.tagline}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Details & Progress Bar */}
              <div className="pt-3 border-t border-slate-800/80">
                {badge.isUnlocked ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-400 font-bold font-mono">
                      +{badge.points} pts
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {badge.unlockedAt
                        ? new Date(badge.unlockedAt).toLocaleDateString()
                        : 'Achieved'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Requirement:</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {badge.progressCurrent} / {badge.progressTarget} {badge.progressUnit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-600 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-900 border border-dashed border-slate-800 p-6 text-slate-400 text-xs">
          No badges match the selected filter criteria.
        </div>
      )}

      {/* Detailed Badge Dialog Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge Emblem Display */}
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <div
                className={`w-20 h-20 rounded-3xl flex items-center justify-center p-4 border mb-4 shadow-2xl ${
                  selectedBadge.isUnlocked
                    ? 'bg-slate-950 border-amber-500/50 shadow-amber-950/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                {getBadgeIcon(selectedBadge.iconName, selectedBadge.isUnlocked, selectedBadge.rarity)}
              </div>

              <span
                className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border mb-2 ${
                  getRarityBadgeStyle(selectedBadge.rarity, selectedBadge.isUnlocked).bg
                }`}
              >
                {selectedBadge.rarity} Badge • {selectedBadge.category}
              </span>

              <h3 className="text-2xl font-black text-white">{selectedBadge.title}</h3>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                {selectedBadge.tagline}
              </p>
            </div>

            {/* Description & Criteria */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs mb-5">
              <div>
                <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">
                  Assessment Criteria:
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Merit Points Reward:</span>
                <span className="font-bold font-mono text-amber-400 text-sm">
                  +{selectedBadge.points} pts
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Status:</span>
                {selectedBadge.isUnlocked ? (
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked on {selectedBadge.unlockedAt ? new Date(selectedBadge.unlockedAt).toLocaleDateString() : 'Record'}
                  </span>
                ) : (
                  <span className="font-bold text-slate-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    In Progress ({selectedBadge.progressCurrent} / {selectedBadge.progressTarget})
                  </span>
                )}
              </div>

              {selectedBadge.unlockDetails && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-emerald-400 block mb-0.5">Record Note:</strong>
                  {selectedBadge.unlockDetails}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition min-h-[44px]"
              >
                Close
              </button>
              {!selectedBadge.isUnlocked && onLaunchExamSet && (
                <button
                  onClick={() => {
                    setSelectedBadge(null);
                    onLaunchExamSet();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition min-h-[44px] flex items-center justify-center gap-1.5"
                >
                  <span>Take Exam</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

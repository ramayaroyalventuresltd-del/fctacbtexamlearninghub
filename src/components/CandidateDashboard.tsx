import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, UserProgress, ExamAttempt } from '../types';
import { PerformanceReports } from './PerformanceReports';
import { ScoreTrendChart } from './ScoreTrendChart';
import { AchievementSystem } from './AchievementSystem';
import { evaluateAchievements } from '../data/achievementEngine';
import {
  Award,
  CheckCircle2,
  Lock,
  Play,
  Clock,
  RefreshCw,
  Sparkles,
  History,
  TrendingUp,
  Zap,
  Database,
  ChevronRight,
  BarChart2,
  FileCheck,
  Trophy,
  Medal
} from 'lucide-react';

interface CandidateDashboardProps {
  user: UserProfile;
  progress: UserProgress;
  attempts: ExamAttempt[];
  onStartExam: (setNumber: number, difficultyTier: number, durationMinutes: number) => void;
  onGenerateNewCycle: () => void;
  onReviewAttempt: (attempt: ExamAttempt) => void;
  initialTab?: 'sets' | 'reports' | 'history' | 'achievements';
  onTabChange?: (tab: 'sets' | 'reports' | 'history' | 'achievements') => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  user,
  progress,
  attempts,
  onStartExam,
  onGenerateNewCycle,
  onReviewAttempt,
  initialTab = 'sets',
  onTabChange
}) => {
  const [activeDashboardTab, setActiveDashboardTab] = useState<'sets' | 'reports' | 'history' | 'achievements'>(initialTab);
  const [selectedDuration, setSelectedDuration] = useState<number>(45); // 30, 45, or 60 min

  // Keep activeDashboardTab in sync if parent initialTab changes
  useEffect(() => {
    setActiveDashboardTab(initialTab);
  }, [initialTab]);

  const handleTabSwitch = (tab: 'sets' | 'reports' | 'history' | 'achievements') => {
    setActiveDashboardTab(tab);
    onTabChange?.(tab);
  };

  // Evaluate achievements for real-time honor badges and rank
  const achievementSummary = useMemo(() => {
    return evaluateAchievements(attempts, progress);
  }, [attempts, progress]);

  const allFourPassed = [1, 2, 3, 4].every((setNum) => progress.passedSets.includes(setNum));

  const setsInfo = [
    {
      setNum: 1,
      tier: 1,
      title: 'Exam Set 1: Foundational Civil Service',
      subtitle: 'Junior Cadre Standard (GL 03 - 06)',
      desc: '100 Questions: PSR (20%), FR (20%), PPA (20%), FCTA GK (20%), and Cadre (20%)'
    },
    {
      setNum: 2,
      tier: 2,
      title: 'Exam Set 2: Operational & Middle Cadre',
      subtitle: 'Officer Standard (GL 07 - 10)',
      desc: '100 Questions: PSR (20%), FR (20%), PPA (20%), FCTA GK (20%), and Cadre (20%)'
    },
    {
      setNum: 3,
      tier: 3,
      title: 'Exam Set 3: Senior Management Supervisory',
      subtitle: 'Senior Officer Standard (GL 12 - 14)',
      desc: '100 Questions: PSR (20%), FR (20%), PPA (20%), FCTA GK (20%), and Cadre (20%)'
    },
    {
      setNum: 4,
      tier: 4,
      title: 'Exam Set 4: Strategic Directorate Leadership',
      subtitle: 'Directorate Standard (GL 15 - 17)',
      desc: '100 Questions: PSR (20%), FR (20%), PPA (20%), FCTA GK (20%), and Cadre (20%)'
    }
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Officer Profile & Progress Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                FCTA CBT EXAM HUB
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cycle #{progress.currentCycle}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                {achievementSummary.officerRank.title}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Welcome, {user.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-2">
              <span><strong>Staff File:</strong> {user.staffId}</span>
              <span className="text-slate-600">·</span>
              <span><strong>Cadre:</strong> {user.cadre}</span>
              <span className="text-slate-600">·</span>
              <span><strong>Grade:</strong> {user.gradeLevel}</span>
            </div>
          </div>

          {/* Quick Metrics: Stack on small mobile, 4-col on tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 bg-slate-900/90 border border-slate-700/80 p-3 sm:p-4 rounded-xl shrink-0">
            <div className="text-center px-1 sm:px-2 border-r border-slate-700/70">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
                {progress.passedSets.length}/4
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">Sets Passed</div>
            </div>
            <div className="text-center px-1 sm:px-2 sm:border-r border-slate-700/70">
              <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono tabular-nums">
                70%
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">Pass Mark</div>
            </div>
            <div className="text-center px-1 sm:px-2 border-r border-slate-700/70">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono tabular-nums flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400 inline" />
                {achievementSummary.totalUnlocked}
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">Badges Won</div>
            </div>
            <div className="text-center px-1 sm:px-2">
              <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono tabular-nums">
                {progress.completedCycles}
              </div>
              <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400">Cycles Won</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation Segmented Control */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleTabSwitch('sets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeDashboardTab === 'sets'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Exam Sets & Progression</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300">
            {progress.passedSets.length}/4
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('achievements')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeDashboardTab === 'achievements'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Achievements & Badges</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">
            {achievementSummary.totalUnlocked}/{achievementSummary.totalBadges}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeDashboardTab === 'reports'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Progress & Score Trends</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
            {attempts.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeDashboardTab === 'history'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Exam History</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
            {attempts.length}
          </span>
        </button>
      </div>

      {/* VIEW: ACHIEVEMENTS & BADGES SYSTEM */}
      {activeDashboardTab === 'achievements' && (
        <AchievementSystem
          attempts={attempts}
          progress={progress}
          onLaunchExamSet={() => handleTabSwitch('sets')}
        />
      )}

      {/* VIEW: PERFORMANCE REPORTS & RECHARTS TRENDS */}
      {activeDashboardTab === 'reports' && (
        <div className="space-y-6">
          {/* Integrated Recharts Line Chart for Candidate Score Trajectory */}
          <ScoreTrendChart attempts={attempts} onReviewAttempt={onReviewAttempt} />

          <PerformanceReports
            attempts={attempts}
            user={user}
            onReviewAttempt={onReviewAttempt}
            onLaunchTest={() => handleTabSwitch('sets')}
          />
        </div>
      )}

      {/* VIEW: EXAM HISTORY */}
      {activeDashboardTab === 'history' && (
        <div className="space-y-6">
          <ScoreTrendChart attempts={attempts} onReviewAttempt={onReviewAttempt} />

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  All Exam Attempts History
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed chronological record with offline question review snapshots
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded text-[11px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-400" />
                  Offline-Ready Cache
                </span>
              </div>
            </div>

            {attempts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No exam attempts on record yet. Take your first test to see your history here!
              </div>
            ) : (
              <div className="overflow-x-auto w-full -mx-4 sm:mx-0">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Cycle & Set</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Percentage</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Time Spent</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {attempts.map((att, idx) => (
                      <tr key={`full_att_${att.id}_${idx}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white">
                          Cycle {att.cycleIndex} - Set {att.setNumber} (Tier {att.difficultyTier})
                        </td>
                        <td className="py-3 px-4 font-mono font-bold tabular-nums">
                          {att.score} / {att.totalQuestions}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 tabular-nums">
                          {att.percentage}%
                        </td>
                        <td className="py-3 px-4">
                          {att.passed ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              BELOW 70%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono tabular-nums">
                          {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(att.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onReviewAttempt(att)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline min-h-[32px] inline-flex items-center"
                          >
                            Review Corrections
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: EXAM SETS & PROGRESSION */}
      {activeDashboardTab === 'sets' && (
        <>
          {/* Congratulations / Generate Next Cycle Banner if all 4 sets passed */}
          {allFourPassed && (
            <div className="bg-gradient-to-r from-amber-900/70 via-emerald-900/70 to-teal-900/70 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-2xl shrink-0">
                    <Award className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Full 4-Set Cycle Accomplished
                    </span>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mt-1">
                      Ready to Advance to Cycle #{progress.currentCycle + 1}?
                    </h3>
                    <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                      You scored ≥ 70% in all 4 examination sets! Generate an entirely new cycle of four 100-question exams. The engine guarantees <strong>zero duplicate questions</strong> from your history.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onGenerateNewCycle}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-950/40 transition shrink-0 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate Next 4-Set Exam Cycle
                </button>
              </div>
            </div>
          )}

          {/* Compact Officer Honors & Badges Preview Ribbon */}
          <AchievementSystem
            attempts={attempts}
            progress={progress}
            compact={true}
            onViewAll={() => handleTabSwitch('achievements')}
          />

          {/* Prominent Score Trend Line Chart right on Candidate Dashboard */}
          {attempts.length > 0 && (
            <ScoreTrendChart attempts={attempts} onReviewAttempt={onReviewAttempt} />
          )}

          {/* Timer Configuration Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400 border border-slate-700 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Select Exam Timer Duration</h4>
                <p className="text-xs text-slate-400">
                  Allocated time for answering all 100 balanced questions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {[30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSelectedDuration(mins)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 min-h-[40px] ${
                    selectedDuration === mins
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{mins} Mins</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4-Set Progression Grid: 1 col on Mobile (<768px), 2 cols on Tablet & Desktop */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Promotion CBT Qualification Sets (Cycle {progress.currentCycle})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Each set contains 100 questions. Pass with ≥ 70% to unlock the next level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {setsInfo.map((set) => {
                const isUnlocked = progress.unlockedSet >= set.setNum || progress.passedSets.includes(set.setNum);
                const isPassed = progress.passedSets.includes(set.setNum);
                const bestScore = progress.setBestScores[set.setNum];

                return (
                  <div
                    key={set.setNum}
                    className={`relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between ${
                      isPassed
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20 shadow-lg'
                        : isUnlocked
                        ? 'bg-slate-900 border-slate-700 shadow-xl hover:border-emerald-500/60'
                        : 'bg-slate-950/50 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div>
                      {/* Header status badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isPassed
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isUnlocked
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {isPassed ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              PASSED ({bestScore}%)
                            </>
                          ) : isUnlocked ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              READY TO ATTEMPT
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5 text-slate-500" />
                              LOCKED (Pass Set {set.setNum - 1} ≥ 70%)
                            </>
                          )}
                        </span>

                        <span className="text-xs font-mono font-bold text-slate-400 shrink-0">
                          Tier {set.tier}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white">{set.title}</h4>
                      <div className="text-xs font-medium text-emerald-400 mt-0.5">{set.subtitle}</div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{set.desc}</p>

                      {/* Subject 20% Breakdown Grid */}
                      <div className="mt-4 grid grid-cols-5 gap-1 text-center">
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                          <div className="font-bold text-white">20 Qs</div>
                          <div className="text-slate-400 truncate">PSR</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                          <div className="font-bold text-white">20 Qs</div>
                          <div className="text-slate-400 truncate">FR</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                          <div className="font-bold text-white">20 Qs</div>
                          <div className="text-slate-400 truncate">PPA</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                          <div className="font-bold text-white">20 Qs</div>
                          <div className="text-slate-400 truncate">FCTA</div>
                        </div>
                        <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
                          <div className="font-bold text-white">20 Qs</div>
                          <div className="text-slate-400 truncate">Cadre</div>
                        </div>
                      </div>
                    </div>

                    {/* Launch Action */}
                    <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{selectedDuration} mins</span>
                      </div>

                      {isUnlocked ? (
                        <button
                          onClick={() => onStartExam(set.setNum, set.tier, selectedDuration)}
                          className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition min-h-[44px]"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {isPassed ? 'Retake Set' : 'Start Test'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed min-h-[44px]"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Locked
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Recent Attempts list (last 3) with full history link */}
          {attempts.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Recent Attempts
                  </h3>
                  <p className="text-xs text-slate-400">
                    Showing latest test records
                  </p>
                </div>
                <button
                  onClick={() => handleTabSwitch('history')}
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  View All ({attempts.length})
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto w-full -mx-4 sm:mx-0">
                <table className="w-full text-left text-xs min-w-[560px]">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4">Set</th>
                      <th className="py-2.5 px-4">Score</th>
                      <th className="py-2.5 px-4">Result</th>
                      <th className="py-2.5 px-4">Time</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {attempts.slice(0, 3).map((att, idx) => (
                      <tr key={`recent_att_${att.id}_${idx}`} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white">
                          Set {att.setNumber} (Tier {att.difficultyTier})
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400 tabular-nums">
                          {att.percentage}% ({att.score}/{att.totalQuestions})
                        </td>
                        <td className="py-3 px-4">
                          {att.passed ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              PASSED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              BELOW 70%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono tabular-nums">
                          {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(att.completedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onReviewAttempt(att)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

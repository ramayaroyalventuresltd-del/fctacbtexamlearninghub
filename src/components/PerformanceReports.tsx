import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { ExamAttempt, UserProfile } from '../types';
import { DIFFICULTY_TIERS } from '../data/cadresAndLevels';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Filter,
  BarChart3,
  Layers,
  Zap,
  ArrowUpRight
} from 'lucide-react';

interface PerformanceReportsProps {
  attempts: ExamAttempt[];
  user: UserProfile;
  onReviewAttempt: (attempt: ExamAttempt) => void;
  onLaunchTest: () => void;
}

export const PerformanceReports: React.FC<PerformanceReportsProps> = ({
  attempts,
  user,
  onReviewAttempt,
  onLaunchTest
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');

  // Chronological order (oldest to newest for line chart over time)
  const chronologicalAttempts = useMemo(() => {
    const sorted = [...attempts].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    if (selectedTierFilter === 'all') return sorted;
    return sorted.filter((a) => a.difficultyTier === Number(selectedTierFilter));
  }, [attempts, selectedTierFilter]);

  // Overall metrics
  const totalExams = attempts.length;
  const passedExams = attempts.filter((a) => a.passed).length;
  const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
  const avgScore =
    totalExams > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalExams)
      : 0;
  const highestScore =
    totalExams > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;

  // Domain breakdown averages
  const domainAverages = useMemo(() => {
    if (totalExams === 0) {
      return { psr: 0, fr: 0, ppa: 0, fcta_gk: 0, cadre: 0 };
    }
    const sums = { psr: 0, fr: 0, ppa: 0, fcta_gk: 0, cadre: 0 };
    attempts.forEach((a) => {
      sums.psr += a.subjectBreakdown?.psr?.scorePct || 0;
      sums.fr += a.subjectBreakdown?.fr?.scorePct || 0;
      sums.ppa += a.subjectBreakdown?.ppa?.scorePct || 0;
      sums.fcta_gk += a.subjectBreakdown?.fcta_gk?.scorePct || 0;
      sums.cadre += a.subjectBreakdown?.cadre?.scorePct || 0;
    });
    return {
      psr: Math.round(sums.psr / totalExams),
      fr: Math.round(sums.fr / totalExams),
      ppa: Math.round(sums.ppa / totalExams),
      fcta_gk: Math.round(sums.fcta_gk / totalExams),
      cadre: Math.round(sums.cadre / totalExams)
    };
  }, [attempts, totalExams]);

  // Tier metrics
  const tierStats = useMemo(() => {
    return [1, 2, 3, 4].map((tierNum) => {
      const tierAttempts = attempts.filter((a) => a.difficultyTier === tierNum);
      const tierCount = tierAttempts.length;
      const best = tierCount > 0 ? Math.max(...tierAttempts.map((a) => a.percentage)) : 0;
      const avg =
        tierCount > 0
          ? Math.round(tierAttempts.reduce((acc, a) => acc + a.percentage, 0) / tierCount)
          : 0;
      const passed = tierAttempts.some((a) => a.passed);
      const tierInfo = DIFFICULTY_TIERS.find((t) => t.tier === tierNum);
      return {
        tier: tierNum,
        info: tierInfo,
        count: tierCount,
        best,
        avg,
        passed
      };
    });
  }, [attempts]);

  // Recharts formatted data
  const chartData = useMemo(() => {
    return chronologicalAttempts.map((att, idx) => {
      return {
        index: idx + 1,
        label: `#${idx + 1} (S${att.setNumber})`,
        score: att.percentage,
        passThreshold: 70,
        tier: att.difficultyTier,
        cycleIndex: att.cycleIndex,
        setNumber: att.setNumber,
        date: new Date(att.completedAt).toLocaleDateString(),
        passed: att.passed,
        rawAttempt: att
      };
    });
  }, [chronologicalAttempts]);

  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const att = data.rawAttempt as ExamAttempt;

      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white">
              Cycle {att.cycleIndex} · Set {att.setNumber} (Tier {att.difficultyTier})
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                att.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {att.passed ? 'PASSED' : 'BELOW 70%'}
            </span>
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Score:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {att.percentage}% ({att.score}/100)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-slate-300">{new Date(att.completedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time:</span>
              <span className="text-slate-300 font-mono">
                {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
              </span>
            </div>
          </div>

          <button
            onClick={() => onReviewAttempt(att)}
            className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-center text-[11px] flex items-center justify-center gap-1 transition"
          >
            <span>Review Full Corrections</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* KPI Stats Overview Cards: 2-col on mobile, 4-col on tablet/desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Average Score</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1 tabular-nums">
            {avgScore}%
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">across exams</span>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400">
            Official pass mark: <strong className="text-emerald-400">70%</strong>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Pass Rate</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1 tabular-nums">
            {passRate}%
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">
              ({passedExams}/{totalExams})
            </span>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400">
            {passedExams} exam{passedExams !== 1 ? 's' : ''} qualified ≥ 70%
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Peak Score</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1 tabular-nums">
            {highestScore}%
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">best record</span>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400">
            {highestScore >= 70 ? 'Eligible for advancement' : 'Requires revision'}
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Tests Completed</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono flex items-baseline gap-1 tabular-nums">
            {totalExams}
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">evaluations</span>
          </div>
          <div className="mt-2 text-[10px] sm:text-[11px] text-slate-400">
            Recorded in officer profile
          </div>
        </div>
      </div>

      {/* Main Performance Over Time Line Chart (Fluid Recharts Implementation) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Visual Trajectory
              </span>
              <span className="text-xs text-slate-400">Pass Mark (70%) Target</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Examination Performance Over Time
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fluid multi-device chart visualizing candidate scores over consecutive examination attempts
            </p>
          </div>

          {/* Difficulty Tier Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs shrink-0 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Tier:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: '1', label: 'T1' },
              { id: '2', label: 'T2' },
              { id: '3', label: 'T3' },
              { id: '4', label: 'T4' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedTierFilter(f.id)}
                className={`px-3 py-1 rounded-lg font-bold transition whitespace-nowrap min-h-[32px] ${
                  selectedTierFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Container */}
        {chronologicalAttempts.length === 0 ? (
          <div className="py-12 sm:py-16 text-center border border-dashed border-slate-800 rounded-2xl p-6 sm:p-8 bg-slate-950/50">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500 mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">No Examination Data Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
              {selectedTierFilter !== 'all'
                ? `No tests completed in Tier ${selectedTierFilter}. Select "All" or sit an exam to generate data points.`
                : 'Take your first 100-question CBT exam in Set 1 to start charting your merit scores and promotional trajectory.'}
            </p>
            <button
              onClick={onLaunchTest}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition min-h-[44px]"
            >
              <Zap className="w-4 h-4" />
              Launch Set 1 Exam Now
            </button>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full h-64 sm:h-72 lg:h-80 -ml-2 sm:ml-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="reportsScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 70, 80, 100]}
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#334155' }}
                    tick={{ fill: '#94a3b8' }}
                    unit="%"
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <ReferenceLine
                    y={70}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Pass Mark (70%)',
                      position: 'insideTopRight',
                      fill: '#10b981',
                      fontSize: 10,
                      fontWeight: 700
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#reportsScoreGrad)"
                    activeDot={{
                      r: 6,
                      fill: '#10b981',
                      stroke: '#0f172a',
                      strokeWidth: 2
                    }}
                    dot={{
                      r: 4,
                      fill: '#10b981',
                      stroke: '#0f172a',
                      strokeWidth: 1.5
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Difficulty Tiers Progression Breakdown: 1-col on mobile, 2-col on tablet, 4-col on desktop */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Difficulty Level Performance Matrix
        </h4>
        <p className="text-xs text-slate-400">
          Comparative analysis across the four civil service grade level grouping tiers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tierStats.map((item) => (
            <div
              key={item.tier}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                    Tier {item.tier}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">{item.info?.glRange}</span>
                </div>
                <h5 className="font-bold text-sm text-white">{item.info?.title}</h5>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Attempts:</span>
                  <span className="font-bold text-white tabular-nums">{item.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average:</span>
                  <span className="font-mono font-bold text-white tabular-nums">{item.avg}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Highest:</span>
                  <span className="font-mono font-bold text-emerald-400 tabular-nums">{item.best}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  {item.passed ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Passed
                    </span>
                  ) : item.count > 0 ? (
                    <span className="font-bold text-amber-400">Pending ≥70%</span>
                  ) : (
                    <span className="text-slate-500">Not Attempted</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Domain Cumulative Mastery: responsive 1-col on mobile, 2-col on tablet, 5-col on desktop */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Cumulative Subject Domain Proficiency
        </h4>
        <p className="text-xs text-slate-400">
          Average proficiency calculated across all your examination attempts (20% weight per domain).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Public Service Rules (PSR)', avg: domainAverages.psr, color: 'bg-emerald-500' },
            { label: 'Financial Regulations (FR)', avg: domainAverages.fr, color: 'bg-blue-500' },
            { label: 'Public Procurement Act (PPA)', avg: domainAverages.ppa, color: 'bg-amber-500' },
            { label: 'FCTA General Knowledge', avg: domainAverages.fcta_gk, color: 'bg-teal-500' },
            { label: `Cadre: ${user.cadre || 'Specialized'}`, avg: domainAverages.cadre, color: 'bg-purple-500' }
          ].map((subj, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
                {subj.label}
              </span>
              <div className="text-2xl font-black font-mono mt-1 text-white tabular-nums">
                {subj.avg}%
              </div>
              <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${subj.color}`}
                  style={{ width: `${Math.min(subj.avg, 100)}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-slate-500 flex justify-between">
                <span>0%</span>
                <span className={subj.avg >= 70 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {subj.avg >= 70 ? 'Pass' : 'Below 70%'}
                </span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

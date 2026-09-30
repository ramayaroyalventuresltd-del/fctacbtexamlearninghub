import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { ExamAttempt } from '../types';
import { TrendingUp, Award, Calendar, CheckCircle2, XCircle, ArrowUpRight, BarChart2 } from 'lucide-react';

interface ScoreTrendChartProps {
  attempts: ExamAttempt[];
  onReviewAttempt?: (attempt: ExamAttempt) => void;
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  attempts,
  onReviewAttempt
}) => {
  const [rangeFilter, setRangeFilter] = useState<'all' | '5' | '10'>('all');

  // Sort chronologically (oldest to newest for trend progression)
  const chronologicalAttempts = useMemo(() => {
    const sorted = [...attempts].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    if (rangeFilter === '5') return sorted.slice(-5);
    if (rangeFilter === '10') return sorted.slice(-10);
    return sorted;
  }, [attempts, rangeFilter]);

  // Chart data format
  const chartData = useMemo(() => {
    return chronologicalAttempts.map((att, idx) => {
      const date = new Date(att.completedAt);
      const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });

      return {
        id: att.id,
        attemptNumber: idx + 1,
        label: `T${idx + 1}: Set ${att.setNumber}`,
        shortLabel: `#${idx + 1}`,
        date: dateStr,
        fullDate: date.toLocaleString(),
        score: att.percentage,
        rawScore: `${att.score}/${att.totalQuestions}`,
        passed: att.passed,
        tier: att.difficultyTier,
        setNumber: att.setNumber,
        cycleIndex: att.cycleIndex,
        timeSpentMin: Math.round(att.timeSpentSeconds / 60),
        attemptRef: att
      };
    });
  }, [chronologicalAttempts]);

  // Summary statistics
  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, avg: 0, highest: 0, latest: 0, passRate: 0 };
    }
    const total = attempts.length;
    const passed = attempts.filter((a) => a.passed).length;
    const scores = attempts.map((a) => a.percentage);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const highest = Math.max(...scores);
    const latest = attempts[0]?.percentage ?? 0;
    const passRate = Math.round((passed / total) * 100);

    return { total, avg, highest, latest, passRate };
  }, [attempts]);

  // Custom Recharts Tooltip with accessible styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs z-50">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-white font-mono">
              Cycle {data.cycleIndex} • Set {data.setNumber} (Tier {data.tier})
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                data.passed
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {data.passed ? 'PASSED' : 'BELOW 70%'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Score:</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                {data.score}% ({data.rawScore})
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Pass Mark Target:</span>
              <span className="font-bold font-mono text-slate-300">70%</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Duration:</span>
              <span className="font-mono text-slate-300">{data.timeSpentMin} mins</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/80">
              <span>Date:</span>
              <span>{data.fullDate}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Score Trends & Progression Curve
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing score trajectory against the mandatory 70% civil service promotion benchmark
          </p>
        </div>

        {/* Range filter buttons */}
        {attempts.length > 5 && (
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setRangeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({attempts.length})
            </button>
            <button
              onClick={() => setRangeFilter('10')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeFilter === '10'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 10
            </button>
            <button
              onClick={() => setRangeFilter('5')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                rangeFilter === '5'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 5
            </button>
          </div>
        )}
      </div>

      {/* Quick Trend Stat Badges */}
      {attempts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Average Score</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
              {stats.avg}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across {stats.total} tests</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Peak Score</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1">
              {stats.highest}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Personal best</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Latest Score</div>
            <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${stats.latest >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.latest}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Most recent sitting</div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Pass Rate</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-400 mt-1">
              {stats.passRate}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">≥ 70% threshold</div>
          </div>
        </div>
      )}

      {/* Chart Canvas or Empty State */}
      {attempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl bg-slate-950/50 border border-dashed border-slate-800">
          <div className="p-3 rounded-full bg-slate-800/80 text-slate-400 mb-3">
            <BarChart2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h4 className="text-sm font-bold text-white">No Exam Data Recorded Yet</h4>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Complete your first 100-question CBT exam set above to track your score trends, pass mark benchmarks, and progression history here.
          </p>
        </div>
      ) : (
        <div className="w-full">
          {/* Legend and 70% benchmark note */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mb-3 px-1 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />
                <span className="text-slate-300 font-medium">Your Score (%)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-500/60 border-t border-dashed border-emerald-400 inline-block" />
                <span className="text-emerald-400 font-semibold">70% Pass Mark</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Hover/Tap points to view details
            </span>
          </div>

          {/* Responsive Recharts Container */}
          <div className="w-full h-64 sm:h-72 lg:h-80 -ml-2 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0] && onReviewAttempt) {
                    onReviewAttempt(e.activePayload[0].payload.attemptRef);
                  }
                }}
              >
                <defs>
                  <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
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
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={70}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: 'Pass Mark: 70%',
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
                  fill="url(#scoreTrendGradient)"
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
  );
};

import React, { useState, useEffect } from 'react';
import { ExamAttempt, Question, UserProfile } from '../types';
import { CertificateModal } from './CertificateModal';
import { ReadOutNarratorControl } from './ReadOutNarratorControl';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  RefreshCw,
  FileCheck
} from 'lucide-react';

interface ExamResultViewProps {
  attempt: ExamAttempt;
  questions: Question[];
  unlockedNextSet: boolean;
  currentUser?: UserProfile;
  onReturnToDashboard: () => void;
  onStartNextSet?: () => void;
  onGenerateNewCycle?: () => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  attempt,
  questions,
  unlockedNextSet,
  currentUser,
  onReturnToDashboard,
  onGenerateNewCycle
}) => {
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    if (attempt.passed) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [attempt.passed]);

  const { subjectBreakdown } = attempt;

  const filteredQuestions = questions.filter((q) => {
    const userChoice = attempt.answers[q.id];
    const isCorrect = userChoice === q.correctOptionIndex;
    if (reviewFilter === 'correct') return isCorrect;
    if (reviewFilter === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Result Hero Banner: Mobile stack, Desktop row */}
      <div
        className={`rounded-2xl border p-5 sm:p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden ${
          attempt.passed
            ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-emerald-500/40'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950 border-rose-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-900/80 border border-slate-700">
              <span>Exam Set {attempt.setNumber} (Tier {attempt.difficultyTier})</span>
              <span>·</span>
              <span>Cycle #{attempt.cycleIndex}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {attempt.passed ? 'Promotion Test Passed!' : 'Pass Mark Not Reached'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {attempt.passed ? (
                <>
                  Congratulations! You achieved <strong className="text-emerald-400 font-mono">{attempt.percentage}%</strong>, surpassing the official FCTA pass mark of <strong>70%</strong>.
                  {unlockedNextSet && (
                    <span className="block mt-1 font-semibold text-emerald-300">
                      Exam Set {attempt.setNumber + 1} has now been officially unlocked on your dashboard!
                    </span>
                  )}
                  {attempt.setNumber === 4 && (
                    <span className="block mt-1 font-semibold text-amber-300">
                      Outstanding! You have completed all 4 difficulty levels of this exam cycle!
                    </span>
                  )}
                </>
              ) : (
                <>
                  You scored <strong className="text-rose-400 font-mono">{attempt.percentage}%</strong>. The required civil service qualification threshold is <strong>70%</strong>. Review the corrections below and retake this set when ready.
                </>
              )}
            </p>
          </div>

          {/* Big Score Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center shrink-0 w-full sm:w-auto min-w-[200px]">
            <div className="text-4xl sm:text-5xl font-black font-mono text-white mb-1 tabular-nums">
              {attempt.score}
              <span className="text-lg sm:text-xl font-normal text-slate-400">/100</span>
            </div>
            <div
              className={`text-xs sm:text-sm font-black font-mono uppercase px-3 py-1 rounded-full ${
                attempt.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {attempt.percentage}% · {attempt.passed ? 'QUALIFIED' : 'BELOW 70%'}
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>Time: {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Domain Subject Breakdown (20 Qs each) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white">
        <h3 className="text-sm sm:text-base font-bold mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Equal Domain Breakdown (20% Weight per Section)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Public Service Rules (PSR)', key: 'psr' },
            { label: 'Financial Regulations (FR)', key: 'fr' },
            { label: 'Public Procurement Act (PPA)', key: 'ppa' },
            { label: 'FCTA General Knowledge', key: 'fcta_gk' },
            { label: `Cadre: ${attempt.cadre || 'Specialized'}`, key: 'cadre' }
          ].map((subj) => {
            const data = (subjectBreakdown as any)[subj.key] || { total: 20, correct: 0, scorePct: 0 };
            const isSubjPass = data.scorePct >= 70;

            return (
              <div
                key={subj.key}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">
                    {subj.label}
                  </span>
                  <div className="text-xl font-black font-mono mt-1 text-white tabular-nums">
                    {data.correct} <span className="text-xs text-slate-500">/ {data.total}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1 font-mono tabular-nums">
                    <span className={isSubjPass ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {data.scorePct}%
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {isSubjPass ? 'Pass' : 'Review'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isSubjPass ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(data.scorePct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons: Responsive Wrap with min-h-[44px] */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          onClick={onReturnToDashboard}
          className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Portal Dashboard</span>
        </button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {attempt.passed && (
            <button
              onClick={() => setShowCertificate(true)}
              className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition min-h-[44px]"
            >
              <Award className="w-4 h-4 text-amber-200" />
              <span>Official Certificate (ISO 9001)</span>
            </button>
          )}

          <button
            onClick={() => setShowDetailedReview((prev) => !prev)}
            className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition min-h-[44px]"
          >
            <BookOpen className="w-4 h-4" />
            <span>{showDetailedReview ? 'Hide Corrections' : 'Review 100 Questions & Citations'}</span>
            {showDetailedReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {attempt.setNumber === 4 && attempt.passed && onGenerateNewCycle && (
            <button
              onClick={onGenerateNewCycle}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/40 transition flex items-center justify-center gap-2 min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generate Cycle #{attempt.cycleIndex + 1}</span>
            </button>
          )}
        </div>
      </div>

      {/* Detailed Question-by-Question Corrections Accordion */}
      {showDetailedReview && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Comprehensive Examination Review & Citations
              </h4>
              <p className="text-xs text-slate-400">
                Detailed explanations referenced to PSR rules, FR codes, and PPA sections
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto overflow-x-auto">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap min-h-[32px] ${
                  reviewFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                All (100)
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap min-h-[32px] ${
                  reviewFilter === 'correct' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                Correct ({attempt.score})
              </button>
              <button
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap min-h-[32px] ${
                  reviewFilter === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400'
                }`}
              >
                Mistakes ({100 - attempt.score})
              </button>
            </div>
          </div>

          {/* List of reviewed questions */}
          <div className="space-y-4 divide-y divide-slate-800/80">
            {filteredQuestions.map((q, idx) => {
              const userChoice = attempt.answers[q.id];
              const isCorrect = userChoice === q.correctOptionIndex;
              const options = [q.optionA, q.optionB, q.optionC, q.optionD];

              return (
                <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-400">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {q.subject}
                      </span>
                      <span className="text-xs font-semibold text-emerald-400">
                        {q.chapterOrTopic}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ReadOutNarratorControl
                        questionNumber={idx + 1}
                        questionText={q.questionText}
                        options={[
                          { label: 'A', text: q.optionA },
                          { label: 'B', text: q.optionB },
                          { label: 'C', text: q.optionC },
                          { label: 'D', text: q.optionD }
                        ]}
                        variant="inline"
                      />

                      {isCorrect ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Correct
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {options.map((optText, optIdx) => {
                      const isChosen = userChoice === optIdx;
                      const isActualCorrect = q.correctOptionIndex === optIdx;

                      let style = 'bg-slate-950 border-slate-800 text-slate-400';
                      if (isActualCorrect) {
                        style = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 font-bold';
                      } else if (isChosen && !isActualCorrect) {
                        style = 'bg-rose-950/60 border-rose-500/60 text-rose-200 line-through';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 ${style}`}
                        >
                          <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] bg-slate-800 text-slate-300 shrink-0">
                            {['A', 'B', 'C', 'D'][optIdx]}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation & Statutory Reference */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>Official Regulatory Authority:</span>
                      <span className="text-slate-300 font-normal">{q.referenceDoc}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ISO 9001 Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          isOpen={showCertificate}
          attempt={attempt}
          user={currentUser}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { Question } from '../types';
import { ReadOutNarratorControl } from './ReadOutNarratorControl';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calculator,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  FileText,
  Strikethrough,
  ShieldCheck,
  LayoutGrid,
  Settings
} from 'lucide-react';

export type ExamTheme = 'dark' | 'light' | 'high-contrast' | 'sepia';

interface ExamRunnerProps {
  questions: Question[];
  setNumber: number;
  difficultyTier: number;
  durationMinutes: number;
  cadreName: string;
  onFinishExam: (answers: Record<string, number>, timeSpentSeconds: number) => void;
  onCancelExam: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  questions,
  setNumber,
  difficultyTier,
  durationMinutes,
  cadreName,
  onFinishExam
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, Record<number, boolean>>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);

  // Tools & Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [calcInput, setCalcInput] = useState('');

  // Accessibility & Display Modes
  const [theme, setTheme] = useState<ExamTheme>('dark');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusWarningsCount, setFocusWarningsCount] = useState(0);
  const [showFocusWarningModal, setShowFocusWarningModal] = useState(false);

  // Monitor window blur
  useEffect(() => {
    const handleBlur = () => {
      setFocusWarningsCount((prev) => {
        const next = prev + 1;
        setShowFocusWarningModal(true);
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  const currentQ = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;

  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsRemaining <= 300; // < 5 mins
  const isCriticalTime = secondsRemaining <= 60; // < 1 min

  const handleSelectOption = (optIndex: number) => {
    if (eliminatedOptions[currentQ.id]?.[optIndex]) {
      setEliminatedOptions((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          [optIndex]: false
        }
      }));
    }
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIndex
    }));
  };

  const handleToggleEliminate = (e: React.MouseEvent, optIndex: number) => {
    e.stopPropagation();
    setEliminatedOptions((prev) => {
      const currentElim = prev[currentQ.id] || {};
      return {
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          [optIndex]: !currentElim[optIndex]
        }
      };
    });
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleClearAnswer = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const handleFinalSubmit = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    const timeSpent = durationMinutes * 60 - secondsRemaining;
    onFinishExam(answers, Math.max(timeSpent, 1));
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleCalcClick = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      return;
    }
    if (val === '=') {
      try {
        const sanitized = calcInput.replace(/[^0-9+\-*/.]/g, '');
        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        setCalcInput(String(res));
      } catch (e) {
        setCalcInput('Error');
      }
      return;
    }
    setCalcInput((prev) => prev + val);
  };

  const filteredIndices = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (activeSubjectFilter === 'all') return true;
        return q.subject === activeSubjectFilter;
      })
      .map(({ idx }) => idx);
  }, [questions, activeSubjectFilter]);

  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'light':
        return {
          wrapper: 'bg-slate-50 text-slate-900',
          header: 'bg-white border-slate-200 text-slate-900',
          card: 'bg-white border-slate-200 text-slate-900 shadow-md',
          subCard: 'bg-slate-100 border-slate-200 text-slate-700',
          optionDefault: 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100',
          optionSelected: 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-sm',
          textMuted: 'text-slate-500',
          timer: 'bg-slate-100 text-slate-900 border-slate-300',
          paletteEmpty: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
        };
      case 'high-contrast':
        return {
          wrapper: 'bg-black text-white',
          header: 'bg-black border-white text-white',
          card: 'bg-black border-2 border-white text-white shadow-none',
          subCard: 'bg-black border border-white text-white',
          optionDefault: 'bg-black border-2 border-white text-white hover:bg-slate-900',
          optionSelected: 'bg-yellow-400 border-2 border-white text-black font-black',
          textMuted: 'text-yellow-300',
          timer: 'bg-black text-yellow-300 border-2 border-yellow-300',
          paletteEmpty: 'bg-black text-white border border-white hover:bg-slate-900'
        };
      case 'sepia':
        return {
          wrapper: 'bg-[#f4ecd8] text-[#433422]',
          header: 'bg-[#ebdcb9] border-[#d4be93] text-[#433422]',
          card: 'bg-[#faf6ed] border-[#d4be93] text-[#433422] shadow-md',
          subCard: 'bg-[#f1e6cd] border-[#d4be93] text-[#433422]',
          optionDefault: 'bg-[#f7f1e1] border-[#d4be93] text-[#433422] hover:bg-[#f1e6cd]',
          optionSelected: 'bg-[#e5d4ab] border-[#8a6829] text-[#2c2010] font-bold shadow-sm',
          textMuted: 'text-[#6b583f]',
          timer: 'bg-[#f1e6cd] text-[#6b583f] border-[#d4be93]',
          paletteEmpty: 'bg-[#f7f1e1] text-[#6b583f] border-[#d4be93] hover:bg-[#eedfb9]'
        };
      case 'dark':
      default:
        return {
          wrapper: 'bg-slate-950 text-slate-100',
          header: 'bg-slate-900/95 border-slate-800 text-white',
          card: 'bg-slate-900 border-slate-800 text-white shadow-xl',
          subCard: 'bg-slate-950 border-slate-800 text-slate-300',
          optionDefault: 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700',
          optionSelected: 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950/30 font-semibold',
          textMuted: 'text-slate-400',
          timer: isCriticalTime ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse' : isLowTime ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-slate-950 text-emerald-400 border-slate-800',
          paletteEmpty: 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
        };
    }
  }, [theme, isLowTime, isCriticalTime]);

  return (
    <div className={`min-h-screen min-h-[100dvh] flex flex-col transition-colors duration-200 overflow-x-hidden ${themeStyles.wrapper}`}>
      {/* Responsive Top Exam Navigation Bar */}
      <header className={`sticky top-0 z-30 border-b px-3 sm:px-6 py-2.5 shadow-md backdrop-blur-md ${themeStyles.header}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Set & Tier badge */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 whitespace-nowrap">
              Set {setNumber} · Tier {difficultyTier}
            </span>
            <span className={`text-xs ${themeStyles.textMuted} hidden md:inline truncate max-w-[200px]`}>
              Cadre: <strong className="text-emerald-400">{cadreName}</strong>
            </span>
          </div>

          {/* Center: Countdown Timer */}
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-xl border font-mono font-black text-xs sm:text-base tabular-nums transition ${themeStyles.timer}`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>{formatTimer(secondsRemaining)}</span>
            {isLowTime && (
              <span className="text-[9px] sm:text-[10px] uppercase font-sans font-bold hidden xs:inline">
                {isCriticalTime ? 'FINAL' : 'LOW'}
              </span>
            )}
          </div>

          {/* Right: Tools & Submit Exam button */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Desktop & Tablet Tools */}
            <div className="hidden md:flex items-center gap-1.5">
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as ExamTheme)}
                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none ${themeStyles.subCard}`}
                title="International Display Theme"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Paper Light</option>
                <option value="high-contrast">High Contrast</option>
                <option value="sepia">Warm Sepia</option>
              </select>

              <ReadOutNarratorControl
                questionNumber={currentIndex + 1}
                questionText={currentQ.questionText}
                options={[
                  { label: 'A', text: currentQ.optionA },
                  { label: 'B', text: currentQ.optionB },
                  { label: 'C', text: currentQ.optionC },
                  { label: 'D', text: currentQ.optionD }
                ]}
                variant="toolbar"
              />

              <button
                onClick={() => setShowScratchpad((prev) => !prev)}
                className={`p-2 rounded-xl border text-xs transition flex items-center gap-1 ${
                  showScratchpad ? 'bg-amber-600 text-white' : themeStyles.subCard
                }`}
                title="Scratchpad"
              >
                <FileText className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => setShowCalculator((prev) => !prev)}
                className={`p-2 rounded-xl border text-xs transition flex items-center gap-1 ${
                  showCalculator ? 'bg-blue-600 text-white' : themeStyles.subCard
                }`}
                title="Calculator"
              >
                <Calculator className="w-4 h-4 text-blue-400" />
              </button>

              <button
                onClick={handleToggleFullscreen}
                className={`p-2 rounded-xl border text-xs transition ${themeStyles.subCard}`}
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Mobile Tools Drawer Trigger */}
            <button
              onClick={() => setShowMobileTools((prev) => !prev)}
              className={`md:hidden p-2 rounded-xl border text-xs min-h-[38px] min-w-[38px] flex items-center justify-center ${themeStyles.subCard}`}
              aria-label="Exam tools"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {/* Mobile Question Palette Drawer Trigger */}
            <button
              onClick={() => setShowMobilePalette(true)}
              className={`lg:hidden p-2 rounded-xl border text-xs min-h-[38px] min-w-[38px] flex items-center justify-center gap-1 ${themeStyles.subCard}`}
              aria-label="Open 100 questions palette"
            >
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-mono font-bold hidden xs:inline">{currentIndex + 1}/100</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition flex items-center gap-1.5 shrink-0 min-h-[38px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Exam</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>

        {/* Mobile Tools Dropdown Bar */}
        {showMobileTools && (
          <div className="md:hidden mt-2 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 overflow-x-auto pb-1 animate-in slide-in-from-top-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ExamTheme)}
              className={`text-xs px-2 py-1.5 rounded-lg border ${themeStyles.subCard}`}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="high-contrast">Contrast</option>
              <option value="sepia">Sepia</option>
            </select>

            <button
              onClick={() => {
                setShowScratchpad((prev) => !prev);
                setShowMobileTools(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1 ${themeStyles.subCard}`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Notes</span>
            </button>

            <button
              onClick={() => {
                setShowCalculator((prev) => !prev);
                setShowMobileTools(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1 ${themeStyles.subCard}`}
            >
              <Calculator className="w-3.5 h-3.5 text-blue-400" />
              <span>Calc</span>
            </button>

            <div className={`flex items-center rounded-lg border p-0.5 text-xs ${themeStyles.subCard}`}>
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'sm' ? 'bg-emerald-600 text-white' : ''}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'md' ? 'bg-emerald-600 text-white' : ''}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'lg' ? 'bg-emerald-600 text-white' : ''}`}
              >
                A+
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left / Center: Active Question Display (8 cols on lg) */}
        <main className={`lg:col-span-8 flex flex-col justify-between rounded-2xl p-4 sm:p-6 lg:p-8 border ${themeStyles.card}`}>
          <div>
            {/* Question Header Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-4 sm:mb-6 border-slate-700/40 gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black font-mono">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase bg-slate-800 text-emerald-400 border border-slate-700">
                  {currentQ.subject === 'psr' && 'Public Service Rules'}
                  {currentQ.subject === 'fr' && 'Financial Regulations'}
                  {currentQ.subject === 'ppa' && 'Public Procurement Act'}
                  {currentQ.subject === 'fcta_gk' && 'FCTA General Knowledge'}
                  {currentQ.subject === 'cadre' && `Cadre: ${cadreName}`}
                </span>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <ReadOutNarratorControl
                  questionNumber={currentIndex + 1}
                  questionText={currentQ.questionText}
                  options={[
                    { label: 'A', text: currentQ.optionA },
                    { label: 'B', text: currentQ.optionB },
                    { label: 'C', text: currentQ.optionC },
                    { label: 'D', text: currentQ.optionD }
                  ]}
                  variant="inline"
                />

                <button
                  onClick={handleToggleFlag}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border transition min-h-[38px] ${
                    flagged[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'border-slate-700/50 hover:opacity-80'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>
            </div>

            {/* Chapter context citation */}
            <div className={`text-[11px] font-mono mb-3 ${themeStyles.textMuted}`}>
              Statutory Context: <span className="font-semibold">{currentQ.chapterOrTopic}</span>
            </div>

            {/* Question Prompt */}
            <div
              className={`font-semibold leading-relaxed mb-6 ${
                fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
              }`}
            >
              {currentQ.questionText}
            </div>

            {/* Options List with Option Eliminator tool */}
            <div className="space-y-3">
              {[
                { label: 'A', text: currentQ.optionA, idx: 0 },
                { label: 'B', text: currentQ.optionB, idx: 1 },
                { label: 'C', text: currentQ.optionC, idx: 2 },
                { label: 'D', text: currentQ.optionD, idx: 3 }
              ].map((opt) => {
                const isSelected = answers[currentQ.id] === opt.idx;
                const isEliminated = Boolean(eliminatedOptions[currentQ.id]?.[opt.idx]);

                return (
                  <div
                    key={opt.label}
                    onClick={() => handleSelectOption(opt.idx)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer min-h-[48px] ${
                      isSelected
                        ? themeStyles.optionSelected
                        : isEliminated
                        ? 'opacity-40 line-through bg-slate-900/30 border-dashed border-slate-700'
                        : themeStyles.optionDefault
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span
                        className={`leading-normal ${
                          fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base' : 'text-sm'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleEliminate(e, opt.idx)}
                      className={`p-2 rounded-lg text-xs font-semibold shrink-0 transition min-w-[36px] min-h-[36px] flex items-center justify-center ${
                        isEliminated
                          ? 'text-rose-400 bg-rose-950/30'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isEliminated ? 'Restore Option' : 'Eliminate/Strike through Option'}
                    >
                      <Strikethrough className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls Footer */}
          <div className="mt-8 pt-5 border-t border-slate-700/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className={`px-3 sm:px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 min-h-[44px] ${themeStyles.subCard}`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden xs:inline">Previous</span>
              </button>

              {answers[currentQ.id] !== undefined && (
                <button
                  onClick={handleClearAnswer}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition min-h-[44px] ${themeStyles.subCard}`}
                  title="Clear chosen option"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs ${themeStyles.textMuted} hidden md:inline`}>
                {answeredCount} of {totalQuestions} answered
              </span>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition min-h-[44px]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition min-h-[44px]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Exam</span>
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right: Question Palette (Persistent on Desktop >= 1024px, 4 cols) */}
        <aside className="hidden lg:block lg:col-span-4 space-y-4">
          <div className={`rounded-2xl p-5 border ${themeStyles.card}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${themeStyles.textMuted}`}>
              Exam Palette & Status
            </h4>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-center">
                <div className="font-bold text-sm font-mono tabular-nums">{answeredCount}</div>
                <div>Answered</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-center">
                <div className="font-bold text-sm font-mono tabular-nums">{flaggedCount}</div>
                <div>Flagged</div>
              </div>
              <div className={`p-2 rounded-lg border text-center ${themeStyles.subCard}`}>
                <div className="font-bold text-sm font-mono tabular-nums">{unansweredCount}</div>
                <div>Remaining</div>
              </div>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex flex-wrap gap-1 mb-4">
              {[
                { id: 'all', label: 'All' },
                { id: 'psr', label: 'PSR' },
                { id: 'fr', label: 'FR' },
                { id: 'ppa', label: 'PPA' },
                { id: 'fcta_gk', label: 'GK' },
                { id: 'cadre', label: 'Cadre' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveSubjectFilter(filter.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                    activeSubjectFilter === filter.id
                      ? 'bg-emerald-600 text-white'
                      : themeStyles.paletteEmpty
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* 1-100 Question Grid */}
            <div className="max-h-[380px] overflow-y-auto pr-1">
              <div className="grid grid-cols-5 gap-1.5">
                {filteredIndices.map((qIdx) => {
                  const qItem = questions[qIdx];
                  const isAnswered = answers[qItem.id] !== undefined;
                  const isFlagged = flagged[qItem.id];
                  const isCurrent = qIdx === currentIndex;

                  return (
                    <button
                      key={`pal_desk_${qIdx}_${qItem.id}`}
                      onClick={() => setCurrentIndex(qIdx)}
                      className={`h-9 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center relative tabular-nums ${
                        isCurrent
                          ? 'ring-2 ring-blue-400 bg-blue-600 text-white z-10'
                          : isFlagged
                          ? 'bg-amber-600/80 text-white border border-amber-400'
                          : isAnswered
                          ? 'bg-emerald-600 text-white'
                          : themeStyles.paletteEmpty
                      }`}
                    >
                      {qIdx + 1}
                      {isFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile & Tablet Modal Question Palette Drawer */}
      {showMobilePalette && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-3xl sm:rounded-2xl w-full max-w-lg mx-auto p-5 text-white max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-emerald-400" />
                Examination Question Palette (1-100)
              </h4>
              <button
                onClick={() => setShowMobilePalette(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-3 text-[11px]">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-center">
                <div className="font-bold text-sm font-mono">{answeredCount}</div>
                <div>Answered</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-center">
                <div className="font-bold text-sm font-mono">{flaggedCount}</div>
                <div>Flagged</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center text-slate-300">
                <div className="font-bold text-sm font-mono">{unansweredCount}</div>
                <div>Remaining</div>
              </div>
            </div>

            {/* 1-100 Grid in Mobile Sheet */}
            <div className="flex-1 overflow-y-auto pr-1 my-2">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {questions.map((qItem, qIdx) => {
                  const isAnswered = answers[qItem.id] !== undefined;
                  const isFlagged = flagged[qItem.id];
                  const isCurrent = qIdx === currentIndex;

                  return (
                    <button
                      key={`pal_mob_${qIdx}_${qItem.id}`}
                      onClick={() => {
                        setCurrentIndex(qIdx);
                        setShowMobilePalette(false);
                      }}
                      className={`h-11 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center relative tabular-nums ${
                        isCurrent
                          ? 'ring-2 ring-blue-400 bg-blue-600 text-white'
                          : isFlagged
                          ? 'bg-amber-600 text-white border border-amber-400'
                          : isAnswered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {qIdx + 1}
                      {isFlagged && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowMobilePalette(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Close Palette
            </button>
          </div>
        </div>
      )}

      {/* Digital Scratchpad Pop-Up Tool (Responsive Position) */}
      {showScratchpad && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              Candidate Scratchpad / Rough Notes
            </span>
            <button
              onClick={() => setShowScratchpad(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mb-2">
            Notes are private to your session and automatically saved during your test.
          </p>
          <textarea
            rows={5}
            value={scratchpadText}
            onChange={(e) => setScratchpadText(e.target.value)}
            placeholder="Type formulas, notes, or reminders..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono resize-none"
          />
        </div>
      )}

      {/* Financial Calculator Pop-Up (Responsive Position) */}
      {showCalculator && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-72 z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 text-white animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-400" />
              Financial Calculator
            </span>
            <button
              onClick={() => setShowCalculator(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-right font-mono text-lg mb-3 h-12 overflow-x-auto text-emerald-400">
            {calcInput || '0'}
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            {['7', '8', '9', '/'].map((b) => (
              <button
                key={b}
                onClick={() => handleCalcClick(b)}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                {b}
              </button>
            ))}
            {['4', '5', '6', '*'].map((b) => (
              <button
                key={b}
                onClick={() => handleCalcClick(b)}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                {b}
              </button>
            ))}
            {['1', '2', '3', '-'].map((b) => (
              <button
                key={b}
                onClick={() => handleCalcClick(b)}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                {b}
              </button>
            ))}
            {['0', '.', '=', '+'].map((b) => (
              <button
                key={b}
                onClick={() => handleCalcClick(b)}
                className={`p-2.5 rounded-lg ${
                  b === '=' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {b}
              </button>
            ))}
            <button
              onClick={() => handleCalcClick('C')}
              className="col-span-4 p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Focus Loss Proctoring Warning Modal */}
      {showFocusWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/60 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl text-center space-y-3">
            <h3 className="text-lg font-black text-white">
              Examination Focus Integrity Notice
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our automated proctoring monitor detected that the browser window lost focus or a background application was activated (Notice #{focusWarningsCount}).
            </p>
            <p className="text-[11px] text-amber-300 font-medium">
              Under ISO/IEC 23988 proctoring standards, please remain inside the CBT examination interface until your test is concluded.
            </p>
            <button
              onClick={() => setShowFocusWarningModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition min-h-[44px]"
            >
              I Understand • Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              Confirm Examination Submission
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to conclude and submit your 100-question test for Exam Set {setNumber}?
            </p>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs mb-6 font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="font-bold text-white tabular-nums">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Answered:</span>
                <span className="font-bold text-emerald-400 tabular-nums">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unanswered / Omitted:</span>
                <span className={`font-bold tabular-nums ${unansweredCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {unansweredCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flagged for Review:</span>
                <span className="font-bold text-amber-400 tabular-nums">{flaggedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time Remaining:</span>
                <span className="font-mono font-bold text-white tabular-nums">{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs mb-4">
                Notice: You have {unansweredCount} unanswered questions. Unanswered questions will receive zero marks.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition min-h-[44px]"
              >
                Return to Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/40 transition min-h-[44px]"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

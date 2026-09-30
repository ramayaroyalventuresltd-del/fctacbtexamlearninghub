import React, { useState, useEffect } from 'react';
import { SLIDER_STEPS } from '../data/cadresAndLevels';
import {
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Layers,
  Award,
  Clock,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const HowToUseSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDER_STEPS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const step = SLIDER_STEPS[currentIdx];

  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case 'UserCheck':
        return <UserCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />;
      case 'Layers':
        return <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />;
      case 'Award':
        return <Award className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400" />;
      case 'Clock':
        return <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400" />;
      case 'RefreshCw':
        return <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />;
      default:
        return <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />;
    }
  };

  return (
    <div
      className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 shadow-2xl p-4 sm:p-6 text-white overflow-hidden w-full"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Orientation Guide
          </span>
          <span className="text-xs text-slate-400">
            Step {currentIdx + 1} of {SLIDER_STEPS.length}
          </span>
        </div>

        {/* Carousel indicator dots */}
        <div className="flex gap-1.5">
          {SLIDER_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIdx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
              title={`Go to step ${idx + 1}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Slide Visual Graphic Box */}
      <div className="relative mb-4 rounded-xl bg-slate-800/80 border border-slate-700/60 p-4 sm:p-5 overflow-hidden">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 shadow-inner shrink-0">
            {getStepIcon(step.iconName)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 block truncate">
              {step.tagline}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">{step.title}</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">{step.description}</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap gap-1.5 sm:gap-2">
          {step.highlights.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Slider Controls */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <button
          onClick={() => setCurrentIdx((prev) => (prev === 0 ? SLIDER_STEPS.length - 1 : prev - 1))}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition min-h-[40px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] text-slate-400 hidden sm:inline text-center">
          Auto-switches every 6s
        </span>

        <button
          onClick={() => setCurrentIdx((prev) => (prev + 1) % SLIDER_STEPS.length)}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40 transition min-h-[40px]"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useReadOutNarrator, VoiceId, NARRATOR_VOICES } from '../hooks/useReadOutNarrator';
import { Volume2, VolumeX, Pause, Play, ChevronDown, Check, Sparkles, User, Settings2 } from 'lucide-react';

interface ReadOutNarratorControlProps {
  questionNumber?: number;
  questionText: string;
  options?: { label: string; text: string }[];
  explanation?: string;
  referenceDoc?: string;
  variant?: 'toolbar' | 'inline' | 'compact';
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

export const ReadOutNarratorControl: React.FC<ReadOutNarratorControlProps> = ({
  questionNumber,
  questionText,
  options,
  explanation,
  referenceDoc,
  variant = 'toolbar',
  onSpeakingChange
}) => {
  const {
    selectedVoiceId,
    currentProfile,
    isSpeaking,
    isPaused,
    rateMultiplier,
    voices,
    changeVoice,
    changeRate,
    speakText,
    stop,
    pause,
    resume,
    previewVoice
  } = useReadOutNarrator();

  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSpeaking);
    }
  }, [isSpeaking, onSpeakingChange]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowVoiceMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format full text for narration
  const buildNarrationText = (): string => {
    let text = '';
    if (questionNumber !== undefined) {
      text += `Question ${questionNumber}. `;
    }
    text += `${questionText}. `;

    if (options && options.length > 0) {
      text += 'Options are: ';
      options.forEach((opt) => {
        text += `Option ${opt.label}: ${opt.text}. `;
      });
    }

    if (explanation) {
      text += `Official Explanation: ${explanation}. `;
    }

    if (referenceDoc) {
      text += `Statutory Reference: ${referenceDoc}.`;
    }

    return text;
  };

  const handleTogglePlay = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        stop();
      }
    } else {
      const text = buildNarrationText();
      speakText(text);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={menuRef}>
      {/* Primary Read Out Button */}
      <button
        onClick={handleTogglePlay}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
          isSpeaking
            ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/40 animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:text-white'
        }`}
        title={isSpeaking ? 'Stop Auditory Readout' : `Read aloud with ${currentProfile.name}`}
      >
        {isSpeaking ? (
          <VolumeX className="w-3.5 h-3.5 text-white" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span className="font-sans">
          {isSpeaking ? 'Stop Reading' : variant === 'compact' ? 'Listen' : 'Read Out'}
        </span>
        {isSpeaking && (
          <span className="flex gap-0.5 ml-0.5 items-center">
            <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
          </span>
        )}
      </button>

      {/* Voice Selection Pill */}
      <button
        onClick={() => setShowVoiceMenu((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition"
        title="Select Voice (2 Men & 2 Women)"
      >
        <span className="text-sm">{currentProfile.icon}</span>
        <span className="hidden md:inline text-[11px] font-medium text-slate-200">
          {currentProfile.name}
        </span>
        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono hidden lg:inline">
          {currentProfile.gender === 'male' ? 'M' : 'F'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Voice Selector Popover Menu */}
      {showVoiceMenu && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-emerald-500/30 p-3 shadow-2xl z-50 text-slate-200 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-white">Narrator Voice Settings</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">2 Men • 2 Women</span>
          </div>

          {/* Voices list grouped by gender */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-1 pt-1">
              Male Examiners (2 Voices)
            </div>
            {voices
              .filter((v) => v.gender === 'male')
              .map((v) => {
                const isSelected = v.id === selectedVoiceId;
                return (
                  <div
                    key={v.id}
                    onClick={() => changeVoice(v.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{v.icon}</span>
                      <div className="truncate">
                        <div className="font-bold flex items-center gap-1.5">
                          {v.name}
                          {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{v.role}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVoice(v.id);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-emerald-300 shrink-0 flex items-center gap-1 ml-2 transition"
                      title="Preview this voice"
                    >
                      <Play className="w-2.5 h-2.5" />
                      Preview
                    </button>
                  </div>
                );
              })}

            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-1 pt-2">
              Female Examiners (2 Voices)
            </div>
            {voices
              .filter((v) => v.gender === 'female')
              .map((v) => {
                const isSelected = v.id === selectedVoiceId;
                return (
                  <div
                    key={v.id}
                    onClick={() => changeVoice(v.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{v.icon}</span>
                      <div className="truncate">
                        <div className="font-bold flex items-center gap-1.5">
                          {v.name}
                          {isSelected && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{v.role}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        previewVoice(v.id);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-emerald-300 shrink-0 flex items-center gap-1 ml-2 transition"
                      title="Preview this voice"
                    >
                      <Play className="w-2.5 h-2.5" />
                      Preview
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Reading Speed Multiplier */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">Pace / Speed:</span>
            <div className="flex gap-1">
              {[
                { label: '0.85x', val: 0.85 },
                { label: '1.0x', val: 1.0 },
                { label: '1.15x', val: 1.15 }
              ].map((rate) => (
                <button
                  key={rate.label}
                  onClick={() => changeRate(rate.val)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                    rateMultiplier === rate.val
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';

export type VoiceId = 'male1' | 'male2' | 'female1' | 'female2';

export interface VoiceProfile {
  id: VoiceId;
  name: string;
  role: string;
  gender: 'male' | 'female';
  icon: string;
  pitch: number;
  rate: number;
  samplePhrase: string;
}

export const NARRATOR_VOICES: VoiceProfile[] = [
  {
    id: 'male1',
    name: 'Dr. Danladi',
    role: 'Senior Civil Service Examiner',
    gender: 'male',
    icon: '👨',
    pitch: 0.85,
    rate: 0.95,
    samplePhrase: 'This is Dr. Danladi, Senior Civil Service Examiner. Questions and regulatory options will be narrated clearly.'
  },
  {
    id: 'male2',
    name: 'Engr. Farooq',
    role: 'Cadre Technical Proctor',
    gender: 'male',
    icon: '👨‍💼',
    pitch: 0.70,
    rate: 0.90,
    samplePhrase: 'This is Engineer Farooq, Cadre Technical Proctor. Reading question stems with measured cadence.'
  },
  {
    id: 'female1',
    name: 'Mrs. Adebayo',
    role: 'Director of Examinations',
    gender: 'female',
    icon: '👩',
    pitch: 1.15,
    rate: 0.95,
    samplePhrase: 'This is Mrs. Adebayo, Director of Examinations. I will read through all four answer choices.'
  },
  {
    id: 'female2',
    name: 'Hajia Fatima',
    role: 'Executive Audio Proctor',
    gender: 'female',
    icon: '👩‍💼',
    pitch: 1.30,
    rate: 0.92,
    samplePhrase: 'This is Hajia Fatima, Executive Audio Proctor. Delivering audible text narration for candidates.'
  }
];

const PREFERRED_VOICE_STORAGE_KEY = 'fcta_cbt_selected_voice_id';
const PREFERRED_RATE_STORAGE_KEY = 'fcta_cbt_speech_rate';

export function useReadOutNarrator() {
  const [selectedVoiceId, setSelectedVoiceId] = useState<VoiceId>(() => {
    try {
      const saved = localStorage.getItem(PREFERRED_VOICE_STORAGE_KEY);
      if (saved && (saved === 'male1' || saved === 'male2' || saved === 'female1' || saved === 'female2')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'female1';
  });

  const [rateMultiplier, setRateMultiplier] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(PREFERRED_RATE_STORAGE_KEY);
      if (saved) return parseFloat(saved);
    } catch {
      // ignore
    }
    return 1.0;
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [availableSystemVoices, setAvailableSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setAvailableSystemVoices(voices);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const changeVoice = (id: VoiceId) => {
    setSelectedVoiceId(id);
    try {
      localStorage.setItem(PREFERRED_VOICE_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const changeRate = (rate: number) => {
    setRateMultiplier(rate);
    try {
      localStorage.setItem(PREFERRED_RATE_STORAGE_KEY, rate.toString());
    } catch {
      // ignore
    }
  };

  // Resolve best system voice based on gender
  const getSystemVoiceForProfile = (profile: VoiceProfile): SpeechSynthesisVoice | null => {
    if (!availableSystemVoices.length) return null;

    const englishVoices = availableSystemVoices.filter((v) =>
      v.lang.startsWith('en')
    );
    const pool = englishVoices.length > 0 ? englishVoices : availableSystemVoices;

    if (profile.gender === 'male') {
      const maleMatches = pool.filter((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('male') ||
          name.includes('david') ||
          name.includes('george') ||
          name.includes('guy') ||
          name.includes('daniel') ||
          name.includes('mark') ||
          name.includes('james')
        );
      });
      if (maleMatches.length > 0) {
        // Distinguish male1 vs male2 if multiple exist
        return profile.id === 'male2' && maleMatches.length > 1
          ? maleMatches[1]
          : maleMatches[0];
      }
    } else {
      const femaleMatches = pool.filter((v) => {
        const name = v.name.toLowerCase();
        return (
          name.includes('female') ||
          name.includes('zira') ||
          name.includes('susan') ||
          name.includes('samantha') ||
          name.includes('victoria') ||
          name.includes('karen') ||
          name.includes('hazel') ||
          name.includes('catherine')
        );
      });
      if (femaleMatches.length > 0) {
        // Distinguish female1 vs female2 if multiple exist
        return profile.id === 'female2' && femaleMatches.length > 1
          ? femaleMatches[1]
          : femaleMatches[0];
      }
    }

    return pool[0] || null;
  };

  const currentProfile = NARRATOR_VOICES.find((v) => v.id === selectedVoiceId) || NARRATOR_VOICES[0];

  const stop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    currentUtteranceRef.current = null;
  };

  const pause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const speakText = (text: string, onEndCallback?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);

    const utterance = new SpeechSynthesisUtterance(text);
    const systemVoice = getSystemVoiceForProfile(currentProfile);
    if (systemVoice) {
      utterance.voice = systemVoice;
    }

    utterance.pitch = currentProfile.pitch;
    utterance.rate = currentProfile.rate * rateMultiplier;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const previewVoice = (voiceId: VoiceId) => {
    const profile = NARRATOR_VOICES.find((v) => v.id === voiceId) || currentProfile;
    speakText(profile.samplePhrase);
  };

  return {
    selectedVoiceId,
    currentProfile,
    isSpeaking,
    isPaused,
    rateMultiplier,
    voices: NARRATOR_VOICES,
    changeVoice,
    changeRate,
    speakText,
    stop,
    pause,
    resume,
    previewVoice
  };
}

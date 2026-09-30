import { ExamAttempt, Question, SubjectBreakdown, UserProgress } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { generateExamQuestionsForSet } from './questionService';

const PROGRESS_STORAGE_PREFIX = 'fcta_cbt_prog_';
const ATTEMPTS_STORAGE_PREFIX = 'fcta_cbt_att_';
const ATTEMPT_QUESTIONS_STORAGE_PREFIX = 'fcta_cbt_att_qs_';
const OFFLINE_SYNC_QUEUE_KEY = 'fcta_cbt_offline_sync_queue';

// Add attempt to offline sync queue if network is down or request fails
export function queueOfflineAttempt(attempt: ExamAttempt): void {
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    const queue: ExamAttempt[] = raw ? JSON.parse(raw) : [];
    if (!queue.some((item) => item.id === attempt.id)) {
      queue.push(attempt);
      localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (e) {
    console.warn('Error queuing offline attempt:', e);
  }
}

// Get number of pending offline sync items
export function getOfflineQueueCount(): number {
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue.length : 0;
  } catch {
    return 0;
  }
}

// Sync all queued attempts when connection is restored
export async function syncOfflineQueuedAttempts(): Promise<number> {
  let syncedCount = 0;
  try {
    const raw = localStorage.getItem(OFFLINE_SYNC_QUEUE_KEY);
    if (!raw) return 0;
    const queue: ExamAttempt[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return 0;

    const remaining: ExamAttempt[] = [];
    for (const attempt of queue) {
      try {
        await setDoc(doc(db, 'attempts', attempt.id), attempt, { merge: true });
        syncedCount++;
      } catch (err) {
        remaining.push(attempt);
      }
    }

    localStorage.setItem(OFFLINE_SYNC_QUEUE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.warn('Error during offline queue sync:', err);
  }
  return syncedCount;
}

// Retrieve cached questions for an attempt (guarantees offline review & legal citations)
export function getCachedAttemptQuestions(attemptId: string): Question[] | null {
  try {
    const raw = localStorage.getItem(`${ATTEMPT_QUESTIONS_STORAGE_PREFIX}${attemptId}`);
    if (raw) {
      const parsed: Question[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading cached attempt questions:', e);
  }
  return null;
}

// Cache full questions for an attempt
export function cacheAttemptQuestions(attemptId: string, questions: Question[]): void {
  try {
    localStorage.setItem(
      `${ATTEMPT_QUESTIONS_STORAGE_PREFIX}${attemptId}`,
      JSON.stringify(questions)
    );
  } catch (e) {
    console.warn('Failed writing cached attempt questions:', e);
  }
}

// Retrieve candidate progress with offline-first persistence
export async function getUserProgress(userId: string): Promise<UserProgress> {
  const localKey = `${PROGRESS_STORAGE_PREFIX}${userId}`;
  let localProgress: UserProgress | null = null;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localProgress = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // If online, check Firestore in background to ensure cloud sync
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const snap = await getDoc(doc(db, 'progress', userId));
      if (snap.exists()) {
        const cloudData = snap.data() as UserProgress;
        // If cloud data is newer or local is missing, adopt cloud data
        if (!localProgress || (cloudData.updatedAt && cloudData.updatedAt > (localProgress.updatedAt || ''))) {
          localStorage.setItem(localKey, JSON.stringify(cloudData));
          return cloudData;
        }
      } else if (localProgress) {
        // Upload existing local progress to cloud if not yet in cloud
        await setDoc(doc(db, 'progress', userId), localProgress, { merge: true });
      }
    } catch (err) {
      console.warn('Notice loading progress from firestore (using local persistence):', err);
    }
  }

  if (localProgress) return localProgress;

  // Default initial progress for candidate
  const isDemo = userId === 'user_demo_candidate';
  const initial: UserProgress = {
    id: userId,
    userId,
    currentCycle: 1,
    unlockedSet: isDemo ? 3 : 1, // Set 1 is unlocked initially, Set 3 for demo candidate
    passedSets: isDemo ? [1, 2] : [],
    completedCycles: 0,
    answeredQuestionIds: [],
    setBestScores: isDemo ? { 1: 78, 2: 84 } : {},
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(localKey, JSON.stringify(initial));
  return initial;
}

// Save candidate progress
export async function saveUserProgress(progress: UserProgress): Promise<void> {
  const localKey = `${PROGRESS_STORAGE_PREFIX}${progress.userId}`;
  progress.updatedAt = new Date().toISOString();
  localStorage.setItem(localKey, JSON.stringify(progress));

  try {
    await setDoc(doc(db, 'progress', progress.userId), progress, { merge: true });
  } catch (err) {
    console.warn('Notice saving progress to firestore (saved locally):', err);
  }
}

// Calculate subject breakdown for 100 questions
export function calculateSubjectBreakdown(
  questions: Question[],
  userAnswers: Record<string, number>
): SubjectBreakdown {
  const breakdown: SubjectBreakdown = {
    psr: { total: 0, correct: 0, scorePct: 0 },
    fr: { total: 0, correct: 0, scorePct: 0 },
    ppa: { total: 0, correct: 0, scorePct: 0 },
    fcta_gk: { total: 0, correct: 0, scorePct: 0 },
    cadre: { total: 0, correct: 0, scorePct: 0 }
  };

  questions.forEach((q) => {
    const subj = q.subject;
    if (breakdown[subj]) {
      breakdown[subj].total += 1;
      const selected = userAnswers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        breakdown[subj].correct += 1;
      }
    }
  });

  Object.keys(breakdown).forEach((key) => {
    const s = breakdown[key as keyof SubjectBreakdown];
    s.scorePct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  });

  return breakdown;
}

// Record an exam submission and update user progress if passed (>= 70%)
export async function submitExamAttempt(params: {
  userId: string;
  staffName: string;
  staffId: string;
  cadre: string;
  gradeLevel: string;
  cycleIndex: number;
  setNumber: number;
  difficultyTier: number;
  durationMinutes: number;
  timeSpentSeconds: number;
  questions: Question[];
  userAnswers: Record<string, number>;
}): Promise<{ attempt: ExamAttempt; progress: UserProgress; unlockedNextSet: boolean }> {
  let score = 0;
  params.questions.forEach((q) => {
    if (params.userAnswers[q.id] === q.correctOptionIndex) {
      score += 1;
    }
  });

  const totalQuestions = params.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= 70; // 70% pass mark requirement!

  const subjectBreakdown = calculateSubjectBreakdown(params.questions, params.userAnswers);

  const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const attempt: ExamAttempt = {
    id: attemptId,
    userId: params.userId,
    staffName: params.staffName,
    staffId: params.staffId,
    cadre: params.cadre,
    gradeLevel: params.gradeLevel,
    cycleIndex: params.cycleIndex,
    setNumber: params.setNumber,
    difficultyTier: params.difficultyTier,
    durationMinutes: params.durationMinutes,
    timeSpentSeconds: params.timeSpentSeconds,
    score,
    totalQuestions,
    percentage,
    passed,
    answers: params.userAnswers,
    questionIds: params.questions.map((q) => q.id),
    subjectBreakdown,
    startedAt: new Date(Date.now() - params.timeSpentSeconds * 1000).toISOString(),
    completedAt: new Date().toISOString(),
    status: 'completed'
  };

  // Save attempt locally in persistent storage
  const attemptsKey = `${ATTEMPTS_STORAGE_PREFIX}${params.userId}`;
  let attemptsList: ExamAttempt[] = [];
  try {
    const raw = localStorage.getItem(attemptsKey);
    if (raw) attemptsList = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Avoid duplicate entries
  attemptsList = attemptsList.filter((a) => a.id !== attempt.id);
  attemptsList.unshift(attempt);
  localStorage.setItem(attemptsKey, JSON.stringify(attemptsList));

  // Cache questions snapshot locally for 100% offline corrections and citations
  cacheAttemptQuestions(attempt.id, params.questions);

  // Sync attempt to Firestore or queue for offline background sync
  let synced = false;
  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      await setDoc(doc(db, 'attempts', attempt.id), attempt);
      synced = true;
    } catch (e) {
      console.warn('Firestore attempt write note (queuing for offline sync):', e);
    }
  }
  if (!synced) {
    queueOfflineAttempt(attempt);
  }

  // Update progress
  const progress = await getUserProgress(params.userId);

  // Add questions to answered list so future cycles avoid duplicates
  params.questions.forEach((q) => {
    if (!progress.answeredQuestionIds.includes(q.id)) {
      progress.answeredQuestionIds.push(q.id);
    }
  });

  // Track best score
  const currentBest = progress.setBestScores[params.setNumber] || 0;
  if (percentage > currentBest) {
    progress.setBestScores[params.setNumber] = percentage;
  }

  let unlockedNextSet = false;
  if (passed) {
    if (!progress.passedSets.includes(params.setNumber)) {
      progress.passedSets.push(params.setNumber);
    }

    // Unlock subsequent set if not already unlocked
    if (params.setNumber < 4 && progress.unlockedSet <= params.setNumber) {
      progress.unlockedSet = params.setNumber + 1;
      unlockedNextSet = true;
    }
  }

  await saveUserProgress(progress);

  return { attempt, progress, unlockedNextSet };
}

// Reset and generate a new 4-set cycle once all 4 sets are passed
export async function startNewExamCycle(userId: string): Promise<UserProgress> {
  const progress = await getUserProgress(userId);

  progress.completedCycles += 1;
  progress.currentCycle += 1;
  progress.unlockedSet = 1; // restart set progression for new cycle with new non-duplicate questions
  progress.passedSets = [];
  progress.setBestScores = {};

  await saveUserProgress(progress);
  return progress;
}

// Retrieve past attempts for candidate with offline-first persistence
export async function getUserAttempts(userId: string): Promise<ExamAttempt[]> {
  const attemptsKey = `${ATTEMPTS_STORAGE_PREFIX}${userId}`;
  let localAttempts: ExamAttempt[] = [];
  try {
    const raw = localStorage.getItem(attemptsKey);
    if (raw) {
      localAttempts = JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  // If online, check Firestore in background to sync any cloud attempts
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const q = query(
        collection(db, 'attempts'),
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      const snap = await getDocs(q);
      const firestoreAttempts: ExamAttempt[] = [];
      snap.forEach((docItem) => {
        firestoreAttempts.push(docItem.data() as ExamAttempt);
      });

      if (firestoreAttempts.length > 0) {
        const map = new Map<string, ExamAttempt>();
        localAttempts.forEach((a) => map.set(a.id, a));
        firestoreAttempts.forEach((a) => map.set(a.id, a));
        const merged = Array.from(map.values()).sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        localAttempts = merged;
        localStorage.setItem(attemptsKey, JSON.stringify(merged));
      }
    } catch (err) {
      console.warn('Notice querying attempts from firestore (using local persistence):', err);
    }
  }

  if (localAttempts.length > 0) {
    return localAttempts;
  }

  // Initial seed for demo candidate to showcase performance reports line chart immediately
  if (userId === 'user_demo_candidate') {
    const now = Date.now();
    const demoAttempts: ExamAttempt[] = [
      {
        id: 'att_demo_1',
        userId,
        staffName: 'Ibrahim Danladi',
        staffId: 'FCTA/AGS/2019/4412',
        cadre: 'Administrative Officer',
        gradeLevel: 'GL 09',
        cycleIndex: 1,
        setNumber: 1,
        difficultyTier: 1,
        durationMinutes: 45,
        timeSpentSeconds: 2140,
        score: 64,
        totalQuestions: 100,
        percentage: 64,
        passed: false,
        answers: {},
        questionIds: [],
        subjectBreakdown: {
          psr: { total: 20, correct: 14, scorePct: 70 },
          fr: { total: 20, correct: 11, scorePct: 55 },
          ppa: { total: 20, correct: 12, scorePct: 60 },
          fcta_gk: { total: 20, correct: 15, scorePct: 75 },
          cadre: { total: 20, correct: 12, scorePct: 60 }
        },
        startedAt: new Date(now - 86400000 * 3).toISOString(),
        completedAt: new Date(now - 86400000 * 3 + 2140000).toISOString(),
        status: 'completed'
      },
      {
        id: 'att_demo_2',
        userId,
        staffName: 'Ibrahim Danladi',
        staffId: 'FCTA/AGS/2019/4412',
        cadre: 'Administrative Officer',
        gradeLevel: 'GL 09',
        cycleIndex: 1,
        setNumber: 1,
        difficultyTier: 1,
        durationMinutes: 45,
        timeSpentSeconds: 1980,
        score: 78,
        totalQuestions: 100,
        percentage: 78,
        passed: true,
        answers: {},
        questionIds: [],
        subjectBreakdown: {
          psr: { total: 20, correct: 17, scorePct: 85 },
          fr: { total: 20, correct: 14, scorePct: 70 },
          ppa: { total: 20, correct: 15, scorePct: 75 },
          fcta_gk: { total: 20, correct: 16, scorePct: 80 },
          cadre: { total: 20, correct: 16, scorePct: 80 }
        },
        startedAt: new Date(now - 86400000 * 2).toISOString(),
        completedAt: new Date(now - 86400000 * 2 + 1980000).toISOString(),
        status: 'completed'
      },
      {
        id: 'att_demo_3',
        userId,
        staffName: 'Ibrahim Danladi',
        staffId: 'FCTA/AGS/2019/4412',
        cadre: 'Administrative Officer',
        gradeLevel: 'GL 09',
        cycleIndex: 1,
        setNumber: 2,
        difficultyTier: 2,
        durationMinutes: 45,
        timeSpentSeconds: 2310,
        score: 84,
        totalQuestions: 100,
        percentage: 84,
        passed: true,
        answers: {},
        questionIds: [],
        subjectBreakdown: {
          psr: { total: 20, correct: 18, scorePct: 90 },
          fr: { total: 20, correct: 16, scorePct: 80 },
          ppa: { total: 20, correct: 16, scorePct: 80 },
          fcta_gk: { total: 20, correct: 17, scorePct: 85 },
          cadre: { total: 20, correct: 17, scorePct: 85 }
        },
        startedAt: new Date(now - 86400000 * 1).toISOString(),
        completedAt: new Date(now - 86400000 * 1 + 2310000).toISOString(),
        status: 'completed'
      }
    ];

    try {
      localStorage.setItem(attemptsKey, JSON.stringify(demoAttempts));
    } catch {
      // ignore
    }
    return demoAttempts;
  }

  return [];
}

// Retrieve all attempts (for Admin Portal review)
export async function getAllAttempts(): Promise<ExamAttempt[]> {
  const all: ExamAttempt[] = [];
  // Scan local storage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(ATTEMPTS_STORAGE_PREFIX)) {
      try {
        const parsed: ExamAttempt[] = JSON.parse(localStorage.getItem(key) || '[]');
        all.push(...parsed);
      } catch (e) {
        // ignore
      }
    }
  }

  // Also query Firestore attempts
  try {
    const snap = await getDocs(collection(db, 'attempts'));
    snap.forEach((docItem) => {
      const data = docItem.data() as ExamAttempt;
      if (!all.some((a) => a.id === data.id)) {
        all.push(data);
      }
    });
  } catch (e) {
    // ignore
  }

  return all.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

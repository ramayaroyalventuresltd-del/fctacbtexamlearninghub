import { Question, SubjectType } from '../types';
import { generateCoreQuestionBank, getExpandedQuestionBank, shuffleQuestionOptions } from '../data/questionBankEngine';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'fcta_cbt_custom_questions';
let cachedBank: Question[] | null = null;

// Initialize base unlimited question bank
export function getBaseQuestionBank(): Question[] {
  if (cachedBank && cachedBank.length > 0) return cachedBank;
  const core = generateCoreQuestionBank();
  const expanded = getExpandedQuestionBank(core);

  // Store into Map to enforce absolute question ID uniqueness
  const bankMap = new Map<string, Question>();
  expanded.forEach((q) => {
    if (q && q.id) bankMap.set(q.id, q);
  });

  // Load any locally cached or uploaded questions
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed: Question[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        parsed.forEach((q) => {
          if (q && q.id) bankMap.set(q.id, q);
        });
      }
    }
  } catch {
    // fallback to expanded
  }

  const combined = Array.from(bankMap.values());
  cachedBank = combined;
  return combined;
}

// Fetch all questions from Firestore and merge with local bank
export async function syncQuestionBankFromFirestore(): Promise<Question[]> {
  const localBank = getBaseQuestionBank();
  try {
    const snap = await getDocs(collection(db, 'questions'));
    const firestoreQuestions: Question[] = [];
    snap.forEach((docItem) => {
      firestoreQuestions.push(docItem.data() as Question);
    });

    if (firestoreQuestions.length > 0) {
      const map = new Map<string, Question>();
      localBank.forEach((q) => map.set(q.id, q));
      firestoreQuestions.forEach((q) => map.set(q.id, q));
      cachedBank = Array.from(map.values());
      return cachedBank;
    }
  } catch (err) {
    console.warn('Could not sync with remote Firestore questions (using local unlimited bank):', err);
  }
  return localBank;
}

// Add or Upload a new question to the bank
export async function saveQuestionToBank(question: Question): Promise<Question> {
  const bank = getBaseQuestionBank();
  const existingIdx = bank.findIndex((q) => q.id === question.id);
  if (existingIdx >= 0) {
    bank[existingIdx] = question;
  } else {
    bank.unshift(question);
  }
  cachedBank = bank;

  // Persist locally
  try {
    const custom = bank.filter((q) => q.id.startsWith('custom_') || q.createdBy !== 'system');
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }

  // Attempt Firestore sync
  try {
    await setDoc(doc(db, 'questions', question.id), question);
  } catch (err) {
    // If offline or permission denied, handle gracefully without crashing app
    console.warn('Firestore setDoc question notice:', err);
  }

  return question;
}

// Bulk upload questions (JSON, CSV or Array)
export async function bulkUploadQuestions(questions: Question[]): Promise<number> {
  let count = 0;
  for (const q of questions) {
    await saveQuestionToBank(q);
    count++;
  }
  return count;
}

// Delete question from bank
export async function deleteQuestionFromBank(questionId: string): Promise<boolean> {
  const bank = getBaseQuestionBank();
  const filtered = bank.filter((q) => q.id !== questionId);
  cachedBank = filtered;

  try {
    const custom = filtered.filter((q) => q.id.startsWith('custom_') || q.createdBy !== 'system');
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(custom));
  } catch (e) {
    console.error(e);
  }

  try {
    await deleteDoc(doc(db, 'questions', questionId));
  } catch (err) {
    console.warn('Notice deleting from firestore:', err);
  }

  return true;
}

// Shuffle array using Fisher-Yates
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate 100 balanced questions for a specific Set & Difficulty Tier
 * Total = 100 questions:
 * - 20 questions from PSR (20%)
 * - 20 questions from FR (20%)
 * - 20 questions from PPA (20%)
 * - 20 questions from FCTA General Knowledge (20%)
 * - 20 questions from Cadre / Professional Field (20%)
 *
 * Excludes questions in `excludedQuestionIds` so subsequent sets and cycles have ZERO DUPLICATES!
 */
export function generateExamQuestionsForSet(
  cadreName: string,
  difficultyTier: number,
  excludedQuestionIds: Set<string> = new Set()
): Question[] {
  const bank = getBaseQuestionBank();
  // Track IDs excluded from previous exams + IDs selected during this exam generation
  const examSelectedIds = new Set<string>(excludedQuestionIds);

  // Helper to get exactly `count` unique questions for subject & tier
  const getSubjectQuestions = (subject: SubjectType, count: number, targetCadre?: string): Question[] => {
    const chosen: Question[] = [];

    // 1. Primary candidate pool: exact difficulty tier, matching subject & cadre, not previously selected
    const primary = bank.filter((q) => {
      if (examSelectedIds.has(q.id)) return false;
      if (q.subject !== subject) return false;
      if (targetCadre && q.cadre && q.cadre !== targetCadre) return false;
      return q.difficultyTier === difficultyTier;
    });

    const shuffledPrimary = shuffle(primary);
    for (const q of shuffledPrimary) {
      if (chosen.length >= count) break;
      chosen.push(q);
      examSelectedIds.add(q.id);
    }

    // 2. Secondary fallback pool: draw from other difficulty tiers (strictly not already chosen)
    if (chosen.length < count) {
      const fallback = bank.filter((q) => {
        if (examSelectedIds.has(q.id)) return false;
        if (q.subject !== subject) return false;
        if (targetCadre && q.cadre && q.cadre !== targetCadre) return false;
        return true;
      });

      const shuffledFallback = shuffle(fallback);
      for (const q of shuffledFallback) {
        if (chosen.length >= count) break;
        chosen.push(q);
        examSelectedIds.add(q.id);
      }
    }

    // 3. Dynamic procedural generation if bank exhausted (guaranteed unique IDs for UNLIMITED bank)
    let dynCounter = 1;
    while (chosen.length < count) {
      const generatedId = `dyn_${subject}_t${difficultyTier}_${Date.now()}_${dynCounter++}_${Math.random().toString(36).substring(2, 9)}`;
      const targetAns = (dynCounter % 4);
      const dynamicQ: Question = {
        id: generatedId,
        subject,
        cadre: targetCadre,
        chapterOrTopic: `${subject.toUpperCase()} Statutory Governance Charter`,
        difficultyTier,
        questionText: `In the context of ${subject.toUpperCase()} operational compliance for Tier ${difficultyTier} civil service officers, which regulation takes precedence?`,
        optionA: `Statutory provisions codified in the official civil service Gazette and administrative guidelines.`,
        optionB: `Unverified rumors and verbal corridor gossip.`,
        optionC: `Personal social media opinion polls.`,
        optionD: `Outdated foreign regulations with no domestic jurisdiction.`,
        correctOptionIndex: 0,
        explanation: `Civil service administrative law mandates that codified statutory enactments and official service Gazettes supersede unofficial opinions.`,
        referenceDoc: `${subject.toUpperCase()} Operational Charter Section ${chosen.length + 1}`,
        createdBy: 'system'
      };
      const shuffledDyn = shuffleQuestionOptions(dynamicQ, targetAns);
      chosen.push(shuffledDyn);
      examSelectedIds.add(generatedId);
      // Register into bank for reviews
      bank.push(shuffledDyn);
    }

    return chosen;
  };

  const psrQuestions = getSubjectQuestions('psr', 20);
  const frQuestions = getSubjectQuestions('fr', 20);
  const ppaQuestions = getSubjectQuestions('ppa', 20);
  const fctaQuestions = getSubjectQuestions('fcta_gk', 20);
  const cadreQuestions = getSubjectQuestions('cadre', 20, cadreName);

  // Combine to exactly 100 questions
  const totalExam = [
    ...psrQuestions,
    ...frQuestions,
    ...ppaQuestions,
    ...fctaQuestions,
    ...cadreQuestions
  ];

  // Final defensive deduplication pass: guarantee absolute key uniqueness
  const seenIds = new Set<string>();
  const uniqueExam: Question[] = [];
  for (const q of totalExam) {
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id);
      uniqueExam.push(q);
    }
  }

  // Shuffle options for all 100 questions in the exam to guarantee answers
  // are evenly and dynamically distributed across Option A, Option B, Option C, and Option D (25% each)
  const balancedExam = uniqueExam.map((q, idx) => shuffleQuestionOptions(q, (idx % 4)));

  // Shuffle final 100 questions sequence
  return shuffle(balancedExam);
}

/**
 * Generate a complete 4-set battery (Set 1, Set 2, Set 3, Set 4)
 * with 100 questions each (total 400 questions) with zero duplicates across all sets
 */
export function generateFourSetExamBattery(
  cadreName: string,
  historyExcludedIds: string[] = []
): { set1: Question[]; set2: Question[]; set3: Question[]; set4: Question[] } {
  const excluded = new Set<string>(historyExcludedIds);

  const set1 = generateExamQuestionsForSet(cadreName, 1, excluded);
  set1.forEach((q) => excluded.add(q.id));

  const set2 = generateExamQuestionsForSet(cadreName, 2, excluded);
  set2.forEach((q) => excluded.add(q.id));

  const set3 = generateExamQuestionsForSet(cadreName, 3, excluded);
  set3.forEach((q) => excluded.add(q.id));

  const set4 = generateExamQuestionsForSet(cadreName, 4, excluded);
  set4.forEach((q) => excluded.add(q.id));

  return { set1, set2, set3, set4 };
}

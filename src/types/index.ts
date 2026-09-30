export type UserRole = 'superadmin' | 'admin' | 'candidate';

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  email: string;
  staffId: string;
  role: UserRole;
  cadre: string;
  gradeLevel: string;
  difficultyTier: number; // 1 to 4
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubjectType = 'psr' | 'fr' | 'ppa' | 'fcta_gk' | 'cadre';

export interface Question {
  id: string;
  subject: SubjectType;
  cadre?: string; // if subject === 'cadre'
  chapterOrTopic: string;
  difficultyTier: number; // 1 (GL 03-06), 2 (GL 07-10), 3 (GL 12-14), 4 (GL 15-17)
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionIndex: number; // 0: A, 1: B, 2: C, 3: D
  explanation: string;
  referenceDoc: string; // e.g. "PSR 030301", "FR Rule 401", "PPA Sec 16(1)", "FCTA Order 1"
  createdAt?: string;
  createdBy?: string;
}

export interface SubjectBreakdown {
  psr: { total: number; correct: number; scorePct: number };
  fr: { total: number; correct: number; scorePct: number };
  ppa: { total: number; correct: number; scorePct: number };
  fcta_gk: { total: number; correct: number; scorePct: number };
  cadre: { total: number; correct: number; scorePct: number };
}

export interface ExamAttempt {
  id: string;
  userId: string;
  staffName?: string;
  staffId?: string;
  cadre?: string;
  gradeLevel?: string;
  cycleIndex: number;
  setNumber: number; // 1, 2, 3, 4
  difficultyTier: number; // 1, 2, 3, 4
  durationMinutes: number; // 30, 45, or 60
  timeSpentSeconds: number;
  score: number;
  totalQuestions: number; // 100
  percentage: number;
  passed: boolean; // percentage >= 70
  answers: Record<string, number>; // questionId -> selectedIndex
  questionIds: string[];
  subjectBreakdown: SubjectBreakdown;
  startedAt: string;
  completedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface UserProgress {
  id: string; // userId
  userId: string;
  currentCycle: number;
  unlockedSet: number; // 1 to 4 (e.g. 1 unlocked by default; once set 1 passed >= 70%, 2 unlocked, etc.)
  passedSets: number[]; // e.g. [1, 2]
  completedCycles: number;
  answeredQuestionIds: string[]; // history of answered question IDs to avoid duplicates in new cycles
  setBestScores: Record<number, number>; // setNumber -> best percentage
  updatedAt: string;
}

export interface CadreDefinition {
  id: string;
  name: string;
  department: string;
  secretariat: string;
  description: string;
}

export interface GradeLevelDefinition {
  level: string; // e.g. "GL 03"
  tier: number; // 1, 2, 3, 4
  tierLabel: string;
  description: string;
}

import React, { useState, useEffect } from 'react';
import { UserProfile, UserProgress, ExamAttempt, Question } from './types';
import { getCurrentSessionUser, logoutUser } from './services/authService';
import {
  getUserProgress,
  submitExamAttempt,
  startNewExamCycle,
  getUserAttempts,
  getCachedAttemptQuestions,
  cacheAttemptQuestions
} from './services/examService';
import {
  generateExamQuestionsForSet,
  getBaseQuestionBank,
  syncQuestionBankFromFirestore
} from './services/questionService';
import { AppLayout } from './components/AppLayout';
import { HowToUseSlider } from './components/HowToUseSlider';
import { AuthModalOrCard } from './components/AuthModalOrCard';
import { CandidateDashboard } from './components/CandidateDashboard';
import { ExamRunner } from './components/ExamRunner';
import { ExamResultView } from './components/ExamResultView';
import { AdminPortal } from './components/AdminPortal';
import { InternationalStandardsModal } from './components/InternationalStandardsModal';
import { MandatoryPasswordChangeModal } from './components/MandatoryPasswordChangeModal';
import {
  Building2,
  CheckCircle2,
  Layers,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [userAttempts, setUserAttempts] = useState<ExamAttempt[]>([]);
  const [questionBankCount, setQuestionBankCount] = useState<number>(0);
  const [showStandardsModal, setShowStandardsModal] = useState<boolean>(false);

  // View state: 'cbt' | 'admin'
  const [activeAdminView, setActiveAdminView] = useState<'cbt' | 'admin'>('cbt');
  const [activeNavTab, setActiveNavTab] = useState<'sets' | 'achievements' | 'reports' | 'history' | 'admin'>('sets');

  // Active Exam state
  const [activeExam, setActiveExam] = useState<{
    setNumber: number;
    difficultyTier: number;
    durationMinutes: number;
    questions: Question[];
  } | null>(null);

  // Completed Attempt View state
  const [completedAttemptData, setCompletedAttemptData] = useState<{
    attempt: ExamAttempt;
    questions: Question[];
    unlockedNextSet: boolean;
  } | null>(null);

  // Initialize session and sync question bank
  useEffect(() => {
    const session = getCurrentSessionUser();
    if (session) {
      setCurrentUser(session);
      if (session.role === 'superadmin' || session.role === 'admin') {
        setActiveAdminView('admin');
        setActiveNavTab('admin');
      }
      loadCandidateData(session.id);
    }

    // Load question bank count and attempt sync with Firestore
    const baseBank = getBaseQuestionBank();
    setQuestionBankCount(baseBank.length);

    syncQuestionBankFromFirestore().then((synced) => {
      setQuestionBankCount(synced.length);
    });
  }, []);

  const loadCandidateData = async (userId: string) => {
    const prog = await getUserProgress(userId);
    setUserProgress(prog);
    const atts = await getUserAttempts(userId);
    setUserAttempts(atts);
  };

  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    if (user.role === 'superadmin' || user.role === 'admin') {
      setActiveAdminView('admin');
      setActiveNavTab('admin');
    } else {
      setActiveAdminView('cbt');
      setActiveNavTab('sets');
    }
    await loadCandidateData(user.id);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProgress(null);
    setUserAttempts([]);
    setActiveExam(null);
    setCompletedAttemptData(null);
    setActiveNavTab('sets');
    setActiveAdminView('cbt');
  };

  // Launch Exam Test for Set (1 to 4)
  const handleStartExam = (setNumber: number, difficultyTier: number, durationMinutes: number) => {
    if (!currentUser || !userProgress) return;

    // Generate 100 questions excluding previously answered questions in history
    const excludedIds = new Set<string>(userProgress.answeredQuestionIds || []);
    const examQuestions = generateExamQuestionsForSet(
      currentUser.cadre || 'Administrative Officer',
      difficultyTier,
      excludedIds
    );

    setActiveExam({
      setNumber,
      difficultyTier,
      durationMinutes,
      questions: examQuestions
    });
    setCompletedAttemptData(null);
  };

  // Submit Active Exam
  const handleFinishExam = async (
    answers: Record<string, number>,
    timeSpentSeconds: number
  ) => {
    if (!currentUser || !activeExam || !userProgress) return;

    const { attempt, progress, unlockedNextSet } = await submitExamAttempt({
      userId: currentUser.id,
      staffName: currentUser.fullName,
      staffId: currentUser.staffId,
      cadre: currentUser.cadre,
      gradeLevel: currentUser.gradeLevel,
      cycleIndex: userProgress.currentCycle,
      setNumber: activeExam.setNumber,
      difficultyTier: activeExam.difficultyTier,
      durationMinutes: activeExam.durationMinutes,
      timeSpentSeconds,
      questions: activeExam.questions,
      userAnswers: answers
    });

    setUserProgress(progress);
    setUserAttempts((prev) => [attempt, ...prev]);

    setCompletedAttemptData({
      attempt,
      questions: activeExam.questions,
      unlockedNextSet
    });

    setActiveExam(null);
  };

  // Generate new 4-set exam cycle once all 4 are passed
  const handleGenerateNewCycle = async () => {
    if (!currentUser) return;
    const newProg = await startNewExamCycle(currentUser.id);
    setUserProgress(newProg);
    setCompletedAttemptData(null);
  };

  // Review an existing past attempt with offline snapshot support
  const handleReviewAttempt = (attempt: ExamAttempt) => {
    const cached = getCachedAttemptQuestions(attempt.id);
    if (cached && cached.length > 0) {
      setCompletedAttemptData({
        attempt,
        questions: cached,
        unlockedNextSet: false
      });
      return;
    }

    const bank = getBaseQuestionBank();
    const bankMap = new Map(bank.map((q) => [q.id, q]));
    const matchedQuestions: Question[] = [];
    const seenIds = new Set<string>();

    attempt.questionIds.forEach((qId) => {
      if (seenIds.has(qId)) return;
      seenIds.add(qId);

      const found = bankMap.get(qId);
      if (found) {
        matchedQuestions.push(found);
      } else {
        matchedQuestions.push({
          id: qId,
          subject: 'psr',
          chapterOrTopic: 'Official Regulatory Code',
          difficultyTier: attempt.difficultyTier,
          questionText: 'Regulatory examination question record from archived attempt.',
          optionA: 'Statutory compliance is verified according to civil service regulations.',
          optionB: 'Alternative option B.',
          optionC: 'Alternative option C.',
          optionD: 'Alternative option D.',
          correctOptionIndex: 0,
          explanation: 'Standard verified question from candidate evaluation record.',
          referenceDoc: 'FCTA Civil Service Charter'
        });
      }
    });

    cacheAttemptQuestions(attempt.id, matchedQuestions);

    setCompletedAttemptData({
      attempt,
      questions: matchedQuestions,
      unlockedNextSet: false
    });
  };

  // 1. ACTIVE EXAM SCREEN
  if (activeExam && currentUser) {
    return (
      <ExamRunner
        questions={activeExam.questions}
        setNumber={activeExam.setNumber}
        difficultyTier={activeExam.difficultyTier}
        durationMinutes={activeExam.durationMinutes}
        cadreName={currentUser.cadre || 'Administrative Officer'}
        onFinishExam={handleFinishExam}
        onCancelExam={() => setActiveExam(null)}
      />
    );
  }

  // 2. EXAM RESULT & REVIEW SCREEN
  if (completedAttemptData) {
    return (
      <AppLayout
        user={currentUser}
        onLogout={handleLogout}
        activeView={activeAdminView}
        onChangeView={setActiveAdminView}
        questionBankCount={questionBankCount}
        onOpenStandards={() => setShowStandardsModal(true)}
        activeNavTab={activeNavTab}
        onSelectNavTab={setActiveNavTab}
      >
        <ExamResultView
          attempt={completedAttemptData.attempt}
          questions={completedAttemptData.questions}
          unlockedNextSet={completedAttemptData.unlockedNextSet}
          currentUser={currentUser || undefined}
          onReturnToDashboard={() => setCompletedAttemptData(null)}
          onGenerateNewCycle={handleGenerateNewCycle}
        />
        <InternationalStandardsModal
          isOpen={showStandardsModal}
          onClose={() => setShowStandardsModal(false)}
        />
      </AppLayout>
    );
  }

  // 3. LOGGED-IN: ADMIN / SUPER ADMIN PORTAL
  if (currentUser && (currentUser.role === 'superadmin' || currentUser.role === 'admin') && activeAdminView === 'admin') {
    return (
      <AppLayout
        user={currentUser}
        onLogout={handleLogout}
        activeView="admin"
        onChangeView={setActiveAdminView}
        questionBankCount={questionBankCount}
        onOpenStandards={() => setShowStandardsModal(true)}
        activeNavTab="admin"
        onSelectNavTab={(tab) => {
          if (tab !== 'admin') {
            setActiveAdminView('cbt');
            setActiveNavTab(tab);
          }
        }}
      >
        <AdminPortal
          currentUser={currentUser}
          onNavigateToCbt={() => {
            setActiveAdminView('cbt');
            setActiveNavTab('sets');
          }}
        />
        <InternationalStandardsModal
          isOpen={showStandardsModal}
          onClose={() => setShowStandardsModal(false)}
        />
        {currentUser.mustChangePassword && (
          <MandatoryPasswordChangeModal
            user={currentUser}
            onPasswordChanged={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
            onLogout={handleLogout}
          />
        )}
      </AppLayout>
    );
  }

  // 4. LOGGED-IN: CANDIDATE CBT PORTAL
  if (currentUser) {
    if (!userProgress) {
      return (
        <AppLayout
          user={currentUser}
          onLogout={handleLogout}
          activeView={activeAdminView}
          onChangeView={setActiveAdminView}
          questionBankCount={questionBankCount}
          onOpenStandards={() => setShowStandardsModal(true)}
          activeNavTab={activeNavTab}
          onSelectNavTab={(tab) => {
            if (tab === 'admin') {
              setActiveAdminView('admin');
              setActiveNavTab('admin');
            } else {
              setActiveAdminView('cbt');
              setActiveNavTab(tab);
            }
          }}
        >
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-3">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Loading Candidate Profile & CBT Sets...</p>
            <p className="text-xs text-slate-500">Retrieving official civil service records for {currentUser.fullName}</p>
          </div>
        </AppLayout>
      );
    }

    return (
      <AppLayout
        user={currentUser}
        onLogout={handleLogout}
        activeView={activeAdminView}
        onChangeView={setActiveAdminView}
        questionBankCount={questionBankCount}
        onOpenStandards={() => setShowStandardsModal(true)}
        activeNavTab={activeNavTab}
        onSelectNavTab={(tab) => {
          if (tab === 'admin') {
            setActiveAdminView('admin');
            setActiveNavTab('admin');
          } else {
            setActiveAdminView('cbt');
            setActiveNavTab(tab);
          }
        }}
      >
        <CandidateDashboard
          user={currentUser}
          progress={userProgress}
          attempts={userAttempts}
          onStartExam={handleStartExam}
          onGenerateNewCycle={handleGenerateNewCycle}
          onReviewAttempt={handleReviewAttempt}
          initialTab={
            activeNavTab === 'reports'
              ? 'reports'
              : activeNavTab === 'history'
              ? 'history'
              : activeNavTab === 'achievements'
              ? 'achievements'
              : 'sets'
          }
          onTabChange={setActiveNavTab}
        />
        <InternationalStandardsModal
          isOpen={showStandardsModal}
          onClose={() => setShowStandardsModal(false)}
        />
        {currentUser.mustChangePassword && (currentUser.role === 'superadmin' || currentUser.role === 'admin') && (
          <MandatoryPasswordChangeModal
            user={currentUser}
            onPasswordChanged={(updatedUser) => {
              setCurrentUser(updatedUser);
            }}
            onLogout={handleLogout}
          />
        )}
      </AppLayout>
    );
  }

  // 5. FIRST PAGE / LANDING PAGE (Logged-Out State)
  return (
    <AppLayout
      user={null}
      onLogout={handleLogout}
      activeView="cbt"
      questionBankCount={questionBankCount}
      onOpenStandards={() => setShowStandardsModal(true)}
    >
      <div className="space-y-8 sm:space-y-12">
        {/* Top Hero Section Header with fluid typography */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Promotion & Evaluation Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase">
            FCTA CBT EXAM HUB
          </h2>
          <p className="text-xs sm:text-sm text-emerald-400 font-bold uppercase tracking-wider">
            Civil Service Promotion & Staff Evaluation Testing Portal
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Federal Capital Territory Administration statutory promotion testing system covering Public Service Rules, Financial Regulations, Public Procurement Act, FCTA Governance, and specialized professional cadres.
          </p>
        </div>

        {/* 2-Column Responsive Layout: Picture Slide (Left/Top) + Auth Form (Right/Center) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Angle: Picture Slide Showing How to Use the Application */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Step-by-Step Portal Navigation
              </span>
              <span className="text-[11px] text-slate-500">Interactive Walkthrough</span>
            </div>

            {/* Visual Picture Slide */}
            <HowToUseSlider />

            {/* Curriculum Highlights Bar: 2-col on mobile, 4-col on tablet/desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-emerald-400 font-mono">50+ Qs</div>
                <div className="text-[11px] text-slate-400 font-medium">All PSR Chapters</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-blue-400 font-mono">50+ Qs</div>
                <div className="text-[11px] text-slate-400 font-medium">All FR Chapters</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-amber-400 font-mono">50+ Qs</div>
                <div className="text-[11px] text-slate-400 font-medium">All PPA Sections</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-base font-black text-purple-400 font-mono">23+</div>
                <div className="text-[11px] text-slate-400 font-medium">FCTA Cadres</div>
              </div>
            </div>
          </div>

          {/* Right / Center: User Registration and Login Forms */}
          <div className="lg:col-span-6">
            <AuthModalOrCard onSuccess={handleLoginSuccess} />
          </div>
        </div>

        {/* Feature Information Cards: 1-col on mobile, 3-col on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-800">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">4 Levels of Difficulty</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tier 1 (GL 03–06), Tier 2 (GL 07–10), Tier 3 (GL 12–14), and Tier 4 (GL 15–17). Grade levels dynamically map to their regulatory scope.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">30, 45, or 60 Min Timers</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Flexible countdown timer mode with auto-submission, 5-minute warning alert, question flag status, and built-in financial calculator.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">70% Passmark & Zero Duplicates</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Achieve 70% to unlock subsequent sets. Completing all 4 sets allows generating brand new cycles with zero duplicate questions!
            </p>
          </div>
        </div>
      </div>

      <InternationalStandardsModal
        isOpen={showStandardsModal}
        onClose={() => setShowStandardsModal(false)}
      />
    </AppLayout>
  );
}

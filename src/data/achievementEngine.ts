import { ExamAttempt, UserProgress } from '../types';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'milestones' | 'mastery' | 'dedication' | 'speed' | 'subjects';

export interface AchievementBadge {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  iconName: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressCurrent: number;
  progressTarget: number;
  progressUnit?: string;
  unlockDetails?: string;
}

export interface AchievementSummary {
  badges: AchievementBadge[];
  totalUnlocked: number;
  totalBadges: number;
  totalPoints: number;
  maxPoints: number;
  completionPercentage: number;
  officerRank: {
    title: string;
    level: number;
    nextRankAt: number;
    color: string;
  };
}

/**
 * Calculates officer rank based on earned achievement points.
 */
export function getOfficerRank(points: number): {
  title: string;
  level: number;
  nextRankAt: number;
  color: string;
} {
  if (points >= 3500) {
    return { title: 'Directorate Fellow (Grandmaster)', level: 5, nextRankAt: 5000, color: 'text-amber-400' };
  }
  if (points >= 2200) {
    return { title: 'Senior Executive Officer', level: 4, nextRankAt: 3500, color: 'text-purple-400' };
  }
  if (points >= 1200) {
    return { title: 'Commanding Officer', level: 3, nextRankAt: 2200, color: 'text-blue-400' };
  }
  if (points >= 500) {
    return { title: 'Promising Officer', level: 2, nextRankAt: 1200, color: 'text-emerald-400' };
  }
  return { title: 'Cadet Probationer', level: 1, nextRankAt: 500, color: 'text-slate-300' };
}

/**
 * Computes all achievement badges based on exam history and progress.
 */
export function evaluateAchievements(
  attempts: ExamAttempt[],
  progress: UserProgress | null
): AchievementSummary {
  // Sort attempts chronologically (oldest to newest)
  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  const passedAttempts = sortedAttempts.filter((a) => a.passed);
  const totalAttemptsCount = sortedAttempts.length;
  const bestScore = totalAttemptsCount > 0 ? Math.max(...sortedAttempts.map((a) => a.percentage)) : 0;

  // 1. "Early Bird"
  // Unlocked if:
  // a) Took an exam between 05:00 and 08:59 AM, OR
  // b) Finished in <= 50% of allotted duration with a passing score (>= 70%)
  const earlyBirdAttempt = sortedAttempts.find((att) => {
    const d = new Date(att.completedAt);
    const hour = d.getHours();
    const isEarlyMorning = hour >= 5 && hour < 9;
    const isSuperFastPass = att.passed && att.timeSpentSeconds <= (att.durationMinutes * 60) / 2;
    return isEarlyMorning || isSuperFastPass;
  });

  const earlyBirdUnlocked = Boolean(earlyBirdAttempt);
  const earlyBirdProgress = earlyBirdUnlocked ? 1 : 0;

  // 2. "Perfect Score"
  // Unlocked if scored 100% on any attempt
  const perfectAttempt = sortedAttempts.find((a) => a.percentage === 100);
  const perfectUnlocked = Boolean(perfectAttempt);

  // 3. "Consistent Learner"
  // Unlocked if completed >= 3 consecutive passing tests OR completed >= 5 total attempts
  let maxConsecutivePasses = 0;
  let currentConsecutivePasses = 0;
  for (const a of sortedAttempts) {
    if (a.passed) {
      currentConsecutivePasses++;
      if (currentConsecutivePasses > maxConsecutivePasses) {
        maxConsecutivePasses = currentConsecutivePasses;
      }
    } else {
      currentConsecutivePasses = 0;
    }
  }
  const consistentUnlocked = maxConsecutivePasses >= 3 || totalAttemptsCount >= 5;
  const consistentProgress = Math.max(maxConsecutivePasses, Math.min(totalAttemptsCount, 3));

  // 4. "First Steps" (Maiden Voyage)
  const firstStepsUnlocked = totalAttemptsCount >= 1;
  const firstAttempt = sortedAttempts[0];

  // 5. "Merit Distinction" (Score >= 80%)
  const distinctionAttempt = sortedAttempts.find((a) => a.percentage >= 80);
  const distinctionUnlocked = Boolean(distinctionAttempt);

  // 6. "Apex Strategist" (Passed Tier 4 / Set 4)
  const tier4PassAttempt = sortedAttempts.find((a) => a.difficultyTier === 4 && a.passed);
  const tier4Unlocked = Boolean(tier4PassAttempt);

  // 7. "Cycle Champion" (All 4 sets passed in progress or completedCycles >= 1)
  const hasAllFourSets = progress
    ? [1, 2, 3, 4].every((setNum) => progress.passedSets.includes(setNum)) || progress.completedCycles >= 1
    : false;
  const setsPassedCount = progress?.passedSets.length || 0;

  // 8. "Swift Officer" (Completed exam in <= 20 mins with >= 70%)
  const swiftAttempt = sortedAttempts.find(
    (a) => a.passed && a.timeSpentSeconds <= 20 * 60
  );
  const swiftUnlocked = Boolean(swiftAttempt);
  const fastestPassingTimeMins = passedAttempts.length > 0
    ? Math.round(Math.min(...passedAttempts.map((a) => a.timeSpentSeconds)) / 60)
    : 0;

  // 9. "PSR Scholar" (Score >= 90% in Public Service Rules)
  const psrScholarAttempt = sortedAttempts.find(
    (a) => a.subjectBreakdown?.psr?.scorePct >= 90
  );
  const psrScholarUnlocked = Boolean(psrScholarAttempt);
  const bestPsrScore = sortedAttempts.length > 0
    ? Math.max(...sortedAttempts.map((a) => a.subjectBreakdown?.psr?.scorePct || 0))
    : 0;

  // 10. "Financial Auditor" (Score >= 90% in Financial Regulations)
  const frScholarAttempt = sortedAttempts.find(
    (a) => a.subjectBreakdown?.fr?.scorePct >= 90
  );
  const frScholarUnlocked = Boolean(frScholarAttempt);
  const bestFrScore = sortedAttempts.length > 0
    ? Math.max(...sortedAttempts.map((a) => a.subjectBreakdown?.fr?.scorePct || 0))
    : 0;

  // 11. "Procurement Specialist" (Score >= 90% in Public Procurement Act)
  const ppaScholarAttempt = sortedAttempts.find(
    (a) => a.subjectBreakdown?.ppa?.scorePct >= 90
  );
  const ppaScholarUnlocked = Boolean(ppaScholarAttempt);
  const bestPpaScore = sortedAttempts.length > 0
    ? Math.max(...sortedAttempts.map((a) => a.subjectBreakdown?.ppa?.scorePct || 0))
    : 0;

  // 12. "FCTA Diplomat" (Score >= 90% in FCTA General Knowledge)
  const fctaScholarAttempt = sortedAttempts.find(
    (a) => a.subjectBreakdown?.fcta_gk?.scorePct >= 90
  );
  const fctaScholarUnlocked = Boolean(fctaScholarAttempt);
  const bestFctaScore = sortedAttempts.length > 0
    ? Math.max(...sortedAttempts.map((a) => a.subjectBreakdown?.fcta_gk?.scorePct || 0))
    : 0;

  // 13. "Cadre Virtuoso" (Score >= 90% in Cadre domain)
  const cadreScholarAttempt = sortedAttempts.find(
    (a) => a.subjectBreakdown?.cadre?.scorePct >= 90
  );
  const cadreScholarUnlocked = Boolean(cadreScholarAttempt);
  const bestCadreScore = sortedAttempts.length > 0
    ? Math.max(...sortedAttempts.map((a) => a.subjectBreakdown?.cadre?.scorePct || 0))
    : 0;

  // 14. "Resilience Master" (Passed an exam after a previous failure on that set or general failure)
  let resilienceUnlocked = false;
  let resilienceAttempt: ExamAttempt | undefined;
  for (let i = 1; i < sortedAttempts.length; i++) {
    const curr = sortedAttempts[i];
    const prev = sortedAttempts[i - 1];
    if (curr.passed && !prev.passed) {
      resilienceUnlocked = true;
      resilienceAttempt = curr;
      break;
    }
  }

  const rawBadges: AchievementBadge[] = [
    {
      id: 'early_bird',
      title: 'Early Bird',
      tagline: 'Dawn Dedication & Agile Execution',
      description: 'Completed an exam sitting during early morning hours (5–9 AM) or passed in under 50% of the allocated time.',
      category: 'speed',
      rarity: 'rare',
      iconName: 'Sunrise',
      points: 250,
      isUnlocked: earlyBirdUnlocked,
      unlockedAt: earlyBirdAttempt?.completedAt,
      progressCurrent: earlyBirdProgress,
      progressTarget: 1,
      progressUnit: 'test',
      unlockDetails: earlyBirdUnlocked
        ? `Earned on Set ${earlyBirdAttempt?.setNumber} with ${earlyBirdAttempt?.percentage}% score`
        : 'Sit for an early exam (5-9 AM) or finish with a pass in half the time'
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      tagline: 'Flawless 100% Civil Service Mastery',
      description: 'Attain a 100% score on any 100-question promotional examination sitting.',
      category: 'mastery',
      rarity: 'legendary',
      iconName: 'Crown',
      points: 1000,
      isUnlocked: perfectUnlocked,
      unlockedAt: perfectAttempt?.completedAt,
      progressCurrent: bestScore,
      progressTarget: 100,
      progressUnit: '%',
      unlockDetails: perfectUnlocked
        ? `Flawless 100/100 on Set ${perfectAttempt?.setNumber} (Cycle ${perfectAttempt?.cycleIndex})`
        : `Current peak score: ${bestScore}% of 100% target`
    },
    {
      id: 'consistent_learner',
      title: 'Consistent Learner',
      tagline: 'Steadfast Commitment to Merit',
      description: 'Complete 3 consecutive passed exams (≥ 70%) or accumulate 5+ total exam sittings.',
      category: 'dedication',
      rarity: 'epic',
      iconName: 'Flame',
      points: 500,
      isUnlocked: consistentUnlocked,
      unlockedAt: sortedAttempts[Math.min(2, sortedAttempts.length - 1)]?.completedAt,
      progressCurrent: consistentProgress,
      progressTarget: 3,
      progressUnit: 'pass streak',
      unlockDetails: consistentUnlocked
        ? `Maintained ${maxConsecutivePasses} consecutive passing sitting(s)`
        : `${consistentProgress} / 3 consecutive passing sittings achieved`
    },
    {
      id: 'first_steps',
      title: 'Maiden Voyage',
      tagline: 'First Step on the Promotion Ladder',
      description: 'Sit and complete your very first official 100-question CBT evaluation test.',
      category: 'milestones',
      rarity: 'common',
      iconName: 'Compass',
      points: 100,
      isUnlocked: firstStepsUnlocked,
      unlockedAt: firstAttempt?.completedAt,
      progressCurrent: Math.min(totalAttemptsCount, 1),
      progressTarget: 1,
      progressUnit: 'test',
      unlockDetails: firstStepsUnlocked
        ? `Completed initial exam on ${new Date(firstAttempt.completedAt).toLocaleDateString()}`
        : 'Take your first exam to unlock'
    },
    {
      id: 'merit_distinction',
      title: 'Merit Distinction',
      tagline: 'Excellence Above Benchmark',
      description: 'Score 80% or higher on any 100-question statutory examination set.',
      category: 'mastery',
      rarity: 'rare',
      iconName: 'Award',
      points: 250,
      isUnlocked: distinctionUnlocked,
      unlockedAt: distinctionAttempt?.completedAt,
      progressCurrent: bestScore,
      progressTarget: 80,
      progressUnit: '%',
      unlockDetails: distinctionUnlocked
        ? `Scored ${distinctionAttempt?.percentage}% on Set ${distinctionAttempt?.setNumber}`
        : `Highest score: ${bestScore}% (Goal: 80%)`
    },
    {
      id: 'apex_strategist',
      title: 'Apex Strategist',
      tagline: 'Directorate Leadership Caliber',
      description: 'Qualify with ≥ 70% in Tier 4 (Set 4: Strategic Directorate Leadership, GL 15-17).',
      category: 'mastery',
      rarity: 'legendary',
      iconName: 'ShieldAlert',
      points: 1000,
      isUnlocked: tier4Unlocked,
      unlockedAt: tier4PassAttempt?.completedAt,
      progressCurrent: tier4Unlocked ? 1 : 0,
      progressTarget: 1,
      progressUnit: 'tier 4 pass',
      unlockDetails: tier4Unlocked
        ? `Conquered Tier 4 with ${tier4PassAttempt?.percentage}%`
        : 'Pass Exam Set 4 (Tier 4) with ≥ 70%'
    },
    {
      id: 'cycle_champion',
      title: 'Cycle Champion',
      tagline: 'Grand Slam: All 4 Sets Conquered',
      description: 'Successfully pass all 4 difficulty levels in a promotional cycle (Sets 1 to 4).',
      category: 'milestones',
      rarity: 'legendary',
      iconName: 'Trophy',
      points: 1000,
      isUnlocked: hasAllFourSets,
      unlockedAt: passedAttempts[passedAttempts.length - 1]?.completedAt,
      progressCurrent: setsPassedCount,
      progressTarget: 4,
      progressUnit: 'sets',
      unlockDetails: hasAllFourSets
        ? `Full 4-set cycle cleared! Total cycles won: ${progress?.completedCycles || 1}`
        : `${setsPassedCount} of 4 sets passed in current cycle`
    },
    {
      id: 'swift_officer',
      title: 'Swift Officer',
      tagline: 'High-Velocity Accuracy',
      description: 'Complete all 100 questions in under 20 minutes while attaining ≥ 70% passmark.',
      category: 'speed',
      rarity: 'epic',
      iconName: 'Zap',
      points: 500,
      isUnlocked: swiftUnlocked,
      unlockedAt: swiftAttempt?.completedAt,
      progressCurrent: fastestPassingTimeMins > 0 ? fastestPassingTimeMins : 0,
      progressTarget: 20,
      progressUnit: 'mins',
      unlockDetails: swiftUnlocked
        ? `Completed Set ${swiftAttempt?.setNumber} in ${Math.round((swiftAttempt?.timeSpentSeconds || 0) / 60)} mins with ${swiftAttempt?.percentage}%`
        : fastestPassingTimeMins > 0
        ? `Fastest passing sitting: ${fastestPassingTimeMins} mins (Target: ≤ 20 mins)`
        : 'Pass a test in under 20 minutes'
    },
    {
      id: 'psr_scholar',
      title: 'PSR Scholar',
      tagline: 'Public Service Rules Authority',
      description: 'Achieve ≥ 90% proficiency in the Public Service Rules (PSR) statutory section.',
      category: 'subjects',
      rarity: 'rare',
      iconName: 'BookOpen',
      points: 250,
      isUnlocked: psrScholarUnlocked,
      unlockedAt: psrScholarAttempt?.completedAt,
      progressCurrent: bestPsrScore,
      progressTarget: 90,
      progressUnit: '%',
      unlockDetails: psrScholarUnlocked
        ? `Scored ${psrScholarAttempt?.subjectBreakdown.psr.scorePct}% on PSR domain`
        : `Peak PSR score: ${bestPsrScore}% (Target: 90%)`
    },
    {
      id: 'financial_auditor',
      title: 'Financial Auditor',
      tagline: 'Financial Regulations Specialist',
      description: 'Achieve ≥ 90% proficiency in Financial Regulations (FR) government accounting principles.',
      category: 'subjects',
      rarity: 'rare',
      iconName: 'Landmark',
      points: 250,
      isUnlocked: frScholarUnlocked,
      unlockedAt: frScholarAttempt?.completedAt,
      progressCurrent: bestFrScore,
      progressTarget: 90,
      progressUnit: '%',
      unlockDetails: frScholarUnlocked
        ? `Scored ${frScholarAttempt?.subjectBreakdown.fr.scorePct}% on FR domain`
        : `Peak FR score: ${bestFrScore}% (Target: 90%)`
    },
    {
      id: 'procurement_specialist',
      title: 'Procurement Specialist',
      tagline: 'PPA 2007 Due Process Authority',
      description: 'Achieve ≥ 90% proficiency in the Public Procurement Act (PPA) statutory section.',
      category: 'subjects',
      rarity: 'rare',
      iconName: 'Scale',
      points: 250,
      isUnlocked: ppaScholarUnlocked,
      unlockedAt: ppaScholarAttempt?.completedAt,
      progressCurrent: bestPpaScore,
      progressTarget: 90,
      progressUnit: '%',
      unlockDetails: ppaScholarUnlocked
        ? `Scored ${ppaScholarAttempt?.subjectBreakdown.ppa.scorePct}% on PPA domain`
        : `Peak PPA score: ${bestPpaScore}% (Target: 90%)`
    },
    {
      id: 'fcta_diplomat',
      title: 'FCTA Diplomat',
      tagline: 'Territory History & Governance',
      description: 'Achieve ≥ 90% proficiency in FCTA General Knowledge and Federal Capital Governance.',
      category: 'subjects',
      rarity: 'rare',
      iconName: 'Building2',
      points: 250,
      isUnlocked: fctaScholarUnlocked,
      unlockedAt: fctaScholarAttempt?.completedAt,
      progressCurrent: bestFctaScore,
      progressTarget: 90,
      progressUnit: '%',
      unlockDetails: fctaScholarUnlocked
        ? `Scored ${fctaScholarAttempt?.subjectBreakdown.fcta_gk.scorePct}% on FCTA General Knowledge`
        : `Peak FCTA score: ${bestFctaScore}% (Target: 90%)`
    },
    {
      id: 'cadre_virtuoso',
      title: 'Cadre Virtuoso',
      tagline: 'Professional Cadre Excellence',
      description: 'Achieve ≥ 90% proficiency in your assigned professional cadre specialty section.',
      category: 'subjects',
      rarity: 'rare',
      iconName: 'Briefcase',
      points: 250,
      isUnlocked: cadreScholarUnlocked,
      unlockedAt: cadreScholarAttempt?.completedAt,
      progressCurrent: bestCadreScore,
      progressTarget: 90,
      progressUnit: '%',
      unlockDetails: cadreScholarUnlocked
        ? `Scored ${cadreScholarAttempt?.subjectBreakdown.cadre.scorePct}% on Cadre technical section`
        : `Peak Cadre score: ${bestCadreScore}% (Target: 90%)`
    },
    {
      id: 'resilience_master',
      title: 'Resilience Master',
      tagline: 'Triumph Through Persistence',
      description: 'Retake and triumphantly pass an exam sitting after previously scoring below the 70% passmark.',
      category: 'dedication',
      rarity: 'epic',
      iconName: 'RefreshCw',
      points: 500,
      isUnlocked: resilienceUnlocked,
      unlockedAt: resilienceAttempt?.completedAt,
      progressCurrent: resilienceUnlocked ? 1 : 0,
      progressTarget: 1,
      progressUnit: 'redemption',
      unlockDetails: resilienceUnlocked
        ? `Rebounded to pass Set ${resilienceAttempt?.setNumber} with ${resilienceAttempt?.percentage}%`
        : 'Bounce back and pass after a sitting below 70%'
    }
  ];

  const totalUnlocked = rawBadges.filter((b) => b.isUnlocked).length;
  const totalPoints = rawBadges
    .filter((b) => b.isUnlocked)
    .reduce((acc, b) => acc + b.points, 0);
  const maxPoints = rawBadges.reduce((acc, b) => acc + b.points, 0);
  const completionPercentage = Math.round((totalUnlocked / rawBadges.length) * 100);

  return {
    badges: rawBadges,
    totalUnlocked,
    totalBadges: rawBadges.length,
    totalPoints,
    maxPoints,
    completionPercentage,
    officerRank: getOfficerRank(totalPoints)
  };
}

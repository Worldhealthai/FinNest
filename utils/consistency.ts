import { parseDateKey } from './taxYear';

interface DatedContribution {
  date: string;
  withdrawn?: boolean;
}

export interface ConsistencyBonus {
  name: string;
  value: number;
  earned: boolean;
}

export interface ConsistencyResult {
  score: number;
  monthsCovered: number;
  /** 12 entries in tax-year order (April first) — true if paid in that month */
  heatmap: boolean[];
  bonuses: ConsistencyBonus[];
  rating: string;
}

/**
 * Consistency score for one tax year: the share of its 12 months with a
 * (non-withdrawn) contribution, plus bonuses for an early start (by June), a
 * 3-month streak and 6+ active months. Capped at 100.
 */
export function calculateConsistency(yearContributions: DatedContribution[], taxYearStart: Date): ConsistencyResult {
  const active = yearContributions.filter((c) => !c.withdrawn);
  const heatmap: boolean[] = Array(12).fill(false);
  active.forEach((c) => {
    const month = parseDateKey(c.date).getMonth();
    heatmap[(month - taxYearStart.getMonth() + 12) % 12] = true;
  });

  const monthsCovered = heatmap.filter(Boolean).length;
  if (monthsCovered === 0) {
    return { score: 0, monthsCovered, heatmap, bonuses: [], rating: 'Not started' };
  }

  const first = new Date(Math.min(...active.map((c) => parseDateKey(c.date).getTime())));
  const monthsIn =
    (first.getFullYear() - taxYearStart.getFullYear()) * 12 + (first.getMonth() - taxYearStart.getMonth());

  let longest = 0;
  let run = 0;
  heatmap.forEach((hit) => {
    run = hit ? run + 1 : 0;
    longest = Math.max(longest, run);
  });

  const bonuses: ConsistencyBonus[] = [
    { name: 'Early start', value: 10, earned: monthsIn <= 2 },
    { name: '3-month streak', value: 10, earned: longest >= 3 },
    { name: 'Regular saver', value: 5, earned: monthsCovered >= 6 },
  ];

  const base = Math.round((monthsCovered / 12) * 100);
  const score = Math.min(100, base + bonuses.filter((b) => b.earned).reduce((s, b) => s + b.value, 0));

  let rating = 'Getting started';
  if (score >= 90) rating = 'ISA pro';
  else if (score >= 75) rating = 'Steady investor';
  else if (score >= 60) rating = 'Building habits';
  else if (score >= 40) rating = 'Making progress';

  return { score, monthsCovered, heatmap, bonuses, rating };
}

export const LEVELS = [
  { number: 1, name: 'Seedling', emoji: '🌱', minScore: 0, description: 'Your ISA journey begins', reward: 'Welcome badge' },
  { number: 2, name: 'Sprout', emoji: '🌿', minScore: 15, description: 'Growing a savings habit', reward: 'Consistent saver badge' },
  { number: 3, name: 'Sapling', emoji: '🌳', minScore: 30, description: 'Building steady momentum', reward: 'Momentum badge' },
  { number: 4, name: 'Bronze Investor', emoji: '🥉', minScore: 50, description: 'Halfway to ISA mastery', reward: 'Bronze achievement' },
  { number: 5, name: 'Silver Champion', emoji: '🥈', minScore: 65, description: 'Excellence in saving', reward: 'Silver achievement' },
  { number: 6, name: 'Gold Pro', emoji: '🥇', minScore: 80, description: 'Elite saver status', reward: 'Gold achievement' },
  { number: 7, name: 'ISA Master', emoji: '👑', minScore: 90, description: 'Legendary dedication', reward: 'Master crown' },
];

export type Level = (typeof LEVELS)[number];

/** Highest level whose threshold the score has reached (100 → ISA Master). */
export function getLevel(score: number): Level {
  return [...LEVELS].reverse().find((l) => score >= l.minScore) ?? LEVELS[0];
}

export function getNextLevel(level: Level): Level | null {
  return LEVELS.find((l) => l.number === level.number + 1) ?? null;
}

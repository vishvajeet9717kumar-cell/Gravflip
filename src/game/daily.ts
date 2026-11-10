import { DailyChallengeInfo } from './types';
import { getLevelById } from './levels';

const DAILY_CHALLENGE_KEY = 'gravflip_daily_challenge_state';

const MODIFIERS = [
  {
    title: 'Low Gravity Float',
    desc: 'Room gravity magnitude reduced by 35%. Floatier jumps and graceful ceiling transitions.',
  },
  {
    title: 'Hyper Boost Velocity',
    desc: 'Player movement acceleration and terminal run speed boosted by 40%.',
  },
  {
    title: 'Shadow Sensor Protocol',
    desc: 'Room visual sensors operating in dark mode. Glow radius is your primary vision.',
  },
  {
    title: 'Kinetic Overdrive',
    desc: 'Start with 2 extra mid-air flips ready. Hazards are faster.',
  },
  {
    title: 'Frictionless Glacier',
    desc: 'Surfaces infused with ice sub-zero friction. Extreme slide momentum.',
  },
];

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

/**
 * Returns today's seeded daily challenge.
 */
export function getDailyChallenge(): DailyChallengeInfo {
  const today = getTodayDateString();
  let saved: { date: string; completed: boolean; bestTime?: number; streak: number } | null = null;

  try {
    const raw = localStorage.getItem(DAILY_CHALLENGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch (_) {}

  // Deterministic seed from date
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) & 0xffffffff;
  }
  const posSeed = Math.abs(seed);

  // Pick level (1 to 40)
  const levelId = (posSeed % 40) + 1;
  const modIdx = (posSeed >> 3) % MODIFIERS.length;
  const mod = MODIFIERS[modIdx];

  const streak = saved?.date === today ? saved.streak : (saved?.streak || 0);
  const completed = saved?.date === today ? saved.completed : false;
  const bestTime = saved?.date === today ? saved.bestTime : undefined;

  return {
    date: today,
    levelId,
    modifierTitle: mod.title,
    modifierDesc: mod.desc,
    reward: 50 + Math.min(50, streak * 10),
    completed,
    bestTime,
    streak,
  };
}

export function saveDailyChallengeCompletion(finalTime: number): boolean {
  try {
    const today = getTodayDateString();
    const info = getDailyChallenge();
    const newStreak = info.completed ? info.streak : info.streak + 1;

    const data = {
      date: today,
      completed: true,
      bestTime: info.bestTime ? Math.min(info.bestTime, finalTime) : finalTime,
      streak: newStreak,
    };
    localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(data));
    return true;
  } catch (_) {
    return false;
  }
}

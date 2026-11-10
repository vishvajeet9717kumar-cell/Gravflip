import { Achievement } from './types';
import { audio } from './audio';
import { loadGameData, saveTotalCrystals } from './storage';

const ACHIEVEMENTS_STORAGE_KEY = 'gravflip_achievements_v1';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_escape',
    title: 'First Escape',
    description: 'Clear Room 1 and begin the journey toward the Core.',
    icon: 'DoorOpen',
    category: 'progression',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 10,
  },
  {
    id: 'gravity_cadet',
    title: 'Gravity Cadet',
    description: 'Flip gravity 25 times.',
    icon: 'ArrowUpDown',
    category: 'skill',
    target: 25,
    current: 0,
    unlocked: false,
    rewardCrystals: 15,
  },
  {
    id: 'gravity_master',
    title: 'Gravity Bender',
    description: 'Flip gravity 200 times.',
    icon: 'Zap',
    category: 'skill',
    target: 200,
    current: 0,
    unlocked: false,
    rewardCrystals: 50,
  },
  {
    id: 'crystal_seeker',
    title: 'Crystal Seeker',
    description: 'Collect 50 normal crystals.',
    icon: 'Sparkles',
    category: 'progression',
    target: 50,
    current: 0,
    unlocked: false,
    rewardCrystals: 20,
  },
  {
    id: 'crystal_hoarder',
    title: 'Crystal Hoarder',
    description: 'Collect 250 normal crystals across all rooms.',
    icon: 'Coins',
    category: 'progression',
    target: 250,
    current: 0,
    unlocked: false,
    rewardCrystals: 75,
  },
  {
    id: 'star_first',
    title: 'Starlight',
    description: 'Discover your first rare Golden Star Crystal.',
    icon: 'Star',
    category: 'secrets',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 25,
  },
  {
    id: 'star_astronomer',
    title: 'Cosmic Cartographer',
    description: 'Find 10 Golden Star Crystals hidden in perilous spots.',
    icon: 'Compass',
    category: 'secrets',
    target: 10,
    current: 0,
    unlocked: false,
    rewardCrystals: 100,
  },
  {
    id: 'portal_nomad',
    title: 'Wormhole Nomad',
    description: 'Enter 25 level completion portals.',
    icon: 'Disc',
    category: 'progression',
    target: 25,
    current: 0,
    unlocked: false,
    rewardCrystals: 30,
  },
  {
    id: 'teleport_jumper',
    title: 'Quantum Jumper',
    description: 'Warp through 15 teleporter pairs.',
    icon: 'Radio',
    category: 'skill',
    target: 15,
    current: 0,
    unlocked: false,
    rewardCrystals: 20,
  },
  {
    id: 'spring_loaded',
    title: 'Spring Loaded',
    description: 'Launch from 20 bounce pads.',
    icon: 'Activity',
    category: 'skill',
    target: 20,
    current: 0,
    unlocked: false,
    rewardCrystals: 20,
  },
  {
    id: 'wall_climber',
    title: 'Wall Climber',
    description: 'Stick to 10 sticky walls.',
    icon: 'Shield',
    category: 'skill',
    target: 10,
    current: 0,
    unlocked: false,
    rewardCrystals: 15,
  },
  {
    id: 'ice_drifter',
    title: 'Ice Drifter',
    description: 'Slide across 15 slippery ice surfaces.',
    icon: 'Snowflake',
    category: 'skill',
    target: 15,
    current: 0,
    unlocked: false,
    rewardCrystals: 20,
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Clear any level in under 10 seconds.',
    icon: 'Clock',
    category: 'skill',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 40,
  },
  {
    id: 'flawless_sector',
    title: 'Flawless Sector',
    description: 'Clear any 5-room world without dying once.',
    icon: 'Award',
    category: 'mastery',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 80,
  },
  {
    id: 'boss_slayer',
    title: 'Core Guardian Down',
    description: 'Defeat your first world boss challenge.',
    icon: 'Crown',
    category: 'mastery',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 50,
  },
  {
    id: 'midway_breakout',
    title: 'Midway Breakout',
    description: 'Complete 20 handcrafted rooms.',
    icon: 'Layers',
    category: 'progression',
    target: 20,
    current: 0,
    unlocked: false,
    rewardCrystals: 60,
  },
  {
    id: 'chaos_survivor',
    title: 'Singularity Overlord',
    description: 'Conquer Room 40 and escape the Chaos Core.',
    icon: 'Trophy',
    category: 'mastery',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 150,
  },
  {
    id: 'wardrobe_stylist',
    title: 'Wardrobe Stylist',
    description: 'Unlock 4 unique orb skins.',
    icon: 'Palette',
    category: 'secrets',
    target: 4,
    current: 1,
    unlocked: false,
    rewardCrystals: 35,
  },
  {
    id: 'daily_devotee',
    title: 'Daily Devotee',
    description: 'Complete 3 Daily Challenges.',
    icon: 'Calendar',
    category: 'progression',
    target: 3,
    current: 0,
    unlocked: false,
    rewardCrystals: 45,
  },
  {
    id: 'endless_voyager',
    title: 'Infinite Orbit',
    description: 'Reach 200 meters in Endless Mode.',
    icon: 'Infinity',
    category: 'mastery',
    target: 200,
    current: 0,
    unlocked: false,
    rewardCrystals: 60,
  },
  {
    id: 'combo_god',
    title: 'Combo Legend',
    description: 'Achieve a x5 Crystal Combo multiplier.',
    icon: 'Flame',
    category: 'skill',
    target: 5,
    current: 0,
    unlocked: false,
    rewardCrystals: 30,
  },
  {
    id: 'secret_agent',
    title: 'Passage Discovered',
    description: 'Reveal a secret hidden room.',
    icon: 'Eye',
    category: 'secrets',
    target: 1,
    current: 0,
    unlocked: false,
    rewardCrystals: 25,
  },
];

export function loadAchievements(): Achievement[] {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const saved: Record<string, { current: number; unlocked: boolean; unlockedAt?: string }> = JSON.parse(raw);

    return INITIAL_ACHIEVEMENTS.map((a) => {
      const s = saved[a.id];
      if (!s) return a;
      return {
        ...a,
        current: Math.max(a.current, s.current || 0),
        unlocked: s.unlocked || false,
        unlockedAt: s.unlockedAt,
      };
    });
  } catch (_) {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  try {
    const map: Record<string, { current: number; unlocked: boolean; unlockedAt?: string }> = {};
    for (const a of achievements) {
      map[a.id] = {
        current: a.current,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt,
      };
    }
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(map));
  } catch (_) {}
}

/**
 * Checks progress or sets an absolute value for an achievement.
 * Returns the Achievement if it was UNLOCKED in this call (for toast notification).
 */
export function trackAchievement(
  id: string,
  increment: number = 0,
  absoluteValue?: number
): Achievement | null {
  try {
    const list = loadAchievements();
    const item = list.find((a) => a.id === id);
    if (!item || item.unlocked) return null;

    if (absoluteValue !== undefined) {
      item.current = Math.max(item.current, absoluteValue);
    } else {
      item.current += increment;
    }

    if (item.current >= item.target) {
      item.unlocked = true;
      item.unlockedAt = new Date().toISOString();
      saveAchievements(list);

      // Award crystals
      const save = loadGameData();
      saveTotalCrystals(save.totalCrystals + item.rewardCrystals);
      audio.playClaimReward();

      return item;
    }

    saveAchievements(list);
    return null;
  } catch (_) {
    return null;
  }
}

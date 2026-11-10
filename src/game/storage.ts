import { LevelProgress, DailyRewardState } from './types';

const STORAGE_KEYS = {
  CRYSTALS: 'gravflip_total_crystals',
  LEVEL_PROGRESS: 'gravflip_level_progress',
  UNLOCKED_SKINS: 'gravflip_unlocked_skins',
  EQUIPPED_SKIN: 'gravflip_equipped_skin',
  DAILY_REWARD: 'gravflip_daily_reward',
};

export interface GameSaveData {
  totalCrystals: number;
  levelProgress: Record<number, LevelProgress>;
  unlockedSkins: string[];
  equippedSkinId: string;
  dailyReward: DailyRewardState;
}

export function loadGameData(): GameSaveData {
  try {
    const rawCrystals = localStorage.getItem(STORAGE_KEYS.CRYSTALS);
    const totalCrystals = rawCrystals ? Math.max(0, parseInt(rawCrystals, 10)) : 0;

    const rawProgress = localStorage.getItem(STORAGE_KEYS.LEVEL_PROGRESS);
    let levelProgress: Record<number, LevelProgress> = {};
    if (rawProgress) {
      try {
        levelProgress = JSON.parse(rawProgress);
      } catch (_) {}
    }

    // Level 1 is always unlocked by default
    if (!levelProgress[1]) {
      levelProgress[1] = {
        unlocked: true,
        stars: 0,
        bestTime: null,
        crystalsCollected: 0,
      };
    }

    // Migration for rebuilt levels 1-20: Reset old records (< 12s) from former 1-screen rooms so new records are genuine
    try {
      const MIGRATION_KEY = 'gravflip_rebuilt_l1_20_migrated';
      if (!localStorage.getItem(MIGRATION_KEY)) {
        let changed = false;
        for (let i = 1; i <= 20; i++) {
          if (levelProgress[i] && levelProgress[i].bestTime !== null && levelProgress[i].bestTime! < 12) {
            levelProgress[i].bestTime = null;
            changed = true;
          }
        }
        localStorage.setItem(MIGRATION_KEY, 'true');
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(levelProgress));
        }
      }
    } catch (_) {}

    // Migration for rebuilt levels 21-40: Reset old records while keeping unlocks and stars intact
    try {
      const MIGRATION_KEY_2 = 'gravflip_rebuilt_l21_40_migrated';
      if (!localStorage.getItem(MIGRATION_KEY_2)) {
        let changed = false;
        for (let i = 21; i <= 40; i++) {
          if (levelProgress[i] && levelProgress[i].bestTime !== null) {
            levelProgress[i].bestTime = null;
            changed = true;
          }
        }
        localStorage.setItem(MIGRATION_KEY_2, 'true');
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(levelProgress));
        }
      }
    } catch (_) {}

    const rawSkins = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
    let unlockedSkins: string[] = ['neon-vanguard'];
    if (rawSkins) {
      try {
        unlockedSkins = JSON.parse(rawSkins);
      } catch (_) {}
    }
    if (!unlockedSkins.includes('neon-vanguard')) {
      unlockedSkins.unshift('neon-vanguard');
    }

    const equippedSkinId = localStorage.getItem(STORAGE_KEYS.EQUIPPED_SKIN) || 'neon-vanguard';

    // Daily reward state
    const today = getTodayDateString();
    const rawDaily = localStorage.getItem(STORAGE_KEYS.DAILY_REWARD);
    let dailyReward: DailyRewardState = {
      lastClaimDate: '',
      dayStreak: 0,
      claimedToday: false,
    };
    if (rawDaily) {
      try {
        const parsed = JSON.parse(rawDaily);
        dailyReward = {
          lastClaimDate: parsed.lastClaimDate || '',
          dayStreak: parsed.dayStreak || 0,
          claimedToday: parsed.lastClaimDate === today,
        };
      } catch (_) {}
    }

    return {
      totalCrystals,
      levelProgress,
      unlockedSkins,
      equippedSkinId,
      dailyReward,
    };
  } catch (_) {
    return {
      totalCrystals: 0,
      levelProgress: {
        1: { unlocked: true, stars: 0, bestTime: null, crystalsCollected: 0 },
      },
      unlockedSkins: ['neon-vanguard'],
      equippedSkinId: 'neon-vanguard',
      dailyReward: { lastClaimDate: '', dayStreak: 0, claimedToday: false },
    };
  }
}

export function saveTotalCrystals(amount: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CRYSTALS, amount.toString());
  } catch (_) {}
}

export function saveLevelResult(
  levelId: number,
  timeSeconds: number,
  crystalsCollected: number,
  totalCrystals: number,
  parTime: number,
  hasStarCrystal: boolean = false
): { starsEarned: number; isNewBestTime: boolean; newCrystalsAdded: number; nextLevelUnlocked: boolean; starCrystalFound: boolean } {
  try {
    const data = loadGameData();
    const existing = data.levelProgress[levelId] || {
      unlocked: true,
      stars: 0,
      bestTime: null,
      crystalsCollected: 0,
    };

    // Calculate stars:
    // 1 Star: Beat level
    // 2 Stars: Collect all normal crystals
    // 3 Stars: Beat par time AND collect all normal crystals
    let starsEarned = 1;
    if (crystalsCollected >= totalCrystals) {
      starsEarned = timeSeconds <= parTime ? 3 : 2;
    }
    const bestStars = Math.max(existing.stars, starsEarned);

    const isNewBestTime = existing.bestTime === null || timeSeconds < existing.bestTime;
    const bestTime = isNewBestTime ? timeSeconds : existing.bestTime;

    // Only award newly collected normal crystals to avoid infinite farming
    let newCrystalsAdded = Math.max(0, crystalsCollected - existing.crystalsCollected);
    // If newly discovered Star Crystal, award 10 bonus crystals!
    const newlyFoundStarCrystal = hasStarCrystal && !existing.hasStarCrystal;
    if (newlyFoundStarCrystal) {
      newCrystalsAdded += 10;
    }

    const newTotalCrystals = data.totalCrystals + newCrystalsAdded;
    saveTotalCrystals(newTotalCrystals);

    data.levelProgress[levelId] = {
      unlocked: true,
      stars: bestStars,
      bestTime,
      crystalsCollected: Math.max(existing.crystalsCollected, crystalsCollected),
      hasStarCrystal: existing.hasStarCrystal || hasStarCrystal,
    };

    // Unlock next level (up to level 40)
    let nextLevelUnlocked = false;
    const nextLevelId = levelId + 1;
    if (nextLevelId <= 40) {
      if (!data.levelProgress[nextLevelId] || !data.levelProgress[nextLevelId].unlocked) {
        data.levelProgress[nextLevelId] = {
          unlocked: true,
          stars: 0,
          bestTime: null,
          crystalsCollected: 0,
        };
        nextLevelUnlocked = true;
      }
    }

    localStorage.setItem(STORAGE_KEYS.LEVEL_PROGRESS, JSON.stringify(data.levelProgress));

    return {
      starsEarned,
      isNewBestTime,
      newCrystalsAdded,
      nextLevelUnlocked,
      starCrystalFound: hasStarCrystal || !!existing.hasStarCrystal,
    };
  } catch (_) {
    return {
      starsEarned: 1,
      isNewBestTime: true,
      newCrystalsAdded: crystalsCollected,
      nextLevelUnlocked: true,
      starCrystalFound: hasStarCrystal,
    };
  }
}

export function saveSkinPurchase(skinId: string, cost: number): boolean {
  try {
    const data = loadGameData();
    if (data.totalCrystals < cost) return false;

    if (!data.unlockedSkins.includes(skinId)) {
      data.unlockedSkins.push(skinId);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(data.unlockedSkins));
    }

    saveTotalCrystals(data.totalCrystals - cost);
    equipSkin(skinId);
    return true;
  } catch (_) {
    return false;
  }
}

export function equipSkin(skinId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EQUIPPED_SKIN, skinId);
  } catch (_) {}
}

export function claimDailyReward(): { rewardAmount: number; dayStreak: number; success: boolean } {
  try {
    const today = getTodayDateString();
    const data = loadGameData();
    if (data.dailyReward.lastClaimDate === today) {
      return { rewardAmount: 0, dayStreak: data.dailyReward.dayStreak, success: false };
    }

    // Determine streak (reset to 1 if skipped more than 1 day)
    let newStreak = 1;
    if (data.dailyReward.lastClaimDate) {
      const yesterday = getYesterdayDateString();
      if (data.dailyReward.lastClaimDate === yesterday) {
        newStreak = (data.dailyReward.dayStreak % 7) + 1;
      }
    }

    // Reward scaling: Day 1: 15, Day 2: 20, Day 3: 25, Day 4: 30, Day 5: 40, Day 6: 50, Day 7: 75
    const streakRewards = [15, 20, 25, 30, 40, 50, 75];
    const rewardAmount = streakRewards[Math.min(streakRewards.length - 1, newStreak - 1)];

    saveTotalCrystals(data.totalCrystals + rewardAmount);

    const newDaily = {
      lastClaimDate: today,
      dayStreak: newStreak,
    };
    localStorage.setItem(STORAGE_KEYS.DAILY_REWARD, JSON.stringify(newDaily));

    return { rewardAmount, dayStreak: newStreak, success: true };
  } catch (_) {
    return { rewardAmount: 15, dayStreak: 1, success: true };
  }
}

function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}

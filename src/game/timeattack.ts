export interface SpeedrunRecord {
  time: number;
  date: string;
}

const TIME_ATTACK_KEY_PREFIX = 'gravflip_ta_lvl_';

export function getTimeAttackLeaderboard(levelId: number): SpeedrunRecord[] {
  try {
    const raw = localStorage.getItem(`${TIME_ATTACK_KEY_PREFIX}${levelId}`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) {
    return [];
  }
}

export function saveTimeAttackRecord(levelId: number, timeSeconds: number): { isNewRecord: boolean; rank: number } {
  try {
    const records = getTimeAttackLeaderboard(levelId);
    const newRecord: SpeedrunRecord = {
      time: Math.round(timeSeconds * 100) / 100,
      date: new Date().toLocaleDateString(),
    };

    records.push(newRecord);
    records.sort((a, b) => a.time - b.time);
    const trimmed = records.slice(0, 3); // Top 3 local

    localStorage.setItem(`${TIME_ATTACK_KEY_PREFIX}${levelId}`, JSON.stringify(trimmed));
    const rank = trimmed.findIndex((r) => r.time === newRecord.time) + 1;

    return {
      isNewRecord: rank === 1,
      rank: rank > 0 ? rank : 4,
    };
  } catch (_) {
    return { isNewRecord: false, rank: 0 };
  }
}

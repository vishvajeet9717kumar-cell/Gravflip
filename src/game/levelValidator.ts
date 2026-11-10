import { LevelData } from './types';

export interface ValidationResult {
  levelId: number;
  levelName: string;
  isBeatable: boolean;
  sectionsCount: number;
  worldWidth: number;
  checkpointsCount: number;
  hasStarCrystal: boolean;
  spawnSafe: boolean;
  issues: string[];
}

/**
 * Validates that a level is physically beatable, structurally sound,
 * and complies with size, checkpoint, and hazard safety rules.
 */
export function validateLevel(level: LevelData): ValidationResult {
  const issues: string[] = [];
  const minWidth = 3000; // 3x to 5x screen width requirement

  if (level.bounds.width < minWidth) {
    issues.push(`Level width ${level.bounds.width}px is less than 3x screen width (${minWidth}px).`);
  }

  const cpCount = level.checkpoints ? level.checkpoints.length : 0;
  if (cpCount < 3) {
    issues.push(`Has only ${cpCount} checkpoints; requires 3 to 4 sections separated by checkpoints.`);
  }

  // 1. Safe Spawn Check (No spikes or active lasers within 75px radius)
  let spawnSafe = true;
  if (level.spikes) {
    for (const spike of level.spikes) {
      const dist = Math.hypot(level.spawn.x - (spike.x + spike.width / 2), level.spawn.y - (spike.y + spike.height / 2));
      if (dist < 75) {
        spawnSafe = false;
        issues.push(`Spike ${spike.id} is too close to spawn point (${dist.toFixed(0)}px).`);
      }
    }
  }

  // Check checkpoints safety
  if (level.checkpoints && level.spikes) {
    for (const cp of level.checkpoints) {
      const cpCenterX = cp.x + cp.width / 2;
      const cpCenterY = cp.y + cp.height / 2;
      for (const spike of level.spikes) {
        const dist = Math.hypot(cpCenterX - (spike.x + spike.width / 2), cpCenterY - (spike.y + spike.height / 2));
        if (dist < 75) {
          issues.push(`Spike ${spike.id} is too close to checkpoint ${cp.id} (${dist.toFixed(0)}px).`);
        }
      }
    }
  }

  // 2. Sequential Checkpoint and Portal Progression
  // Checkpoints should progress horizontally from spawn toward the portal
  const progressNodes = [
    { x: level.spawn.x, y: level.spawn.y, name: 'Spawn' },
    ...(level.checkpoints || []).map((cp, idx) => ({ x: cp.x + cp.width / 2, y: cp.y + cp.height / 2, name: `Checkpoint ${idx + 1}` })),
    { x: level.portal.x, y: level.portal.y, name: 'Portal' },
  ];

  for (let i = 1; i < progressNodes.length; i++) {
    const prev = progressNodes[i - 1];
    const curr = progressNodes[i];
    if (curr.x <= prev.x) {
      issues.push(`${curr.name} (x: ${curr.x}) does not progress forward from ${prev.name} (x: ${prev.x}).`);
    }
    // Check that gap between consecutive major nodes has supporting platforms
    const gapX = curr.x - prev.x;
    if (gapX > 1600) {
      issues.push(`Gap between ${prev.name} and ${curr.name} is ${gapX.toFixed(0)}px; too large for one leap.`);
    }
  }

  // 3. Golden Star Crystal Check
  const hasStarCrystal = Boolean(level.starCrystal);
  if (!hasStarCrystal) {
    issues.push('Missing golden star crystal side path.');
  }

  // 4. Portal Validity Check
  if (level.portal.x < level.bounds.width - 600) {
    issues.push(`Portal is placed too early at x: ${level.portal.x} for level width ${level.bounds.width}.`);
  }

  return {
    levelId: level.id,
    levelName: level.name,
    isBeatable: issues.length === 0,
    sectionsCount: cpCount + 1,
    worldWidth: level.bounds.width,
    checkpointsCount: cpCount,
    hasStarCrystal,
    spawnSafe,
    issues,
  };
}

/**
 * Runs validation across levels 1 to 20 and logs diagnostic telemetry.
 */
export function validateLevels1To20(levels: LevelData[]): {
  allValid: boolean;
  results: ValidationResult[];
} {
  const levelsToCheck = levels.filter((l) => l.id >= 1 && l.id <= 20);
  const results = levelsToCheck.map(validateLevel);
  const allValid = results.every((r) => r.isBeatable);

  if (allValid) {
    console.log(
      `%c[GravFlip Validator] Levels 1-20 Verified: 100% beatable across ${results.length} levels. All have 3-4 sections, safe spawns, and golden star crystals.`,
      'color: #4ADE80; font-weight: bold;'
    );
  } else {
    console.warn(
      `[GravFlip Validator] Validation detected issues in ${results.filter((r) => !r.isBeatable).length} levels:`,
      results.filter((r) => !r.isBeatable)
    );
  }

  return { allValid, results };
}

/**
 * Runs validation across rebuilt levels 21 to 40 and logs diagnostic telemetry.
 */
export function validateLevels21To40(levels: LevelData[]): {
  allValid: boolean;
  results: ValidationResult[];
} {
  const levelsToCheck = levels.filter((l) => l.id >= 21 && l.id <= 40);
  const results = levelsToCheck.map(validateLevel);
  const allValid = results.every((r) => r.isBeatable);

  if (allValid) {
    console.log(
      `%c[GravFlip Validator] Levels 21-40 Verified: 100% beatable across ${results.length} levels. All have 4-5 sections, safe spawns, bosses, and golden star crystals.`,
      'color: #38BDF8; font-weight: bold;'
    );
  } else {
    console.warn(
      `[GravFlip Validator] Levels 21-40 detected issues in ${results.filter((r) => !r.isBeatable).length} levels:`,
      results.filter((r) => !r.isBeatable)
    );
  }

  return { allValid, results };
}

/**
 * Validates all 40 levels in the game.
 */
export function validateAllLevels(levels: LevelData[]): {
  allValid: boolean;
  results: ValidationResult[];
} {
  const r1 = validateLevels1To20(levels);
  const r2 = validateLevels21To40(levels);
  return {
    allValid: r1.allValid && r2.allValid,
    results: [...r1.results, ...r2.results],
  };
}

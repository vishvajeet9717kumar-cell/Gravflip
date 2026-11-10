import { LevelData, Platform, Crystal, Portal, GravityGate, BouncePad, SpeedBoostStrip, Spike, Laser, SawBlade } from './types';

const ENDLESS_HIGHSCORE_KEY = 'gravflip_endless_highscore';

export interface EndlessChunkDef {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  platforms: Platform[];
  crystals: Crystal[];
  portal: { x: number; y: number };
  bouncePads?: BouncePad[];
  gravityGates?: GravityGate[];
  boostStrips?: SpeedBoostStrip[];
  spikes?: Spike[];
  lasers?: Laser[];
  sawBlades?: SawBlade[];
}

export const ENDLESS_CHUNKS: EndlessChunkDef[] = [
  // Chunk 1: Easy Starter Run
  {
    id: 'easy_1',
    name: 'Sector Gateway',
    difficulty: 'easy',
    platforms: [
      { id: 'p1', x: 0, y: 640, width: 400, height: 40, isSolid: true },
      { id: 'p2', x: 450, y: 520, width: 220, height: 30, isSolid: true },
      { id: 'p3', x: 720, y: 400, width: 240, height: 30, isSolid: true },
      { id: 'p4', x: 1000, y: 300, width: 280, height: 40, isSolid: true },
      { id: 'roof', x: 0, y: 40, width: 1280, height: 30, isSolid: true },
    ],
    crystals: [
      { id: 'c1', x: 560, y: 470, collected: false, baseY: 470, pulsePhase: 0 },
      { id: 'c2', x: 840, y: 350, collected: false, baseY: 350, pulsePhase: 1 },
      { id: 'c3', x: 1100, y: 250, collected: false, baseY: 250, pulsePhase: 2 },
    ],
    portal: { x: 1200, y: 240 },
  },

  // Chunk 2: Gravity Flip Corridor
  {
    id: 'easy_2',
    name: 'Ceiling Vector',
    difficulty: 'easy',
    platforms: [
      { id: 'p1', x: 0, y: 640, width: 350, height: 40, isSolid: true },
      { id: 'p_roof', x: 380, y: 80, width: 450, height: 35, isSolid: true },
      { id: 'p3', x: 880, y: 600, width: 400, height: 40, isSolid: true },
      { id: 'roof', x: 0, y: 40, width: 1280, height: 30, isSolid: true },
    ],
    gravityGates: [
      { id: 'g1', x: 340, y: 400, width: 40, height: 240, direction: 'UP' },
      { id: 'g2', x: 840, y: 120, width: 40, height: 240, direction: 'DOWN' },
    ],
    crystals: [
      { id: 'c1', x: 520, y: 140, collected: false, baseY: 140, pulsePhase: 0 },
      { id: 'c2', x: 680, y: 140, collected: false, baseY: 140, pulsePhase: 1.5 },
      { id: 'c3', x: 1040, y: 550, collected: false, baseY: 550, pulsePhase: 2.5 },
    ],
    portal: { x: 1210, y: 540 },
  },

  // Chunk 3: Spring Valley
  {
    id: 'easy_3',
    name: 'Bounce Ridge',
    difficulty: 'easy',
    platforms: [
      { id: 'p1', x: 0, y: 640, width: 300, height: 40, isSolid: true },
      { id: 'p2', x: 360, y: 640, width: 120, height: 40, isSolid: true },
      { id: 'p3', x: 650, y: 350, width: 220, height: 30, isSolid: true },
      { id: 'p4', x: 980, y: 580, width: 300, height: 40, isSolid: true },
    ],
    bouncePads: [
      { id: 'b1', x: 390, y: 624, width: 60, height: 16, direction: 'UP', force: 880 },
    ],
    crystals: [
      { id: 'c1', x: 500, y: 320, collected: false, baseY: 320, pulsePhase: 0 },
      { id: 'c2', x: 760, y: 300, collected: false, baseY: 300, pulsePhase: 1 },
      { id: 'c3', x: 1120, y: 530, collected: false, baseY: 530, pulsePhase: 2 },
    ],
    portal: { x: 1220, y: 520 },
  },

  // Chunk 4: Medium Moving Platforms
  {
    id: 'med_1',
    name: 'Kinetic Rails',
    difficulty: 'medium',
    platforms: [
      { id: 'p1', x: 0, y: 640, width: 280, height: 40, isSolid: true },
      {
        id: 'p_move1',
        x: 350,
        y: 500,
        width: 180,
        height: 28,
        isSolid: true,
        isMoving: true,
        moveAxis: 'X',
        moveRange: 220,
        moveSpeed: 130,
        startX: 350,
        startY: 500,
        movePhase: 0,
      },
      {
        id: 'p_move2',
        x: 680,
        y: 360,
        width: 180,
        height: 28,
        isSolid: true,
        isMoving: true,
        moveAxis: 'Y',
        moveRange: 160,
        moveSpeed: 110,
        startX: 680,
        startY: 360,
        movePhase: 1,
      },
      { id: 'p4', x: 960, y: 440, width: 320, height: 40, isSolid: true },
    ],
    spikes: [
      { id: 'sp1', x: 350, y: 680, width: 550, height: 20, direction: 'UP', isActive: true },
    ],
    crystals: [
      { id: 'c1', x: 440, y: 450, collected: false, baseY: 450, pulsePhase: 0 },
      { id: 'c2', x: 770, y: 310, collected: false, baseY: 310, pulsePhase: 1.2 },
      { id: 'c3', x: 1100, y: 390, collected: false, baseY: 390, pulsePhase: 2 },
    ],
    portal: { x: 1210, y: 380 },
  },

  // Chunk 5: Medium Laser Precision
  {
    id: 'med_2',
    name: 'Optical Grid',
    difficulty: 'medium',
    platforms: [
      { id: 'p1', x: 0, y: 640, width: 260, height: 40, isSolid: true },
      { id: 'p2', x: 340, y: 550, width: 180, height: 30, isSolid: true },
      { id: 'p3', x: 620, y: 420, width: 180, height: 30, isSolid: true },
      { id: 'p4', x: 880, y: 300, width: 180, height: 30, isSolid: true },
      { id: 'p5', x: 1100, y: 560, width: 180, height: 40, isSolid: true },
    ],
    lasers: [
      {
        id: 'l1',
        x1: 540,
        y1: 100,
        x2: 540,
        y2: 700,
        isActive: true,
        isTimed: true,
        onDuration: 1.8,
        offDuration: 1.4,
        timer: 0,
      },
      {
        id: 'l2',
        x1: 820,
        y1: 100,
        x2: 820,
        y2: 700,
        isActive: true,
        isTimed: true,
        onDuration: 1.8,
        offDuration: 1.4,
        timer: 1.2,
      },
    ],
    crystals: [
      { id: 'c1', x: 430, y: 500, collected: false, baseY: 500, pulsePhase: 0 },
      { id: 'c2', x: 710, y: 370, collected: false, baseY: 370, pulsePhase: 1.4 },
      { id: 'c3', x: 970, y: 250, collected: false, baseY: 250, pulsePhase: 2.2 },
    ],
    portal: { x: 1220, y: 500 },
  },

  // Chunk 6: Hard Rotating Saw Gauntlet
  {
    id: 'hard_1',
    name: 'Buzzsaw Chasm',
    difficulty: 'hard',
    platforms: [
      { id: 'p1', x: 0, y: 640, width: 220, height: 40, isSolid: true },
      { id: 'p2', x: 300, y: 520, width: 140, height: 30, isSolid: true, isCrumbling: true },
      { id: 'p3', x: 550, y: 380, width: 160, height: 30, isSolid: true, surfaceType: 'ice' },
      { id: 'p4', x: 820, y: 500, width: 140, height: 30, isSolid: true, isCrumbling: true },
      { id: 'p5', x: 1060, y: 620, width: 220, height: 40, isSolid: true },
    ],
    sawBlades: [
      {
        id: 'sb1',
        x: 440,
        y: 450,
        radius: 28,
        rotation: 0,
        rotSpeed: 5,
        pathStartX: 440,
        pathStartY: 450,
        pathEndX: 440,
        pathEndY: 220,
        speed: 0.6,
        progress: 0,
        dir: 1,
      },
      {
        id: 'sb2',
        x: 740,
        y: 300,
        radius: 28,
        rotation: 0,
        rotSpeed: 5,
        pathStartX: 740,
        pathStartY: 300,
        pathEndX: 740,
        pathEndY: 560,
        speed: 0.7,
        progress: 0.5,
        dir: 1,
      },
    ],
    crystals: [
      { id: 'c1', x: 370, y: 470, collected: false, baseY: 470, pulsePhase: 0 },
      { id: 'c2', x: 630, y: 330, collected: false, baseY: 330, pulsePhase: 1 },
      { id: 'c3', x: 890, y: 450, collected: false, baseY: 450, pulsePhase: 2 },
    ],
    portal: { x: 1200, y: 560 },
  },
];

export function getEndlessHighScore(): number {
  try {
    const raw = localStorage.getItem(ENDLESS_HIGHSCORE_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch (_) {
    return 0;
  }
}

export function saveEndlessHighScore(score: number): boolean {
  try {
    const prev = getEndlessHighScore();
    if (score > prev) {
      localStorage.setItem(ENDLESS_HIGHSCORE_KEY, score.toString());
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

/**
 * Builds a level from an endless chunk index with scaling speed and distance.
 */
export function buildEndlessLevel(chunkIndex: number): LevelData {
  const chunkPool =
    chunkIndex < 3
      ? ENDLESS_CHUNKS.filter((c) => c.difficulty === 'easy')
      : chunkIndex < 8
      ? ENDLESS_CHUNKS.filter((c) => c.difficulty === 'medium' || c.difficulty === 'easy')
      : ENDLESS_CHUNKS;

  const chunk = chunkPool[chunkIndex % chunkPool.length];

  return {
    id: 1000 + chunkIndex,
    world: ((chunkIndex % 8) + 1),
    name: `Endless Stage ${chunkIndex + 1}: ${chunk.name}`,
    parTime: 25,
    spawn: { x: 80, y: 580 },
    initialGravity: 'DOWN',
    allowedGravity: ['DOWN', 'UP'],
    bounds: { width: 1280, height: 720 },
    platforms: chunk.platforms.map((p) => ({ ...p })),
    crystals: chunk.crystals.map((c) => ({ ...c, collected: false })),
    portal: {
      x: chunk.portal.x,
      y: chunk.portal.y,
      radius: 36,
      rotation: 0,
      active: true,
    },
    bouncePads: chunk.bouncePads?.map((b) => ({ ...b })),
    gravityGates: chunk.gravityGates?.map((g) => ({ ...g })),
    boostStrips: chunk.boostStrips?.map((s) => ({ ...s })),
    spikes: chunk.spikes?.map((sp) => ({ ...sp })),
    lasers: chunk.lasers?.map((l) => ({ ...l })),
    sawBlades: chunk.sawBlades?.map((sb) => ({ ...sb })),
  };
}

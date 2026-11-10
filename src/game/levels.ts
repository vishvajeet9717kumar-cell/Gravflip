import {
  LevelData,
  Platform,
  Crystal,
  Checkpoint,
  Portal,
  Spike,
  BouncePad,
  GravityGate,
  Laser,
  SawBlade,
  Switch,
  Door,
  Teleporter,
  SpeedBoostStrip,
  GravityDirection,
} from './types';
import { STAGE_D_LEVELS } from './levels_stage_d';
import { validateAllLevels } from './levelValidator';

// ============================================================================
// CONCISE LEVEL AUTHORING HELPERS (keeps level file compact and maintainable)
// ============================================================================
const P = (id: string, x: number, y: number, w: number, h: number, extra?: Partial<Platform>): Platform => ({
  id, x, y, width: w, height: h, ...extra,
});
const C = (id: string, x: number, y: number): Crystal => ({
  id, x, y, collected: false, baseY: y, pulsePhase: Math.random() * 6,
});
const STAR = (id: string, x: number, y: number): Crystal => ({
  id, x, y, collected: false, baseY: y, pulsePhase: 0, isStar: true,
});
const CP = (id: string, x: number, y: number, g: GravityDirection = 'DOWN', w = 40, h = 60): Checkpoint => ({
  id, x, y, width: w, height: h, isActive: false, respawnGravity: g,
});
const SPK = (id: string, x: number, y: number, w: number, h: number, dir: GravityDirection = 'UP'): Spike => ({
  id, x, y, width: w, height: h, direction: dir, isActive: true,
});
const BPAD = (id: string, x: number, y: number, w: number, h: number, dir: GravityDirection = 'UP', force = 820): BouncePad => ({
  id, x, y, width: w, height: h, direction: dir, force,
});
const GATE = (id: string, x: number, y: number, w: number, h: number, dir: GravityDirection): GravityGate => ({
  id, x, y, width: w, height: h, direction: dir,
});
const LSR = (id: string, x1: number, y1: number, x2: number, y2: number, timed?: { on: number; off: number }): Laser => ({
  id, x1, y1, x2, y2, isActive: true, isTimed: !!timed, onDuration: timed?.on || 2.2, offDuration: timed?.off || 1.8, timer: timed?.on || 2.2, flickerDuration: 0.5,
});
const SAW = (id: string, x: number, y: number, r: number, move?: { sx: number; sy: number; ex: number; ey: number }): SawBlade => ({
  id, x, y, radius: r, rotation: 0, rotSpeed: 4.5,
  pathStartX: move?.sx, pathStartY: move?.sy, pathEndX: move?.ex, pathEndY: move?.ey,
});
const SW = (id: string, x: number, y: number, doorId: string, color = '#38BDF8', w = 36, h = 18): Switch => ({
  id, x, y, width: w, height: h, targetDoorId: doorId, color, isPressed: false,
});
const DR = (id: string, x: number, y: number, w: number, h: number, color = '#38BDF8'): Door => ({
  id, x, y, width: w, height: h, color, isOpen: false, openProgress: 0,
});
const TELE = (id: string, pairId: string, x: number, y: number, color = '#A855F7', w = 40, h = 64): Teleporter => ({
  id, pairId, color, x, y, width: w, height: h,
});
const BOOST = (id: string, x: number, y: number, w: number, h: number, dir: 'RIGHT' | 'LEFT' = 'RIGHT', spd = 650): SpeedBoostStrip => ({
  id, x, y, width: w, height: h, direction: dir, speed: spd,
});

// ============================================================================
// WORLD 1: GRAVITY BASICS (LEVELS 1–5)
// Expanded to 3x–4x screen width with 3–4 sections separated by checkpoints.
// ============================================================================

export const LEVEL_1: LevelData = {
  id: 1,
  world: 1,
  name: "First Inversion",
  hint: "Tap anywhere or press FLIP to invert gravity between floor and ceiling!",
  parTime: 22,
  storyIntro: {
    worldName: "WORLD 1: NEON SECTOR",
    lines: [
      "Specimen awakens in the subterranean testing vault.",
      "Gravity containment field collapsed—polarity manipulation operational.",
      "Advance through 4 expansive sectors to reach the primary conduit.",
    ],
  },
  bounds: { width: 3600, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    // World boundary frames
    P('b-left', 0, 0, 40, 720),
    P('b-right', 3560, 0, 40, 720),
    P('b-ceil', 0, 0, 3600, 40),
    // Section 1: Intro flip run (0 to 1100)
    P('s1-floor', 40, 640, 1060, 40),
    P('s1-ceil-barrier', 420, 40, 50, 300),
    P('s1-island-1', 580, 380, 200, 35),
    P('s1-floor-barrier', 860, 380, 50, 260),
    // Section 2: Flip over abyss gaps (1100 to 2150)
    P('s2-floor-start', 1100, 640, 340, 40),
    P('s2-ceil-runway', 1340, 100, 420, 35),
    P('s2-mid-shelf', 1700, 420, 220, 35),
    P('s2-floor-end', 1880, 640, 320, 40),
    // Section 3: Alternating ceiling & floor shelves + Star route (2150 to 3000)
    P('s3-floor', 2200, 640, 360, 40),
    P('s3-ceil-1', 2420, 100, 280, 35),
    P('s3-mid-1', 2640, 360, 200, 35),
    P('s3-star-perch', 2700, 120, 160, 30), // Risky high shelf
    P('s3-floor-2', 2800, 640, 260, 40),
    // Section 4: Final run to conduit (3000 to 3600)
    P('s4-floor', 3060, 640, 500, 40),
    P('s4-ceil-drop', 3240, 40, 40, 320),
    P('s4-exit-shelf', 3380, 500, 180, 35),
  ],
  checkpoints: [
    CP('cp-1-1', 1120, 580, 'DOWN'),
    CP('cp-1-2', 2180, 580, 'DOWN'),
    CP('cp-1-3', 3020, 580, 'DOWN'),
  ],
  crystals: [
    C('c1-1', 680, 320),
    C('c1-2', 1540, 60),
    C('c1-3', 1800, 360),
    C('c1-4', 2520, 60),
    C('c1-5', 3200, 580),
  ],
  starCrystal: STAR('star-1', 2780, 75),
  portal: { x: 3470, y: 440, radius: 36, rotation: 0, active: true },
};

export const LEVEL_2: LevelData = {
  id: 2,
  world: 1,
  name: "Kinetic Propulsion",
  hint: "Bounce pads launch you across vast heights. Ice surfaces provide zero friction!",
  parTime: 24,
  bounds: { width: 3800, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 3760, 0, 40, 720),
    P('b-ceil', 0, 0, 3800, 40),
    // Section 1: Ice runway with speed boost (0 to 1100)
    P('s1-floor', 40, 640, 380, 40),
    P('s1-ice', 420, 640, 460, 40, { surfaceType: 'ice' }),
    P('s1-floor-end', 880, 640, 260, 40),
    // Section 2: High bounce pad launch (1100 to 2200)
    P('s2-floor', 1140, 640, 280, 40),
    P('s2-tall-wall', 1420, 180, 50, 460),
    P('s2-high-shelf', 1470, 180, 360, 35),
    P('s2-ceil-track', 1700, 100, 320, 35, { surfaceType: 'ice' }),
    P('s2-floor-landing', 2020, 640, 240, 40),
    // Section 3: Dual bounce pads & high star detour (2200 to 3100)
    P('s3-floor-start', 2260, 640, 220, 40),
    P('s3-ceil-island', 2540, 120, 260, 35),
    P('s3-star-shelf', 2600, 60, 140, 25, { surfaceType: 'ice' }), // Very high star ledge
    P('s3-mid-landing', 2820, 440, 200, 35),
    P('s3-floor-end', 3020, 640, 220, 40),
    // Section 4: Momentum sprint into conduit (3100 to 3800)
    P('s4-ice-floor', 3240, 640, 360, 40, { surfaceType: 'ice' }),
    P('s4-ceil-shelf', 3440, 180, 220, 35),
    P('s4-exit-floor', 3600, 640, 160, 40),
  ],
  boostStrips: [
    BOOST('b1', 480, 634, 180, 8, 'RIGHT', 720),
    BOOST('b2', 3300, 634, 160, 8, 'RIGHT', 760),
  ],
  bouncePads: [
    BPAD('bp1', 1320, 630, 70, 12, 'UP', 840),
    BPAD('bp2', 2420, 630, 70, 12, 'UP', 880),
    BPAD('bp3', 3140, 630, 70, 12, 'UP', 840),
  ],
  checkpoints: [
    CP('cp-2-1', 1180, 580, 'DOWN'),
    CP('cp-2-2', 2280, 580, 'DOWN'),
    CP('cp-2-3', 3060, 580, 'DOWN'),
  ],
  crystals: [
    C('c2-1', 720, 580),
    C('c2-2', 1580, 130),
    C('c2-3', 1900, 60),
    C('c2-4', 2700, 80),
    C('c2-5', 3480, 130),
  ],
  starCrystal: STAR('star-2', 2670, 25),
  portal: { x: 3680, y: 560, radius: 36, rotation: 0, active: true },
};

export const LEVEL_3: LevelData = {
  id: 3,
  world: 1,
  name: "Flip Rhythm",
  hint: "First hazard spikes ahead! Chain multiple flips in mid-air to clear wide spike fields.",
  parTime: 26,
  bounds: { width: 3800, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 3760, 0, 40, 720),
    P('b-ceil', 0, 0, 3800, 40),
    // Section 1: Intro spike bed (0 to 1100)
    P('s1-floor-1', 40, 640, 320, 40),
    P('s1-ceil-run', 360, 40, 500, 40),
    P('s1-floor-pit', 360, 680, 500, 40), // pit floor for spikes
    P('s1-floor-2', 860, 640, 280, 40),
    // Section 2: Flip chain across 3 floating slabs (1100 to 2250)
    P('s2-floor-start', 1140, 640, 200, 40),
    P('s2-pit', 1340, 680, 700, 40),
    P('s2-slab-1', 1400, 460, 160, 32),
    P('s2-slab-2', 1660, 260, 160, 32),
    P('s2-slab-3', 1920, 460, 160, 32),
    P('s2-floor-end', 2040, 640, 260, 40),
    // Section 3: Alternating upper/lower spike teeth + Star route (2250 to 3100)
    P('s3-floor-start', 2300, 640, 200, 40),
    P('s3-ceil-slab', 2500, 120, 260, 35),
    P('s3-floor-slab', 2740, 540, 220, 35),
    P('s3-star-pocket', 2780, 180, 140, 25), // guarded pocket
    P('s3-ceil-2', 2940, 120, 200, 35),
    P('s3-floor-end', 3040, 640, 200, 40),
    // Section 4: Rapid flip tunnel into portal (3100 to 3800)
    P('s4-floor', 3240, 640, 200, 40),
    P('s4-mid-island', 3420, 380, 180, 35),
    P('s4-exit-floor', 3580, 640, 180, 40),
  ],
  spikes: [
    // Section 1 floor spikes
    SPK('spk1-1', 420, 638, 380, 22, 'UP'),
    // Section 2 abyss spikes
    SPK('spk2-1', 1400, 658, 580, 22, 'UP'),
    // Section 3 teeth
    SPK('spk3-1', 2540, 155, 180, 20, 'DOWN'),
    SPK('spk3-2', 2760, 518, 180, 20, 'UP'),
    // Star pocket danger
    SPK('spk-star-l', 2760, 180, 18, 25, 'LEFT'),
  ],
  checkpoints: [
    CP('cp-3-1', 980, 580, 'DOWN'),
    CP('cp-3-2', 2140, 580, 'DOWN'),
    CP('cp-3-3', 3080, 580, 'DOWN'),
  ],
  crystals: [
    C('c3-1', 580, 100),
    C('c3-2', 1480, 410),
    C('c3-3', 1740, 210),
    C('c3-4', 2000, 410),
    C('c3-5', 2600, 75),
    C('c3-6', 3510, 330),
  ],
  starCrystal: STAR('star-3', 2850, 135),
  portal: { x: 3670, y: 560, radius: 36, rotation: 0, active: true },
};

export const LEVEL_4: LevelData = {
  id: 4,
  world: 1,
  name: "Crumbling Corridor",
  hint: "Crumbling platforms collapse 0.5s after touch! Step swiftly or flip away.",
  parTime: 28,
  bounds: { width: 4000, height: 750 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 750),
    P('b-right', 3960, 0, 40, 750),
    P('b-ceil', 0, 0, 4000, 40),
    // Section 1: Crumbling steps (0 to 1150)
    P('s1-floor', 40, 660, 340, 40),
    P('s1-cr-1', 440, 660, 160, 40, { isCrumbling: true }),
    P('s1-cr-2', 680, 660, 160, 40, { isCrumbling: true }),
    P('s1-floor-end', 920, 660, 260, 40),
    // Section 2: Flip onto ceiling crumble slabs (1150 to 2300)
    P('s2-floor-start', 1180, 660, 220, 40),
    P('s2-ceil-cr-1', 1440, 120, 180, 35, { isCrumbling: true }),
    P('s2-mid-cr', 1700, 420, 180, 35, { isCrumbling: true }),
    P('s2-ceil-cr-2', 1960, 120, 180, 35, { isCrumbling: true }),
    P('s2-floor-end', 2180, 660, 240, 40),
    // Section 3: Crumble bridge race & Star Crystal descent (2300 to 3250)
    P('s3-floor-start', 2420, 660, 220, 40),
    P('s3-race-1', 2680, 660, 140, 40, { isCrumbling: true }),
    P('s3-race-2', 2860, 660, 140, 40, { isCrumbling: true }),
    P('s3-race-3', 3040, 660, 140, 40, { isCrumbling: true }),
    P('s3-star-ledge', 2880, 320, 120, 25, { isCrumbling: true }), // Risky mid-air crumble
    P('s3-floor-end', 3200, 660, 240, 40),
    // Section 4: Final crumble sprint (3250 to 4000)
    P('s4-cr-run', 3440, 660, 220, 40, { isCrumbling: true }),
    P('s4-ceil-run', 3640, 160, 180, 35),
    P('s4-exit-floor', 3780, 660, 180, 40),
  ],
  spikes: [
    SPK('spk4-1', 440, 710, 460, 30, 'UP'),
    SPK('spk4-2', 1400, 710, 760, 30, 'UP'),
    SPK('spk4-3', 2660, 710, 520, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-4-1', 1000, 600, 'DOWN'),
    CP('cp-4-2', 2240, 600, 'DOWN'),
    CP('cp-4-3', 3260, 600, 'DOWN'),
  ],
  crystals: [
    C('c4-1', 520, 600),
    C('c4-2', 1530, 70),
    C('c4-3', 1790, 370),
    C('c4-4', 2050, 70),
    C('c4-5', 2930, 600),
    C('c4-6', 3730, 110),
  ],
  starCrystal: STAR('star-4', 2940, 270),
  portal: { x: 3870, y: 580, radius: 36, rotation: 0, active: true },
};

export const LEVEL_5: LevelData = {
  id: 5,
  world: 1,
  name: "Core Inversion (Sector Boss)",
  hint: "SECTOR BOSS: The core reactor pulse is active! Survive the multi-tier gauntlet and claim victory.",
  parTime: 35,
  isBoss: true,
  bossTitle: "CORE OVERSEER // ANOMALY ZERO",
  bossIntroText: "Containment rupture imminent. Core thermal spikes active across all 4 sectors. Cleanse the gauntlet.",
  bounds: { width: 4200, height: 800 },
  spawn: { x: 140, y: 640 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 800),
    P('b-right', 4160, 0, 40, 800),
    P('b-ceil', 0, 0, 4200, 40),
    // Section 1: Reactor entrance ascension (0 to 1200)
    P('s1-floor', 40, 720, 380, 40),
    P('s1-tier-1', 440, 540, 220, 35),
    P('s1-tier-2', 700, 360, 220, 35),
    P('s1-tier-3', 940, 180, 240, 35),
    // Section 2: Flip gauntlet across floating islands (1200 to 2400)
    P('s2-floor-base', 1200, 720, 220, 40),
    P('s2-island-1', 1440, 560, 160, 32),
    P('s2-island-2', 1680, 320, 160, 32, { isCrumbling: true }),
    P('s2-island-3', 1920, 560, 160, 32),
    P('s2-ceil-island', 2080, 160, 200, 32),
    P('s2-floor-end', 2280, 720, 260, 40),
    // Section 3: Boss reactor corridor & Star Crystal summit (2400 to 3400)
    P('s3-floor-start', 2520, 720, 240, 40),
    P('s3-reactor-pillar-1', 2800, 260, 60, 460),
    P('s3-reactor-pillar-2', 3060, 80, 60, 460),
    P('s3-star-spire', 2930, 160, 100, 25), // Boss star throne
    P('s3-floor-end', 3180, 720, 280, 40),
    // Section 4: Boss exit conduit (3400 to 4200)
    P('s4-floor', 3460, 720, 240, 40),
    P('s4-mid-bounce-shelf', 3740, 500, 180, 35),
    P('s4-exit-pedestal', 3980, 640, 180, 40),
  ],
  bouncePads: [
    BPAD('bp5-1', 1140, 710, 60, 12, 'UP', 860),
    BPAD('bp5-2', 3640, 710, 60, 12, 'UP', 860),
  ],
  spikes: [
    SPK('spk5-1', 420, 770, 760, 30, 'UP'),
    SPK('spk5-2', 1420, 770, 840, 30, 'UP'),
    SPK('spk5-3', 2760, 770, 400, 30, 'UP'),
    SPK('spk5-ceil-1', 2800, 235, 60, 22, 'UP'),
    SPK('spk5-ceil-2', 3060, 545, 60, 22, 'DOWN'),
  ],
  checkpoints: [
    CP('cp-5-1', 1240, 660, 'DOWN'),
    CP('cp-5-2', 2320, 660, 'DOWN'),
    CP('cp-5-3', 3220, 660, 'DOWN'),
  ],
  crystals: [
    C('c5-1', 550, 490),
    C('c5-2', 810, 310),
    C('c5-3', 1520, 510),
    C('c5-4', 2000, 510),
    C('c5-5', 2180, 110),
    C('c5-6', 3830, 450),
  ],
  starCrystal: STAR('star-5', 2980, 110),
  portal: { x: 4070, y: 560, radius: 40, rotation: 0, active: true },
};

// ============================================================================
// WORLD 2: DYNAMIC KINETICS & MOVING PLATFORMS (LEVELS 6–10)
// ============================================================================

export const LEVEL_6: LevelData = {
  id: 6,
  world: 2,
  name: "Breather: Shifted Vectors",
  hint: "Breather level! Moving platforms ride along fixed tracks. Jump on to ferry across chasms.",
  parTime: 25,
  bounds: { width: 3600, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 3560, 0, 40, 720),
    P('b-ceil', 0, 0, 3600, 40),
    // Section 1: Intro moving platform (0 to 1050)
    P('s1-floor', 40, 640, 360, 40),
    P('s1-moving', 440, 640, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 300, moveSpeed: 140, startX: 440, startY: 640 }),
    P('s1-floor-end', 920, 640, 240, 40),
    // Section 2: Vertical elevator platform (1050 to 2150)
    P('s2-floor-start', 1160, 640, 220, 40),
    P('s2-vertical-mv', 1420, 560, 180, 32, { isMoving: true, moveAxis: 'Y', moveRange: 320, moveSpeed: 120, startX: 1420, startY: 560 }),
    P('s2-ceil-shelf', 1660, 140, 240, 35),
    P('s2-floor-end', 1940, 640, 260, 40),
    // Section 3: Dual synchronized movers & Star Crystal ledge (2150 to 2950)
    P('s3-floor-start', 2200, 640, 200, 40),
    P('s3-mv-1', 2420, 640, 160, 32, { isMoving: true, moveAxis: 'X', moveRange: 220, moveSpeed: 160, startX: 2420, startY: 640 }),
    P('s3-mid-station', 2660, 460, 160, 35),
    P('s3-star-ledge', 2700, 160, 140, 25), // High star perch
    P('s3-mv-2', 2820, 320, 160, 32, { isMoving: true, moveAxis: 'Y', moveRange: 240, moveSpeed: 150, startX: 2820, startY: 320 }),
    P('s3-floor-end', 2980, 640, 200, 40),
    // Section 4: Final ferry into portal (2950 to 3600)
    P('s4-floor', 3180, 640, 180, 40),
    P('s4-exit-floor', 3420, 640, 140, 40),
  ],
  checkpoints: [
    CP('cp-6-1', 1000, 580, 'DOWN'),
    CP('cp-6-2', 2020, 580, 'DOWN'),
    CP('cp-6-3', 3020, 580, 'DOWN'),
  ],
  crystals: [
    C('c6-1', 600, 580),
    C('c6-2', 1510, 360),
    C('c6-3', 1780, 90),
    C('c6-4', 2530, 580),
    C('c6-5', 3300, 580),
  ],
  starCrystal: STAR('star-6', 2770, 110),
  portal: { x: 3490, y: 560, radius: 36, rotation: 0, active: true },
};

export const LEVEL_7: LevelData = {
  id: 7,
  world: 2,
  name: "Gravity Gate Array",
  hint: "Gravity Gates automatically invert your orientation as you pass through!",
  parTime: 28,
  bounds: { width: 4000, height: 750 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 750),
    P('b-right', 3960, 0, 40, 750),
    P('b-ceil', 0, 0, 4000, 40),
    // Section 1: Intro gravity gate inversion (0 to 1150)
    P('s1-floor', 40, 660, 420, 40),
    P('s1-ceil-runway', 500, 40, 440, 40),
    P('s1-floor-end', 960, 660, 240, 40),
    // Section 2: Gate inversion over spike abyss (1150 to 2300)
    P('s2-floor-start', 1200, 660, 220, 40),
    P('s2-ceil-track', 1440, 100, 480, 35),
    P('s2-floor-landing', 1940, 660, 260, 40),
    // Section 3: Dual gates & Star detour (2300 to 3250)
    P('s3-floor-start', 2260, 660, 220, 40),
    P('s3-mv-floor', 2500, 660, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 240, moveSpeed: 140, startX: 2500, startY: 660 }),
    P('s3-ceil-detour', 2740, 120, 280, 35),
    P('s3-star-nook', 2880, 60, 120, 25), // Inverted star nook
    P('s3-floor-end', 3080, 660, 240, 40),
    // Section 4: Final gate chain into portal (3250 to 4000)
    P('s4-ceil-run', 3320, 120, 320, 35),
    P('s4-exit-floor', 3740, 660, 220, 40),
  ],
  gravityGates: [
    GATE('gate7-1', 480, 520, 36, 140, 'UP'),
    GATE('gate7-2', 920, 120, 36, 140, 'DOWN'),
    GATE('gate7-3', 1420, 520, 36, 140, 'UP'),
    GATE('gate7-4', 1900, 120, 36, 140, 'DOWN'),
    GATE('gate7-5', 2700, 520, 36, 140, 'UP'),
    GATE('gate7-6', 3680, 120, 36, 140, 'DOWN'),
  ],
  spikes: [
    SPK('spk7-1', 1440, 710, 480, 30, 'UP'),
    SPK('spk7-2', 2500, 710, 540, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-7-1', 1040, 600, 'DOWN'),
    CP('cp-7-2', 2020, 600, 'DOWN'),
    CP('cp-7-3', 3140, 600, 'DOWN'),
  ],
  crystals: [
    C('c7-1', 720, 100),
    C('c7-2', 1680, 60),
    C('c7-3', 2590, 600),
    C('c7-4', 2820, 80),
    C('c7-5', 3480, 80),
  ],
  starCrystal: STAR('star-7', 2940, 25),
  portal: { x: 3860, y: 580, radius: 36, rotation: 0, active: true },
};

export const LEVEL_8: LevelData = {
  id: 8,
  world: 2,
  name: "Momentum Springs",
  hint: "High bounce pads meet moving targets! Time your launch to land cleanly on moving slabs.",
  parTime: 30,
  bounds: { width: 4200, height: 800 },
  spawn: { x: 140, y: 640 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 800),
    P('b-right', 4160, 0, 40, 800),
    P('b-ceil', 0, 0, 4200, 40),
    // Section 1: Bounce pad onto moving platform (0 to 1200)
    P('s1-floor', 40, 720, 340, 40),
    P('s1-mv-platform', 460, 480, 180, 32, { isMoving: true, moveAxis: 'X', moveRange: 280, moveSpeed: 150, startX: 460, startY: 480 }),
    P('s1-floor-end', 880, 720, 280, 40),
    // Section 2: Dual bounce pads alternating between moving ceiling slabs (1200 to 2400)
    P('s2-floor-start', 1200, 720, 220, 40),
    P('s2-mv-ceil', 1480, 180, 180, 32, { isMoving: true, moveAxis: 'Y', moveRange: 240, moveSpeed: 130, startX: 1480, startY: 180 }),
    P('s2-mid-pad-floor', 1760, 720, 200, 40),
    P('s2-floor-end', 2140, 720, 240, 40),
    // Section 3: High speed bounce sequence & Star Crystal apex (2400 to 3400)
    P('s3-floor-start', 2440, 720, 200, 40),
    P('s3-star-apex', 2700, 100, 140, 25), // Apex ledge above double springs
    P('s3-mid-shelf', 2900, 520, 200, 35),
    P('s3-floor-end', 3180, 720, 240, 40),
    // Section 4: Abyss jump into conduit (3400 to 4200)
    P('s4-floor', 3460, 720, 200, 40),
    P('s4-ceil-run', 3740, 140, 240, 35),
    P('s4-exit-floor', 3980, 720, 180, 40),
  ],
  bouncePads: [
    BPAD('bp8-1', 340, 710, 60, 12, 'UP', 860),
    BPAD('bp8-2', 1380, 710, 60, 12, 'UP', 880),
    BPAD('bp8-3', 1840, 710, 60, 12, 'UP', 880),
    BPAD('bp8-4', 2600, 710, 60, 12, 'UP', 920), // Launches to Star apex
  ],
  spikes: [
    SPK('spk8-1', 420, 770, 440, 30, 'UP'),
    SPK('spk8-2', 1440, 770, 680, 30, 'UP'),
    SPK('spk8-3', 2680, 770, 480, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-8-1', 940, 660, 'DOWN'),
    CP('cp-8-2', 2220, 660, 'DOWN'),
    CP('cp-8-3', 3240, 660, 'DOWN'),
  ],
  crystals: [
    C('c8-1', 550, 420),
    C('c8-2', 1570, 120),
    C('c8-3', 1860, 380),
    C('c8-4', 2980, 460),
    C('c8-5', 3860, 90),
  ],
  starCrystal: STAR('star-8', 2770, 60),
  portal: { x: 4070, y: 640, radius: 36, rotation: 0, active: true },
};

export const LEVEL_9: LevelData = {
  id: 9,
  world: 2,
  name: "Fragile Mechanics",
  hint: "Moving platforms, crumbling floors, and gravity gates intertwine. Maintain steady composure.",
  parTime: 32,
  bounds: { width: 4400, height: 800 },
  spawn: { x: 140, y: 640 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 800),
    P('b-right', 4360, 0, 40, 800),
    P('b-ceil', 0, 0, 4400, 40),
    // Section 1: Moving crumbling platforms (0 to 1200)
    P('s1-floor', 40, 720, 340, 40),
    P('s1-cr-mv', 460, 720, 180, 40, { isCrumbling: true, isMoving: true, moveAxis: 'X', moveRange: 260, moveSpeed: 140, startX: 460, startY: 720 }),
    P('s1-floor-end', 880, 720, 280, 40),
    // Section 2: Gate into crumbling ceiling run (1200 to 2400)
    P('s2-floor-start', 1200, 720, 220, 40),
    P('s2-ceil-cr-1', 1480, 100, 160, 35, { isCrumbling: true }),
    P('s2-ceil-cr-2', 1700, 100, 160, 35, { isCrumbling: true }),
    P('s2-ceil-cr-3', 1920, 100, 160, 35, { isCrumbling: true }),
    P('s2-floor-end', 2160, 720, 240, 40),
    // Section 3: Alternating moving crumbling ledges & Star Crystal (2400 to 3400)
    P('s3-floor-start', 2440, 720, 200, 40),
    P('s3-cr-1', 2680, 560, 140, 32, { isCrumbling: true }),
    P('s3-cr-2', 2880, 360, 140, 32, { isCrumbling: true }),
    P('s3-star-ledge', 2890, 160, 120, 25, { isCrumbling: true }), // Highly precarious crumble star
    P('s3-cr-3', 3080, 560, 140, 32, { isCrumbling: true }),
    P('s3-floor-end', 3260, 720, 240, 40),
    // Section 4: Final gate sprint into conduit (3400 to 4400)
    P('s4-floor', 3540, 720, 240, 40),
    P('s4-ceil-run', 3840, 120, 260, 35),
    P('s4-exit-floor', 4160, 720, 200, 40),
  ],
  gravityGates: [
    GATE('gate9-1', 1420, 520, 36, 160, 'UP'),
    GATE('gate9-2', 2100, 120, 36, 160, 'DOWN'),
    GATE('gate9-3', 3760, 520, 36, 160, 'UP'),
  ],
  spikes: [
    SPK('spk9-1', 440, 770, 440, 30, 'UP'),
    SPK('spk9-2', 1440, 770, 700, 30, 'UP'),
    SPK('spk9-3', 2640, 770, 600, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-9-1', 940, 660, 'DOWN'),
    CP('cp-9-2', 2220, 660, 'DOWN'),
    CP('cp-9-3', 3320, 660, 'DOWN'),
  ],
  crystals: [
    C('c9-1', 550, 660),
    C('c9-2', 1560, 60),
    C('c9-3', 1780, 60),
    C('c9-4', 2750, 500),
    C('c9-5', 3150, 500),
    C('c9-6', 3960, 70),
  ],
  starCrystal: STAR('star-9', 2950, 110),
  portal: { x: 4260, y: 640, radius: 36, rotation: 0, active: true },
};

export const LEVEL_10: LevelData = {
  id: 10,
  world: 2,
  name: "The Industrial Heart (Grand Boss II)",
  hint: "SECTOR BOSS: The Industrial Heart of the complex! Longest and most demanding gauntlet of the first half.",
  parTime: 42,
  isBoss: true,
  bossTitle: "INDUSTRIAL FOUNDRY // CORE SMELTER",
  bossIntroText: "Heavy molten pistons and oscillating platforms fully active. Conquer all 4 sectors to pierce World 3.",
  bounds: { width: 4600, height: 850 },
  spawn: { x: 140, y: 680 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 850),
    P('b-right', 4560, 0, 40, 850),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Fast moving platforms over spike sea (0 to 1300)
    P('s1-floor', 40, 760, 340, 40),
    P('s1-mv-1', 440, 760, 160, 35, { isMoving: true, moveAxis: 'X', moveRange: 240, moveSpeed: 170, startX: 440, startY: 760 }),
    P('s1-mid-island', 740, 540, 180, 35),
    P('s1-mv-2', 960, 540, 160, 35, { isMoving: true, moveAxis: 'X', moveRange: 220, moveSpeed: 180, startX: 960, startY: 540 }),
    P('s1-floor-end', 1180, 760, 240, 40),
    // Section 2: Gravity gates & vertical elevator climb (1300 to 2600)
    P('s2-floor-start', 1440, 760, 220, 40),
    P('s2-vert-mv', 1700, 560, 180, 32, { isMoving: true, moveAxis: 'Y', moveRange: 360, moveSpeed: 140, startX: 1700, startY: 560 }),
    P('s2-ceil-run', 1940, 100, 320, 35),
    P('s2-cr-drop', 2300, 380, 160, 32, { isCrumbling: true }),
    P('s2-floor-end', 2480, 760, 240, 40),
    // Section 3: The Foundry Gauntlet & Star Crystal (2600 to 3700)
    P('s3-floor-start', 2740, 760, 200, 40),
    P('s3-pillar-1', 3000, 320, 60, 480),
    P('s3-pillar-2', 3280, 80, 60, 480),
    P('s3-star-perch', 3140, 180, 100, 25), // Perch between pillars
    P('s3-mv-slab', 3380, 620, 160, 32, { isMoving: true, moveAxis: 'X', moveRange: 240, moveSpeed: 160, startX: 3380, startY: 620 }),
    P('s3-floor-end', 3640, 760, 240, 40),
    // Section 4: Boss conduit escape (3700 to 4600)
    P('s4-floor', 3920, 760, 220, 40),
    P('s4-ceil-finish', 4180, 140, 260, 35),
    P('s4-exit-floor', 4400, 760, 160, 40),
  ],
  bouncePads: [
    BPAD('bp10-1', 1360, 750, 60, 12, 'UP', 880),
    BPAD('bp10-2', 3860, 750, 60, 12, 'UP', 880),
  ],
  gravityGates: [
    GATE('gate10-1', 1900, 520, 36, 160, 'UP'),
    GATE('gate10-2', 2420, 120, 36, 160, 'DOWN'),
  ],
  spikes: [
    SPK('spk10-1', 400, 810, 760, 30, 'UP'),
    SPK('spk10-2', 1660, 810, 800, 30, 'UP'),
    SPK('spk10-3', 2960, 810, 660, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-10-1', 1240, 700, 'DOWN'),
    CP('cp-10-2', 2540, 700, 'DOWN'),
    CP('cp-10-3', 3700, 700, 'DOWN'),
  ],
  crystals: [
    C('c10-1', 520, 700),
    C('c10-2', 830, 480),
    C('c10-3', 1790, 420),
    C('c10-4', 2100, 60),
    C('c10-5', 3460, 560),
    C('c10-6', 4300, 80),
  ],
  starCrystal: STAR('star-10', 3190, 130),
  portal: { x: 4470, y: 680, radius: 42, rotation: 0, active: true },
};

// ============================================================================
// WORLD 3: HIGH-TECH ARSENAL & ROTATING HAZARDS (LEVELS 11–15)
// ============================================================================

export const LEVEL_11: LevelData = {
  id: 11,
  world: 3,
  name: "Breather: Laser Grid",
  hint: "Breather level after the boss! Timed lasers flicker with warning before firing. Learn their rhythm.",
  parTime: 28,
  bounds: { width: 3800, height: 750 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 750),
    P('b-right', 3760, 0, 40, 750),
    P('b-ceil', 0, 0, 3800, 40),
    // Section 1: Intro timed laser (0 to 1100)
    P('s1-floor', 40, 660, 380, 40),
    P('s1-mid-safe', 520, 660, 180, 40),
    P('s1-floor-end', 860, 660, 260, 40),
    // Section 2: Alternating floor & ceiling lasers (1100 to 2200)
    P('s2-floor-start', 1160, 660, 220, 40),
    P('s2-ceil-track', 1420, 120, 460, 35),
    P('s2-floor-end', 1940, 660, 260, 40),
    // Section 3: Laser corridor & Star Crystal under fast laser (2200 to 3100)
    P('s3-floor-start', 2240, 660, 200, 40),
    P('s3-alcove', 2520, 460, 160, 35),
    P('s3-star-ledge', 2760, 200, 140, 25), // Guarded high star ledge
    P('s3-ceil-run', 2680, 100, 260, 35),
    P('s3-floor-end', 2960, 660, 220, 40),
    // Section 4: Safe sprint into conduit (3100 to 3800)
    P('s4-floor', 3220, 660, 200, 40),
    P('s4-exit-floor', 3540, 660, 220, 40),
  ],
  lasers: [
    LSR('lsr11-1', 460, 40, 460, 660, { on: 2.2, off: 2.0 }),
    LSR('lsr11-2', 780, 40, 780, 660, { on: 2.2, off: 2.0 }),
    LSR('lsr11-3', 1380, 40, 1380, 660, { on: 2.0, off: 1.8 }),
    LSR('lsr11-4', 1860, 40, 1860, 660, { on: 2.0, off: 1.8 }),
    LSR('lsr11-5', 2460, 40, 2460, 660, { on: 1.8, off: 1.8 }),
    LSR('lsr11-star', 2700, 40, 2700, 660, { on: 1.5, off: 1.5 }), // Fast star guard
    LSR('lsr11-6', 3460, 40, 3460, 660, { on: 2.2, off: 2.0 }),
  ],
  checkpoints: [
    CP('cp-11-1', 940, 600, 'DOWN'),
    CP('cp-11-2', 2020, 600, 'DOWN'),
    CP('cp-11-3', 3020, 600, 'DOWN'),
  ],
  crystals: [
    C('c11-1', 610, 600),
    C('c11-2', 1580, 70),
    C('c11-3', 1720, 70),
    C('c11-4', 2600, 400),
    C('c11-5', 3380, 600),
  ],
  starCrystal: STAR('star-11', 2830, 150),
  portal: { x: 3660, y: 580, radius: 36, rotation: 0, active: true },
};

export const LEVEL_12: LevelData = {
  id: 12,
  world: 3,
  name: "Buzzsaw Vault",
  hint: "Rotating sawblades patrol back and forth! Memorize their paths and slip through safe windows.",
  parTime: 32,
  bounds: { width: 4200, height: 800 },
  spawn: { x: 140, y: 640 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 800),
    P('b-right', 4160, 0, 40, 800),
    P('b-ceil', 0, 0, 4200, 40),
    // Section 1: Intro moving sawblade (0 to 1200)
    P('s1-floor', 40, 720, 360, 40),
    P('s1-mid-safe', 560, 720, 180, 40),
    P('s1-floor-end', 920, 720, 260, 40),
    // Section 2: Vertical sawblade patrol & ceiling shelf (1200 to 2400)
    P('s2-floor-start', 1200, 720, 220, 40),
    P('s2-ceil-track', 1460, 120, 460, 35),
    P('s2-floor-end', 2040, 720, 260, 40),
    // Section 3: Dual sawblade circle & Star Crystal vault (2400 to 3400)
    P('s3-floor-start', 2340, 720, 200, 40),
    P('s3-vault-floor', 2620, 560, 240, 35),
    P('s3-star-pedestal', 2740, 220, 120, 25), // Guarded pedestal
    P('s3-ceil-2', 2940, 120, 240, 35),
    P('s3-floor-end', 3180, 720, 240, 40),
    // Section 4: Final saw dodge into conduit (3400 to 4200)
    P('s4-floor', 3460, 720, 220, 40),
    P('s4-ceil-run', 3740, 140, 240, 35),
    P('s4-exit-floor', 3980, 720, 180, 40),
  ],
  sawBlades: [
    SAW('saw12-1', 480, 680, 36, { sx: 480, sy: 680, ex: 820, ey: 680 }),
    SAW('saw12-2', 1560, 420, 42, { sx: 1560, sy: 200, ex: 1560, ey: 640 }),
    SAW('saw12-3', 1820, 420, 42, { sx: 1820, sy: 640, ex: 1820, ey: 200 }),
    SAW('saw12-star', 2740, 160, 34, { sx: 2660, sy: 160, ex: 2880, ey: 160 }), // Star guard saw
    SAW('saw12-4', 3620, 680, 38, { sx: 3560, sy: 680, ex: 3880, ey: 680 }),
  ],
  checkpoints: [
    CP('cp-12-1', 1000, 660, 'DOWN'),
    CP('cp-12-2', 2120, 660, 'DOWN'),
    CP('cp-12-3', 3240, 660, 'DOWN'),
  ],
  crystals: [
    C('c12-1', 650, 660),
    C('c12-2', 1600, 70),
    C('c12-3', 1740, 70),
    C('c12-4', 2740, 500),
    C('c12-5', 3860, 90),
  ],
  starCrystal: STAR('star-12', 2800, 170),
  portal: { x: 4070, y: 640, radius: 36, rotation: 0, active: true },
};

export const LEVEL_13: LevelData = {
  id: 13,
  world: 3,
  name: "Precision Overcharge",
  hint: "Lasers, spikes, and moving platforms collide! Time your moves during laser off-cycles.",
  parTime: 34,
  bounds: { width: 4400, height: 800 },
  spawn: { x: 140, y: 640 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 800),
    P('b-right', 4360, 0, 40, 800),
    P('b-ceil', 0, 0, 4400, 40),
    // Section 1: Moving platform passing through laser beams (0 to 1250)
    P('s1-floor', 40, 720, 340, 40),
    P('s1-mv', 460, 720, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 280, moveSpeed: 140, startX: 460, startY: 720 }),
    P('s1-floor-end', 920, 720, 260, 40),
    // Section 2: Flip over spike beds while timing laser pulses (1250 to 2550)
    P('s2-floor-start', 1240, 720, 220, 40),
    P('s2-ceil-track', 1520, 120, 440, 35),
    P('s2-floor-end', 2080, 720, 240, 40),
    // Section 3: Laser grid with crumbling slabs & Star Crystal puzzle (2550 to 3600)
    P('s3-floor-start', 2380, 720, 200, 40),
    P('s3-cr-1', 2640, 560, 160, 32, { isCrumbling: true }),
    P('s3-star-ledge', 2820, 240, 140, 25), // High star ledge inside laser grid
    P('s3-cr-2', 3020, 560, 160, 32, { isCrumbling: true }),
    P('s3-floor-end', 3280, 720, 240, 40),
    // Section 4: Exit sprint (3600 to 4400)
    P('s4-floor', 3560, 720, 220, 40),
    P('s4-ceil-run', 3840, 120, 260, 35),
    P('s4-exit-floor', 4160, 720, 200, 40),
  ],
  lasers: [
    LSR('lsr13-1', 600, 40, 600, 720, { on: 2.2, off: 2.0 }),
    LSR('lsr13-2', 1680, 40, 1680, 720, { on: 2.0, off: 1.8 }),
    LSR('lsr13-star-1', 2760, 40, 2760, 720, { on: 1.8, off: 1.8 }),
    LSR('lsr13-star-2', 2960, 40, 2960, 720, { on: 1.8, off: 1.8 }),
    LSR('lsr13-3', 3740, 40, 3740, 720, { on: 2.2, off: 2.0 }),
  ],
  spikes: [
    SPK('spk13-1', 440, 770, 440, 30, 'UP'),
    SPK('spk13-2', 1500, 770, 540, 30, 'UP'),
    SPK('spk13-3', 2640, 770, 600, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-13-1', 980, 660, 'DOWN'),
    CP('cp-13-2', 2140, 660, 'DOWN'),
    CP('cp-13-3', 3340, 660, 'DOWN'),
  ],
  crystals: [
    C('c13-1', 550, 660),
    C('c13-2', 1640, 70),
    C('c13-3', 1840, 70),
    C('c13-4', 2720, 500),
    C('c13-5', 3100, 500),
    C('c13-6', 3970, 70),
  ],
  starCrystal: STAR('star-13', 2890, 190),
  portal: { x: 4260, y: 640, radius: 36, rotation: 0, active: true },
};

export const LEVEL_14: LevelData = {
  id: 14,
  world: 3,
  name: "Sawblade Symphony",
  hint: "Multiple sawblades orbit across crumbling routes. Keep momentum and never hesitate.",
  parTime: 36,
  bounds: { width: 4600, height: 850 },
  spawn: { x: 140, y: 680 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 850),
    P('b-right', 4560, 0, 40, 850),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Dual moving saws over spike floor (0 to 1300)
    P('s1-floor', 40, 760, 360, 40),
    P('s1-mid-safe', 580, 760, 180, 40),
    P('s1-floor-end', 960, 760, 240, 40),
    // Section 2: Gravity gate through saw teeth corridor (1300 to 2650)
    P('s2-floor-start', 1240, 760, 220, 40),
    P('s2-ceil-track', 1520, 120, 460, 35),
    P('s2-floor-end', 2140, 760, 260, 40),
    // Section 3: Moving platform ferry under overhead saws & Star Crystal (2650 to 3700)
    P('s3-floor-start', 2460, 760, 200, 40),
    P('s3-mv-ferry', 2720, 760, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 280, moveSpeed: 160, startX: 2720, startY: 760 }),
    P('s3-star-apex', 2880, 160, 120, 25), // High apex above saw sweep
    P('s3-mid-station', 3120, 520, 180, 35),
    P('s3-floor-end', 3380, 760, 240, 40),
    // Section 4: Final saw storm into conduit (3700 to 4600)
    P('s4-floor', 3680, 760, 240, 40),
    P('s4-ceil-run', 3980, 140, 260, 35),
    P('s4-exit-floor', 4360, 760, 200, 40),
  ],
  sawBlades: [
    SAW('saw14-1', 500, 720, 38, { sx: 480, sy: 720, ex: 820, ey: 720 }),
    SAW('saw14-2', 1700, 400, 42, { sx: 1700, sy: 160, ex: 1700, ey: 680 }),
    SAW('saw14-3', 2860, 460, 42, { sx: 2740, sy: 460, ex: 3040, ey: 460 }),
    SAW('saw14-4', 3860, 720, 40, { sx: 3800, sy: 720, ex: 4120, ey: 720 }),
  ],
  gravityGates: [
    GATE('gate14-1', 1460, 560, 36, 160, 'UP'),
    GATE('gate14-2', 2060, 140, 36, 160, 'DOWN'),
  ],
  spikes: [
    SPK('spk14-1', 420, 810, 500, 30, 'UP'),
    SPK('spk14-2', 1500, 810, 600, 30, 'UP'),
    SPK('spk14-3', 2700, 810, 640, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-14-1', 1040, 700, 'DOWN'),
    CP('cp-14-2', 2220, 700, 'DOWN'),
    CP('cp-14-3', 3460, 700, 'DOWN'),
  ],
  crystals: [
    C('c14-1', 670, 700),
    C('c14-2', 1680, 70),
    C('c14-3', 1840, 70),
    C('c14-4', 2810, 700),
    C('c14-5', 3210, 460),
    C('c14-6', 4110, 90),
  ],
  starCrystal: STAR('star-14', 2940, 110),
  portal: { x: 4460, y: 680, radius: 36, rotation: 0, active: true },
};

export const LEVEL_15: LevelData = {
  id: 15,
  world: 3,
  name: "Multi-Vector Inversion",
  hint: "Wall gravity & Teleporters introduced! Walk up vertical walls and warp across hazard gaps.",
  parTime: 38,
  bounds: { width: 4600, height: 850 },
  spawn: { x: 140, y: 680 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 850),
    P('b-right', 4560, 0, 40, 850),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Wall-gravity climb (0 to 1300)
    P('s1-floor', 40, 760, 360, 40),
    P('s1-wall-run', 640, 160, 40, 560), // Vertical climb surface
    P('s1-high-shelf', 680, 160, 320, 35),
    P('s1-floor-end', 1040, 760, 240, 40),
    // Section 2: Teleporter warping across hazard abyss (1300 to 2600)
    P('s2-floor-start', 1320, 760, 220, 40),
    P('s2-island-mid', 1840, 480, 200, 35),
    P('s2-floor-end', 2140, 760, 260, 40),
    // Section 3: 4-Way gravity puzzle with fake route & Star Crystal (2600 to 3700)
    P('s3-floor-start', 2460, 760, 200, 40),
    P('s3-fake-tunnel', 2720, 520, 220, 35), // Fake route leads to dead-end spikes
    P('s3-real-wall', 3000, 160, 40, 560),   // Real route up wall
    P('s3-star-chamber', 3060, 160, 220, 35), // Safe star route
    P('s3-floor-end', 3380, 760, 240, 40),
    // Section 4: Final teleport sprint into conduit (3700 to 4600)
    P('s4-floor', 3680, 760, 220, 40),
    P('s4-tele-target', 4160, 480, 180, 35),
    P('s4-exit-floor', 4360, 760, 200, 40),
  ],
  gravityGates: [
    GATE('gate15-1', 580, 620, 36, 120, 'LEFT'), // Wall gravity
    GATE('gate15-2', 960, 220, 36, 120, 'DOWN'),
    GATE('gate15-3', 2940, 620, 36, 120, 'LEFT'), // Wall climb for star
    GATE('gate15-4', 3300, 220, 36, 120, 'DOWN'),
  ],
  teleporters: [
    TELE('tp15-1a', 'pair-1', 1480, 696, '#A855F7'),
    TELE('tp15-1b', 'pair-1', 1900, 416, '#A855F7'),
    TELE('tp15-2a', 'pair-2', 3820, 696, '#06B6D4'),
    TELE('tp15-2b', 'pair-2', 4220, 416, '#06B6D4'),
  ],
  spikes: [
    SPK('spk15-1', 1560, 810, 540, 30, 'UP'),
    SPK('spk15-fake', 2720, 490, 200, 25, 'UP'), // Trap inside fake route
    SPK('spk15-2', 3440, 810, 640, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-15-1', 1100, 700, 'DOWN'),
    CP('cp-15-2', 2220, 700, 'DOWN'),
    CP('cp-15-3', 3440, 700, 'DOWN'),
  ],
  crystals: [
    C('c15-1', 600, 380),
    C('c15-2', 820, 110),
    C('c15-3', 1940, 430),
    C('c15-4', 3120, 110),
    C('c15-5', 4250, 430),
  ],
  starCrystal: STAR('star-15', 3220, 110),
  portal: { x: 4460, y: 680, radius: 36, rotation: 0, active: true },
};

// ============================================================================
// WORLD 4: SECURITY MATRIX & MASTER CITADEL (LEVELS 16–20)
// ============================================================================

export const LEVEL_16: LevelData = {
  id: 16,
  world: 4,
  name: "Breather: Circuit Lock",
  hint: "Breather level! Step onto pressure switches to retract security blast doors.",
  parTime: 30,
  bounds: { width: 4000, height: 800 },
  spawn: { x: 140, y: 640 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 800),
    P('b-right', 3960, 0, 40, 800),
    P('b-ceil', 0, 0, 4000, 40),
    // Section 1: Intro switch and door (0 to 1200)
    P('s1-floor', 40, 720, 440, 40),
    P('s1-floor-end', 780, 720, 320, 40),
    // Section 2: Ceiling switch & floor door (1200 to 2400)
    P('s2-floor-start', 1180, 720, 220, 40),
    P('s2-ceil-switch-shelf', 1440, 120, 260, 35),
    P('s2-floor-end', 1940, 720, 260, 40),
    // Section 3: Dual switch puzzle with Star Crystal vault (2400 to 3300)
    P('s3-floor-start', 2280, 720, 200, 40),
    P('s3-mid-shelf', 2560, 480, 220, 35),
    P('s3-star-vault', 2840, 180, 160, 30), // Star behind secret door
    P('s3-floor-end', 3080, 720, 240, 40),
    // Section 4: Final door into conduit (3300 to 4000)
    P('s4-floor', 3380, 720, 220, 40),
    P('s4-exit-floor', 3760, 720, 200, 40),
  ],
  doors: [
    DR('door16-1', 620, 520, 28, 200, '#38BDF8'),
    DR('door16-2', 1780, 520, 28, 200, '#F59E0B'),
    DR('door16-star', 2820, 80, 24, 100, '#EC4899'), // Star vault door
    DR('door16-3', 3620, 520, 28, 200, '#10B981'),
  ],
  switches: [
    SW('sw16-1', 400, 702, 'door16-1', '#38BDF8'),
    SW('sw16-2', 1560, 120, 'door16-2', '#F59E0B'),
    SW('sw16-star', 2660, 462, 'door16-star', '#EC4899'),
    SW('sw16-3', 3480, 702, 'door16-3', '#10B981'),
  ],
  checkpoints: [
    CP('cp-16-1', 940, 660, 'DOWN'),
    CP('cp-16-2', 2040, 660, 'DOWN'),
    CP('cp-16-3', 3180, 660, 'DOWN'),
  ],
  crystals: [
    C('c16-1', 500, 660),
    C('c16-2', 1560, 70),
    C('c16-3', 1860, 660),
    C('c16-4', 2660, 420),
    C('c16-5', 3540, 660),
  ],
  starCrystal: STAR('star-16', 2920, 130),
  portal: { x: 3860, y: 640, radius: 36, rotation: 0, active: true },
};

export const LEVEL_17: LevelData = {
  id: 17,
  world: 4,
  name: "Quantum Relay",
  hint: "Teleporters, switches, lasers, and multi-gravity combine. Watch out for decoy teleporters!",
  parTime: 38,
  bounds: { width: 4600, height: 850 },
  spawn: { x: 140, y: 680 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 850),
    P('b-right', 4560, 0, 40, 850),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Teleport through laser barrier to switch (0 to 1300)
    P('s1-floor', 40, 760, 360, 40),
    P('s1-laser-room', 580, 760, 240, 40),
    P('s1-floor-end', 980, 760, 240, 40),
    // Section 2: Wall-gravity switch triggering abyss door (1300 to 2650)
    P('s2-floor-start', 1280, 760, 220, 40),
    P('s2-wall-switch', 1600, 180, 40, 540), // Wall surface
    P('s2-floor-end', 2140, 760, 260, 40),
    // Section 3: Teleporter chain with fake decoy trap & Star Crystal (2650 to 3750)
    P('s3-floor-start', 2480, 760, 200, 40),
    P('s3-island-mid', 2820, 520, 200, 35),
    P('s3-trap-pit', 3060, 760, 160, 40), // Fake teleport destination
    P('s3-star-perch', 3280, 200, 140, 25), // Real teleport destination
    P('s3-floor-end', 3480, 760, 240, 40),
    // Section 4: Exit sprint (3750 to 4600)
    P('s4-floor', 3780, 760, 220, 40),
    P('s4-ceil-run', 4080, 140, 260, 35),
    P('s4-exit-floor', 4360, 760, 200, 40),
  ],
  doors: [
    DR('door17-1', 840, 560, 28, 200, '#38BDF8'),
    DR('door17-2', 1980, 560, 28, 200, '#F59E0B'),
  ],
  switches: [
    SW('sw17-1', 700, 742, 'door17-1', '#38BDF8'),
    SW('sw17-2', 1600, 380, 'door17-2', '#F59E0B', 18, 36), // Wall-mounted switch
  ],
  teleporters: [
    TELE('tp17-1a', 'pair-17a', 440, 696, '#A855F7'),
    TELE('tp17-1b', 'pair-17a', 620, 696, '#A855F7'),
    TELE('tp17-fake', 'pair-17fake', 2560, 696, '#EF4444'), // Decoy trap
    TELE('tp17-trap-tgt', 'pair-17fake', 3120, 696, '#EF4444'),
    TELE('tp17-real', 'pair-17real', 2920, 456, '#10B981'), // Real secret to Star
    TELE('tp17-star-tgt', 'pair-17real', 3320, 136, '#10B981'),
  ],
  gravityGates: [
    GATE('gate17-1', 1520, 620, 36, 120, 'LEFT'),
    GATE('gate17-2', 1880, 220, 36, 120, 'DOWN'),
  ],
  lasers: [
    LSR('lsr17-1', 520, 40, 520, 760, { on: 2.2, off: 2.0 }),
    LSR('lsr17-2', 3960, 40, 3960, 760, { on: 2.0, off: 1.8 }),
  ],
  spikes: [
    SPK('spk17-1', 1680, 810, 380, 30, 'UP'),
    SPK('spk17-trap', 3080, 735, 120, 25, 'UP'), // Decoy landing spikes
  ],
  checkpoints: [
    CP('cp-17-1', 1060, 700, 'DOWN'),
    CP('cp-17-2', 2220, 700, 'DOWN'),
    CP('cp-17-3', 3560, 700, 'DOWN'),
  ],
  crystals: [
    C('c17-1', 660, 700),
    C('c17-2', 1600, 280),
    C('c17-3', 2900, 460),
    C('c17-4', 3350, 150),
    C('c17-5', 4210, 90),
  ],
  starCrystal: STAR('star-17', 3380, 150),
  portal: { x: 4460, y: 680, radius: 36, rotation: 0, active: true },
};

export const LEVEL_18: LevelData = {
  id: 18,
  world: 4,
  name: "Labyrinthian Traps",
  hint: "Multiple paths exist, but some crumble into spikes! Find the real route by following energy circuits.",
  parTime: 42,
  bounds: { width: 4800, height: 900 },
  spawn: { x: 140, y: 720 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 900),
    P('b-right', 4760, 0, 40, 900),
    P('b-ceil', 0, 0, 4800, 40),
    // Section 1: Moving platforms through laser gate with switch (0 to 1350)
    P('s1-floor', 40, 800, 360, 40),
    P('s1-mv', 480, 800, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 280, moveSpeed: 150, startX: 480, startY: 800 }),
    P('s1-floor-end', 1020, 800, 240, 40),
    // Section 2: Wall-climb gravity zone with sawblades (1350 to 2750)
    P('s2-floor-start', 1320, 800, 220, 40),
    P('s2-wall-run', 1640, 180, 40, 600),
    P('s2-ceil-track', 1700, 120, 420, 35),
    P('s2-floor-end', 2280, 800, 260, 40),
    // Section 3: Trap corridor with fake exit that collapses & Star Crystal (2750 to 3900)
    P('s3-floor-start', 2600, 800, 200, 40),
    P('s3-fake-bridge', 2880, 800, 240, 40, { isCrumbling: true }), // Collapses into spike pit!
    P('s3-real-high-path', 2860, 380, 260, 35),                    // High real path
    P('s3-star-chamber', 3200, 200, 160, 25),                     // Secret star vault
    P('s3-floor-end', 3560, 800, 240, 40),
    // Section 4: Final gauntlet into conduit (3900 to 4800)
    P('s4-floor', 3900, 800, 220, 40),
    P('s4-ceil-run', 4220, 140, 260, 35),
    P('s4-exit-floor', 4560, 800, 200, 40),
  ],
  doors: [
    DR('door18-1', 920, 600, 28, 200, '#38BDF8'),
    DR('door18-2', 3460, 600, 28, 200, '#F59E0B'),
  ],
  switches: [
    SW('sw18-1', 780, 782, 'door18-1', '#38BDF8'),
    SW('sw18-2', 3020, 362, 'door18-2', '#F59E0B'), // Switch on real high path
  ],
  gravityGates: [
    GATE('gate18-1', 1560, 660, 36, 140, 'LEFT'),
    GATE('gate18-2', 2040, 220, 36, 140, 'DOWN'),
  ],
  sawBlades: [
    SAW('saw18-1', 1840, 420, 42, { sx: 1840, sy: 200, ex: 1840, ey: 680 }),
    SAW('saw18-2', 4040, 760, 40, { sx: 3960, sy: 760, ex: 4280, ey: 760 }),
  ],
  lasers: [
    LSR('lsr18-1', 620, 40, 620, 800, { on: 2.2, off: 2.0 }),
    LSR('lsr18-2', 4420, 40, 4420, 800, { on: 2.0, off: 1.8 }),
  ],
  spikes: [
    SPK('spk18-trap', 2880, 875, 240, 25, 'UP'), // Spikes beneath fake bridge
    SPK('spk18-1', 1680, 875, 520, 25, 'UP'),
  ],
  checkpoints: [
    CP('cp-18-1', 1100, 740, 'DOWN'),
    CP('cp-18-2', 2360, 740, 'DOWN'),
    CP('cp-18-3', 3660, 740, 'DOWN'),
  ],
  crystals: [
    C('c18-1', 580, 740),
    C('c18-2', 1700, 280),
    C('c18-3', 2960, 320),
    C('c18-4', 3280, 150),
    C('c18-5', 4350, 90),
  ],
  starCrystal: STAR('star-18', 3320, 150),
  portal: { x: 4660, y: 720, radius: 36, rotation: 0, active: true },
};

export const LEVEL_19: LevelData = {
  id: 19,
  world: 4,
  name: "Nexus Convergence",
  hint: "All 5 core mechanics collide: 4-dir gravity, teleports, switches, lasers, and sawblades!",
  parTime: 45,
  bounds: { width: 5000, height: 900 },
  spawn: { x: 140, y: 720 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 900),
    P('b-right', 4960, 0, 40, 900),
    P('b-ceil', 0, 0, 5000, 40),
    // Section 1: 4-Way gravity chamber with switch gates (0 to 1400)
    P('s1-floor', 40, 800, 360, 40),
    P('s1-wall-left', 580, 220, 40, 560),
    P('s1-high-switch', 640, 220, 240, 35),
    P('s1-floor-end', 1060, 800, 260, 40),
    // Section 2: Teleport hop across sawblade sea with crumbling floor (1400 to 2850)
    P('s2-floor-start', 1380, 800, 220, 40),
    P('s2-mid-cr', 1880, 560, 180, 32, { isCrumbling: true }),
    P('s2-floor-end', 2340, 800, 260, 40),
    // Section 3: Moving laser gauntlet & Star Crystal route (2850 to 4100)
    P('s3-floor-start', 2680, 800, 200, 40),
    P('s3-mv-floor', 2940, 800, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 260, moveSpeed: 160, startX: 2940, startY: 800 }),
    P('s3-star-spire', 3380, 180, 140, 25), // Dangerous apex star spire
    P('s3-ceil-track', 3560, 140, 260, 35),
    P('s3-floor-end', 3880, 800, 240, 40),
    // Section 4: Nexus core conduit escape (4100 to 5000)
    P('s4-floor', 4180, 800, 240, 40),
    P('s4-ceil-run', 4480, 140, 260, 35),
    P('s4-exit-floor', 4780, 800, 180, 40),
  ],
  doors: [
    DR('door19-1', 940, 600, 28, 200, '#38BDF8'),
    DR('door19-2', 4040, 600, 28, 200, '#F59E0B'),
  ],
  switches: [
    SW('sw19-1', 740, 202, 'door19-1', '#38BDF8'),
    SW('sw19-2', 3680, 122, 'door19-2', '#F59E0B'),
  ],
  teleporters: [
    TELE('tp19-1a', 'pair-19', 1520, 736, '#A855F7'),
    TELE('tp19-1b', 'pair-19', 1940, 496, '#A855F7'),
  ],
  gravityGates: [
    GATE('gate19-1', 520, 660, 36, 140, 'LEFT'),
    GATE('gate19-2', 860, 220, 36, 140, 'DOWN'),
  ],
  sawBlades: [
    SAW('saw19-1', 1700, 760, 42, { sx: 1600, sy: 760, ex: 1840, ey: 760 }),
    SAW('saw19-2', 3200, 460, 44, { sx: 3100, sy: 460, ex: 3340, ey: 460 }),
  ],
  lasers: [
    LSR('lsr19-1', 3100, 40, 3100, 800, { on: 2.0, off: 1.8 }),
    LSR('lsr19-star', 3380, 40, 3380, 800, { on: 1.8, off: 1.8 }),
    LSR('lsr19-2', 4660, 40, 4660, 800, { on: 2.2, off: 2.0 }),
  ],
  spikes: [
    SPK('spk19-1', 1600, 875, 680, 25, 'UP'),
    SPK('spk19-2', 2900, 875, 800, 25, 'UP'),
  ],
  checkpoints: [
    CP('cp-19-1', 1140, 740, 'DOWN'),
    CP('cp-19-2', 2420, 740, 'DOWN'),
    CP('cp-19-3', 3960, 740, 'DOWN'),
  ],
  crystals: [
    C('c19-1', 600, 420),
    C('c19-2', 1980, 440),
    C('c19-3', 3020, 740),
    C('c19-4', 3450, 130),
    C('c19-5', 4580, 90),
  ],
  starCrystal: STAR('star-19', 3460, 130),
  portal: { x: 4860, y: 720, radius: 38, rotation: 0, active: true },
};

export const LEVEL_20: LevelData = {
  id: 20,
  world: 4,
  name: "Omega Core: The Citadel Breaker",
  hint: "FINAL SECTOR BOSS: The Omega Core Citadel! The ultimate climax of levels 1–20. Master all anomalies.",
  parTime: 52,
  isBoss: true,
  bossTitle: "OMEGA SENTINEL // CITADEL OVERLORD",
  bossIntroText: "Maximum facility lockdown engaged. All kinetic, thermal, and gravitational security subsystems operating at overcharge capacity. Shatter the Citadel.",
  bounds: { width: 5200, height: 950 },
  spawn: { x: 140, y: 780 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 950),
    P('b-right', 5160, 0, 40, 950),
    P('b-ceil', 0, 0, 5200, 40),
    // Section 1: High speed elevator ascension through laser crossfire (0 to 1450)
    P('s1-floor', 40, 860, 360, 40),
    P('s1-mv-vert', 480, 760, 180, 35, { isMoving: true, moveAxis: 'Y', moveRange: 420, moveSpeed: 160, startX: 480, startY: 760 }),
    P('s1-high-station', 760, 340, 220, 35),
    P('s1-floor-end', 1120, 860, 260, 40),
    // Section 2: 4-Direction gravity shifting core with patrolling saws (1450 to 2950)
    P('s2-floor-start', 1440, 860, 220, 40),
    P('s2-wall-left', 1740, 220, 40, 640),
    P('s2-ceil-track', 1820, 120, 460, 35),
    P('s2-wall-right', 2340, 220, 40, 640),
    P('s2-floor-end', 2560, 860, 260, 40),
    // Section 3: Ultimate crumbling gauntlet & Star Crystal atop boss reactor (2950 to 4250)
    P('s3-floor-start', 2900, 860, 200, 40),
    P('s3-cr-1', 3160, 680, 160, 32, { isCrumbling: true }),
    P('s3-cr-2', 3380, 480, 160, 32, { isCrumbling: true }),
    P('s3-star-spire', 3560, 160, 140, 25), // Citadel Crown Star
    P('s3-cr-3', 3740, 480, 160, 32, { isCrumbling: true }),
    P('s3-floor-end', 4020, 860, 240, 40),
    // Section 4: Grand portal escape to World 5 (4250 to 5200)
    P('s4-floor', 4320, 860, 240, 40),
    P('s4-ceil-run', 4660, 160, 280, 35),
    P('s4-exit-pedestal', 4960, 780, 200, 40),
  ],
  bouncePads: [
    BPAD('bp20-1', 1040, 850, 60, 12, 'UP', 880),
    BPAD('bp20-2', 4240, 850, 60, 12, 'UP', 900),
  ],
  teleporters: [
    TELE('tp20-1a', 'pair-20', 2700, 796, '#A855F7'),
    TELE('tp20-1b', 'pair-20', 3000, 516, '#A855F7'),
  ],
  gravityGates: [
    GATE('gate20-1', 1680, 720, 36, 140, 'LEFT'),
    GATE('gate20-2', 2420, 220, 36, 140, 'DOWN'),
  ],
  sawBlades: [
    SAW('saw20-1', 2040, 480, 46, { sx: 1940, sy: 480, ex: 2220, ey: 480 }),
    SAW('saw20-2', 3460, 720, 44, { sx: 3340, sy: 720, ex: 3660, ey: 720 }),
    SAW('saw20-3', 4480, 820, 42, { sx: 4400, sy: 820, ex: 4620, ey: 820 }),
  ],
  lasers: [
    LSR('lsr20-1', 660, 40, 660, 860, { on: 2.2, off: 2.0 }),
    LSR('lsr20-2', 1340, 40, 1340, 860, { on: 2.0, off: 1.8 }),
    LSR('lsr20-3', 3560, 40, 3560, 860, { on: 1.8, off: 1.8 }),
    LSR('lsr20-4', 4820, 40, 4820, 860, { on: 2.2, off: 2.0 }),
  ],
  spikes: [
    SPK('spk20-1', 440, 910, 660, 30, 'UP'),
    SPK('spk20-2', 1780, 910, 760, 30, 'UP'),
    SPK('spk20-3', 3120, 910, 880, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp-20-1', 1180, 800, 'DOWN'),
    CP('cp-20-2', 2620, 800, 'DOWN'),
    CP('cp-20-3', 4080, 800, 'DOWN'),
  ],
  crystals: [
    C('c20-1', 540, 420),
    C('c20-2', 860, 280),
    C('c20-3', 1980, 80),
    C('c20-4', 3240, 620),
    C('c20-5', 3630, 110),
    C('c20-6', 4760, 110),
  ],
  starCrystal: STAR('star-20', 3640, 110),
  portal: { x: 5060, y: 700, radius: 46, rotation: 0, active: true },
};

// ============================================================================
// ALL 40 LEVELS EXPORT
// Levels 1–20 (Rebuilt 3x–5x wider, 3–4 sections each) + STAGE_D_LEVELS (21–40)
// ============================================================================

export const ALL_LEVELS: LevelData[] = [
  LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, LEVEL_5,
  LEVEL_6, LEVEL_7, LEVEL_8, LEVEL_9, LEVEL_10,
  LEVEL_11, LEVEL_12, LEVEL_13, LEVEL_14, LEVEL_15,
  LEVEL_16, LEVEL_17, LEVEL_18, LEVEL_19, LEVEL_20,
  ...STAGE_D_LEVELS,
];

// Run automatic debug beatability verification across all 40 levels on load
validateAllLevels(ALL_LEVELS);

export function getLevelById(id: number): LevelData {
  const found = ALL_LEVELS.find((l) => l.id === id);
  return found || LEVEL_1;
}

export function getLevelsForWorld(worldId: number): LevelData[] {
  return ALL_LEVELS.filter((l) => l.world === worldId);
}

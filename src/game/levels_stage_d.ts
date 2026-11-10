import {
  LevelData,
  Platform,
  Crystal,
  Checkpoint,
  Spike,
  BouncePad,
  GravityGate,
  Laser,
  SawBlade,
  Switch,
  Door,
  Teleporter,
  SpeedBoostStrip,
  Crate,
  PatrolDrone,
  WindZone,
  GravityDirection,
} from './types';

// ============================================================================
// COMPACT LEVEL AUTHORING CONSTRUCTORS
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
const BPAD = (id: string, x: number, y: number, w: number, h: number, dir: GravityDirection = 'UP', force = 840): BouncePad => ({
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
const SW = (id: string, x: number, y: number, doorId: string, color = '#38BDF8', w = 36, h = 18, timedDuration?: number): Switch => ({
  id, x, y, width: w, height: h, targetDoorId: doorId, color, isPressed: false, timedDuration,
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
const CRATE = (id: string, x: number, y: number, size = 36): Crate => ({
  id, x, y, width: size, height: size, vx: 0, vy: 0, onGround: false,
});
const DRONE = (id: string, sx: number, sy: number, ex: number, ey: number, spd = 120, r = 20): PatrolDrone => ({
  id, x: sx, y: sy, startX: sx, startY: sy, endX: ex, endY: ey, speed: spd, radius: r, progress: 0, dir: 1,
});
const WIND = (id: string, x: number, y: number, w: number, h: number, fx: number, fy: number): WindZone => ({
  id, x, y, width: w, height: h, forceX: fx, forceY: fy,
});

// ============================================================================
// WORLD 5: ICE AND WIND (LEVELS 21–25)
// Cyan/Ice Theme - Frictionless ice runways, atmospheric crosswinds, blizzards
// ============================================================================

export const LEVEL_21: LevelData = {
  id: 21,
  world: 5,
  name: "Glacial Promenade",
  hint: "Breather run: Ice surfaces are frictionless! Slide smoothly and glide over air currents.",
  parTime: 28,
  storyIntro: {
    worldName: "WORLD 5: ICE & WIND",
    lines: [
      "Sub-zero cryo-refrigeration conduits stretch across the subterranean chasm.",
      "Slick frictionless ice and pressurized wind streams distort momentum.",
      "Master glide physics to traverse the frost sector.",
    ],
  },
  bounds: { width: 4200, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 4160, 0, 40, 720),
    P('b-ceil', 0, 0, 4200, 40),
    // Section 1: Intro ice slide (0 - 1100)
    P('s1-floor', 40, 640, 360, 40),
    P('s1-ice-1', 400, 640, 520, 40, { surfaceType: 'ice' }),
    P('s1-ceil-island', 620, 140, 240, 35, { surfaceType: 'ice' }),
    P('s1-end', 920, 640, 220, 40),
    // Section 2: Wind-assisted crossing (1100 - 2250)
    P('s2-floor-start', 1180, 640, 320, 40),
    P('s2-ice-isle', 1560, 500, 260, 35, { surfaceType: 'ice' }),
    P('s2-ceil-runway', 1860, 180, 280, 35, { surfaceType: 'ice' }),
    P('s2-floor-end', 2140, 640, 240, 40),
    // Section 3: Dual-glide wind cavern (2250 - 3350)
    P('s3-floor-start', 2380, 640, 280, 40),
    P('s3-ice-high', 2700, 420, 260, 35, { surfaceType: 'ice' }),
    P('s3-ice-low', 3000, 640, 260, 40, { surfaceType: 'ice' }),
    P('s3-platform-end', 3260, 640, 220, 40),
    // Section 4: Final ice glide & exit (3350 - 4200)
    P('s4-start', 3480, 640, 240, 40),
    P('s4-ice-chasm', 3740, 520, 220, 35, { surfaceType: 'ice' }),
    P('s4-star-alcove', 3680, 130, 180, 30),
    P('s4-exit-pedestal', 3960, 640, 200, 40),
  ],
  windZones: [
    WIND('wz21-1', 1400, 80, 500, 560, 320, -30),
    WIND('wz21-2', 2600, 80, 500, 560, 400, -50),
  ],
  checkpoints: [
    CP('cp21-1', 1240, 580, 'DOWN'),
    CP('cp21-2', 2420, 580, 'DOWN'),
    CP('cp21-3', 3520, 580, 'DOWN'),
  ],
  crystals: [
    C('c21-1', 620, 560),
    C('c21-2', 1680, 420),
    C('c21-3', 2820, 340),
    C('c21-4', 3820, 440),
  ],
  starCrystal: STAR('star-21', 3770, 80),
  portal: { x: 4060, y: 560, radius: 44, rotation: 0, active: true },
};

export const LEVEL_22: LevelData = {
  id: 22,
  world: 5,
  name: "Blizzard Conduits",
  hint: "Powerful crosswinds push against you. Discover the secret alcove in the ice wall!",
  parTime: 32,
  bounds: { width: 4400, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 4360, 0, 40, 720),
    P('b-ceil', 0, 0, 4400, 40),
    // Section 1: Headwind ice slide (0 - 1150)
    P('s1-floor', 40, 640, 380, 40),
    P('s1-ice-1', 420, 640, 420, 40, { surfaceType: 'ice' }),
    P('s1-wall-blocker', 840, 420, 40, 220),
    P('s1-ceil-shelf', 580, 160, 220, 35, { surfaceType: 'ice' }),
    P('s1-end', 920, 640, 240, 40),
    // Section 2: Tailwind canyon (1150 - 2300)
    P('s2-start', 1220, 640, 280, 40),
    P('s2-ice-isle-1', 1540, 460, 240, 35, { surfaceType: 'ice' }),
    P('s2-ice-isle-2', 1840, 320, 240, 35, { surfaceType: 'ice' }),
    P('s2-end', 2160, 640, 240, 40),
    // Section 3: Swirling vortex (2300 - 3400)
    P('s3-start', 2420, 640, 260, 40),
    P('s3-ceil-runway', 2720, 160, 340, 35, { surfaceType: 'ice' }),
    P('s3-mid-block', 3100, 440, 200, 35, { surfaceType: 'ice' }),
    P('s3-end', 3320, 640, 220, 40),
    // Section 4: Updraft chasm to portal (3400 - 4400)
    P('s4-start', 3560, 640, 260, 40),
    P('s4-ice-pillar', 3860, 500, 180, 35, { surfaceType: 'ice' }),
    P('s4-star-shelf', 3960, 140, 180, 30),
    P('s4-exit', 4160, 640, 200, 40),
  ],
  windZones: [
    WIND('wz22-headwind', 380, 80, 520, 560, -520, -30),
    WIND('wz22-tailwind', 1500, 80, 600, 560, 580, -40),
    WIND('wz22-updraft', 3780, 80, 300, 560, 120, -320),
  ],
  spikes: [
    SPK('spk22-1', 1480, 650, 640, 30, 'UP'),
    SPK('spk22-2', 2700, 650, 400, 30, 'UP'),
  ],
  secretPassages: [
    {
      id: 'sp-22',
      x: 40,
      y: 200,
      width: 40,
      height: 120,
      revealed: false,
      bonusCrystals: [
        C('sp-c1', 110, 240),
        C('sp-c2', 170, 240),
      ],
      label: 'Glacial Vault',
    },
  ],
  checkpoints: [
    CP('cp22-1', 1260, 580, 'DOWN'),
    CP('cp22-2', 2460, 580, 'DOWN'),
    CP('cp22-3', 3600, 580, 'DOWN'),
  ],
  crystals: [
    C('c22-1', 620, 560),
    C('c22-2', 1660, 380),
    C('c22-3', 2880, 100),
    C('c22-4', 3940, 420),
  ],
  starCrystal: STAR('star-22', 4040, 90),
  portal: { x: 4260, y: 560, radius: 44, rotation: 0, active: true },
};

export const LEVEL_23: LevelData = {
  id: 23,
  world: 5,
  name: "Permafrost Bounce",
  hint: "Ice momentum feeds into bounce pads! Clear spike chasms and trigger vertical gravity gates.",
  parTime: 34,
  bounds: { width: 4600, height: 740 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 740),
    P('b-right', 4560, 0, 40, 740),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Ice bounce over spike ravine (0 - 1200)
    P('s1-floor', 40, 660, 360, 40),
    P('s1-ice-run', 400, 660, 360, 40, { surfaceType: 'ice' }),
    P('s1-launch-pad-base', 760, 660, 120, 40),
    P('s1-mid-ledge', 1000, 420, 220, 35, { surfaceType: 'ice' }),
    // Section 2: Gravity gate vertical wall slide (1200 - 2400)
    P('s2-floor-start', 1260, 660, 260, 40),
    P('s2-vert-wall', 1680, 160, 40, 460, { surfaceType: 'ice' }),
    P('s2-ceil-ledge', 1840, 160, 280, 35, { surfaceType: 'ice' }),
    P('s2-floor-end', 2220, 660, 240, 40),
    // Section 3: Wind-opposed bounce chain (2400 - 3550)
    P('s3-floor-start', 2480, 660, 240, 40),
    P('s3-pad-isle-1', 2820, 520, 140, 35),
    P('s3-ice-high', 3080, 260, 240, 35, { surfaceType: 'ice' }),
    P('s3-floor-end', 3380, 660, 220, 40),
    // Section 4: Precision flip gauntlet to portal (3550 - 4600)
    P('s4-start', 3620, 660, 240, 40),
    P('s4-ice-runway', 3900, 660, 320, 40, { surfaceType: 'ice' }),
    P('s4-star-perch', 4020, 140, 180, 30),
    P('s4-exit', 4340, 660, 220, 40),
  ],
  bouncePads: [
    BPAD('bp23-1', 800, 646, 70, 14, 'UP', 900),
    BPAD('bp23-2', 2850, 506, 70, 14, 'UP', 920),
  ],
  gravityGates: [
    GATE('gate23-1', 1580, 380, 36, 160, 'LEFT'),
    GATE('gate23-2', 2040, 240, 36, 160, 'DOWN'),
  ],
  spikes: [
    SPK('spk23-1', 880, 670, 360, 30, 'UP'),
    SPK('spk23-2', 2560, 670, 600, 30, 'UP'),
    SPK('spk23-3', 3820, 670, 500, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp23-1', 1300, 600, 'DOWN'),
    CP('cp23-2', 2520, 600, 'DOWN'),
    CP('cp23-3', 3660, 600, 'DOWN'),
  ],
  crystals: [
    C('c23-1', 600, 580),
    C('c23-2', 1760, 320),
    C('c23-3', 2900, 200),
    C('c23-4', 4060, 580),
  ],
  starCrystal: STAR('star-23', 4110, 90),
  portal: { x: 4450, y: 580, radius: 44, rotation: 0, active: true },
};

export const LEVEL_24: LevelData = {
  id: 24,
  world: 5,
  name: "Cryo Fracture",
  hint: "Crumbling ice fractures 0.5s after touch! Jump quickly through vertical drafts.",
  parTime: 36,
  bounds: { width: 4600, height: 740 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 740),
    P('b-right', 4560, 0, 40, 740),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Crumbling stepping stones (0 - 1200)
    P('s1-floor', 40, 660, 360, 40),
    P('s1-cr-1', 460, 540, 140, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-cr-2', 680, 420, 140, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-cr-3', 900, 300, 140, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-end', 1100, 660, 240, 40),
    // Section 2: Updraft float over abyss (1200 - 2400)
    P('s2-start', 1260, 660, 260, 40),
    P('s2-ice-isle-1', 1560, 500, 200, 35, { surfaceType: 'ice' }),
    P('s2-cr-4', 1840, 380, 140, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s2-ceil-run', 2040, 160, 260, 35, { surfaceType: 'ice' }),
    P('s2-end', 2280, 660, 240, 40),
    // Section 3: Alternating ceiling fracture (2400 - 3550)
    P('s3-start', 2540, 660, 240, 40),
    P('s3-cr-ceil-1', 2820, 180, 140, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-cr-ceil-2', 3040, 180, 140, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-ice-mid', 3260, 460, 200, 35, { surfaceType: 'ice' }),
    P('s3-end', 3480, 660, 220, 40),
    // Section 4: Rapid stairway to portal (3550 - 4600)
    P('s4-start', 3700, 660, 240, 40),
    P('s4-cr-stair-1', 4000, 540, 130, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s4-cr-stair-2', 4180, 420, 130, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s4-star-ledge', 3960, 160, 180, 30),
    P('s4-exit', 4360, 420, 200, 40),
  ],
  spikes: [
    SPK('spk24-1', 420, 670, 640, 30, 'UP'),
    SPK('spk24-2', 1500, 670, 760, 30, 'UP'),
    SPK('spk24-3', 2760, 670, 700, 30, 'UP'),
    SPK('spk24-4', 3920, 670, 420, 30, 'UP'),
  ],
  windZones: [
    WIND('wz24-draft', 1700, 80, 460, 580, 250, -220),
  ],
  checkpoints: [
    CP('cp24-1', 1300, 600, 'DOWN'),
    CP('cp24-2', 2580, 600, 'DOWN'),
    CP('cp24-3', 3740, 600, 'DOWN'),
  ],
  crystals: [
    C('c24-1', 690, 360),
    C('c24-2', 1900, 320),
    C('c24-3', 3100, 120),
    C('c24-4', 4240, 360),
  ],
  starCrystal: STAR('star-24', 4050, 100),
  portal: { x: 4460, y: 340, radius: 44, rotation: 0, active: true },
};

export const LEVEL_25: LevelData = {
  id: 25,
  world: 5,
  name: "The Frost Tempest",
  hint: "World 5 Boss: Rising cryogenic hazard! Sled across ice, flip through wind tunnels, ascend!",
  parTime: 40,
  isBoss: true,
  bossTitle: "THE FROST TEMPEST",
  bossIntroText: "WORLD 5 BOSS: Cryo-containment breach! Severe blizzard gale and rising frost floor. Ascend or be frozen solid!",
  bossType: 'blizzard_storm',
  risingFloor: { active: true, y: 760, startY: 760, speed: 20 },
  bounds: { width: 4800, height: 760 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4760, 0, 40, 760),
    P('b-ceil', 0, 0, 4800, 40),
    // Section 1: Cryo surge escape (0 - 1250)
    P('s1-floor', 40, 660, 360, 40),
    P('s1-ice-ramp', 440, 600, 340, 35, { surfaceType: 'ice' }),
    P('s1-cr-1', 840, 480, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-end', 1060, 440, 220, 35),
    // Section 2: Gale-force blizzard tunnel (1250 - 2500)
    P('s2-start', 1320, 520, 240, 35),
    P('s2-ice-isle-1', 1620, 460, 260, 35, { surfaceType: 'ice' }),
    P('s2-ceil-runway', 1940, 160, 300, 35, { surfaceType: 'ice' }),
    P('s2-end', 2300, 480, 240, 35),
    // Section 3: Shifting frost spires (2500 - 3700)
    P('s3-start', 2580, 480, 240, 35),
    P('s3-ice-high', 2880, 320, 240, 35, { surfaceType: 'ice' }),
    P('s3-cr-2', 3180, 240, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-end', 3400, 460, 240, 35),
    // Section 4: Apex blizzard summit & exit portal (3700 - 4800)
    P('s4-start', 3700, 460, 240, 35),
    P('s4-ice-ascent-1', 3980, 380, 200, 35, { surfaceType: 'ice' }),
    P('s4-ice-ascent-2', 4240, 280, 200, 35, { surfaceType: 'ice' }),
    P('s4-star-apex', 4340, 120, 180, 30),
    P('s4-boss-pedestal', 4520, 240, 220, 40),
  ],
  windZones: [
    WIND('wz25-storm1', 1400, 80, 800, 600, -750, -40),
    WIND('wz25-storm2', 2800, 80, 700, 600, 620, -50),
  ],
  spikes: [
    SPK('spk25-1', 500, 690, 500, 30, 'UP'),
    SPK('spk25-2', 1500, 690, 700, 30, 'UP'),
    SPK('spk25-3', 2700, 690, 600, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp25-1', 1360, 460, 'DOWN'),
    CP('cp25-2', 2620, 420, 'DOWN'),
    CP('cp25-3', 3740, 400, 'DOWN'),
  ],
  crystals: [
    C('c25-1', 920, 420),
    C('c25-2', 1740, 400),
    C('c25-3', 3000, 260),
    C('c25-4', 4340, 220),
  ],
  starCrystal: STAR('star-25', 4430, 70),
  portal: { x: 4630, y: 160, radius: 46, rotation: 0, active: true },
};

// ============================================================================
// WORLD 6: MACHINE FACTORY (LEVELS 26–30)
// Industrial Amber Theme - Switches, blast doors, crates, high-speed saws
// ============================================================================

export const LEVEL_26: LevelData = {
  id: 26,
  world: 6,
  name: "Piston Alley",
  hint: "Breather run: Push heavy crates onto floor switches to unlock reinforced blast doors!",
  parTime: 32,
  storyIntro: {
    worldName: "WORLD 6: MACHINE FACTORY",
    lines: [
      "The subterranean automated manufacturing plant roars with hydraulic life.",
      "Heavy pneumatic blast doors guard the transit conduits.",
      "Utilize weighted crates and pressure switches to open the path.",
    ],
  },
  bounds: { width: 4400, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 4360, 0, 40, 720),
    P('b-ceil', 0, 0, 4400, 40),
    // Section 1: First crate & pressure door (0 - 1150)
    P('s1-floor', 40, 640, 560, 40),
    P('s1-crate-pedestal', 340, 520, 120, 35),
    P('s1-door-frame', 760, 40, 40, 360),
    P('s1-end', 800, 640, 320, 40),
    // Section 2: Moving hydraulic shelf (1150 - 2300)
    P('s2-start', 1220, 640, 260, 40),
    P('s2-moving-platform', 1540, 500, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 200, moveSpeed: 90 }),
    P('s2-switch-bay', 1880, 420, 200, 35),
    P('s2-end', 2180, 640, 240, 40),
    // Section 3: Dual crate relay (2300 - 3400)
    P('s3-start', 2440, 640, 280, 40),
    P('s3-crate-ledge', 2680, 440, 180, 35),
    P('s3-ceil-traverse', 2960, 160, 260, 35),
    P('s3-end', 3240, 640, 240, 40),
    // Section 4: Final blast door & exit portal (3400 - 4400)
    P('s4-start', 3520, 640, 260, 40),
    P('s4-boost-runway', 3820, 640, 220, 40),
    P('s4-star-alcove', 3920, 140, 180, 30),
    P('s4-exit', 4180, 640, 180, 40),
  ],
  crates: [
    CRATE('crate26-1', 380, 470, 38),
    CRATE('crate26-2', 2740, 390, 38),
  ],
  switches: [
    SW('sw26-1', 480, 622, 'dr26-1', '#F59E0B'),
    SW('sw26-2', 1960, 402, 'dr26-2', '#F59E0B'),
    SW('sw26-3', 3640, 622, 'dr26-3', '#F59E0B'),
  ],
  doors: [
    DR('dr26-1', 760, 400, 40, 240, '#F59E0B'),
    DR('dr26-2', 2140, 380, 40, 260, '#F59E0B'),
    DR('dr26-3', 4100, 380, 40, 260, '#F59E0B'),
  ],
  boostStrips: [
    BOOST('boost26-1', 3820, 632, 220, 8, 'RIGHT', 700),
  ],
  checkpoints: [
    CP('cp26-1', 1260, 580, 'DOWN'),
    CP('cp26-2', 2480, 580, 'DOWN'),
    CP('cp26-3', 3560, 580, 'DOWN'),
  ],
  crystals: [
    C('c26-1', 620, 560),
    C('c26-2', 1630, 440),
    C('c26-3', 3080, 100),
    C('c26-4', 3930, 560),
  ],
  starCrystal: STAR('star-26', 4010, 90),
  portal: { x: 4270, y: 560, radius: 44, rotation: 0, active: true },
};

export const LEVEL_27: LevelData = {
  id: 27,
  world: 6,
  name: "Relay Conduits",
  hint: "Timed switches only hold doors open for 5 seconds! Sprint through before the timer runs out.",
  parTime: 35,
  bounds: { width: 4600, height: 740 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 740),
    P('b-right', 4560, 0, 40, 740),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Timed sprint 1 (0 - 1200)
    P('s1-floor', 40, 660, 420, 40),
    P('s1-boost-lane', 460, 660, 340, 40),
    P('s1-mid-ledge', 860, 460, 200, 35),
    P('s1-end', 1100, 660, 240, 40),
    // Section 2: Crate jam and ceiling flip (1200 - 2400)
    P('s2-start', 1260, 660, 260, 40),
    P('s2-crate-shelf', 1520, 480, 160, 35),
    P('s2-ceil-switch', 1820, 160, 240, 35),
    P('s2-end', 2180, 660, 240, 40),
    // Section 3: Dual timed relay doors (2400 - 3550)
    P('s3-start', 2460, 660, 240, 40),
    P('s3-boost-mid', 2760, 660, 260, 40),
    P('s3-high-perch', 3080, 360, 220, 35),
    P('s3-end', 3380, 660, 220, 40),
    // Section 4: Hydraulic sprint to exit (3550 - 4600)
    P('s4-start', 3620, 660, 240, 40),
    P('s4-step-1', 3900, 520, 180, 35),
    P('s4-star-nook', 4060, 140, 180, 30),
    P('s4-exit', 4360, 660, 200, 40),
  ],
  switches: [
    SW('sw27-1', 400, 642, 'dr27-1', '#F59E0B', 36, 18, 5.0),
    SW('sw27-2', 1880, 178, 'dr27-2', '#F59E0B', 36, 18, 5.0),
    SW('sw27-3', 2560, 642, 'dr27-3', '#F59E0B', 36, 18, 5.0),
  ],
  doors: [
    DR('dr27-1', 980, 380, 40, 280, '#F59E0B'),
    DR('dr27-2', 2140, 380, 40, 280, '#F59E0B'),
    DR('dr27-3', 3340, 380, 40, 280, '#F59E0B'),
  ],
  boostStrips: [
    BOOST('boost27-1', 460, 652, 340, 8, 'RIGHT', 720),
    BOOST('boost27-2', 2760, 652, 260, 8, 'RIGHT', 720),
  ],
  spikes: [
    SPK('spk27-1', 1600, 670, 500, 30, 'UP'),
    SPK('spk27-2', 2900, 670, 400, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp27-1', 1300, 600, 'DOWN'),
    CP('cp27-2', 2500, 600, 'DOWN'),
    CP('cp27-3', 3660, 600, 'DOWN'),
  ],
  crystals: [
    C('c27-1', 630, 580),
    C('c27-2', 1940, 100),
    C('c27-3', 2890, 580),
    C('c27-4', 3990, 460),
  ],
  starCrystal: STAR('star-27', 4150, 90),
  portal: { x: 4460, y: 580, radius: 44, rotation: 0, active: true },
};

export const LEVEL_28: LevelData = {
  id: 28,
  world: 6,
  name: "Sawmill Assembly",
  hint: "Rotating saws patrol the conveyor lines! Push metal crates to block hazardous laser beams.",
  parTime: 36,
  bounds: { width: 4600, height: 740 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 740),
    P('b-right', 4560, 0, 40, 740),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Conveyor saw evasion (0 - 1200)
    P('s1-floor', 40, 660, 380, 40),
    P('s1-crumb-conveyor', 460, 660, 320, 40, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-mid-box', 860, 460, 180, 35),
    P('s1-end', 1100, 660, 240, 40),
    // Section 2: Crate blocking laser beam (1200 - 2400)
    P('s2-start', 1260, 660, 260, 40),
    P('s2-laser-floor', 1560, 660, 380, 40),
    P('s2-crate-perch', 1540, 520, 120, 35),
    P('s2-ceil-track', 1980, 160, 240, 35),
    P('s2-end', 2260, 660, 240, 40),
    // Section 3: Oscillating saw chamber (2400 - 3550)
    P('s3-start', 2520, 660, 240, 40),
    P('s3-crumb-1', 2820, 520, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-mid-island', 3060, 380, 200, 35),
    P('s3-end', 3360, 660, 220, 40),
    // Section 4: Final saw gauntlet & portal (3550 - 4600)
    P('s4-start', 3620, 660, 240, 40),
    P('s4-step-1', 3920, 520, 180, 35),
    P('s4-star-platform', 4080, 140, 180, 30),
    P('s4-exit', 4360, 660, 200, 40),
  ],
  sawBlades: [
    SAW('saw28-1', 620, 580, 40, { sx: 520, sy: 580, ex: 720, ey: 580 }),
    SAW('saw28-2', 2900, 440, 44, { sx: 2800, sy: 440, ex: 3000, ey: 440 }),
    SAW('saw28-3', 4020, 440, 44, { sx: 3920, sy: 440, ex: 4120, ey: 440 }),
  ],
  crates: [
    CRATE('crate28-1', 1580, 470, 38),
  ],
  lasers: [
    LSR('lsr28-1', 1820, 40, 1820, 660),
  ],
  spikes: [
    SPK('spk28-1', 2340, 670, 160, 30, 'UP'),
    SPK('spk28-2', 3440, 670, 160, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp28-1', 1300, 600, 'DOWN'),
    CP('cp28-2', 2600, 600, 'DOWN'),
    CP('cp28-3', 3700, 600, 'DOWN'),
  ],
  crystals: [
    C('c28-1', 620, 380),
    C('c28-2', 1700, 580),
    C('c28-3', 3160, 320),
    C('c28-4', 4010, 460),
  ],
  starCrystal: STAR('star-28', 4170, 90),
  portal: { x: 4460, y: 580, radius: 44, rotation: 0, active: true },
};

export const LEVEL_29: LevelData = {
  id: 29,
  world: 6,
  name: "Hydraulic Gauntlet",
  hint: "Synchronized saws and timed doors! Grab the shield pickup to survive industrial hazards.",
  parTime: 38,
  bounds: { width: 4800, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4760, 0, 40, 760),
    P('b-ceil', 0, 0, 4800, 40),
    // Section 1: Dual saw pressure puzzle (0 - 1300)
    P('s1-floor', 40, 680, 420, 40),
    P('s1-crate-isle', 480, 520, 160, 35),
    P('s1-crumb-step', 720, 420, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-end', 960, 680, 280, 40),
    // Section 2: Timed sprint under saw (1300 - 2500)
    P('s2-start', 1320, 680, 260, 40),
    P('s2-boost-lane', 1600, 680, 320, 40),
    P('s2-ceil-ledge', 1980, 160, 260, 35),
    P('s2-end', 2300, 680, 240, 40),
    // Section 3: Laser corridor with moving cover (2500 - 3700)
    P('s3-start', 2580, 680, 240, 40),
    P('s3-crate-pad', 2860, 520, 160, 35),
    P('s3-crumb-2', 3120, 380, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-end', 3420, 680, 240, 40),
    // Section 4: Final triple saw gauntlet (3700 - 4800)
    P('s4-start', 3720, 680, 240, 40),
    P('s4-step-1', 4020, 540, 180, 35),
    P('s4-star-girder', 4260, 140, 180, 30),
    P('s4-exit', 4540, 680, 220, 40),
  ],
  sawBlades: [
    SAW('saw29-1', 600, 600, 42, { sx: 500, sy: 600, ex: 700, ey: 600 }),
    SAW('saw29-2', 1760, 580, 46, { sx: 1660, sy: 580, ex: 1860, ey: 580 }),
    SAW('saw29-3', 4120, 460, 44, { sx: 4020, sy: 460, ex: 4220, ey: 460 }),
  ],
  switches: [
    SW('sw29-1', 300, 662, 'dr29-1', '#F59E0B', 36, 18, 5.0),
    SW('sw29-2', 1400, 662, 'dr29-2', '#F59E0B', 36, 18, 5.0),
  ],
  doors: [
    DR('dr29-1', 880, 400, 40, 280, '#F59E0B'),
    DR('dr29-2', 2220, 400, 40, 280, '#F59E0B'),
  ],
  boostStrips: [
    BOOST('boost29-1', 1600, 672, 320, 8, 'RIGHT', 720),
  ],
  shieldPickups: [
    { id: 'sh29-1', x: 2060, y: 110, collected: false, baseY: 110, pulsePhase: 0 },
  ],
  checkpoints: [
    CP('cp29-1', 1360, 620, 'DOWN'),
    CP('cp29-2', 2620, 620, 'DOWN'),
    CP('cp29-3', 3760, 620, 'DOWN'),
  ],
  crystals: [
    C('c29-1', 780, 360),
    C('c29-2', 1800, 600),
    C('c29-3', 3200, 320),
    C('c29-4', 4110, 480),
  ],
  starCrystal: STAR('star-29', 4350, 90),
  portal: { x: 4640, y: 600, radius: 44, rotation: 0, active: true },
};

export const LEVEL_30: LevelData = {
  id: 30,
  world: 6,
  name: "Apex Mecha-Construct",
  hint: "World 6 Boss: Machine room with sweeping lasers and synchronized timed doors!",
  parTime: 42,
  isBoss: true,
  bossTitle: "APEX MECHA-CONSTRUCT",
  bossIntroText: "WORLD 6 BOSS: Core machinery overloaded! Automated sweeping lasers and rapid hydraulic blast doors active. Overcome the factory mainframe!",
  bossType: 'sweeping_laser',
  bounds: { width: 5000, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4960, 0, 40, 760),
    P('b-ceil', 0, 0, 5000, 40),
    // Section 1: Sweeping laser gauntlet (0 - 1300)
    P('s1-floor', 40, 680, 380, 40),
    P('s1-mid-safe-isle', 500, 520, 180, 35),
    P('s1-ceil-island', 760, 160, 220, 35),
    P('s1-end', 1040, 680, 240, 40),
    // Section 2: Crushing doors and saws (1300 - 2600)
    P('s2-start', 1340, 680, 260, 40),
    P('s2-boost-corridor', 1640, 680, 360, 40),
    P('s2-upper-run', 2060, 380, 240, 35),
    P('s2-end', 2420, 680, 240, 40),
    // Section 3: Cascading timed doors (2600 - 3800)
    P('s3-start', 2700, 680, 240, 40),
    P('s3-crumb-1', 2980, 520, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-switch-mid', 3240, 380, 200, 35),
    P('s3-end', 3560, 680, 240, 40),
    // Section 4: Factory mainframe apex & exit (3800 - 5000)
    P('s4-start', 3860, 680, 240, 40),
    P('s4-moving-pedestal', 4160, 540, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 160, moveSpeed: 100 }),
    P('s4-star-girder', 4380, 140, 200, 30),
    P('s4-boss-exit', 4680, 680, 240, 40),
  ],
  lasers: [
    LSR('lsr30-1', 660, 40, 660, 680, { on: 2.0, off: 1.8 }),
    LSR('lsr30-2', 1800, 40, 1800, 680, { on: 1.8, off: 1.6 }),
    LSR('lsr30-3', 3420, 40, 3420, 680, { on: 1.8, off: 1.8 }),
    LSR('lsr30-4', 4500, 40, 4500, 680, { on: 2.2, off: 1.8 }),
  ],
  sawBlades: [
    SAW('saw30-1', 1480, 600, 46, { sx: 1380, sy: 600, ex: 1580, ey: 600 }),
    SAW('saw30-2', 2840, 600, 46, { sx: 2740, sy: 600, ex: 2940, ey: 600 }),
  ],
  switches: [
    SW('sw30-1', 1400, 662, 'dr30-1', '#F59E0B', 36, 18, 5.0),
    SW('sw30-2', 3320, 362, 'dr30-2', '#F59E0B', 36, 18, 5.0),
  ],
  doors: [
    DR('dr30-1', 2340, 400, 40, 280, '#F59E0B'),
    DR('dr30-2', 3500, 400, 40, 280, '#F59E0B'),
  ],
  boostStrips: [
    BOOST('boost30-1', 1640, 672, 360, 8, 'RIGHT', 720),
  ],
  checkpoints: [
    CP('cp30-1', 1380, 620, 'DOWN'),
    CP('cp30-2', 2740, 620, 'DOWN'),
    CP('cp30-3', 3900, 620, 'DOWN'),
  ],
  crystals: [
    C('c30-1', 590, 460),
    C('c30-2', 1820, 620),
    C('c30-3', 3340, 320),
    C('c30-4', 4250, 480),
  ],
  starCrystal: STAR('star-30', 4480, 90),
  portal: { x: 4800, y: 600, radius: 46, rotation: 0, active: true },
};

// ============================================================================
// WORLD 7: DARK LAB (LEVELS 31–35)
// Bioluminescent Emerald Theme - Darkness shroud, patrol drones, warning lasers
// ============================================================================

export const LEVEL_31: LevelData = {
  id: 31,
  world: 7,
  name: "Shadow Protocol",
  hint: "Breather run: Pitch dark room! Only the light around your orb reveals platforms and crystals.",
  parTime: 32,
  isDarkRoom: true,
  storyIntro: {
    worldName: "WORLD 7: DARK LAB",
    lines: [
      "Deep research laboratory sub-sector powered down into complete blackout.",
      "Autonomous sentinels patrol the pitch-black hallways.",
      "Your orb's bioluminescent glow is your only lantern.",
    ],
  },
  bounds: { width: 4400, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 4360, 0, 40, 720),
    P('b-ceil', 0, 0, 4400, 40),
    // Section 1: Dark stepping stones (0 - 1150)
    P('s1-floor', 40, 640, 420, 40),
    P('s1-isle-1', 540, 520, 200, 35),
    P('s1-isle-2', 800, 400, 200, 35),
    P('s1-end', 1060, 640, 220, 40),
    // Section 2: Bioluminescent ceiling path (1150 - 2300)
    P('s2-start', 1240, 640, 260, 40),
    P('s2-ceil-runway', 1560, 160, 320, 35),
    P('s2-mid-step', 1940, 440, 200, 35),
    P('s2-end', 2200, 640, 240, 40),
    // Section 3: Dark ravine crossing (2300 - 3400)
    P('s3-start', 2460, 640, 240, 40),
    P('s3-crumb-1', 2760, 520, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-high-perch', 3020, 360, 220, 35),
    P('s3-end', 3300, 640, 220, 40),
    // Section 4: Secret chamber & portal (3400 - 4400)
    P('s4-start', 3540, 640, 240, 40),
    P('s4-step-1', 3820, 500, 180, 35),
    P('s4-star-alcove', 3960, 140, 180, 30),
    P('s4-exit', 4180, 640, 180, 40),
  ],
  secretPassages: [
    {
      id: 'sp-31',
      x: 3960,
      y: 120,
      width: 40,
      height: 100,
      revealed: false,
      bonusCrystals: [
        C('sp31-c1', 4040, 160),
        C('sp31-c2', 4090, 160),
      ],
      label: 'Shadow Archive',
    },
  ],
  spikes: [
    SPK('spk31-1', 500, 650, 520, 30, 'UP'),
    SPK('spk31-2', 1540, 650, 620, 30, 'UP'),
    SPK('spk31-3', 2740, 650, 520, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp31-1', 1280, 580, 'DOWN'),
    CP('cp31-2', 2500, 580, 'DOWN'),
    CP('cp31-3', 3580, 580, 'DOWN'),
  ],
  crystals: [
    C('c31-1', 640, 460),
    C('c31-2', 1720, 100),
    C('c31-3', 3130, 300),
    C('c31-4', 3910, 440),
  ],
  starCrystal: STAR('star-31', 4050, 90),
  portal: { x: 4270, y: 560, radius: 44, rotation: 0, active: true },
};

export const LEVEL_32: LevelData = {
  id: 32,
  world: 7,
  name: "Luminescent Vaults",
  hint: "Dark lab corridors: Neon glowing crystals illuminate the safe path. Avoid dark spikes!",
  parTime: 34,
  isDarkRoom: true,
  bounds: { width: 4600, height: 720 },
  spawn: { x: 140, y: 560 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 720),
    P('b-right', 4560, 0, 40, 720),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Glowing guide run (0 - 1200)
    P('s1-floor', 40, 640, 380, 40),
    P('s1-pillar-1', 480, 500, 180, 35),
    P('s1-pillar-2', 740, 380, 180, 35),
    P('s1-end', 1000, 640, 240, 40),
    // Section 2: Time-slow corridor (1200 - 2400)
    P('s2-start', 1260, 640, 260, 40),
    P('s2-crumb-1', 1560, 500, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s2-ceil-walk', 1820, 160, 280, 35),
    P('s2-end', 2180, 640, 240, 40),
    // Section 3: Updraft in the dark (2400 - 3550)
    P('s3-start', 2460, 640, 240, 40),
    P('s3-isle-mid', 2800, 440, 220, 35),
    P('s3-high-perch', 3120, 280, 200, 35),
    P('s3-end', 3380, 640, 220, 40),
    // Section 4: Precision flip to portal (3550 - 4600)
    P('s4-start', 3620, 640, 240, 40),
    P('s4-step-1', 3900, 480, 180, 35),
    P('s4-star-shelf', 4060, 140, 180, 30),
    P('s4-exit', 4360, 640, 200, 40),
  ],
  timeSlowPickups: [
    { id: 'ts32-1', x: 1380, y: 580, collected: false, baseY: 580, pulsePhase: 0 },
  ],
  windZones: [
    WIND('wz32-draft', 2700, 80, 400, 560, 200, -260),
  ],
  spikes: [
    SPK('spk32-1', 440, 650, 520, 30, 'UP'),
    SPK('spk32-2', 1560, 650, 580, 30, 'UP'),
    SPK('spk32-3', 2720, 650, 620, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp32-1', 1300, 580, 'DOWN'),
    CP('cp32-2', 2500, 580, 'DOWN'),
    CP('cp32-3', 3660, 580, 'DOWN'),
  ],
  crystals: [
    C('c32-1', 570, 440),
    C('c32-2', 1960, 100),
    C('c32-3', 2910, 380),
    C('c32-4', 3990, 420),
  ],
  starCrystal: STAR('star-32', 4150, 90),
  portal: { x: 4460, y: 560, radius: 44, rotation: 0, active: true },
};

export const LEVEL_33: LevelData = {
  id: 33,
  world: 7,
  name: "Sentinels in the Dark",
  hint: "Patrol drones scan dark corridors! Watch their flight paths and avoid flickering warning lasers.",
  parTime: 36,
  isDarkRoom: true,
  bounds: { width: 4600, height: 740 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 740),
    P('b-right', 4560, 0, 40, 740),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: First drone patrol (0 - 1200)
    P('s1-floor', 40, 660, 400, 40),
    P('s1-low-bench', 480, 520, 180, 35),
    P('s1-ceil-perch', 740, 180, 200, 35),
    P('s1-end', 1040, 660, 220, 40),
    // Section 2: Flickering lasers & drones (1200 - 2400)
    P('s2-start', 1260, 660, 260, 40),
    P('s2-mid-pad', 1560, 500, 200, 35),
    P('s2-crumb-1', 1840, 360, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s2-end', 2180, 660, 240, 40),
    // Section 3: Dual drone evasion (2400 - 3550)
    P('s3-start', 2460, 660, 240, 40),
    P('s3-ceil-traverse', 2760, 180, 300, 35),
    P('s3-step-isle', 3120, 460, 180, 35),
    P('s3-end', 3380, 660, 220, 40),
    // Section 4: Final dark dash to portal (3550 - 4600)
    P('s4-start', 3620, 660, 240, 40),
    P('s4-step-1', 3900, 520, 180, 35),
    P('s4-star-niche', 4060, 140, 180, 30),
    P('s4-exit', 4360, 660, 200, 40),
  ],
  patrolDrones: [
    DRONE('dr33-1', 580, 380, 800, 380, 130),
    DRONE('dr33-2', 1660, 400, 1920, 400, 140),
    DRONE('dr33-3', 2850, 300, 3150, 300, 140),
  ],
  lasers: [
    LSR('lsr33-1', 1700, 40, 1700, 660, { on: 2.0, off: 1.8 }),
    LSR('lsr33-2', 3250, 40, 3250, 660, { on: 1.8, off: 1.8 }),
  ],
  spikes: [
    SPK('spk33-1', 440, 670, 560, 30, 'UP'),
    SPK('spk33-2', 1500, 670, 640, 30, 'UP'),
    SPK('spk33-3', 2680, 670, 660, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp33-1', 1300, 600, 'DOWN'),
    CP('cp33-2', 2500, 600, 'DOWN'),
    CP('cp33-3', 3660, 600, 'DOWN'),
  ],
  crystals: [
    C('c33-1', 570, 460),
    C('c33-2', 1920, 300),
    C('c33-3', 2910, 120),
    C('c33-4', 3990, 460),
  ],
  starCrystal: STAR('star-33', 4150, 90),
  portal: { x: 4460, y: 580, radius: 44, rotation: 0, active: true },
};

export const LEVEL_34: LevelData = {
  id: 34,
  world: 7,
  name: "Bio-Lab Lockdown",
  hint: "Dark research lab: Invert gravity with wall gates while evading sentinel drones and lasers.",
  parTime: 38,
  isDarkRoom: true,
  bounds: { width: 4800, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4760, 0, 40, 760),
    P('b-ceil', 0, 0, 4800, 40),
    // Section 1: Drone corridors & shield (0 - 1300)
    P('s1-floor', 40, 680, 400, 40),
    P('s1-isle-1', 480, 540, 180, 35),
    P('s1-crumb-1', 740, 420, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-end', 1020, 680, 260, 40),
    // Section 2: Gravity gate in the dark (1300 - 2500)
    P('s2-start', 1320, 680, 260, 40),
    P('s2-ceil-runway', 1660, 160, 320, 35),
    P('s2-mid-shelf', 2040, 480, 200, 35),
    P('s2-end', 2300, 680, 240, 40),
    // Section 3: Drone swarm avoidance (2500 - 3700)
    P('s3-start', 2580, 680, 240, 40),
    P('s3-crumb-2', 2880, 520, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-isle-high', 3160, 340, 220, 35),
    P('s3-end', 3460, 680, 240, 40),
    // Section 4: Final lockdown sprint (3700 - 4800)
    P('s4-start', 3720, 680, 240, 40),
    P('s4-step-1', 4020, 540, 180, 35),
    P('s4-star-loft', 4240, 140, 180, 30),
    P('s4-exit', 4540, 680, 220, 40),
  ],
  patrolDrones: [
    DRONE('dr34-1', 560, 420, 780, 420, 130),
    DRONE('dr34-2', 1780, 280, 2020, 280, 140),
    DRONE('dr34-3', 2960, 400, 3240, 400, 140),
    DRONE('dr34-4', 4100, 420, 4340, 420, 130),
  ],
  gravityGates: [
    GATE('gate34-1', 1580, 280, 36, 160, 'UP'),
    GATE('gate34-2', 2180, 400, 36, 160, 'DOWN'),
  ],
  shieldPickups: [
    { id: 'sh34-1', x: 260, y: 600, collected: false, baseY: 600, pulsePhase: 0 },
  ],
  checkpoints: [
    CP('cp34-1', 1360, 620, 'DOWN'),
    CP('cp34-2', 2620, 620, 'DOWN'),
    CP('cp34-3', 3760, 620, 'DOWN'),
  ],
  crystals: [
    C('c34-1', 570, 480),
    C('c34-2', 1820, 100),
    C('c34-3', 3270, 280),
    C('c34-4', 4110, 480),
  ],
  starCrystal: STAR('star-34', 4330, 90),
  portal: { x: 4640, y: 600, radius: 44, rotation: 0, active: true },
};

export const LEVEL_35: LevelData = {
  id: 35,
  world: 7,
  name: "Cyber Hydra Drone",
  hint: "World 7 Boss: Drone chase through dark lab! Sprint under searchlights and outrun laser grids.",
  parTime: 42,
  isDarkRoom: true,
  isBoss: true,
  bossTitle: "CYBER HYDRA DRONE",
  bossIntroText: "WORLD 7 BOSS: Lab surveillance alert! Autonomous sentinel swarm activated in dark lockdown. Evade searchlights and escape!",
  bossType: 'drone_chase',
  bounds: { width: 5000, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4960, 0, 40, 760),
    P('b-ceil', 0, 0, 5000, 40),
    // Section 1: Drone sprint into dark chamber (0 - 1300)
    P('s1-floor', 40, 680, 380, 40),
    P('s1-step-1', 480, 540, 180, 35),
    P('s1-ceil-island', 760, 160, 240, 35),
    P('s1-end', 1060, 680, 240, 40),
    // Section 2: Speed boost drone evasion (1300 - 2600)
    P('s2-start', 1340, 680, 260, 40),
    P('s2-boost-chasm', 1640, 680, 340, 40),
    P('s2-high-bridge', 2040, 380, 240, 35),
    P('s2-end', 2400, 680, 240, 40),
    // Section 3: Intersecting lasers & sentinels (2600 - 3800)
    P('s3-start', 2680, 680, 240, 40),
    P('s3-crumb-1', 2960, 520, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-mid-step', 3240, 380, 200, 35),
    P('s3-end', 3560, 680, 240, 40),
    // Section 4: Final sentinel swarm escape to portal (3800 - 5000)
    P('s4-start', 3840, 680, 240, 40),
    P('s4-step-apex', 4140, 520, 180, 35),
    P('s4-star-nest', 4380, 140, 200, 30),
    P('s4-boss-exit', 4680, 680, 240, 40),
  ],
  patrolDrones: [
    DRONE('dr35-1', 560, 400, 840, 400, 150),
    DRONE('dr35-2', 1740, 480, 2040, 480, 160),
    DRONE('dr35-3', 2760, 360, 3080, 360, 160),
    DRONE('dr35-4', 4200, 380, 4480, 380, 160),
  ],
  lasers: [
    LSR('lsr35-1', 1880, 40, 1880, 680, { on: 1.8, off: 1.8 }),
    LSR('lsr35-2', 3400, 40, 3400, 680, { on: 1.8, off: 1.8 }),
  ],
  boostStrips: [
    BOOST('boost35-1', 1640, 672, 340, 8, 'RIGHT', 720),
  ],
  timeSlowPickups: [
    { id: 'ts35-1', x: 2780, y: 620, collected: false, baseY: 620, pulsePhase: 0 },
  ],
  checkpoints: [
    CP('cp35-1', 1380, 620, 'DOWN'),
    CP('cp35-2', 2720, 620, 'DOWN'),
    CP('cp35-3', 3880, 620, 'DOWN'),
  ],
  crystals: [
    C('c35-1', 570, 480),
    C('c35-2', 2160, 320),
    C('c35-3', 3340, 320),
    C('c35-4', 4230, 460),
  ],
  starCrystal: STAR('star-35', 4480, 90),
  portal: { x: 4800, y: 600, radius: 46, rotation: 0, active: true },
};

// ============================================================================
// WORLD 8: CHAOS CORE (LEVELS 36–40)
// Crimson/Purple Singularity Theme - Everything combined, 3.0s auto-chaos gravity
// ============================================================================

export const LEVEL_36: LevelData = {
  id: 36,
  world: 8,
  name: "Singularity Nexus",
  hint: "Breather run: Multi-direction gravity gates! Run along walls, warp through teleporters.",
  parTime: 35,
  storyIntro: {
    worldName: "WORLD 8: CHAOS CORE",
    lines: [
      "The reactor core singularity collapses local gravitational physics.",
      "Omni-directional gravity gates, spatial warps, and quantum fluctuations emerge.",
      "Synchronize every learned reflex to conquer the singularity.",
    ],
  },
  bounds: { width: 4600, height: 740 },
  spawn: { x: 140, y: 580 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 740),
    P('b-right', 4560, 0, 40, 740),
    P('b-ceil', 0, 0, 4600, 40),
    // Section 1: Left wall gravity gate (0 - 1200)
    P('s1-floor', 40, 660, 400, 40),
    P('s1-vert-wall', 760, 160, 40, 500),
    P('s1-end', 1060, 660, 240, 40),
    // Section 2: Teleporter transit (1200 - 2400)
    P('s2-start', 1260, 660, 260, 40),
    P('s2-tele-aisle', 1580, 500, 180, 35),
    P('s2-ceil-destination', 1900, 160, 280, 35),
    P('s2-end', 2220, 660, 240, 40),
    // Section 3: Right wall gravity gate (2400 - 3550)
    P('s3-start', 2480, 660, 240, 40),
    P('s3-vert-wall-r', 2880, 160, 40, 500),
    P('s3-step-mid', 3140, 420, 180, 35),
    P('s3-end', 3380, 660, 220, 40),
    // Section 4: Boost strip to portal (3550 - 4600)
    P('s4-start', 3620, 660, 240, 40),
    P('s4-boost-conduit', 3900, 660, 280, 40),
    P('s4-star-niche', 4060, 140, 180, 30),
    P('s4-exit', 4360, 660, 200, 40),
  ],
  gravityGates: [
    GATE('gate36-1', 660, 480, 36, 160, 'LEFT'),
    GATE('gate36-2', 920, 300, 36, 160, 'DOWN'),
    GATE('gate36-3', 2760, 480, 36, 160, 'RIGHT'),
    GATE('gate36-4', 3020, 240, 36, 160, 'DOWN'),
  ],
  teleporters: [
    TELE('tp36-1a', 'pair36', 1640, 436, '#A855F7'),
    TELE('tp36-1b', 'pair36', 1980, 196, '#A855F7'),
  ],
  boostStrips: [
    BOOST('boost36-1', 3900, 652, 280, 8, 'RIGHT', 720),
  ],
  checkpoints: [
    CP('cp36-1', 1300, 600, 'DOWN'),
    CP('cp36-2', 2520, 600, 'DOWN'),
    CP('cp36-3', 3660, 600, 'DOWN'),
  ],
  crystals: [
    C('c36-1', 780, 380),
    C('c36-2', 2020, 100),
    C('c36-3', 2900, 320),
    C('c36-4', 4040, 580),
  ],
  starCrystal: STAR('star-36', 4150, 90),
  portal: { x: 4460, y: 580, radius: 44, rotation: 0, active: true },
};

export const LEVEL_37: LevelData = {
  id: 37,
  world: 8,
  name: "Quantum Lattice",
  hint: "4+ mechanics combined! Ice slides, teleporters, switches, and laser barriers.",
  parTime: 38,
  bounds: { width: 4800, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4760, 0, 40, 760),
    P('b-ceil', 0, 0, 4800, 40),
    // Section 1: Ice slide into teleporter (0 - 1300)
    P('s1-floor', 40, 680, 380, 40),
    P('s1-ice-chute', 460, 680, 340, 40, { surfaceType: 'ice' }),
    P('s1-tele-pod', 840, 520, 160, 35),
    P('s1-end', 1060, 680, 240, 40),
    // Section 2: Switch & door across void (1300 - 2500)
    P('s2-start', 1340, 680, 260, 40),
    P('s2-moving-bridge', 1660, 520, 180, 35, { isMoving: true, moveAxis: 'X', moveRange: 160, moveSpeed: 90 }),
    P('s2-ceil-switch', 2000, 160, 220, 35),
    P('s2-end', 2300, 680, 240, 40),
    // Section 3: Wall gravity saw maze (2500 - 3700)
    P('s3-start', 2580, 680, 240, 40),
    P('s3-vert-wall', 2940, 160, 40, 520),
    P('s3-crumb-1', 3180, 380, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-end', 3460, 680, 240, 40),
    // Section 4: Secret portal passage (3700 - 4800)
    P('s4-start', 3720, 680, 240, 40),
    P('s4-step-1', 4020, 540, 180, 35),
    P('s4-star-cubicle', 4260, 140, 180, 30),
    P('s4-exit', 4540, 680, 220, 40),
  ],
  teleporters: [
    TELE('tp37-1a', 'pair37', 880, 456, '#A855F7'),
    TELE('tp37-1b', 'pair37', 1400, 616, '#A855F7'),
  ],
  switches: [
    SW('sw37-1', 2080, 178, 'dr37-1', '#E11D48'),
  ],
  doors: [
    DR('dr37-1', 2240, 400, 40, 280, '#E11D48'),
  ],
  sawBlades: [
    SAW('saw37-1', 2820, 440, 44, { sx: 2720, sy: 440, ex: 2920, ey: 440 }),
  ],
  gravityGates: [
    GATE('gate37-1', 2840, 340, 36, 160, 'LEFT'),
    GATE('gate37-2', 3080, 200, 36, 160, 'DOWN'),
  ],
  checkpoints: [
    CP('cp37-1', 1380, 620, 'DOWN'),
    CP('cp37-2', 2620, 620, 'DOWN'),
    CP('cp37-3', 3760, 620, 'DOWN'),
  ],
  crystals: [
    C('c37-1', 630, 600),
    C('c37-2', 1750, 460),
    C('c37-3', 3260, 320),
    C('c37-4', 4110, 480),
  ],
  starCrystal: STAR('star-37', 4350, 90),
  portal: { x: 4640, y: 600, radius: 44, rotation: 0, active: true },
};

export const LEVEL_38: LevelData = {
  id: 38,
  world: 8,
  name: "Chaos Inversion",
  hint: "Periodic gravity chaos: Gravity auto-inverts every 3 seconds! Watch the timer and beware fake paths.",
  parTime: 40,
  chaosGravityInterval: 3.0,
  bounds: { width: 4800, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4760, 0, 40, 760),
    P('b-ceil', 0, 0, 4800, 40),
    // Section 1: Auto-inversion timing corridor (0 - 1300)
    P('s1-floor', 40, 680, 380, 40),
    P('s1-ceil-island', 480, 160, 320, 35),
    P('s1-mid-chasm', 820, 440, 200, 35),
    P('s1-end', 1060, 680, 240, 40),
    // Section 2: Crumbling bridge under chaos flip (1300 - 2500)
    P('s2-start', 1340, 680, 260, 40),
    P('s2-cr-1', 1640, 540, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s2-cr-ceil', 1900, 160, 180, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s2-end', 2220, 680, 240, 40),
    // Section 3: Trap path vs genuine path (2500 - 3700)
    P('s3-start', 2560, 680, 240, 40),
    P('s3-trap-lower', 2840, 680, 180, 40), // fake path
    P('s3-real-upper', 2860, 240, 240, 35), // genuine path
    P('s3-mid-pad', 3180, 420, 180, 35),
    P('s3-end', 3460, 680, 240, 40),
    // Section 4: Final chaos sprint (3700 - 4800)
    P('s4-start', 3720, 680, 240, 40),
    P('s4-step-1', 4020, 540, 180, 35),
    P('s4-star-perch', 4260, 140, 180, 30),
    P('s4-exit', 4540, 680, 220, 40),
  ],
  spikes: [
    SPK('spk38-1', 460, 690, 580, 30, 'UP'),
    SPK('spk38-2', 1580, 690, 600, 30, 'UP'),
    SPK('spk38-trap', 3020, 690, 420, 30, 'UP'),
  ],
  checkpoints: [
    CP('cp38-1', 1380, 620, 'DOWN'),
    CP('cp38-2', 2600, 620, 'DOWN'),
    CP('cp38-3', 3760, 620, 'DOWN'),
  ],
  crystals: [
    C('c38-1', 640, 100),
    C('c38-2', 1720, 480),
    C('c38-3', 2980, 180),
    C('c38-4', 4110, 480),
  ],
  starCrystal: STAR('star-38', 4350, 90),
  portal: { x: 4640, y: 600, radius: 44, rotation: 0, active: true },
};

export const LEVEL_39: LevelData = {
  id: 39,
  world: 8,
  name: "Paradox Rift",
  hint: "Intense chaos: 3.0s auto-gravity shifts, crosswinds, and moving saws! Fake portal on lower floor.",
  parTime: 44,
  chaosGravityInterval: 3.0,
  bounds: { width: 5000, height: 760 },
  spawn: { x: 140, y: 600 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP'],
  platforms: [
    P('b-left', 0, 0, 40, 760),
    P('b-right', 4960, 0, 40, 760),
    P('b-ceil', 0, 0, 5000, 40),
    // Section 1: Wind & chaos gravity chamber (0 - 1350)
    P('s1-floor', 40, 680, 380, 40),
    P('s1-ceil-island', 480, 160, 320, 35),
    P('s1-mid-chasm', 840, 440, 200, 35),
    P('s1-end', 1100, 680, 240, 40),
    // Section 2: Timed switch under chaos shifts (1350 - 2650)
    P('s2-start', 1380, 680, 260, 40),
    P('s2-tele-isle', 1700, 520, 180, 35),
    P('s2-ceil-dest', 2040, 160, 240, 35),
    P('s2-end', 2440, 680, 240, 40),
    // Section 3: Moving saws synchronized with chaos (2650 - 3850)
    P('s3-start', 2720, 680, 240, 40),
    P('s3-crumb-1', 3020, 520, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s3-high-aisle', 3280, 340, 220, 35),
    P('s3-end', 3600, 680, 240, 40),
    // Section 4: High anti-gravity dais (real portal) (3850 - 5000)
    P('s4-start', 3880, 680, 240, 40),
    P('s4-step-1', 4160, 520, 180, 35),
    P('s4-high-dais', 4480, 280, 240, 35),
    P('s4-star-shelf', 4420, 120, 180, 30),
    P('s4-exit-pedestal', 4720, 280, 220, 40),
  ],
  windZones: [
    WIND('wz39-chaos', 500, 80, 600, 600, 420, -40),
  ],
  teleporters: [
    TELE('tp39-1a', 'pair39', 1760, 456, '#A855F7'),
    TELE('tp39-1b', 'pair39', 2120, 196, '#A855F7'),
  ],
  sawBlades: [
    SAW('saw39-1', 2900, 600, 46, { sx: 2800, sy: 600, ex: 3000, ey: 600 }),
    SAW('saw39-2', 3420, 440, 46, { sx: 3320, sy: 440, ex: 3520, ey: 440 }),
  ],
  checkpoints: [
    CP('cp39-1', 1420, 620, 'DOWN'),
    CP('cp39-2', 2760, 620, 'DOWN'),
    CP('cp39-3', 3920, 620, 'DOWN'),
  ],
  crystals: [
    C('c39-1', 640, 100),
    C('c39-2', 1800, 460),
    C('c39-3', 3390, 280),
    C('c39-4', 4250, 460),
  ],
  starCrystal: STAR('star-39', 4510, 70),
  portal: { x: 4830, y: 200, radius: 46, rotation: 0, active: true },
};

export const LEVEL_40: LevelData = {
  id: 40,
  world: 8,
  name: "The Graviton Singularity",
  hint: "FINAL BOSS: Master every reflex! Rising singularity floor, chaos shifts, and multi-gravity gates.",
  parTime: 48,
  isBoss: true,
  bossTitle: "THE GRAVITON SINGULARITY",
  bossIntroText: "FINAL BOSS: THE SINGULARITY. The gravity engine has gone supercritical. All physics anomalies converge. Master every reflex to escape the facility!",
  bossType: 'chaos_gravity',
  risingFloor: { active: true, y: 780, startY: 780, speed: 21 },
  chaosGravityInterval: 3.0,
  bounds: { width: 5400, height: 780 },
  spawn: { x: 140, y: 620 },
  initialGravity: 'DOWN',
  allowedGravity: ['DOWN', 'UP', 'LEFT', 'RIGHT'],
  platforms: [
    P('b-left', 0, 0, 40, 780),
    P('b-right', 5360, 0, 40, 780),
    P('b-ceil', 0, 0, 5400, 40),
    // Section 1: Rising singularity floor ascent (0 - 1150)
    P('s1-floor', 40, 700, 360, 40),
    P('s1-cr-ramp', 440, 620, 180, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s1-mid-isle', 680, 500, 200, 35),
    P('s1-end', 940, 460, 220, 35),
    // Section 2: Chaos gravity inversion & saws (1150 - 2250)
    P('s2-start', 1240, 520, 240, 35),
    P('s2-ceil-run', 1540, 160, 280, 35),
    P('s2-mid-pad', 1880, 460, 180, 35),
    P('s2-end', 2140, 500, 220, 35),
    // Section 3: Wall gravity gate into warp (2250 - 3350)
    P('s3-start', 2420, 520, 240, 35),
    P('s3-vert-wall', 2760, 160, 40, 480),
    P('s3-warp-pedestal', 3000, 420, 180, 35),
    P('s3-end', 3240, 500, 220, 35),
    // Section 4: Timed switch & ice conduit (3350 - 4450)
    P('s4-start', 3520, 500, 240, 35),
    P('s4-ice-slide', 3820, 500, 280, 35, { surfaceType: 'ice' }),
    P('s4-boost-corridor', 4140, 500, 240, 35),
    P('s4-end', 4420, 480, 220, 35),
    // Section 5: The Ultimate Escape Portal (4450 - 5400)
    P('s5-start', 4680, 480, 240, 35),
    P('s5-apex-cr-1', 4960, 420, 160, 30, { isCrumbling: true, crumbleState: 'idle' }),
    P('s5-star-eye', 5100, 160, 180, 30),
    P('s5-escape-dais', 5180, 420, 180, 40),
  ],
  sawBlades: [
    SAW('saw40-1', 1700, 460, 46, { sx: 1600, sy: 460, ex: 1800, ey: 460 }),
    SAW('saw40-2', 3700, 420, 46, { sx: 3600, sy: 420, ex: 3800, ey: 420 }),
  ],
  gravityGates: [
    GATE('gate40-1', 2640, 400, 36, 160, 'LEFT'),
    GATE('gate40-2', 2900, 240, 36, 160, 'DOWN'),
  ],
  teleporters: [
    TELE('tp40-1a', 'pair40', 3060, 356, '#A855F7'),
    TELE('tp40-1b', 'pair40', 3580, 436, '#A855F7'),
  ],
  boostStrips: [
    BOOST('boost40-1', 4140, 492, 240, 8, 'RIGHT', 750),
  ],
  timeSlowPickups: [
    { id: 'ts40-1', x: 4720, y: 420, collected: false, baseY: 420, pulsePhase: 0 },
  ],
  checkpoints: [
    CP('cp40-1', 1280, 460, 'DOWN'),
    CP('cp40-2', 2460, 460, 'DOWN'),
    CP('cp40-3', 3560, 440, 'DOWN'),
    CP('cp40-4', 4720, 420, 'DOWN'),
  ],
  crystals: [
    C('c40-1', 780, 440),
    C('c40-2', 1980, 400),
    C('c40-3', 3120, 360),
    C('c40-4', 4260, 440),
    C('c40-5', 5040, 360),
  ],
  starCrystal: STAR('star-40', 5190, 100),
  portal: { x: 5270, y: 340, radius: 48, rotation: 0, active: true },
};

// ============================================================================
// STAGE D EXPORT: LEVELS 21 TO 40
// ============================================================================
export const STAGE_D_LEVELS: LevelData[] = [
  LEVEL_21, LEVEL_22, LEVEL_23, LEVEL_24, LEVEL_25,
  LEVEL_26, LEVEL_27, LEVEL_28, LEVEL_29, LEVEL_30,
  LEVEL_31, LEVEL_32, LEVEL_33, LEVEL_34, LEVEL_35,
  LEVEL_36, LEVEL_37, LEVEL_38, LEVEL_39, LEVEL_40,
];

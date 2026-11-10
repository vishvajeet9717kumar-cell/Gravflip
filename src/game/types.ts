export type GravityDirection = 'DOWN' | 'UP' | 'LEFT' | 'RIGHT';

export interface Vector2D {
  x: number;
  y: number;
}

export type OrbExpression = 'normal' | 'happy' | 'scared' | 'blink';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  onGround: boolean;
  wasOnGround: boolean;
  lastVy: number;
  gravityDir: GravityDirection;
  color: string;
  glowColor: string;
  trail: { x: number; y: number; alpha: number; size: number }[];
  flipAnimProgress: number; // 0 to 1 for visual gravity arrow flip
  
  // Expressive faces & Squash/Stretch
  squashX: number;
  squashY: number;
  expression: OrbExpression;
  expressionTimer: number;
  facingDir: number; // 1 = right, -1 = left
  blinkTimer: number;
  
  // Stage A movement states
  isStuckToWall: boolean;
  boostTimer: number;
  teleportCooldown: number;

  // Stage B checkpoint & respawn states
  respawnX: number;
  respawnY: number;
  respawnGravity: GravityDirection;

  // Stage C Collectibles & Risk/Reward states
  hasShield?: boolean;
  shieldPulsePhase?: number;
  extraFlips?: number;
  invulnerableTimer?: number;
  timeSlowTimer?: number;
  comboCount?: number;
  comboTimer?: number;
  hasStarCrystal?: boolean;

  // Stage D Boss & Secret states
  chaosTimer?: number;
  nextChaosGravity?: GravityDirection;
  secretsDiscovered?: number;

  // Stage E Death Tracker & PB states
  deathCount?: number;
  lastDeathX?: number;
  lastDeathY?: number;

  // Character Visual Animation States
  visualAngle?: number;
  runCycle?: number;
  landingTimer?: number;
  isNearHazard?: boolean;

  // Portal completion suction
  suckedIntoPortal: boolean;
  portalSuckProgress: number; // 0 to 1
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  borderColor?: string;
  label?: string;
  isSolid?: boolean;
  isMoving?: boolean;
  moveAxis?: 'X' | 'Y';
  moveRange?: number;
  moveSpeed?: number;
  startX?: number;
  startY?: number;
  movePhase?: number;
  railStartX?: number;
  railStartY?: number;
  railEndX?: number;
  railEndY?: number;
  
  // Stage A platform modifiers
  surfaceType?: 'normal' | 'sticky' | 'ice';
  isCrumbling?: boolean;
  crumbleTimer?: number;       // counts down 0.5s once touched
  crumbleRespawnTimer?: number;// counts down 3.0s once broken
  crumbleState?: 'idle' | 'breaking' | 'broken';
  shakeOffset?: number;
}

// Stage A Entities
export interface GravityGate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: GravityDirection;
}

export interface Teleporter {
  id: string;
  pairId: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  exitDirX?: number;
  exitDirY?: number;
}

export interface BouncePad {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: GravityDirection;
  force: number;
  squashTimer?: number;
}

export interface SpeedBoostStrip {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN';
  speed: number;
}

export interface GravityZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'LOW' | 'HEAVY';
  multiplier: number;
}

export interface WindZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number;
  forceY: number;
}

export interface Switch {
  id: string;
  targetDoorId: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPressed: boolean;
  timedDuration?: number;
  timer?: number;
}

export interface Door {
  id: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  openProgress: number;
}

export interface Crate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  onGround: boolean;
  color?: string;
}

export interface MagnetField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  strength: number;
}

// Stage B Entities: Hazards & Enemies
export interface Spike {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: GravityDirection; // pointing UP, DOWN, LEFT, RIGHT
  isToggling?: boolean;
  toggleInterval?: number;     // seconds between active/inactive
  timer?: number;
  isActive: boolean;
  retractProgress?: number;    // 0 = retracted, 1 = fully extended
}

export interface Laser {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  isTimed?: boolean;
  onDuration?: number;
  offDuration?: number;
  flickerDuration?: number;    // 0.6s warning flicker before firing
  timer?: number;
  isFlickering?: boolean;
  isRotating?: boolean;
  pivotX?: number;
  pivotY?: number;
  length?: number;
  angle?: number;
  rotSpeed?: number;           // rad/sec
}

export interface SawBlade {
  id: string;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  rotSpeed?: number;
  pathStartX?: number;
  pathStartY?: number;
  pathEndX?: number;
  pathEndY?: number;
  speed?: number;
  progress?: number;
  dir?: number; // 1 or -1
}

export interface PatrolDrone {
  id: string;
  x: number;
  y: number;
  radius: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  progress: number;
  dir: number; // 1 or -1
  hoverPhase?: number;
}

export interface FallingBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  triggerDistance: number;
  state: 'idle' | 'shaking' | 'falling' | 'landed';
  shakeTimer: number; // 0.4s warning shake before dropping
  vy: number;
  startY: number;
  shakeOffset?: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
  respawnGravity: GravityDirection;
}

export interface Crystal {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  baseY: number;
  pulsePhase: number;
  isStar?: boolean; // Stage C: Rare golden star crystal
}

// Stage C Pickups
export interface TimeSlowPickup {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  baseY: number;
  pulsePhase: number;
}

export interface ShieldPickup {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  baseY: number;
  pulsePhase: number;
}

export interface DoubleFlipPickup {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  baseY: number;
  pulsePhase: number;
}

export interface Portal {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  width: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
  life: number;
  maxLife: number;
}

export interface WorldTheme {
  id: number;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  bgDark: string;
  bgGrid: string;
  platformBase: string;
  platformBorder: string;
  platformGlow: string;
  boltColor: string;
  starColors: string[];
}

// Stage D: Secret Passages & Rooms
export interface SecretPassage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  revealed: boolean;
  bonusCrystals?: Crystal[];
  label?: string;
}

export interface RisingFloor {
  active: boolean;
  y: number;
  speed: number;
  startY: number;
}

export interface LevelData {
  id: number;
  world: number;
  name: string;
  hint?: string;
  parTime: number;
  spawn: { x: number; y: number };
  initialGravity: GravityDirection;
  allowedGravity: GravityDirection[];
  platforms: Platform[];
  crystals: Crystal[];
  portal: Portal;
  bounds: { width: number; height: number };

  // Stage A Entities
  gravityGates?: GravityGate[];
  teleporters?: Teleporter[];
  bouncePads?: BouncePad[];
  boostStrips?: SpeedBoostStrip[];
  gravityZones?: GravityZone[];
  windZones?: WindZone[];
  switches?: Switch[];
  doors?: Door[];
  crates?: Crate[];
  magnets?: MagnetField[];

  // Stage B Entities
  isDarkRoom?: boolean;
  spikes?: Spike[];
  lasers?: Laser[];
  sawBlades?: SawBlade[];
  patrolDrones?: PatrolDrone[];
  fallingBlocks?: FallingBlock[];
  checkpoints?: Checkpoint[];

  // Stage C Entities
  starCrystal?: Crystal;
  timeSlowPickups?: TimeSlowPickup[];
  shieldPickups?: ShieldPickup[];
  doubleFlipPickups?: DoubleFlipPickup[];

  // Stage D Entities: Bosses, Secret Rooms & Story
  isBoss?: boolean;
  bossTitle?: string;
  bossIntroText?: string;
  bossType?: 'sweeping_laser' | 'rising_floor' | 'saw_gauntlet' | 'chaos_gravity' | 'drone_chase' | 'blizzard_storm' | 'crusher_factory' | 'dark_sentinel';
  risingFloor?: RisingFloor;
  chaosGravityInterval?: number; // e.g. 3.0s or 3.5s auto-gravity-inversion
  secretPassages?: SecretPassage[];
  storyIntro?: {
    worldName: string;
    lines: string[];
  } | string;
}

export interface InputState {
  left: boolean;
  right: boolean;
  flipRequested: boolean;
}

export type GameStatus = 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETED' | 'GAME_OVER';

export type GameMode = 'STANDARD' | 'ENDLESS' | 'DAILY' | 'TIME_ATTACK';

export type AppScreen = 'MAIN_MENU' | 'LEVEL_SELECT' | 'GAME' | 'ENDLESS_GAME';

export interface OrbSkin {
  id: string;
  name: string;
  cost: number;
  primary: string;
  secondary: string;
  glow: string;
  description: string;
  trailStyle?: 'standard' | 'robot' | 'ghost' | 'planet' | 'fireball';
}

export interface LevelProgress {
  unlocked: boolean;
  stars: number; // 0 to 3
  bestTime: number | null;
  crystalsCollected: number;
  hasStarCrystal?: boolean;
}

export interface DailyRewardState {
  lastClaimDate: string; // YYYY-MM-DD
  dayStreak: number;
  claimedToday: boolean;
}

// Stage E: Ghost Run Trajectory Data
export interface GhostSample {
  t: number; // timestamp in seconds
  x: number;
  y: number;
  vx: number;
  vy: number;
  dir: GravityDirection;
  sqX?: number;
  sqY?: number;
}

export interface GhostRun {
  levelId: number;
  time: number;
  samples: GhostSample[];
}

// Stage E: Achievements Data
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progression' | 'skill' | 'secrets' | 'mastery';
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardCrystals: number;
}

// Stage E: Endless Mode State
export interface EndlessStats {
  distance: number;       // In meters
  roomsCleared: number;
  crystalsCollected: number;
  highScore: number;
}

// Stage E: Daily Challenge Configuration
export interface DailyChallengeInfo {
  date: string;
  levelId: number;
  modifierTitle: string;
  modifierDesc: string;
  reward: number;
  completed: boolean;
  bestTime?: number;
  streak: number;
}

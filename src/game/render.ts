import {
  Player,
  Platform,
  Crystal,
  Portal,
  Particle,
  Shockwave,
  FloatingText,
  WorldTheme,
  GravityGate,
  Teleporter,
  BouncePad,
  SpeedBoostStrip,
  GravityZone,
  WindZone,
  Switch,
  Door,
  Crate,
  MagnetField,
  Spike,
  Laser,
  SawBlade,
  PatrolDrone,
  FallingBlock,
  Checkpoint,
  TimeSlowPickup,
  ShieldPickup,
  DoubleFlipPickup,
  SecretPassage,
  RisingFloor,
  GhostSample,
} from './types';
import { HintWaypoint } from './hint';
import { lineAABBIntersection } from './physics';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  gameWidth: number;
  gameHeight: number;
  screenShake: { x: number; y: number };
  colorFlash: { color: string; alpha: number };
  theme: WorldTheme;
}

export interface StageRenderEntities {
  // Stage A
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

  // Stage B
  isDarkRoom?: boolean;
  spikes?: Spike[];
  lasers?: Laser[];
  sawBlades?: SawBlade[];
  patrolDrones?: PatrolDrone[];
  fallingBlocks?: FallingBlock[];
  checkpoints?: Checkpoint[];

  // Stage C
  starCrystal?: Crystal;
  timeSlowPickups?: TimeSlowPickup[];
  shieldPickups?: ShieldPickup[];
  doubleFlipPickups?: DoubleFlipPickup[];

  // Stage D: Bosses & Secret Rooms
  risingFloor?: RisingFloor;
  secretPassages?: SecretPassage[];

  // Stage E: Ghost Run, Hints & Custom Trails
  ghostSample?: GhostSample | null;
  hintWaypoints?: HintWaypoint[] | null;
  hintActive?: boolean;
  trailStyle?: 'standard' | 'robot' | 'ghost' | 'planet' | 'fireball';
}

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  layer: number;
  colorIdx: number;
  phase: number;
}

let cachedStars: Star[] | null = null;
function getStars(width: number, height: number): Star[] {
  if (cachedStars) return cachedStars;
  cachedStars = [];
  for (let i = 0; i < 48; i++) {
    cachedStars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.2,
      speed: 8 + Math.random() * 16,
      layer: Math.random() > 0.5 ? 1 : 2,
      colorIdx: Math.floor(Math.random() * 3),
      phase: Math.random() * Math.PI * 2,
    });
  }
  return cachedStars;
}

export function renderGame(
  r: RenderContext,
  player: Player,
  platforms: Platform[],
  crystals: Crystal[],
  portal: Portal,
  particles: Particle[],
  shockwaves: Shockwave[],
  floatingTexts: FloatingText[],
  elapsedTime: number,
  entities: StageRenderEntities = {}
): void {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    scale,
    offsetX,
    offsetY,
    gameWidth,
    gameHeight,
    screenShake,
    theme,
  } = r;

  // Clear outer canvas
  ctx.fillStyle = theme.bgDark;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Apply camera transform with screen shake
  ctx.save();
  ctx.translate(offsetX + screenShake.x, offsetY + screenShake.y);
  ctx.scale(scale, scale);

  // Viewport culling bounds in world units (maintains locked 60 FPS in 3x-5x wide worlds)
  const cullingPad = 120;
  const viewMinX = (-offsetX) / scale - cullingPad;
  const viewMaxX = (canvasWidth - offsetX) / scale + cullingPad;
  const viewMinY = (-offsetY) / scale - cullingPad;
  const viewMaxY = (canvasHeight - offsetY) / scale + cullingPad;
  const viewBounds = { minX: viewMinX, maxX: viewMaxX, minY: viewMinY, maxY: viewMaxY };

  // 1. Draw Themed Background with Animated Parallax Stars & Grid
  drawThemedBackground(ctx, gameWidth, gameHeight, elapsedTime, theme);

  // 2. Draw Stage A Environmental Zones
  if (entities.gravityZones) drawGravityZones(ctx, entities.gravityZones, elapsedTime);
  if (entities.windZones) drawWindZones(ctx, entities.windZones, elapsedTime);
  if (entities.magnets) drawMagnetFields(ctx, entities.magnets, elapsedTime);

  // 3. Draw Stage A Speed Boost Strips
  if (entities.boostStrips) drawBoostStrips(ctx, entities.boostStrips, elapsedTime);

  // 4. Draw Platforms & Rails (with viewport culling)
  drawPlatforms(ctx, platforms, theme, elapsedTime, viewBounds);

  // 5. Draw Stage B Checkpoints (with viewport culling)
  if (entities.checkpoints) drawCheckpoints(ctx, entities.checkpoints, elapsedTime, viewBounds);

  // 6. Draw Stage A Interactive Mechanics
  if (entities.switches) drawSwitches(ctx, entities.switches, elapsedTime);
  if (entities.doors) drawDoors(ctx, entities.doors, theme);
  if (entities.bouncePads) drawBouncePads(ctx, entities.bouncePads, theme, viewBounds);
  if (entities.gravityGates) drawGravityGates(ctx, entities.gravityGates, elapsedTime, theme);
  if (entities.teleporters) drawTeleporters(ctx, entities.teleporters, elapsedTime);
  if (entities.crates) drawCrates(ctx, entities.crates);

  // 7. Draw Stage B Hazards & Enemies
  if (entities.fallingBlocks) drawFallingBlocks(ctx, entities.fallingBlocks);
  if (entities.spikes) drawSpikes(ctx, entities.spikes, elapsedTime, viewBounds);
  if (entities.sawBlades) drawSawBlades(ctx, entities.sawBlades, elapsedTime);
  if (entities.patrolDrones) drawPatrolDrones(ctx, entities.patrolDrones, elapsedTime);
  if (entities.lasers) drawLasers(ctx, entities.lasers, elapsedTime, entities.crates, platforms);

  // 8. Draw Swirling Exit Portal
  drawPortal(ctx, portal, elapsedTime, theme);

  // 9. Draw Crystals & Stage C Golden Star Crystal (with viewport culling)
  drawCrystals(ctx, crystals, elapsedTime, theme, viewBounds);
  if (entities.starCrystal) drawStarCrystal(ctx, entities.starCrystal, elapsedTime);

  // 10. Draw Stage C Pickups (Time Slow, Shield, Double Flip)
  if (entities.timeSlowPickups) drawTimeSlowPickups(ctx, entities.timeSlowPickups, elapsedTime);
  if (entities.shieldPickups) drawShieldPickups(ctx, entities.shieldPickups, elapsedTime);
  if (entities.doubleFlipPickups) drawDoubleFlipPickups(ctx, entities.doubleFlipPickups, elapsedTime);

  // Stage D: Secret Passages
  if (entities.secretPassages) drawSecretPassages(ctx, entities.secretPassages, elapsedTime, theme);

  // Stage D: Rising Danger Floor
  if (entities.risingFloor && entities.risingFloor.active) {
    drawRisingFloor(ctx, entities.risingFloor, gameWidth, gameHeight, elapsedTime);
  }

  // 11. Draw Particles
  drawParticles(ctx, particles);

  // 12. Draw Shockwaves
  drawShockwaves(ctx, shockwaves);

  // Stage E: Hint Path Preview
  if (entities.hintActive && entities.hintWaypoints && entities.hintWaypoints.length > 1) {
    drawHintPath(ctx, entities.hintWaypoints, elapsedTime);
  }

  // Stage E: Ghost Run Replay
  if (entities.ghostSample) {
    drawGhostOrb(ctx, entities.ghostSample, elapsedTime);
  }

  // 13. Draw Player Orb with Expressive Eyes, Squash/Stretch, Trail & Custom Skin Trail
  drawPlayer(ctx, player, elapsedTime, theme, entities.trailStyle);

  // 14. Stage B: Dark Room Spotlight Overlay
  if (entities.isDarkRoom) {
    drawDarkRoomOverlay(ctx, player, gameWidth, gameHeight, elapsedTime);
  }

  // 15. Stage C: Time Slow Screen Vignette
  if (player.timeSlowTimer && player.timeSlowTimer > 0) {
    drawTimeSlowVignette(ctx, gameWidth, gameHeight, player.timeSlowTimer);
  }

  // 16. Draw Floating Texts
  drawFloatingTexts(ctx, floatingTexts);

  ctx.restore();

  // 17. Exit Indicator Arrow at Screen Edge pointing toward the Exit Portal
  drawExitArrowIndicator(
    ctx,
    portal,
    player,
    scale,
    offsetX,
    offsetY,
    canvasWidth,
    canvasHeight,
    theme,
    elapsedTime
  );
}

function drawThemedBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  theme: WorldTheme
): void {
  ctx.fillStyle = theme.bgDark;
  ctx.fillRect(0, 0, width, height);

  const stars = getStars(width, height);
  for (const star of stars) {
    const twinkle = 0.4 + 0.6 * Math.sin(time * 2 + star.phase);
    const starY = (star.y + time * star.speed * (star.layer === 1 ? 0.4 : 0.8)) % height;
    ctx.fillStyle = theme.starColors[star.colorIdx % theme.starColors.length];
    ctx.globalAlpha = (star.layer === 1 ? 0.35 : 0.7) * twinkle;
    ctx.beginPath();
    ctx.arc(star.x, starY, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  const gridSize = 45;
  ctx.strokeStyle = theme.bgGrid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  platforms: Platform[],
  theme: WorldTheme,
  time: number,
  viewBounds?: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  for (const plat of platforms) {
    if (viewBounds) {
      if (
        plat.x + plat.width < viewBounds.minX ||
        plat.x > viewBounds.maxX ||
        plat.y + plat.height < viewBounds.minY ||
        plat.y > viewBounds.maxY
      ) {
        continue;
      }
    }

    if (plat.isCrumbling && plat.crumbleState === 'broken') {
      const respawnPct = 1 - (plat.crumbleRespawnTimer || 0) / 3.0;
      ctx.save();
      ctx.globalAlpha = 0.2 + respawnPct * 0.25;
      ctx.strokeStyle = '#FFB86C';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
      ctx.setLineDash([]);
      ctx.restore();
      continue;
    }

    const shakeX = plat.shakeOffset || 0;
    ctx.save();
    ctx.translate(shakeX, 0);

    if (plat.surfaceType === 'ice') {
      ctx.fillStyle = '#102A36';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.strokeStyle = '#7FE5FF';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x + 1, plat.y + 1, plat.width - 2, plat.height - 2);

      ctx.strokeStyle = '#BAF7FF';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(plat.x + 4, plat.y);
      ctx.lineTo(plat.x + plat.width - 4, plat.y);
      ctx.stroke();

      for (let i = 20; i < plat.width - 10; i += 30) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(plat.x + i, plat.y + 2, 2, 2);
      }
    } else if (plat.surfaceType === 'sticky') {
      ctx.fillStyle = '#2B1C0B';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x + 1, plat.y + 1, plat.width - 2, plat.height - 2);

      for (let i = 12; i < plat.width - 8; i += 24) {
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(plat.x + i, plat.y + 4, 3, 0, Math.PI * 2);
        ctx.arc(plat.x + i, plat.y + plat.height - 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (plat.isCrumbling) {
      ctx.fillStyle = '#2A2016';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      ctx.strokeStyle = plat.crumbleState === 'breaking' ? '#EF4444' : '#F97316';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x + 1, plat.y + 1, plat.width - 2, plat.height - 2);

      ctx.strokeStyle = '#FED7AA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(plat.x + plat.width * 0.3, plat.y);
      ctx.lineTo(plat.x + plat.width * 0.45, plat.y + plat.height * 0.5);
      ctx.lineTo(plat.x + plat.width * 0.7, plat.y + plat.height);
      ctx.stroke();
    } else {
      ctx.fillStyle = theme.platformBase;
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      ctx.strokeStyle = theme.platformBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x + 1, plat.y + 1, plat.width - 2, plat.height - 2);

      ctx.strokeStyle = theme.platformGlow;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(plat.x + 4, plat.y);
      ctx.lineTo(plat.x + plat.width - 4, plat.y);
      ctx.moveTo(plat.x + 4, plat.y + plat.height);
      ctx.lineTo(plat.x + plat.width - 4, plat.y + plat.height);
      ctx.stroke();

      ctx.fillStyle = theme.boltColor;
      const bOffset = 5;
      const bSize = 3;
      ctx.fillRect(plat.x + bOffset, plat.y + bOffset, bSize, bSize);
      ctx.fillRect(plat.x + plat.width - bOffset - bSize, plat.y + bOffset, bSize, bSize);
      ctx.fillRect(plat.x + bOffset, plat.y + plat.height - bOffset - bSize, bSize, bSize);
      ctx.fillRect(plat.x + plat.width - bOffset - bSize, plat.y + plat.height - bOffset - bSize, bSize, bSize);
    }

    ctx.restore();
  }
}

// Stage B: Draw Checkpoints (Holographic Beacon Flags)
function drawCheckpoints(
  ctx: CanvasRenderingContext2D,
  checkpoints: Checkpoint[],
  time: number,
  viewBounds?: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  for (const cp of checkpoints) {
    if (viewBounds) {
      if (
        cp.x + cp.width < viewBounds.minX ||
        cp.x > viewBounds.maxX ||
        cp.y + cp.height < viewBounds.minY ||
        cp.y > viewBounds.maxY
      ) {
        continue;
      }
    }
    ctx.save();
    const cx = cp.x + cp.width / 2;
    const cy = cp.y + cp.height / 2;

    const activeColor = '#4ADE80';
    const inactiveColor = '#0EA5E9';
    const color = cp.isActive ? activeColor : inactiveColor;

    // Base pedestal
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(cp.x + 4, cp.y + cp.height - 8, cp.width - 8, 8);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cp.x + 4, cp.y + cp.height - 8, cp.width - 8, 8);

    // Mast pole
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cp.y + 6);
    ctx.lineTo(cx, cp.y + cp.height - 8);
    ctx.stroke();

    // Beacon Hologram Orb & Rings
    const pulse = cp.isActive ? 1 + Math.sin(time * 5) * 0.15 : 1.0;
    ctx.save();
    ctx.translate(cx, cp.y + 10);
    ctx.rotate(time * (cp.isActive ? 3 : 1));

    // Outer rotating beacon diamond
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -9 * pulse);
    ctx.lineTo(9 * pulse, 0);
    ctx.lineTo(0, 9 * pulse);
    ctx.lineTo(-9 * pulse, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Radiant core light
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cp.y + 10, cp.isActive ? 4.5 * pulse : 3, 0, Math.PI * 2);
    ctx.fill();

    if (cp.isActive) {
      // Ambient glow
      const glow = ctx.createRadialGradient(cx, cp.y + 10, 2, cx, cp.y + 10, 26);
      glow.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
      glow.addColorStop(1, 'rgba(74, 222, 128, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cp.y + 10, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Stage B: Draw Spikes (UP, DOWN, LEFT, RIGHT with animated retraction)
function drawSpikes(
  ctx: CanvasRenderingContext2D,
  spikes: Spike[],
  time: number,
  viewBounds?: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  for (const spike of spikes) {
    if (viewBounds) {
      if (
        spike.x + spike.width < viewBounds.minX ||
        spike.x > viewBounds.maxX ||
        spike.y + spike.height < viewBounds.minY ||
        spike.y > viewBounds.maxY
      ) {
        continue;
      }
    }
    ctx.save();
    const progress = spike.retractProgress !== undefined ? spike.retractProgress : (spike.isActive ? 1.0 : 0.0);

    // Hazard Base Plate
    ctx.fillStyle = '#261214';
    ctx.fillRect(spike.x, spike.y + (spike.direction === 'UP' ? spike.height - 4 : 0), spike.width, 4);

    if (progress > 0.1) {
      const numTeeth = Math.max(1, Math.floor(spike.width / 16));
      const toothW = spike.width / numTeeth;
      const toothH = spike.height * progress;

      ctx.fillStyle = '#EF4444';
      ctx.strokeStyle = '#FCA5A5';
      ctx.lineWidth = 1.2;

      for (let i = 0; i < numTeeth; i++) {
        const tx = spike.x + i * toothW;
        ctx.beginPath();

        if (spike.direction === 'UP') {
          ctx.moveTo(tx, spike.y + spike.height);
          ctx.lineTo(tx + toothW / 2, spike.y + spike.height - toothH);
          ctx.lineTo(tx + toothW, spike.y + spike.height);
        } else if (spike.direction === 'DOWN') {
          ctx.moveTo(tx, spike.y);
          ctx.lineTo(tx + toothW / 2, spike.y + toothH);
          ctx.lineTo(tx + toothW, spike.y);
        } else if (spike.direction === 'LEFT') {
          ctx.moveTo(spike.x + spike.width, spike.y + i * (spike.height / numTeeth));
          ctx.lineTo(spike.x + spike.width - spike.width * progress, spike.y + (i + 0.5) * (spike.height / numTeeth));
          ctx.lineTo(spike.x + spike.width, spike.y + (i + 1) * (spike.height / numTeeth));
        } else {
          ctx.moveTo(spike.x, spike.y + i * (spike.height / numTeeth));
          ctx.lineTo(spike.x + spike.width * progress, spike.y + (i + 0.5) * (spike.height / numTeeth));
          ctx.lineTo(spike.x, spike.y + (i + 1) * (spike.height / numTeeth));
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

// Stage B: Draw Rotating Saw Blades
function drawSawBlades(ctx: CanvasRenderingContext2D, saws: SawBlade[], time: number): void {
  for (const saw of saws) {
    ctx.save();

    // Rail Track if moving on path
    if (saw.pathStartX !== undefined && saw.pathEndX !== undefined) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(saw.pathStartX, saw.pathStartY || saw.y);
      ctx.lineTo(saw.pathEndX, saw.pathEndY || saw.y);
      ctx.stroke();
    }

    ctx.translate(saw.x, saw.y);
    ctx.rotate(saw.rotation);

    // Serrated Teeth
    const teeth = 10;
    const innerR = saw.radius * 0.75;
    const outerR = saw.radius;

    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    for (let i = 0; i < teeth; i++) {
      const a1 = (i / teeth) * Math.PI * 2;
      const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.8) / teeth) * Math.PI * 2;

      ctx.lineTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
      ctx.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR);
      ctx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Steel Disc & Pivot Bolt
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(0, 0, saw.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Stage B: Draw Patrol Drones (Harmless pushers)
function drawPatrolDrones(ctx: CanvasRenderingContext2D, drones: PatrolDrone[], time: number): void {
  for (const drone of drones) {
    ctx.save();
    ctx.translate(drone.x, drone.y);

    // Drone Outer Chassis
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(0, 0, drone.radius, 0, Math.PI * 2);
    ctx.fill();

    // Neon Rim Bumper
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, drone.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Thruster Fins
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-drone.radius - 5, -3, 5, 6);
    ctx.fillRect(drone.radius, -3, 5, 6);

    // Thruster Jet Glow
    const thrusterPulse = 0.5 + Math.sin(time * 12) * 0.4;
    ctx.fillStyle = '#0284C7';
    ctx.globalAlpha = thrusterPulse;
    ctx.fillRect(-drone.radius - 8, -2, 3, 4);
    ctx.fillRect(drone.radius + 5, -2, 3, 4);
    ctx.globalAlpha = 1.0;

    // Glowing Cyclops Eye Sensor
    const eyeLookX = (drone.dir || 1) * 3;
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(eyeLookX, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeLookX + (drone.dir || 1), -1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Stage B: Draw Lasers (Fixed, Timed, Rotating with Crate/Platform Blocking)
function drawLasers(
  ctx: CanvasRenderingContext2D,
  lasers: Laser[],
  time: number,
  crates?: Crate[],
  platforms: Platform[] = []
): void {
  for (const laser of lasers) {
    ctx.save();

    // Clip laser against blocking crates & platforms
    let endX = laser.x2;
    let endY = laser.y2;
    let wasBlocked = false;

    if (crates) {
      for (const crate of crates) {
        const hit = lineAABBIntersection(laser.x1, laser.y1, endX, endY, crate);
        if (hit !== null) {
          endX = laser.x1 + (endX - laser.x1) * hit;
          endY = laser.y1 + (endY - laser.y1) * hit;
          wasBlocked = true;
        }
      }
    }

    for (const plat of platforms) {
      if (plat.isCrumbling && plat.crumbleState === 'broken') continue;
      const hit = lineAABBIntersection(laser.x1, laser.y1, endX, endY, plat);
      if (hit !== null) {
        endX = laser.x1 + (endX - laser.x1) * hit;
        endY = laser.y1 + (endY - laser.y1) * hit;
        wasBlocked = true;
      }
    }

    // Laser Emitter Base Node
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(laser.x1, laser.y1, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (laser.isActive) {
      // Outer Laser Bloom Aura
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Main Laser Red Core
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Laser Pure White Center Ray
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Impact Sparks if blocked by crate or platform
      if (wasBlocked) {
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(endX, endY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (laser.isFlickering) {
      // 0.6s Warning Flicker Guide Line
      const flickAlpha = 0.3 + Math.sin(time * 25) * 0.25;
      ctx.strokeStyle = `rgba(239, 68, 68, ${flickAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(laser.x1, laser.y1);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }
}

// Stage B: Draw Falling Blocks
function drawFallingBlocks(ctx: CanvasRenderingContext2D, blocks: FallingBlock[]): void {
  for (const fb of blocks) {
    ctx.save();
    const shake = fb.shakeOffset || 0;
    ctx.translate(shake, 0);

    ctx.fillStyle = '#1C1917';
    ctx.fillRect(fb.x, fb.y, fb.width, fb.height);

    ctx.strokeStyle = fb.state === 'shaking' ? '#EF4444' : '#78716C';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(fb.x + 1, fb.y + 1, fb.width - 2, fb.height - 2);

    // Hazard Stripes on bottom crusher edge
    ctx.fillStyle = '#EAB308';
    for (let x = fb.x + 4; x < fb.x + fb.width - 6; x += 12) {
      ctx.fillRect(x, fb.y + fb.height - 6, 6, 4);
    }

    // Warning Eye Sensor
    ctx.fillStyle = fb.state === 'shaking' ? '#EF4444' : '#22C55E';
    ctx.beginPath();
    ctx.arc(fb.x + fb.width / 2, fb.y + fb.height / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Stage B: Dark Room Spotlight Overlay (Only circle of light around orb)
function drawDarkRoomOverlay(
  ctx: CanvasRenderingContext2D,
  player: Player,
  width: number,
  height: number,
  time: number
): void {
  ctx.save();

  // Create radial gradient spotlight centered at player
  const spotRadius = 150 + Math.sin(time * 2) * 5;
  const spotGrad = ctx.createRadialGradient(player.x, player.y, 25, player.x, player.y, spotRadius);
  spotGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  spotGrad.addColorStop(0.65, 'rgba(5, 8, 6, 0.4)');
  spotGrad.addColorStop(1, 'rgba(5, 8, 6, 0.96)');

  ctx.fillStyle = spotGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

function drawGravityGates(
  ctx: CanvasRenderingContext2D,
  gates: GravityGate[],
  time: number,
  theme: WorldTheme
): void {
  for (const gate of gates) {
    ctx.save();
    const gateGrad = ctx.createLinearGradient(gate.x, gate.y, gate.x + gate.width, gate.y + gate.height);
    gateGrad.addColorStop(0, 'rgba(183, 255, 50, 0.15)');
    gateGrad.addColorStop(0.5, 'rgba(108, 255, 128, 0.28)');
    gateGrad.addColorStop(1, 'rgba(183, 255, 50, 0.15)');

    ctx.fillStyle = gateGrad;
    ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);

    const arrowOffset = (time * 60) % 24;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const cx = gate.x + gate.width / 2;
    const cy = gate.y + gate.height / 2;

    if (gate.direction === 'UP' || gate.direction === 'DOWN') {
      const dirSign = gate.direction === 'UP' ? -1 : 1;
      for (let off = -gate.height / 2 + 12; off < gate.height / 2; off += 24) {
        const yPos = cy + ((off + arrowOffset * dirSign + gate.height) % gate.height) - gate.height / 2;
        if (yPos > gate.y + 6 && yPos < gate.y + gate.height - 6) {
          ctx.beginPath();
          ctx.moveTo(cx - 14, yPos - 6 * dirSign);
          ctx.lineTo(cx, yPos + 6 * dirSign);
          ctx.lineTo(cx + 14, yPos - 6 * dirSign);
          ctx.stroke();
        }
      }
    } else {
      const dirSign = gate.direction === 'LEFT' ? -1 : 1;
      for (let off = -gate.width / 2 + 12; off < gate.width / 2; off += 24) {
        const xPos = cx + ((off + arrowOffset * dirSign + gate.width) % gate.width) - gate.width / 2;
        if (xPos > gate.x + 6 && xPos < gate.x + gate.width - 6) {
          ctx.beginPath();
          ctx.moveTo(xPos - 6 * dirSign, cy - 14);
          ctx.lineTo(xPos + 6 * dirSign, cy);
          ctx.lineTo(xPos - 6 * dirSign, cy + 14);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }
}

function drawTeleporters(
  ctx: CanvasRenderingContext2D,
  teleporters: Teleporter[],
  time: number
): void {
  for (const tp of teleporters) {
    ctx.save();
    const cx = tp.x + tp.width / 2;
    const cy = tp.y + tp.height / 2;

    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, tp.width * 0.8);
    glow.addColorStop(0, tp.color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(cx, cy, tp.width * 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = tp.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, tp.width / 2 - 2, tp.height / 2 - 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 3);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(0, 0, tp.width / 3, tp.height / 3, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }
}

function drawBouncePads(
  ctx: CanvasRenderingContext2D,
  pads: BouncePad[],
  theme: WorldTheme,
  viewBounds?: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  for (const pad of pads) {
    if (viewBounds) {
      if (
        pad.x + pad.width < viewBounds.minX ||
        pad.x > viewBounds.maxX ||
        pad.y + pad.height < viewBounds.minY ||
        pad.y > viewBounds.maxY
      ) {
        continue;
      }
    }
    ctx.save();
    const squash = pad.squashTimer && pad.squashTimer > 0 ? 0.65 : 1.0;

    ctx.fillStyle = '#222824';
    ctx.fillRect(pad.x, pad.y, pad.width, pad.height);
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad.x, pad.y, pad.width, pad.height);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    const steps = 4;
    const segW = pad.width / steps;
    ctx.beginPath();
    for (let i = 0; i < steps; i++) {
      const px = pad.x + i * segW;
      ctx.moveTo(px, pad.y + pad.height - 3);
      ctx.lineTo(px + segW / 2, pad.y + 3 * squash);
      ctx.lineTo(px + segW, pad.y + pad.height - 3);
    }
    ctx.stroke();

    ctx.fillStyle = '#FACC15';
    if (pad.direction === 'UP') {
      ctx.fillRect(pad.x + 2, pad.y, pad.width - 4, 6 * squash);
    } else if (pad.direction === 'DOWN') {
      ctx.fillRect(pad.x + 2, pad.y + pad.height - 6 * squash, pad.width - 4, 6 * squash);
    } else if (pad.direction === 'LEFT') {
      ctx.fillRect(pad.x, pad.y + 2, 6 * squash, pad.height - 4);
    } else {
      ctx.fillRect(pad.x + pad.width - 6 * squash, pad.y + 2, 6 * squash, pad.height - 4);
    }

    ctx.restore();
  }
}

function drawBoostStrips(
  ctx: CanvasRenderingContext2D,
  strips: SpeedBoostStrip[],
  time: number
): void {
  for (const strip of strips) {
    ctx.save();
    ctx.fillStyle = 'rgba(236, 72, 153, 0.18)';
    ctx.fillRect(strip.x, strip.y, strip.width, strip.height);

    ctx.strokeStyle = '#EC4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(strip.x, strip.y, strip.width, strip.height);

    const offset = (time * 180) % 36;
    ctx.strokeStyle = '#F472B6';
    ctx.lineWidth = 2.5;

    for (let x = strip.x + (offset % 36); x < strip.x + strip.width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x - 8, strip.y + 4);
      ctx.lineTo(x, strip.y + strip.height / 2);
      ctx.lineTo(x - 8, strip.y + strip.height - 4);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawGravityZones(
  ctx: CanvasRenderingContext2D,
  zones: GravityZone[],
  time: number
): void {
  for (const gz of zones) {
    ctx.save();
    const isLow = gz.type === 'LOW';
    ctx.fillStyle = isLow ? 'rgba(168, 85, 247, 0.12)' : 'rgba(239, 68, 68, 0.14)';
    ctx.fillRect(gz.x, gz.y, gz.width, gz.height);

    ctx.strokeStyle = isLow ? '#A855F7' : '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(gz.x, gz.y, gz.width, gz.height);
    ctx.setLineDash([]);

    ctx.font = '900 12px ui-monospace, SFMono-Regular, monospace';
    ctx.fillStyle = isLow ? '#C084FC' : '#F87171';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.6;
    ctx.fillText(
      isLow ? 'LOW-GRAV' : 'HEAVY-GRAV',
      gz.x + gz.width / 2,
      gz.y + 20
    );

    ctx.restore();
  }
}

function drawWindZones(
  ctx: CanvasRenderingContext2D,
  zones: WindZone[],
  time: number
): void {
  for (const wz of zones) {
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.fillRect(wz.x, wz.y, wz.width, wz.height);

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wz.x, wz.y, wz.width, wz.height);

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 12]);

    for (let y = wz.y + 16; y < wz.y + wz.height; y += 24) {
      ctx.beginPath();
      ctx.moveTo(wz.x, y);
      ctx.lineTo(wz.x + wz.width, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.restore();
  }
}

function drawSwitches(
  ctx: CanvasRenderingContext2D,
  switches: Switch[],
  time: number
): void {
  for (const sw of switches) {
    ctx.save();
    const pressedHeight = sw.isPressed ? sw.height * 0.4 : sw.height;
    const topY = sw.y + (sw.height - pressedHeight);

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(sw.x, topY, sw.width, pressedHeight);

    ctx.strokeStyle = sw.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(sw.x, topY, sw.width, pressedHeight);

    ctx.fillStyle = sw.isPressed ? sw.color : '#475569';
    ctx.beginPath();
    ctx.arc(sw.x + sw.width / 2, topY + pressedHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    if (sw.timedDuration && sw.timer !== undefined && sw.timer > 0) {
      ctx.font = 'bold 12px ui-monospace, SFMono-Regular, monospace';
      ctx.fillStyle = sw.color;
      ctx.textAlign = 'center';
      ctx.fillText(`${sw.timer.toFixed(1)}s`, sw.x + sw.width / 2, sw.y - 6);
    }

    ctx.restore();
  }
}

function drawDoors(
  ctx: CanvasRenderingContext2D,
  doors: Door[],
  theme: WorldTheme
): void {
  for (const door of doors) {
    ctx.save();
    const visibleH = door.height * (1 - door.openProgress);

    if (visibleH > 2) {
      ctx.fillStyle = '#1A221E';
      ctx.fillRect(door.x, door.y, door.width, visibleH);

      ctx.strokeStyle = door.color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(door.x, door.y, door.width, visibleH);

      ctx.strokeStyle = door.color;
      ctx.lineWidth = 2;
      for (let y = door.y + 8; y < door.y + visibleH; y += 16) {
        ctx.beginPath();
        ctx.moveTo(door.x + 4, y);
        ctx.lineTo(door.x + door.width - 4, y + 8);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(door.x, door.y, door.width, door.height);
    }

    ctx.restore();
  }
}

function drawCrates(ctx: CanvasRenderingContext2D, crates: Crate[]): void {
  for (const crate of crates) {
    ctx.save();
    ctx.fillStyle = '#334155';
    ctx.fillRect(crate.x, crate.y, crate.width, crate.height);

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.strokeRect(crate.x + 1, crate.y + 1, crate.width - 2, crate.height - 2);

    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(crate.x + 4, crate.y + 4);
    ctx.lineTo(crate.x + crate.width - 4, crate.y + crate.height - 4);
    ctx.moveTo(crate.x + crate.width - 4, crate.y + 4);
    ctx.lineTo(crate.x + 4, crate.y + crate.height - 4);
    ctx.stroke();

    ctx.restore();
  }
}

function drawMagnetFields(
  ctx: CanvasRenderingContext2D,
  magnets: MagnetField[],
  time: number
): void {
  for (const mag of magnets) {
    ctx.save();
    const cx = mag.x + mag.width / 2;
    const cy = mag.y + mag.height / 2;

    const pulse = (time * 40) % mag.radius;
    ctx.strokeStyle = '#38BDF8';
    ctx.globalAlpha = 0.35 * (1 - pulse / mag.radius);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(mag.x, mag.y, mag.width, mag.height);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(mag.x, mag.y, mag.width, mag.height);

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(mag.x + 2, mag.y + 2, mag.width / 2 - 2, mag.height - 4);
    ctx.fillStyle = '#3B82F6';
    ctx.fillRect(mag.x + mag.width / 2, mag.y + 2, mag.width / 2 - 2, mag.height - 4);

    ctx.restore();
  }
}

function drawPortal(
  ctx: CanvasRenderingContext2D,
  portal: Portal,
  time: number,
  theme: WorldTheme
): void {
  ctx.save();
  ctx.translate(portal.x, portal.y);

  const pulse = 1 + Math.sin(time * 4) * 0.1;
  const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, portal.radius * 1.6 * pulse);
  grad.addColorStop(0, theme.glow.replace(/[\d.]+\)$/, '0.7)'));
  grad.addColorStop(0.5, theme.glow.replace(/[\d.]+\)$/, '0.25)'));
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, portal.radius * 1.6 * pulse, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 3; i++) {
    const ringRadius = portal.radius * (0.45 + i * 0.28);
    const speed = (i % 2 === 0 ? 1 : -1) * (2.0 + i * 0.7);
    const rot = time * speed + i * 1.1;

    ctx.save();
    ctx.rotate(rot);
    ctx.strokeStyle = i === 1 ? theme.primary : theme.secondary;
    ctx.lineWidth = 2.5 - i * 0.4;
    ctx.setLineDash([10 + i * 6, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = theme.bgDark;
  ctx.beginPath();
  ctx.arc(0, 0, portal.radius * 0.38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, portal.radius * 0.18 * pulse, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCrystals(
  ctx: CanvasRenderingContext2D,
  crystals: Crystal[],
  time: number,
  theme: WorldTheme,
  viewBounds?: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  for (const c of crystals) {
    if (c.collected) continue;
    if (viewBounds) {
      if (
        c.x + 40 < viewBounds.minX ||
        c.x - 40 > viewBounds.maxX ||
        c.y + 40 < viewBounds.minY ||
        c.y - 40 > viewBounds.maxY
      ) {
        continue;
      }
    }

    ctx.save();
    ctx.translate(c.x, c.y);

    const pulseScale = 1 + Math.sin(c.pulsePhase * 2.2) * 0.14;
    ctx.scale(pulseScale, pulseScale);

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    glow.addColorStop(0, theme.glow.replace(/[\d.]+\)$/, '0.8)'));
    glow.addColorStop(0.5, theme.glow.replace(/[\d.]+\)$/, '0.25)'));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(12, -6);
    ctx.lineTo(12, 6);
    ctx.lineTo(0, 16);
    ctx.lineTo(-12, 6);
    ctx.lineTo(-12, -6);
    ctx.closePath();

    ctx.fillStyle = theme.secondary;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(5, -2);
    ctx.lineTo(0, 6);
    ctx.lineTo(-5, -2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export interface CharacterDrawOptions {
  x?: number;
  y?: number;
  facing?: number;
  visualAngle?: number;
  scale?: number;
  squashX?: number;
  squashY?: number;
  pose?: 'idle' | 'run' | 'fall' | 'flip' | 'land';
  isRunning?: boolean;
  isFalling?: boolean;
  isLanding?: boolean;
  isWallSliding?: boolean;
  isBouncing?: boolean;
  isHurt?: boolean;
  isScared?: boolean;
  isHappy?: boolean;
  expression?: 'normal' | 'happy' | 'blink' | 'scared';
  runCycle?: number;
  time?: number;
  primaryColor?: string;
  secondaryColor?: string;
  glowColor?: string;
  trailStyle?: 'standard' | 'robot' | 'ghost' | 'planet' | 'fireball';
  hasShield?: boolean;
  extraFlips?: number;
  invulnerableTimer?: number;
  suckedIntoPortal?: boolean;
  portalSuckProgress?: number;
}

/**
 * Clean, iconic character renderer with round blob body, thick dark outline,
 * big white eyes with black pupils (no glasses-like frames), and expressive reactive face.
 */
export function drawPlayerCharacter(
  ctx: CanvasRenderingContext2D,
  opts: CharacterDrawOptions
): void {
  const time = opts.time ?? 0;
  const primaryColor = opts.primaryColor || '#10B981';
  const secondaryColor = opts.secondaryColor || '#059669';
  const glowColor = opts.glowColor || 'rgba(16, 185, 129, 0.45)';
  const trailStyle = opts.trailStyle || 'standard';
  const bodyRadius = 26.0;

  // Determine active pose and animation state
  let isRunning = opts.isRunning ?? false;
  let isFalling = opts.isFalling ?? false;
  let isLanding = opts.isLanding ?? false;
  let isFlip = false;

  if (opts.pose) {
    isRunning = opts.pose === 'run';
    isFalling = opts.pose === 'fall';
    isLanding = opts.pose === 'land';
    isFlip = opts.pose === 'flip';
  }

  const isWallSliding = opts.isWallSliding ?? false;
  const isBouncing = opts.isBouncing ?? false;
  const isHurt = opts.isHurt ?? false;
  const isScared = opts.isScared ?? false;
  const isHappy = opts.isHappy ?? false;

  // Run cycle cadence
  const runCycle = opts.runCycle !== undefined ? opts.runCycle : time * 9;

  // Facing and orientation
  const facing = opts.facing ?? 1;
  const visualAngle = isFlip ? Math.PI : (opts.visualAngle ?? 0);
  const userScale = opts.scale ?? 1.0;

  // Squash & Stretch
  const sx = (opts.squashX ?? (isLanding ? 1.25 : 1.0)) * userScale;
  const sy = (opts.squashY ?? (isLanding ? 0.75 : 1.0)) * userScale;

  const isSucked = opts.suckedIntoPortal;
  const suckRatio = isSucked ? Math.max(0, 1 - (opts.portalSuckProgress || 0)) : 1.0;
  const suckSpin = isSucked ? (opts.portalSuckProgress || 0) * Math.PI * 6 : 0;

  ctx.save();
  ctx.translate(opts.x ?? 0, opts.y ?? 0);
  ctx.rotate(visualAngle + suckSpin);
  ctx.scale(facing * sx * suckRatio, sy * suckRatio);

  // Invulnerability flicker
  if (opts.invulnerableTimer && opts.invulnerableTimer > 0) {
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(time * 30));
  } else if (trailStyle === 'ghost') {
    ctx.globalAlpha = 0.88;
  }

  // Extra Flips double wings
  if (opts.extraFlips && opts.extraFlips > 0) {
    ctx.save();
    const wingPhase = Math.sin(time * 8) * 3;
    ctx.strokeStyle = '#C084FC';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#A855F7';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(-bodyRadius - 3, -4 + wingPhase);
    ctx.lineTo(-bodyRadius - 12, 0 + wingPhase);
    ctx.lineTo(-bodyRadius - 3, 6 + wingPhase);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyRadius + 3, -4 - wingPhase);
    ctx.lineTo(bodyRadius + 12, 0 - wingPhase);
    ctx.lineTo(bodyRadius + 3, 6 - wingPhase);
    ctx.stroke();
    ctx.restore();
  }

  // Idle breathing / run bobbing
  let bobY = 0;
  let lean = 0;
  let breathScale = 1.0;
  if (isRunning) {
    bobY = -Math.abs(Math.sin(runCycle)) * 2.2;
    lean = 0.12; // forward lean while running
  } else if (!isFalling && !isLanding) {
    bobY = Math.sin(time * 3.5) * 0.8;
    breathScale = 1 + Math.sin(time * 3.5) * 0.025;
  }

  // Ambient soft glow behind character
  const glowR = bodyRadius * 2.2;
  const glow = ctx.createRadialGradient(0, 0, bodyRadius * 0.3, 0, 0, glowR);
  glow.addColorStop(0, glowColor.replace(/[\d.]+\)$/, '0.65)'));
  glow.addColorStop(0.6, glowColor.replace(/[\d.]+\)$/, '0.2)'));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, glowR, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(0, bobY);
  ctx.rotate(lean);
  ctx.scale(1, breathScale);

  // 1. Skin details behind character (Planet stardust / ghost mist at low opacity, never covering body)
  if (trailStyle === 'planet') {
    ctx.save();
    ctx.rotate(0.35);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
    ctx.lineWidth = 4.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyRadius * 1.6, bodyRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else if (trailStyle === 'ghost') {
    ctx.save();
    const mistWobble = Math.sin(time * 8) * 3;
    ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
    ctx.beginPath();
    ctx.arc(-bodyRadius * 0.9, 10 + mistWobble, 7.0, 0, Math.PI * 2);
    ctx.arc(-bodyRadius * 1.25, 14 + mistWobble, 5.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2. Round Blob Body with Thick Dark Outline
  // Outer dark contour outline
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Radial color fill
  const bodyGrad = ctx.createRadialGradient(-6, -7, 3, 0, 0, bodyRadius);
  bodyGrad.addColorStop(0, '#FFFFFF');
  bodyGrad.addColorStop(0.35, primaryColor);
  bodyGrad.addColorStop(0.85, secondaryColor);
  bodyGrad.addColorStop(1, '#0F172A');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle light inner rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, bodyRadius - 1.2, 0, Math.PI * 2);
  ctx.stroke();

  // 4. Expressive Face: Two Big White Round Eyes & Small Simple Mouth
  // (NO glasses-like outlines, NO heavy frames)
  const faceCenterX = 6.0;
  const eyeSpacing = 8.5;
  const leftEyeX = faceCenterX - eyeSpacing;
  const rightEyeX = faceCenterX + eyeSpacing;
  const eyeY = -3.5;
  const eyeRadius = 7.5;

  const isBlink = opts.expression === 'blink';
  const isExcited = isHappy || opts.expression === 'happy' || isBouncing;
  const isAlarmed = isScared || isHurt || opts.expression === 'scared';

  if (isBlink) {
    // Blinking: cute curved closed eye slits
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, 5.0, 0.2, Math.PI - 0.2);
    ctx.arc(rightEyeX, eyeY, 5.0, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Gentle simple mouth
    ctx.beginPath();
    ctx.arc(faceCenterX, eyeY + 11.0, 3.8, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else if (isExcited) {
    // Beaming cheerful eyes (^ ^)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 5.0, eyeY + 2.0);
    ctx.lineTo(leftEyeX, eyeY - 4.0);
    ctx.lineTo(leftEyeX + 5.0, eyeY + 2.0);
    ctx.moveTo(rightEyeX - 5.0, eyeY + 2.0);
    ctx.lineTo(rightEyeX, eyeY - 4.0);
    ctx.lineTo(rightEyeX + 5.0, eyeY + 2.0);
    ctx.stroke();

    // Open happy mouth with pink tongue
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(faceCenterX, eyeY + 9.5, 6.0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(faceCenterX, eyeY + 12.0, 3.2, 0, Math.PI);
    ctx.fill();
  } else if (isFalling) {
    // Falling: Startled round eyes with eyebrows and gasping "O" mouth!
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeRadius + 1.2, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeRadius + 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Thin clean contour (no thick glasses frame)
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Contracted pupils
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(leftEyeX + 1.0, eyeY + 1.0, 3.8, 0, Math.PI * 2);
    ctx.arc(rightEyeX + 1.0, eyeY + 1.0, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Glint
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX + 2.0, eyeY, 1.4, 0, Math.PI * 2);
    ctx.arc(rightEyeX + 2.0, eyeY, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Surprised high eyebrows
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY - 9.0, 5.0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(rightEyeX, eyeY - 9.0, 5.0, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    // Open "O" mouth
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(faceCenterX, eyeY + 11.5, 4.0, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (isAlarmed) {
    // Scared / Hurt: wide worried eyes with trembling mouth
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    const shake = Math.sin(time * 25) * 0.8;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(leftEyeX + shake, eyeY + shake, 3.4, 0, Math.PI * 2);
    ctx.arc(rightEyeX + shake, eyeY + shake, 3.4, 0, Math.PI * 2);
    ctx.fill();

    // Worried slant eyebrows
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(leftEyeX - 5, eyeY - 8);
    ctx.lineTo(leftEyeX + 4, eyeY - 10);
    ctx.moveTo(rightEyeX - 4, eyeY - 10);
    ctx.lineTo(rightEyeX + 5, eyeY - 8);
    ctx.stroke();

    // Trembling wavy mouth
    ctx.beginPath();
    ctx.moveTo(faceCenterX - 5, eyeY + 11);
    ctx.lineTo(faceCenterX - 2, eyeY + 9 + shake);
    ctx.lineTo(faceCenterX + 2, eyeY + 12 - shake);
    ctx.lineTo(faceCenterX + 5, eyeY + 10);
    ctx.stroke();
  } else {
    // Normal / Run / Idle / Land: Big Round White Eyes & Cute Smile
    // Pure White Sclera
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Thin clean contour
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Black Round Pupils
    const lookShiftX = isRunning ? 2.0 : 1.0;
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(leftEyeX + lookShiftX, eyeY, 4.4, 0, Math.PI * 2);
    ctx.arc(rightEyeX + lookShiftX, eyeY, 4.4, 0, Math.PI * 2);
    ctx.fill();

    // Sparkling Glints
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(leftEyeX + lookShiftX + 1.4, eyeY - 1.6, 1.8, 0, Math.PI * 2);
    ctx.arc(rightEyeX + lookShiftX + 1.4, eyeY - 1.6, 1.8, 0, Math.PI * 2);
    ctx.arc(leftEyeX + lookShiftX - 1.2, eyeY + 1.6, 1.0, 0, Math.PI * 2);
    ctx.arc(rightEyeX + lookShiftX - 1.2, eyeY + 1.6, 1.0, 0, Math.PI * 2);
    ctx.fill();

    // Small Simple Mouth
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (isLanding) {
      // Determined straight mouth upon impact
      ctx.moveTo(faceCenterX - 3.5, eyeY + 10.5);
      ctx.lineTo(faceCenterX + 3.5, eyeY + 10.5);
    } else if (isRunning) {
      // Confident energetic grin
      ctx.arc(faceCenterX + 0.8, eyeY + 9.5, 4.4, 0.1, Math.PI - 0.1);
    } else {
      // Gentle calm smile while idle
      ctx.arc(faceCenterX, eyeY + 9.5, 4.0, 0.15, Math.PI - 0.15);
    }
    ctx.stroke();
  }

  // 5. Small Head Accessories on top of head (Robot antenna, Fireball crest)
  if (trailStyle === 'robot') {
    // Cyber antenna with cyan LED
    ctx.save();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(0, -bodyRadius);
    ctx.lineTo(0, -bodyRadius - 12);
    ctx.stroke();

    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, -bodyRadius);
    ctx.lineTo(0, -bodyRadius - 12);
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, -bodyRadius - 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (trailStyle === 'fireball') {
    // Small flame crest on top of head
    ctx.save();
    const flameH = 14 + Math.sin(time * 16) * 3;
    const fGrad = ctx.createLinearGradient(0, -bodyRadius + 2, 0, -bodyRadius - flameH);
    fGrad.addColorStop(0, '#EF4444');
    fGrad.addColorStop(0.6, '#F59E0B');
    fGrad.addColorStop(1, '#FEF08A');
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(-7, -bodyRadius + 2);
    ctx.quadraticCurveTo(0, -bodyRadius - flameH * 0.7, 0, -bodyRadius - flameH);
    ctx.quadraticCurveTo(0, -bodyRadius - flameH * 0.7, 7, -bodyRadius + 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore(); // Restore breath, bob, lean

  // 6. Force-Field Shield Energy Bubble
  if (opts.hasShield) {
    const shieldR = bodyRadius * 1.35;
    const pulse = Math.sin(time * 6) * 2;
    const r = shieldR + pulse;

    const sGrad = ctx.createRadialGradient(0, 0, bodyRadius * 0.7, 0, 0, r);
    sGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    sGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.28)');
    sGrad.addColorStop(1, 'rgba(56, 189, 248, 0.75)');

    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.8;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, r, time * 2, time * 2 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * In-game player rendering wrapper connecting physical Player state to drawPlayerCharacter
 */
function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  time: number,
  theme: WorldTheme,
  trailStyle?: 'standard' | 'robot' | 'ghost' | 'planet' | 'fireball'
): void {
  const isSucked = player.suckedIntoPortal;
  const suckRatio = isSucked ? Math.max(0, 1 - (player.portalSuckProgress || 0)) : 1.0;

  // Custom Skin Trail Rendering
  for (let i = 0; i < player.trail.length; i++) {
    const pt = player.trail[i];
    const trailRatio = 1 - i / player.trail.length;
    const r = pt.size * trailRatio * suckRatio;

    if (trailStyle === 'robot') {
      ctx.fillStyle = '#38BDF8';
      ctx.globalAlpha = 0.45 * trailRatio * suckRatio;
      ctx.fillRect(pt.x - r * 0.7, pt.y - r * 0.7, r * 1.4, r * 1.4);
    } else if (trailStyle === 'ghost') {
      ctx.fillStyle = '#E0F2FE';
      ctx.globalAlpha = 0.3 * trailRatio * suckRatio;
      ctx.beginPath();
      ctx.arc(pt.x + Math.sin(time * 6 + i) * 3, pt.y, r * 1.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (trailStyle === 'fireball') {
      ctx.fillStyle = i % 2 === 0 ? '#F59E0B' : '#EF4444';
      ctx.globalAlpha = 0.5 * trailRatio * suckRatio;
      ctx.beginPath();
      ctx.arc(pt.x + (Math.random() - 0.5) * 4, pt.y - i * 1.5, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
    } else if (trailStyle === 'planet') {
      ctx.fillStyle = '#FCD34D';
      ctx.globalAlpha = 0.45 * trailRatio * suckRatio;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = player.boostTimer > 0 ? '#EC4899' : theme.secondary;
      ctx.globalAlpha = (player.boostTimer > 0 ? 0.45 : 0.28) * trailRatio * suckRatio;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1.0;

  // Physical motion states
  const isWallSliding = Boolean(player.isStuckToWall);
  const isLanding = Boolean((player.landingTimer && player.landingTimer > 0) || (player.squashY < 0.82));
  const isFalling =
    !player.onGround &&
    !isWallSliding &&
    ((player.gravityDir === 'DOWN' && player.vy > 45) ||
      (player.gravityDir === 'UP' && player.vy < -45) ||
      (player.gravityDir === 'LEFT' && player.vx < -45) ||
      (player.gravityDir === 'RIGHT' && player.vx > 45));
  const isBouncing = !player.onGround && !isWallSliding && !isFalling && Math.abs(player.vy) > 180;
  const isRunning = player.onGround && Math.abs(player.vx) > 15;
  const isHurt = Boolean(player.invulnerableTimer && player.invulnerableTimer > 0);

  // Smooth visual angle
  const visualAngle =
    player.visualAngle !== undefined
      ? player.visualAngle
      : player.gravityDir === 'UP'
      ? Math.PI
      : player.gravityDir === 'LEFT'
      ? Math.PI * 0.5
      : player.gravityDir === 'RIGHT'
      ? -Math.PI * 0.5
      : 0;

  drawPlayerCharacter(ctx, {
    x: player.x,
    y: player.y,
    facing: player.facingDir || 1,
    visualAngle,
    scale: 1.0,
    squashX: player.squashX,
    squashY: player.squashY,
    isRunning,
    isFalling,
    isLanding,
    isWallSliding,
    isBouncing,
    isHurt,
    isScared: Boolean(player.isNearHazard || player.expression === 'scared'),
    isHappy: Boolean(player.expression === 'happy' || isBouncing),
    expression: player.expression,
    runCycle: player.runCycle || 0,
    time,
    primaryColor: player.color || theme.primary,
    secondaryColor: theme.secondary,
    glowColor: player.glowColor || theme.glow,
    trailStyle,
    hasShield: player.hasShield,
    extraFlips: player.extraFlips,
    invulnerableTimer: player.invulnerableTimer,
    suckedIntoPortal: player.suckedIntoPortal,
    portalSuckProgress: player.portalSuckProgress,
  });
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawShockwaves(ctx: CanvasRenderingContext2D, shockwaves: Shockwave[]): void {
  for (const sw of shockwaves) {
    ctx.save();
    ctx.globalAlpha = sw.alpha;
    ctx.strokeStyle = sw.color;
    ctx.lineWidth = sw.width;
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function drawFloatingTexts(ctx: CanvasRenderingContext2D, floatingTexts: FloatingText[]): void {
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.font = '900 18px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#000000';
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

// Stage C: Rare Golden Star Crystal (Glowing 8-Point Star with Golden Aura)
function drawStarCrystal(
  ctx: CanvasRenderingContext2D,
  sc: Crystal,
  time: number
): void {
  if (sc.collected) return;

  ctx.save();
  ctx.translate(sc.x, sc.y);

  const pulse = 1.0 + Math.sin(sc.pulsePhase * 2.8) * 0.15;
  ctx.scale(pulse, pulse);

  // Deep gold radial aura
  const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, 36);
  glow.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
  glow.addColorStop(0.4, 'rgba(255, 170, 0, 0.35)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 36, 0, Math.PI * 2);
  ctx.fill();

  // 8-point rotating star gleam
  ctx.save();
  ctx.rotate(time * 1.5);
  ctx.fillStyle = '#FFE066';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? 18 : 8;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // Golden crystal core
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // White sparkle highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-2, -2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Stage C: Time Slow Pickups (Cyan Chrono-Hourglass Orb)
function drawTimeSlowPickups(
  ctx: CanvasRenderingContext2D,
  pickups: TimeSlowPickup[],
  time: number
): void {
  for (const p of pickups) {
    if (p.collected) continue;

    ctx.save();
    ctx.translate(p.x, p.y);

    const pulse = 1.0 + Math.sin(p.pulsePhase * 2.4) * 0.12;
    ctx.scale(pulse, pulse);

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    glow.addColorStop(0.5, 'rgba(14, 165, 233, 0.3)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Outer counter-rotating ring
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.0;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, 15, -time * 2.5, -time * 2.5 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hourglass icon in center
    ctx.fillStyle = '#E0F2FE';
    ctx.beginPath();
    ctx.moveTo(-6, -7);
    ctx.lineTo(6, -7);
    ctx.lineTo(-6, 7);
    ctx.lineTo(6, 7);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// Stage C: Shield Pickups (Azure Hexagonal Force-Gem)
function drawShieldPickups(
  ctx: CanvasRenderingContext2D,
  pickups: ShieldPickup[],
  time: number
): void {
  for (const p of pickups) {
    if (p.collected) continue;

    ctx.save();
    ctx.translate(p.x, p.y);

    const pulse = 1.0 + Math.sin(p.pulsePhase * 2.2) * 0.14;
    ctx.scale(pulse, pulse);

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
    glow.addColorStop(0, 'rgba(6, 182, 212, 0.85)');
    glow.addColorStop(0.5, 'rgba(6, 182, 212, 0.3)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fill();

    // Hexagon shield body
    ctx.fillStyle = '#06B6D4';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const x = Math.cos(angle) * 14;
      const y = Math.sin(angle) * 14;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner shield crest
    ctx.fillStyle = '#CFFAFE';
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, -2);
    ctx.lineTo(0, 7);
    ctx.lineTo(-5, -2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// Stage C: Double Flip Pickups (Twin Kinetic Energy Chevrons)
function drawDoubleFlipPickups(
  ctx: CanvasRenderingContext2D,
  pickups: DoubleFlipPickup[],
  time: number
): void {
  for (const p of pickups) {
    if (p.collected) continue;

    ctx.save();
    ctx.translate(p.x, p.y);

    const pulse = 1.0 + Math.sin(p.pulsePhase * 2.6) * 0.12;
    ctx.scale(pulse, pulse);

    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 26);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.85)');
    glow.addColorStop(0.5, 'rgba(147, 51, 234, 0.3)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();

    // Twin chevrons (up & down)
    ctx.fillStyle = '#F3E8FF';
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 2.0;

    // Up arrow chevron
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(7, -3);
    ctx.lineTo(4, -3);
    ctx.lineTo(0, -7);
    ctx.lineTo(-4, -3);
    ctx.lineTo(-7, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Down arrow chevron
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.lineTo(7, 3);
    ctx.lineTo(4, 3);
    ctx.lineTo(0, 7);
    ctx.lineTo(-4, 3);
    ctx.lineTo(-7, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

// Stage C: Time Slow Screen Vignette
function drawTimeSlowVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timer: number
): void {
  ctx.save();
  const intensity = Math.min(1.0, timer);
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.35,
    width / 2,
    height / 2,
    width * 0.65
  );
  grad.addColorStop(0, 'rgba(14, 165, 233, 0)');
  grad.addColorStop(1, `rgba(14, 165, 233, ${0.28 * intensity})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Soft cyan border stroke
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 * intensity})`;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, width - 8, height - 8);
  ctx.restore();
}

// Stage D: Rising Danger Floor (Lethal Plasma Surge)
function drawRisingFloor(
  ctx: CanvasRenderingContext2D,
  rf: RisingFloor,
  gameWidth: number,
  gameHeight: number,
  time: number
): void {
  ctx.save();
  const y = rf.y;
  const plasmaHeight = Math.max(0, gameHeight - y);

  // Gradient plasma core
  const grad = ctx.createLinearGradient(0, y, 0, gameHeight);
  grad.addColorStop(0, 'rgba(239, 68, 68, 0.92)');
  grad.addColorStop(0.3, 'rgba(220, 38, 38, 0.85)');
  grad.addColorStop(1, 'rgba(153, 27, 27, 0.95)');
  ctx.fillStyle = grad;

  // Wavy bubbling surface line
  ctx.beginPath();
  ctx.moveTo(0, gameHeight);
  ctx.lineTo(0, y);
  const step = 20;
  for (let x = 0; x <= gameWidth; x += step) {
    const wave = Math.sin(time * 6 + x * 0.05) * 4 + Math.cos(time * 4 + x * 0.08) * 3;
    ctx.lineTo(x, y + wave);
  }
  ctx.lineTo(gameWidth, gameHeight);
  ctx.closePath();
  ctx.fill();

  // Crest hazard line
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= gameWidth; x += step) {
    const wave = Math.sin(time * 6 + x * 0.05) * 4 + Math.cos(time * 4 + x * 0.08) * 3;
    if (x === 0) ctx.moveTo(x, y + wave);
    else ctx.lineTo(x, y + wave);
  }
  ctx.stroke();

  // Warning chevron stripe along top edge
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
  ctx.lineWidth = 8;
  const offset = (time * 60) % 40;
  for (let cx = -40; cx < gameWidth + 40; cx += 36) {
    ctx.beginPath();
    ctx.moveTo(cx + offset, y - 10);
    ctx.lineTo(cx + offset - 20, y + 35);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
}

// Stage D: Secret Passages & Rooms
function drawSecretPassages(
  ctx: CanvasRenderingContext2D,
  passages: SecretPassage[],
  time: number,
  theme: WorldTheme
): void {
  for (const sp of passages) {
    ctx.save();

    if (!sp.revealed) {
      // Unrevealed: Disguised illusory wall block with faint glitch/crack line
      ctx.fillStyle = theme.platformBase;
      ctx.fillRect(sp.x, sp.y, sp.width, sp.height);

      ctx.strokeStyle = theme.platformBorder;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sp.x, sp.y, sp.width, sp.height);

      // Faint mysterious crack indicating hollow secret
      const shimmer = 0.15 + Math.sin(time * 3 + sp.x) * 0.1;
      ctx.strokeStyle = `rgba(251, 191, 36, ${shimmer})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sp.x + sp.width * 0.3, sp.y + 4);
      ctx.lineTo(sp.x + sp.width * 0.5, sp.y + sp.height * 0.5);
      ctx.lineTo(sp.x + sp.width * 0.4, sp.y + sp.height - 4);
      ctx.stroke();
    } else {
      // Revealed: Open glowing portal corridor
      ctx.fillStyle = 'rgba(251, 191, 36, 0.08)';
      ctx.fillRect(sp.x, sp.y, sp.width, sp.height);

      ctx.strokeStyle = '#FBBF24';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(sp.x, sp.y, sp.width, sp.height);
      ctx.setLineDash([]);

      // Draw bonus crystals inside revealed secret room
      if (sp.bonusCrystals) {
        for (const c of sp.bonusCrystals) {
          if (c.collected) continue;
          ctx.save();
          ctx.translate(c.x, c.y);
          const pulse = 1.0 + Math.sin(c.pulsePhase * 2.5) * 0.15;
          ctx.scale(pulse, pulse);

          const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 20);
          glow.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
          glow.addColorStop(0.5, 'rgba(245, 158, 11, 0.35)');
          glow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(7, 0);
          ctx.lineTo(0, 9);
          ctx.lineTo(-7, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }
}

// Stage E: Ghost Run Replay Visuals
export function drawGhostOrb(
  ctx: CanvasRenderingContext2D,
  ghost: GhostSample,
  time: number
): void {
  ctx.save();
  ctx.globalAlpha = 0.6;
  drawPlayerCharacter(ctx, {
    x: ghost.x,
    y: ghost.y,
    facing: 1,
    squashX: ghost.sqX || 1,
    squashY: ghost.sqY || 1,
    isRunning: true,
    runCycle: time * 9,
    time,
    primaryColor: '#38BDF8',
    secondaryColor: '#0284C7',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    trailStyle: 'ghost',
  });

  // PB Label
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#38BDF8';
  ctx.shadowColor = '#0284C7';
  ctx.shadowBlur = 6;
  ctx.fillText('PB GHOST', ghost.x, ghost.y - 36);
  ctx.restore();
}

// Stage E: Hint Path Preview Line & Waypoints
export function drawHintPath(
  ctx: CanvasRenderingContext2D,
  waypoints: HintWaypoint[],
  time: number
): void {
  if (waypoints.length < 2) return;

  ctx.save();
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.65)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 8]);
  ctx.lineDashOffset = -time * 35; // Animated marching neon dash

  ctx.beginPath();
  ctx.moveTo(waypoints[0].x, waypoints[0].y);
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1];
    const curr = waypoints[i];
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;
    ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
  }
  ctx.lineTo(waypoints[waypoints.length - 1].x, waypoints[waypoints.length - 1].y);
  ctx.stroke();

  // Draw glowing waypoint nodes
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const pulse = Math.sin(time * 5 + i) * 1.5;
    ctx.fillStyle = '#4ADE80';
    ctx.beginPath();
    ctx.arc(wp.x, wp.y, 4 + pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws a small edge indicator arrow pointing toward the exit portal when
 * off-screen or far away, with distance badge and pulsing chevron.
 */
export function drawExitArrowIndicator(
  ctx: CanvasRenderingContext2D,
  portal: Portal,
  player: Player,
  scale: number,
  offsetX: number,
  offsetY: number,
  canvasWidth: number,
  canvasHeight: number,
  theme: WorldTheme,
  time: number
): void {
  // Screen coordinates of the portal
  const portalScreenX = portal.x * scale + offsetX;
  const portalScreenY = portal.y * scale + offsetY;

  const margin = 36;
  const isOffScreen =
    portalScreenX < margin ||
    portalScreenX > canvasWidth - margin ||
    portalScreenY < margin ||
    portalScreenY > canvasHeight - margin;

  // Compute world distance
  const worldDist = Math.hypot(portal.x - player.x, portal.y - player.y);

  // If portal is comfortably visible on screen and close, don't clutter
  if (!isOffScreen && worldDist < 450) return;

  const playerScreenX = player.x * scale + offsetX;
  const playerScreenY = player.y * scale + offsetY;

  const dx = portalScreenX - playerScreenX;
  const dy = portalScreenY - playerScreenY;
  const angle = Math.atan2(dy, dx);

  // Safe zone for exit indicator arrow:
  // Must never sit behind the left/right buttons (bottom-left) or FLIP button (bottom-right) or top bar.
  // User instruction: "use the top-right or the middle of the right edge"
  const marginX = 28;
  const minY = 75; // Safely below top HUD bar
  // Controls occupy the bottom 130px; middle-of-right-edge is around canvasHeight * 0.48
  const maxY = Math.min(canvasHeight * 0.52, canvasHeight - 140);

  let arrowX: number;
  let arrowY: number;

  if (dx >= 0) {
    // Portal is ahead/to the right: sit at right screen edge (top-right or middle of right edge)
    arrowX = canvasWidth - marginX;
    const normalizedDy = Math.max(-1, Math.min(1, dy / 300));
    // When dy < 0 (portal is higher), sits towards top-right; when dy >= 0, sits at middle of right edge
    arrowY = minY + (maxY - minY) * (0.5 + normalizedDy * 0.45);
  } else {
    // Portal is behind/to the left: sit at left screen edge, well above bottom-left controls
    arrowX = marginX;
    const normalizedDy = Math.max(-1, Math.min(1, dy / 300));
    arrowY = minY + (maxY - minY) * (0.5 + normalizedDy * 0.45);
  }

  const pulse = 1 + 0.14 * Math.sin(time * 6);
  const bobbing = Math.sin(time * 6) * 3;

  ctx.save();
  ctx.translate(arrowX, arrowY);

  // Soft neon aura
  const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  aura.addColorStop(0, theme.primary + '55');
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  // Draw arrow chevron pointing toward exit
  ctx.save();
  ctx.rotate(angle);
  ctx.translate(bobbing, 0);

  ctx.fillStyle = '#0B0F0C';
  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2.4;

  ctx.beginPath();
  ctx.moveTo(13 * pulse, 0);
  ctx.lineTo(-8 * pulse, -8 * pulse);
  ctx.lineTo(-3 * pulse, 0);
  ctx.lineTo(-8 * pulse, 8 * pulse);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Central glow pip
  ctx.fillStyle = theme.secondary || '#38BDF8';
  ctx.beginPath();
  ctx.arc(2, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Distance badge
  const meters = Math.max(1, Math.round(worldDist / 40));
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const badgeY = arrowY > canvasHeight - 80 ? -24 : 14;
  ctx.fillStyle = 'rgba(11, 15, 12, 0.85)';
  ctx.fillRect(-16, badgeY - 2, 32, 13);
  ctx.strokeStyle = theme.primary + '66';
  ctx.lineWidth = 1;
  ctx.strokeRect(-16, badgeY - 2, 32, 13);

  ctx.fillStyle = theme.primary;
  ctx.fillText(`${meters}m`, 0, badgeY);

  ctx.restore();
}

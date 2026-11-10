import {
  Player,
  Platform,
  Crystal,
  Portal,
  InputState,
  Particle,
  Shockwave,
  FloatingText,
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
} from './types';
import { audio } from './audio';

export const FIXED_DT = 1 / 60; // 60Hz fixed timestep
const SUBSTEPS = 4;
const SUB_DT = FIXED_DT / SUBSTEPS;

const BASE_GRAVITY_MAGNITUDE = 1600; // px/s^2
const MOVE_ACCEL_GROUND = 2600;      // px/s^2
const MOVE_ACCEL_AIR = 1800;         // px/s^2
const MAX_RUN_SPEED = 380;           // px/s
const BASE_GROUND_FRICTION = 0.84;   // Per fixed frame friction
const ICE_GROUND_FRICTION = 0.992;   // Very slippery ice surface
const AIR_DRAG = 0.985;
const RESTITUTION = 0.08;            // Tiny bounce for tactile game feel

export interface VisualEffectsState {
  shockwaves: Shockwave[];
  floatingTexts: FloatingText[];
  addScreenShake: (amount: number) => void;
  triggerColorFlash: (color: string) => void;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface StageEntities {
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

  // Stage D: Bosses, Rising Danger Floor & Secret Rooms
  risingFloor?: RisingFloor;
  chaosGravityInterval?: number;
  secretPassages?: SecretPassage[];
}

export function updatePhysics(
  player: Player,
  platforms: Platform[],
  input: InputState,
  crystals: Crystal[],
  portal: Portal,
  particles: Particle[],
  bounds: { width: number; height: number },
  vfx: VisualEffectsState,
  onCrystalCollect?: (c: Crystal) => void,
  onPortalEnter?: () => void,
  entities: StageEntities = {},
  onPlayerDeath?: (x: number, y: number) => void
): { levelComplete: boolean; playerDied?: boolean } {
  // 1. If player is in portal suction animation, handle cinematic spiral
  if (player.suckedIntoPortal) {
    player.portalSuckProgress = (player.portalSuckProgress || 0) + FIXED_DT * 2.5;
    player.x += (portal.x - player.x) * 0.22;
    player.y += (portal.y - player.y) * 0.22;
    player.vx *= 0.5;
    player.vy *= 0.5;

    if (Math.random() < 0.6) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 20;
      particles.push({
        x: portal.x + Math.cos(angle) * dist,
        y: portal.y + Math.sin(angle) * dist,
        vx: -Math.cos(angle) * 80,
        vy: -Math.sin(angle) * 80,
        radius: 2 + Math.random() * 2,
        color: vfx.secondaryColor || '#6CFF80',
        alpha: 0.9,
        life: 0.3,
        maxLife: 0.3,
      });
    }

    if (player.portalSuckProgress >= 1) {
      audio.playLevelComplete();
      if (onPortalEnter) onPortalEnter();
      return { levelComplete: true };
    }
    return { levelComplete: false };
  }

  // Stage C Timers
  if (player.timeSlowTimer && player.timeSlowTimer > 0) {
    player.timeSlowTimer -= FIXED_DT;
    if (player.timeSlowTimer < 0) player.timeSlowTimer = 0;
  }
  if (player.invulnerableTimer && player.invulnerableTimer > 0) {
    player.invulnerableTimer -= FIXED_DT;
    if (player.invulnerableTimer < 0) player.invulnerableTimer = 0;
  }
  if (player.comboTimer && player.comboTimer > 0) {
    player.comboTimer -= FIXED_DT;
    if (player.comboTimer <= 0) {
      player.comboCount = 0;
    }
  }

  // 2. Handle gravity flip request
  if (input.flipRequested) {
    input.flipRequested = false;

    if (player.gravityDir === 'DOWN') {
      player.gravityDir = 'UP';
    } else if (player.gravityDir === 'UP') {
      player.gravityDir = 'DOWN';
    } else if (player.gravityDir === 'LEFT') {
      player.gravityDir = 'RIGHT';
    } else {
      player.gravityDir = 'LEFT';
    }

    player.isStuckToWall = false;

    // Stage C: Double Flip mid-air handling
    if (!player.onGround && player.extraFlips && player.extraFlips > 0) {
      player.extraFlips--;
      audio.playDoubleFlipPickup();
      vfx.addScreenShake(2.0);
      vfx.shockwaves.push({
        x: player.x,
        y: player.y,
        radius: 12,
        maxRadius: 65,
        color: '#A855F7',
        alpha: 0.65,
        width: 3,
      });
      vfx.floatingTexts.push({
        id: Math.random().toString(),
        x: player.x,
        y: player.y - 15,
        text: 'DOUBLE FLIP!',
        color: '#C084FC',
        alpha: 1,
        scale: 1.3,
        vy: -50,
        life: 0.65,
        maxLife: 0.65,
      });
    } else {
      audio.playFlip(player.gravityDir === 'UP' || player.gravityDir === 'RIGHT' ? 'UP' : 'DOWN');
    }

    player.squashX = 0.72;
    player.squashY = 1.35;

    vfx.shockwaves.push({
      x: player.x,
      y: player.y,
      radius: 10,
      maxRadius: 50,
      color: vfx.primaryColor || '#B7FF32',
      alpha: 0.45,
      width: 2,
    });

    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10;
      const speed = 130 + Math.random() * 60;
      particles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 2,
        color: vfx.primaryColor || '#B7FF32',
        alpha: 0.85,
        life: 0.25,
        maxLife: 0.25,
      });
    }
  }

  // Cooldowns
  if (player.teleportCooldown > 0) player.teleportCooldown -= FIXED_DT;
  if (player.boostTimer > 0) player.boostTimer -= FIXED_DT;

  const preStepVy = player.vy;
  const previouslyOnGround = player.onGround;

  // 3. Stage A: Update Crumbling Platforms
  for (const plat of platforms) {
    if (plat.isCrumbling) {
      if (plat.crumbleState === 'breaking') {
        plat.crumbleTimer = (plat.crumbleTimer || 0.5) - FIXED_DT;
        plat.shakeOffset = (Math.random() - 0.5) * 4;
        if (plat.crumbleTimer <= 0) {
          plat.crumbleState = 'broken';
          plat.crumbleRespawnTimer = 3.0;
          plat.shakeOffset = 0;
          for (let k = 0; k < 12; k++) {
            particles.push({
              x: plat.x + Math.random() * plat.width,
              y: plat.y + Math.random() * plat.height,
              vx: (Math.random() - 0.5) * 80,
              vy: Math.random() * 120 + 40,
              radius: 2 + Math.random() * 3,
              color: '#FFB86C',
              alpha: 0.8,
              life: 0.6,
              maxLife: 0.6,
            });
          }
        }
      } else if (plat.crumbleState === 'broken') {
        plat.crumbleRespawnTimer = (plat.crumbleRespawnTimer || 3.0) - FIXED_DT;
        if (plat.crumbleRespawnTimer <= 0) {
          plat.crumbleState = 'idle';
          plat.crumbleTimer = 0.5;
        }
      }
    }
  }

  // 4. Stage A: Update Bounce Pad Animation Timers
  if (entities.bouncePads) {
    for (const pad of entities.bouncePads) {
      if (pad.squashTimer && pad.squashTimer > 0) {
        pad.squashTimer -= FIXED_DT;
      }
    }
  }

  // 5. Stage A: Update Switches & Doors
  if (entities.switches && entities.doors) {
    for (const sw of entities.switches) {
      const playerOverlaps =
        player.x + player.radius > sw.x &&
        player.x - player.radius < sw.x + sw.width &&
        player.y + player.radius > sw.y &&
        player.y - player.radius < sw.y + sw.height;

      let crateOverlaps = false;
      if (entities.crates) {
        for (const crate of entities.crates) {
          if (
            crate.x + crate.width > sw.x &&
            crate.x < sw.x + sw.width &&
            crate.y + crate.height > sw.y &&
            crate.y < sw.y + sw.height
          ) {
            crateOverlaps = true;
            break;
          }
        }
      }

      const isStepped = playerOverlaps || crateOverlaps;

      if (isStepped) {
        if (!sw.isPressed) {
          sw.isPressed = true;
          audio.playSwitch(true);
        }
        if (sw.timedDuration) {
          sw.timer = sw.timedDuration;
        }
      } else {
        if (sw.timedDuration) {
          if (sw.timer && sw.timer > 0) {
            sw.timer -= FIXED_DT;
            if (sw.timer <= 0) {
              sw.isPressed = false;
              audio.playSwitch(false);
            }
          }
        } else {
          if (sw.isPressed) {
            sw.isPressed = false;
            audio.playSwitch(false);
          }
        }
      }

      const targetDoor = entities.doors.find((d) => d.id === sw.targetDoorId);
      if (targetDoor) {
        targetDoor.isOpen = sw.isPressed;
      }
    }

    for (const door of entities.doors) {
      const targetProg = door.isOpen ? 1.0 : 0.0;
      door.openProgress += (targetProg - door.openProgress) * 0.18;
    }
  }

  // 6. Stage A: Pushable Crates Physics
  if (entities.crates) {
    for (const crate of entities.crates) {
      crate.vy += BASE_GRAVITY_MAGNITUDE * FIXED_DT;
      crate.vx *= 0.88;

      crate.x += crate.vx * FIXED_DT;
      crate.y += crate.vy * FIXED_DT;
      crate.onGround = false;

      for (const plat of platforms) {
        if (plat.isCrumbling && plat.crumbleState === 'broken') continue;
        resolveAABBAABB(crate, plat);
      }

      if (entities.doors) {
        for (const door of entities.doors) {
          if (door.openProgress < 0.85) {
            resolveAABBAABB(crate, door);
          }
        }
      }

      if (crate.x < 40) crate.x = 40;
      if (crate.x + crate.width > bounds.width - 40) crate.x = bounds.width - 40 - crate.width;
      if (crate.y + crate.height > bounds.height - 40) {
        crate.y = bounds.height - 40 - crate.height;
        crate.vy = 0;
        crate.onGround = true;
      }
    }
  }

  // 7. Stage B: Update Toggling Spikes Rhythm
  if (entities.spikes) {
    for (const spike of entities.spikes) {
      if (spike.isToggling) {
        spike.timer = (spike.timer || 0) - FIXED_DT;
        if (spike.timer <= 0) {
          spike.isActive = !spike.isActive;
          spike.timer = spike.toggleInterval || 1.6;
        }
        const targetRetract = spike.isActive ? 1.0 : 0.0;
        spike.retractProgress = (spike.retractProgress || 0) + (targetRetract - (spike.retractProgress || 0)) * 0.25;
      } else {
        spike.isActive = true;
        spike.retractProgress = 1.0;
      }
    }
  }

  // 8. Stage B: Update Lasers (Timed, Rotating & Blocked by Crates)
  if (entities.lasers) {
    for (const laser of entities.lasers) {
      // Rotating Laser Angle
      if (laser.isRotating && laser.pivotX !== undefined && laser.pivotY !== undefined && laser.length !== undefined) {
        laser.angle = (laser.angle || 0) + (laser.rotSpeed || 1.0) * FIXED_DT;
        laser.x1 = laser.pivotX;
        laser.y1 = laser.pivotY;
        laser.x2 = laser.pivotX + Math.cos(laser.angle) * laser.length;
        laser.y2 = laser.pivotY + Math.sin(laser.angle) * laser.length;
      }

      // Timed On/Off Laser Cycle with 0.6s Warning Flicker
      if (laser.isTimed) {
        laser.timer = (laser.timer || 0) - FIXED_DT;
        const onDur = laser.onDuration || 2.0;
        const offDur = laser.offDuration || 2.0;
        const flickerDur = laser.flickerDuration || 0.6;

        if (laser.isActive) {
          if (laser.timer <= 0) {
            laser.isActive = false;
            laser.isFlickering = false;
            laser.timer = offDur;
          }
        } else {
          // In off state: check if warning flicker should start
          if (laser.timer <= flickerDur && laser.timer > 0) {
            if (!laser.isFlickering) {
              laser.isFlickering = true;
              audio.playLaserFlicker();
            }
          }
          if (laser.timer <= 0) {
            laser.isActive = true;
            laser.isFlickering = false;
            laser.timer = onDur;
          }
        }
      }
    }
  }

  // 9. Stage B: Update Rotating Saw Blades
  if (entities.sawBlades) {
    for (const saw of entities.sawBlades) {
      saw.rotation += (saw.rotSpeed || 14) * FIXED_DT;

      // Moving path
      if (
        saw.pathStartX !== undefined &&
        saw.pathStartY !== undefined &&
        saw.pathEndX !== undefined &&
        saw.pathEndY !== undefined &&
        saw.speed !== undefined
      ) {
        saw.progress = (saw.progress || 0) + (saw.speed * FIXED_DT * (saw.dir || 1));
        if (saw.progress >= 1.0) {
          saw.progress = 1.0;
          saw.dir = -1;
        } else if (saw.progress <= 0.0) {
          saw.progress = 0.0;
          saw.dir = 1;
        }

        saw.x = saw.pathStartX + (saw.pathEndX - saw.pathStartX) * saw.progress;
        saw.y = saw.pathStartY + (saw.pathEndY - saw.pathStartY) * saw.progress;
      }
    }
  }

  // 10. Stage B: Update Patrol Drones
  if (entities.patrolDrones) {
    for (const drone of entities.patrolDrones) {
      drone.hoverPhase = (drone.hoverPhase || 0) + FIXED_DT * 4;
      const hoverY = Math.sin(drone.hoverPhase) * 4;

      drone.progress += drone.speed * FIXED_DT * (drone.dir || 1);
      if (drone.progress >= 1.0) {
        drone.progress = 1.0;
        drone.dir = -1;
      } else if (drone.progress <= 0.0) {
        drone.progress = 0.0;
        drone.dir = 1;
      }

      drone.x = drone.startX + (drone.endX - drone.startX) * drone.progress;
      drone.y = drone.startY + (drone.endY - drone.startY) * drone.progress + hoverY;

      // Drone collision with player: PUSH PLAYER AWAY (harmless bump)
      const ddx = player.x - drone.x;
      const ddy = player.y - drone.y;
      const dist = Math.sqrt(ddx * ddx + ddy * ddy);
      const minDistance = player.radius + drone.radius;

      if (dist < minDistance && dist > 0.001) {
        const nx = ddx / dist;
        const ny = ddy / dist;
        const pushForce = 460;
        player.vx = nx * pushForce;
        player.vy = ny * pushForce;
        player.x = drone.x + nx * (minDistance + 2);
        player.y = drone.y + ny * (minDistance + 2);

        audio.playDroneBump();
        vfx.addScreenShake(1.5);

        // Repulsion particles
        for (let k = 0; k < 6; k++) {
          particles.push({
            x: player.x,
            y: player.y,
            vx: nx * 100 + (Math.random() - 0.5) * 50,
            vy: ny * 100 + (Math.random() - 0.5) * 50,
            radius: 2,
            color: '#38BDF8',
            alpha: 0.8,
            life: 0.2,
            maxLife: 0.2,
          });
        }
      }
    }
  }

  // 11. Stage B: Update Falling Blocks
  if (entities.fallingBlocks) {
    for (const fb of entities.fallingBlocks) {
      if (fb.state === 'idle') {
        // Triggered when player walks underneath within triggerDistance
        const xDist = Math.abs(player.x - (fb.x + fb.width / 2));
        const isBelow = player.y > fb.y && player.y < fb.y + 400;

        if (xDist < fb.triggerDistance && isBelow) {
          fb.state = 'shaking';
          fb.shakeTimer = 0.4;
        }
      } else if (fb.state === 'shaking') {
        fb.shakeTimer -= FIXED_DT;
        fb.shakeOffset = (Math.random() - 0.5) * 5;
        if (fb.shakeTimer <= 0) {
          fb.state = 'falling';
          fb.shakeOffset = 0;
          fb.vy = 100;
        }
      } else if (fb.state === 'falling') {
        fb.vy += 2200 * FIXED_DT;
        fb.y += fb.vy * FIXED_DT;

        // Check if crushing player from above
        const crushingX = player.x + player.radius > fb.x && player.x - player.radius < fb.x + fb.width;
        const crushingY = player.y - player.radius < fb.y + fb.height && player.y + player.radius > fb.y;

        if (crushingX && crushingY) {
          if (hurtPlayer(player, vfx, particles, onPlayerDeath)) {
            return { levelComplete: false, playerDied: true };
          }
        }

        // Land on platform or floor
        for (const plat of platforms) {
          if (
            fb.x + fb.width > plat.x &&
            fb.x < plat.x + plat.width &&
            fb.y + fb.height >= plat.y &&
            fb.y + fb.height <= plat.y + 35
          ) {
            fb.y = plat.y - fb.height;
            fb.state = 'landed';
            fb.vy = 0;
            audio.playFallingBlock();
            vfx.addScreenShake(3);
            break;
          }
        }
        if (fb.y + fb.height >= bounds.height - 40 && fb.state === 'falling') {
          fb.y = bounds.height - 40 - fb.height;
          fb.state = 'landed';
          fb.vy = 0;
          audio.playFallingBlock();
          vfx.addScreenShake(3);
        }
      }
    }
  }

  // 12. Stage B: Checkpoints Activation
  if (entities.checkpoints) {
    for (const cp of entities.checkpoints) {
      const overlaps =
        player.x + player.radius > cp.x &&
        player.x - player.radius < cp.x + cp.width &&
        player.y + player.radius > cp.y &&
        player.y - player.radius < cp.y + cp.height;

      if (overlaps && !cp.isActive) {
        // Activate this checkpoint, deactivate others
        for (const other of entities.checkpoints) other.isActive = false;
        cp.isActive = true;

        player.respawnX = cp.x + cp.width / 2;
        player.respawnY = cp.y + cp.height / 2;
        player.respawnGravity = cp.respawnGravity || player.gravityDir;

        audio.playCheckpoint();
        vfx.addScreenShake(1.5);

        vfx.floatingTexts.push({
          id: Math.random().toString(),
          x: cp.x + cp.width / 2,
          y: cp.y - 14,
          text: 'CHECKPOINT',
          color: '#4ADE80',
          alpha: 1,
          scale: 1.2,
          vy: -40,
          life: 0.8,
          maxLife: 0.8,
        });

        for (let i = 0; i < 12; i++) {
          particles.push({
            x: cp.x + cp.width / 2,
            y: cp.y + cp.height / 2,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100,
            radius: 2,
            color: '#4ADE80',
            alpha: 0.9,
            life: 0.4,
            maxLife: 0.4,
          });
        }
      }
    }
  }

  // 13. Fixed Substep Integration for Player
  let currentSurfaceFriction = BASE_GROUND_FRICTION;

  for (let s = 0; s < SUBSTEPS; s++) {
    let gravityMultiplier = 1.0;
    if (entities.gravityZones) {
      for (const gz of entities.gravityZones) {
        if (
          player.x > gz.x &&
          player.x < gz.x + gz.width &&
          player.y > gz.y &&
          player.y < gz.y + gz.height
        ) {
          gravityMultiplier = gz.multiplier;
          if (gz.type === 'LOW' && Math.random() < 0.25) {
            particles.push({
              x: player.x + (Math.random() - 0.5) * 24,
              y: player.y + (Math.random() - 0.5) * 24,
              vx: (Math.random() - 0.5) * 20,
              vy: -20 - Math.random() * 30,
              radius: 1.5 + Math.random() * 2,
              color: '#D8B4FE',
              alpha: 0.7,
              life: 0.5,
              maxLife: 0.5,
            });
          }
        }
      }
    }

    let gx = 0;
    let gy = 0;
    const gMag = BASE_GRAVITY_MAGNITUDE * gravityMultiplier;
    switch (player.gravityDir) {
      case 'DOWN':
        gy = gMag;
        break;
      case 'UP':
        gy = -gMag;
        break;
      case 'LEFT':
        gx = -gMag;
        break;
      case 'RIGHT':
        gx = gMag;
        break;
    }

    player.vx += gx * SUB_DT;
    player.vy += gy * SUB_DT;

    if (entities.windZones) {
      for (const wz of entities.windZones) {
        if (
          player.x > wz.x &&
          player.x < wz.x + wz.width &&
          player.y > wz.y &&
          player.y < wz.y + wz.height
        ) {
          player.vx += wz.forceX * SUB_DT;
          player.vy += wz.forceY * SUB_DT;
        }
      }
    }

    if (entities.magnets) {
      for (const mag of entities.magnets) {
        const magCenterX = mag.x + mag.width / 2;
        const magCenterY = mag.y + mag.height / 2;
        const mdx = magCenterX - player.x;
        const mdy = magCenterY - player.y;
        const dist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (dist < mag.radius && dist > 2) {
          const forceRatio = 1 - dist / mag.radius;
          const pullMag = mag.strength * forceRatio;
          player.vx += (mdx / dist) * pullMag * SUB_DT;
          player.vy += (mdy / dist) * pullMag * SUB_DT;

          if (Math.random() < 0.2) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (mdx / dist) * 70,
              vy: (mdy / dist) * 70,
              radius: 1.5,
              color: '#38BDF8',
              alpha: 0.75,
              life: 0.2,
              maxLife: 0.2,
            });
          }
        }
      }
    }

    const isVerticalGravity = player.gravityDir === 'DOWN' || player.gravityDir === 'UP';

    if (isVerticalGravity) {
      const accel = player.onGround ? MOVE_ACCEL_GROUND : MOVE_ACCEL_AIR;
      const maxSpeed = player.boostTimer > 0 ? MAX_RUN_SPEED * 1.6 : MAX_RUN_SPEED;

      if (input.left) {
        player.vx -= accel * SUB_DT;
        if (player.vx < -maxSpeed) player.vx = -maxSpeed;
        player.facingDir = -1;
      } else if (input.right) {
        player.vx += accel * SUB_DT;
        if (player.vx > maxSpeed) player.vx = maxSpeed;
        player.facingDir = 1;
      } else {
        if (player.onGround) {
          player.vx *= Math.pow(currentSurfaceFriction, 1 / SUBSTEPS);
        } else {
          player.vx *= Math.pow(AIR_DRAG, 1 / SUBSTEPS);
        }
      }
    } else {
      const accel = player.onGround ? MOVE_ACCEL_GROUND : MOVE_ACCEL_AIR;
      const maxSpeed = player.boostTimer > 0 ? MAX_RUN_SPEED * 1.6 : MAX_RUN_SPEED;

      if (input.left) {
        player.vy -= accel * SUB_DT;
        if (player.vy < -maxSpeed) player.vy = -maxSpeed;
      } else if (input.right) {
        player.vy += accel * SUB_DT;
        if (player.vy > maxSpeed) player.vy = maxSpeed;
      } else {
        if (player.onGround) {
          player.vy *= Math.pow(currentSurfaceFriction, 1 / SUBSTEPS);
        } else {
          player.vy *= Math.pow(AIR_DRAG, 1 / SUBSTEPS);
        }
      }
    }

    if (player.isStuckToWall) {
      const maxSlide = 45;
      if (player.vy > maxSlide) player.vy = maxSlide;
      if (player.vy < -maxSlide) player.vy = -maxSlide;
    }

    player.x += player.vx * SUB_DT;
    player.y += player.vy * SUB_DT;

    player.onGround = false;

    // Platform Collisions
    for (const plat of platforms) {
      if (plat.isCrumbling && plat.crumbleState === 'broken') continue;

      const hit = resolveCircleAABBCollision(player, plat);
      if (hit.collided) {
        if (plat.surfaceType === 'sticky') {
          if (!player.isStuckToWall) {
            player.isStuckToWall = true;
            audio.playSticky();
          }
        }

        if (plat.surfaceType === 'ice') {
          currentSurfaceFriction = ICE_GROUND_FRICTION;
        } else {
          currentSurfaceFriction = BASE_GROUND_FRICTION;
        }

        if (plat.isCrumbling && plat.crumbleState === 'idle') {
          plat.crumbleState = 'breaking';
          plat.crumbleTimer = 0.5;
          audio.playCrumble();
        }
      }
    }

    // Door Collisions
    if (entities.doors) {
      for (const door of entities.doors) {
        if (door.openProgress < 0.85) {
          resolveCircleAABBCollision(player, door);
        }
      }
    }

    // Landed Falling Block Collisions (act as solid obstacle)
    if (entities.fallingBlocks) {
      for (const fb of entities.fallingBlocks) {
        if (fb.state === 'landed') {
          resolveCircleAABBCollision(player, fb);
        }
      }
    }

    // Crate Collisions
    if (entities.crates) {
      for (const crate of entities.crates) {
        const cdx = player.x - (crate.x + crate.width / 2);
        const cdy = player.y - (crate.y + crate.height / 2);
        const halfW = crate.width / 2 + player.radius;
        const halfH = crate.height / 2 + player.radius;

        if (Math.abs(cdx) < halfW && Math.abs(cdy) < halfH) {
          const ox = halfW - Math.abs(cdx);
          const oy = halfH - Math.abs(cdy);

          if (ox < oy) {
            if (cdx > 0) {
              player.x = crate.x + crate.width + player.radius;
              crate.vx = player.vx * 0.75 - 40;
            } else {
              player.x = crate.x - player.radius;
              crate.vx = player.vx * 0.75 + 40;
            }
          } else {
            if (cdy > 0) {
              player.y = crate.y + crate.height + player.radius;
              if (player.vy < 0) player.vy = 0;
            } else {
              player.y = crate.y - player.radius;
              if (player.vy > 0) player.vy = 0;
              player.onGround = true;
            }
          }
        }
      }
    }

    // Room boundaries
    if (player.x - player.radius < 0) {
      player.x = player.radius;
      if (player.vx < 0) player.vx = 0;
    } else if (player.x + player.radius > bounds.width) {
      player.x = bounds.width - player.radius;
      if (player.vx > 0) player.vx = 0;
    }
    if (player.y - player.radius < 0) {
      player.y = player.radius;
      if (player.vy < 0) player.vy = 0;
    } else if (player.y + player.radius > bounds.height) {
      player.y = bounds.height - player.radius;
      if (player.vy > 0) player.vy = 0;
    }
  }

  // 14. Stage B: Hazard Collisions (Spikes, Lasers, Saw Blades) -> Instant Checkpoint Respawn
  // 14A. Spikes Collision
  if (entities.spikes) {
    for (const spike of entities.spikes) {
      if (!spike.isActive || (spike.retractProgress !== undefined && spike.retractProgress < 0.3)) continue;

      const hitSpike =
        player.x + player.radius * 0.75 > spike.x &&
        player.x - player.radius * 0.75 < spike.x + spike.width &&
        player.y + player.radius * 0.75 > spike.y &&
        player.y - player.radius * 0.75 < spike.y + spike.height;

      if (hitSpike) {
        if (hurtPlayer(player, vfx, particles, onPlayerDeath)) {
          return { levelComplete: false, playerDied: true };
        }
      }
    }
  }

  // 14B. Saw Blades Collision
  if (entities.sawBlades) {
    for (const saw of entities.sawBlades) {
      const sDx = player.x - saw.x;
      const sDy = player.y - saw.y;
      const sDistSq = sDx * sDx + sDy * sDy;
      const killDist = player.radius + saw.radius * 0.85;

      if (sDistSq < killDist * killDist) {
        if (hurtPlayer(player, vfx, particles, onPlayerDeath)) {
          return { levelComplete: false, playerDied: true };
        }
      }
    }
  }

  // 14C. Lasers Collision (with blocking by crates & platforms)
  if (entities.lasers) {
    for (const laser of entities.lasers) {
      if (!laser.isActive) continue;

      // Find effective laser end point (clipped by crates & platforms)
      let endX = laser.x2;
      let endY = laser.y2;

      // Check crates blocking laser
      if (entities.crates) {
        for (const crate of entities.crates) {
          const hitDist = lineAABBIntersection(laser.x1, laser.y1, endX, endY, crate);
          if (hitDist !== null) {
            endX = laser.x1 + (endX - laser.x1) * hitDist;
            endY = laser.y1 + (endY - laser.y1) * hitDist;
          }
        }
      }

      // Check platforms blocking laser
      for (const plat of platforms) {
        if (plat.isCrumbling && plat.crumbleState === 'broken') continue;
        const hitDist = lineAABBIntersection(laser.x1, laser.y1, endX, endY, plat);
        if (hitDist !== null) {
          endX = laser.x1 + (endX - laser.x1) * hitDist;
          endY = laser.y1 + (endY - laser.y1) * hitDist;
        }
      }

      // Check if player intersects active unblocked segment
      if (lineCircleIntersection(laser.x1, laser.y1, endX, endY, player.x, player.y, player.radius * 0.8)) {
        if (hurtPlayer(player, vfx, particles, onPlayerDeath)) {
          return { levelComplete: false, playerDied: true };
        }
      }
    }
  }

  // Hazard Proximity Detection for scared face expressions
  let nearHazard = false;
  const hazardWarnDist = 95;
  if (entities.spikes) {
    for (const s of entities.spikes) {
      if (!s.isActive || (s.retractProgress !== undefined && s.retractProgress < 0.3)) continue;
      const cX = Math.max(s.x, Math.min(player.x, s.x + s.width));
      const cY = Math.max(s.y, Math.min(player.y, s.y + s.height));
      const dX = player.x - cX;
      const dY = player.y - cY;
      if (dX * dX + dY * dY < hazardWarnDist * hazardWarnDist) {
        nearHazard = true;
        break;
      }
    }
  }
  if (!nearHazard && entities.sawBlades) {
    for (const saw of entities.sawBlades) {
      const dX = player.x - saw.x;
      const dY = player.y - saw.y;
      if (dX * dX + dY * dY < (hazardWarnDist + saw.radius) * (hazardWarnDist + saw.radius)) {
        nearHazard = true;
        break;
      }
    }
  }
  if (!nearHazard && entities.lasers) {
    for (const laser of entities.lasers) {
      if (!laser.isActive && !laser.isFlickering) continue;
      if (lineCircleIntersection(laser.x1, laser.y1, laser.x2, laser.y2, player.x, player.y, hazardWarnDist)) {
        nearHazard = true;
        break;
      }
    }
  }
  player.isNearHazard = nearHazard;

  // 15. Stage A: Check Bounce Pads
  if (entities.bouncePads) {
    for (const pad of entities.bouncePads) {
      const overlaps =
        player.x + player.radius > pad.x &&
        player.x - player.radius < pad.x + pad.width &&
        player.y + player.radius > pad.y &&
        player.y - player.radius < pad.y + pad.height;

      if (overlaps) {
        pad.squashTimer = 0.22;
        audio.playBounce();
        vfx.addScreenShake(2);

        switch (pad.direction) {
          case 'UP':
            player.vy = -pad.force;
            player.squashY = 1.45;
            player.squashX = 0.65;
            break;
          case 'DOWN':
            player.vy = pad.force;
            player.squashY = 1.45;
            player.squashX = 0.65;
            break;
          case 'LEFT':
            player.vx = -pad.force;
            player.squashX = 1.45;
            player.squashY = 0.65;
            break;
          case 'RIGHT':
            player.vx = pad.force;
            player.squashX = 1.45;
            player.squashY = 0.65;
            break;
        }

        for (let b = 0; b < 10; b++) {
          particles.push({
            x: pad.x + pad.width / 2,
            y: pad.y + pad.height / 2,
            vx: (Math.random() - 0.5) * 140,
            vy: (Math.random() - 0.5) * 140,
            radius: 2 + Math.random() * 2,
            color: '#FACC15',
            alpha: 0.9,
            life: 0.28,
            maxLife: 0.28,
          });
        }
      }
    }
  }

  // 16. Stage A: Speed Boost Strips
  if (entities.boostStrips) {
    for (const strip of entities.boostStrips) {
      const overlaps =
        player.x + player.radius > strip.x &&
        player.x - player.radius < strip.x + strip.width &&
        player.y + player.radius > strip.y &&
        player.y - player.radius < strip.y + strip.height;

      if (overlaps) {
        player.boostTimer = 0.5;
        audio.playBoost();

        if (strip.direction === 'RIGHT') {
          player.vx = Math.max(player.vx, strip.speed);
        } else if (strip.direction === 'LEFT') {
          player.vx = Math.min(player.vx, -strip.speed);
        } else if (strip.direction === 'UP') {
          player.vy = Math.min(player.vy, -strip.speed);
        } else if (strip.direction === 'DOWN') {
          player.vy = Math.max(player.vy, strip.speed);
        }
      }
    }
  }

  // 17. Stage A: Gravity Gates
  if (entities.gravityGates) {
    for (const gate of entities.gravityGates) {
      const overlaps =
        player.x + player.radius > gate.x &&
        player.x - player.radius < gate.x + gate.width &&
        player.y + player.radius > gate.y &&
        player.y - player.radius < gate.y + gate.height;

      if (overlaps && player.gravityDir !== gate.direction) {
        player.gravityDir = gate.direction;
        audio.playFlip(gate.direction === 'UP' || gate.direction === 'RIGHT' ? 'UP' : 'DOWN');

        vfx.shockwaves.push({
          x: gate.x + gate.width / 2,
          y: gate.y + gate.height / 2,
          radius: 12,
          maxRadius: 55,
          color: vfx.secondaryColor || '#6CFF80',
          alpha: 0.6,
          width: 2.5,
        });
      }
    }
  }

  // 18. Stage A: Teleporters
  if (entities.teleporters) {
    for (const tp of entities.teleporters) {
      const overlaps =
        player.x + player.radius > tp.x &&
        player.x - player.radius < tp.x + tp.width &&
        player.y + player.radius > tp.y &&
        player.y - player.radius < tp.y + tp.height;

      if (overlaps && player.teleportCooldown <= 0) {
        const dest = entities.teleporters.find((t) => t.id === tp.pairId);
        if (dest) {
          for (let k = 0; k < 12; k++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              radius: 2 + Math.random() * 2,
              color: tp.color,
              alpha: 0.85,
              life: 0.3,
              maxLife: 0.3,
            });
          }

          const destCenterX = dest.x + dest.width / 2;
          const destCenterY = dest.y + dest.height / 2;

          player.x = destCenterX + (dest.exitDirX || 0) * (dest.width / 2 + player.radius + 6);
          player.y = destCenterY + (dest.exitDirY || 0) * (dest.height / 2 + player.radius + 6);
          player.teleportCooldown = 0.65;

          audio.playTeleport();

          for (let k = 0; k < 12; k++) {
            particles.push({
              x: player.x,
              y: player.y,
              vx: (Math.random() - 0.5) * 120,
              vy: (Math.random() - 0.5) * 120,
              radius: 2 + Math.random() * 2,
              color: dest.color,
              alpha: 0.85,
              life: 0.3,
              maxLife: 0.3,
            });
          }
        }
      }
    }
  }

  // 19. Landing detection
  if (!previouslyOnGround && player.onGround) {
    const impactSpeed = Math.abs(preStepVy);
    player.landingTimer = 0.28; // Character exaggerated landing pose (arms drop, legs bend into crouch)
    if (impactSpeed > 100) {
      if (impactSpeed > 180) audio.playLand(impactSpeed);
      player.squashX = 1.48;
      player.squashY = 0.58;

      const contactY =
        player.gravityDir === 'DOWN' ? player.y + player.radius : player.y - player.radius;
      const count = impactSpeed > 180 ? 6 : 4;
      for (let i = 0; i < count; i++) {
        const pSpeed = (Math.random() - 0.5) * 110;
        particles.push({
          x: player.x + (Math.random() - 0.5) * 14,
          y: contactY,
          vx: pSpeed,
          vy: player.gravityDir === 'DOWN' ? -15 - Math.random() * 25 : 15 + Math.random() * 25,
          radius: 1.5 + Math.random() * 1.8,
          color: vfx.secondaryColor || '#6CFF80',
          alpha: 0.75,
          life: 0.2,
          maxLife: 0.2,
        });
      }
    }
  }

  if (player.landingTimer && player.landingTimer > 0) {
    player.landingTimer -= FIXED_DT;
  }

  // Smooth Visual Gravity Flip 180-Degree Rotation
  if (player.visualAngle === undefined) {
    player.visualAngle =
      player.gravityDir === 'UP'
        ? Math.PI
        : player.gravityDir === 'LEFT'
        ? Math.PI * 0.5
        : player.gravityDir === 'RIGHT'
        ? -Math.PI * 0.5
        : 0;
  }
  let targetAngle = 0;
  if (player.gravityDir === 'UP') targetAngle = Math.PI;
  else if (player.gravityDir === 'LEFT') targetAngle = Math.PI * 0.5;
  else if (player.gravityDir === 'RIGHT') targetAngle = -Math.PI * 0.5;

  let angleDiff = targetAngle - player.visualAngle;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  player.visualAngle += angleDiff * Math.min(1, FIXED_DT * 18);

  // Update Run Cycle Cadence
  const isVerticalGravity = player.gravityDir === 'DOWN' || player.gravityDir === 'UP';
  const isHorizRun = Math.abs(player.vx) > 15;
  const isVertRun = Math.abs(player.vy) > 15;
  const isRunning = player.onGround && (isVerticalGravity ? isHorizRun : isVertRun);
  if (isRunning) {
    const moveSpeed = isVerticalGravity ? Math.abs(player.vx) : Math.abs(player.vy);
    player.runCycle = ((player.runCycle || 0) + moveSpeed * FIXED_DT * 0.05) % (Math.PI * 2);
  } else {
    player.runCycle = 0;
  }

  // Wall slide friction dust
  if (player.isStuckToWall && Math.random() < 0.25) {
    particles.push({
      x: player.x + (player.facingDir || 1) * player.radius,
      y: player.y + (Math.random() - 0.5) * 8,
      vx: -(player.facingDir || 1) * (10 + Math.random() * 20),
      vy: (Math.random() - 0.5) * 20,
      radius: 1.2 + Math.random() * 1.5,
      color: '#38BDF8',
      alpha: 0.6,
      life: 0.2,
      maxLife: 0.2,
    });
  }

  player.squashX += (1 - player.squashX) * 0.16;
  player.squashY += (1 - player.squashY) * 0.16;

  // Facial Expression State Machine
  if (player.expressionTimer > 0) {
    player.expressionTimer -= FIXED_DT;
    if (player.expressionTimer <= 0) {
      player.expression = 'normal';
    }
  } else {
    // If hazard nearby, display scared face
    let nearHazard = false;
    if (entities.sawBlades) {
      for (const saw of entities.sawBlades) {
        const dist = Math.hypot(player.x - saw.x, player.y - saw.y);
        if (dist < saw.radius + 60) nearHazard = true;
      }
    }
    if (entities.spikes && !nearHazard) {
      for (const spike of entities.spikes) {
        if (spike.isActive && Math.hypot(player.x - (spike.x + spike.width / 2), player.y - (spike.y + spike.height / 2)) < 55) {
          nearHazard = true;
        }
      }
    }

    if (nearHazard || Math.abs(player.vy) > 600) {
      player.expression = 'scared';
    } else {
      player.blinkTimer = (player.blinkTimer || 3) - FIXED_DT;
      if (player.blinkTimer <= 0) {
        player.expression = 'blink';
        if (player.blinkTimer <= -0.14) {
          player.expression = 'normal';
          player.blinkTimer = 2.5 + Math.random() * 2.5;
        }
      } else {
        player.expression = 'normal';
      }
    }
  }

  // Record glowing trail
  player.trail.unshift({
    x: player.x,
    y: player.y,
    alpha: player.boostTimer > 0 ? 1.0 : 0.85,
    size: player.radius * (player.boostTimer > 0 ? 1.15 : 0.9),
  });
  const maxTrail = player.boostTimer > 0 ? 16 : 10;
  if (player.trail.length > maxTrail) {
    player.trail.pop();
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * FIXED_DT;
    p.y += p.vy * FIXED_DT;
    p.life -= FIXED_DT;
    p.alpha = Math.max(0, p.life / p.maxLife);
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Update shockwaves
  for (let i = vfx.shockwaves.length - 1; i >= 0; i--) {
    const sw = vfx.shockwaves[i];
    sw.radius += (sw.maxRadius - sw.radius) * 0.14 + 1.5;
    sw.alpha -= FIXED_DT * 2.2;
    if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
      vfx.shockwaves.splice(i, 1);
    }
  }

  // Update floating texts
  for (let i = vfx.floatingTexts.length - 1; i >= 0; i--) {
    const ft = vfx.floatingTexts[i];
    ft.y += ft.vy * FIXED_DT;
    ft.life -= FIXED_DT;
    ft.alpha = Math.max(0, ft.life / ft.maxLife);
    if (ft.life <= 0) {
      vfx.floatingTexts.splice(i, 1);
    }
  }

  // Animate and check crystals
  for (const crystal of crystals) {
    if (!crystal.collected) {
      crystal.pulsePhase += FIXED_DT * 3;
      const bobOffset = Math.sin(crystal.pulsePhase) * 6;
      crystal.y = crystal.baseY + bobOffset;

      const dx = player.x - crystal.x;
      const dy = player.y - crystal.y;
      const distSq = dx * dx + dy * dy;
      const pickupDist = player.radius + 16;
      if (distSq < pickupDist * pickupDist) {
        crystal.collected = true;
        player.expression = 'happy';
        player.expressionTimer = 0.9;
        vfx.addScreenShake(2.5);

        // Stage C: Combo System
        const isMidAir = !player.onGround;
        const isQuick = (player.comboTimer || 0) > 0;
        const currentCombo = (isQuick || isMidAir) ? ((player.comboCount || 1) + 1) : 1;
        player.comboCount = currentCombo;
        player.comboTimer = 2.8;

        vfx.floatingTexts.push({
          id: Math.random().toString(),
          x: crystal.x,
          y: crystal.y - 12,
          text: currentCombo > 1 ? `x${currentCombo} COMBO!` : '+1',
          color: currentCombo > 1 ? '#FBBF24' : (vfx.secondaryColor || '#6CFF80'),
          alpha: 1,
          scale: currentCombo > 1 ? 1.55 : 1.4,
          vy: currentCombo > 1 ? -75 : -60,
          life: 0.8,
          maxLife: 0.8,
        });

        for (let i = 0; i < 16; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 90 + Math.random() * 120;
          particles.push({
            x: crystal.x,
            y: crystal.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2.5 + Math.random() * 2.5,
            color: currentCombo > 1 ? '#FBBF24' : (vfx.secondaryColor || '#6CFF80'),
            alpha: 1,
            life: 0.5,
            maxLife: 0.5,
          });
        }

        const collectedTotal = crystals.filter((c) => c.collected).length;
        if (currentCombo > 1) {
          audio.playCombo(currentCombo);
        } else {
          audio.playCrystal(collectedTotal);
        }

        if (onCrystalCollect) onCrystalCollect(crystal);
      }
    }
  }

  // Stage C: Rare Golden Star Crystal
  if (entities.starCrystal && !entities.starCrystal.collected) {
    const sc = entities.starCrystal;
    sc.pulsePhase += FIXED_DT * 3.5;
    const bobOffset = Math.sin(sc.pulsePhase) * 6;
    sc.y = sc.baseY + bobOffset;

    const dx = player.x - sc.x;
    const dy = player.y - sc.y;
    const distSq = dx * dx + dy * dy;
    const pickupDist = player.radius + 18;
    if (distSq < pickupDist * pickupDist) {
      sc.collected = true;
      player.hasStarCrystal = true;
      player.expression = 'happy';
      player.expressionTimer = 1.2;
      vfx.addScreenShake(3.5);

      vfx.floatingTexts.push({
        id: Math.random().toString(),
        x: sc.x,
        y: sc.y - 20,
        text: '★ STAR CRYSTAL!',
        color: '#FFD700',
        alpha: 1,
        scale: 1.7,
        vy: -75,
        life: 1.2,
        maxLife: 1.2,
      });

      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 110 + Math.random() * 130;
        particles.push({
          x: sc.x,
          y: sc.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 3 + Math.random() * 3,
          color: '#FFD700',
          alpha: 1,
          life: 0.6,
          maxLife: 0.6,
        });
      }

      audio.playStarCrystal();
    }
  }

  // Stage C: Time Slow Pickups
  if (entities.timeSlowPickups) {
    for (const tsp of entities.timeSlowPickups) {
      if (tsp.collected) continue;
      tsp.pulsePhase += FIXED_DT * 2.8;
      tsp.y = tsp.baseY + Math.sin(tsp.pulsePhase) * 5;
      const dx = player.x - tsp.x;
      const dy = player.y - tsp.y;
      if (dx * dx + dy * dy < (player.radius + 16) ** 2) {
        tsp.collected = true;
        player.timeSlowTimer = 3.0;
        audio.playTimeSlow();
        vfx.addScreenShake(2.0);
        vfx.floatingTexts.push({
          id: Math.random().toString(),
          x: tsp.x,
          y: tsp.y - 15,
          text: '⏳ TIME SLOW 3s!',
          color: '#38BDF8',
          alpha: 1,
          scale: 1.4,
          vy: -60,
          life: 0.9,
          maxLife: 0.9,
        });
      }
    }
  }

  // Stage C: Shield Pickups
  if (entities.shieldPickups) {
    for (const sp of entities.shieldPickups) {
      if (sp.collected) continue;
      sp.pulsePhase += FIXED_DT * 2.5;
      sp.y = sp.baseY + Math.sin(sp.pulsePhase) * 5;
      const dx = player.x - sp.x;
      const dy = player.y - sp.y;
      if (dx * dx + dy * dy < (player.radius + 16) ** 2) {
        sp.collected = true;
        player.hasShield = true;
        audio.playShieldPickup();
        vfx.addScreenShake(2.5);
        vfx.floatingTexts.push({
          id: Math.random().toString(),
          x: sp.x,
          y: sp.y - 15,
          text: '🛡️ SHIELD ACTIVE!',
          color: '#06B6D4',
          alpha: 1,
          scale: 1.5,
          vy: -60,
          life: 0.9,
          maxLife: 0.9,
        });
      }
    }
  }

  // Stage C: Double Flip Pickups
  if (entities.doubleFlipPickups) {
    for (const dfp of entities.doubleFlipPickups) {
      if (dfp.collected) continue;
      dfp.pulsePhase += FIXED_DT * 3.0;
      dfp.y = dfp.baseY + Math.sin(dfp.pulsePhase) * 5;
      const dx = player.x - dfp.x;
      const dy = player.y - dfp.y;
      if (dx * dx + dy * dy < (player.radius + 16) ** 2) {
        dfp.collected = true;
        player.extraFlips = (player.extraFlips || 0) + 1;
        audio.playDoubleFlipPickup();
        vfx.addScreenShake(2.0);
        vfx.floatingTexts.push({
          id: Math.random().toString(),
          x: dfp.x,
          y: dfp.y - 15,
          text: '⚡ DOUBLE FLIP READY!',
          color: '#C084FC',
          alpha: 1,
          scale: 1.4,
          vy: -60,
          life: 0.9,
          maxLife: 0.9,
        });
      }
    }
  }

  // Stage D: Rising Danger Floor (Bosses 10 & 40)
  if (entities.risingFloor && entities.risingFloor.active) {
    const rf = entities.risingFloor;
    rf.y -= rf.speed * FIXED_DT;
    if (player.y + player.radius >= rf.y) {
      hurtPlayer(player, vfx, particles, onPlayerDeath);
      // Give a tiny upward bounce away from floor if player had shield
      if (player.invulnerableTimer && player.invulnerableTimer > 0) {
        player.vy = -380;
      }
    }
  }

  // Stage D: Automatic Gravity Inversion (Bosses 20 & 40)
  if (entities.chaosGravityInterval && entities.chaosGravityInterval > 0) {
    player.chaosTimer = (player.chaosTimer ?? entities.chaosGravityInterval) - FIXED_DT;
    if (player.chaosTimer <= 0) {
      player.chaosTimer = entities.chaosGravityInterval;
      // Cycle through gravity directions
      const order: ('DOWN' | 'UP' | 'LEFT' | 'RIGHT')[] = ['DOWN', 'UP', 'LEFT', 'RIGHT'];
      const curIdx = order.indexOf(player.gravityDir);
      player.gravityDir = order[(curIdx + 1) % order.length];
      audio.playFlip(player.gravityDir === 'UP' || player.gravityDir === 'RIGHT' ? 'UP' : 'DOWN');
      vfx.addScreenShake(3.5);
      vfx.triggerColorFlash('rgba(244, 63, 94, 0.25)');
      vfx.floatingTexts.push({
        id: Math.random().toString(),
        x: player.x,
        y: player.y - 20,
        text: `⚡ GRAV SHIFT: ${player.gravityDir}!`,
        color: '#F43F5E',
        alpha: 1,
        scale: 1.5,
        vy: -70,
        life: 0.9,
        maxLife: 0.9,
      });
    }
  }

  // Stage D: Secret Passages & Rooms
  if (entities.secretPassages) {
    for (const sp of entities.secretPassages) {
      const inside =
        player.x >= sp.x &&
        player.x <= sp.x + sp.width &&
        player.y >= sp.y &&
        player.y <= sp.y + sp.height;
      if (inside && !sp.revealed) {
        sp.revealed = true;
        player.secretsDiscovered = (player.secretsDiscovered || 0) + 1;
        audio.playSecretDiscovered();
        vfx.addScreenShake(3.0);
        vfx.triggerColorFlash('rgba(251, 191, 36, 0.25)');
        vfx.floatingTexts.push({
          id: Math.random().toString(),
          x: player.x,
          y: player.y - 20,
          text: '✨ SECRET ROOM FOUND!',
          color: '#FBBF24',
          alpha: 1,
          scale: 1.6,
          vy: -60,
          life: 1.4,
          maxLife: 1.4,
        });
      }

      if (sp.revealed && sp.bonusCrystals) {
        for (const c of sp.bonusCrystals) {
          if (c.collected) continue;
          c.pulsePhase += FIXED_DT * 3;
          c.y = c.baseY + Math.sin(c.pulsePhase) * 4;
          const cDx = player.x - c.x;
          const cDy = player.y - c.y;
          if (cDx * cDx + cDy * cDy < (player.radius + 14) ** 2) {
            c.collected = true;
            if (onCrystalCollect) onCrystalCollect(c);
          }
        }
      }
    }
  }

  // Animate and check portal
  portal.rotation += FIXED_DT * 2.5;
  const pDx = player.x - portal.x;
  const pDy = player.y - portal.y;
  const pDist = Math.sqrt(pDx * pDx + pDy * pDy);
  if (pDist < player.radius + portal.radius * 0.75 && !player.suckedIntoPortal) {
    player.suckedIntoPortal = true;
    player.portalSuckProgress = 0;
    audio.playPortalEnter();
    vfx.addScreenShake(5);
  }

  return { levelComplete: false };
}

// Stage C: Hazard Hit Resolution with Shield Absorption & Invulnerability frames
function hurtPlayer(
  player: Player,
  vfx: VisualEffectsState,
  particles: Particle[],
  onPlayerDeath?: (x: number, y: number) => void
): boolean {
  if (player.invulnerableTimer && player.invulnerableTimer > 0) {
    return false; // i-frame protected, player takes no damage
  }

  if (player.hasShield) {
    player.hasShield = false;
    player.invulnerableTimer = 0.9; // 0.9s i-frames
    audio.playShieldBreak();
    vfx.addScreenShake(3.5);

    vfx.floatingTexts.push({
      id: Math.random().toString(),
      x: player.x,
      y: player.y - 18,
      text: 'SHIELD BROKE!',
      color: '#38BDF8',
      alpha: 1,
      scale: 1.5,
      vy: -60,
      life: 0.85,
      maxLife: 0.85,
    });

    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 110 + Math.random() * 110;
      particles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 2,
        color: '#38BDF8',
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
      });
    }
    return false; // Survived!
  }

  killAndRespawnPlayer(player, vfx, particles, onPlayerDeath);
  return true; // Died and respawned
}

// Stage B: Instant Respawn at Last Checkpoint (Zero Reload Delay)
function killAndRespawnPlayer(
  player: Player,
  vfx: VisualEffectsState,
  particles: Particle[],
  onPlayerDeath?: (x: number, y: number) => void
): void {
  const deathX = player.x;
  const deathY = player.y;
  player.deathCount = (player.deathCount || 0) + 1;
  player.lastDeathX = deathX;
  player.lastDeathY = deathY;

  if (onPlayerDeath) {
    onPlayerDeath(deathX, deathY);
  }

  audio.playHazard();
  vfx.addScreenShake(3.5);

  // Spawn death burst particles at point of death
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16;
    const speed = 120 + Math.random() * 80;
    particles.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2.5 + Math.random() * 2.5,
      color: '#FF5555',
      alpha: 1.0,
      life: 0.35,
      maxLife: 0.35,
    });
  }

  // Instant respawn at last saved checkpoint (or spawn point)
  player.x = player.respawnX;
  player.y = player.respawnY;
  player.vx = 0;
  player.vy = 0;
  player.gravityDir = player.respawnGravity;
  player.isStuckToWall = false;
  player.boostTimer = 0;
  player.squashX = 1;
  player.squashY = 1;
  player.trail = [];
  player.invulnerableTimer = 1.0; // Short invulnerability after respawn to prevent unfair deaths
}

function resolveCircleAABBCollision(
  player: Player,
  plat: { x: number; y: number; width: number; height: number }
): { collided: boolean } {
  const closestX = Math.max(plat.x, Math.min(player.x, plat.x + plat.width));
  const closestY = Math.max(plat.y, Math.min(player.y, plat.y + plat.height));

  const dx = player.x - closestX;
  const dy = player.y - closestY;
  const distSq = dx * dx + dy * dy;

  if (distSq < player.radius * player.radius) {
    const dist = Math.sqrt(distSq);
    let nx = 0;
    let ny = 0;
    let penetration = 0;

    if (dist > 0.0001) {
      nx = dx / dist;
      ny = dy / dist;
      penetration = player.radius - dist;
    } else {
      const distToLeft = player.x - plat.x;
      const distToRight = plat.x + plat.width - player.x;
      const distToTop = player.y - plat.y;
      const distToBottom = plat.y + plat.height - player.y;

      const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);
      if (minDist === distToLeft) {
        nx = -1;
        penetration = distToLeft + player.radius;
      } else if (minDist === distToRight) {
        nx = 1;
        penetration = distToRight + player.radius;
      } else if (minDist === distToTop) {
        ny = -1;
        penetration = distToTop + player.radius;
      } else {
        ny = 1;
        penetration = distToBottom + player.radius;
      }
    }

    player.x += nx * penetration;
    player.y += ny * penetration;

    const normalVel = player.vx * nx + player.vy * ny;
    if (normalVel < 0) {
      player.vx -= (1 + RESTITUTION) * normalVel * nx;
      player.vy -= (1 + RESTITUTION) * normalVel * ny;
    }

    if (player.gravityDir === 'DOWN' && ny < -0.6) {
      player.onGround = true;
    } else if (player.gravityDir === 'UP' && ny > 0.6) {
      player.onGround = true;
    } else if (player.gravityDir === 'LEFT' && nx > 0.6) {
      player.onGround = true;
    } else if (player.gravityDir === 'RIGHT' && nx < -0.6) {
      player.onGround = true;
    }

    return { collided: true };
  }

  return { collided: false };
}

function resolveAABBAABB(
  boxA: { x: number; y: number; width: number; height: number; vx: number; vy: number; onGround: boolean },
  boxB: { x: number; y: number; width: number; height: number }
): void {
  const overlapX = Math.min(boxA.x + boxA.width, boxB.x + boxB.width) - Math.max(boxA.x, boxB.x);
  const overlapY = Math.min(boxA.y + boxA.height, boxB.y + boxB.height) - Math.max(boxA.y, boxB.y);

  if (overlapX > 0 && overlapY > 0) {
    if (overlapX < overlapY) {
      if (boxA.x < boxB.x) {
        boxA.x -= overlapX;
      } else {
        boxA.x += overlapX;
      }
      boxA.vx = 0;
    } else {
      if (boxA.y < boxB.y) {
        boxA.y -= overlapY;
        boxA.vy = 0;
        boxA.onGround = true;
      } else {
        boxA.y += overlapY;
        boxA.vy = 0;
      }
    }
  }
}

// Stage B: Ray vs AABB intersection for laser blocking by crates/platforms
export function lineAABBIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  box: { x: number; y: number; width: number; height: number }
): number | null {
  const dx = x2 - x1;
  const dy = y2 - y1;

  let tMin = 0;
  let tMax = 1;

  if (Math.abs(dx) > 0.0001) {
    const tx1 = (box.x - x1) / dx;
    const tx2 = (box.x + box.width - x1) / dx;
    tMin = Math.max(tMin, Math.min(tx1, tx2));
    tMax = Math.min(tMax, Math.max(tx1, tx2));
  } else if (x1 < box.x || x1 > box.x + box.width) {
    return null;
  }

  if (Math.abs(dy) > 0.0001) {
    const ty1 = (box.y - y1) / dy;
    const ty2 = (box.y + box.height - y1) / dy;
    tMin = Math.max(tMin, Math.min(ty1, ty2));
    tMax = Math.min(tMax, Math.max(ty1, ty2));
  } else if (y1 < box.y || y1 > box.y + box.height) {
    return null;
  }

  if (tMax >= tMin && tMin >= 0 && tMin <= 1) {
    return tMin;
  }
  return null;
}

// Stage B: Line segment vs Circle intersection for laser damage
function lineCircleIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.hypot(cx - x1, cy - y1) < r;
  }

  const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.hypot(cx - projX, cy - projY) < r;
}

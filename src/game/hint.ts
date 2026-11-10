import { GravityDirection } from './types';

export interface HintWaypoint {
  x: number;
  y: number;
  dir?: GravityDirection;
}

export class DeathHintTracker {
  private deaths: { x: number; y: number; time: number }[] = [];
  public hintAvailable: boolean = false;
  public hintActive: boolean = false;
  public hintTimer: number = 0;
  private readonly SPOT_RADIUS = 85;

  public reset(): void {
    this.deaths = [];
    this.hintAvailable = false;
    this.hintActive = false;
    this.hintTimer = 0;
  }

  public recordDeath(x: number, y: number): boolean {
    const now = performance.now();
    this.deaths.push({ x, y, time: now });

    // Check if 3 recent deaths are within SPOT_RADIUS
    const recent = this.deaths.slice(-3);
    if (recent.length >= 3) {
      const d1 = Math.hypot(recent[0].x - recent[1].x, recent[0].y - recent[1].y);
      const d2 = Math.hypot(recent[1].x - recent[2].x, recent[1].y - recent[2].y);
      const d02 = Math.hypot(recent[0].x - recent[2].x, recent[0].y - recent[2].y);

      if (d1 < this.SPOT_RADIUS && d2 < this.SPOT_RADIUS && d02 < this.SPOT_RADIUS) {
        this.hintAvailable = true;
        return true;
      }
    }
    return false;
  }

  public triggerHint(): void {
    this.hintActive = true;
    this.hintTimer = 3.5; // Display for 3.5 seconds
  }

  public update(dt: number): void {
    if (this.hintActive) {
      this.hintTimer -= dt;
      if (this.hintTimer <= 0) {
        this.hintActive = false;
        this.hintTimer = 0;
      }
    }
  }
}

/**
 * Returns guide waypoints from the current level spawn/checkpoint to the portal.
 */
export function getLevelHintWaypoints(
  spawn: { x: number; y: number },
  portal: { x: number; y: number },
  platforms: { x: number; y: number; width: number; height: number }[],
  checkpoints?: { x: number; y: number; width: number; height: number }[]
): HintWaypoint[] {
  const waypoints: HintWaypoint[] = [{ x: spawn.x, y: spawn.y }];

  if (checkpoints && checkpoints.length > 0) {
    const sortedCps = [...checkpoints].sort((a, b) => a.x - b.x);
    for (const cp of sortedCps) {
      waypoints.push({
        x: cp.x + cp.width / 2,
        y: cp.y + cp.height / 2,
      });
    }
  } else {
    const sortedPlats = [...platforms]
      .filter((p) => p.width >= 40 && p.height >= 20)
      .sort((a, b) => a.x - b.x);

    const step = Math.max(1, Math.floor(sortedPlats.length / 5));
    for (let i = step; i < sortedPlats.length; i += step) {
      const p = sortedPlats[i];
      waypoints.push({
        x: p.x + p.width / 2,
        y: p.y - 12,
      });
    }
  }

  waypoints.push({ x: portal.x, y: portal.y });
  return waypoints;
}

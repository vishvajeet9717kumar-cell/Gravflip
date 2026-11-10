import { GhostSample, GhostRun, GravityDirection } from './types';

const GHOST_KEY_PREFIX = 'gravflip_ghost_lvl_';

export class GhostRecorder {
  private samples: GhostSample[] = [];
  private lastSampleTime: number = 0;
  private readonly SAMPLE_INTERVAL = 0.06; // ~16 samples/second

  public reset(): void {
    this.samples = [];
    this.lastSampleTime = 0;
  }

  public recordFrame(
    time: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    dir: GravityDirection,
    sqX?: number,
    sqY?: number
  ): void {
    if (time - this.lastSampleTime >= this.SAMPLE_INTERVAL) {
      this.lastSampleTime = time;
      this.samples.push({
        t: Math.round(time * 1000) / 1000,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        vx: Math.round(vx),
        vy: Math.round(vy),
        dir,
        sqX: sqX ? Math.round(sqX * 100) / 100 : 1,
        sqY: sqY ? Math.round(sqY * 100) / 100 : 1,
      });
    }
  }

  public getRun(levelId: number, totalTime: number): GhostRun {
    return {
      levelId,
      time: totalTime,
      samples: this.samples,
    };
  }
}

export function saveGhostRun(levelId: number, run: GhostRun): boolean {
  try {
    const existing = loadGhostRun(levelId);
    if (!existing || run.time < existing.time) {
      localStorage.setItem(`${GHOST_KEY_PREFIX}${levelId}`, JSON.stringify(run));
      return true;
    }
    return false;
  } catch (_) {
    return false;
  }
}

export function loadGhostRun(levelId: number): GhostRun | null {
  try {
    const raw = localStorage.getItem(`${GHOST_KEY_PREFIX}${levelId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Interpolates or samples the ghost's position at a given game time.
 */
export function getGhostAtTime(run: GhostRun | null, time: number): GhostSample | null {
  if (!run || !run.samples || run.samples.length === 0) return null;
  if (time > run.time + 0.5) return null; // Finished run

  const samples = run.samples;
  if (time <= samples[0].t) return samples[0];
  if (time >= samples[samples.length - 1].t) return samples[samples.length - 1];

  // Binary search for sample interval
  let low = 0;
  let high = samples.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (samples[mid].t <= time) {
      if (mid + 1 < samples.length && samples[mid + 1].t > time) {
        // Interpolate between mid and mid + 1
        const s1 = samples[mid];
        const s2 = samples[mid + 1];
        const span = s2.t - s1.t;
        const factor = span > 0 ? (time - s1.t) / span : 0;
        return {
          t: time,
          x: s1.x + (s2.x - s1.x) * factor,
          y: s1.y + (s2.y - s1.y) * factor,
          vx: s1.vx,
          vy: s1.vy,
          dir: s1.dir,
          sqX: s1.sqX,
          sqY: s1.sqY,
        };
      }
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return samples[samples.length - 1];
}

import { Vector3 } from "three";

/**
 * The authored camera rail.
 *
 * Design contract:
 *  - Named waypoints at explicit journey progress values (0..1).
 *  - Position / look-target / fov / roll interpolate segment-wise with an
 *    authored easing per waypoint pair.
 *  - Pure function of progress: bidirectional scrubbing reproduces the exact
 *    same framing with zero accumulated drift, resize-safe, seek-safe.
 *  - "smooth" easing settles to zero velocity at each key — the camera rests
 *    where the composition matters. "linear" keys hand momentum through for
 *    continuous travelling shots. No noise, no shake, ever.
 */

export type RailEase = "smooth" | "linear" | "in" | "out";

export interface RailKey {
  /** journey progress for this waypoint (monotonic, 0..1) */
  at: number;
  pos: [number, number, number];
  look: [number, number, number];
  /** vertical field of view in degrees (default 50) */
  fov?: number;
  /** camera roll in radians (default 0) */
  roll?: number;
  ease?: RailEase;
}

export interface RailSample {
  pos: Vector3;
  look: Vector3;
  fov: number;
  roll: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function easeValue(kind: RailEase, t: number): number {
  switch (kind) {
    case "linear":
      return t;
    case "in":
      return t * t;
    case "out":
      return 1 - (1 - t) * (1 - t);
    case "smooth":
    default:
      // smoothstep — zero velocity at both ends of the segment
      return t * t * (3 - 2 * t);
  }
}

export class CameraRail {
  private keys: Required<RailKey>[];
  readonly sample: RailSample;

  constructor(keys: RailKey[]) {
    if (keys.length < 2) throw new Error("CameraRail needs at least 2 keys");
    this.keys = keys
      .map((k) => ({
        at: k.at,
        pos: k.pos,
        look: k.look,
        fov: k.fov ?? 50,
        roll: k.roll ?? 0,
        ease: k.ease ?? "smooth",
      }))
      .sort((a, b) => a.at - b.at);
    this.sample = {
      pos: new Vector3(),
      look: new Vector3(),
      fov: this.keys[0].fov,
      roll: 0,
    };
  }

  /** progress in [0,1] → camera state (written into the shared sample) */
  eval(p: number): RailSample {
    const t = clamp01(p);
    const keys = this.keys;
    const last = keys[keys.length - 1];
    if (t >= last.at) {
      this.sample.pos.set(...last.pos);
      this.sample.look.set(...last.look);
      this.sample.fov = last.fov;
      this.sample.roll = last.roll;
      return this.sample;
    }
    let i = 0;
    while (i < keys.length - 2 && keys[i + 1].at <= t) i++;
    const a = keys[i];
    const b = keys[i + 1];
    const span = Math.max(b.at - a.at, 1e-6);
    const local = easeValue(b.ease, clamp01((t - a.at) / span));
    this.sample.pos.set(
      a.pos[0] + (b.pos[0] - a.pos[0]) * local,
      a.pos[1] + (b.pos[1] - a.pos[1]) * local,
      a.pos[2] + (b.pos[2] - a.pos[2]) * local
    );
    this.sample.look.set(
      a.look[0] + (b.look[0] - a.look[0]) * local,
      a.look[1] + (b.look[1] - a.look[1]) * local,
      a.look[2] + (b.look[2] - a.look[2]) * local
    );
    this.sample.fov = a.fov + (b.fov - a.fov) * local;
    this.sample.roll = a.roll + (b.roll - a.roll) * local;
    return this.sample;
  }
}

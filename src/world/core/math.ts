// Shared math / easing / noise helpers for the 3D world.

export const DEG = Math.PI / 180;
export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Frame-rate independent exponential damping. */
export function damp(a: number, b: number, lambda: number, dt: number): number {
  return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

export function wrapAngle(a: number): number {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
}

export function dampAngle(a: number, b: number, lambda: number, dt: number): number {
  return a + wrapAngle(b - a) * (1 - Math.exp(-lambda * dt));
}

// ---------- Easing ----------
export type Ease = (t: number) => number;
export const linear: Ease = (t) => t;
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInCubic: Ease = (t) => t * t * t;
export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutQuad: Ease = (t) => 1 - (1 - t) * (1 - t);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
export const easeOutBack: Ease = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// ---------- Deterministic hashing / noise ----------
export function hash2i(x: number, y: number): number {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Hash of a float position (quantised) — identical inputs always give identical output. */
export function hashf(x: number, y: number, salt = 0): number {
  return hash2i(Math.round(x * 10000) + salt * 7919, Math.round(y * 10000) - salt * 104729);
}

export function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2i(xi, yi);
  const b = hash2i(xi + 1, yi);
  const c = hash2i(xi, yi + 1);
  const d = hash2i(xi + 1, yi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const randRange = (rng: Rng, a: number, b: number): number => a + (b - a) * rng();
export const pick = <T>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length) % arr.length];

export function distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
  const vx = bx - ax;
  const vz = bz - az;
  const len2 = vx * vx + vz * vz;
  let t = len2 > 0 ? ((px - ax) * vx + (pz - az) * vz) / len2 : 0;
  t = clamp(t, 0, 1);
  const dx = px - (ax + vx * t);
  const dz = pz - (az + vz * t);
  return Math.sqrt(dx * dx + dz * dz);
}

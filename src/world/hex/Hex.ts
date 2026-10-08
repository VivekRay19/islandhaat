// Pointy-top axial hex math shared by state, rendering and the character controller.
//
// World axes: +x = east, -z = north, +y = up. Water surface is y = 0.
// Edge order (same as the legacy TileSystem): 0 E, 1 NE, 2 NW, 3 W, 4 SW, 5 SE.
// Edge i faces the direction angle = i * 60deg (counter-clockwise from east, seen from above).

export const SQRT3 = Math.sqrt(3);
export const HEX_R = 1; // centre -> corner
export const APOTHEM = (SQRT3 / 2) * HEX_R; // centre -> edge midpoint
export const TILE_TOP = 0.34; // world height of the terrain base level
export const WATER_LOCAL = -0.07; // in-tile river surface, relative to TILE_TOP
export const TILE_BOTTOM = -0.32;

export interface Axial {
  q: number;
  r: number;
}

export const HEX_DIRS: readonly Axial[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 }
];

export const OPPOSITE = [3, 4, 5, 0, 1, 2] as const;

export const hexKey = (q: number, r: number): string => `${q},${r}`;

export function parseKey(k: string): Axial {
  const [q, r] = k.split(',').map(Number);
  return { q, r };
}

export function axialToWorld(q: number, r: number): { x: number; z: number } {
  return { x: SQRT3 * HEX_R * (q + r / 2), z: 1.5 * HEX_R * r };
}

export function worldToAxial(x: number, z: number): Axial {
  const r = z / (1.5 * HEX_R);
  const q = x / (SQRT3 * HEX_R) - r / 2;
  return cubeRound(q, r);
}

function cubeRound(q: number, r: number): Axial {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return { q: rq + 0, r: rr + 0 };
}

export function hexDistance(a: Axial, b: Axial): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

/** Local direction (in tile space) of edge i, scaled. */
export function edgeDir(i: number, dist = 1): { x: number; z: number } {
  const a = (i * Math.PI) / 3;
  return { x: Math.cos(a) * dist, z: -Math.sin(a) * dist };
}

export function edgeMid(i: number): { x: number; z: number } {
  return edgeDir(i, APOTHEM);
}

/** Corner k sits between edge k and edge k+1 (angle 60k + 30). */
export function corner(k: number, radius = HEX_R): { x: number; z: number } {
  const a = ((k * 60 + 30) * Math.PI) / 180;
  return { x: Math.cos(a) * radius, z: -Math.sin(a) * radius };
}

/** Same rotation convention as THREE's rotation.y = steps * 60deg. */
export function rotateXZ(x: number, z: number, angle: number): { x: number; z: number } {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: x * c + z * s, z: -x * s + z * c };
}

export const rotAngle = (steps: number): number => (steps * Math.PI) / 3;

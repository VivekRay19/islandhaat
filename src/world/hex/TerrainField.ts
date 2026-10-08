import { Axial, hexKey, parseKey, HEX_DIRS, OPPOSITE, rotAngle, rotateXZ, SQRT3, HEX_R, APOTHEM, TILE_TOP, WATER_LOCAL, TILE_BOTTOM } from './Hex';
import { Terrain, TileDef, TILE_LIBRARY } from '../data/tileLibrary';
import { clamp, hashf, lerp, smoothstep } from '../core/math';

export interface PlacedTile {
  key: string;
  q: number;
  r: number;
  defId: string;
  rotation: number; // 0..5
  placedAt: number; // timestamp
  isDamaged?: boolean;
}

/** Evaluates smooth continuous terrain heights, water paths, and ground types across the hex island. */
export class TerrainField {
  private tiles: Map<string, PlacedTile> = new Map();

  public clear(): void {
    this.tiles.clear();
  }

  public setTile(tile: PlacedTile): void {
    this.tiles.set(tile.key, tile);
  }

  public removeTile(key: string): void {
    this.tiles.delete(key);
  }

  public getTile(key: string): PlacedTile | undefined {
    return this.tiles.get(key);
  }

  public getTileAt(q: number, r: number): PlacedTile | undefined {
    return this.tiles.get(hexKey(q, r));
  }

  public getAllTiles(): PlacedTile[] {
    return Array.from(this.tiles.values());
  }

  public getRotatedEdges(tile: PlacedTile): [Terrain, Terrain, Terrain, Terrain, Terrain, Terrain] {
    const def = TILE_LIBRARY[tile.defId] || TILE_LIBRARY.meadow;
    const base = def.edges;
    const shift = tile.rotation % 6;
    const res: Terrain[] = [];
    for (let i = 0; i < 6; i++) {
      const orig = (i - shift + 6) % 6;
      res.push(base[orig]);
    }
    return res as [Terrain, Terrain, Terrain, Terrain, Terrain, Terrain];
  }

  /**
   * Sample ground elevation Y at world position (x, z).
   * Returns negative height if outside island (water surface is Y = 0).
   */
  public getHeight(x: number, z: number): number {
    // Find closest hex tile
    const r = z / (1.5 * HEX_R);
    const q = x / (SQRT3 * HEX_R) - r / 2;
    const center = this.cubeRound(q, r);
    const tile = this.getTileAt(center.q, center.r);

    if (!tile) {
      return -0.2; // in deep water
    }

    const def = TILE_LIBRARY[tile.defId];
    const rotatedEdges = this.getRotatedEdges(tile);

    // Local coordinates relative to hex center
    const cx = SQRT3 * HEX_R * (center.q + center.r / 2);
    const cz = 1.5 * HEX_R * center.r;
    const lx = x - cx;
    const lz = z - cz;
    const distFromCenter = Math.sqrt(lx * lx + lz * lz);

    let baseHeight = TILE_TOP;

    // Mountain / Stone elevation
    if (def.id === 'hill' || def.id === 'quarry') {
      const hillDome = Math.max(0, 1 - distFromCenter / (HEX_R * 0.9));
      baseHeight += hillDome * 0.45;
    }

    // River depression
    let minWaterDist = 999;
    for (let i = 0; i < 6; i++) {
      if (rotatedEdges[i] === 'water') {
        const a = (i * Math.PI) / 3;
        const ex = Math.cos(a) * APOTHEM;
        const ez = -Math.sin(a) * APOTHEM;
        // Distance to line segment from center to edge
        const d = this.distToSegment(lx, lz, 0, 0, ex, ez);
        if (d < minWaterDist) minWaterDist = d;
      }
    }

    if (minWaterDist < 0.28) {
      const depthFactor = smoothstep(0.28, 0.05, minWaterDist);
      baseHeight = lerp(baseHeight, TILE_TOP + WATER_LOCAL - 0.04, depthFactor);
    }

    // Subtle natural undulation
    const bump = (hashf(x * 4, z * 4, 12) - 0.5) * 0.02;
    return baseHeight + bump;
  }

  /**
   * Check if position (x, z) is walkable for the character.
   */
  public isWalkable(x: number, z: number): boolean {
    const r = z / (1.5 * HEX_R);
    const q = x / (SQRT3 * HEX_R) - r / 2;
    const center = this.cubeRound(q, r);
    const tile = this.getTileAt(center.q, center.r);
    if (!tile) return false;

    // Check distance to hex center to avoid stepping off the island cliffs
    const cx = SQRT3 * HEX_R * (center.q + center.r / 2);
    const cz = 1.5 * HEX_R * center.r;
    const dist = Math.hypot(x - cx, z - cz);
    if (dist > HEX_R * 0.92) {
      // Check if neighboring hex in this direction exists
      const angle = Math.atan2(-(z - cz), x - cx);
      let normAngle = angle;
      if (normAngle < 0) normAngle += Math.PI * 2;
      const sector = Math.round((normAngle / (Math.PI / 3))) % 6;
      const dir = HEX_DIRS[sector];
      if (!this.getTileAt(center.q + dir.q, center.r + dir.r)) {
        return false; // cliff edge
      }
    }
    return true;
  }

  private cubeRound(q: number, r: number): Axial {
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

  private distToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number): number {
    const vx = bx - ax;
    const vz = bz - az;
    const len2 = vx * vx + vz * vz;
    let t = len2 > 0 ? ((px - ax) * vx + (pz - az) * vz) / len2 : 0;
    t = clamp(t, 0, 1);
    const dx = px - (ax + vx * t);
    const dz = pz - (az + vz * t);
    return Math.sqrt(dx * dx + dz * dz);
  }
}

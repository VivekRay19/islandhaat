import * as THREE from 'three';
import { TerrainField, PlacedTile } from '../hex/TerrainField';
import { HEX_DIRS, HEX_R, SQRT3, TILE_TOP, hexKey, parseKey } from '../hex/Hex';

export interface CompletedFarm {
  id: string; // Canonical sorted key: e.g. "farm_0,1_0,2_1,1"
  tiles: { q: number; r: number }[];
  registeredAt: number;
  rewardClaimed: boolean;
  cropAwarded?: string;
}

export class FarmDetectionSystem {
  /**
   * Scans terrain for any connected 3-tile Farmland groups that have not yet been registered.
   */
  public static detectNewFarms(
    terrain: TerrainField,
    registeredFarmIds: Set<string>
  ): CompletedFarm[] {
    const allTiles = terrain.getAllTiles();
    const farmlandTiles = allTiles.filter(
      (t) => t.defId === 'farmland' || t.defId === 'farm' || t.defId === 'fields'
    );
    const farmlandMap = new Map<string, PlacedTile>();
    farmlandTiles.forEach((t) => farmlandMap.set(hexKey(t.q, t.r), t));

    const newFarms: CompletedFarm[] = [];

    // Find all connected components of farmland tiles using BFS
    const visited = new Set<string>();

    for (const startTile of farmlandTiles) {
      const startKey = hexKey(startTile.q, startTile.r);
      if (visited.has(startKey)) continue;

      const component: PlacedTile[] = [];
      const queue: PlacedTile[] = [startTile];
      visited.add(startKey);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        component.push(curr);

        for (const dir of HEX_DIRS) {
          const nq = curr.q + dir.q;
          const nr = curr.r + dir.r;
          const nKey = hexKey(nq, nr);
          if (farmlandMap.has(nKey) && !visited.has(nKey)) {
            visited.add(nKey);
            queue.push(farmlandMap.get(nKey)!);
          }
        }
      }

      // If component has at least 3 tiles, search for edge-connected triplets
      if (component.length >= 3) {
        const triplets = this.findConnectedTriplets(component, farmlandMap);
        for (const triplet of triplets) {
          const farmId = this.makeFarmId(triplet);
          if (!registeredFarmIds.has(farmId)) {
            registeredFarmIds.add(farmId);
            newFarms.push({
              id: farmId,
              tiles: triplet.map((t) => ({ q: t.q, r: t.r })),
              registeredAt: Date.now(),
              rewardClaimed: false
            });
          }
        }
      }
    }

    return newFarms;
  }

  /**
   * Generates a deterministic canonical ID from 3 tile coordinates.
   */
  public static makeFarmId(tiles: { q: number; r: number }[]): string {
    const sorted = [...tiles]
      .map((t) => `${t.q},${t.r}`)
      .sort()
      .join('_');
    return `farm_${sorted}`;
  }

  /**
   * Finds connected triplets of tiles within a connected farmland component.
   */
  private static findConnectedTriplets(
    component: PlacedTile[],
    map: Map<string, PlacedTile>
  ): PlacedTile[][] {
    const triplets: PlacedTile[][] = [];
    const seenCombos = new Set<string>();

    // For each tile A, check all neighbors B and C
    for (let i = 0; i < component.length; i++) {
      const a = component[i];

      // Find neighbors of A
      const neighborsOfA: PlacedTile[] = [];
      for (const dir of HEX_DIRS) {
        const nKey = hexKey(a.q + dir.q, a.r + dir.r);
        const nb = map.get(nKey);
        if (nb) neighborsOfA.push(nb);
      }

      // Case 1: A is connected to B, and B is connected to C
      for (const b of neighborsOfA) {
        // Find neighbors of B (excluding A)
        for (const dir of HEX_DIRS) {
          const cKey = hexKey(b.q + dir.q, b.r + dir.r);
          if (cKey === hexKey(a.q, a.r)) continue;
          const c = map.get(cKey);
          if (c) {
            const triplet = [a, b, c];
            const id = this.makeFarmId(triplet);
            if (!seenCombos.has(id)) {
              seenCombos.add(id);
              triplets.push(triplet);
            }
          }
        }
      }

      // Case 2: A is connected to B and A is connected to C (triangle or V-shape)
      for (let j = 0; j < neighborsOfA.length; j++) {
        for (let k = j + 1; k < neighborsOfA.length; k++) {
          const b = neighborsOfA[j];
          const c = neighborsOfA[k];
          const triplet = [a, b, c];
          const id = this.makeFarmId(triplet);
          if (!seenCombos.has(id)) {
            seenCombos.add(id);
            triplets.push(triplet);
          }
        }
      }
    }

    return triplets;
  }

  /**
   * Returns all outer perimeter edges of the 3-tile farm.
   * Internal dividing edges between the farm tiles are suppressed.
   */
  public static getOuterPerimeterEdges(
    tiles: { q: number; r: number }[]
  ): { q: number; r: number; edgeIdx: number }[] {
    const farmTileSet = new Set(tiles.map((t) => hexKey(t.q, t.r)));
    const perimeterEdges: { q: number; r: number; edgeIdx: number }[] = [];

    for (const tile of tiles) {
      for (let i = 0; i < 6; i++) {
        const dir = HEX_DIRS[i];
        const nKey = hexKey(tile.q + dir.q, tile.r + dir.r);
        // If neighbor is NOT in this farm, this edge is part of the outer perimeter
        if (!farmTileSet.has(nKey)) {
          perimeterEdges.push({ q: tile.q, r: tile.r, edgeIdx: i });
        }
      }
    }

    return perimeterEdges;
  }

  /**
   * Builds the 3D Unified Outer Outline Mesh for a completed farm.
   * Emphasizes the unified 3-tile farm with glowing golden/emerald border along the perimeter,
   * without drawing dividing lines inside.
   */
  public static buildUnifiedFarmOutline(
    tiles: { q: number; r: number }[]
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = 'unified_farm_outline';

    const perimeter = this.getOuterPerimeterEdges(tiles);

    // Outer border material: Radiant golden agricultural glow
    const outlineMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xfacc15,
      emissiveIntensity: 0.65,
      roughness: 0.3,
      metalness: 0.2
    });

    // Small boundary stone / fence post material
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.7
    });

    const yLevel = TILE_TOP + 0.04;

    for (const p of perimeter) {
      const cx = SQRT3 * HEX_R * (p.q + p.r / 2);
      const cz = 1.5 * HEX_R * p.r;

      // Hex vertices for edge p.edgeIdx (0..5)
      // Angles of the two vertices of this edge
      const angle1 = (p.edgeIdx * Math.PI) / 3 - Math.PI / 6;
      const angle2 = ((p.edgeIdx + 1) * Math.PI) / 3 - Math.PI / 6;

      const v1x = cx + Math.cos(angle1) * HEX_R * 0.98;
      const v1z = cz + Math.sin(angle1) * HEX_R * 0.98;
      const v2x = cx + Math.cos(angle2) * HEX_R * 0.98;
      const v2z = cz + Math.sin(angle2) * HEX_R * 0.98;

      // Outer boundary tube between v1 and v2
      const midX = (v1x + v2x) / 2;
      const midZ = (v1z + v2z) / 2;
      const length = Math.hypot(v2x - v1x, v2z - v1z);
      const edgeAngle = Math.atan2(v2z - v1z, v2x - v1x);

      // Boundary line segment
      const segmentGeo = new THREE.BoxGeometry(length, 0.04, 0.05);
      const segmentMesh = new THREE.Mesh(segmentGeo, outlineMat);
      segmentMesh.position.set(midX, yLevel, midZ);
      segmentMesh.rotation.y = -edgeAngle;
      segmentMesh.castShadow = true;
      group.add(segmentMesh);

      // Corner post at vertex 1
      const postGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.12, 6);
      const postMesh = new THREE.Mesh(postGeo, postMat);
      postMesh.position.set(v1x, yLevel + 0.04, v1z);
      postMesh.castShadow = true;
      group.add(postMesh);
    }

    // Add subtle celebratory farm centerpiece at center of mass
    let avgX = 0;
    let avgZ = 0;
    for (const t of tiles) {
      avgX += SQRT3 * HEX_R * (t.q + t.r / 2);
      avgZ += 1.5 * HEX_R * t.r;
    }
    avgX /= tiles.length;
    avgZ /= tiles.length;

    // Golden farm marker sheaf
    const sheafGeo = new THREE.ConeGeometry(0.08, 0.22, 6);
    const sheafMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xeab308,
      emissiveIntensity: 0.35,
      roughness: 0.4
    });
    const sheaf = new THREE.Mesh(sheafGeo, sheafMat);
    sheaf.position.set(avgX, yLevel + 0.11, avgZ);
    sheaf.castShadow = true;
    group.add(sheaf);

    return group;
  }
}

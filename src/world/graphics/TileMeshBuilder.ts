import * as THREE from 'three';
import { TileDef } from '../data/tileLibrary';
import { Materials } from './Materials';
import { EnvironmentModels } from './EnvironmentModels';
import { HEX_R, TILE_TOP, TILE_BOTTOM, edgeMid, rotAngle } from '../hex/Hex';
import { IndianState } from '../culture/CultureTypes';
import { CulturalVegetationBuilder } from './CulturalVegetationBuilder';

export class TileMeshBuilder {
  private static mats = Materials.get();

  /**
   * Builds complete 3D Hex Block Diorama with culture-specific geology, foliage, and architecture.
   */
  public static buildTileMesh(
    def: TileDef,
    rotation = 0,
    isDamaged = false,
    culture: IndianState = 'bihar'
  ): THREE.Group {
    const root = new THREE.Group();
    const mats = this.mats;

    // --- 1. CULTURE-SPECIFIC LAYERED 3D GEOLOGY HEX BLOCK ---
    const hexGroup = new THREE.Group();

    // Layer A: Top Cap (Culture-specific ground terrain or tilled soil or stone)
    const topGeo = new THREE.CylinderGeometry(HEX_R, HEX_R * 1.02, 0.14, 6);
    let topMat = mats.getTerrainMaterial(culture);
    if (def.id === 'hill' || def.id === 'quarry' || def.id === 'mountain') {
      topMat = mats.getCliffMaterial(culture);
    } else if (def.id === 'farm' || def.id === 'fields' || def.id === 'farmland') {
      topMat = mats.field;
    } else if (def.id === 'coastal') {
      topMat = mats.sand;
    } else if (def.id === 'water') {
      topMat = mats.water;
    }
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = TILE_TOP - 0.07;
    topMesh.receiveShadow = true;
    topMesh.castShadow = true;
    hexGroup.add(topMesh);

    // Layer B: Earth / Rock Cliff Strata (Culture-specific strata depth)
    const midGeo = new THREE.CylinderGeometry(HEX_R * 1.02, HEX_R * 0.96, 0.24, 6);
    const midMesh = new THREE.Mesh(midGeo, mats.getBaseStrataMaterial(culture));
    midMesh.position.y = TILE_TOP - 0.26;
    midMesh.receiveShadow = true;
    midMesh.castShadow = true;
    hexGroup.add(midMesh);

    // Layer C: Base Cliff Rock (Culture-specific rock color/material)
    const botGeo = new THREE.CylinderGeometry(HEX_R * 0.96, HEX_R * 0.86, 0.20, 6);
    const botMesh = new THREE.Mesh(botGeo, mats.getCliffMaterial(culture));
    botMesh.position.y = TILE_BOTTOM + 0.10;
    botMesh.receiveShadow = true;
    hexGroup.add(botMesh);

    root.add(hexGroup);

    // --- 2. TERRAIN FEATURES ON THE TILE ---
    const content = new THREE.Group();

    // FARMLAND: Tilled furrow ridges and crop seedlings
    if (def.id === 'farmland' || def.id === 'fields') {
      const furrowMat = mats.darkSoil;
      const cropMat = mats.thatch;
      for (let i = -2; i <= 2; i++) {
        const furrowGeo = new THREE.BoxGeometry(0.7 - Math.abs(i) * 0.12, 0.03, 0.08);
        const furrow = new THREE.Mesh(furrowGeo, furrowMat);
        furrow.position.set(0, TILE_TOP + 0.015, i * 0.18);
        furrow.castShadow = true;
        content.add(furrow);

        // Crop seedlings along the ridge
        const stalkCount = 4 - Math.abs(i);
        for (let s = 0; s < stalkCount; s++) {
          const stalkGeo = new THREE.ConeGeometry(0.025, 0.08, 4);
          const stalk = new THREE.Mesh(stalkGeo, cropMat);
          const sx = (s - (stalkCount - 1) / 2) * 0.16;
          stalk.position.set(sx, TILE_TOP + 0.05, i * 0.18);
          content.add(stalk);
        }
      }
    }

    // MOUNTAIN: Rugged rocky peaks and stone boulders
    if (def.id === 'mountain' || def.id === 'hill') {
      const peakMat = mats.getCliffMaterial(culture);
      const mainPeak = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.65, 6), peakMat);
      mainPeak.position.set(0, TILE_TOP + 0.30, 0);
      mainPeak.castShadow = true;
      content.add(mainPeak);

      const subPeak1 = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.42, 5), peakMat);
      subPeak1.position.set(-0.25, TILE_TOP + 0.18, 0.18);
      subPeak1.castShadow = true;
      content.add(subPeak1);

      const subPeak2 = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.34, 5), peakMat);
      subPeak2.position.set(0.24, TILE_TOP + 0.14, -0.20);
      subPeak2.castShadow = true;
      content.add(subPeak2);
    }

    // COASTAL: Sandy shoreline with foaming surf
    if (def.id === 'coastal') {
      const waterSurf = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.06, 6), mats.water);
      waterSurf.position.set(0, TILE_TOP + 0.01, 0.22);
      content.add(waterSurf);

      const foamLine = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.08), mats.waterFoam);
      foamLine.position.set(0, TILE_TOP + 0.02, 0.05);
      content.add(foamLine);

      // Coastal pebble stones
      const pebbleGeo = new THREE.DodecahedronGeometry(0.04);
      const pebble1 = new THREE.Mesh(pebbleGeo, mats.stone);
      pebble1.position.set(-0.22, TILE_TOP + 0.02, -0.15);
      content.add(pebble1);
      const pebble2 = new THREE.Mesh(pebbleGeo, mats.stone);
      pebble2.position.set(0.28, TILE_TOP + 0.02, -0.10);
      content.add(pebble2);
    }

    // WATER TILE: Deep tranquil water surface
    if (def.id === 'water') {
      const waterPlinth = new THREE.Mesh(new THREE.CylinderGeometry(HEX_R * 0.95, HEX_R * 0.96, 0.08, 6), mats.water);
      waterPlinth.position.y = TILE_TOP + 0.01;
      content.add(waterPlinth);

      // Water lily pad
      const lilyGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.01, 8);
      const lily = new THREE.Mesh(lilyGeo, mats.treeFoliageA);
      lily.position.set(0.12, TILE_TOP + 0.02, -0.14);
      content.add(lily);
    }

    // Water Channels / Streams (For river / stream tiles)
    const waterEdges: number[] = [];
    def.edges.forEach((edge, idx) => {
      if (edge === 'water' && def.id !== 'water' && def.id !== 'coastal') waterEdges.push(idx);
    });

    if (waterEdges.length > 0) {
      // Central Water Plinth
      const waterPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.58, 0.08, 6), mats.water);
      waterPlinth.position.y = TILE_TOP + 0.02;
      content.add(waterPlinth);

      // Water channel arms to edges
      for (const wEdge of waterEdges) {
        const mid = edgeMid(wEdge);
        const stream = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.52), mats.water);
        stream.position.set(mid.x * 0.58, TILE_TOP + 0.02, mid.z * 0.58);
        const a = (wEdge * Math.PI) / 3;
        stream.rotation.y = a + Math.PI / 2;
        content.add(stream);

        // Water shoreline foam edge
        const foam = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.06), mats.waterFoam);
        foam.position.set(mid.x * 0.88, TILE_TOP + 0.03, mid.z * 0.88);
        foam.rotation.y = a + Math.PI / 2;
        content.add(foam);
      }
    }

    // Forest Vegetation (Culture-specific trees)
    const forestEdges: number[] = [];
    def.edges.forEach((edge, idx) => {
      if (edge === 'forest') forestEdges.push(idx);
    });

    if (def.id === 'forest' || forestEdges.length >= 3) {
      const treeCount = def.id === 'forest' ? 5 : 3;
      for (let i = 0; i < treeCount; i++) {
        const tree = CulturalVegetationBuilder.createTree(culture, i * 7 + 5);
        const ang = (i * Math.PI * 2) / treeCount + 0.3;
        const dist = 0.28 + (i % 2) * 0.22;
        tree.position.set(Math.cos(ang) * dist, TILE_TOP, Math.sin(ang) * dist);
        content.add(tree);
      }
    } else if (forestEdges.length > 0) {
      for (const fEdge of forestEdges) {
        const mid = edgeMid(fEdge);
        const tree = CulturalVegetationBuilder.createTree(culture, fEdge * 4);
        tree.position.set(mid.x * 0.65, TILE_TOP, mid.z * 0.65);
        content.add(tree);
      }
    }

    // Wildflowers & Cultural Landscape Props (Meadow)
    if (def.id === 'meadow') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const prop = CulturalVegetationBuilder.createLandscapeProp(culture, i);
        const ang = (i * Math.PI * 2) / count + 0.5;
        prop.position.set(Math.cos(ang) * 0.42, TILE_TOP + 0.02, Math.sin(ang) * 0.42);
        content.add(prop);
      }
    }

    // --- 3. LANDMARK STRUCTURE (Culture-specific architecture) ---
    if (def.landmark) {
      const landmark = EnvironmentModels.buildLandmark(def.landmark, culture);
      landmark.position.y = TILE_TOP;
      content.add(landmark);
    }

    // Apply rotation
    content.rotation.y = rotAngle(rotation);
    root.add(content);

    // Damaged Visual State
    if (isDamaged) {
      const fireChar = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.72, 0.10, 6), mats.darkSoil);
      fireChar.position.y = TILE_TOP + 0.03;
      root.add(fireChar);
    }

    return root;
  }

  /** Builds a ghost preview mesh when dragging / hovering */
  public static buildGhostMesh(def: TileDef, rotation = 0, culture: IndianState = 'bihar'): THREE.Group {
    const mesh = this.buildTileMesh(def, rotation, false, culture);
    mesh.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = this.mats.ghostMat;
      }
    });
    return mesh;
  }
}

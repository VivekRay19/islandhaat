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
    if (def.id === 'hill' || def.id === 'quarry') {
      topMat = mats.getCliffMaterial(culture);
    } else if (def.id === 'farm' || def.id === 'fields') {
      topMat = mats.field;
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

    // Water Channels / Streams
    const waterEdges: number[] = [];
    def.edges.forEach((edge, idx) => {
      if (edge === 'water') waterEdges.push(idx);
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

    // Hill / Rocky Outcrops (Culture-specific rocks)
    if (def.id === 'hill') {
      const rock1 = CulturalVegetationBuilder.createLandscapeProp(culture, 1);
      rock1.position.set(-0.06, TILE_TOP + 0.10, 0.04);
      content.add(rock1);

      const rock2 = CulturalVegetationBuilder.createLandscapeProp(culture, 2);
      rock2.position.set(0.24, TILE_TOP + 0.06, -0.16);
      content.add(rock2);
    }

    // Wildflowers & Cultural Landscape Props
    if (def.id === 'meadow' || def.id === 'start' || def.id === 'forest') {
      const count = def.id === 'meadow' ? 4 : 2;
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

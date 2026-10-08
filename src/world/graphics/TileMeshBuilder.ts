import * as THREE from 'three';
import { TileDef, TILE_LIBRARY, Terrain } from '../data/tileLibrary';
import { Materials } from './Materials';
import { EnvironmentModels } from './EnvironmentModels';
import { HEX_R, TILE_TOP, TILE_BOTTOM, corner, edgeMid, rotAngle } from '../hex/Hex';
import { hashf } from '../core/math';

export class TileMeshBuilder {
  private static mats = Materials.get();

  /**
   * Builds complete 3D Hex Block Diorama.
   */
  public static buildTileMesh(def: TileDef, rotation = 0, isDamaged = false): THREE.Group {
    const root = new THREE.Group();
    const mats = this.mats;

    // --- 1. BASE 3D HEX BLOCK WITH THICKNESS ---
    const hexGroup = new THREE.Group();

    // Top Hex Cap (Grass/Ground)
    const topGeo = new THREE.CylinderGeometry(HEX_R, HEX_R * 1.02, 0.12, 6);
    const topMat = def.id === 'hill' || def.id === 'quarry' ? mats.stone : (def.id === 'farm' || def.id === 'fields' ? mats.field : mats.grass);
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = TILE_TOP - 0.06;
    topMesh.receiveShadow = true;
    topMesh.castShadow = true;
    hexGroup.add(topMesh);

    // Middle Earth Layer
    const midGeo = new THREE.CylinderGeometry(HEX_R * 1.02, HEX_R * 0.95, 0.22, 6);
    const midMesh = new THREE.Mesh(midGeo, mats.earth);
    midMesh.position.y = TILE_TOP - 0.23;
    midMesh.receiveShadow = true;
    midMesh.castShadow = true;
    hexGroup.add(midMesh);

    // Bottom Dark Soil Layer (Contact with water)
    const botGeo = new THREE.CylinderGeometry(HEX_R * 0.95, HEX_R * 0.85, 0.18, 6);
    const botMesh = new THREE.Mesh(botGeo, mats.darkSoil);
    botMesh.position.y = TILE_BOTTOM + 0.09;
    botMesh.receiveShadow = true;
    hexGroup.add(botMesh);

    root.add(hexGroup);

    // --- 2. TERRAIN FEATURES ON THE TILE ---
    const content = new THREE.Group();

    // Water channels / River cutting across hex
    const waterEdges: number[] = [];
    def.edges.forEach((edge, idx) => {
      if (edge === 'water') waterEdges.push(idx);
    });

    if (waterEdges.length > 0) {
      // Riverbed / Water mesh
      const waterPlinth = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.06, 6), mats.water);
      waterPlinth.position.y = TILE_TOP + 0.01;
      content.add(waterPlinth);

      for (const wEdge of waterEdges) {
        const mid = edgeMid(wEdge);
        const streamGeo = new THREE.BoxGeometry(0.35, 0.05, 0.5);
        const streamMesh = new THREE.Mesh(streamGeo, mats.water);
        streamMesh.position.set(mid.x * 0.6, TILE_TOP + 0.01, mid.z * 0.6);
        const a = (wEdge * Math.PI) / 3;
        streamMesh.rotation.y = a + Math.PI / 2;
        content.add(streamMesh);
      }
    }

    // Forest trees
    const forestEdges: number[] = [];
    def.edges.forEach((edge, idx) => {
      if (edge === 'forest') forestEdges.push(idx);
    });

    if (def.id === 'forest' || forestEdges.length >= 3) {
      const treeCount = def.id === 'forest' ? 5 : 3;
      for (let i = 0; i < treeCount; i++) {
        const variant = i === 0 ? 'round' : (i % 2 === 0 ? 'pine' : 'banyan');
        const tree = EnvironmentModels.createTree(variant, i * 7 + 3);
        const ang = (i * Math.PI * 2) / treeCount + 0.2;
        const dist = 0.25 + (i % 2) * 0.25;
        tree.position.set(Math.cos(ang) * dist, TILE_TOP, Math.sin(ang) * dist);
        content.add(tree);
      }
    } else if (forestEdges.length > 0) {
      for (const fEdge of forestEdges) {
        const mid = edgeMid(fEdge);
        const tree = EnvironmentModels.createTree('pine', fEdge * 5);
        tree.position.set(mid.x * 0.65, TILE_TOP, mid.z * 0.65);
        content.add(tree);
      }
    }

    // Hill rocky outcrop
    if (def.id === 'hill') {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), mats.stone);
      rock.position.set(0, TILE_TOP + 0.15, 0);
      rock.scale.set(1.1, 0.7, 1);
      rock.castShadow = true;
      content.add(rock);
    }

    // Wildflowers & decorative grass clumps
    if (def.id === 'meadow' || def.id === 'start') {
      for (let i = 0; i < 4; i++) {
        const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 0), i % 2 === 0 ? mats.fabricYellow : mats.fabricPink);
        const ang = (i * Math.PI * 2) / 4 + 0.4;
        flower.position.set(Math.cos(ang) * 0.4, TILE_TOP + 0.04, Math.sin(ang) * 0.4);
        content.add(flower);
      }
    }

    // --- 3. LANDMARK STRUCTURE ---
    if (def.landmark) {
      const landmark = EnvironmentModels.buildLandmark(def.landmark);
      landmark.position.y = TILE_TOP;
      content.add(landmark);
    }

    // Apply rotation
    content.rotation.y = rotAngle(rotation);
    root.add(content);

    // Damaged visual state
    if (isDamaged) {
      const fireChar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.7, 0.08, 6), mats.darkSoil);
      fireChar.position.y = TILE_TOP + 0.02;
      root.add(fireChar);
    }

    return root;
  }

  /** Builds a ghost preview mesh when dragging / hovering */
  public static buildGhostMesh(def: TileDef, rotation = 0): THREE.Group {
    const mesh = this.buildTileMesh(def, rotation);
    mesh.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = this.mats.ghostMat;
      }
    });
    return mesh;
  }
}

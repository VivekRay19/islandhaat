import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';

export class CulturalVegetationBuilder {
  private static mats = Materials.get();

  /**
   * Creates state-specific authentic tree models
   */
  public static createTree(state: IndianState, seed = 0): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    switch (state) {
      case 'bihar': {
        // Sacred Peepal or Broad-leaf Banana Tree
        if (seed % 2 === 0) {
          // Sacred Peepal Tree with wide umbrella canopy
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.45, 8), mats.darkWood);
          trunk.position.y = 0.22;
          trunk.castShadow = true;
          group.add(trunk);

          // Tiered dense foliage crown
          const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), mats.treeFoliageA);
          crown.position.y = 0.48;
          crown.scale.set(1.4, 0.75, 1.3);
          crown.castShadow = true;
          group.add(crown);

          // Earthen tree platform (Chabutra)
          const chabutra = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.05, 8), mats.earth);
          chabutra.position.y = 0.025;
          group.add(chabutra);
        } else {
          // Lush Tropical Banana Tree with broad curved leaves
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.38, 6), mats.treeFoliageA);
          stem.position.y = 0.19;
          group.add(stem);

          // 5 Large spreading banana leaves
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5;
            const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.36), mats.palmFrond);
            leaf.position.set(Math.cos(a) * 0.14, 0.36, Math.sin(a) * 0.14);
            leaf.rotation.y = -a;
            leaf.rotation.x = Math.PI / 3;
            leaf.castShadow = true;
            group.add(leaf);
          }

          // Banana fruit cluster
          const bananas = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.10, 5), mats.goldCoin);
          bananas.position.set(0, 0.28, 0.08);
          group.add(bananas);
        }
        break;
      }

      case 'maharashtra': {
        // Deccan Banyan with aerial roots or Dry Teak tree
        if (seed % 2 === 0) {
          // Banyan with hanging prop roots
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.10, 0.42, 8), mats.wood);
          trunk.position.y = 0.21;
          group.add(trunk);

          // Sprawling hardy crown
          const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), mats.treeFoliageB);
          crown.position.y = 0.46;
          crown.scale.set(1.5, 0.7, 1.4);
          crown.castShadow = true;
          group.add(crown);

          // 4 Aerial roots
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI * 2) / 4 + 0.3;
            const root = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.38, 4), mats.darkWood);
            root.position.set(Math.cos(a) * 0.22, 0.19, Math.sin(a) * 0.22);
            root.castShadow = true;
            group.add(root);
          }
        } else {
          // Hardy Sahyadri Mountain Teak Tree
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, 0.48, 6), mats.darkWood);
          trunk.position.y = 0.24;
          trunk.rotation.z = 0.08;
          group.add(trunk);

          const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 1), mats.treeFoliageC);
          c1.position.set(-0.06, 0.50, 0.04);
          group.add(c1);

          const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), mats.treeFoliageB);
          c2.position.set(0.10, 0.44, -0.05);
          group.add(c2);
        }
        break;
      }

      case 'west_bengal': {
        // Slender Coconut Palm or Betel Nut (Supari) Tree
        const segments = 6;
        const segH = 0.08;
        let currX = 0;
        let currY = 0;
        const curveDir = Math.sin(seed) * 0.03;

        for (let i = 0; i < segments; i++) {
          const nextX = currX + curveDir * (i + 1);
          const nextY = currY + segH;
          const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.035 - i * 0.002, 0.04 - i * 0.002, segH, 6), mats.wood);
          seg.position.set((currX + nextX) / 2, (currY + nextY) / 2, 0);
          seg.rotation.z = -curveDir * 3;
          seg.castShadow = true;
          group.add(seg);
          currX = nextX;
          currY = nextY;
        }

        // Curved radial palm fronds
        const fronds = 7;
        for (let f = 0; f < fronds; f++) {
          const a = (f * Math.PI * 2) / fronds;
          const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.38), mats.palmFrond);
          frond.position.set(currX + Math.cos(a) * 0.14, currY + 0.02, Math.sin(a) * 0.14);
          frond.rotation.y = -a;
          frond.rotation.x = Math.PI / 3.2;
          frond.castShadow = true;
          group.add(frond);
        }
        break;
      }

      case 'karnataka': {
        // Fragrant Sandalwood or Neem Tree
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.07, 0.44, 7), mats.wood);
        trunk.position.y = 0.22;
        group.add(trunk);

        // Multi-tier delicate crown
        const clusters = [
          { x: 0, y: 0.46, z: 0, r: 0.24 },
          { x: -0.10, y: 0.40, z: 0.08, r: 0.18 },
          { x: 0.12, y: 0.42, z: -0.06, r: 0.19 }
        ];
        clusters.forEach(c => {
          const cluster = new THREE.Mesh(new THREE.DodecahedronGeometry(c.r, 1), mats.treeFoliageA);
          cluster.position.set(c.x, c.y, c.z);
          cluster.castShadow = true;
          group.add(cluster);
        });
        break;
      }

      case 'gujarat': {
        // Acacia / Babul Tree with flat umbrella crown
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.46, 6), mats.darkWood);
        trunk.position.y = 0.23;
        trunk.rotation.z = 0.06;
        group.add(trunk);

        // Flat spreading umbrella canopy
        const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.32, 0.12, 8), mats.treeFoliageB);
        canopy.position.y = 0.48;
        canopy.castShadow = true;
        group.add(canopy);
        break;
      }

      case 'rajasthan': {
        // Desert Khejri Tree with twisted trunk & hardy sparse foliage
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.40, 5), mats.darkWood);
        trunk.position.y = 0.20;
        trunk.rotation.z = 0.12;
        group.add(trunk);

        const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.20, 4), mats.darkWood);
        b1.position.set(0.06, 0.34, 0);
        b1.rotation.z = -0.4;
        group.add(b1);

        // Sparse hardy foliage puffs
        const p1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), mats.treeFoliageC);
        p1.position.set(-0.06, 0.42, 0.04);
        group.add(p1);

        const p2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), mats.treeFoliageB);
        p2.position.set(0.12, 0.46, -0.04);
        group.add(p2);
        break;
      }
    }

    const s = 0.9 + (seed % 15) * 0.015;
    group.scale.set(s, s, s);
    return group;
  }

  /**
   * Creates state-specific landscape props (Rocks, Cacti, Flowers, Boulders)
   */
  public static createLandscapeProp(state: IndianState, seed = 0): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    switch (state) {
      case 'bihar': {
        // Marigold (Genda) Flower Clumps
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI * 2) / 4;
          const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 0), mats.goldCoin);
          flower.position.set(Math.cos(a) * 0.08, 0.04, Math.sin(a) * 0.08);
          group.add(flower);
        }
        break;
      }

      case 'maharashtra': {
        // Basalt Rock Boulder Outcrop
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), mats.basaltRock);
        rock.scale.set(1.3, 0.8, 1.1);
        rock.position.y = 0.08;
        rock.castShadow = true;
        group.add(rock);
        break;
      }

      case 'west_bengal': {
        // Water Lily / Lotus Clump
        const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.01, 8), mats.treeFoliageA);
        leaf.position.y = 0.01;
        group.add(leaf);

        const flower = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.06, 6), mats.blossomPink);
        flower.position.set(0.02, 0.04, 0.02);
        group.add(flower);
        break;
      }

      case 'karnataka': {
        // Rounded Granite Monolith Boulder
        const tor = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 1), mats.graniteStone);
        tor.position.y = 0.08;
        tor.scale.set(1.2, 0.9, 1.2);
        tor.castShadow = true;
        group.add(tor);
        break;
      }

      case 'gujarat': {
        // Flowering Bougainvillea Bush
        const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 1), mats.treeFoliageA);
        bush.position.y = 0.06;
        group.add(bush);

        const petals = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), mats.blossomPink);
        petals.position.set(0, 0.11, 0);
        group.add(petals);
        break;
      }

      case 'rajasthan': {
        // Prickly Pear Cactus Cluster (Nagphani)
        const pad1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.02), mats.treeFoliageB);
        pad1.position.set(0, 0.08, 0);
        pad1.castShadow = true;
        group.add(pad1);

        const pad2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.02), mats.treeFoliageB);
        pad2.position.set(-0.06, 0.14, 0);
        pad2.rotation.z = 0.4;
        group.add(pad2);

        // Yellow cactus flower
        const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.025, 0), mats.goldCoin);
        flower.position.set(-0.08, 0.20, 0);
        group.add(flower);
        break;
      }
    }

    return group;
  }
}

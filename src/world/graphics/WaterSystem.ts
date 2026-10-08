import * as THREE from 'three';
import { Materials } from './Materials';

export class WaterSystem {
  public mesh: THREE.Mesh;
  public distantIslands: THREE.Group;
  private time = 0;

  constructor(scene: THREE.Scene) {
    const mats = Materials.get();

    // 1. Crystal Ocean Water Plane
    const geo = new THREE.PlaneGeometry(120, 120, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant turquoise / azure ocean
      roughness: 0.12,
      metalness: 0.18,
      transparent: true,
      opacity: 0.88,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.02;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // 2. Distant Horizon Islands for Cinematic Atmosphere Depth
    this.distantIslands = new THREE.Group();
    const horizonPositions = [
      { x: -35, z: -40, s: 4.5, h: 2.2 },
      { x: 38, z: -35, s: 5.0, h: 3.0 },
      { x: 42, z: 25, s: 3.8, h: 1.8 },
      { x: -38, z: 32, s: 4.0, h: 2.0 }
    ];

    horizonPositions.forEach((hp) => {
      const island = new THREE.Mesh(new THREE.ConeGeometry(hp.s, hp.h, 7), mats.cliffRock);
      island.position.set(hp.x, hp.h / 2 - 0.2, hp.z);
      island.scale.set(1.4, 1, 1.2);
      this.distantIslands.add(island);

      // Distant green foliage cap
      const greenCap = new THREE.Mesh(new THREE.DodecahedronGeometry(hp.s * 0.45, 1), mats.darkGrass);
      greenCap.position.set(hp.x, hp.h * 0.8, hp.z);
      this.distantIslands.add(greenCap);
    });

    scene.add(this.distantIslands);
  }

  public update(dt: number): void {
    this.time += dt * 1.6;
    const pos = this.mesh.geometry.attributes.position;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const wave = Math.sin(u * 0.35 + this.time) * 0.05 + Math.cos(v * 0.45 + this.time * 0.7) * 0.04;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }
}

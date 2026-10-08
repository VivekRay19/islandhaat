import * as THREE from 'three';
import { Materials } from './Materials';

export class WaterSystem {
  public mesh: THREE.Mesh;
  private time = 0;

  constructor(scene: THREE.Scene) {
    const geo = new THREE.PlaneGeometry(80, 80, 48, 48);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1e88e5,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }

  public update(dt: number): void {
    this.time += dt * 1.5;
    const pos = this.mesh.geometry.attributes.position;
    const count = pos.count;
    for (let i = 0; i < count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);
      const wave = Math.sin(u * 0.4 + this.time) * 0.04 + Math.cos(v * 0.5 + this.time * 0.8) * 0.03;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }
}

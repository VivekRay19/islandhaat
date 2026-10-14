import * as THREE from 'three';
import { IndianState } from '../culture/CultureTypes';
import { CulturalSpecialistBuilder, SpecialistParts } from '../graphics/CulturalSpecialistBuilder';
import { RemotePlayerState } from './MultiplayerRoom';
import { damp, dampAngle } from '../core/math';

export class NetworkedPlayer {
  public playerId: string;
  public group: THREE.Group;
  private specialist: SpecialistParts;
  private nameplateMesh: THREE.Sprite;

  private targetPos: THREE.Vector3 = new THREE.Vector3();
  private targetRotationY: number = 0;
  private isMoving: boolean = false;
  private walkPhase: number = 0;

  private currentDisplayedName: string;

  constructor(scene: THREE.Scene, state: RemotePlayerState) {
    this.playerId = state.playerId;
    this.currentDisplayedName = state.playerName;
    this.group = new THREE.Group();

    // 1. Cultural 3D Model
    this.specialist = CulturalSpecialistBuilder.createSpecialist(state.homeIsland || 'bihar');
    this.group.add(this.specialist.root);

    // 2. Overhead Floating Nameplate & Island Badge
    this.nameplateMesh = this.createNameplate(state.playerName, state.homeIsland);
    this.nameplateMesh.position.set(0, 0.85, 0);
    this.group.add(this.nameplateMesh);

    this.group.position.set(state.x, state.y, state.z);
    this.targetPos.set(state.x, state.y, state.z);
    this.targetRotationY = state.rotationY;

    scene.add(this.group);
  }

  private createNameplate(name: string, homeIsland: IndianState): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Rounded tag background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 44, 22);
    ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.65, 0.16, 1);
    return sprite;
  }

  public updateTarget(state: RemotePlayerState): void {
    this.targetPos.set(state.x, state.y, state.z);
    this.targetRotationY = state.rotationY;
    this.isMoving = state.isMoving;

    if (state.playerName && state.playerName !== this.currentDisplayedName) {
      this.currentDisplayedName = state.playerName;
      this.group.remove(this.nameplateMesh);
      if (this.nameplateMesh.material.map) {
        this.nameplateMesh.material.map.dispose();
      }
      this.nameplateMesh.material.dispose();
      this.nameplateMesh = this.createNameplate(state.playerName, state.homeIsland);
      this.nameplateMesh.position.set(0, 0.85, 0);
      this.group.add(this.nameplateMesh);
    }
  }

  public update(dt: number): void {
    // Smoothly interpolate position and orientation
    this.group.position.lerp(this.targetPos, Math.min(1, dt * 10));
    this.group.rotation.y = dampAngle(this.group.rotation.y, this.targetRotationY, 12, dt);

    // Iron-Golem-inspired heavy gait for remote players
    if (this.isMoving) {
      this.walkPhase += dt * 3.2;
      const legAngle = Math.sin(this.walkPhase) * 0.38;
      const armAngle = -Math.sin(this.walkPhase) * 0.24;
      this.specialist.leftLeg.rotation.set(legAngle, 0, 0);
      this.specialist.rightLeg.rotation.set(-legAngle, 0, 0);
      this.specialist.leftArm.rotation.set(armAngle, 0, 0);
      this.specialist.rightArm.rotation.set(-armAngle, 0, 0);
      this.specialist.torsoGroup.position.set(0, 0.22 - Math.abs(Math.sin(this.walkPhase)) * 0.004, 0);
      this.specialist.torsoGroup.rotation.set(0, 0, 0);
    } else {
      this.specialist.leftLeg.rotation.x = damp(this.specialist.leftLeg.rotation.x, 0, 16, dt);
      this.specialist.rightLeg.rotation.x = damp(this.specialist.rightLeg.rotation.x, 0, 16, dt);
      this.specialist.leftArm.rotation.x = damp(this.specialist.leftArm.rotation.x, 0, 16, dt);
      this.specialist.rightArm.rotation.x = damp(this.specialist.rightArm.rotation.x, 0, 16, dt);
      this.specialist.torsoGroup.position.y = damp(this.specialist.torsoGroup.position.y, 0.22, 16, dt);
      this.specialist.torsoGroup.rotation.set(0, 0, 0);
    }
  }

  public destroy(scene: THREE.Scene): void {
    scene.remove(this.group);
  }
}

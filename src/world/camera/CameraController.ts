import * as THREE from 'three';
import { damp, easeInOutCubic, lerp } from '../core/math';
import { CharacterController } from '../character/CharacterController';

export type GameMode = 'build' | 'explore';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public mode: GameMode = 'build';

  // Build mode orbital parameters
  public buildTarget: THREE.Vector3 = new THREE.Vector3(0, 0.4, 0);
  public buildDistance: number = 8.5;
  public buildYaw: number = -0.78; // 45 deg
  public buildPitch: number = 0.85; // elevated isometric angle

  // Explore mode third-person parameters
  public exploreDistance: number = 3.2;
  public exploreYaw: number = 0;
  public explorePitch: number = 0.35;

  // Transition state
  private isTransitioning: boolean = false;
  private transitionT: number = 1.0;
  private transitionDuration: number = 1.0;
  private fromPos: THREE.Vector3 = new THREE.Vector3();
  private fromTarget: THREE.Vector3 = new THREE.Vector3();
  private toPos: THREE.Vector3 = new THREE.Vector3();
  private toTarget: THREE.Vector3 = new THREE.Vector3();

  // Current calculated targets
  public currentTarget: THREE.Vector3 = new THREE.Vector3();
  public currentPos: THREE.Vector3 = new THREE.Vector3();

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 150);
    this.currentPos.set(0, 8, 8);
    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.buildTarget);
  }

  public setAspect(aspect: number): void {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  public switchToExplore(character: CharacterController): void {
    if (this.mode === 'explore') return;
    this.mode = 'explore';
    this.startTransition(
      this.currentPos.clone(),
      this.currentTarget.clone(),
      this.getExploreTargetPos(character),
      character.position.clone().add(new THREE.Vector3(0, 0.3, 0))
    );
  }

  public switchToBuild(): void {
    if (this.mode === 'build') return;
    this.mode = 'build';
    this.startTransition(
      this.currentPos.clone(),
      this.currentTarget.clone(),
      this.getBuildTargetPos(),
      this.buildTarget.clone()
    );
  }

  private startTransition(fromP: THREE.Vector3, fromT: THREE.Vector3, toP: THREE.Vector3, toT: THREE.Vector3): void {
    this.isTransitioning = true;
    this.transitionT = 0;
    this.fromPos.copy(fromP);
    this.fromTarget.copy(fromT);
    this.toPos.copy(toP);
    this.toTarget.copy(toT);
  }

  private getBuildTargetPos(): THREE.Vector3 {
    const x = this.buildTarget.x + Math.sin(this.buildYaw) * Math.cos(this.buildPitch) * this.buildDistance;
    const y = this.buildTarget.y + Math.sin(this.buildPitch) * this.buildDistance;
    const z = this.buildTarget.z + Math.cos(this.buildYaw) * Math.cos(this.buildPitch) * this.buildDistance;
    return new THREE.Vector3(x, y, z);
  }

  private getExploreTargetPos(character: CharacterController): THREE.Vector3 {
    const charHead = character.position.clone().add(new THREE.Vector3(0, 0.3, 0));
    const x = charHead.x + Math.sin(this.exploreYaw) * Math.cos(this.explorePitch) * this.exploreDistance;
    const y = charHead.y + Math.sin(this.explorePitch) * this.exploreDistance;
    const z = charHead.z + Math.cos(this.exploreYaw) * Math.cos(this.explorePitch) * this.exploreDistance;
    return new THREE.Vector3(x, y, z);
  }

  public panBuildCamera(deltaX: number, deltaZ: number): void {
    if (this.mode !== 'build') return;
    const right = new THREE.Vector3(Math.cos(this.buildYaw), 0, -Math.sin(this.buildYaw));
    const forward = new THREE.Vector3(-Math.sin(this.buildYaw), 0, -Math.cos(this.buildYaw));

    this.buildTarget.addScaledVector(right, deltaX * 0.012);
    this.buildTarget.addScaledVector(forward, deltaZ * 0.012);
  }

  public zoomBuildCamera(deltaZoom: number): void {
    if (this.mode !== 'build') return;
    this.buildDistance = Math.min(18, Math.max(4.5, this.buildDistance + deltaZoom * 0.005));
  }

  public rotateExploreCamera(deltaYaw: number, deltaPitch: number): void {
    if (this.mode !== 'explore') return;
    this.exploreYaw += deltaYaw * 0.005;
    this.explorePitch = Math.min(1.2, Math.max(0.1, this.explorePitch + deltaPitch * 0.005));
  }

  public update(dt: number, character: CharacterController): void {
    if (this.isTransitioning) {
      this.transitionT += dt / this.transitionDuration;
      if (this.transitionT >= 1.0) {
        this.transitionT = 1.0;
        this.isTransitioning = false;
      }
      const k = easeInOutCubic(this.transitionT);
      this.currentPos.lerpVectors(this.fromPos, this.toPos, k);
      this.currentTarget.lerpVectors(this.fromTarget, this.toTarget, k);
    } else if (this.mode === 'build') {
      const targetPos = this.getBuildTargetPos();
      this.currentPos.copy(targetPos);
      this.currentTarget.copy(this.buildTarget);
    } else {
      // Explore mode follow
      const targetPos = this.getExploreTargetPos(character);
      this.currentPos.x = damp(this.currentPos.x, targetPos.x, 10, dt);
      this.currentPos.y = damp(this.currentPos.y, targetPos.y, 10, dt);
      this.currentPos.z = damp(this.currentPos.z, targetPos.z, 10, dt);

      const headPos = character.position.clone().add(new THREE.Vector3(0, 0.35, 0));
      this.currentTarget.x = damp(this.currentTarget.x, headPos.x, 12, dt);
      this.currentTarget.y = damp(this.currentTarget.y, headPos.y, 12, dt);
      this.currentTarget.z = damp(this.currentTarget.z, headPos.z, 12, dt);
    }

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentTarget);
  }
}

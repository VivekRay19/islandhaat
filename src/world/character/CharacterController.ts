import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { TerrainField } from '../hex/TerrainField';
import { clamp, damp, dampAngle, lerp } from '../core/math';
import { IndianState } from '../culture/CultureTypes';
import { CulturalSpecialistBuilder, SpecialistParts } from '../graphics/CulturalSpecialistBuilder';

export class CharacterController {
  public mesh: THREE.Group;
  public dogMesh: THREE.Group;
  public culture: IndianState;
  private specialist: SpecialistParts;

  // Companion Dog parts
  private dogBody: THREE.Mesh;
  private dogHead: THREE.Mesh;
  private dogEars: THREE.Mesh;
  private dogTail: THREE.Mesh;
  private dogLegs: THREE.Mesh[] = [];

  public position: THREE.Vector3 = new THREE.Vector3(0, 0.34, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationY: number = 0;

  public isGrounded: boolean = true;
  public isMoving: boolean = false;

  private speed: number = 3.6;
  private gravity: number = 14.0;
  private jumpForce: number = 5.2;
  private animTimer: number = 0;

  // Dog follow position
  private dogPos: THREE.Vector3 = new THREE.Vector3(-0.4, 0.34, 0.3);
  private dogRotationY: number = 0;

  // Input states
  public inputVector: THREE.Vector2 = new THREE.Vector2(0, 0);
  public jumpRequested: boolean = false;

  constructor(scene: THREE.Scene, culture: IndianState = 'bihar') {
    this.culture = culture;

    // =========================================================================
    // 1. ARTICULATED STYLIZED SPECIALIST CHARACTER
    // =========================================================================
    this.mesh = new THREE.Group();

    // Dedicated Culture Specialist Model with Articulated Limbs
    this.specialist = CulturalSpecialistBuilder.createSpecialist(culture);
    this.mesh.add(this.specialist.root);
    this.mesh.visible = false; // Hidden in Build Mode initially
    scene.add(this.mesh);

    // =========================================================================
    // 2. COMPANION PUPPY / DOG (Stylized Rounded Geometry)
    // =========================================================================
    this.dogMesh = new THREE.Group();
    const dogWhite = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.65 });
    const dogBrown = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
    const dogNose = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });
    const dogCollar = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }); // Red puppy collar

    // Rounded Body (Smooth Capsule/Cylinder geometry)
    this.dogBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), dogWhite);
    this.dogBody.rotation.x = Math.PI / 2;
    this.dogBody.position.y = 0.13;
    this.dogBody.castShadow = true;
    this.dogMesh.add(this.dogBody);

    // Warm Brown Patch on Body
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), dogBrown);
    patch.scale.set(0.9, 0.6, 1.1);
    patch.position.set(0.03, 0.04, 0.01);
    this.dogBody.add(patch);

    // Cute Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.015, 6, 16), dogCollar);
    collar.position.set(0, 0.08, 0);
    this.dogBody.add(collar);

    // Rounded Head
    this.dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), dogWhite);
    this.dogHead.position.set(0, 0.21, 0.12);
    this.dogHead.castShadow = true;
    this.dogMesh.add(this.dogHead);

    // Floppy Drooping Ears
    const leftEar = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), dogBrown);
    leftEar.position.set(-0.07, 0.03, -0.01);
    leftEar.rotation.z = 0.35;
    leftEar.rotation.x = 0.2;
    this.dogHead.add(leftEar);

    const rightEar = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), dogBrown);
    rightEar.position.set(0.07, 0.03, -0.01);
    rightEar.rotation.z = -0.35;
    rightEar.rotation.x = 0.2;
    this.dogHead.add(rightEar);
    this.dogEars = leftEar;

    // Rounded Snout & Shiny Button Nose
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8), dogWhite);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.02, 0.08);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), dogNose);
    nose.position.set(0, 0.03, 0.02);
    snout.add(nose);
    this.dogHead.add(snout);

    // Playful Tail
    this.dogTail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.13, 8), dogBrown);
    this.dogTail.position.set(0, 0.18, -0.12);
    this.dogTail.rotation.x = -Math.PI / 3.5;
    this.dogMesh.add(this.dogTail);

    // 4 Articulated Little Rounded Paws / Legs with hip pivot groups
    const legOffsets = [
      { x: -0.055, z: 0.065 }, // 0: Front Left
      { x: 0.055, z: 0.065 },  // 1: Front Right
      { x: -0.055, z: -0.065 }, // 2: Hind Left
      { x: 0.055, z: -0.065 }  // 3: Hind Right
    ];
    legOffsets.forEach((lo) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(lo.x, 0.09, lo.z);
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.09, 8), dogWhite);
      legMesh.position.set(0, -0.045, 0);
      legMesh.castShadow = true;
      legPivot.add(legMesh);
      this.dogMesh.add(legPivot);
      this.dogLegs.push(legPivot as any);
    });

    this.dogMesh.scale.set(0.9, 0.9, 0.9);
    this.dogMesh.visible = false; // Hidden in Build Mode initially
    scene.add(this.dogMesh);
    CharacterController.initSpeedTuner();
  }

  // Animation speed tuning (Ultra-slow default: 1.5 rad/s ~ 4.2s per cycle)
  public static walkAnimSpeed: number = 1.5;
  private static toastTimeout: any = null;

  private static initSpeedTuner(): void {
    if (typeof window === 'undefined' || (window as any).__haatTunerInitialized) return;
    (window as any).__haatTunerInitialized = true;

    (window as any).setHaatAnimSpeed = (speed: number) => {
      CharacterController.walkAnimSpeed = Math.max(0.2, Math.min(8.0, speed));
      CharacterController.showSpeedToast();
    };
    (window as any).getHaatAnimSpeed = () => CharacterController.walkAnimSpeed;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '[' || e.key === '{') {
        CharacterController.walkAnimSpeed = Math.max(0.3, +(CharacterController.walkAnimSpeed - 0.2).toFixed(2));
        CharacterController.showSpeedToast();
      } else if (e.key === ']' || e.key === '}') {
        CharacterController.walkAnimSpeed = Math.min(6.0, +(CharacterController.walkAnimSpeed + 0.2).toFixed(2));
        CharacterController.showSpeedToast();
      }
    });
  }

  private static showSpeedToast(): void {
    if (typeof document === 'undefined') return;
    let toast = document.getElementById('haat-speed-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'haat-speed-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(15, 23, 42, 0.92);
        border: 1px solid rgba(245, 158, 11, 0.6);
        color: #fef08a;
        padding: 8px 14px;
        border-radius: 10px;
        font-family: system-ui, sans-serif;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.3px;
        z-index: 99999;
        pointer-events: none;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = `🚶 Animation Speed: ${CharacterController.walkAnimSpeed.toFixed(1)} rad/s (Keys [ / ] to tune)`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    if (CharacterController.toastTimeout) clearTimeout(CharacterController.toastTimeout);
    CharacterController.toastTimeout = setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
      }
    }, 2200);
    console.log(`[Island Haat] 🚶 Walk animation speed: ${CharacterController.walkAnimSpeed.toFixed(1)} rad/s`);
  }

  // Animation state weights and phases
  private walkWeight: number = 0.0;
  private walkCyclePhase: number = 0.0;
  private dogWalkWeight: number = 0.0;
  private dogWalkPhase: number = 0.0;

  public setPosition(x: number, z: number, terrain: TerrainField): void {
    this.position.x = x;
    this.position.z = z;
    this.position.y = terrain.getHeight(x, z);
    this.velocity.set(0, 0, 0);
    this.walkWeight = 0;
    this.walkCyclePhase = 0;
    this.dogWalkWeight = 0;
    this.dogWalkPhase = 0;
    this.mesh.position.copy(this.position);

    this.dogPos.set(x - 0.4, this.position.y, z + 0.3);
    this.dogMesh.position.copy(this.dogPos);
  }

  public update(dt: number, cameraAngle: number, terrain: TerrainField): void {
    // 1. World Movement Relative to Camera
    const moveDir = new THREE.Vector3(0, 0, 0);
    const hasInput = this.inputVector.lengthSq() > 0.01;
    if (hasInput) {
      const forward = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle));
      const right = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle));

      moveDir.addScaledVector(right, this.inputVector.x);
      moveDir.addScaledVector(forward, this.inputVector.y);
      moveDir.normalize();

      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.rotationY = dampAngle(this.rotationY, targetAngle, 16, dt);
    }

    // 2. Velocity with Fast Deceleration when input stops
    const targetVelX = moveDir.x * this.speed;
    const targetVelZ = moveDir.z * this.speed;
    const accelRate = hasInput ? 14 : 20; // snappy, clean deceleration
    this.velocity.x = damp(this.velocity.x, targetVelX, accelRate, dt);
    this.velocity.z = damp(this.velocity.z, targetVelZ, accelRate, dt);

    // Compute true horizontal ground speed
    const groundSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    // Strict threshold: below 0.05 m/s, cleanly stop residual crawl
    if (!hasInput && groundSpeed < 0.05) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
    const currentGroundSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    this.isMoving = currentGroundSpeed > 0.08;

    // 3. Jump (Only while grounded and requested in Explore Mode)
    if (this.isGrounded && this.jumpRequested) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.jumpRequested = false;
    }

    this.velocity.y -= this.gravity * dt;

    // 4. Collision & Step
    const nextX = this.position.x + this.velocity.x * dt;
    const nextZ = this.position.z + this.velocity.z * dt;

    if (terrain.isWalkable(nextX, nextZ)) {
      this.position.x = nextX;
      this.position.z = nextZ;
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    this.position.y += this.velocity.y * dt;

    const groundY = terrain.getHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;

    // 5. Companion Dog Following Logic
    // Desired offset in character's local coordinates behind to the left
    const dogTarget = new THREE.Vector3(
      this.position.x - Math.sin(this.rotationY + 0.6) * 0.45,
      this.position.y,
      this.position.z - Math.cos(this.rotationY + 0.6) * 0.45
    );
    const distToDog = Math.hypot(dogTarget.x - this.dogPos.x, dogTarget.z - this.dogPos.z);
    
    // Smooth follow without jitter; if close enough, stop dog movement completely
    let dogSpeed = 0;
    if (distToDog > 0.12) {
      const prevX = this.dogPos.x;
      const prevZ = this.dogPos.z;
      this.dogPos.lerp(dogTarget, dt * 6.5);
      dogSpeed = Math.hypot(this.dogPos.x - prevX, this.dogPos.z - prevZ) / Math.max(dt, 0.001);
    }
    this.dogPos.y = terrain.getHeight(this.dogPos.x, this.dogPos.z);
    this.dogMesh.position.copy(this.dogPos);

    const dogDir = new THREE.Vector3().subVectors(this.position, this.dogPos);
    if (dogDir.lengthSq() > 0.02) {
      const targetDogRot = Math.atan2(dogDir.x, dogDir.z);
      this.dogRotationY = dampAngle(this.dogRotationY, targetDogRot, 12, dt);
      this.dogMesh.rotation.y = this.dogRotationY;
    }

    // =========================================================================
    // 6. ANIMATION CONTROLLER (Clean State Blending & Zero Residual Jiggle)
    // =========================================================================
    const parts = this.specialist;

    // Smoothly blend walk weight: 1.0 when moving, 0.0 when stopped (200ms transition)
    const targetWalkWeight = (this.isGrounded && this.isMoving) ? clamp(currentGroundSpeed / this.speed, 0.2, 1.0) : 0.0;
    this.walkWeight = damp(this.walkWeight, targetWalkWeight, 14, dt);
    if (this.walkWeight < 0.01) {
      this.walkWeight = 0;
    }

    if (!this.isGrounded) {
      // Jump / Fall Airborne Pose
      const jumpRatio = clamp(this.velocity.y / this.jumpForce, -1, 1);
      parts.torsoGroup.position.set(0, 0.22, 0);
      parts.torsoGroup.rotation.set(jumpRatio * -0.12, 0, 0);
      parts.leftLeg.rotation.set(0.35 + jumpRatio * 0.1, 0, 0);
      parts.rightLeg.rotation.set(-0.25 - jumpRatio * 0.1, 0, 0);
      parts.leftArm.rotation.set(-0.5 - jumpRatio * 0.2, 0, 0);
      parts.rightArm.rotation.set(-0.4 - jumpRatio * 0.2, 0, 0);
      parts.headGroup.rotation.set(0.08 - jumpRatio * 0.1, 0, 0);

      // Dog airborne / alert tail
      this.dogTail.rotation.z = 0;
      for (let i = 0; i < 4; i++) {
        this.dogLegs[i].rotation.x = damp(this.dogLegs[i].rotation.x, 0, 16, dt);
      }
    } else if (this.walkWeight > 0.01) {
      // -----------------------------------------------------------------------
      // Ultra-Slow Locomotion Gait (Inspectable Speed Pass for Tuning)
      // -----------------------------------------------------------------------
      const speedFactor = Math.max(0.65, currentGroundSpeed / this.speed);
      const strideRate = speedFactor * CharacterController.walkAnimSpeed;
      this.walkCyclePhase += dt * strideRate;
      const phi = this.walkCyclePhase;
      const w = this.walkWeight;

      // Ultra-gentle step bob (6mm rhythmic vertical step cadence)
      const stepBob = Math.abs(Math.sin(phi)) * 0.008 * w;
      parts.torsoGroup.position.set(0, 0.22 + stepBob, 0);
      parts.torsoGroup.rotation.set(0, 0, 0);

      // Slow, graceful leg swing (~15° = 0.26 rad)
      const legAngle = Math.sin(phi) * 0.26 * w;
      parts.leftLeg.rotation.set(legAngle, 0, 0);
      parts.rightLeg.rotation.set(-legAngle, 0, 0);

      // Natural contralateral arm counter-swing (~12° = 0.20 rad)
      const armAngle = -legAngle * 0.8;
      parts.leftArm.rotation.set(armAngle, 0, 0);
      parts.rightArm.rotation.set(-armAngle, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0);

      // Companion Dog slow-motion quadruped trot
      this.dogWalkPhase += dt * CharacterController.walkAnimSpeed * 1.1;
      const dogPhi = this.dogWalkPhase;
      const dogLegAngle = Math.sin(dogPhi) * 0.22 * w;
      this.dogLegs[0].rotation.set(dogLegAngle, 0, 0);   // Front Left
      this.dogLegs[1].rotation.set(-dogLegAngle, 0, 0);  // Front Right
      this.dogLegs[2].rotation.set(-dogLegAngle, 0, 0);  // Hind Left
      this.dogLegs[3].rotation.set(dogLegAngle, 0, 0);   // Hind Right

      this.dogMesh.position.y = this.dogPos.y + Math.abs(Math.sin(dogPhi)) * 0.006 * w;
      this.dogTail.rotation.z = Math.sin(dogPhi * 1.2) * 0.25 * w;
    } else {
      // -----------------------------------------------------------------------
      // Completely Settled Stable Idle State (Zero Jiggle, Zero Drift)
      // -----------------------------------------------------------------------
      parts.torsoGroup.position.set(0, 0.22, 0);
      parts.torsoGroup.rotation.set(0, 0, 0);
      parts.leftLeg.rotation.set(0, 0, 0);
      parts.rightLeg.rotation.set(0, 0, 0);
      parts.leftArm.rotation.set(0, 0, 0);
      parts.rightArm.rotation.set(0, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0);

      for (let i = 0; i < 4; i++) {
        this.dogLegs[i].rotation.set(0, 0, 0);
      }
      this.dogTail.rotation.z = 0;
    }
  }

  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
    this.dogMesh.visible = visible;
  }
}

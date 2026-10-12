import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { TerrainField } from '../hex/TerrainField';
import { clamp, damp, dampAngle, lerp } from '../core/math';
import { IndianState } from '../culture/CultureTypes';
import { CulturalSpecialistBuilder, SpecialistParts } from '../graphics/CulturalSpecialistBuilder';

export interface AnimationTuningSettings {
  legSpeed: number;           // 0.15x - 1.25x
  armSpeed: number;           // 0.15x - 1.25x
  legSwingIntensity: number;  // 0.15x - 1.00x
  armSwingIntensity: number;  // 0.15x - 1.00x
  blendSpeed: number;         // 0.25x - 2.00x
  dogSpeed: number;           // 0.15x - 1.25x
  dogSwingIntensity: number;  // 0.15x - 1.00x
  linkedGait: boolean;        // default: true
  diagnosticSlowWalk: boolean;// default: false
}

export const ANIMATION_PRESETS: Record<string, AnimationTuningSettings> = {
  ULTRA_SLOW: {
    legSpeed: 0.15,
    armSpeed: 0.15,
    legSwingIntensity: 0.30,
    armSwingIntensity: 0.30,
    blendSpeed: 1.0,
    dogSpeed: 0.20,
    dogSwingIntensity: 0.35,
    linkedGait: true,
    diagnosticSlowWalk: false
  },
  VERY_SLOW: {
    legSpeed: 0.30,
    armSpeed: 0.30,
    legSwingIntensity: 0.45,
    armSwingIntensity: 0.45,
    blendSpeed: 1.0,
    dogSpeed: 0.30,
    dogSwingIntensity: 0.45,
    linkedGait: true,
    diagnosticSlowWalk: false
  },
  SLOW: {
    legSpeed: 0.50,
    armSpeed: 0.50,
    legSwingIntensity: 0.60,
    armSwingIntensity: 0.60,
    blendSpeed: 1.0,
    dogSpeed: 0.50,
    dogSwingIntensity: 0.60,
    linkedGait: true,
    diagnosticSlowWalk: false
  },
  MODERATE: {
    legSpeed: 0.75,
    armSpeed: 0.75,
    legSwingIntensity: 0.80,
    armSwingIntensity: 0.80,
    blendSpeed: 1.0,
    dogSpeed: 0.75,
    dogSwingIntensity: 0.80,
    linkedGait: true,
    diagnosticSlowWalk: false
  },
  ORIGINAL: {
    legSpeed: 1.00,
    armSpeed: 1.00,
    legSwingIntensity: 1.00,
    armSwingIntensity: 1.00,
    blendSpeed: 1.0,
    dogSpeed: 1.00,
    dogSwingIntensity: 1.00,
    linkedGait: true,
    diagnosticSlowWalk: false
  }
};

export const BASE_WALK_CADENCE = 6.0;   // rad/s at full walk speed
export const BASE_LEG_SWING = 0.65;     // max leg rotation in radians (~37°)
export const BASE_ARM_SWING = 0.55;     // max arm rotation in radians (~31°)
export const BASE_DOG_CADENCE = 6.5;    // dog step cadence in rad/s
export const BASE_DOG_SWING = 0.45;     // dog leg rotation in radians (~26°)
export const BASE_BLEND_SPEED = 14.0;   // blend transition damp rate
export const NORMAL_WALK_SPEED = 3.6;   // normal character horizontal speed
export const DIAGNOSTIC_WALK_SPEED = 1.44; // 0.4x walk speed for diagnostic inspection

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

    this.loadTuningSettings();
  }

  // Animation Tuning Settings & Presets
  public tuning: AnimationTuningSettings = { ...ANIMATION_PRESETS.ULTRA_SLOW };

  public applyPreset(presetKey: keyof typeof ANIMATION_PRESETS): void {
    if (ANIMATION_PRESETS[presetKey]) {
      this.tuning = { ...ANIMATION_PRESETS[presetKey] };
      this.saveTuningSettings();
      console.log(`[Island Haat] Applied animation preset: ${presetKey}`);
    }
  }

  public saveTuningSettings(): void {
    try {
      localStorage.setItem('islandhaat_anim_tuning', JSON.stringify(this.tuning));
    } catch (_) {}
  }

  public loadTuningSettings(): void {
    try {
      const saved = localStorage.getItem('islandhaat_anim_tuning');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.tuning = { ...ANIMATION_PRESETS.ULTRA_SLOW, ...parsed };
      }
    } catch (_) {}
  }

  // Animation state weights and phases (independent leg, arm, dog phases)
  private walkWeight: number = 0.0;
  private legPhase: number = 0.0;
  private armPhase: number = 0.0;
  private dogWalkWeight: number = 0.0;
  private dogPhase: number = 0.0;

  public setPosition(x: number, z: number, terrain: TerrainField): void {
    this.position.x = x;
    this.position.z = z;
    this.position.y = terrain.getHeight(x, z);
    this.velocity.set(0, 0, 0);
    this.walkWeight = 0;
    this.legPhase = 0;
    this.armPhase = 0;
    this.dogWalkWeight = 0;
    this.dogPhase = 0;
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
    // 6. ANIMATION CONTROLLER (Tunable Cadence, Intensity, and State Blending)
    // =========================================================================
    const parts = this.specialist;

    // Smoothly blend walk weight: 1.0 when moving, 0.0 when stopped
    const targetWalkWeight = (this.isGrounded && this.isMoving) ? clamp(currentGroundSpeed / this.speed, 0.2, 1.0) : 0.0;
    const blendRate = BASE_BLEND_SPEED * this.tuning.blendSpeed;
    this.walkWeight = damp(this.walkWeight, targetWalkWeight, blendRate, dt);
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
      // Tunable Locomotion Gait (Phase advances only while actively moving)
      // -----------------------------------------------------------------------
      const speedRatio = Math.max(0.2, currentGroundSpeed / this.speed);
      const legCadence = speedRatio * BASE_WALK_CADENCE * this.tuning.legSpeed;
      this.legPhase += dt * legCadence;

      if (this.tuning.linkedGait) {
        this.armPhase = this.legPhase;
      } else {
        const armCadence = speedRatio * BASE_WALK_CADENCE * this.tuning.armSpeed;
        this.armPhase += dt * armCadence;
      }

      const w = this.walkWeight;
      const legAmp = BASE_LEG_SWING * this.tuning.legSwingIntensity * w;
      const armAmp = BASE_ARM_SWING * this.tuning.armSwingIntensity * w;

      // Stable torso: subtle rhythmic step bob (4mm) only, no bouncing or wobble
      const stepBob = Math.abs(Math.sin(this.legPhase)) * 0.005 * w;
      parts.torsoGroup.position.set(0, 0.22 + stepBob, 0);
      parts.torsoGroup.rotation.set(0, 0, 0);

      // Contralateral limb motion calculated from neutral (0, 0, 0)
      const legAngle = Math.sin(this.legPhase) * legAmp;
      const armAngle = -Math.sin(this.armPhase) * armAmp;

      parts.leftLeg.rotation.set(legAngle, 0, 0);
      parts.rightLeg.rotation.set(-legAngle, 0, 0);
      parts.leftArm.rotation.set(armAngle, 0, 0);
      parts.rightArm.rotation.set(-armAngle, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0);

      // Companion Dog slow-motion quadruped trot
      const dogTargetWeight = (distToDog > 0.12 && dogSpeed > 0.05) ? 1.0 : 0.0;
      this.dogWalkWeight = damp(this.dogWalkWeight, dogTargetWeight, blendRate, dt);
      if (this.dogWalkWeight > 0.01) {
        const dogCadence = (dogSpeed / NORMAL_WALK_SPEED) * BASE_DOG_CADENCE * this.tuning.dogSpeed;
        this.dogPhase += dt * dogCadence;
        const dogAmp = BASE_DOG_SWING * this.tuning.dogSwingIntensity * this.dogWalkWeight;
        const dogAngle = Math.sin(this.dogPhase) * dogAmp;

        this.dogLegs[0].rotation.set(dogAngle, 0, 0);   // Front Left
        this.dogLegs[1].rotation.set(-dogAngle, 0, 0);  // Front Right
        this.dogLegs[2].rotation.set(-dogAngle, 0, 0);  // Hind Left
        this.dogLegs[3].rotation.set(dogAngle, 0, 0);   // Hind Right

        this.dogMesh.position.y = this.dogPos.y + Math.abs(Math.sin(this.dogPhase)) * 0.005 * this.dogWalkWeight;
        this.dogTail.rotation.z = Math.sin(this.dogPhase * 1.2) * 0.25 * this.dogWalkWeight;
      } else {
        for (let i = 0; i < 4; i++) {
          this.dogLegs[i].rotation.set(0, 0, 0);
        }
        this.dogTail.rotation.z = 0;
      }
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

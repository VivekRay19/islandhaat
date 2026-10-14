import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { TerrainField } from '../hex/TerrainField';
import { clamp, damp, dampAngle, lerp } from '../core/math';
import { IndianState } from '../culture/CultureTypes';
import { CulturalSpecialistBuilder, SpecialistParts } from '../graphics/CulturalSpecialistBuilder';

export interface AnimationTuningSettings {
  legSpeed: number;
  armSpeed: number;
  legSwingIntensity: number;
  armSwingIntensity: number;
  blendSpeed: number;
  dogSpeed: number;
  dogSwingIntensity: number;
}

// Heavy, deliberate, grounded Iron-Golem-inspired locomotion constants
export const IRON_GOLEM_WALK_CADENCE = 3.2;  // rad/s: steady, rhythmic, measured step cycle (~0.65s per step)
export const IRON_GOLEM_LEG_SWING = 0.38;    // ~21.8° max leg swing: substantial grounded stride without exaggerated flail
export const IRON_GOLEM_ARM_SWING = 0.24;    // ~13.8° max arm swing: heavy, controlled downward pendulum counter-balance
export const BASE_DOG_CADENCE = 5.2;         // rad/s: quadruped follow trot cadence
export const BASE_DOG_SWING = 0.35;          // ~20°: dog leg rotation
export const BASE_BLEND_SPEED = 18.0;        // fast, clean blend transition rate to prevent foot sliding
export const NORMAL_WALK_SPEED = 3.6;        // character horizontal explore speed

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

  private speed: number = NORMAL_WALK_SPEED;
  private gravity: number = 14.0;
  private jumpForce: number = 5.2;

  // Dog follow position
  private dogPos: THREE.Vector3 = new THREE.Vector3(-0.4, 0.34, 0.3);
  private dogRotationY: number = 0;

  // Input states
  public inputVector: THREE.Vector2 = new THREE.Vector2(0, 0);
  public jumpRequested: boolean = false;

  // Animation weights and phases
  private walkWeight: number = 0.0;
  private legPhase: number = 0.0;
  private dogWalkWeight: number = 0.0;
  private dogPhase: number = 0.0;

  constructor(scene: THREE.Scene, culture: IndianState = 'bihar') {
    this.culture = culture;

    // 1. Cultural Specialist Rig
    this.mesh = new THREE.Group();
    this.specialist = CulturalSpecialistBuilder.createSpecialist(culture);
    this.mesh.add(this.specialist.root);
    this.mesh.visible = false;
    scene.add(this.mesh);

    // 2. Companion Dog
    this.dogMesh = new THREE.Group();
    const dogWhite = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.65 });
    const dogBrown = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
    const dogNose = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });

    // Torso / body
    const bodyGeo = new THREE.BoxGeometry(0.18, 0.16, 0.28);
    this.dogBody = new THREE.Mesh(bodyGeo, dogBrown);
    this.dogBody.position.set(0, 0.12, 0);
    this.dogBody.castShadow = true;
    this.dogMesh.add(this.dogBody);

    // Head
    const headGeo = new THREE.BoxGeometry(0.14, 0.13, 0.14);
    this.dogHead = new THREE.Mesh(headGeo, dogWhite);
    this.dogHead.position.set(0, 0.21, 0.14);
    this.dogHead.castShadow = true;
    this.dogMesh.add(this.dogHead);

    // Snout / Nose
    const noseGeo = new THREE.BoxGeometry(0.06, 0.05, 0.06);
    const noseMesh = new THREE.Mesh(noseGeo, dogNose);
    noseMesh.position.set(0, 0.19, 0.22);
    this.dogMesh.add(noseMesh);

    // Floppy ears
    const earGeo = new THREE.BoxGeometry(0.04, 0.08, 0.03);
    const leftEar = new THREE.Mesh(earGeo, dogBrown);
    leftEar.position.set(-0.08, 0.21, 0.12);
    this.dogMesh.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, dogBrown);
    rightEar.position.set(0.08, 0.21, 0.12);
    this.dogMesh.add(rightEar);
    this.dogEars = leftEar;

    // Tail
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.17, -0.14);
    const tailMesh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.1), dogBrown);
    tailMesh.position.set(0, 0.04, -0.04);
    tailMesh.rotation.x = Math.PI / 4;
    tailPivot.add(tailMesh);
    this.dogMesh.add(tailPivot);
    this.dogTail = tailMesh;

    // Four Articulated Legs
    const legOffsets = [
      { x: -0.055, z: 0.085 },  // 0: Front Left
      { x: 0.055, z: 0.085 },   // 1: Front Right
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
    this.dogMesh.visible = false;
    scene.add(this.dogMesh);
  }

  public setPosition(x: number, z: number, terrain: TerrainField): void {
    this.position.x = x;
    this.position.z = z;
    this.position.y = terrain.getHeight(x, z);
    this.velocity.set(0, 0, 0);
    this.walkWeight = 0;
    this.legPhase = 0;
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

    // 2. Velocity Calculation with Decisive Stopping
    const targetVelX = moveDir.x * this.speed;
    const targetVelZ = moveDir.z * this.speed;
    const accelRate = hasInput ? 14 : 22; // Snappy deceleration prevents lingering foot slide
    this.velocity.x = damp(this.velocity.x, targetVelX, accelRate, dt);
    this.velocity.z = damp(this.velocity.z, targetVelZ, accelRate, dt);

    const groundSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    if (!hasInput && groundSpeed < 0.06) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }
    const currentGroundSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    this.isMoving = currentGroundSpeed > 0.08;

    // 3. Jump (Only while grounded and requested)
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
    const dogTarget = new THREE.Vector3(
      this.position.x - Math.sin(this.rotationY + 0.6) * 0.45,
      this.position.y,
      this.position.z - Math.cos(this.rotationY + 0.6) * 0.45
    );
    const distToDog = Math.hypot(dogTarget.x - this.dogPos.x, dogTarget.z - this.dogPos.z);

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
    // 6. IRON-GOLEM-INSPIRED HEAVY LOCOMOTION GAIT
    // =========================================================================
    const parts = this.specialist;

    // Smooth walk weight: 1.0 when moving, 0.0 when stopped
    const targetWalkWeight = this.isGrounded && this.isMoving ? clamp(currentGroundSpeed / this.speed, 0.2, 1.0) : 0.0;
    this.walkWeight = damp(this.walkWeight, targetWalkWeight, BASE_BLEND_SPEED, dt);
    if (this.walkWeight < 0.005) {
      this.walkWeight = 0;
    }

    if (!this.isGrounded) {
      // Airborne Jump / Fall Pose: solid, stable posture
      const jumpRatio = clamp(this.velocity.y / this.jumpForce, -1, 1);
      parts.torsoGroup.position.set(0, 0.22, 0);
      parts.torsoGroup.rotation.set(jumpRatio * -0.08, 0, 0);
      parts.leftLeg.rotation.set(0.25 + jumpRatio * 0.08, 0, 0);
      parts.rightLeg.rotation.set(-0.2 - jumpRatio * 0.08, 0, 0);
      parts.leftArm.rotation.set(-0.35 - jumpRatio * 0.15, 0, 0);
      parts.rightArm.rotation.set(-0.3 - jumpRatio * 0.15, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0);

      this.dogTail.rotation.z = 0;
      for (let i = 0; i < 4; i++) {
        this.dogLegs[i].rotation.x = damp(this.dogLegs[i].rotation.x, 0, 16, dt);
      }
    } else if (this.walkWeight > 0.005) {
      // -----------------------------------------------------------------------
      // Slow, heavy, deliberate Iron Golem walking motion
      // -----------------------------------------------------------------------
      const speedRatio = Math.max(0.2, currentGroundSpeed / this.speed);
      const stepCadence = speedRatio * IRON_GOLEM_WALK_CADENCE;
      this.legPhase += dt * stepCadence;

      const w = this.walkWeight;
      const legAmp = IRON_GOLEM_LEG_SWING * w;
      const armAmp = IRON_GOLEM_ARM_SWING * w;

      // Heavy footstep impact compression (torso dips 3.5mm into ground on foot plant)
      const footfallImpact = Math.abs(Math.sin(this.legPhase)) * 0.004 * w;
      parts.torsoGroup.position.set(0, 0.22 - footfallImpact, 0);
      parts.torsoGroup.rotation.set(0, 0, 0); // Torso remains rock-solid upright

      // Contralateral mechanical limb swing (Left arm opposes left leg)
      const legAngle = Math.sin(this.legPhase) * legAmp;
      const armAngle = -Math.sin(this.legPhase) * armAmp;

      parts.leftLeg.rotation.set(legAngle, 0, 0);
      parts.rightLeg.rotation.set(-legAngle, 0, 0);
      parts.leftArm.rotation.set(armAngle, 0, 0);
      parts.rightArm.rotation.set(-armAngle, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0);

      // Companion Dog Quadruped Trot
      const dogTargetWeight = distToDog > 0.12 && dogSpeed > 0.05 ? 1.0 : 0.0;
      this.dogWalkWeight = damp(this.dogWalkWeight, dogTargetWeight, BASE_BLEND_SPEED, dt);
      if (this.dogWalkWeight > 0.01) {
        const dogCadence = (dogSpeed / NORMAL_WALK_SPEED) * BASE_DOG_CADENCE;
        this.dogPhase += dt * dogCadence;
        const dogAmp = BASE_DOG_SWING * this.dogWalkWeight;
        const dogAngle = Math.sin(this.dogPhase) * dogAmp;

        this.dogLegs[0].rotation.set(dogAngle, 0, 0);
        this.dogLegs[1].rotation.set(-dogAngle, 0, 0);
        this.dogLegs[2].rotation.set(-dogAngle, 0, 0);
        this.dogLegs[3].rotation.set(dogAngle, 0, 0);

        this.dogMesh.position.y = this.dogPos.y + Math.abs(Math.sin(this.dogPhase)) * 0.004 * this.dogWalkWeight;
        this.dogTail.rotation.z = Math.sin(this.dogPhase * 1.2) * 0.2 * this.dogWalkWeight;
      } else {
        for (let i = 0; i < 4; i++) {
          this.dogLegs[i].rotation.set(0, 0, 0);
        }
        this.dogTail.rotation.z = 0;
      }
    } else {
      // -----------------------------------------------------------------------
      // Settled Stable Idle (Zero oscillation, zero drift, square stance)
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

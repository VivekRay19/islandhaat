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
      // -------------------------------------------------------------
      // Walking Locomotion State (Grounded) - Relaxed & Natural Cadence
      // -------------------------------------------------------------
      // Stride frequency directly proportional to ground velocity (stride rate set to a calm 3.8)
      const strideRate = (currentGroundSpeed / this.speed) * 3.8;
      this.walkCyclePhase += dt * strideRate;
      const phi = this.walkCyclePhase;
      const w = this.walkWeight;

      // Leg stride swing: relaxed, gentle 0.28 rad amplitude (~16 deg)
      const legAmplitude = 0.28 * w;
      parts.leftLeg.rotation.x = Math.sin(phi) * legAmplitude;
      parts.rightLeg.rotation.x = -Math.sin(phi) * legAmplitude;
      parts.leftLeg.rotation.y = 0;
      parts.rightLeg.rotation.y = 0;
      parts.leftLeg.rotation.z = 0;
      parts.rightLeg.rotation.z = 0;

      // Natural gentle opposing arm swing: relaxed 0.20 rad amplitude (~11.5 deg)
      const armAmplitude = 0.20 * w;
      parts.leftArm.rotation.x = -Math.sin(phi) * armAmplitude;
      parts.rightArm.rotation.x = Math.sin(phi) * armAmplitude;
      parts.leftArm.rotation.y = 0;
      parts.rightArm.rotation.y = 0;
      parts.leftArm.rotation.z = 0;
      parts.rightArm.rotation.z = 0;

      // Stable Torso: firmly anchored at waist pivot, imperceptible 0.015 forward lean
      parts.torsoGroup.position.set(0, 0.22, 0);
      parts.torsoGroup.rotation.set(0.015 * w, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0); // Head remains steady and level
    } else {
      // -------------------------------------------------------------
      // Completely Settled Stable Idle State (ZERO Jiggle, Feet Planted)
      // -------------------------------------------------------------
      // Root torso strictly fixed at neutral position
      parts.torsoGroup.position.set(0, 0.22, 0);
      parts.torsoGroup.rotation.set(0, 0, 0);

      // Return limbs cleanly to neutral rest pose with zero residual motion
      parts.leftLeg.rotation.set(0, 0, 0);
      parts.rightLeg.rotation.set(0, 0, 0);
      parts.leftArm.rotation.set(0, 0, 0);
      parts.rightArm.rotation.set(0, 0, 0);
      parts.headGroup.rotation.set(0, 0, 0);
    }

    // -----------------------------------------------------------------
    // Dog Quadruped Locomotion & Settled Idle (Relaxed Natural Rhythm)
    // -----------------------------------------------------------------
    const targetDogWeight = (dogSpeed > 0.08) ? clamp(dogSpeed / this.speed, 0.2, 1.0) : 0.0;
    this.dogWalkWeight = damp(this.dogWalkWeight, targetDogWeight, 14, dt);
    if (this.dogWalkWeight < 0.01) {
      this.dogWalkWeight = 0;
    }

    if (this.dogWalkWeight > 0.01) {
      // Calmer quadruped trot phase rate scaled to 4.5
      this.dogWalkPhase += dt * (dogSpeed / this.speed) * 4.5;
      const dPhi = this.dogWalkPhase;
      const dw = this.dogWalkWeight;

      // Quadruped diagonal trot pairs with gentle 0.24 rad amplitude (~13.7 deg)
      const trotAmp = 0.24 * dw;
      this.dogLegs[0].rotation.x = Math.sin(dPhi) * trotAmp;          // Front Left
      this.dogLegs[1].rotation.x = -Math.sin(dPhi) * trotAmp;         // Front Right
      this.dogLegs[2].rotation.x = -Math.sin(dPhi) * trotAmp;         // Hind Left
      this.dogLegs[3].rotation.x = Math.sin(dPhi) * trotAmp;          // Hind Right

      // Gentle tail wagging while trotting
      this.dogTail.rotation.z = Math.sin(dPhi * 1.5) * 0.20 * dw;
    } else {
      // Dog fully settles: feet planted, body resting
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

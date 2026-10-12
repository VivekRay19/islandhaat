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

    // 4 Articulated Little Rounded Paws / Legs
    const legOffsets = [
      { x: -0.055, z: 0.065 }, { x: 0.055, z: 0.065 },
      { x: -0.055, z: -0.065 }, { x: 0.055, z: -0.065 }
    ];
    legOffsets.forEach((lo) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.10, 8), dogWhite);
      leg.position.set(lo.x, 0.05, lo.z);
      leg.castShadow = true;
      this.dogMesh.add(leg);
      this.dogLegs.push(leg);
    });

    this.dogMesh.scale.set(0.9, 0.9, 0.9);
    this.dogMesh.visible = false; // Hidden in Build Mode initially
    scene.add(this.dogMesh);
  }

  public setPosition(x: number, z: number, terrain: TerrainField): void {
    this.position.x = x;
    this.position.z = z;
    this.position.y = terrain.getHeight(x, z);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);

    this.dogPos.set(x - 0.4, this.position.y, z + 0.3);
    this.dogMesh.position.copy(this.dogPos);
  }

  public update(dt: number, cameraAngle: number, terrain: TerrainField): void {
    // 1. World Movement Relative to Camera
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.inputVector.lengthSq() > 0.01) {
      const forward = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle));
      const right = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle));

      moveDir.addScaledVector(right, this.inputVector.x);
      moveDir.addScaledVector(forward, this.inputVector.y);
      moveDir.normalize();

      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.rotationY = dampAngle(this.rotationY, targetAngle, 14, dt);
    }

    // 2. Velocity with Acceleration & Deceleration
    const targetVelX = moveDir.x * this.speed;
    const targetVelZ = moveDir.z * this.speed;
    this.velocity.x = damp(this.velocity.x, targetVelX, 12, dt);
    this.velocity.z = damp(this.velocity.z, targetVelZ, 12, dt);

    // Compute true horizontal ground speed
    const groundSpeed = Math.hypot(this.velocity.x, this.velocity.z);
    this.isMoving = groundSpeed > 0.15;

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
    let justLanded = false;
    if (this.position.y <= groundY) {
      if (!this.isGrounded && this.velocity.y < -1.0) {
        justLanded = true;
      }
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
    this.dogPos.lerp(dogTarget, dt * 7.5);
    this.dogPos.y = terrain.getHeight(this.dogPos.x, this.dogPos.z);
    this.dogMesh.position.copy(this.dogPos);

    const dogDist = Math.hypot(this.position.x - this.dogPos.x, this.position.z - this.dogPos.z);
    const dogDir = new THREE.Vector3().subVectors(this.position, this.dogPos);
    if (dogDir.lengthSq() > 0.01) {
      this.dogRotationY = Math.atan2(dogDir.x, dogDir.z);
      this.dogMesh.rotation.y = this.dogRotationY;
    }

    // 6. Natural Articulated Locomotion & Animation Gait
    const parts = this.specialist;

    if (!this.isGrounded) {
      // Jump / Fall Pose (Dynamic based on vertical velocity)
      const jumpRatio = clamp(this.velocity.y / this.jumpForce, -1, 1);
      parts.torsoGroup.position.y = 0.24 + (jumpRatio > 0 ? 0.03 : -0.01);
      parts.torsoGroup.rotation.x = jumpRatio * -0.15;
      parts.leftLeg.rotation.x = 0.35 + jumpRatio * 0.1;
      parts.rightLeg.rotation.x = -0.25 - jumpRatio * 0.1;
      parts.leftArm.rotation.x = -0.6 - jumpRatio * 0.2;
      parts.rightArm.rotation.x = -0.4 - jumpRatio * 0.2;
      parts.headGroup.rotation.x = 0.1 - jumpRatio * 0.15;

      // Puppy airborne pose
      this.dogTail.rotation.z = Math.sin(this.animTimer * 6) * 0.4;
    } else if (this.isMoving) {
      // Natural Walk Cycle tied strictly to ground speed (Zero foot sliding!)
      const strideFreq = (groundSpeed / this.speed) * 11.5;
      this.animTimer += dt * Math.max(strideFreq, 2.0);
      const walkCycle = this.animTimer;

      // Leg stride swing scaled by speed ratio
      const speedRatio = clamp(groundSpeed / this.speed, 0.2, 1.0);
      const legSwing = Math.sin(walkCycle) * 0.65 * speedRatio;
      parts.leftLeg.rotation.x = legSwing;
      parts.rightLeg.rotation.x = -legSwing;

      // Arm counter-swing
      const armSwing = Math.sin(walkCycle) * 0.55 * speedRatio;
      parts.leftArm.rotation.x = -armSwing;
      parts.rightArm.rotation.x = armSwing;

      // Subtle hip & torso bounce/sway
      parts.torsoGroup.position.y = 0.22 + Math.abs(Math.sin(walkCycle * 2)) * 0.035 * speedRatio;
      parts.torsoGroup.rotation.z = Math.sin(walkCycle) * 0.05 * speedRatio;
      parts.torsoGroup.rotation.x = 0.08 * speedRatio;
      parts.headGroup.rotation.x = -0.04 * speedRatio;

      // Companion Dog Trot (Proportional to follow distance & speed)
      const dogLegSpeed = Math.max(strideFreq * 1.1, 4.0);
      for (let i = 0; i < 4; i++) {
        const phase = (i === 0 || i === 3) ? 0 : Math.PI;
        const dSwing = Math.sin(walkCycle * 1.2 + phase) * 0.6 * speedRatio;
        this.dogLegs[i].rotation.x = dSwing;
      }
      this.dogTail.rotation.z = Math.sin(walkCycle * 3) * 0.6;
    } else {
      // Idle Breathing & Neutral Stance
      this.animTimer += dt * 2.8;
      const breath = Math.sin(this.animTimer) * 0.012;

      parts.torsoGroup.position.y = 0.22 + breath;
      parts.torsoGroup.rotation.x = damp(parts.torsoGroup.rotation.x, 0, 8, dt);
      parts.torsoGroup.rotation.z = damp(parts.torsoGroup.rotation.z, 0, 8, dt);
      parts.headGroup.rotation.x = -breath * 1.5;

      // Damped return of limbs to neutral
      parts.leftLeg.rotation.x = damp(parts.leftLeg.rotation.x, 0, 12, dt);
      parts.rightLeg.rotation.x = damp(parts.rightLeg.rotation.x, 0, 12, dt);
      parts.leftArm.rotation.x = damp(parts.leftArm.rotation.x, 0, 12, dt);
      parts.rightArm.rotation.x = damp(parts.rightArm.rotation.x, 0, 12, dt);

      for (let i = 0; i < 4; i++) {
        this.dogLegs[i].rotation.x = damp(this.dogLegs[i].rotation.x, 0, 10, dt);
      }
      this.dogTail.rotation.z = Math.sin(this.animTimer * 2) * 0.3;
    }
  }

  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
    this.dogMesh.visible = visible;
  }
}

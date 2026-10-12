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
    // 2. COMPANION PUPPY / DOG
    // =========================================================================
    this.dogMesh = new THREE.Group();
    const dogWhite = new THREE.MeshStandardMaterial({ color: 0xfefefe, roughness: 0.8 });
    const dogBrown = new THREE.MeshStandardMaterial({ color: 0x9a5a32, roughness: 0.8 });
    const dogNose = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });

    // Body
    this.dogBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.22), dogWhite);
    this.dogBody.position.y = 0.12;
    this.dogBody.castShadow = true;
    this.dogMesh.add(this.dogBody);

    // Patch on back
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.10), dogBrown);
    patch.position.set(0.02, 0.06, 0.02);
    this.dogBody.add(patch);

    // Head
    this.dogHead = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), dogWhite);
    this.dogHead.position.set(0, 0.20, 0.12);
    this.dogHead.castShadow = true;
    this.dogMesh.add(this.dogHead);

    // Floppy Brown Ears
    this.dogEars = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.08), dogBrown);
    this.dogEars.position.set(0, 0.04, -0.02);
    this.dogHead.add(this.dogEars);

    // Snout & Nose
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.08), dogWhite);
    snout.position.set(0, -0.02, 0.08);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), dogNose);
    nose.position.set(0, 0.02, 0.05);
    snout.add(nose);
    this.dogHead.add(snout);

    // Tail
    this.dogTail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.12, 4), dogBrown);
    this.dogTail.position.set(0, 0.16, -0.12);
    this.dogTail.rotation.x = -Math.PI / 4;
    this.dogMesh.add(this.dogTail);

    // 4 Little Legs with Pivot Joints
    const legOffsets = [
      { x: -0.05, z: 0.07 }, { x: 0.05, z: 0.07 },
      { x: -0.05, z: -0.07 }, { x: 0.05, z: -0.07 }
    ];
    legOffsets.forEach((lo) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.09, 0.04), dogWhite);
      leg.position.set(lo.x, 0.045, lo.z);
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
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    // 2. Velocity with Acceleration & Deceleration
    const targetVelX = moveDir.x * this.speed;
    const targetVelZ = moveDir.z * this.speed;
    this.velocity.x = damp(this.velocity.x, targetVelX, 12, dt);
    this.velocity.z = damp(this.velocity.z, targetVelZ, 12, dt);

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
    const dogTarget = new THREE.Vector3(
      this.position.x - Math.sin(this.rotationY + 0.6) * 0.45,
      this.position.y,
      this.position.z - Math.cos(this.rotationY + 0.6) * 0.45
    );
    this.dogPos.lerp(dogTarget, dt * 6);
    this.dogPos.y = terrain.getHeight(this.dogPos.x, this.dogPos.z);
    this.dogMesh.position.copy(this.dogPos);

    const dogDir = new THREE.Vector3().subVectors(this.position, this.dogPos);
    if (dogDir.lengthSq() > 0.01) {
      this.dogRotationY = Math.atan2(dogDir.x, dogDir.z);
      this.dogMesh.rotation.y = this.dogRotationY;
    }

    // 6. Natural Articulated Locomotion & Animation Gait
    const parts = this.specialist;

    if (!this.isGrounded) {
      // Jump / Fall Pose
      parts.torsoGroup.position.y = 0.26;
      parts.torsoGroup.rotation.x = -0.12;
      parts.leftLeg.rotation.x = 0.35;
      parts.rightLeg.rotation.x = -0.25;
      parts.leftArm.rotation.x = -0.6;
      parts.rightArm.rotation.x = -0.4;
      parts.headGroup.rotation.x = 0.1;
    } else if (this.isMoving) {
      // Natural Walk Cycle
      this.animTimer += dt * 11.5;
      const walkCycle = this.animTimer;

      // Leg stride swing
      const legSwing = Math.sin(walkCycle) * 0.65;
      parts.leftLeg.rotation.x = legSwing;
      parts.rightLeg.rotation.x = -legSwing;

      // Arm counter-swing
      const armSwing = Math.sin(walkCycle) * 0.55;
      parts.leftArm.rotation.x = -armSwing;
      parts.rightArm.rotation.x = armSwing;

      // Subtle hip & torso bounce/sway
      parts.torsoGroup.position.y = 0.22 + Math.abs(Math.sin(walkCycle * 2)) * 0.035;
      parts.torsoGroup.rotation.z = Math.sin(walkCycle) * 0.05;
      parts.torsoGroup.rotation.x = 0.08;
      parts.headGroup.rotation.x = -0.04;

      // Companion Dog Trot
      for (let i = 0; i < 4; i++) {
        const dSwing = Math.sin(walkCycle * 1.2 + (i % 2 === 0 ? 0 : Math.PI)) * 0.6;
        this.dogLegs[i].rotation.x = dSwing;
      }
      this.dogTail.rotation.z = Math.sin(walkCycle * 2) * 0.5;
    } else {
      // Idle Breathing & Neutral Stance
      this.animTimer += dt * 2.8;
      const breath = Math.sin(this.animTimer) * 0.012;

      parts.torsoGroup.position.y = 0.22 + breath;
      parts.torsoGroup.rotation.x = 0;
      parts.torsoGroup.rotation.z = 0;
      parts.headGroup.rotation.x = -breath * 1.5;

      // Damped return of limbs to neutral
      parts.leftLeg.rotation.x = damp(parts.leftLeg.rotation.x, 0, 10, dt);
      parts.rightLeg.rotation.x = damp(parts.rightLeg.rotation.x, 0, 10, dt);
      parts.leftArm.rotation.x = damp(parts.leftArm.rotation.x, 0, 10, dt);
      parts.rightArm.rotation.x = damp(parts.rightArm.rotation.x, 0, 10, dt);

      for (let i = 0; i < 4; i++) {
        this.dogLegs[i].rotation.x = 0;
      }
      this.dogTail.rotation.z = Math.sin(this.animTimer * 1.5) * 0.25;
    }
  }

  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
    this.dogMesh.visible = visible;
  }
}

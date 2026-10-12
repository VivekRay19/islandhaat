import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { TerrainField } from '../hex/TerrainField';
import { clamp, damp, dampAngle, lerp } from '../core/math';
import { IndianState } from '../culture/CultureTypes';
import { CulturalSpecialistRigBuilder, SpecialistJointRig } from '../graphics/CulturalSpecialistRigBuilder';

export interface DogQuadrupedRig {
  root: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  ears: THREE.Mesh;
  tail: THREE.Group;
  frontLeftHip: THREE.Group;
  frontLeftKnee: THREE.Group;
  frontRightHip: THREE.Group;
  frontRightKnee: THREE.Group;
  hindLeftHip: THREE.Group;
  hindLeftKnee: THREE.Group;
  hindRightHip: THREE.Group;
  hindRightKnee: THREE.Group;
}

export class CharacterController {
  public mesh: THREE.Group;
  public dogMesh: THREE.Group;
  public culture: IndianState;
  private specialistRig: SpecialistJointRig;
  private dogRig!: DogQuadrupedRig;

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
    // 1. ADVANCED MULTI-JOINT ARTICULATED SPECIALIST CHARACTER
    // =========================================================================
    this.mesh = new THREE.Group();

    // Dedicated Culture Specialist Model with True Anatomical Joint Rig
    this.specialistRig = CulturalSpecialistRigBuilder.createRig(culture);
    this.mesh.add(this.specialistRig.root);
    this.mesh.visible = false; // Hidden in Build Mode initially
    scene.add(this.mesh);

    // =========================================================================
    // 2. ADVANCED QUADRUPED DOG RIG (Multi-Joint Paws, Knees & Tail)
    // =========================================================================
    this.dogMesh = new THREE.Group();
    const dogWhite = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.65 });
    const dogBrown = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
    const dogNose = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3 });
    const dogCollar = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 });

    // Rounded Body (Smooth Capsule/Cylinder geometry)
    const dogBody = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), dogWhite);
    dogBody.rotation.x = Math.PI / 2;
    dogBody.position.y = 0.13;
    dogBody.castShadow = true;
    this.dogMesh.add(dogBody);

    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), dogBrown);
    patch.scale.set(0.9, 0.6, 1.1);
    patch.position.set(0.03, 0.04, 0.01);
    dogBody.add(patch);

    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.015, 6, 16), dogCollar);
    collar.position.set(0, 0.08, 0);
    dogBody.add(collar);

    // Rounded Head
    const dogHead = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), dogWhite);
    dogHead.position.set(0, 0.21, 0.12);
    dogHead.castShadow = true;
    this.dogMesh.add(dogHead);

    // Floppy Drooping Ears
    const leftEar = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), dogBrown);
    leftEar.position.set(-0.07, 0.03, -0.01);
    leftEar.rotation.z = 0.35;
    leftEar.rotation.x = 0.2;
    dogHead.add(leftEar);

    const rightEar = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.05, 4, 8), dogBrown);
    rightEar.position.set(0.07, 0.03, -0.01);
    rightEar.rotation.z = -0.35;
    rightEar.rotation.x = 0.2;
    dogHead.add(rightEar);

    // Snout & Button Nose
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.06, 8), dogWhite);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, -0.02, 0.08);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), dogNose);
    nose.position.set(0, 0.03, 0.02);
    snout.add(nose);
    dogHead.add(snout);

    // Multi-Segment Tail Hierarchy
    const dogTail = new THREE.Group();
    dogTail.position.set(0, 0.17, -0.11);
    this.dogMesh.add(dogTail);

    const tailBase = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.020, 0.07, 8), dogBrown);
    tailBase.position.set(0, 0.03, -0.02);
    tailBase.rotation.x = -Math.PI / 4;
    dogTail.add(tailBase);

    const tailTip = new THREE.Mesh(new THREE.CylinderGeometry(0.010, 0.016, 0.07, 8), dogWhite);
    tailTip.position.set(0, 0.07, -0.05);
    tailTip.rotation.x = -Math.PI / 3.5;
    dogTail.add(tailTip);

    // 4 Quadruped Legs with 2-Joint Articulation (Hip -> Thigh -> Knee -> Shin / Paw)
    const createQuadLeg = (x: number, z: number) => {
      const hip = new THREE.Group();
      hip.position.set(x, 0.10, z);
      this.dogMesh.add(hip);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.06, 8), dogWhite);
      thigh.position.set(0, -0.03, 0);
      thigh.castShadow = true;
      hip.add(thigh);

      const knee = new THREE.Group();
      knee.position.set(0, -0.06, 0);
      hip.add(knee);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.020, 0.05, 8), dogWhite);
      shin.position.set(0, -0.025, 0.005);
      shin.castShadow = true;
      knee.add(shin);

      return { hip, knee };
    };

    const fl = createQuadLeg(-0.055, 0.065);
    const fr = createQuadLeg(0.055, 0.065);
    const hl = createQuadLeg(-0.055, -0.065);
    const hr = createQuadLeg(0.055, -0.065);

    this.dogRig = {
      root: this.dogMesh,
      body: dogBody,
      head: dogHead,
      ears: leftEar,
      tail: dogTail,
      frontLeftHip: fl.hip,
      frontLeftKnee: fl.knee,
      frontRightHip: fr.hip,
      frontRightKnee: fr.knee,
      hindLeftHip: hl.hip,
      hindLeftKnee: hl.knee,
      hindRightHip: hr.hip,
      hindRightKnee: hr.knee
    };

    this.dogMesh.scale.set(0.9, 0.9, 0.9);
    this.dogMesh.visible = false;
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
    // 6. MULTI-JOINT KINEMATICS ANIMATION (Layered Articulation & Settled Idle)
    // =========================================================================
    const rig = this.specialistRig;
    const dog = this.dogRig;

    // Smoothly blend walk weight: 1.0 when moving, 0.0 when stopped (200ms transition)
    const targetWalkWeight = (this.isGrounded && this.isMoving) ? clamp(currentGroundSpeed / this.speed, 0.2, 1.0) : 0.0;
    this.walkWeight = damp(this.walkWeight, targetWalkWeight, 14, dt);
    if (this.walkWeight < 0.01) {
      this.walkWeight = 0;
    }

    if (!this.isGrounded) {
      // -------------------------------------------------------------
      // Airborne Jump & Fall Articulation
      // -------------------------------------------------------------
      const jumpRatio = clamp(this.velocity.y / this.jumpForce, -1, 1);
      
      rig.pelvis.position.set(0, 0.22, 0);
      rig.pelvis.rotation.set(jumpRatio * -0.10, 0, 0);
      rig.spineUpper.rotation.set(-jumpRatio * 0.08, 0, 0);
      rig.head.rotation.set(0.08 - jumpRatio * 0.10, 0, 0);

      // Legs tuck and extend
      rig.leftThigh.rotation.set(0.35 + jumpRatio * 0.12, 0, 0);
      rig.leftKnee.rotation.set(0.40 - jumpRatio * 0.20, 0, 0); // knee bends during apex
      rig.leftAnkle.rotation.set(0.15, 0, 0);

      rig.rightThigh.rotation.set(-0.20 - jumpRatio * 0.10, 0, 0);
      rig.rightKnee.rotation.set(0.25, 0, 0);
      rig.rightAnkle.rotation.set(-0.10, 0, 0);

      // Arms reach dynamically
      rig.leftUpperArm.rotation.set(-0.45 - jumpRatio * 0.25, 0, -0.15);
      rig.leftElbow.rotation.set(-0.30, 0, 0);
      rig.rightUpperArm.rotation.set(-0.35 - jumpRatio * 0.20, 0, 0.15);
      rig.rightElbow.rotation.set(-0.25, 0, 0);

      // Dog airborne pose
      dog.tail.rotation.z = 0;
      dog.frontLeftHip.rotation.x = damp(dog.frontLeftHip.rotation.x, 0.2, 12, dt);
      dog.frontRightHip.rotation.x = damp(dog.frontRightHip.rotation.x, 0.2, 12, dt);
      dog.hindLeftHip.rotation.x = damp(dog.hindLeftHip.rotation.x, -0.2, 12, dt);
      dog.hindRightHip.rotation.x = damp(dog.hindRightHip.rotation.x, -0.2, 12, dt);
      dog.frontLeftKnee.rotation.x = 0;
      dog.frontRightKnee.rotation.x = 0;
      dog.hindLeftKnee.rotation.x = 0;
      dog.hindRightKnee.rotation.x = 0;
    } else if (this.walkWeight > 0.01) {
      // -------------------------------------------------------------
      // Layered Multi-Joint Locomotion Gait (Fluid Humanoid Kinematics)
      // -------------------------------------------------------------
      const cadence = (currentGroundSpeed / this.speed) * 4.6;
      this.walkCyclePhase += dt * cadence;
      const phi = this.walkCyclePhase;
      const w = this.walkWeight;

      const sinGait = Math.sin(phi);
      const cosGait = Math.cos(phi);

      // 1. Lower Body: Thigh swing, Knee flex on swing phase, Ankle toe-off
      // Thigh forward/back angle
      rig.leftThigh.rotation.x = sinGait * 0.35 * w;
      rig.rightThigh.rotation.x = -sinGait * 0.35 * w;

      // Realistic Knee Flexion: Knee only flexes backwards (rotation.x > 0) when leg is swinging forward
      const leftKneeFlex = Math.max(0, sinGait) * 0.45 * w;
      const rightKneeFlex = Math.max(0, -sinGait) * 0.45 * w;
      rig.leftKnee.rotation.x = leftKneeFlex;
      rig.rightKnee.rotation.x = rightKneeFlex;

      // Ankle ground alignment: flexes slightly up during forward step, pushes back at toe-off
      rig.leftAnkle.rotation.x = -sinGait * 0.18 * w;
      rig.rightAnkle.rotation.x = sinGait * 0.18 * w;

      // Lateral weight shift onto supporting hip
      const hipShift = Math.sin(phi) * 0.010 * w;
      rig.pelvis.position.x = hipShift;
      rig.pelvis.position.y = 0.22 - Math.abs(sinGait) * 0.012 * w; // gentle step compression

      // Pelvic counter-rotation around vertical Y
      rig.pelvis.rotation.y = -sinGait * 0.035 * w;
      rig.pelvis.rotation.z = -hipShift * 1.2;
      rig.pelvis.rotation.x = 0.015 * w; // gentle forward lean

      // 2. Spine & Chest Counter-Twist
      rig.spineLower.rotation.y = sinGait * 0.02 * w;
      rig.chest.rotation.y = sinGait * 0.03 * w;

      // 3. Clavicles, Shoulders, Elbows & Wrists
      // Opposing arm swing with elbow flex during backward push and forward bend
      rig.leftUpperArm.rotation.x = -sinGait * 0.26 * w;
      rig.rightUpperArm.rotation.x = sinGait * 0.26 * w;

      rig.leftUpperArm.rotation.z = -0.08 - Math.abs(cosGait) * 0.02 * w;
      rig.rightUpperArm.rotation.z = 0.08 + Math.abs(cosGait) * 0.02 * w;

      // Natural Elbow flex (forearm stays slightly bent forward: -0.15 to -0.35 rad)
      rig.leftElbow.rotation.x = (-0.18 + Math.max(0, -sinGait) * 0.25) * w;
      rig.rightElbow.rotation.x = (-0.18 + Math.max(0, sinGait) * 0.25) * w;

      // Wrist relaxation
      rig.leftWrist.rotation.x = sinGait * 0.10 * w;
      rig.rightWrist.rotation.x = -sinGait * 0.10 * w;

      // 4. Stabilized Head Gaze
      rig.head.rotation.y = sinGait * 0.025 * w;
      rig.head.rotation.x = -0.01 * w;
      rig.head.rotation.z = hipShift * 0.7;
    } else {
      // -------------------------------------------------------------
      // Completely Settled Stable Neutral Pose (Zero Jiggle, Zero Drift)
      // -------------------------------------------------------------
      rig.pelvis.position.set(0, 0.22, 0);
      rig.pelvis.rotation.set(0, 0, 0);
      rig.spineLower.rotation.set(0, 0, 0);
      rig.spineUpper.rotation.set(0, 0, 0);
      rig.chest.rotation.set(0, 0, 0);
      rig.neck.rotation.set(0, 0, 0);
      rig.head.rotation.set(0, 0, 0);

      // Arms rest gently at sides
      rig.leftUpperArm.rotation.set(0, 0, -0.08);
      rig.leftElbow.rotation.set(-0.10, 0, 0);
      rig.leftWrist.rotation.set(0, 0, 0);

      rig.rightUpperArm.rotation.set(0, 0, 0.08);
      rig.rightElbow.rotation.set(-0.10, 0, 0);
      rig.rightWrist.rotation.set(0, 0, 0);

      // Legs stand straight and planted
      rig.leftThigh.rotation.set(0, 0, 0);
      rig.leftKnee.rotation.set(0, 0, 0);
      rig.leftAnkle.rotation.set(0, 0, 0);

      rig.rightThigh.rotation.set(0, 0, 0);
      rig.rightKnee.rotation.set(0, 0, 0);
      rig.rightAnkle.rotation.set(0, 0, 0);
    }

    // -----------------------------------------------------------------
    // Dog Quadruped 2-Joint Locomotion & Settled Idle
    // -----------------------------------------------------------------
    const targetDogWeight = (dogSpeed > 0.08) ? clamp(dogSpeed / this.speed, 0.2, 1.0) : 0.0;
    this.dogWalkWeight = damp(this.dogWalkWeight, targetDogWeight, 14, dt);
    if (this.dogWalkWeight < 0.01) {
      this.dogWalkWeight = 0;
    }

    if (this.dogWalkWeight > 0.01) {
      this.dogWalkPhase += dt * (dogSpeed / this.speed) * 5.4;
      const dPhi = this.dogWalkPhase;
      const dw = this.dogWalkWeight;

      // Diagonal trot pairs with true hip swing + knee flexion
      const trotAmp = 0.28 * dw;
      dog.frontLeftHip.rotation.x = Math.sin(dPhi) * trotAmp;
      dog.frontLeftKnee.rotation.x = Math.max(0, Math.sin(dPhi)) * 0.25 * dw;

      dog.frontRightHip.rotation.x = -Math.sin(dPhi) * trotAmp;
      dog.frontRightKnee.rotation.x = Math.max(0, -Math.sin(dPhi)) * 0.25 * dw;

      dog.hindLeftHip.rotation.x = -Math.sin(dPhi) * trotAmp;
      dog.hindLeftKnee.rotation.x = Math.max(0, -Math.sin(dPhi)) * 0.25 * dw;

      dog.hindRightHip.rotation.x = Math.sin(dPhi) * trotAmp;
      dog.hindRightKnee.rotation.x = Math.max(0, Math.sin(dPhi)) * 0.25 * dw;

      // Puppy body bob & gentle tail wag
      dog.body.position.y = 0.13 + Math.abs(Math.sin(dPhi)) * 0.007 * dw;
      dog.tail.rotation.z = Math.sin(dPhi * 2.0) * 0.24 * dw;
    } else {
      // Dog fully settles on all 4 planted paws
      dog.body.position.y = 0.13;
      dog.frontLeftHip.rotation.set(0, 0, 0);
      dog.frontLeftKnee.rotation.set(0, 0, 0);
      dog.frontRightHip.rotation.set(0, 0, 0);
      dog.frontRightKnee.rotation.set(0, 0, 0);
      dog.hindLeftHip.rotation.set(0, 0, 0);
      dog.hindLeftKnee.rotation.set(0, 0, 0);
      dog.hindRightHip.rotation.set(0, 0, 0);
      dog.hindRightKnee.rotation.set(0, 0, 0);
      dog.tail.rotation.z = 0;
    }
  }

  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
    this.dogMesh.visible = visible;
  }
}

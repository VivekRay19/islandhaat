import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { TerrainField } from '../hex/TerrainField';
import { clamp, damp, dampAngle, lerp, wrapAngle } from '../core/math';

export class CharacterController {
  public mesh: THREE.Group;
  private head: THREE.Mesh;
  private body: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;

  public position: THREE.Vector3 = new THREE.Vector3(0, 0.35, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationY: number = 0;

  public isGrounded: boolean = true;
  public isMoving: boolean = false;

  private speed: number = 3.2;
  private gravity: number = 14.0;
  private jumpForce: number = 4.8;
  private animTimer: number = 0;

  // Input states
  public inputVector: THREE.Vector2 = new THREE.Vector2(0, 0);
  public jumpRequested: boolean = false;

  private mats = Materials.get();

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Group();

    // Stylized low-poly character model
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0a880 });
    const clothesMat = new THREE.MeshLambertMaterial({ color: 0xcc4433 }); // Red/terracotta tunic
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x546e7a }); // Slate pants
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x3e2723 }); // Brown hair

    // Torso / Tunic
    this.body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.12), clothesMat);
    this.body.position.y = 0.22;
    this.body.castShadow = true;
    this.mesh.add(this.body);

    // Head
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), skinMat);
    this.head.position.y = 0.4;
    this.head.castShadow = true;
    this.mesh.add(this.head);

    // Hair cap
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.07, 0.15), hairMat);
    hair.position.set(0, 0.04, -0.01);
    this.head.add(hair);

    // Arms
    this.leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), skinMat);
    this.leftArm.position.set(-0.12, 0.22, 0);
    this.leftArm.castShadow = true;
    this.mesh.add(this.leftArm);

    this.rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), skinMat);
    this.rightArm.position.set(0.12, 0.22, 0);
    this.rightArm.castShadow = true;
    this.mesh.add(this.rightArm);

    // Legs
    this.leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.07), pantsMat);
    this.leftLeg.position.set(-0.05, 0.08, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.07), pantsMat);
    this.rightLeg.position.set(0.05, 0.08, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    this.mesh.scale.set(0.9, 0.9, 0.9);
    scene.add(this.mesh);
  }

  public setPosition(x: number, z: number, terrain: TerrainField): void {
    this.position.x = x;
    this.position.z = z;
    this.position.y = terrain.getHeight(x, z);
    this.velocity.set(0, 0, 0);
    this.mesh.position.copy(this.position);
  }

  public update(dt: number, cameraAngle: number, terrain: TerrainField): void {
    // 1. Calculate world movement vector relative to camera heading
    const moveDir = new THREE.Vector3(0, 0, 0);
    if (this.inputVector.lengthSq() > 0.01) {
      const forward = new THREE.Vector3(-Math.sin(cameraAngle), 0, -Math.cos(cameraAngle));
      const right = new THREE.Vector3(Math.cos(cameraAngle), 0, -Math.sin(cameraAngle));

      moveDir.addScaledVector(right, this.inputVector.x);
      moveDir.addScaledVector(forward, this.inputVector.y);
      moveDir.normalize();

      // Smooth rotate character towards movement direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      this.rotationY = dampAngle(this.rotationY, targetAngle, 14, dt);
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    // 2. Horizontal velocity with acceleration/damping
    const targetVelX = moveDir.x * this.speed;
    const targetVelZ = moveDir.z * this.speed;
    this.velocity.x = damp(this.velocity.x, targetVelX, 10, dt);
    this.velocity.z = damp(this.velocity.z, targetVelZ, 10, dt);

    // 3. Jump and Gravity
    if (this.isGrounded && this.jumpRequested) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.jumpRequested = false;
    }

    this.velocity.y -= this.gravity * dt;

    // 4. Position integration and island collision
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

    // Ground clamping
    const groundY = terrain.getHeight(this.position.x, this.position.z);
    if (this.position.y <= groundY) {
      this.position.y = groundY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Update 3D Mesh
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;

    // 5. Procedural Character Animation
    this.animTimer += dt * (this.isMoving ? 12 : 2.5);

    if (!this.isGrounded) {
      // Jump pose
      this.leftLeg.rotation.x = -0.6;
      this.rightLeg.rotation.x = -0.4;
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -1.2;
      this.body.position.y = 0.24;
    } else if (this.isMoving) {
      // Walk / Run cycle
      const legSwing = Math.sin(this.animTimer) * 0.7;
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;

      this.leftArm.rotation.x = -legSwing * 0.8;
      this.rightArm.rotation.x = legSwing * 0.8;

      // Bobbing
      this.body.position.y = 0.22 + Math.abs(Math.cos(this.animTimer)) * 0.03;
      this.head.position.y = 0.4 + Math.abs(Math.cos(this.animTimer)) * 0.02;
    } else {
      // Idle breathing
      const breath = Math.sin(this.animTimer) * 0.01;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = breath * 2;
      this.rightArm.rotation.x = -breath * 2;
      this.body.position.y = 0.22 + breath;
      this.head.position.y = 0.4 + breath * 1.5;
    }
  }

  public setVisible(visible: boolean): void {
    this.mesh.visible = visible;
  }
}

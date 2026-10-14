import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { CameraController } from '../camera/CameraController';
import { CharacterController } from '../character/CharacterController';
import { WorldDestinationId } from './WorldMapSystem';

export class BoatTravelSystem {
  private scene: THREE.Scene;
  public dockedBoatMesh: THREE.Group;
  public travellingBoatMesh: THREE.Group;
  public isTravelling: boolean = false;

  private currentDockPos: THREE.Vector3 = new THREE.Vector3(0.85, 0.04, 2.3);
  private currentDockRotY: number = 0;
  private promptEl!: HTMLElement;
  private voyageBannerEl!: HTMLElement;

  // Wake effect rings
  private wakeGroup: THREE.Group;
  private wakeRings: THREE.Mesh[] = [];

  // Interaction callback
  public onOpenSailingMap?: () => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Build docked boat
    this.dockedBoatMesh = this.createBoatMesh();
    this.dockedBoatMesh.position.copy(this.currentDockPos);
    this.scene.add(this.dockedBoatMesh);

    // 2. Build travelling boat (used during the voyage)
    this.travellingBoatMesh = this.createBoatMesh();
    this.travellingBoatMesh.visible = false;
    this.scene.add(this.travellingBoatMesh);

    // 3. Build water wake ripples
    this.wakeGroup = new THREE.Group();
    this.wakeGroup.visible = false;
    this.buildWakeRings();
    this.scene.add(this.wakeGroup);

    // 4. Create UI Prompts & Banners
    this.createUIElements();
    this.setupKeyboardListener();
  }

  public setDockForLocation(location: WorldDestinationId): void {
    if (location === 'central_haat') {
      // Central Haat arrival pier is at (0, 2)
      this.currentDockPos.set(0.0, 0.04, 3.4);
      this.currentDockRotY = Math.PI;
    } else {
      // Cultural island dock near coastal tile (0, 1)
      this.currentDockPos.set(0.85, 0.04, 2.3);
      this.currentDockRotY = Math.PI * 0.15;
    }

    this.dockedBoatMesh.position.copy(this.currentDockPos);
    this.dockedBoatMesh.rotation.y = this.currentDockRotY;
    this.dockedBoatMesh.visible = !this.isTravelling;
  }

  public getDockPosition(): THREE.Vector3 {
    return this.currentDockPos.clone();
  }

  public getDockedBoatMesh(): THREE.Group {
    return this.dockedBoatMesh;
  }

  private createBoatMesh(): THREE.Group {
    const group = new THREE.Group();
    const mats = Materials.get();

    // Wooden hull (carved boat body)
    const hullGeo = new THREE.BoxGeometry(0.72, 0.24, 1.45);
    const hull = new THREE.Mesh(hullGeo, mats.darkWood);
    hull.position.y = 0.09;
    hull.castShadow = true;
    hull.receiveShadow = true;
    group.add(hull);

    // Pointed bow
    const bowGeo = new THREE.ConeGeometry(0.36, 0.58, 4);
    const bow = new THREE.Mesh(bowGeo, mats.wood);
    bow.position.set(0, 0.09, 1.0);
    bow.rotation.x = Math.PI / 2;
    bow.castShadow = true;
    group.add(bow);

    // Seating bench
    const benchGeo = new THREE.BoxGeometry(0.58, 0.06, 0.24);
    const bench = new THREE.Mesh(benchGeo, mats.woodPlanks);
    bench.position.set(0, 0.17, -0.1);
    group.add(bench);

    // Traditional woven canopy awning
    const awningGeo = new THREE.BoxGeometry(0.62, 0.03, 0.74);
    const awning = new THREE.Mesh(awningGeo, mats.thatch);
    awning.position.set(0, 0.5, -0.05);
    awning.castShadow = true;
    group.add(awning);

    // Awning support posts
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.42, 4);
    const p1 = new THREE.Mesh(postGeo, mats.wood);
    p1.position.set(-0.28, 0.3, 0.28);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, mats.wood);
    p2.position.set(0.28, 0.3, 0.28);
    group.add(p2);

    const p3 = new THREE.Mesh(postGeo, mats.wood);
    p3.position.set(-0.28, 0.3, -0.38);
    group.add(p3);

    const p4 = new THREE.Mesh(postGeo, mats.wood);
    p4.position.set(0.28, 0.3, -0.38);
    group.add(p4);

    // Brass travel lantern on bow
    const lanternGeo = new THREE.BoxGeometry(0.09, 0.12, 0.09);
    const lantern = new THREE.Mesh(lanternGeo, mats.lanternGlow);
    lantern.position.set(0, 0.24, 1.2);
    group.add(lantern);

    // Two oars resting on side
    const oarGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.9, 4);
    const oarL = new THREE.Mesh(oarGeo, mats.wood);
    oarL.position.set(-0.4, 0.18, 0);
    oarL.rotation.set(0.2, 0, 0.3);
    group.add(oarL);

    const oarR = new THREE.Mesh(oarGeo, mats.wood);
    oarR.position.set(0.4, 0.18, 0);
    oarR.rotation.set(0.2, 0, -0.3);
    group.add(oarR);

    return group;
  }

  private buildWakeRings(): void {
    const mats = Materials.get();
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.RingGeometry(0.2 + i * 0.15, 0.32 + i * 0.18, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5 - i * 0.1,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.015;
      this.wakeGroup.add(ring);
      this.wakeRings.push(ring);
    }
  }

  private createUIElements(): void {
    // 1. Proximity prompt
    this.promptEl = document.createElement('div');
    this.promptEl.id = 'boat-interact-prompt';
    this.promptEl.style.cssText = `
      position: fixed;
      bottom: 120px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(245, 158, 11, 0.7);
      border-radius: 24px;
      padding: 10px 22px;
      color: #fff;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 800;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(245, 158, 11, 0.3);
      pointer-events: auto;
      cursor: pointer;
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 90;
    `;
    this.promptEl.innerHTML = `
      <span style="font-size:18px;">⛵</span>
      <span>Set Sail</span>
      <span style="background:rgba(245, 158, 11, 0.25); color:#fef08a; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800; letter-spacing:0.5px;">[E] / CLICK</span>
    `;
    this.promptEl.onclick = () => {
      this.triggerInteraction();
    };
    document.body.appendChild(this.promptEl);

    // 2. Cinematic voyage banner
    this.voyageBannerEl = document.createElement('div');
    this.voyageBannerEl.id = 'boat-voyage-banner';
    this.voyageBannerEl.style.cssText = `
      position: fixed;
      top: 36px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(56, 189, 248, 0.6);
      border-radius: 20px;
      padding: 12px 28px;
      color: #fff;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      text-align: center;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(56, 189, 248, 0.3);
      pointer-events: none;
      opacity: 0;
      transition: all 0.4s ease;
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    document.body.appendChild(this.voyageBannerEl);
  }

  private setupKeyboardListener(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E') {
        if (this.isPromptVisible() && !this.isTravelling) {
          this.triggerInteraction();
        }
      }
    });
  }

  private isPromptVisible(): boolean {
    return parseFloat(this.promptEl.style.opacity || '0') > 0.5;
  }

  private triggerInteraction(): void {
    if (this.isTravelling) return;
    this.onOpenSailingMap?.();
  }

  /**
   * Called every frame to animate the docked boat and proximity prompt.
   */
  public update(dt: number, playerPos: THREE.Vector3, isExploreMode: boolean): void {
    const time = performance.now() * 0.001;

    // 1. Idle water bobbing for docked boat
    if (!this.isTravelling) {
      this.dockedBoatMesh.position.y = this.currentDockPos.y + Math.sin(time * 2.2) * 0.018;
      this.dockedBoatMesh.rotation.z = Math.sin(time * 1.6) * 0.025;
      this.dockedBoatMesh.rotation.x = Math.sin(time * 1.8) * 0.015;

      // 2. Proximity check to player
      if (isExploreMode) {
        const dist = playerPos.distanceTo(this.currentDockPos);
        if (dist < 2.8) {
          this.showPrompt();
        } else {
          this.hidePrompt();
        }
      } else {
        this.hidePrompt();
      }
    } else {
      this.hidePrompt();
    }
  }

  private showPrompt(): void {
    this.promptEl.style.opacity = '1';
    this.promptEl.style.transform = 'translateX(-50%) translateY(0)';
  }

  private hidePrompt(): void {
    this.promptEl.style.opacity = '0';
    this.promptEl.style.transform = 'translateX(-50%) translateY(20px)';
  }

  /**
   * Executes the full cinematic 3D sailing animation.
   */
  public executeTravelVoyage(
    destinationId: WorldDestinationId,
    destinationName: string,
    cameraCtrl: CameraController,
    character: CharacterController,
    onDestinationReady: () => void,
    onComplete: () => void
  ): void {
    if (this.isTravelling) return;
    this.isTravelling = true;
    this.hidePrompt();

    // 1. Hide docked boat and show travelling boat
    this.dockedBoatMesh.visible = false;
    this.travellingBoatMesh.visible = true;
    this.wakeGroup.visible = true;

    // 2. Determine departure and arrival points
    const startPos = this.currentDockPos.clone();
    let destPos = new THREE.Vector3(0.85, 0.04, 2.3);
    if (destinationId === 'central_haat') {
      destPos = new THREE.Vector3(0.0, 0.04, 3.4);
    }

    // Midpoint out in deep ocean waters
    const midPos = new THREE.Vector3(
      (startPos.x + destPos.x) * 0.5 + 4.5,
      0.04,
      (startPos.z + destPos.z) * 0.5 + 6.0
    );

    // Construct 3D sailing curve
    const curve = new THREE.CatmullRomCurve3([
      startPos,
      new THREE.Vector3(startPos.x + 1.2, 0.04, startPos.z + 2.5),
      midPos,
      new THREE.Vector3(destPos.x + 1.2, 0.04, destPos.z + 2.5),
      destPos
    ]);

    // Position player on boat
    character.inputVector.set(0, 0);
    character.isMoving = false;
    character.mesh.position.set(startPos.x, startPos.y + 0.12, startPos.z);
    character.rotationY = Math.atan2(midPos.x - startPos.x, midPos.z - startPos.z);

    // Show voyage HUD banner
    this.voyageBannerEl.innerHTML = `
      <span style="font-size:22px; animation: boatBob 1.5s infinite ease-in-out;">⛵</span>
      <div style="text-align:left;">
        <div style="font-size:11px; font-weight:800; color:#38bdf8; letter-spacing:1px; text-transform:uppercase;">Voyage in Progress</div>
        <div style="font-size:16px; font-weight:900; color:#fef08a;">Sailing to ${destinationName}...</div>
      </div>
    `;
    this.voyageBannerEl.style.opacity = '1';
    this.voyageBannerEl.style.transform = 'translateX(-50%) translateY(0)';

    // Camera initial framing
    const camOffset = new THREE.Vector3(-2.8, 1.8, -3.2);
    cameraCtrl.setCinematicTarget(startPos.clone().add(camOffset), startPos, true);

    const voyageDuration = 4.0; // 4.0 seconds satisfying smooth journey
    const startTime = performance.now();
    let midpointTriggered = false;

    const animateVoyage = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      const progress = Math.min(1.0, elapsed / voyageDuration);

      // Smooth ease-in-out progress curve
      const t = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Sample curve position & forward tangent
      const pos = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();

      // Boat transform
      this.travellingBoatMesh.position.copy(pos);
      const targetYaw = Math.atan2(tangent.x, tangent.z);
      this.travellingBoatMesh.rotation.y = targetYaw;

      // Ocean wave roll & pitch
      const waveRoll = Math.sin(progress * 18) * 0.04;
      const wavePitch = Math.sin(progress * 14) * 0.025;
      this.travellingBoatMesh.rotation.z = waveRoll;
      this.travellingBoatMesh.rotation.x = wavePitch;

      // Character passenger positioning
      character.mesh.position.set(pos.x, pos.y + 0.12, pos.z);
      character.rotationY = targetYaw;

      // Animate wake ripples trailing behind
      const wakeOffset = tangent.clone().multiplyScalar(-0.9);
      this.wakeGroup.position.copy(pos).add(wakeOffset);
      this.wakeRings.forEach((ring, idx) => {
        const ringScale = 1.0 + Math.sin(elapsed * 6 + idx) * 0.2;
        ring.scale.set(ringScale, ringScale, 1);
      });

      // Smooth cinematic camera tracking
      const dynamicCamPos = pos.clone().add(new THREE.Vector3(
        -Math.sin(targetYaw - 0.4) * 3.6,
        1.7 + Math.sin(elapsed * 2) * 0.1,
        -Math.cos(targetYaw - 0.4) * 3.6
      ));
      const lookTarget = pos.clone().add(tangent.clone().multiplyScalar(1.5));
      cameraCtrl.setCinematicTarget(dynamicCamPos, lookTarget, false);

      // Midpoint trigger: swap destination tiles & farms
      if (progress >= 0.5 && !midpointTriggered) {
        midpointTriggered = true;
        onDestinationReady();
        this.setDockForLocation(destinationId);
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateVoyage);
      } else {
        // Arrival Phase
        this.travellingBoatMesh.visible = false;
        this.wakeGroup.visible = false;
        this.dockedBoatMesh.visible = true;

        // Position character safely on the dock pier
        character.setPosition(destPos.x, destPos.z + 0.4, null as any);
        character.position.set(destPos.x, 0.28, destPos.z + 0.4);

        // Transition camera back to player explore mode
        cameraCtrl.switchToExplore(character);

        // Hide voyage banner
        this.voyageBannerEl.style.opacity = '0';
        this.voyageBannerEl.style.transform = 'translateX(-50%) translateY(-20px)';

        this.isTravelling = false;
        onComplete();
      }
    };

    requestAnimationFrame(animateVoyage);
  }

  public destroy(): void {
    this.promptEl.remove();
    this.voyageBannerEl.remove();
  }
}

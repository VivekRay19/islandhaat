import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { CameraController } from '../camera/CameraController';
import { CharacterController } from '../character/CharacterController';
import { WorldDestinationId } from './WorldMapSystem';
import { TerrainField, DockArea } from '../hex/TerrainField';

export class BoatTravelSystem {
  private scene: THREE.Scene;
  public dockMesh: THREE.Group;
  public dockedBoatMesh: THREE.Group;
  public travellingBoatMesh: THREE.Group;
  public isTravelling: boolean = false;

  private currentDockPos: THREE.Vector3 = new THREE.Vector3(0.866, 0.0, 2.3);
  private currentBoatPos: THREE.Vector3 = new THREE.Vector3(1.85, 0.04, 2.45);
  private currentBoatRotY: number = 0;
  private currentDisembarkPos: THREE.Vector3 = new THREE.Vector3(0.866, 0.32, 2.4);

  private promptEl!: HTMLElement;
  private voyageBannerEl!: HTMLElement;

  // Wake effect rings
  private wakeGroup: THREE.Group;
  private wakeRings: THREE.Mesh[] = [];

  // Interaction callback
  public onOpenSailingMap?: () => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Build dedicated 3D wooden dock pier
    this.dockMesh = this.createDockMesh();
    this.dockMesh.position.copy(this.currentDockPos);
    this.scene.add(this.dockMesh);

    // 2. Build docked boat
    this.dockedBoatMesh = this.createBoatMesh();
    this.dockedBoatMesh.position.copy(this.currentBoatPos);
    this.dockedBoatMesh.rotation.y = this.currentBoatRotY;
    this.scene.add(this.dockedBoatMesh);

    // 3. Build travelling boat (used during the voyage)
    this.travellingBoatMesh = this.createBoatMesh();
    this.travellingBoatMesh.visible = false;
    this.scene.add(this.travellingBoatMesh);

    // 4. Build water wake ripples
    this.wakeGroup = new THREE.Group();
    this.wakeGroup.visible = false;
    this.buildWakeRings();
    this.scene.add(this.wakeGroup);

    // 5. Create UI Prompts & Banners
    this.createUIElements();
    this.setupKeyboardListener();
  }

  public getDockAreaForLocation(location: WorldDestinationId): DockArea {
    if (location === 'central_haat') {
      return {
        minX: 1.15,
        maxX: 2.30,
        minZ: 3.05,
        maxZ: 4.60,
        height: 0.32
      };
    } else {
      return {
        minX: 0.30,
        maxX: 1.45,
        minZ: 1.55,
        maxZ: 3.10,
        height: 0.32
      };
    }
  }

  public setDockForLocation(location: WorldDestinationId): void {
    if (location === 'central_haat') {
      // Central Haat pier extends from tile (0, 2) southward
      this.currentDockPos.set(1.732, 0.0, 3.8);
      this.currentBoatPos.set(2.70, 0.04, 3.85);
      this.currentBoatRotY = 0;
      this.currentDisembarkPos.set(1.732, 0.32, 3.8);
    } else {
      // Cultural island pier extends from coastal tile (0, 1) southward
      this.currentDockPos.set(0.866, 0.0, 2.3);
      this.currentBoatPos.set(1.85, 0.04, 2.45);
      this.currentBoatRotY = 0;
      this.currentDisembarkPos.set(0.866, 0.32, 2.4);
    }

    this.dockMesh.position.copy(this.currentDockPos);
    this.dockedBoatMesh.position.copy(this.currentBoatPos);
    this.dockedBoatMesh.rotation.y = this.currentBoatRotY;
    this.dockedBoatMesh.visible = !this.isTravelling;
  }

  public getDockPosition(): THREE.Vector3 {
    return this.currentDockPos.clone();
  }

  public getDockedBoatMesh(): THREE.Group {
    return this.dockedBoatMesh;
  }

  /**
   * Dedicated 3D Wooden Harbour Dock / Pier.
   * Features sturdy deck planks, underwater pilings, mooring bollards, and lantern post.
   */
  private createDockMesh(): THREE.Group {
    const group = new THREE.Group();
    const mats = Materials.get();

    // 1. Deck Planks (spans width 1.05m, length 1.55m, top surface at y = 0.32)
    const plankWidth = 1.05;
    const plankLength = 0.18;
    const plankThickness = 0.06;
    const numPlanks = 8;
    const spacing = 0.19;

    for (let i = 0; i < numPlanks; i++) {
      const plankGeo = new THREE.BoxGeometry(plankWidth, plankThickness, plankLength);
      const plank = new THREE.Mesh(plankGeo, mats.woodPlanks);
      const zOffset = (i - (numPlanks - 1) / 2) * spacing;
      plank.position.set(0, 0.29, zOffset);
      plank.castShadow = true;
      plank.receiveShadow = true;
      group.add(plank);
    }

    // 2. Longitudinal Sub-Frame Beams
    const beamGeo = new THREE.BoxGeometry(0.10, 0.12, 1.58);
    const beamL = new THREE.Mesh(beamGeo, mats.darkWood);
    beamL.position.set(-0.48, 0.20, 0);
    beamL.castShadow = true;
    group.add(beamL);

    const beamR = new THREE.Mesh(beamGeo, mats.darkWood);
    beamR.position.set(0.48, 0.20, 0);
    beamR.castShadow = true;
    group.add(beamR);

    // 3. Timber Pilings (driving deep into the sea)
    const pilingGeo = new THREE.CylinderGeometry(0.05, 0.055, 0.95, 6);
    const pilingPositions = [
      [-0.48, -0.15, -0.68],
      [0.48, -0.15, -0.68],
      [-0.48, -0.15, 0],
      [0.48, -0.15, 0],
      [-0.48, -0.15, 0.68],
      [0.48, -0.15, 0.68]
    ];

    pilingPositions.forEach(([px, py, pz]) => {
      const piling = new THREE.Mesh(pilingGeo, mats.darkWood);
      piling.position.set(px, py, pz);
      piling.castShadow = true;
      group.add(piling);
    });

    // 4. Seaward Mooring Bollards (where boat lines tie off)
    const bollardBaseGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.20, 6);
    const bollardCapGeo = new THREE.CylinderGeometry(0.06, 0.045, 0.05, 6);

    [[-0.48, 0.65], [0.48, 0.65]].forEach(([bx, bz]) => {
      const bBase = new THREE.Mesh(bollardBaseGeo, mats.darkWood);
      bBase.position.set(bx, 0.40, bz);
      bBase.castShadow = true;
      group.add(bBase);

      const bCap = new THREE.Mesh(bollardCapGeo, mats.wood);
      bCap.position.set(bx, 0.51, bz);
      group.add(bCap);
    });

    // 5. Dock Lantern Post (warm welcoming glow)
    const postGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.72, 6);
    const post = new THREE.Mesh(postGeo, mats.darkWood);
    post.position.set(0.48, 0.66, -0.68);
    post.castShadow = true;
    group.add(post);

    const armGeo = new THREE.BoxGeometry(0.14, 0.03, 0.03);
    const arm = new THREE.Mesh(armGeo, mats.darkWood);
    arm.position.set(0.42, 0.98, -0.68);
    group.add(arm);

    const lanternGeo = new THREE.BoxGeometry(0.08, 0.12, 0.08);
    const lantern = new THREE.Mesh(lanternGeo, mats.lanternGlow);
    lantern.position.set(0.36, 0.90, -0.68);
    group.add(lantern);

    return group;
  }

  /**
   * Redesigned Indian Haat Shikara Boat.
   * Large, stable hull (2.3m x 1.15m) with sunken passenger footwell deck at y = 0.08,
   * comfortable passenger bench, ornamental prow, and a high arched pavilion canopy
   * positioned at y = 1.08m with 32cm+ clear headroom for the player's head and turban.
   */
  private createBoatMesh(): THREE.Group {
    const group = new THREE.Group();
    const mats = Materials.get();

    // 1. Main Outer Hull (carved teak wood body)
    const hullGeo = new THREE.BoxGeometry(1.15, 0.32, 2.30);
    const hull = new THREE.Mesh(hullGeo, mats.darkWood);
    hull.position.y = 0.14;
    hull.castShadow = true;
    hull.receiveShadow = true;
    group.add(hull);

    // 2. Recessed Sunken Passenger Deck (footwell)
    const deckGeo = new THREE.BoxGeometry(0.96, 0.04, 1.65);
    const deck = new THREE.Mesh(deckGeo, mats.woodPlanks);
    deck.position.set(0, 0.08, -0.15);
    deck.receiveShadow = true;
    group.add(deck);

    // Gunwale Side Rails (flared rim)
    const railGeo = new THREE.BoxGeometry(0.08, 0.14, 1.80);
    const railL = new THREE.Mesh(railGeo, mats.wood);
    railL.position.set(-0.54, 0.34, -0.15);
    group.add(railL);

    const railR = new THREE.Mesh(railGeo, mats.wood);
    railR.position.set(0.54, 0.34, -0.15);
    group.add(railR);

    // 3. Pointed Prow / Bow (tapered forward nose)
    const bowGeo = new THREE.ConeGeometry(0.56, 0.85, 4);
    const bow = new THREE.Mesh(bowGeo, mats.darkWood);
    bow.position.set(0, 0.14, 1.55);
    bow.rotation.x = Math.PI / 2;
    bow.rotation.y = Math.PI / 4;
    bow.castShadow = true;
    group.add(bow);

    // Bow Brass Trim Ornament
    const bowFinialGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const bowFinial = new THREE.Mesh(bowFinialGeo, mats.lanternGlow);
    bowFinial.position.set(0, 0.32, 1.95);
    group.add(bowFinial);

    // 4. Rear Passenger Bench
    const benchGeo = new THREE.BoxGeometry(0.88, 0.12, 0.34);
    const bench = new THREE.Mesh(benchGeo, mats.wood);
    bench.position.set(0, 0.22, -0.75);
    bench.castShadow = true;
    group.add(bench);

    // 5. Awning Support Pillars (4 corner timber posts rising from deck to canopy)
    const postGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.98, 6);
    const pillarCoords = [
      [-0.46, 0.58, 0.45],
      [0.46, 0.58, 0.45],
      [-0.46, 0.58, -0.55],
      [0.46, 0.58, -0.55]
    ];

    pillarCoords.forEach(([px, py, pz]) => {
      const pillar = new THREE.Mesh(postGeo, mats.darkWood);
      pillar.position.set(px, py, pz);
      pillar.castShadow = true;
      group.add(pillar);
    });

    // 6. High Arched Pavilion Canopy Awning (Roof top at y = 1.08m)
    // Standing character height is ~0.70m, giving 32cm+ of clear headroom!
    const canopyRoofGeo = new THREE.BoxGeometry(1.08, 0.05, 1.25);
    const canopyRoof = new THREE.Mesh(canopyRoofGeo, mats.thatch);
    canopyRoof.position.set(0, 1.08, -0.05);
    canopyRoof.castShadow = true;
    group.add(canopyRoof);

    // Canopy Crown Peak (curved arch ridge)
    const peakGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.26, 6);
    const peak = new THREE.Mesh(peakGeo, mats.wood);
    peak.rotation.x = Math.PI / 2;
    peak.position.set(0, 1.13, -0.05);
    group.add(peak);

    // Saffron Gold Cloth Border Trim along canopy edges
    const trimGeo = new THREE.BoxGeometry(1.10, 0.08, 0.04);
    const trimF = new THREE.Mesh(trimGeo, mats.lanternGlow);
    trimF.position.set(0, 1.04, 0.57);
    group.add(trimF);

    const trimB = new THREE.Mesh(trimGeo, mats.lanternGlow);
    trimB.position.set(0, 1.04, -0.67);
    group.add(trimB);

    // 7. Brass Travel Lantern on Bow Post
    const lanternGeo = new THREE.BoxGeometry(0.10, 0.14, 0.10);
    const lantern = new THREE.Mesh(lanternGeo, mats.lanternGlow);
    lantern.position.set(0, 0.38, 1.65);
    group.add(lantern);

    // 8. Resting Ceremonial Oars
    const oarGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.30, 4);
    const oarL = new THREE.Mesh(oarGeo, mats.wood);
    oarL.position.set(-0.62, 0.30, 0);
    oarL.rotation.set(0.15, 0, 0.25);
    group.add(oarL);

    const oarR = new THREE.Mesh(oarGeo, mats.wood);
    oarR.position.set(0.62, 0.30, 0);
    oarR.rotation.set(0.15, 0, -0.25);
    group.add(oarR);

    return group;
  }

  private buildWakeRings(): void {
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.RingGeometry(0.3 + i * 0.2, 0.45 + i * 0.24, 16);
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
      this.dockedBoatMesh.position.y = this.currentBoatPos.y + Math.sin(time * 2.2) * 0.015;
      this.dockedBoatMesh.rotation.z = Math.sin(time * 1.6) * 0.02;
      this.dockedBoatMesh.rotation.x = Math.sin(time * 1.8) * 0.012;

      // 2. Proximity check to player on dock walkway or boat
      if (isExploreMode) {
        const distToDock = playerPos.distanceTo(this.currentDockPos);
        const distToBoat = playerPos.distanceTo(this.currentBoatPos);
        if (distToDock < 2.5 || distToBoat < 2.5) {
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
   * Handles disembarking safely onto the destination dock pier with authoritative terrain.
   */
  public executeTravelVoyage(
    destinationId: WorldDestinationId,
    destinationName: string,
    cameraCtrl: CameraController,
    character: CharacterController,
    getDestinationTerrain: () => TerrainField,
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
    const startPos = this.currentBoatPos.clone();
    let destBoatPos = new THREE.Vector3(1.85, 0.04, 2.45);
    let destDisembark = new THREE.Vector3(0.866, 0.32, 2.4);

    if (destinationId === 'central_haat') {
      destBoatPos = new THREE.Vector3(2.70, 0.04, 3.85);
      destDisembark = new THREE.Vector3(1.732, 0.32, 3.8);
    }

    // Midpoint out in deep ocean waters for cinematic arc
    const midPos = new THREE.Vector3(
      (startPos.x + destBoatPos.x) * 0.5 + 4.8,
      0.04,
      (startPos.z + destBoatPos.z) * 0.5 + 5.5
    );

    // Construct 3D sailing curve
    const curve = new THREE.CatmullRomCurve3([
      startPos,
      new THREE.Vector3(startPos.x + 1.2, 0.04, startPos.z + 2.2),
      midPos,
      new THREE.Vector3(destBoatPos.x + 1.2, 0.04, destBoatPos.z + 2.2),
      destBoatPos
    ]);

    // Position player safely inside the recessed passenger deck
    character.inputVector.set(0, 0);
    character.isMoving = false;
    character.mesh.position.set(startPos.x, startPos.y + 0.08, startPos.z);
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
    const camOffset = new THREE.Vector3(-3.2, 2.0, -3.4);
    cameraCtrl.setCinematicTarget(startPos.clone().add(camOffset), startPos, true);

    const voyageDuration = 4.0;
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
      const waveRoll = Math.sin(progress * 18) * 0.035;
      const wavePitch = Math.sin(progress * 14) * 0.02;
      this.travellingBoatMesh.rotation.z = waveRoll;
      this.travellingBoatMesh.rotation.x = wavePitch;

      // Passenger footwell positioning (character stands securely on sunken deck)
      character.mesh.position.set(pos.x, pos.y + 0.08, pos.z);
      character.rotationY = targetYaw;

      // Animate wake ripples trailing behind
      const wakeOffset = tangent.clone().multiplyScalar(-1.1);
      this.wakeGroup.position.copy(pos).add(wakeOffset);
      this.wakeRings.forEach((ring, idx) => {
        const ringScale = 1.0 + Math.sin(elapsed * 6 + idx) * 0.2;
        ring.scale.set(ringScale, ringScale, 1);
      });

      // Smooth cinematic camera tracking
      const dynamicCamPos = pos.clone().add(new THREE.Vector3(
        -Math.sin(targetYaw - 0.4) * 3.8,
        1.9 + Math.sin(elapsed * 2) * 0.1,
        -Math.cos(targetYaw - 0.4) * 3.8
      ));
      const lookTarget = pos.clone().add(tangent.clone().multiplyScalar(1.5));
      cameraCtrl.setCinematicTarget(dynamicCamPos, lookTarget, false);

      // Midpoint trigger: swap destination tiles & farms & update dock
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

        // Position character safely on the dock pier with authoritative destination terrain
        const destTerrain = getDestinationTerrain();
        destTerrain.setDockArea(this.getDockAreaForLocation(destinationId));

        character.setPosition(destDisembark.x, destDisembark.z, destTerrain);
        character.position.set(destDisembark.x, destDisembark.y, destDisembark.z);
        character.mesh.position.copy(character.position);
        character.setVisible(true);
        character.velocity.set(0, 0, 0);

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
    this.scene.remove(this.dockMesh);
    this.scene.remove(this.dockedBoatMesh);
    this.scene.remove(this.travellingBoatMesh);
    this.scene.remove(this.wakeGroup);
  }
}

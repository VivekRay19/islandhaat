import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { CameraController } from '../camera/CameraController';
import { CharacterController } from '../character/CharacterController';
import { WorldDestinationId } from './WorldMapSystem';

export class BoatTravelSystem {
  private scene: THREE.Scene;
  private boatMesh: THREE.Group;
  private isTravelling: boolean = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.boatMesh = this.createBoatMesh();
    this.boatMesh.visible = false;
    this.scene.add(this.boatMesh);
  }

  private createBoatMesh(): THREE.Group {
    const group = new THREE.Group();
    const mats = Materials.get();

    // Wooden hull (carved boat body)
    const hullGeo = new THREE.BoxGeometry(0.7, 0.22, 1.4);
    const hull = new THREE.Mesh(hullGeo, mats.darkWood);
    hull.position.y = 0.08;
    hull.castShadow = true;
    group.add(hull);

    // Pointed bow
    const bowGeo = new THREE.ConeGeometry(0.35, 0.55, 4);
    const bow = new THREE.Mesh(bowGeo, mats.wood);
    bow.position.set(0, 0.08, 0.95);
    bow.rotation.x = Math.PI / 2;
    bow.castShadow = true;
    group.add(bow);

    // Seating bench
    const benchGeo = new THREE.BoxGeometry(0.55, 0.06, 0.22);
    const bench = new THREE.Mesh(benchGeo, mats.woodPlanks);
    bench.position.set(0, 0.16, -0.1);
    group.add(bench);

    // Traditional woven canopy awning
    const awningGeo = new THREE.BoxGeometry(0.58, 0.03, 0.7);
    const awning = new THREE.Mesh(awningGeo, mats.thatch);
    awning.position.set(0, 0.48, -0.05);
    group.add(awning);

    // Awning support posts
    const postGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 4);
    const p1 = new THREE.Mesh(postGeo, mats.wood);
    p1.position.set(-0.26, 0.28, 0.25);
    group.add(p1);

    const p2 = new THREE.Mesh(postGeo, mats.wood);
    p2.position.set(0.26, 0.28, 0.25);
    group.add(p2);

    const p3 = new THREE.Mesh(postGeo, mats.wood);
    p3.position.set(-0.26, 0.28, -0.35);
    group.add(p3);

    const p4 = new THREE.Mesh(postGeo, mats.wood);
    p4.position.set(0.26, 0.28, -0.35);
    group.add(p4);

    // Brass travel lantern on bow
    const lanternGeo = new THREE.BoxGeometry(0.08, 0.1, 0.08);
    const lantern = new THREE.Mesh(lanternGeo, mats.lanternGlow);
    lantern.position.set(0, 0.22, 1.15);
    group.add(lantern);

    return group;
  }

  /**
   * Executes the 3D boat voyage sequence from departure pier to arrival pier.
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

    // Show full screen travel splash curtain
    const overlay = document.createElement('div');
    overlay.id = 'boat-travel-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(11, 21, 34, 0);
      z-index: 100000;
      pointer-events: all;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: background 0.6s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    overlay.innerHTML = `
      <div id="boat-travel-content" style="opacity: 0; transform: scale(0.9); transition: all 0.5s ease; text-align: center; color: #fff;">
        <div style="font-size: 48px; margin-bottom: 8px;">⛵</div>
        <div style="font-size: 22px; font-weight: 800; color: #fbbf24; letter-spacing: 1px;">Sailing the Indian Archipelago...</div>
        <div style="font-size: 14px; font-weight: 600; color: #94a3b8; margin-top: 4px;">Destination: ${destinationName}</div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Fade in curtain
    requestAnimationFrame(() => {
      overlay.style.background = 'rgba(11, 21, 34, 0.88)';
      const content = overlay.querySelector('#boat-travel-content') as HTMLElement;
      if (content) {
        content.style.opacity = '1';
        content.style.transform = 'scale(1)';
      }
    });

    // Midway: swap island tiles, reposition character
    setTimeout(() => {
      onDestinationReady();

      // Fade out curtain
      overlay.style.background = 'rgba(11, 21, 34, 0)';
      const content = overlay.querySelector('#boat-travel-content') as HTMLElement;
      if (content) {
        content.style.opacity = '0';
        content.style.transform = 'scale(1.05)';
      }

      setTimeout(() => {
        overlay.remove();
        this.isTravelling = false;
        onComplete();
      }, 600);
    }, 1100);
  }
}

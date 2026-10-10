import * as THREE from 'three';
import { IndianState } from './CultureTypes';
import { WorldState } from '../state/WorldState';
import { TileMeshBuilder } from '../graphics/TileMeshBuilder';
import { TILE_LIBRARY } from '../data/tileLibrary';
import { HEX_R, SQRT3 } from '../hex/Hex';

export class CultureComparisonViewer {
  private static modal: HTMLElement | null = null;

  /**
   * Opens the 6-state side-by-side visual comparison gallery
   */
  public static openComparisonGallery(): void {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      return;
    }

    const states: IndianState[] = [
      'bihar',
      'maharashtra',
      'west_bengal',
      'karnataka',
      'gujarat',
      'rajasthan'
    ];

    const stateTitles: Record<IndianState, string> = {
      bihar: '1. BIHAR — Mithila Village & Artisans',
      maharashtra: '2. MAHARASHTRA — Sahyadri Fort & Weaving',
      west_bengal: '3. WEST BENGAL — Terracotta & River Pandals',
      karnataka: '4. KARNATAKA — Granite Mandapas & Channapatna',
      gujarat: '5. GUJARAT — Textile Bazaar & Stepwell',
      rajasthan: '6. RAJASTHAN — Sandstone Haveli & Desert Oasis'
    };

    this.modal = document.createElement('div');
    this.modal.id = 'cultural-comparison-gallery-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(2, 6, 23, 0.94);
      backdrop-filter: blur(16px);
      z-index: 300;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      overflow-y: auto;
      box-sizing: border-box;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      color: #fff;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      width: 100%;
      max-width: 1200px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    `;

    header.innerHTML = `
      <div>
        <h1 style="font-size:24px; font-weight:900; color:#facc15; margin:0; letter-spacing:1px;">
          SIX INDIAN STATES — 3D VISUAL COMPARISON
        </h1>
        <p style="font-size:13px; color:#94a3b8; margin:4px 0 0;">
          Identical camera angle, viewport & lighting. Notice distinct building silhouettes, rooflines, terrain strata, tree models, and craft props.
        </p>
      </div>
      <button id="close-gallery-btn" style="
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 12px;
        color: #fff;
        font-weight: 800;
        padding: 8px 18px;
        cursor: pointer;
        font-size: 14px;
      ">✕ CLOSE</button>
    `;
    this.modal.appendChild(header);

    // 6-Panel Grid (3x2)
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      width: 100%;
      max-width: 1200px;
      box-sizing: border-box;
    `;
    this.modal.appendChild(grid);

    document.body.appendChild(this.modal);

    const closeBtn = this.modal.querySelector('#close-gallery-btn') as HTMLElement;
    closeBtn.onclick = () => {
      this.modal?.remove();
      this.modal = null;
    };

    // Render each state panel with identical Three.js camera & lighting
    states.forEach((st) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      `;

      const titleBar = document.createElement('div');
      titleBar.style.cssText = `
        padding: 10px 14px;
        background: rgba(30, 41, 59, 0.8);
        border-bottom: 1px solid rgba(255,255,255,0.1);
        font-size: 13px;
        font-weight: 800;
        color: #facc15;
      `;
      const titleRow = document.createElement('div');
      titleRow.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      `;

      const titleSpan = document.createElement('span');
      titleSpan.innerText = stateTitles[st];
      titleRow.appendChild(titleSpan);

      const dlBtn = document.createElement('button');
      dlBtn.style.cssText = `
        background: rgba(250, 204, 21, 0.15);
        border: 1px solid #facc15;
        border-radius: 6px;
        color: #facc15;
        font-size: 10px;
        font-weight: 700;
        padding: 3px 8px;
        cursor: pointer;
        transition: background 0.15s;
      `;
      dlBtn.innerText = '📥 SAVE PNG';
      dlBtn.onclick = () => {
        const canvas = canvasWrap.querySelector('canvas');
        if (canvas) {
          const a = document.createElement('a');
          a.download = `island_haat_${st}_world.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        }
      };
      titleRow.appendChild(dlBtn);
      titleBar.appendChild(titleRow);
      card.appendChild(titleBar);

      const canvasWrap = document.createElement('div');
      canvasWrap.style.cssText = `
        width: 100%;
        height: 240px;
        position: relative;
        background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
      `;
      card.appendChild(canvasWrap);
      grid.appendChild(card);

      // Render 3D Island Snapshot
      this.renderStateIslandSnapshot(canvasWrap, st);
    });
  }

  private static renderStateIslandSnapshot(container: HTMLElement, state: IndianState): void {
    const width = container.clientWidth || 380;
    const height = 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);

    // Standardized camera angle for honest, side-by-side comparison
    camera.position.set(0, 4.2, 5.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Identical lighting setup
    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfffaed, 2.2);
    sun.position.set(3, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    // Generate that state's distinctive world layout
    const worldState = new WorldState(state);
    const tiles = worldState.terrain.getAllTiles();

    for (const tile of tiles) {
      if (tile.defId === 'islet') continue; // keep focus on main cultural island
      const fullDef = TILE_LIBRARY[tile.defId];
      if (!fullDef) continue;

      const mesh = TileMeshBuilder.buildTileMesh(fullDef, tile.rotation, false, state);
      const cx = SQRT3 * HEX_R * (tile.q + tile.r / 2);
      const cz = 1.5 * HEX_R * tile.r;
      mesh.position.set(cx, 0, cz);
      scene.add(mesh);
    }

    // Render snapshot
    renderer.render(scene, camera);
  }
}

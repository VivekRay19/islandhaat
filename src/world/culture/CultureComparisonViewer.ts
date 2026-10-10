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

    // Tabs Bar
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
      width: 100%;
      max-width: 1200px;
    `;
    tabsContainer.innerHTML = `
      <button id="tab-six-states" style="
        background: #facc15;
        border: none;
        border-radius: 10px;
        color: #0f172a;
        font-weight: 800;
        padding: 8px 18px;
        cursor: pointer;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(250, 204, 21, 0.3);
      ">🏛️ SIX STATES COMPARISON (ALL 6)</button>
      <button id="tab-maharashtra" style="
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 10px;
        color: #fff;
        font-weight: 800;
        padding: 8px 18px;
        cursor: pointer;
        font-size: 13px;
      ">☀️ MAHARASHTRA: BRIGHTNESS & LIGHTING TEST (4 VIEWS)</button>
    `;
    this.modal.appendChild(tabsContainer);

    // Main Content Container
    const contentArea = document.createElement('div');
    contentArea.id = 'gallery-content-area';
    contentArea.style.cssText = `
      width: 100%;
      max-width: 1200px;
      box-sizing: border-box;
    `;
    this.modal.appendChild(contentArea);

    document.body.appendChild(this.modal);

    const closeBtn = this.modal.querySelector('#close-gallery-btn') as HTMLElement;
    closeBtn.onclick = () => {
      this.modal?.remove();
      this.modal = null;
    };

    const tabSix = this.modal.querySelector('#tab-six-states') as HTMLElement;
    const tabMaha = this.modal.querySelector('#tab-maharashtra') as HTMLElement;

    const showSixStates = () => {
      tabSix.style.background = '#facc15';
      tabSix.style.color = '#0f172a';
      tabMaha.style.background = 'rgba(255,255,255,0.1)';
      tabMaha.style.color = '#fff';
      this.renderSixStatesView(contentArea, states, stateTitles);
    };

    const showMaharashtra = () => {
      tabMaha.style.background = '#facc15';
      tabMaha.style.color = '#0f172a';
      tabSix.style.background = 'rgba(255,255,255,0.1)';
      tabSix.style.color = '#fff';
      this.renderMaharashtraLightingView(contentArea);
    };

    tabSix.onclick = showSixStates;
    tabMaha.onclick = showMaharashtra;

    // Initial render
    showSixStates();
  }

  private static renderSixStatesView(
    contentArea: HTMLElement,
    states: IndianState[],
    stateTitles: Record<IndianState, string>
  ): void {
    contentArea.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      width: 100%;
      box-sizing: border-box;
    `;
    contentArea.appendChild(grid);

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
      this.renderStateIslandSnapshot(canvasWrap, st, 'day');
    });
  }

  private static renderMaharashtraLightingView(contentArea: HTMLElement): void {
    contentArea.innerHTML = '';
    const mahaGrid = document.createElement('div');
    mahaGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      width: 100%;
      box-sizing: border-box;
    `;
    contentArea.appendChild(mahaGrid);

    const views = [
      {
        id: 'day',
        title: '☀️ 1. DAYTIME: SUNLIT SAHYADRI LANDSCAPE',
        desc: 'Warm stone (#A69B8A), fresh monsoon grass (#A5C982), terracotta roofs, bright streams.',
        time: 'day' as const
      },
      {
        id: 'sunset',
        title: '🌅 2. GOLDEN HOUR: SAHYADRI TWILIGHT',
        desc: 'Rich amber-gold sun highlighting Paithani peacock-teal & magenta drapery.',
        time: 'sunset' as const
      },
      {
        id: 'night',
        title: '🌙 3. NIGHT: FESTIVAL DIYAS & CANDLELIGHT',
        desc: 'Deep indigo night sky with glowing brass oil lamps, warm windows & campfires.',
        time: 'night' as const
      },
      {
        id: 'upgrade',
        title: '🏛️ 4. ARCHITECTURAL SHOWCASE: WADA & GATEWAY',
        desc: 'Full Wada Courtyard, Fort Gateway, Paithani Handloom, Warli Pavilion, Rock Cistern.',
        time: 'day' as const,
        showAllLandmarks: true
      }
    ];

    views.forEach(v => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(15, 23, 42, 0.9);
        border: 2px solid rgba(250, 204, 21, 0.25);
        border-radius: 18px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      `;

      const titleBar = document.createElement('div');
      titleBar.style.cssText = `
        padding: 12px 16px;
        background: rgba(30, 41, 59, 0.9);
        border-bottom: 1px solid rgba(255,255,255,0.1);
      `;
      titleBar.innerHTML = `
        <div style="font-size:14px; font-weight:800; color:#facc15;">${v.title}</div>
        <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${v.desc}</div>
      `;
      card.appendChild(titleBar);

      const canvasWrap = document.createElement('div');
      canvasWrap.style.cssText = `
        width: 100%;
        height: 280px;
        position: relative;
        background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
      `;
      card.appendChild(canvasWrap);
      mahaGrid.appendChild(card);

      this.renderStateIslandSnapshot(canvasWrap, 'maharashtra', v.time, v.showAllLandmarks);
    });
  }

  private static renderStateIslandSnapshot(
    container: HTMLElement,
    state: IndianState,
    timeOfDay: 'day' | 'sunset' | 'night' = 'day',
    showAllLandmarks = false
  ): void {
    const width = container.clientWidth || 380;
    const height = 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);

    camera.position.set(0, 4.2, 5.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = timeOfDay === 'night' ? 0.8 : 1.15;
    container.appendChild(renderer.domElement);

    // Adaptive lighting setup based on time of day
    if (timeOfDay === 'day') {
      const ambient = new THREE.AmbientLight(0xfffcf5, 1.25);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xfff5e6, 2.3);
      sun.position.set(3, 6, 4);
      sun.castShadow = true;
      sun.shadow.mapSize.width = 1024;
      sun.shadow.mapSize.height = 1024;
      scene.add(sun);
    } else if (timeOfDay === 'sunset') {
      const ambient = new THREE.AmbientLight(0xffa26b, 1.1);
      scene.add(ambient);

      const sun = new THREE.DirectionalLight(0xff7a33, 2.6);
      sun.position.set(5, 3, 2);
      sun.castShadow = true;
      scene.add(sun);
    } else {
      // Night
      const ambient = new THREE.AmbientLight(0x1e293b, 0.6);
      scene.add(ambient);

      const moon = new THREE.DirectionalLight(0x7dd3fc, 0.8);
      moon.position.set(-3, 5, -2);
      scene.add(moon);

      // Warm festival diya light point lights
      const diyaLight = new THREE.PointLight(0xf59e0b, 2.5, 6);
      diyaLight.position.set(0, 1.2, 0);
      scene.add(diyaLight);
    }

    // Generate world layout
    const worldState = new WorldState(state);

    if (showAllLandmarks && state === 'maharashtra') {
      // Inject all dedicated Maharashtra landmarks into the comparison view
      const demoKeys: { q: number; r: number; defId: string }[] = [
        { q: 0, r: 0, defId: 'maha_wada' },
        { q: 1, r: -1, defId: 'maha_gateway' },
        { q: -1, r: 0, defId: 'maha_paithani' },
        { q: 0, r: 1, defId: 'maha_warli' },
        { q: 1, r: 0, defId: 'maha_cistern' }
      ];
      demoKeys.forEach(dk => {
        const fullDef = TILE_LIBRARY[dk.defId];
        if (fullDef) {
          const mesh = TileMeshBuilder.buildTileMesh(fullDef, 0, false, state);
          const cx = SQRT3 * HEX_R * (dk.q + dk.r / 2);
          const cz = 1.5 * HEX_R * dk.r;
          mesh.position.set(cx, 0, cz);
          scene.add(mesh);
        }
      });
    } else {
      const tiles = worldState.terrain.getAllTiles();
      for (const tile of tiles) {
        if (tile.defId === 'islet') continue;
        const fullDef = TILE_LIBRARY[tile.defId];
        if (!fullDef) continue;

        const mesh = TileMeshBuilder.buildTileMesh(fullDef, tile.rotation, false, state);
        const cx = SQRT3 * HEX_R * (tile.q + tile.r / 2);
        const cz = 1.5 * HEX_R * tile.r;
        mesh.position.set(cx, 0, cz);
        scene.add(mesh);
      }
    }

    renderer.render(scene, camera);
  }
}

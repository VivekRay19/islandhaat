import * as THREE from 'three';
import { CultureProfile, IndianState } from './CultureTypes';
import { CULTURE_PROFILES } from './CultureRegistry';
import { IntroMusic } from '../audio/IntroMusic';
import { Materials } from '../graphics/Materials';
import { CulturalArchitectureBuilder } from '../graphics/CulturalArchitectureBuilder';
import { CulturalVegetationBuilder } from '../graphics/CulturalVegetationBuilder';
import { CulturalSpecialistBuilder } from '../graphics/CulturalSpecialistBuilder';
import { CulturalAssetDiagnostics } from './CulturalAssetDiagnostics';
import { CultureComparisonViewer } from './CultureComparisonViewer';

export class CultureSelectionScreen {
  private container: HTMLElement;
  private root: HTMLElement;
  private selectedState: IndianState = 'bihar';
  private music = IntroMusic.get();

  private onConfirmCallback?: (state: IndianState) => void;
  private onBackCallback?: () => void;

  // DOM elements
  private previewPanel!: HTMLElement;
  private textPanel!: HTMLElement;
  private specialistPanel!: HTMLElement;
  private canvasContainer!: HTMLElement;
  private confirmBtn!: HTMLElement;
  private cardsMap: Map<IndianState, HTMLElement> = new Map();
  private diagnosticModal: HTMLElement | null = null;

  // Mini 3D Preview Three.js scene
  private previewScene!: THREE.Scene;
  private previewCamera!: THREE.PerspectiveCamera;
  private previewRenderer!: THREE.WebGLRenderer;
  private previewDioramaGroup: THREE.Group = new THREE.Group();
  private animFrameId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    this.root = document.createElement('div');
    this.root.id = 'culture-selection-root';
    this.root.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100vw; height: 100vh;
      overflow-y: auto;
      overflow-x: hidden;
      background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0f172a 60%, #020617 100%);
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      color: #fff;
      user-select: none;
      z-index: 40;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px 48px;
      box-sizing: border-box;
    `;
    this.container.appendChild(this.root);

    this.buildHeader();
    this.buildCardsGrid();
    this.buildDetailPreview();
    this.init3DPreview();
    this.buildBottomActions();

    // Select Bihar by default
    this.selectState('bihar');
  }

  public setCallbacks(opts: {
    onConfirm: (state: IndianState) => void;
    onBack: () => void;
  }): void {
    this.onConfirmCallback = opts.onConfirm;
    this.onBackCallback = opts.onBack;
  }

  private buildHeader(): void {
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 20px;
      gap: 6px;
      position: relative;
      width: 100%;
      max-width: 1100px;
    `;

    const title = document.createElement('h1');
    title.style.cssText = `
      font-size: 30px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #facc15;
      text-shadow: 0 2px 14px rgba(250, 204, 21, 0.4);
      margin: 0;
    `;
    title.innerText = 'CHOOSE YOUR CULTURE';

    const subtitle = document.createElement('p');
    subtitle.style.cssText = `
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
      margin: 0;
      letter-spacing: 0.5px;
    `;
    subtitle.innerText = 'Six distinctive 3D worlds. Six architectural heritages. Six specialists.';

    // Button Group in header
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = `
      position: absolute;
      right: 0;
      top: 4px;
      display: flex;
      gap: 8px;
    `;

    const diagBtn = document.createElement('button');
    diagBtn.style.cssText = `
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid #38bdf8;
      border-radius: 12px;
      color: #38bdf8;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    `;
    diagBtn.innerText = '📊 ASSET DIAGNOSTICS';
    diagBtn.onclick = () => this.toggleDiagnosticModal();
    btnGroup.appendChild(diagBtn);

    const compareBtn = document.createElement('button');
    compareBtn.style.cssText = `
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid #facc15;
      border-radius: 12px;
      color: #facc15;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    `;
    compareBtn.innerText = '🖼 6-STATE COMPARISON (F3)';
    compareBtn.onclick = () => CultureComparisonViewer.openComparisonGallery();
    btnGroup.appendChild(compareBtn);

    header.appendChild(btnGroup);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'F3') {
        CultureComparisonViewer.openComparisonGallery();
      }
    });

    header.appendChild(title);
    header.appendChild(subtitle);
    this.root.appendChild(header);
  }

  private buildCardsGrid(): void {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 12px;
      width: 100%;
      max-width: 1160px;
      margin-bottom: 20px;
      box-sizing: border-box;
    `;

    const states: IndianState[] = ['bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan'];

    states.forEach((st) => {
      const profile = CULTURE_PROFILES[st];
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(12px);
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
      `;

      card.onmouseenter = () => {
        if (this.selectedState !== st) {
          card.style.transform = 'translateY(-4px)';
          card.style.borderColor = 'rgba(250, 204, 21, 0.5)';
        }
        this.music.playButtonHover();
      };
      card.onmouseleave = () => {
        if (this.selectedState !== st) {
          card.style.transform = 'translateY(0)';
          card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        }
      };
      card.onclick = () => {
        this.music.playButtonClick();
        this.selectState(st);
      };

      // Vector Icon / Emblem Header
      const iconWrap = document.createElement('div');
      iconWrap.style.cssText = `
        width: 48px; height: 48px;
        border-radius: 50%;
        background: rgba(255,255,255,0.06);
        border: 2px solid ${profile.palette.primary};
        display: flex; align-items: center; justify-content: center;
        padding: 4px;
        box-sizing: border-box;
      `;
      iconWrap.innerHTML = profile.specialist.iconSvg;
      card.appendChild(iconWrap);

      // State Name
      const name = document.createElement('div');
      name.style.cssText = `
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        text-align: center;
      `;
      name.innerText = profile.stateName;
      card.appendChild(name);

      // Specialist Name
      const specName = document.createElement('div');
      specName.style.cssText = `font-size: 11px; font-weight: 700; color: #facc15; text-align: center;`;
      specName.innerText = profile.specialist.name;
      card.appendChild(specName);

      // Advantage Badge
      const advantage = document.createElement('div');
      advantage.style.cssText = `
        font-size: 10px;
        font-weight: 700;
        color: #4ade80;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 8px;
        padding: 3px 6px;
        text-align: center;
        margin-top: 4px;
      `;
      advantage.innerText = `⚡ ${profile.specialist.abilityName}`;
      card.appendChild(advantage);

      this.cardsMap.set(st, card);
      grid.appendChild(card);
    });

    this.root.appendChild(grid);
  }

  private buildDetailPreview(): void {
    this.previewPanel = document.createElement('div');
    this.previewPanel.style.cssText = `
      width: 100%;
      max-width: 1160px;
      background: rgba(15, 23, 42, 0.92);
      border: 2px solid #facc15;
      border-radius: 24px;
      padding: 20px 24px;
      display: flex;
      gap: 24px;
      align-items: stretch;
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
      margin-bottom: 20px;
      box-sizing: border-box;
    `;

    // 1. Left Text Info
    this.textPanel = document.createElement('div');
    this.textPanel.style.cssText = `
      flex: 1.1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    this.previewPanel.appendChild(this.textPanel);

    // 2. Center Live 3D Miniature Environment Diorama
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.style.cssText = `
      width: 300px;
      height: 250px;
      background: radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(250, 204, 21, 0.4);
      border-radius: 18px;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 24px rgba(0,0,0,0.6);
    `;

    const badge3d = document.createElement('div');
    badge3d.style.cssText = `
      position: absolute;
      top: 8px; left: 8px;
      background: rgba(0,0,0,0.65);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      padding: 3px 8px;
      font-size: 10px;
      font-weight: 800;
      color: #facc15;
      letter-spacing: 0.5px;
      pointer-events: none;
      z-index: 2;
    `;
    badge3d.innerText = 'LIVE 3D DIORAMA';
    this.canvasContainer.appendChild(badge3d);

    this.previewPanel.appendChild(this.canvasContainer);

    // 3. Right Specialist Profile
    this.specialistPanel = document.createElement('div');
    this.specialistPanel.style.cssText = `
      width: 310px;
      background: rgba(0,0,0,0.3);
      border-radius: 18px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      box-sizing: border-box;
    `;
    this.previewPanel.appendChild(this.specialistPanel);

    this.root.appendChild(this.previewPanel);
  }

  private init3DPreview(): void {
    const width = 300;
    const height = 250;

    this.previewScene = new THREE.Scene();
    this.previewCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    this.previewCamera.position.set(0, 1.4, 2.3);
    this.previewCamera.lookAt(0, 0.15, 0);

    this.previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.previewRenderer.setSize(width, height);
    this.previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.previewRenderer.shadowMap.enabled = true;
    this.previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.canvasContainer.appendChild(this.previewRenderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.previewScene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xfffaed, 2.0);
    sun.position.set(2, 4, 3);
    sun.castShadow = true;
    this.previewScene.add(sun);

    this.previewScene.add(this.previewDioramaGroup);

    // Animation Loop
    const animate = () => {
      this.previewDioramaGroup.rotation.y += 0.008;
      this.previewRenderer.render(this.previewScene, this.previewCamera);
      this.animFrameId = requestAnimationFrame(animate);
    };
    animate();
  }

  private buildBottomActions(): void {
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 16px;
      align-items: center;
      margin-top: auto;
    `;

    // Back Button
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      color: #cbd5e1;
      font-size: 14px;
      font-weight: 700;
      padding: 12px 28px;
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
    `;
    backBtn.innerText = '← BACK TO MENU';
    backBtn.onmouseenter = () => {
      backBtn.style.background = 'rgba(255,255,255,0.18)';
      this.music.playButtonHover();
    };
    backBtn.onmouseleave = () => (backBtn.style.background = 'rgba(255,255,255,0.1)');
    backBtn.onclick = () => {
      this.music.playButtonClick();
      this.destroy();
      this.onBackCallback?.();
    };
    actions.appendChild(backBtn);

    // Confirm Button
    this.confirmBtn = document.createElement('button');
    this.confirmBtn.style.cssText = `
      background: linear-gradient(180deg, #facc15 0%, #f59e0b 50%, #d97706 100%);
      border: 2px solid #fef08a;
      border-radius: 20px;
      color: #3e1a00;
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 1px;
      padding: 12px 36px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.45);
      transition: transform 0.15s, box-shadow 0.15s;
    `;
    this.confirmBtn.innerText = 'CONFIRM CULTURE & START ISLAND ▶';
    this.confirmBtn.onmouseenter = () => {
      this.confirmBtn.style.transform = 'translateY(-2px) scale(1.03)';
      this.confirmBtn.style.boxShadow = '0 12px 32px rgba(245, 158, 11, 0.6)';
      this.music.playButtonHover();
    };
    this.confirmBtn.onmouseleave = () => {
      this.confirmBtn.style.transform = 'translateY(0) scale(1)';
      this.confirmBtn.style.boxShadow = '0 8px 24px rgba(245, 158, 11, 0.45)';
    };
    this.confirmBtn.onclick = () => {
      this.music.playButtonClick();
      this.destroy();
      this.onConfirmCallback?.(this.selectedState);
    };
    actions.appendChild(this.confirmBtn);

    this.root.appendChild(actions);
  }

  private selectState(state: IndianState): void {
    this.selectedState = state;
    const profile = CULTURE_PROFILES[state];

    // Highlight card
    this.cardsMap.forEach((card, st) => {
      if (st === state) {
        card.style.borderColor = '#facc15';
        card.style.transform = 'translateY(-6px) scale(1.02)';
        card.style.boxShadow = '0 16px 36px rgba(250, 204, 21, 0.35)';
      } else {
        card.style.borderColor = 'rgba(255, 255, 255, 0.12)';
        card.style.transform = 'translateY(0) scale(1)';
        card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      }
    });

    // Update Left Text Info
    this.textPanel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:baseline;">
        <h2 style="font-size:22px; font-weight:900; color:#facc15; margin:0;">${profile.displayName}</h2>
        <span style="font-size:12px; font-weight:700; color:#94a3b8;">${profile.regionTitle}</span>
      </div>
      <div style="font-size:13px; color:#cbd5e1; line-height:1.5;">${profile.overview}</div>
      
      <div style="display:flex; flex-direction:column; gap:6px; margin-top:4px;">
        <div style="background:rgba(255,255,255,0.06); padding:6px 12px; border-radius:10px; font-size:12px;">
          <b style="color:#fde047;">Signature Architecture:</b> ${profile.signatureStructures.join(', ')}
        </div>
        <div style="background:rgba(255,255,255,0.06); padding:6px 12px; border-radius:10px; font-size:12px;">
          <b style="color:#38bdf8;">Signature Crafts:</b> ${profile.signatureCrafts.join(', ')}
        </div>
        <div style="background:rgba(255,255,255,0.06); padding:6px 12px; border-radius:10px; font-size:12px;">
          <b style="color:#4ade80;">Starting Coins:</b> ${profile.startingResources.coins} 🪙
        </div>
      </div>
    `;

    // Update Right Specialist Profile
    this.specialistPanel.innerHTML = `
      <div style="font-size:10px; font-weight:800; color:#94a3b8; letter-spacing:0.5px;">YOUR SPECIALIST</div>
      <div style="font-size:15px; font-weight:800; color:#fff;">${profile.specialist.name}</div>
      <div style="font-size:11px; font-weight:700; color:#38bdf8;">Tool: ${profile.specialist.signatureTool}</div>
      <div style="font-size:11px; color:#cbd5e1; line-height:1.35;">${profile.specialist.biography}</div>
      
      <div style="margin-top:4px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.3); border-radius:10px; padding:8px;">
        <div style="font-size:11px; font-weight:800; color:#38bdf8;">⚡ ${profile.specialist.abilityName}</div>
        <div style="font-size:10px; color:#e2e8f0; margin-top:2px; line-height:1.3;">${profile.specialist.abilityDescription}</div>
      </div>
    `;

    // Update 3D Miniature Diorama
    this.update3DPreviewDiorama(state);
  }

  private update3DPreviewDiorama(state: IndianState): void {
    // Clear old diorama
    while (this.previewDioramaGroup.children.length > 0) {
      this.previewDioramaGroup.remove(this.previewDioramaGroup.children[0]);
    }

    const mats = Materials.get();

    // 1. Culture Hex Base
    const baseGeo = new THREE.CylinderGeometry(0.75, 0.70, 0.12, 6);
    const baseMesh = new THREE.Mesh(baseGeo, mats.getTerrainMaterial(state));
    baseMesh.position.y = -0.06;
    baseMesh.receiveShadow = true;
    this.previewDioramaGroup.add(baseMesh);

    const strataGeo = new THREE.CylinderGeometry(0.70, 0.62, 0.16, 6);
    const strataMesh = new THREE.Mesh(strataGeo, mats.getBaseStrataMaterial(state));
    strataMesh.position.y = -0.20;
    this.previewDioramaGroup.add(strataMesh);

    // 2. Culture House Architecture
    const house = CulturalArchitectureBuilder.createHouse(state);
    house.scale.set(0.68, 0.68, 0.68);
    house.position.set(-0.16, 0, -0.12);
    this.previewDioramaGroup.add(house);

    // 3. Culture Tree
    const tree = CulturalVegetationBuilder.createTree(state, 1);
    tree.scale.set(0.65, 0.65, 0.65);
    tree.position.set(0.28, 0, -0.20);
    this.previewDioramaGroup.add(tree);

    // 4. Specialist Character Model
    const specialist = CulturalSpecialistBuilder.createSpecialist(state);
    specialist.scale.set(0.62, 0.62, 0.62);
    specialist.position.set(0.18, 0, 0.22);
    specialist.rotation.y = -Math.PI / 4;
    this.previewDioramaGroup.add(specialist);

    // 5. Regional Landscape Prop
    const prop = CulturalVegetationBuilder.createLandscapeProp(state, 0);
    prop.scale.set(0.75, 0.75, 0.75);
    prop.position.set(-0.25, 0, 0.20);
    this.previewDioramaGroup.add(prop);
  }

  private toggleDiagnosticModal(): void {
    if (this.diagnosticModal) {
      this.diagnosticModal.remove();
      this.diagnosticModal = null;
      return;
    }

    const report = CulturalAssetDiagnostics.getReport(this.selectedState);

    this.diagnosticModal = document.createElement('div');
    this.diagnosticModal.style.cssText = `
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 620px;
      max-width: 90vw;
      background: #0f172a;
      border: 2px solid #38bdf8;
      border-radius: 16px;
      padding: 24px;
      z-index: 100;
      box-shadow: 0 24px 64px rgba(0,0,0,0.8);
      font-family: monospace;
      color: #38bdf8;
    `;

    this.diagnosticModal.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <span style="font-size:16px; font-weight:800; color:#facc15;">ASSET INSPECTION ENGINE</span>
        <button id="close-diag-btn" style="background:transparent; border:none; color:#cbd5e1; font-size:18px; cursor:pointer;">✕</button>
      </div>
      <pre style="white-space:pre-wrap; font-size:12px; line-height:1.45; background:rgba(0,0,0,0.5); padding:14px; border-radius:10px; max-height:400px; overflow-y:auto; margin:0;">${report}</pre>
    `;

    this.root.appendChild(this.diagnosticModal);

    const closeBtn = this.diagnosticModal.querySelector('#close-diag-btn') as HTMLElement;
    closeBtn.onclick = () => {
      this.diagnosticModal?.remove();
      this.diagnosticModal = null;
    };
  }

  public destroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.previewRenderer) {
      this.previewRenderer.dispose();
    }
    if (this.diagnosticModal) {
      this.diagnosticModal.remove();
      this.diagnosticModal = null;
    }
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
  }
}

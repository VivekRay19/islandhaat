import * as THREE from 'three';
import { WorldState } from './state/WorldState';
import { TerrainField, PlacedTile } from './hex/TerrainField';
import { TileMeshBuilder } from './graphics/TileMeshBuilder';
import { Materials } from './graphics/Materials';
import { WaterSystem } from './graphics/WaterSystem';
import { DayNightSystem } from './graphics/DayNightSystem';
import { CharacterController } from './character/CharacterController';
import { AnimationTuningPanel } from './character/AnimationTuningPanel';
import { CameraController } from './camera/CameraController';
import { InteractionSystem, InteractableTarget } from './interaction/InteractionSystem';
import { WorldAudio } from './audio/WorldAudio';
import { WorldUI } from './ui/WorldUI';
import { Tweens } from './core/Tweens';
import { HEX_R, SQRT3, parseKey, hexKey } from './hex/Hex';
import { EnvironmentModels } from './graphics/EnvironmentModels';
import { TILE_LIBRARY } from './data/tileLibrary';
import { IndianState } from './culture/CultureTypes';

export class IslandGame {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private cameraCtrl: CameraController;
  private tweens: Tweens = new Tweens();

  private state: WorldState;
  private materials: Materials;
  private water: WaterSystem;
  private dayNight: DayNightSystem;
  private character: CharacterController;
  private tuningPanel: AnimationTuningPanel;
  private interactions: InteractionSystem;
  private audio: WorldAudio;
  private ui: WorldUI;

  // Render objects
  private tileMeshes: Map<string, THREE.Group> = new Map();
  private slotMarkers: THREE.Group = new THREE.Group();
  private sharedSlotGeo: THREE.CylinderGeometry = new THREE.CylinderGeometry(HEX_R * 0.95, HEX_R * 0.95, 0.04, 6);
  private ghostMesh: THREE.Group | null = null;
  private hoveredSlot: { q: number; r: number } | null = null;

  // Chest object
  private chestGroup: THREE.Group | null = null;
  private chestLid: THREE.Mesh | null = null;
  private chestPos: THREE.Vector3 = new THREE.Vector3(0, 0.38, -4.5);

  // Raycasting & Throttling
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private isMouseDown: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  private hoverThrottleTime: number = 0;

  // Animation & Lifecycle
  private clock: THREE.Clock = new THREE.Clock();
  private isRunning: boolean = true;
  private animFrameId: number | null = null;
  private eventRemovers: (() => void)[] = [];
  private keys: Record<string, boolean> = {};

  constructor(container: HTMLElement, culture: IndianState = 'bihar', isContinue = false) {
    this.materials = Materials.get();
    this.audio = WorldAudio.get();
    if (isContinue) {
      this.state = WorldState.loadFromStorage() || new WorldState(culture);
    } else {
      this.state = new WorldState(culture);
    }
    this.interactions = new InteractionSystem();

    // 1. Setup Three.js Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x89c5f0, 0.025);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 2. Camera & Environment Systems
    this.cameraCtrl = new CameraController(window.innerWidth / window.innerHeight);
    this.water = new WaterSystem(this.scene);
    this.dayNight = new DayNightSystem(this.scene);
    this.character = new CharacterController(this.scene, this.state.selectedCulture);
    this.character.setPosition(0, 0, this.state.terrain);
    this.character.setVisible(false); // Character is only visible in Explore Mode

    this.tuningPanel = new AnimationTuningPanel(this.character);
    this.tuningPanel.setVisible(false); // Hidden during Build Mode initially

    this.scene.add(this.slotMarkers);

    // 3. UI
    this.ui = new WorldUI(this.state, this.dayNight);
    this.ui.setCallbacks({
      onTileSelect: (index) => {
        this.state.selectTile(index);
        this.audio.playTileRotate();
        this.updateGhost();
        this.ui.renderHand();
      },
      onRotate: () => {
        this.state.rotateCurrentTile();
        this.audio.playTileRotate();
        this.updateGhost();
      },
      onModeToggle: () => this.toggleGameMode()
    });

    // 4. Initial World Generation & Chest Setup
    this.rebuildAllTileMeshes();
    this.setupTreasureChest();
    this.updateAvailableSlotMarkers();
    this.ui.renderHand();

    // 5. Event Listeners
    this.bindEvents();

    // 6. Start Loop
    this.animate();
  }

  private setupTreasureChest(): void {
    // Ground chest accurately on the cultural islet tile
    const isletTile = this.state.terrain.getAllTiles().find(t => t.defId === 'islet');
    if (isletTile) {
      const cx = SQRT3 * HEX_R * (isletTile.q + isletTile.r / 2);
      const cz = 1.5 * HEX_R * isletTile.r;
      const cy = this.state.terrain.getHeight(cx, cz);
      this.chestPos.set(cx, cy, cz);
    } else {
      this.chestPos.set(0, this.state.terrain.getHeight(0, -4.5), -4.5);
    }

    const { group, lid } = EnvironmentModels.createTreasureChest();
    group.position.copy(this.chestPos);
    this.scene.add(group);
    this.chestGroup = group;
    this.chestLid = lid;
  }

  private rebuildAllTileMeshes(): void {
    // Clear old meshes
    this.tileMeshes.forEach(mesh => this.scene.remove(mesh));
    this.tileMeshes.clear();

    const tiles = this.state.terrain.getAllTiles();
    for (const tile of tiles) {
      this.rebuildPlacedTileMesh(tile, false);
    }
  }

  public rebuildPlacedTileMesh(tile: PlacedTile, animateIn = false): void {
    const existing = this.tileMeshes.get(tile.key);
    if (existing) {
      this.scene.remove(existing);
    }

    const fullDef = TILE_LIBRARY[tile.defId];
    if (!fullDef) return;

    const mesh = TileMeshBuilder.buildTileMesh(fullDef, tile.rotation, tile.isDamaged, this.state.selectedCulture);
    const cx = SQRT3 * HEX_R * (tile.q + tile.r / 2);
    const cz = 1.5 * HEX_R * tile.r;

    if (animateIn) {
      // Settle down animation with soft impact
      mesh.position.set(cx, 1.2, cz);
      this.tweens.add({
        duration: 0.35,
        update: (k) => {
          mesh.position.y = THREE.MathUtils.lerp(1.2, 0, k);
        }
      });
    } else {
      mesh.position.set(cx, 0, cz);
    }

    this.scene.add(mesh);
    this.tileMeshes.set(tile.key, mesh);
  }

  private updateAvailableSlotMarkers(): void {
    // Cleanly remove existing slot markers
    while (this.slotMarkers.children.length > 0) {
      this.slotMarkers.remove(this.slotMarkers.children[0]);
    }

    if (this.cameraCtrl.mode !== 'build') return;

    const slots = this.state.getAvailableSlots();
    const mats = this.materials;

    for (const slot of slots) {
      const cx = SQRT3 * HEX_R * (slot.q + slot.r / 2);
      const cz = 1.5 * HEX_R * slot.r;

      // Reuse pre-instantiated sharedSlotGeo
      const slotMesh = new THREE.Mesh(this.sharedSlotGeo, mats.slotValid);
      slotMesh.position.set(cx, 0.12, cz);
      slotMesh.userData = { q: slot.q, r: slot.r, isSlot: true };
      this.slotMarkers.add(slotMesh);
    }
  }

  private updateGhost(): void {
    if (this.ghostMesh) {
      this.scene.remove(this.ghostMesh);
      this.ghostMesh = null;
    }

    if (this.cameraCtrl.mode !== 'build' || !this.hoveredSlot) return;

    const def = this.state.getSelectedTile();
    if (!def) return;

    this.ghostMesh = TileMeshBuilder.buildGhostMesh(def, this.state.currentRotation, this.state.selectedCulture);
    const cx = SQRT3 * HEX_R * (this.hoveredSlot.q + this.hoveredSlot.r / 2);
    const cz = 1.5 * HEX_R * this.hoveredSlot.r;
    this.ghostMesh.position.set(cx, 0.08, cz);
    this.scene.add(this.ghostMesh);
  }

  /**
   * Mode transitions are strictly button-driven only (via Enter Island / Exit Character buttons)
   */
  public toggleGameMode(): void {
    if (this.cameraCtrl.mode === 'build') {
      this.cameraCtrl.switchToExplore(this.character);
      this.character.setVisible(true);
      this.tuningPanel?.setVisible(true);
      if (this.ghostMesh) {
        this.scene.remove(this.ghostMesh);
        this.ghostMesh = null;
      }
      this.slotMarkers.visible = false;
      this.clearPressedKeys();
    } else {
      this.cameraCtrl.switchToBuild();
      this.character.setVisible(false);
      this.tuningPanel?.setVisible(false);
      this.slotMarkers.visible = true;
      this.updateAvailableSlotMarkers();
      this.clearPressedKeys();
    }
  }

  private clearPressedKeys(): void {
    this.keys = {};
    this.character.inputVector.set(0, 0);
    this.character.jumpRequested = false;
  }

  private handleSlotClick(q: number, r: number): void {
    const res = this.state.placeTile(q, r);
    if (!res) return;

    this.audio.playTileSnap();
    if (res.matches > 0) {
      this.audio.playMatchBonus(res.matches);
    }

    // Spawn 3D mesh with drop easing
    this.rebuildPlacedTileMesh(res.tile, true);
    this.updateAvailableSlotMarkers();
    this.ui.renderHand();

    // Floating reward
    this.ui.showFloatingReward(`+${res.coinsEarned} Coins`, window.innerWidth / 2, window.innerHeight / 2);
  }

  private handleInteract(target: InteractableTarget): void {
    if (target.type === 'chest') {
      if (!this.state.hasOpenedChest && this.chestLid) {
        this.state.hasOpenedChest = true;
        this.audio.playChestOpen();
        this.tweens.add({
          duration: 0.5,
          update: (k) => {
            this.chestLid!.rotation.x = THREE.MathUtils.lerp(0, -Math.PI * 0.65, k);
          }
        });
        this.state.coins += 50;
        this.ui.showFloatingReward(`+50 Coins! (Treasure)`, window.innerWidth / 2, window.innerHeight / 2);
      }
    } else if (target.type === 'haat') {
      this.ui.showHaatTradeModal(() => {});
    } else if (target.type === 'fire') {
      this.audio.playWaterSplash();
      this.state.resolveActiveEvent();
      if (target.tileKey) {
        const tile = this.state.terrain.getTile(target.tileKey);
        if (tile) this.rebuildPlacedTileMesh(tile);
      }
      this.ui.showFloatingReward(`Fire Extinguished! +40 Coins`, window.innerWidth / 2, window.innerHeight / 2);
    } else if (target.type === 'farmhouse') {
      this.audio.playHarvest();
      this.state.inventory.grain += 2;
      this.state.coins += 15;
      this.ui.showFloatingReward(`+2 Grain Harvested!`, window.innerWidth / 2, window.innerHeight / 2);
    } else {
      this.audio.playHarvest();
      this.state.coins += 10;
      this.ui.showFloatingReward(`Interacted! +10 Coins`, window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  private bindEvents(): void {
    const addEvt = (target: EventTarget, type: string, listener: EventListenerOrEventListenerObject) => {
      target.addEventListener(type, listener);
      this.eventRemovers.push(() => target.removeEventListener(type, listener));
    };

    addEvt(window, 'resize', () => {
      this.cameraCtrl.setAspect(window.innerWidth / window.innerHeight);
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    addEvt(window, 'blur', () => {
      this.clearPressedKeys();
      this.isMouseDown = false;
    });

    // Mouse move & raycast
    addEvt(window, 'mousemove', (e: Event) => {
      const me = e as MouseEvent;
      this.mouse.x = (me.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(me.clientY / window.innerHeight) * 2 + 1;

      if (this.isMouseDown) {
        const dx = me.clientX - this.lastMouseX;
        const dy = me.clientY - this.lastMouseY;
        if (this.cameraCtrl.mode === 'build') {
          if (me.buttons === 2 || me.shiftKey) {
            this.cameraCtrl.panBuildCamera(dx, dy);
          }
        } else {
          this.cameraCtrl.rotateExploreCamera(dx, dy);
        }
      }
      this.lastMouseX = me.clientX;
      this.lastMouseY = me.clientY;
    });

    addEvt(window, 'mousedown', (e: Event) => {
      const me = e as MouseEvent;
      // If modal is active, do not interact with 3D scene
      if (this.ui.activeModal !== 'none') return;

      this.isMouseDown = true;
      this.lastMouseX = me.clientX;
      this.lastMouseY = me.clientY;

      if (me.button === 0 && this.cameraCtrl.mode === 'build') {
        this.raycaster.setFromCamera(this.mouse, this.cameraCtrl.camera);
        const hits = this.raycaster.intersectObjects(this.slotMarkers.children, true);
        if (hits.length > 0) {
          const slot = (hits[0].object as any).userData;
          if (slot && slot.isSlot) {
            this.handleSlotClick(slot.q, slot.r);
          }
        }
      }
    });

    addEvt(window, 'mouseup', () => {
      this.isMouseDown = false;
    });

    addEvt(window, 'wheel', (e: Event) => {
      const we = e as WheelEvent;
      if (this.ui.activeModal !== 'none') return;
      if (this.cameraCtrl.mode === 'build') {
        this.cameraCtrl.zoomBuildCamera(we.deltaY);
      }
    });

    // Keyboard controls
    addEvt(window, 'keydown', (e: Event) => {
      const ke = e as KeyboardEvent;

      // When text inputs or modals are focused, do not trigger gameplay actions
      const targetTag = (ke.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }
      if (this.ui.activeModal !== 'none') {
        if (ke.code === 'Escape') {
          // Allow closing active modals via Escape
          const closeDiag = document.getElementById('close-ingame-diag-btn');
          const closeTime = document.getElementById('close-time-modal-btn');
          const closeHaat = document.getElementById('close-haat-btn');
          if (closeDiag) closeDiag.click();
          if (closeTime) closeTime.click();
          if (closeHaat) closeHaat.click();
        }
        return;
      }

      this.keys[ke.code] = true;

      // Build Mode Specific Keys
      if (this.cameraCtrl.mode === 'build') {
        if (ke.code === 'KeyR') {
          this.state.rotateCurrentTile();
          this.audio.playTileRotate();
          this.updateGhost();
        }
        // Spacebar must NEVER switch modes or trigger anything in Build Mode
        if (ke.code === 'Space') {
          ke.preventDefault();
        }
      }

      // Explore Mode Specific Keys
      if (this.cameraCtrl.mode === 'explore') {
        if (ke.code === 'KeyE') {
          const activeTarget = this.interactions.getActiveTarget();
          if (activeTarget) this.handleInteract(activeTarget);
        }

        // Spacebar strictly triggers Jump in Explore Mode
        if (ke.code === 'Space') {
          ke.preventDefault();
          if (!ke.repeat) {
            this.character.jumpRequested = true;
          }
        }
      }
    });

    addEvt(window, 'keyup', (e: Event) => {
      const ke = e as KeyboardEvent;
      this.keys[ke.code] = false;
    });
  }

  private checkSlotHover(): void {
    this.raycaster.setFromCamera(this.mouse, this.cameraCtrl.camera);
    const hits = this.raycaster.intersectObjects(this.slotMarkers.children, true);

    if (hits.length > 0) {
      const slot = (hits[0].object as any).userData;
      if (slot && (!this.hoveredSlot || this.hoveredSlot.q !== slot.q || this.hoveredSlot.r !== slot.r)) {
        this.hoveredSlot = { q: slot.q, r: slot.r };
        this.updateGhost();
      }
    } else {
      if (this.hoveredSlot) {
        this.hoveredSlot = null;
        this.updateGhost();
      }
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    // Pause rendering updates when the browser tab is hidden
    if (document.hidden) return;

    const dt = Math.min(this.clock.getDelta(), 0.1);

    // 1. Process Input Vector (Only active in Explore Mode without modal)
    let ix = 0;
    let iy = 0;
    if (this.cameraCtrl.mode === 'explore' && this.ui.activeModal === 'none') {
      if (this.keys['KeyW'] || this.keys['ArrowUp']) iy += 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) iy -= 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) ix -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) ix += 1;
    }
    this.character.inputVector.set(ix, iy);

    // 2. Throttled Raycasting for Slot Hovering (~30Hz)
    if (this.cameraCtrl.mode === 'build' && this.ui.activeModal === 'none') {
      this.hoverThrottleTime += dt;
      if (this.hoverThrottleTime >= 0.033) {
        this.hoverThrottleTime = 0;
        this.checkSlotHover();
      }
    }

    // 3. Update Systems
    this.tweens.update(dt);
    this.water.update(dt);
    this.dayNight.update(dt);
    if (this.cameraCtrl.mode === 'explore') {
      this.character.update(dt, this.cameraCtrl.exploreYaw, this.state.terrain);
    }
    this.cameraCtrl.update(dt, this.character);

    // 4. Update Proximity Interactions
    const target = this.cameraCtrl.mode === 'explore'
      ? this.interactions.findNearestInteractable(
          this.character,
          this.state.terrain.getAllTiles(),
          this.chestPos,
          this.state.activeEvent?.targetTileKey
        )
      : null;

    // 5. Update UI
    this.ui.update(this.cameraCtrl.mode, target);

    // 6. Render Scene
    this.renderer.render(this.scene, this.cameraCtrl.camera);
  };

  public destroy(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Remove window event listeners
    this.eventRemovers.forEach(fn => fn());
    this.eventRemovers = [];

    // Dispose shared slot geometry
    this.sharedSlotGeo.dispose();

    // Destroy UI
    this.ui.destroy();

    // Dispose renderer
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AnimationTestScene {
  private container: HTMLElement;
  private modal: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animFrameId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Loaded models and animation mixers
  private humanMixer: THREE.AnimationMixer | null = null;
  private dogMixer: THREE.AnimationMixer | null = null;
  private humanActions: Map<string, THREE.AnimationAction> = new Map();
  private dogActions: Map<string, THREE.AnimationAction> = new Map();
  private currentHumanAction: THREE.AnimationAction | null = null;
  private currentDogAction: THREE.AnimationAction | null = null;

  private humanGroup: THREE.Group = new THREE.Group();
  private dogGroup: THREE.Group = new THREE.Group();

  constructor(container: HTMLElement = document.body) {
    this.container = container;
  }

  public open(): void {
    if (this.modal) return;

    this.modal = document.createElement('div');
    this.modal.id = 'animation-test-modal';
    this.modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: #090d16;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    // Header controls
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 20px;
      background: rgba(15, 23, 42, 0.95);
      border-bottom: 1px solid rgba(255,255,255,0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #fff;
      z-index: 10;
    `;
    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:16px; font-weight:800; color:#38bdf8;">🎭 Skeletal Rigging Test Stage</span>
        <span style="font-size:12px; background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; border-radius:12px; padding:2px 8px; font-weight:700;">GLB Skeletal Clips</span>
      </div>
      <div style="display:flex; gap:10px; align-items:center;">
        <div id="test-stage-info" style="font-size:12px; color:#cbd5e1; margin-right:12px;">Loading 3D Skeletal Assets...</div>
        <button id="close-test-stage-btn" style="background:#ef4444; border:none; border-radius:8px; color:#fff; padding:6px 14px; font-weight:800; cursor:pointer;">✕ Close Test</button>
      </div>
    `;
    this.modal.appendChild(header);

    // Canvas container
    const viewport = document.createElement('div');
    viewport.style.cssText = `flex: 1; position: relative; width: 100%; height: 100%; overflow: hidden;`;
    this.modal.appendChild(viewport);

    // Bottom animation switch bar
    const controlsBar = document.createElement('div');
    controlsBar.id = 'test-stage-controls';
    controlsBar.style.cssText = `
      position: absolute;
      bottom: 24px; left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 10px 18px;
      display: flex;
      gap: 16px;
      z-index: 10;
    `;
    controlsBar.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:800; color:#facc15;">Human:</span>
        <div id="human-clip-buttons" style="display:flex; gap:6px;"></div>
      </div>
      <div style="width:1px; background:rgba(255,255,255,0.2);"></div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; font-weight:800; color:#4ade80;">Dog:</span>
        <div id="dog-clip-buttons" style="display:flex; gap:6px;"></div>
      </div>
    `;
    viewport.appendChild(controlsBar);

    this.container.appendChild(this.modal);

    const closeBtn = header.querySelector('#close-test-stage-btn') as HTMLElement;
    closeBtn.onclick = () => this.close();

    this.initScene(viewport);
  }

  private initScene(viewport: HTMLElement): void {
    const width = viewport.clientWidth || window.innerWidth;
    const height = viewport.clientHeight || (window.innerHeight - 50);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.Fog(0x0f172a, 15, 35);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.8, 4.2);
    this.camera.lookAt(0, 0.9, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.appendChild(this.renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 2.0);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -4;
    this.scene.add(dirLight);

    // Test Ground with grid
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(30, 30, 0x38bdf8, 0x334155);
    grid.position.y = 0.001;
    this.scene.add(grid);

    this.scene.add(this.humanGroup);
    this.scene.add(this.dogGroup);

    this.loadAssets();
    this.animate();
  }

  private loadAssets(): void {
    const loader = new GLTFLoader();
    const info = this.modal?.querySelector('#test-stage-info') as HTMLElement;

    // Load Rigged Humanoid
    loader.load(
      '/assets/models/humanoid.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.9, 0.9, 0.9);
        model.position.set(-0.6, 0, 0);
        model.traverse((o: any) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        this.humanGroup.add(model);

        this.humanMixer = new THREE.AnimationMixer(model);
        const btnContainer = this.modal?.querySelector('#human-clip-buttons') as HTMLElement;

        if (gltf.animations.length > 0) {
          gltf.animations.forEach((clip, idx) => {
            const action = this.humanMixer!.clipAction(clip);
            const clipName = clip.name || `Clip_${idx}`;
            this.humanActions.set(clipName, action);

            if (btnContainer) {
              const btn = document.createElement('button');
              btn.innerText = clipName;
              btn.style.cssText = `
                background: ${idx === 0 ? '#0284c7' : 'rgba(255,255,255,0.1)'};
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                color: #fff;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
              `;
              btn.onclick = () => this.playHumanClip(clipName);
              btnContainer.appendChild(btn);
            }
          });

          // Play first clip by default
          const firstClip = gltf.animations[0].name;
          this.playHumanClip(firstClip);
        }

        if (info) info.innerText = `Humanoid loaded (${gltf.animations.length} clips). Loading dog...`;
      },
      undefined,
      (err) => {
        console.error('Failed to load humanoid.glb', err);
        if (info) info.innerText = 'Failed to load humanoid.glb';
      }
    );

    // Load Rigged Quadruped Dog
    loader.load(
      '/assets/models/dog.glb',
      (gltf) => {
        const model = gltf.scene;
        // Scale to small companion dog size
        model.scale.set(0.015, 0.015, 0.015);
        model.position.set(0.8, 0, 0);
        model.traverse((o: any) => {
          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        this.dogGroup.add(model);

        this.dogMixer = new THREE.AnimationMixer(model);
        const btnContainer = this.modal?.querySelector('#dog-clip-buttons') as HTMLElement;

        if (gltf.animations.length > 0) {
          gltf.animations.forEach((clip, idx) => {
            const action = this.dogMixer!.clipAction(clip);
            const clipName = clip.name || `Clip_${idx}`;
            this.dogActions.set(clipName, action);

            if (btnContainer) {
              const btn = document.createElement('button');
              btn.innerText = clipName;
              btn.style.cssText = `
                background: ${idx === 0 ? '#16a34a' : 'rgba(255,255,255,0.1)'};
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                color: #fff;
                padding: 4px 10px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
              `;
              btn.onclick = () => this.playDogClip(clipName);
              btnContainer.appendChild(btn);
            }
          });

          // Play first clip
          const firstClip = gltf.animations[0].name;
          this.playDogClip(firstClip);
        }

        if (info) info.innerText = `Both skeletal models verified & active.`;
      },
      undefined,
      (err) => {
        console.error('Failed to load dog.glb', err);
      }
    );
  }

  private playHumanClip(name: string): void {
    const nextAction = this.humanActions.get(name);
    if (!nextAction || nextAction === this.currentHumanAction) return;

    if (this.currentHumanAction) {
      this.currentHumanAction.fadeOut(0.25);
    }
    nextAction.reset().fadeIn(0.25).play();
    this.currentHumanAction = nextAction;

    // Highlight active button
    const btns = this.modal?.querySelectorAll('#human-clip-buttons button');
    btns?.forEach((b) => {
      const btn = b as HTMLElement;
      btn.style.background = btn.innerText === name ? '#0284c7' : 'rgba(255,255,255,0.1)';
    });
  }

  private playDogClip(name: string): void {
    const nextAction = this.dogActions.get(name);
    if (!nextAction || nextAction === this.currentDogAction) return;

    if (this.currentDogAction) {
      this.currentDogAction.fadeOut(0.25);
    }
    nextAction.reset().fadeIn(0.25).play();
    this.currentDogAction = nextAction;

    // Highlight active button
    const btns = this.modal?.querySelectorAll('#dog-clip-buttons button');
    btns?.forEach((b) => {
      const btn = b as HTMLElement;
      btn.style.background = btn.innerText === name ? '#16a34a' : 'rgba(255,255,255,0.1)';
    });
  }

  private animate = (): void => {
    if (!this.modal) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const dt = this.clock.getDelta();
    if (this.humanMixer) this.humanMixer.update(dt);
    if (this.dogMixer) this.dogMixer.update(dt);

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  public close(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    if (this.modal && this.modal.parentElement) {
      this.modal.parentElement.removeChild(this.modal);
      this.modal = null;
    }
  }
}

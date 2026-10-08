import * as THREE from 'three';
import { lerp } from '../core/math';

export type DayPhase = 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night';

export class DayNightSystem {
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;
  public starsGroup: THREE.Points;
  public moonMesh: THREE.Mesh;

  public timeOfDay: number = 0.38; // Starts in bright sunny day
  public isFrozen: boolean = false;
  public dayDuration: number = 240; // 4 minutes full cycle

  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Hemisphere Light (Sky & Ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x334155, 0.75);
    this.hemiLight.position.set(0, 40, 0);
    scene.add(this.hemiLight);

    // 2. Ambient Light (Warm baseline fill)
    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.35);
    scene.add(this.ambientLight);

    // 3. Directional Sun/Moon Light with Soft Cascaded Shadows
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 60;
    this.sunLight.shadow.camera.left = -16;
    this.sunLight.shadow.camera.right = 16;
    this.sunLight.shadow.camera.top = 16;
    this.sunLight.shadow.camera.bottom = -16;
    this.sunLight.shadow.bias = -0.0004;
    scene.add(this.sunLight);

    // 4. Glowing Night Moon Disc
    const moonGeo = new THREE.DodecahedronGeometry(1.4, 2);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(22, 26, -20);
    this.moonMesh.visible = false;
    scene.add(this.moonMesh);

    // 5. Starfield for Night Sky
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 450;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 45 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.05);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.cos(phi);
      starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.28, transparent: true, opacity: 0 });
    this.starsGroup = new THREE.Points(starsGeo, starsMat);
    scene.add(this.starsGroup);
  }

  public toggleFreeze(): boolean {
    this.isFrozen = !this.isFrozen;
    return this.isFrozen;
  }

  public getPhase(): DayPhase {
    const t = this.timeOfDay;
    if (t >= 0.2 && t < 0.35) return 'dawn';
    if (t >= 0.35 && t < 0.65) return 'day';
    if (t >= 0.65 && t < 0.78) return 'afternoon';
    if (t >= 0.78 && t < 0.88) return 'dusk';
    return 'night';
  }

  public getPhaseInfo(): { phase: DayPhase; label: string; symbol: string; progress: number } {
    const phase = this.getPhase();
    const symbols = {
      dawn: '🌅',
      day: '☀️',
      afternoon: '🌤️',
      dusk: '🌄',
      night: '🌙'
    };
    const labels = {
      dawn: 'DAWN',
      day: 'DAY',
      afternoon: 'AFTERNOON',
      dusk: 'DUSK',
      night: 'NIGHT'
    };
    return {
      phase,
      label: labels[phase],
      symbol: symbols[phase],
      progress: this.timeOfDay
    };
  }

  public update(dt: number): void {
    if (!this.isFrozen) {
      this.timeOfDay = (this.timeOfDay + dt / this.dayDuration) % 1.0;
    }

    const t = this.timeOfDay;
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const dist = 24;

    // Orbit Sun
    this.sunLight.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 10);
    this.sunLight.lookAt(0, 0, 0);

    let skyColor: THREE.Color;
    let groundColor: THREE.Color;
    let sunColor: THREE.Color;
    let sunIntensity: number;
    let starsOpacity: number;
    let showMoon: boolean = false;

    if (t >= 0.2 && t < 0.35) {
      // Dawn (Soft peach & rose gold)
      const k = (t - 0.2) / 0.15;
      skyColor = new THREE.Color(0x312e81).lerp(new THREE.Color(0x7dd3fc), k);
      groundColor = new THREE.Color(0x1e293b).lerp(new THREE.Color(0x365314), k);
      sunColor = new THREE.Color(0xfb923c).lerp(new THREE.Color(0xfff7ed), k);
      sunIntensity = lerp(0.4, 1.4, k);
      starsOpacity = lerp(0.8, 0.0, k);
    } else if (t >= 0.35 && t < 0.65) {
      // Bright Sunny Day (Vibrant azure sky & warm sunlight)
      skyColor = new THREE.Color(0x38bdf8);
      groundColor = new THREE.Color(0x4d7c0f);
      sunColor = new THREE.Color(0xffffff);
      sunIntensity = 1.45;
      starsOpacity = 0.0;
    } else if (t >= 0.65 && t < 0.78) {
      // Golden Afternoon
      const k = (t - 0.65) / 0.13;
      skyColor = new THREE.Color(0x38bdf8).lerp(new THREE.Color(0xfb923c), k);
      groundColor = new THREE.Color(0x4d7c0f).lerp(new THREE.Color(0x78350f), k);
      sunColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0xf59e0b), k);
      sunIntensity = lerp(1.45, 1.15, k);
      starsOpacity = 0.0;
    } else if (t >= 0.78 && t < 0.88) {
      // Dusk / Twilight Sunset
      const k = (t - 0.78) / 0.1;
      skyColor = new THREE.Color(0xfb923c).lerp(new THREE.Color(0x1e1b4b), k);
      groundColor = new THREE.Color(0x78350f).lerp(new THREE.Color(0x0f172a), k);
      sunColor = new THREE.Color(0xf97316).lerp(new THREE.Color(0xa5b4fc), k);
      sunIntensity = lerp(1.15, 0.45, k);
      starsOpacity = lerp(0.0, 0.9, k);
      showMoon = true;
    } else {
      // Deep Starry Night (Deep indigo sky with glowing moonlight)
      skyColor = new THREE.Color(0x0f172a);
      groundColor = new THREE.Color(0x020617);
      sunColor = new THREE.Color(0x93c5fd); // Moonlit beam
      sunIntensity = 0.42;
      starsOpacity = 0.95;
      showMoon = true;
    }

    this.scene.background = skyColor;
    if (this.scene.fog) {
      this.scene.fog.color = skyColor;
    }

    this.hemiLight.color = skyColor;
    this.hemiLight.groundColor = groundColor;
    this.sunLight.color = sunColor;
    this.sunLight.intensity = sunIntensity;

    (this.starsGroup.material as THREE.PointsMaterial).opacity = starsOpacity;
    this.moonMesh.visible = showMoon;
  }
}

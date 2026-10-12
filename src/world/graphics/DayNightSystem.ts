import * as THREE from 'three';
import { lerp } from '../core/math';
import { Materials } from './Materials';

export type DayPhase = 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night';
export type TimeCycleSpeed = 'slow' | 'normal' | 'fast';

export class DayNightSystem {
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;
  public starsGroup: THREE.Points;
  public moonMesh: THREE.Mesh;

  // 24-hour normalized progress [0..1).
  // 0.0 = midnight (00:00), 0.25 = 06:00 AM, 0.43 = 10:24 AM, 0.5 = 12:00 PM, 0.75 = 06:00 PM
  public timeOfDay: number = 0.433; // Starts at 10:24 AM
  public isFrozen: boolean = false;
  
  // Default full-day duration: 1200s (20 real-world minutes per 24h cycle)
  // 1 real second = 1.2 in-game minutes
  public dayDuration: number = 1200;
  public cycleSpeed: TimeCycleSpeed = 'normal';

  private scene: THREE.Scene;
  private mats: Materials;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mats = Materials.get();

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

  public setSpeed(speed: TimeCycleSpeed): void {
    this.cycleSpeed = speed;
    if (speed === 'slow') {
      this.dayDuration = 2400; // 40 minutes full cycle
    } else if (speed === 'fast') {
      this.dayDuration = 300;  // 5 minutes full cycle
    } else {
      this.dayDuration = 1200; // 20 minutes standard cycle
    }
  }

  public toggleFreeze(): boolean {
    this.isFrozen = !this.isFrozen;
    return this.isFrozen;
  }

  public setExactTime(hours: number, minutes: number): void {
    const totalMinutes = (hours % 24) * 60 + (minutes % 60);
    this.timeOfDay = totalMinutes / 1440;
    this.updateWorldLighting();
  }

  public getTimeString(): string {
    const totalMinutes = Math.floor(this.timeOfDay * 1440);
    const h24 = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    const ampm = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${h12}:${mStr} ${ampm}`;
  }

  public getPhase(): DayPhase {
    const t = this.timeOfDay;
    if (t >= 0.20 && t < 0.32) return 'dawn';       // ~4:48 AM - 7:40 AM
    if (t >= 0.32 && t < 0.65) return 'day';        // ~7:40 AM - 3:36 PM
    if (t >= 0.65 && t < 0.76) return 'afternoon';  // ~3:36 PM - 6:14 PM
    if (t >= 0.76 && t < 0.85) return 'dusk';       // ~6:14 PM - 8:24 PM
    return 'night';                                 // ~8:24 PM - 4:48 AM
  }

  public getPhaseInfo(): { phase: DayPhase; label: string; symbol: string; progress: number; timeString: string } {
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
      progress: this.timeOfDay,
      timeString: this.getTimeString()
    };
  }

  public update(dt: number): void {
    if (!this.isFrozen) {
      this.timeOfDay = (this.timeOfDay + dt / this.dayDuration) % 1.0;
    }
    this.updateWorldLighting();
  }

  public updateWorldLighting(): void {
    const t = this.timeOfDay;
    // Map time [0..1] to sun angle: 0.25 (6 AM) is dawn horizon, 0.5 (12 PM) is overhead zenith
    const angle = t * Math.PI * 2 - Math.PI / 2;
    const dist = 26;

    // Orbit Sun
    this.sunLight.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 10);
    this.sunLight.lookAt(0, 0, 0);

    let skyColor: THREE.Color;
    let groundColor: THREE.Color;
    let sunColor: THREE.Color;
    let sunIntensity: number;
    let starsOpacity: number;
    let showMoon: boolean = false;
    let windowGlowIntensity = 0.0;

    if (t >= 0.20 && t < 0.32) {
      // Dawn (Soft peach & rose gold)
      const k = (t - 0.20) / 0.12;
      skyColor = new THREE.Color(0x312e81).lerp(new THREE.Color(0x7dd3fc), k);
      groundColor = new THREE.Color(0x1e293b).lerp(new THREE.Color(0x365314), k);
      sunColor = new THREE.Color(0xfb923c).lerp(new THREE.Color(0xfff7ed), k);
      sunIntensity = lerp(0.4, 1.4, k);
      starsOpacity = lerp(0.8, 0.0, k);
      windowGlowIntensity = lerp(0.7, 0.0, k);
    } else if (t >= 0.32 && t < 0.65) {
      // Bright Sunny Day (Vibrant azure sky & warm sunlight)
      skyColor = new THREE.Color(0x38bdf8);
      groundColor = new THREE.Color(0x4d7c0f);
      sunColor = new THREE.Color(0xffffff);
      sunIntensity = 1.45;
      starsOpacity = 0.0;
      windowGlowIntensity = 0.0;
    } else if (t >= 0.65 && t < 0.76) {
      // Golden Afternoon
      const k = (t - 0.65) / 0.11;
      skyColor = new THREE.Color(0x38bdf8).lerp(new THREE.Color(0xfb923c), k);
      groundColor = new THREE.Color(0x4d7c0f).lerp(new THREE.Color(0x78350f), k);
      sunColor = new THREE.Color(0xffffff).lerp(new THREE.Color(0xf59e0b), k);
      sunIntensity = lerp(1.45, 1.15, k);
      starsOpacity = 0.0;
      windowGlowIntensity = lerp(0.0, 0.3, k);
    } else if (t >= 0.76 && t < 0.85) {
      // Dusk / Twilight Sunset
      const k = (t - 0.76) / 0.09;
      skyColor = new THREE.Color(0xfb923c).lerp(new THREE.Color(0x1e1b4b), k);
      groundColor = new THREE.Color(0x78350f).lerp(new THREE.Color(0x0f172a), k);
      sunColor = new THREE.Color(0xf97316).lerp(new THREE.Color(0xa5b4fc), k);
      sunIntensity = lerp(1.15, 0.45, k);
      starsOpacity = lerp(0.0, 0.9, k);
      showMoon = true;
      windowGlowIntensity = lerp(0.3, 0.9, k);
    } else {
      // Deep Starry Night (Deep indigo sky with glowing moonlight)
      skyColor = new THREE.Color(0x0f172a);
      groundColor = new THREE.Color(0x020617);
      sunColor = new THREE.Color(0x93c5fd); // Moonlit beam
      sunIntensity = 0.42;
      starsOpacity = 0.95;
      showMoon = true;
      windowGlowIntensity = 1.0;
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

    // Window and lantern architectural lights
    if (this.mats && this.mats.windowGlow) {
      const glowCol = new THREE.Color(0xffe27a).multiplyScalar(windowGlowIntensity * 1.5);
      this.mats.windowGlow.color.copy(glowCol);
    }
  }
}

import * as THREE from 'three';
import { lerp } from '../core/math';

export type DayPhase = 'dawn' | 'day' | 'afternoon' | 'dusk' | 'night';

export class DayNightSystem {
  public sunLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public ambientLight: THREE.AmbientLight;
  public starsGroup: THREE.Points;

  public timeOfDay: number = 0.25; // 0.0 = midnight, 0.25 = sunrise/dawn, 0.5 = midday, 0.75 = sunset/dusk
  public isFrozen: boolean = false;
  public dayDuration: number = 180; // 3 minutes per full cycle

  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // Ambient / Hemisphere lights
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    this.hemiLight.position.set(0, 50, 0);
    scene.add(this.hemiLight);

    this.ambientLight = new THREE.AmbientLight(0xffeedd, 0.25);
    scene.add(this.ambientLight);

    // Main Directional Sun/Moon Light with soft shadow mapping
    this.sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 40;
    this.sunLight.shadow.camera.left = -12;
    this.sunLight.shadow.camera.right = 12;
    this.sunLight.shadow.camera.top = 12;
    this.sunLight.shadow.camera.bottom = -12;
    this.sunLight.shadow.bias = -0.0005;
    scene.add(this.sunLight);

    // Starfield for night sky
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 350;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 35 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.8 + 0.1); // upper hemisphere
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = radius * Math.cos(phi);
      starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0 });
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
    const dist = 18;

    // Orbit Sun/Moon
    this.sunLight.position.set(Math.cos(angle) * dist, Math.sin(angle) * dist, 8);
    this.sunLight.lookAt(0, 0, 0);

    // Interpolate Sky / Lighting colors
    let skyColor: THREE.Color;
    let groundColor: THREE.Color;
    let sunColor: THREE.Color;
    let sunIntensity: number;
    let starsOpacity: number;

    if (t >= 0.2 && t < 0.35) {
      // Dawn
      const k = (t - 0.2) / 0.15;
      skyColor = new THREE.Color(0x2a284e).lerp(new THREE.Color(0x89c5f0), k);
      groundColor = new THREE.Color(0x3a483a);
      sunColor = new THREE.Color(0xffaa55).lerp(new THREE.Color(0xfff0dd), k);
      sunIntensity = lerp(0.3, 1.2, k);
      starsOpacity = lerp(0.8, 0.0, k);
    } else if (t >= 0.35 && t < 0.65) {
      // Day
      skyColor = new THREE.Color(0x89c5f0);
      groundColor = new THREE.Color(0x507548);
      sunColor = new THREE.Color(0xfffdf5);
      sunIntensity = 1.35;
      starsOpacity = 0.0;
    } else if (t >= 0.65 && t < 0.78) {
      // Afternoon
      const k = (t - 0.65) / 0.13;
      skyColor = new THREE.Color(0x89c5f0).lerp(new THREE.Color(0xf69d62), k);
      groundColor = new THREE.Color(0x507548).lerp(new THREE.Color(0x405538), k);
      sunColor = new THREE.Color(0xfffdf5).lerp(new THREE.Color(0xffb74d), k);
      sunIntensity = lerp(1.35, 1.0, k);
      starsOpacity = 0.0;
    } else if (t >= 0.78 && t < 0.88) {
      // Dusk
      const k = (t - 0.78) / 0.1;
      skyColor = new THREE.Color(0xf69d62).lerp(new THREE.Color(0x1a1c38), k);
      groundColor = new THREE.Color(0x405538).lerp(new THREE.Color(0x1c281e), k);
      sunColor = new THREE.Color(0xff7043).lerp(new THREE.Color(0x90caf9), k);
      sunIntensity = lerp(1.0, 0.35, k);
      starsOpacity = lerp(0.0, 0.9, k);
    } else {
      // Night
      skyColor = new THREE.Color(0x0e1124);
      groundColor = new THREE.Color(0x141824);
      sunColor = new THREE.Color(0x9fa8da); // cool moonlight
      sunIntensity = 0.35;
      starsOpacity = 0.95;
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
  }
}

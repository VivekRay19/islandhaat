import * as THREE from 'three';

/**
 * Generates procedural canvas textures for high-quality PBR stylized materials.
 */
export class TextureGenerator {
  /** Creates procedural grass & foliage noise texture */
  public static createGrassTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base lush green gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#5cb83c');
    grad.addColorStop(0.5, '#4ca630');
    grad.addColorStop(1, '#3b8c22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Subtle grass blade specks and color variations
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 2 + 1;
      const shade = Math.random();
      ctx.fillStyle = shade > 0.6 ? 'rgba(120, 210, 80, 0.45)' : (shade > 0.3 ? 'rgba(40, 110, 25, 0.35)' : 'rgba(230, 210, 90, 0.25)');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Creates earthy rock & cliff strata texture */
  public static createCliffTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base warm stone
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(0, 0, size, size);

    // Horizontal rock strata lines
    for (let y = 0; y < size; y += 12 + Math.random() * 16) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(55, 65, 81, 0.6)' : 'rgba(156, 163, 175, 0.4)';
      ctx.fillRect(0, y, size, 4 + Math.random() * 8);
    }

    // Rocky grain
    for (let i = 0; i < 4000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(31, 41, 55, 0.3)' : 'rgba(209, 213, 219, 0.2)';
      ctx.fillRect(x, y, 2, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Creates terracotta roof tile pattern */
  public static createRoofTileTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#c2410c'; // rich terracotta
    ctx.fillRect(0, 0, size, size);

    const rows = 16;
    const cols = 8;
    const rh = size / rows;
    const cw = size / cols;

    for (let r = 0; r < rows; r++) {
      const y = r * rh;
      const xOffset = (r % 2) * (cw / 2);
      for (let c = -1; c <= cols; c++) {
        const x = c * cw + xOffset;
        // Tile gradient
        const tGrad = ctx.createLinearGradient(x, y, x, y + rh);
        tGrad.addColorStop(0, '#ea580c');
        tGrad.addColorStop(0.7, '#c2410c');
        tGrad.addColorStop(1, '#9a3412');
        ctx.fillStyle = tGrad;
        ctx.fillRect(x + 2, y + 2, cw - 4, rh - 3);

        // Tile bevel highlight & shadow
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 2, cw - 4, rh - 3);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Creates wood plank grain texture */
  public static createWoodPlankTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#854d0e';
    ctx.fillRect(0, 0, size, size);

    const planks = 8;
    const ph = size / planks;

    for (let i = 0; i < planks; i++) {
      const y = i * ph;
      ctx.fillStyle = i % 2 === 0 ? '#92400e' : '#78350f';
      ctx.fillRect(0, y, size, ph - 2);

      // Wood grain streaks
      for (let s = 0; s < 6; s++) {
        ctx.fillStyle = 'rgba(69, 26, 3, 0.35)';
        ctx.fillRect(0, y + Math.random() * (ph - 4), size, 1 + Math.random() * 2);
      }

      // Plank seam line
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, y + ph - 2, size, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Creates striped fabric awning texture (for Haat stalls) */
  public static createAwningTexture(c1: string, c2: string): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const stripes = 8;
    const sw = size / stripes;
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 === 0 ? c1 : c2;
      ctx.fillRect(i * sw, 0, sw, size);
    }

    // Fabric texture grain
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 0; x < size; x += 4) {
      ctx.fillRect(x, 0, 1, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Creates golden wheat crop texture */
  public static createWheatTexture(): THREE.CanvasTexture {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 0, size, size);

    // Crop rows
    const rows = 12;
    const rh = size / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rh;
      ctx.fillStyle = '#eab308';
      ctx.fillRect(0, y + 2, size, rh - 4);

      ctx.fillStyle = '#713f12';
      ctx.fillRect(0, y, size, 2);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}

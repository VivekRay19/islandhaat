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

  // =========================================================================
  // REGIONAL INDIAN CULTURAL TEXTURES
  // =========================================================================

  /** Bihar: Authentic Mithila / Madhubani hand-drawn motif canvas */
  public static createMadhubaniTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Cream / handmade cow-dung wash paper base
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, size, size);

    // Madhubani geometric border
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, size - 24, size - 24);
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, size - 40, size - 40);

    // Corner triangle hatching
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((i * Math.PI) / 2);
      ctx.beginPath();
      ctx.moveTo(-size / 2 + 24, -size / 2 + 24);
      ctx.lineTo(-size / 2 + 80, -size / 2 + 24);
      ctx.lineTo(-size / 2 + 24, -size / 2 + 80);
      ctx.closePath();
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Central Sacred Lotus & Fish Motif (Characteristic Mithila art)
    const cx = size / 2;
    const cy = size / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 70, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Lotus petals with fine double-line ink drawing
    for (let p = 0; p < 8; p++) {
      const a = (p * Math.PI) / 4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.ellipse(95, 0, 32, 18, 0, 0, Math.PI * 2);
      ctx.fillStyle = p % 2 === 0 ? '#b91c1c' : '#047857';
      ctx.fill();
      ctx.stroke();
      // Fine inner hatching
      ctx.beginPath();
      ctx.moveTo(70, 0);
      ctx.lineTo(120, 0);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Maharashtra: Paithani Zari Silk with Peacock motif & gold brocade */
  public static createPaithaniZariTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Rich royal Paithani purple / crimson silk base
    ctx.fillStyle = '#831843';
    ctx.fillRect(0, 0, size, size);

    // Golden Zari grid pattern
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    const step = 64;
    for (let x = 0; x <= size; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let y = 0; y <= size; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // Peacock (Mor) gold butti in grid centers
    for (let x = step / 2; x < size; x += step) {
      for (let y = step / 2; y < size; y += step) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** West Bengal: Bishnupur Carved Terracotta relief brick panel */
  public static createTerracottaReliefTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#9a3412'; // deep burnt terracotta clay
    ctx.fillRect(0, 0, size, size);

    // Carved terracotta tile plaques
    const cols = 4;
    const rows = 4;
    const tw = size / cols;
    const th = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * tw;
        const y = r * th;
        // Tile bevel
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(x + 4, y + 4, tw - 8, th - 8);
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 4, y + 4, tw - 8, th - 8);

        // Floral rosette carved medallion
        const mx = x + tw / 2;
        const my = y + th / 2;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(mx, my, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Karnataka: Mysore Gilded Floral & Channapatna Lacquer sheen */
  public static createMysoreGoldTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Deep Mysore rosewood / royal green lacquer
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, size, size);

    // Gold leaf filigree scrolling
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 60 + i * 45, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Carved rosettes
    const points = 12;
    for (let i = 0; i < points; i++) {
      const a = (i * Math.PI * 2) / points;
      const x = size / 2 + Math.cos(a) * 140;
      const y = size / 2 + Math.sin(a) * 140;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Gujarat: Patola Double-Ikat geometric textile & Bandhani dots */
  public static createPatolaIkatTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Crimson red Patola silk base
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(0, 0, size, size);

    // Stepped ikat lozenges (characteristic Patan Patola)
    const step = 64;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        ctx.fillStyle = (x / step + y / step) % 2 === 0 ? '#047857' : '#d97706';
        ctx.beginPath();
        ctx.moveTo(x + step / 2, y + 4);
        ctx.lineTo(x + step - 4, y + step / 2);
        ctx.lineTo(x + step / 2, y + step - 4);
        ctx.lineTo(x + 4, y + step / 2);
        ctx.closePath();
        ctx.fill();

        // Bandhani white tie-dye dot in center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + step / 2, y + step / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Rajasthan: Jaipur Cobalt Blue Pottery Glaze */
  public static createBluePotteryTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Glazed milky white pottery base
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, size, size);

    // Deep Cobalt Blue & Turquoise Persian-Mughal floral vines
    const cx = size / 2;
    const cy = size / 2;

    ctx.strokeStyle = '#1d4ed8'; // Cobalt
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 120, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#06b6d4'; // Turquoise
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.stroke();

    // 8-petal central floral rosette
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a);
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.ellipse(45, 0, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0891b2';
      ctx.beginPath();
      ctx.arc(80, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** Maharashtra: Warli Folk Art geometric mural on earthen red-ochre plaster */
  public static createWarliTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Warm earthen red-ochre geru base (#B98259)
    ctx.fillStyle = '#b98259';
    ctx.fillRect(0, 0, size, size);

    // Subtle earthen wall plaster grain
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(160, 100, 60, 0.2)' : 'rgba(215, 170, 130, 0.15)';
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }

    // Sacred Warli white rice-paste geometric border (triangles & dots)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, size - 32, size - 32);

    const borderStep = 16;
    for (let x = 20; x < size - 20; x += borderStep) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(x, 16);
      ctx.lineTo(x + borderStep / 2, 24);
      ctx.lineTo(x + borderStep, 16);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x, size - 16);
      ctx.lineTo(x + borderStep / 2, size - 24);
      ctx.lineTo(x + borderStep, size - 16);
      ctx.fill();
    }

    // Central Tarpa Dance: Concentric circles of dancing human figures
    const cx = size / 2;
    const cy = size / 2;

    // Central Tarpa Player
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 5, 0, Math.PI * 2); // head
    ctx.fill();
    // Torso (two triangles joined at tip)
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 3);
    ctx.lineTo(cx + 6, cy - 3);
    ctx.lineTo(cx, cy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy + 5);
    ctx.lineTo(cx - 7, cy + 14);
    ctx.lineTo(cx + 7, cy + 14);
    ctx.closePath();
    ctx.fill();

    // 2 Concentric Rings of Dancing Villagers holding hands (characteristic Warli spiral)
    const rings = [
      { radius: 65, dancers: 14 },
      { radius: 110, dancers: 22 },
      { radius: 160, dancers: 30 }
    ];

    rings.forEach((ring) => {
      for (let i = 0; i < ring.dancers; i++) {
        const a = (i * Math.PI * 2) / ring.dancers;
        const x = cx + Math.cos(a) * ring.radius;
        const y = cy + Math.sin(a) * ring.radius;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a + Math.PI / 2);

        // Head
        ctx.beginPath();
        ctx.arc(0, -7, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Upper triangle
        ctx.beginPath();
        ctx.moveTo(-5, -3);
        ctx.lineTo(5, -3);
        ctx.lineTo(0, 3);
        ctx.closePath();
        ctx.fill();

        // Lower triangle
        ctx.beginPath();
        ctx.moveTo(0, 3);
        ctx.lineTo(-6, 10);
        ctx.lineTo(6, 10);
        ctx.closePath();
        ctx.fill();

        // Connected arms to neighbors
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.lineTo(-12, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(5, -2);
        ctx.lineTo(12, 0);
        ctx.stroke();

        ctx.restore();
      }
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** West Bengal: Baluchari Silk Handloom with mythological woven pallu */
  public static createBaluchariTexture(): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Rich deep royal indigo/maroon silk base
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, size, size);

    // Gilded cream & gold jacquard woven rows
    const rows = 6;
    const rh = size / rows;
    for (let r = 0; r < rows; r++) {
      const y = r * rh;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, y + 4, size - 16, rh - 8);

      // Figurative woven medallions
      for (let c = 0; c < 4; c++) {
        const mx = 64 + c * 115;
        const my = y + rh / 2;

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(mx, my, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(mx, my, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /** State-specific Terrain Surface Texture */
  public static createStateTerrainTexture(state: string): THREE.CanvasTexture {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    switch (state) {
      case 'bihar':
        // Fertile alluvial earthen soil with clay courtyards
        ctx.fillStyle = '#a16207';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 4000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(234, 179, 8, 0.25)' : 'rgba(113, 63, 18, 0.35)';
          ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
        }
        break;

      case 'maharashtra':
        // Bright, Sunlit Sahyadri Monsoon Landscape (#A5C982 grass + #C1D99A new growth + #B98259 earth)
        ctx.fillStyle = '#A5C982'; // Sunlit lush grass
        ctx.fillRect(0, 0, size, size);

        // Monsoon growth specks & warm earth patches
        for (let i = 0; i < 4500; i++) {
          const rand = Math.random();
          if (rand > 0.6) {
            ctx.fillStyle = 'rgba(193, 217, 154, 0.5)'; // #C1D99A light monsoon growth
          } else if (rand > 0.3) {
            ctx.fillStyle = 'rgba(185, 130, 89, 0.3)'; // #B98259 warm earth
          } else {
            ctx.fillStyle = 'rgba(208, 193, 165, 0.35)'; // #D0C1A5 sunlit stone highlights
          }
          ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
        }
        break;

      case 'west_bengal':
        // Lush delta riverbank fertile silt and moss
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 4500; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.35)' : 'rgba(21, 128, 61, 0.4)';
          ctx.fillRect(Math.random() * size, Math.random() * size, 3, 2);
        }
        break;

      case 'karnataka':
        // Warm granite bedrock with red laterite earth
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 4500; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(217, 119, 6, 0.35)' : 'rgba(120, 53, 15, 0.4)';
          ctx.fillRect(Math.random() * size, Math.random() * size, 3, 3);
        }
        break;

      case 'gujarat':
        // Semi-arid alluvial earth and courtyard lime
        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 4000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(254, 243, 199, 0.3)' : 'rgba(180, 83, 9, 0.35)';
          ctx.fillRect(Math.random() * size, Math.random() * size, 3, 2);
        }
        break;

      case 'rajasthan':
        // Golden Thar sand and banded sandstone
        ctx.fillStyle = '#eab308';
        ctx.fillRect(0, 0, size, size);
        for (let i = 0; i < 5000; i++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(254, 240, 138, 0.45)' : 'rgba(202, 138, 4, 0.4)';
          ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
        }
        break;

      default:
        ctx.fillStyle = '#4ca630';
        ctx.fillRect(0, 0, size, size);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
}

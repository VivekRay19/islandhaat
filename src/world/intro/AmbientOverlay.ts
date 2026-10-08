export class AmbientOverlay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private isRunning: boolean = true;
  private time: number = 0;
  private dpr: number = 1;

  // 1. Fireflies / Golden ambient motes (Lush vegetation area)
  private fireflies: {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    radius: number;
    alpha: number;
    maxAlpha: number;
    glowSpeed: number;
    phase: number;
    speedX: number;
    speedY: number;
    color: string;
  }[] = [];

  // 2. Falling Leaves (from top-left tree canopy)
  private leaves: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vrot: number;
    size: number;
    color: string;
    opacity: number;
    swayPhase: number;
  }[] = [];
  private leafTimer: number = 0;

  // 3. Occasional Birds
  private birds: {
    x: number;
    y: number;
    speed: number;
    scale: number;
    wingPhase: number;
    wingSpeed: number;
  }[] = [];
  private birdTimer: number = 6;

  // 4. Waterfall Cascades & Mist Particles
  private waterfallMists: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    life: number;
    maxLife: number;
  }[] = [];

  // 5. Chimney Smoke Puffs
  private smokePuffs: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    life: number;
    maxLife: number;
  }[] = [];
  private smokeTimer: number = 0;

  // 6. Ocean Shimmer Glints
  private glints: {
    relX: number;
    relY: number;
    size: number;
    phase: number;
    speed: number;
  }[] = [];

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'ambient-overlay-canvas';
    this.canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 10;
    `;
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', this.resize);

    this.initFireflies();
    this.initOceanGlints();
    this.animate();
  }

  private resize = (): void => {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
  };

  private initFireflies(): void {
    this.fireflies = [];
    const count = 14;
    const colors = ['#fef08a', '#fed7aa', '#fde047', '#fef9c3', '#a7f3d0'];

    for (let i = 0; i < count; i++) {
      // Clustered over island foliage (30% to 70% width, 45% to 85% height)
      const relX = 0.28 + Math.random() * 0.44;
      const relY = 0.45 + Math.random() * 0.38;
      this.fireflies.push({
        x: window.innerWidth * relX,
        y: window.innerHeight * relY,
        baseX: window.innerWidth * relX,
        baseY: window.innerHeight * relY,
        radius: 1.2 + Math.random() * 1.6,
        alpha: 0,
        maxAlpha: 0.35 + Math.random() * 0.45,
        glowSpeed: 1.2 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  private initOceanGlints(): void {
    this.glints = [];
    // Scattered across sunset specular area on the sea (55% - 92% width, 42% - 85% height)
    for (let i = 0; i < 22; i++) {
      this.glints.push({
        relX: 0.55 + Math.random() * 0.38,
        relY: 0.42 + Math.random() * 0.42,
        size: 2.5 + Math.random() * 5.0,
        phase: Math.random() * Math.PI * 2,
        speed: 1.0 + Math.random() * 1.8
      });
    }
  }

  private spawnLeaf(): void {
    const startX = window.innerWidth * (0.04 + Math.random() * 0.22);
    const startY = window.innerHeight * (0.05 + Math.random() * 0.25);
    const leafColors = ['#f97316', '#f59e0b', '#fbbf24', '#ea580c', '#e11d48'];

    this.leaves.push({
      x: startX,
      y: startY,
      vx: 0.4 + Math.random() * 0.6,
      vy: 0.5 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.04,
      size: 4 + Math.random() * 3.5,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      opacity: 0.65 + Math.random() * 0.25,
      swayPhase: Math.random() * Math.PI * 2
    });
  }

  private spawnBirdGroup(): void {
    const startY = window.innerHeight * (0.12 + Math.random() * 0.22);
    const birdCount = 2 + Math.floor(Math.random() * 3);
    const baseSpeed = 1.0 + Math.random() * 0.5;

    for (let i = 0; i < birdCount; i++) {
      this.birds.push({
        x: window.innerWidth + 20 + i * 25 + Math.random() * 15,
        y: startY + (Math.random() - 0.5) * 30,
        speed: baseSpeed + (Math.random() - 0.5) * 0.2,
        scale: 0.75 + Math.random() * 0.45,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.14 + Math.random() * 0.04
      });
    }
  }

  private spawnWaterfallMist(w: number, h: number): void {
    const wx = w * 0.268;
    const wy = h * 0.435;
    this.waterfallMists.push({
      x: wx + (Math.random() - 0.5) * 12,
      y: wy + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 0.5 - 0.1,
      vy: -Math.random() * 0.4 - 0.2,
      radius: 3 + Math.random() * 6,
      alpha: 0.12 + Math.random() * 0.12,
      life: 0,
      maxLife: 2.0 + Math.random() * 1.5
    });
  }

  private spawnSmoke(w: number, h: number): void {
    // Cottage chimney at ~ (X: 38%, Y: 46%)
    const cx = w * 0.382;
    const cy = h * 0.465;
    this.smokePuffs.push({
      x: cx + (Math.random() - 0.5) * 4,
      y: cy,
      vx: 0.15 + (Math.random() - 0.5) * 0.2,
      vy: -0.35 - Math.random() * 0.25,
      radius: 3 + Math.random() * 2,
      alpha: 0.18 + Math.random() * 0.08,
      life: 0,
      maxLife: 4.5 + Math.random() * 1.5
    });
  }

  private animate = (): void => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    if (!this.ctx) return;
    const dt = 0.016;
    this.time += dt;

    const w = window.innerWidth;
    const h = window.innerHeight;

    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.clearRect(0, 0, w, h);

    // =========================================================
    // 1. OCEAN SUNSET SHIMMER & SPECULAR GLINTS
    // =========================================================
    // Soft radial sunset sheen
    const shimmerGrad = this.ctx.createRadialGradient(
      w * 0.76, h * 0.38, 15,
      w * 0.76, h * 0.62, w * 0.42
    );
    const pulseAlpha = Math.sin(this.time * 0.7) * 0.02 + 0.045;
    shimmerGrad.addColorStop(0, `rgba(255, 230, 160, ${pulseAlpha * 1.4})`);
    shimmerGrad.addColorStop(0.4, `rgba(255, 175, 90, ${pulseAlpha * 0.8})`);
    shimmerGrad.addColorStop(1, 'rgba(255, 120, 40, 0)');

    this.ctx.fillStyle = shimmerGrad;
    this.ctx.fillRect(w * 0.45, h * 0.26, w * 0.55, h * 0.74);

    // Specular horizontal water glints
    for (const g of this.glints) {
      const gx = w * g.relX;
      const gy = h * g.relY;
      const gAlpha = (Math.sin(this.time * g.speed + g.phase) + 1) * 0.5;
      if (gAlpha > 0.15) {
        this.ctx.fillStyle = `rgba(255, 245, 200, ${(gAlpha - 0.15) * 0.35})`;
        this.ctx.beginPath();
        this.ctx.ellipse(gx, gy, g.size * (0.8 + gAlpha * 0.4), 1.2, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // =========================================================
    // 2. WATERFALL SUBTLE CASCADE & MIST
    // =========================================================
    const wfx = w * 0.268;
    const wfyTop = h * 0.395;
    const wfyBot = h * 0.44;

    // Subtle falling streak lines
    for (let i = 0; i < 3; i++) {
      const offset = (this.time * 2.5 + i * 0.4) % 1;
      const streakY = wfyTop + (wfyBot - wfyTop) * offset;
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - offset)})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(wfx + (i - 1) * 2.5, streakY);
      this.ctx.lineTo(wfx + (i - 1) * 2.5, streakY + 5);
      this.ctx.stroke();
    }

    // Mist spray at base of waterfall
    if (Math.random() < 0.12) {
      this.spawnWaterfallMist(w, h);
    }
    for (let i = this.waterfallMists.length - 1; i >= 0; i--) {
      const m = this.waterfallMists[i];
      m.x += m.vx;
      m.y += m.vy;
      m.radius += 0.05;
      m.life += dt;

      if (m.life >= m.maxLife) {
        this.waterfallMists.splice(i, 1);
        continue;
      }
      const progress = m.life / m.maxLife;
      const alpha = Math.sin(progress * Math.PI) * m.alpha;
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // =========================================================
    // 3. COTTAGE CHIMNEY SMOKE
    // =========================================================
    this.smokeTimer -= dt;
    if (this.smokeTimer <= 0) {
      this.spawnSmoke(w, h);
      this.smokeTimer = 0.45 + Math.random() * 0.3;
    }
    for (let i = this.smokePuffs.length - 1; i >= 0; i--) {
      const sp = this.smokePuffs[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.radius += 0.06;
      sp.life += dt;

      if (sp.life >= sp.maxLife) {
        this.smokePuffs.splice(i, 1);
        continue;
      }
      const progress = sp.life / sp.maxLife;
      const alpha = Math.sin(progress * Math.PI) * sp.alpha;
      this.ctx.fillStyle = `rgba(240, 235, 225, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // =========================================================
    // 4. FALLING LEAVES (Upper-Left Canopy Drift)
    // =========================================================
    this.leafTimer -= dt;
    if (this.leafTimer <= 0) {
      this.spawnLeaf();
      this.leafTimer = 2.0 + Math.random() * 3.5;
    }

    for (let i = this.leaves.length - 1; i >= 0; i--) {
      const leaf = this.leaves[i];
      leaf.swayPhase += 0.04;
      leaf.x += leaf.vx + Math.sin(leaf.swayPhase) * 0.6;
      leaf.y += leaf.vy;
      leaf.rot += leaf.vrot;

      this.ctx.save();
      this.ctx.translate(leaf.x, leaf.y);
      this.ctx.rotate(leaf.rot);
      this.ctx.fillStyle = leaf.color;
      this.ctx.globalAlpha = leaf.opacity;

      // Draw stylized curved leaf
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, leaf.size, leaf.size * 0.45, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      if (leaf.y > h + 20 || leaf.x > w + 20) {
        this.leaves.splice(i, 1);
      }
    }

    // =========================================================
    // 5. FIREFLIES / GOLDEN GLOWING MOTES
    // =========================================================
    for (const f of this.fireflies) {
      f.phase += dt * f.glowSpeed;
      f.x = f.baseX + Math.sin(f.phase * 0.6) * 16;
      f.y = f.baseY + Math.cos(f.phase * 0.8) * 12;

      const brightness = (Math.sin(f.phase) + 1) * 0.5;
      const alpha = brightness * f.maxAlpha;

      if (alpha > 0.05) {
        // Outer soft glow
        const glowGrad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 4.5);
        glowGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha * 0.6})`);
        glowGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        this.ctx.fillStyle = glowGrad;
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, f.radius * 4.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Core dot
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        this.ctx.beginPath();
        this.ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // =========================================================
    // 6. OCCASIONAL SILHOUETTE BIRDS (Sky)
    // =========================================================
    this.birdTimer -= dt;
    if (this.birdTimer <= 0) {
      this.spawnBirdGroup();
      this.birdTimer = 16.0 + Math.random() * 20.0;
    }

    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x -= b.speed;
      b.y += Math.sin(b.x * 0.015) * 0.35;
      b.wingPhase += b.wingSpeed;

      const wingY = Math.sin(b.wingPhase) * 3.5 * b.scale;
      const wingSpan = 7 * b.scale;

      this.ctx.strokeStyle = 'rgba(50, 25, 20, 0.55)';
      this.ctx.lineWidth = 1.4 * b.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(b.x - wingSpan, b.y - wingY);
      this.ctx.quadraticCurveTo(b.x - wingSpan * 0.5, b.y, b.x, b.y);
      this.ctx.quadraticCurveTo(b.x + wingSpan * 0.5, b.y, b.x + wingSpan, b.y - wingY);
      this.ctx.stroke();

      if (b.x < -40) {
        this.birds.splice(i, 1);
      }
    }

    this.ctx.restore();
  };

  public destroy(): void {
    this.isRunning = false;
    window.removeEventListener('resize', this.resize);
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}

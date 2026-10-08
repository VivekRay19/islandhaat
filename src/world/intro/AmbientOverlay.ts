export class AmbientOverlay {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private isRunning: boolean = true;
  private time: number = 0;

  // Ambient particles (subtle dust motes & waterfall mist)
  private particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number; life: number; maxLife: number }[] = [];

  // Occasional birds
  private birds: { x: number; y: number; speed: number; wingPhase: number }[] = [];
  private birdTimer: number = 4; // seconds until next bird group

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

    this.initParticles();
    this.animate();
  }

  private resize = (): void => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private initParticles(): void {
    // 24 subtle golden dust motes & waterfall mist particles
    this.particles = [];
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3 + 0.1,
        vy: -Math.random() * 0.4 - 0.1,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.4 + 0.1,
        life: Math.random() * 10,
        maxLife: Math.random() * 6 + 6
      });
    }
  }

  private spawnBird(): void {
    this.birds.push({
      x: window.innerWidth + 20,
      y: window.innerHeight * (0.15 + Math.random() * 0.25),
      speed: 1.2 + Math.random() * 0.6,
      wingPhase: Math.random() * Math.PI * 2
    });
  }

  private animate = (): void => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.clearRect(0, 0, w, h);
    this.time += 0.016;

    // 1. Subtle Ocean Sunset Shimmer (Right & Lower-Right water area)
    const oceanShimmerGradient = this.ctx.createRadialGradient(
      w * 0.78, h * 0.38, 10,
      w * 0.78, h * 0.6, w * 0.45
    );
    const shimmerAlpha = (Math.sin(this.time * 0.8) * 0.03 + 0.05);
    oceanShimmerGradient.addColorStop(0, `rgba(255, 235, 180, ${shimmerAlpha * 1.5})`);
    oceanShimmerGradient.addColorStop(0.5, `rgba(255, 180, 100, ${shimmerAlpha * 0.8})`);
    oceanShimmerGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

    this.ctx.fillStyle = oceanShimmerGradient;
    this.ctx.fillRect(w * 0.45, h * 0.25, w * 0.55, h * 0.75);

    // 2. Subtle Waterfall Mist Spray (Around X: 27%, Y: 42%)
    const waterfallX = w * 0.27;
    const waterfallY = h * 0.42;
    const mistGradient = this.ctx.createRadialGradient(waterfallX, waterfallY, 4, waterfallX, waterfallY, 35);
    const mistAlpha = Math.sin(this.time * 1.5) * 0.02 + 0.06;
    mistGradient.addColorStop(0, `rgba(255, 255, 255, ${mistAlpha})`);
    mistGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = mistGradient;
    this.ctx.beginPath();
    this.ctx.arc(waterfallX, waterfallY, 35, 0, Math.PI * 2);
    this.ctx.fill();

    // 3. Gentle Floating Golden Motes
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.life += 0.016;

      if (p.life >= p.maxLife || p.y < -10 || p.x > w + 10) {
        p.x = Math.random() * w;
        p.y = h + 10;
        p.life = 0;
      }

      const lifeRatio = p.life / p.maxLife;
      const fade = Math.sin(lifeRatio * Math.PI) * p.alpha;

      this.ctx.fillStyle = `rgba(255, 225, 160, ${fade})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 4. Occasional Flying Birds (Asynchronous spawn intervals)
    this.birdTimer -= 0.016;
    if (this.birdTimer <= 0) {
      this.spawnBird();
      this.birdTimer = 12 + Math.random() * 16; // Spawn next in 12-28 seconds
    }

    for (let i = this.birds.length - 1; i >= 0; i--) {
      const b = this.birds[i];
      b.x -= b.speed;
      b.y += Math.sin(b.x * 0.02) * 0.3;
      b.wingPhase += 0.15;

      const wingY = Math.sin(b.wingPhase) * 3;

      this.ctx.strokeStyle = 'rgba(60, 30, 20, 0.45)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(b.x - 7, b.y - wingY);
      this.ctx.quadraticCurveTo(b.x - 3.5, b.y, b.x, b.y);
      this.ctx.quadraticCurveTo(b.x + 3.5, b.y, b.x + 7, b.y - wingY);
      this.ctx.stroke();

      if (b.x < -30) {
        this.birds.splice(i, 1);
      }
    }
  };

  public destroy(): void {
    this.isRunning = false;
    window.removeEventListener('resize', this.resize);
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}

export class WorldAudio {
  private static instance: WorldAudio;
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private constructor() {}

  public static get(): WorldAudio {
    if (!WorldAudio.instance) {
      WorldAudio.instance = new WorldAudio();
    }
    return WorldAudio.instance;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.ctx = new AudioClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playTileSnap(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    // Deep wooden thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    // Subtle chime tone
    const chime = ctx.createOscillator();
    const cGain = ctx.createGain();
    chime.type = 'triangle';
    chime.frequency.setValueAtTime(587.33, ctx.currentTime + 0.02); // D5
    cGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.02);
    cGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    chime.connect(cGain);
    cGain.connect(ctx.destination);
    chime.start(ctx.currentTime + 0.02);
    chime.stop(ctx.currentTime + 0.22);
  }

  public playTileRotate(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  public playMatchBonus(matches: number): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    const notesToPlay = Math.min(matches, baseFreqs.length);

    for (let i = 0; i < notesToPlay; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreqs[i], ctx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.35);
    }
  }

  public playHarvest(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    [659.25, 880, 1174.66].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.25);
    });
  }

  public playChestOpen(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const chord = [440, 554.37, 659.25, 880, 1108.73];
    chord.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.16, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.6);
    });
  }

  public playWaterSplash(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }
}

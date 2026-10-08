export interface AudioSettings {
  master: number; // 0..1
  music: number;  // 0..1
  sfx: number;    // 0..1
  reduceMotion: boolean;
}

const SETTINGS_KEY = 'island_haat_settings_v1';

export class IntroMusic {
  private static instance: IntroMusic;
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private musicTimer: any = null;
  private ambientTimer: any = null;

  public settings: AudioSettings = {
    master: 0.8,
    music: 0.5,
    sfx: 0.8,
    reduceMotion: false
  };

  private constructor() {
    this.loadSettings();
  }

  public static get(): IntroMusic {
    if (!IntroMusic.instance) {
      IntroMusic.instance = new IntroMusic();
    }
    return IntroMusic.instance;
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load audio settings', e);
    }
  }

  public saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save audio settings', e);
    }
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

  /**
   * Starts peaceful procedural ambient world-building music (warm pads, harp arpeggio, soft flute).
   */
  public startMusic(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = this.initCtx();
    if (!ctx) return;

    let step = 0;
    // Pentatonic scale frequencies in Hz (D major pentatonic for bright, hopeful, cozy feel)
    const scale = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25, 739.99, 880.00];
    const chords = [
      [293.66, 369.99, 440.00], // D major
      [246.94, 293.66, 369.99], // B minor
      [196.00, 246.94, 293.66], // G major
      [220.00, 277.18, 329.63]  // A major
    ];

    const playBar = () => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const vol = this.settings.master * this.settings.music;

      if (vol > 0.01) {
        const chordIndex = Math.floor(step / 4) % chords.length;
        const currentChord = chords[chordIndex];

        // 1. Warm background synth pad
        currentChord.forEach(freq => {
          const padOsc = this.ctx!.createOscillator();
          const padGain = this.ctx!.createGain();
          const padFilter = this.ctx!.createBiquadFilter();

          padOsc.type = 'triangle';
          padOsc.frequency.setValueAtTime(freq * 0.5, now);

          padFilter.type = 'lowpass';
          padFilter.frequency.setValueAtTime(600, now);

          padGain.gain.setValueAtTime(0.001, now);
          padGain.gain.linearRampToValueAtTime(0.035 * vol, now + 0.8);
          padGain.gain.linearRampToValueAtTime(0.001, now + 3.2);

          padOsc.connect(padFilter);
          padFilter.connect(padGain);
          padGain.connect(this.ctx!.destination);

          padOsc.start(now);
          padOsc.stop(now + 3.2);
        });

        // 2. Plucked Harp / Kalimba arpeggios
        for (let i = 0; i < 4; i++) {
          const noteTime = now + i * 0.45;
          const noteFreq = scale[(step * 2 + i * 3) % scale.length];

          const harpOsc = this.ctx.createOscillator();
          const harpGain = this.ctx.createGain();

          harpOsc.type = 'sine';
          harpOsc.frequency.setValueAtTime(noteFreq, noteTime);

          harpGain.gain.setValueAtTime(0.06 * vol, noteTime);
          harpGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.9);

          harpOsc.connect(harpGain);
          harpGain.connect(this.ctx.destination);

          harpOsc.start(noteTime);
          harpOsc.stop(noteTime + 0.9);
        }

        // 3. Occasional melodic flute note
        if (step % 2 === 0) {
          const fluteFreq = scale[3 + (step % 5)];
          const fluteOsc = this.ctx.createOscillator();
          const fluteGain = this.ctx.createGain();

          fluteOsc.type = 'triangle';
          fluteOsc.frequency.setValueAtTime(fluteFreq, now + 0.3);

          fluteGain.gain.setValueAtTime(0.001, now + 0.3);
          fluteGain.gain.linearRampToValueAtTime(0.04 * vol, now + 0.7);
          fluteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

          fluteOsc.connect(fluteGain);
          fluteGain.connect(this.ctx.destination);

          fluteOsc.start(now + 0.3);
          fluteOsc.stop(now + 2.0);
        }
      }

      step = (step + 1) % 32;
      this.musicTimer = setTimeout(playBar, 1800);
    };

    playBar();
  }

  public stopMusic(): void {
    this.isPlaying = false;
    if (this.musicTimer) clearTimeout(this.musicTimer);
    if (this.ambientTimer) clearTimeout(this.ambientTimer);
  }

  public playButtonHover(): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    const vol = this.settings.master * this.settings.sfx;
    if (vol <= 0.01) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  public playButtonClick(): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    const vol = this.settings.master * this.settings.sfx;
    if (vol <= 0.01) return;

    // Rich wooden confirmation thud + chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.2 * vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    const chime = ctx.createOscillator();
    const cGain = ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(880, ctx.currentTime + 0.02);
    chime.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.18);
    cGain.gain.setValueAtTime(0.12 * vol, ctx.currentTime + 0.02);
    cGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    chime.connect(cGain);
    cGain.connect(ctx.destination);
    chime.start(ctx.currentTime + 0.02);
    chime.stop(ctx.currentTime + 0.25);
  }

  public playStartAdventureSwoosh(): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    const vol = this.settings.master * this.settings.sfx;
    if (vol <= 0.01) return;

    // Harmonic pentatonic ascension
    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.12 * vol, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.8);
    });
  }
}

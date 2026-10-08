import { IntroWorld3D } from './intro/IntroWorld3D';
import { IntroUI } from './ui/IntroUI';
import { IntroMusic } from './audio/IntroMusic';
import { IslandGame } from './IslandGame';

export class GameManager {
  private container: HTMLElement;
  private introWorld: IntroWorld3D | null = null;
  private introUI: IntroUI | null = null;
  private introMusic = IntroMusic.get();
  private game: IslandGame | null = null;

  private clock = { last: performance.now() };
  private isRunningIntro = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.startIntroScreen();
  }

  private startIntroScreen(): void {
    // 1. Build 3D living sunset environment
    this.introWorld = new IntroWorld3D(this.container);

    // 2. Build UI with matching handcrafted logo and carved buttons
    this.introUI = new IntroUI();

    // 3. Start ambient background music on first user click
    const startAudio = () => {
      this.introMusic.startMusic();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);

    // 4. Bind UI callbacks
    this.introUI.setCallbacks({
      onNewGame: () => this.transitionToGame(false),
      onContinue: () => this.transitionToGame(true)
    });

    // 5. Window resize listener
    window.addEventListener('resize', this.onResize);

    // 6. Run Intro Render Loop
    this.isRunningIntro = true;
    this.animateIntro();
  }

  private onResize = (): void => {
    if (this.introWorld) this.introWorld.resize();
  };

  private animateIntro = (): void => {
    if (!this.isRunningIntro || !this.introWorld) return;
    requestAnimationFrame(this.animateIntro);

    const now = performance.now();
    const dt = Math.min((now - this.clock.last) / 1000, 0.1);
    this.clock.last = now;

    this.introWorld.update(dt, this.introMusic.settings.reduceMotion);
  };

  private transitionToGame(isContinue: boolean): void {
    if (!this.introWorld) return;

    // 1. Camera swooshes forward over the cliffs toward the island
    this.introWorld.swooshIntoIsland(() => {
      this.isRunningIntro = false;
      window.removeEventListener('resize', this.onResize);

      // Clean up Intro Scene
      if (this.introWorld) {
        this.introWorld.destroy();
        this.introWorld = null;
      }
      if (this.introUI) {
        this.introUI.destroy();
        this.introUI = null;
      }

      // Clear container DOM
      this.container.innerHTML = '';

      // Boot into 3D Playable Island Game
      this.game = new IslandGame(this.container);
    });
  }
}

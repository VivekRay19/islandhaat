import { IntroScreen } from './intro/IntroScreen';
import { IslandGame } from './IslandGame';

export class GameManager {
  private container: HTMLElement;
  private introScreen: IntroScreen | null = null;
  private game: IslandGame | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.startIntroScreen();
  }

  private startIntroScreen(): void {
    // Mount the exact reference image with ambient layer and functional UI
    this.introScreen = new IntroScreen(this.container);

    this.introScreen.setCallbacks({
      onNewGame: () => this.startGame(false),
      onContinue: () => this.startGame(true)
    });
  }

  private startGame(isContinue: boolean): void {
    // Clean up Intro Screen
    if (this.introScreen) {
      this.introScreen.destroy();
      this.introScreen = null;
    }

    // Clear container
    this.container.innerHTML = '';

    // Direct, immediate transition into Build Mode in the 3D Island Game
    this.game = new IslandGame(this.container);
  }
}

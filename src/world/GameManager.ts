import { IntroScreen } from './intro/IntroScreen';
import { CultureSelectionScreen } from './culture/CultureSelectionScreen';
import { IslandGame } from './IslandGame';
import { IndianState } from './culture/CultureTypes';

export class GameManager {
  private container: HTMLElement;
  private introScreen: IntroScreen | null = null;
  private cultureScreen: CultureSelectionScreen | null = null;
  private game: IslandGame | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.startIntroScreen();
  }

  private startIntroScreen(): void {
    this.container.innerHTML = '';
    this.introScreen = new IntroScreen(this.container);

    this.introScreen.setCallbacks({
      onNewGame: () => this.openCultureSelection(),
      onContinue: () => this.startGame('bihar', true)
    });
  }

  private openCultureSelection(): void {
    if (this.introScreen) {
      this.introScreen.destroy();
      this.introScreen = null;
    }

    this.container.innerHTML = '';
    this.cultureScreen = new CultureSelectionScreen(this.container);

    this.cultureScreen.setCallbacks({
      onConfirm: (selectedState: IndianState) => {
        if (this.cultureScreen) {
          this.cultureScreen.destroy();
          this.cultureScreen = null;
        }
        this.startGame(selectedState, false);
      },
      onBack: () => {
        if (this.cultureScreen) {
          this.cultureScreen.destroy();
          this.cultureScreen = null;
        }
        this.startIntroScreen();
      }
    });
  }

  private startGame(culture: IndianState, isContinue: boolean): void {
    if (this.introScreen) {
      this.introScreen.destroy();
      this.introScreen = null;
    }
    if (this.cultureScreen) {
      this.cultureScreen.destroy();
      this.cultureScreen = null;
    }

    // Clear container
    this.container.innerHTML = '';

    // Direct, immediate transition into Build Mode in the 3D Island Game
    this.game = new IslandGame(this.container, culture, isContinue);
  }
}

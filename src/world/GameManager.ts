import { IntroScreen } from './intro/IntroScreen';
import { GameModeSelectScreen } from './menu/GameModeSelectScreen';
import { ServerMenuScreen } from './menu/ServerMenuScreen';
import { MultiplayerLobbyScreen } from './menu/MultiplayerLobbyScreen';
import { CultureSelectionScreen } from './culture/CultureSelectionScreen';
import { IslandGame } from './IslandGame';
import { IndianState } from './culture/CultureTypes';
import { ServerRoom } from './multiplayer/MultiplayerTypes';

export class GameManager {
  private container: HTMLElement;
  private introScreen: IntroScreen | null = null;
  private gameModeScreen: GameModeSelectScreen | null = null;
  private cultureScreen: CultureSelectionScreen | null = null;
  private serverMenuScreen: ServerMenuScreen | null = null;
  private lobbyScreen: MultiplayerLobbyScreen | null = null;
  private game: IslandGame | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.startIntroScreen();
  }

  private cleanupAllMenus(): void {
    if (this.introScreen) {
      this.introScreen.destroy();
      this.introScreen = null;
    }
    if (this.gameModeScreen) {
      this.gameModeScreen.destroy();
      this.gameModeScreen = null;
    }
    if (this.cultureScreen) {
      this.cultureScreen.destroy();
      this.cultureScreen = null;
    }
    if (this.serverMenuScreen) {
      this.serverMenuScreen.destroy();
      this.serverMenuScreen = null;
    }
    if (this.lobbyScreen) {
      this.lobbyScreen.destroy();
      this.lobbyScreen = null;
    }
    this.container.innerHTML = '';
  }

  private startIntroScreen(): void {
    this.cleanupAllMenus();
    this.introScreen = new IntroScreen(this.container);

    this.introScreen.setCallbacks({
      onNewGame: () => this.openGameModeSelect(),
      onContinue: () => this.startGame('bihar', true, 'sangam_haat', true)
    });
  }

  private openGameModeSelect(): void {
    this.cleanupAllMenus();
    this.gameModeScreen = new GameModeSelectScreen(this.container);

    this.gameModeScreen.setCallbacks({
      onSinglePlayer: () => this.openCultureSelection(),
      onMultiplayer: () => this.openServerMenu(),
      onBack: () => this.startIntroScreen()
    });
  }

  private openCultureSelection(): void {
    this.cleanupAllMenus();
    this.cultureScreen = new CultureSelectionScreen(this.container);

    this.cultureScreen.setCallbacks({
      onConfirm: (selectedState: IndianState) => {
        this.cleanupAllMenus();
        this.startGame(selectedState, false, 'solo', true);
      },
      onBack: () => {
        this.openGameModeSelect();
      }
    });
  }

  private openServerMenu(): void {
    this.cleanupAllMenus();
    this.serverMenuScreen = new ServerMenuScreen(this.container);

    this.serverMenuScreen.setCallbacks({
      onRoomReady: (room: ServerRoom) => {
        this.openLobby(room);
      },
      onBack: () => {
        this.openGameModeSelect();
      }
    });
  }

  private openLobby(room: ServerRoom): void {
    this.cleanupAllMenus();
    this.lobbyScreen = new MultiplayerLobbyScreen(this.container, room);

    this.lobbyScreen.setCallbacks({
      onGameStart: (startedRoom: ServerRoom, chosenCulture: IndianState) => {
        this.cleanupAllMenus();
        this.startGame(chosenCulture, false, startedRoom.id, false, startedRoom);
      },
      onLeave: () => {
        this.openServerMenu();
      }
    });
  }

  private startGame(
    culture: IndianState,
    isContinue: boolean,
    roomId: string = 'sangam_haat',
    isSinglePlayer: boolean = false,
    room?: ServerRoom
  ): void {
    this.cleanupAllMenus();

    if (this.game) {
      this.game.destroy();
      this.game = null;
    }

    // Direct transition into 3D Island Game
    this.game = new IslandGame(this.container, culture, isContinue, roomId, isSinglePlayer, room);
  }
}

import { IntroScreen } from './intro/IntroScreen';
import { GameModeSelectScreen } from './menu/GameModeSelectScreen';
import { ServerMenuScreen } from './menu/ServerMenuScreen';
import { MultiplayerLobbyScreen } from './menu/MultiplayerLobbyScreen';
import { CultureSelectionScreen } from './culture/CultureSelectionScreen';
import { IslandGame } from './IslandGame';
import { IndianState } from './culture/CultureTypes';
import { ServerRoom } from './multiplayer/MultiplayerTypes';
import { SessionManager } from './session/SessionManager';
import { WorldState } from './state/WorldState';

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
      onContinue: () => this.handleContinue()
    });
  }

  /**
   * Authoritative session continuation: restores the exact session (single-player or multiplayer),
   * culture, home island, current location, tiles, and farms.
   */
  private handleContinue(): void {
    const session = SessionManager.getSession();

    if (session) {
      if (session.sessionType === 'multiplayer') {
        // Check if authoritative save exists for this multiplayer room
        const savedRoomState = WorldState.loadFromStorage(session.roomId);
        if (savedRoomState) {
          this.startGame(session.culture, true, session.roomId, false);
          return;
        }
        // Fallback to solo if multiplayer room storage was migrated
        const soloState = WorldState.loadFromStorage('solo');
        if (soloState) {
          this.startGame(session.culture, true, 'solo', true);
          return;
        }
        // Attempt room connection with authoritative culture
        this.startGame(session.culture, true, session.roomId, false);
        return;
      } else {
        // Single-player session: load exact culture & solo state
        this.startGame(session.culture, true, 'solo', true);
        return;
      }
    }

    // Legacy fallback check: look for 'solo' or legacy v1 save
    const legacy = WorldState.loadFromStorage('solo') || WorldState.loadFromStorage();
    if (legacy) {
      const culture = legacy.selectedCulture || 'bihar';
      SessionManager.saveSession({
        sessionType: 'single',
        roomId: 'solo',
        culture,
        homeIsland: culture,
        currentLocation: legacy.currentLocation || culture,
        playerName: SessionManager.getPlayerName(),
        timestamp: Date.now()
      });
      this.startGame(culture, true, 'solo', true);
      return;
    }

    // If no save data exists, prompt user to select game mode
    this.openGameModeSelect();
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
        // Persist new single-player session
        SessionManager.saveSession({
          sessionType: 'single',
          roomId: 'solo',
          culture: selectedState,
          homeIsland: selectedState,
          currentLocation: selectedState,
          playerName: SessionManager.getPlayerName(),
          timestamp: Date.now()
        });
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
        // Persist new multiplayer session
        SessionManager.saveSession({
          sessionType: 'multiplayer',
          roomId: startedRoom.id,
          roomName: startedRoom.name,
          roomCode: startedRoom.code,
          culture: chosenCulture,
          homeIsland: chosenCulture,
          currentLocation: chosenCulture,
          playerName: SessionManager.getPlayerName(),
          timestamp: Date.now()
        });
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
    roomId: string = 'solo',
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

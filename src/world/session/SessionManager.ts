import { IndianState } from '../culture/CultureTypes';
import { WorldDestinationId } from '../travel/WorldMapSystem';

export interface ActiveSessionInfo {
  sessionType: 'single' | 'multiplayer';
  roomId: string;
  roomName?: string;
  roomCode?: string;
  culture: IndianState;
  homeIsland: IndianState;
  currentLocation: WorldDestinationId;
  playerName: string;
  timestamp: number;
}

export class SessionManager {
  private static readonly STORAGE_KEY = 'islandhaat_active_session_v1';
  private static readonly PLAYER_NAME_KEY = 'islandhaat_player_name';

  /**
   * Retrieves player display name, prioritizing persisted localStorage.
   */
  public static getPlayerName(): string {
    try {
      const stored = localStorage.getItem(this.PLAYER_NAME_KEY) || sessionStorage.getItem(this.PLAYER_NAME_KEY);
      if (stored && stored.trim().length >= 3) {
        return stored.trim();
      }
    } catch (e) {
      console.warn('Failed to read player name from storage:', e);
    }
    return 'Cultural Voyager';
  }

  /**
   * Validates and saves player display name across localStorage and sessionStorage.
   * Enforces 3 to 20 characters, disallows empty/blank strings, and sanitizes input.
   */
  public static setPlayerName(name: string): { success: boolean; name: string; error?: string } {
    const trimmed = (name || '').trim();
    if (trimmed.length < 3) {
      return { success: false, name: this.getPlayerName(), error: 'Name must be at least 3 characters long.' };
    }
    if (trimmed.length > 20) {
      return { success: false, name: this.getPlayerName(), error: 'Name cannot exceed 20 characters.' };
    }

    // Basic sanitization: strip angle brackets to prevent HTML injection
    const sanitized = trimmed.replace(/[<>]/g, '');
    if (sanitized.length < 3) {
      return { success: false, name: this.getPlayerName(), error: 'Invalid characters in name.' };
    }

    try {
      localStorage.setItem(this.PLAYER_NAME_KEY, sanitized);
      sessionStorage.setItem(this.PLAYER_NAME_KEY, sanitized);
    } catch (e) {
      console.warn('Failed to persist player name:', e);
    }

    return { success: true, name: sanitized };
  }

  /**
   * Persists the active session info so that Continue can restore the exact session.
   */
  public static saveSession(session: ActiveSessionInfo): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to persist active session info:', e);
    }
  }

  /**
   * Retrieves the latest active session.
   */
  public static getSession(): ActiveSessionInfo | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as ActiveSessionInfo;
    } catch {
      return null;
    }
  }

  /**
   * Updates the current location in the active session during travel.
   */
  public static updateLocation(currentLocation: WorldDestinationId): void {
    const s = this.getSession();
    if (s) {
      s.currentLocation = currentLocation;
      s.timestamp = Date.now();
      this.saveSession(s);
    }
  }

  /**
   * Clears the active session info.
   */
  public static clearSession(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear session info:', e);
    }
  }
}

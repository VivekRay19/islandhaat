import { IndianState } from '../culture/CultureTypes';

export type ServerStatus = 'waiting' | 'starting' | 'in_game' | 'closed';

export interface RoomMember {
  playerId: string;
  playerName: string;
  isHost: boolean;
  isReady: boolean;
  culture: IndianState | null;
  joinedAt: number;
}

export interface ServerRoom {
  id: string;             // Internal UUID / ID
  code: string;           // Formatted short invite code, e.g. "HAAT-8K2P"
  name: string;           // Display name of server
  hostId: string;         // Host's player ID
  status: ServerStatus;
  maxPlayers: number;     // Fixed at 6
  members: RoomMember[];
  createdAt: number;
}

export interface LobbyUpdateEvent {
  type: 'LOBBY_STATE' | 'MEMBER_JOINED' | 'MEMBER_LEFT' | 'CULTURE_RESERVED' | 'READY_TOGGLED' | 'GAME_STARTED' | 'SERVER_CLOSED';
  senderId: string;
  timestamp: number;
  payload: any;
}

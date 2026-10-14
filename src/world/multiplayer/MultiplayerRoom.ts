import { IndianState } from '../culture/CultureTypes';
import { PlacedTile } from '../hex/TerrainField';
import { CompletedFarm } from '../farming/FarmDetectionSystem';
import { AllianceRecord } from '../alliance/AllianceSystem';
import { WorldDestinationId } from '../travel/WorldMapSystem';

export interface RemotePlayerState {
  playerId: string;
  playerName: string;
  homeIsland: IndianState;
  currentLocation: WorldDestinationId;
  x: number;
  y: number;
  z: number;
  rotationY: number;
  isMoving: boolean;
  lastSeen: number;
}

export type NetworkMessageType =
  | 'PLAYER_JOIN'
  | 'PLAYER_HEARTBEAT'
  | 'PLAYER_MOVE'
  | 'PLAYER_LEAVE'
  | 'TILE_PLACED'
  | 'FARM_COMPLETED'
  | 'ALLIANCE_REQUEST'
  | 'ALLIANCE_ACCEPTED'
  | 'ALLIANCE_DECLINED'
  | 'ALLIANCE_EXPIRED'
  | 'ROOM_STATE_REQUEST'
  | 'ROOM_STATE_SYNC';

export interface NetworkMessage {
  type: NetworkMessageType;
  senderId: string;
  timestamp: number;
  payload: any;
}

export class MultiplayerRoom {
  public roomId: string;
  public localPlayerId: string;
  public localPlayerName: string;
  public localHomeIsland: IndianState;
  public currentLocation: WorldDestinationId;

  private channel: BroadcastChannel | null = null;
  private remotePlayers: Map<string, RemotePlayerState> = new Map();
  private islandOwners: Map<IndianState, { playerId: string; playerName: string }> = new Map();
  private islandTiles: Map<IndianState, PlacedTile[]> = new Map();
  private completedFarms: Map<string, CompletedFarm> = new Map();

  // Callbacks
  public onRemotePlayerUpdate?: (players: RemotePlayerState[]) => void;
  public onRemoteTilePlaced?: (island: IndianState, tile: PlacedTile) => void;
  public onRemoteFarmCompleted?: (island: IndianState, farm: CompletedFarm) => void;
  public onAllianceRequestReceived?: (alliance: AllianceRecord) => void;
  public onAllianceAcceptedReceived?: (allianceId: string, expiresAt: number) => void;
  public onAllianceDeclinedReceived?: (allianceId: string) => void;
  public onAllianceExpiredReceived?: (allianceId: string) => void;
  public onIslandOwnershipChanged?: (owners: Map<IndianState, { playerId: string; playerName: string }>) => void;

  private heartbeatTimer: any = null;
  private pruneTimer: any = null;
  private lastMoveSentTime: number = 0;

  constructor(
    roomId: string = 'sangam_haat',
    playerName?: string,
    homeIsland: IndianState = 'bihar'
  ) {
    this.roomId = roomId;
    this.localPlayerId = this.getOrCreatePlayerId();
    this.localHomeIsland = homeIsland;
    this.currentLocation = homeIsland;
    this.localPlayerName = playerName || this.getDefaultPlayerName(homeIsland);

    // Register local player's home island ownership
    this.islandOwners.set(homeIsland, {
      playerId: this.localPlayerId,
      playerName: this.localPlayerName
    });

    this.initTransport();
    this.startHeartbeat();
  }

  private getOrCreatePlayerId(): string {
    const key = 'islandhaat_player_id_v1';
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = `p_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  }

  private getDefaultPlayerName(culture: IndianState): string {
    switch (culture) {
      case 'bihar': return 'Sunita (Mithila)';
      case 'maharashtra': return 'Tanaji (Sahyadri)';
      case 'west_bengal': return 'Ananya (Bengal)';
      case 'karnataka': return 'Basava (Deccan)';
      case 'gujarat': return 'Kavita (Gujarat)';
      case 'rajasthan': return 'Ratan (Marwar)';
    }
  }

  private initTransport(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`islandhaat_room_${this.roomId}`);
        this.channel.onmessage = (e) => this.handleIncomingMessage(e.data);
      } catch (e) {
        console.warn('BroadcastChannel unavailable, falling back to local storage sync:', e);
      }
    }

    // Storage event fallback for cross-window sync
    window.addEventListener('storage', (e) => {
      if (e.key === `islandhaat_msg_${this.roomId}` && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          if (msg.senderId !== this.localPlayerId) {
            this.handleIncomingMessage(msg);
          }
        } catch (_) {}
      }
    });

    // Request authoritative room state from existing peers
    setTimeout(() => {
      this.broadcastMessage('ROOM_STATE_REQUEST', {
        homeIsland: this.localHomeIsland,
        playerName: this.localPlayerName
      });
    }, 200);
  }

  public broadcastMessage(type: NetworkMessageType, payload: any): void {
    const msg: NetworkMessage = {
      type,
      senderId: this.localPlayerId,
      timestamp: Date.now(),
      payload
    };

    if (this.channel) {
      this.channel.postMessage(msg);
    }

    // Mirror to localStorage for robust cross-window delivery
    try {
      localStorage.setItem(`islandhaat_msg_${this.roomId}`, JSON.stringify(msg));
    } catch (_) {}
  }

  private handleIncomingMessage(msg: NetworkMessage): void {
    if (!msg || msg.senderId === this.localPlayerId) return;

    switch (msg.type) {
      case 'PLAYER_JOIN':
      case 'PLAYER_HEARTBEAT': {
        const p = msg.payload as RemotePlayerState;
        this.remotePlayers.set(msg.senderId, {
          ...p,
          lastSeen: Date.now()
        });

        // Register remote home island ownership
        if (p.homeIsland) {
          this.islandOwners.set(p.homeIsland, {
            playerId: p.playerId,
            playerName: p.playerName
          });
          this.onIslandOwnershipChanged?.(this.islandOwners);
        }

        this.onRemotePlayerUpdate?.(Array.from(this.remotePlayers.values()));
        break;
      }

      case 'PLAYER_MOVE': {
        const p = msg.payload as Partial<RemotePlayerState>;
        const existing = this.remotePlayers.get(msg.senderId);
        if (existing) {
          existing.x = p.x ?? existing.x;
          existing.y = p.y ?? existing.y;
          existing.z = p.z ?? existing.z;
          existing.rotationY = p.rotationY ?? existing.rotationY;
          existing.isMoving = p.isMoving ?? existing.isMoving;
          existing.currentLocation = p.currentLocation ?? existing.currentLocation;
          existing.lastSeen = Date.now();
          this.onRemotePlayerUpdate?.(Array.from(this.remotePlayers.values()));
        }
        break;
      }

      case 'PLAYER_LEAVE': {
        this.remotePlayers.delete(msg.senderId);
        this.onRemotePlayerUpdate?.(Array.from(this.remotePlayers.values()));
        break;
      }

      case 'TILE_PLACED': {
        const { island, tile } = msg.payload;
        if (island && tile) {
          let list = this.islandTiles.get(island);
          if (!list) {
            list = [];
            this.islandTiles.set(island, list);
          }
          if (!list.some(t => t.key === tile.key)) {
            list.push(tile);
          }
          this.onRemoteTilePlaced?.(island, tile);
        }
        break;
      }

      case 'FARM_COMPLETED': {
        const { island, farm } = msg.payload;
        if (island && farm) {
          this.completedFarms.set(farm.id, farm);
          this.onRemoteFarmCompleted?.(island, farm);
        }
        break;
      }

      case 'ALLIANCE_REQUEST': {
        const alliance = msg.payload as AllianceRecord;
        if (alliance.hostId === this.localPlayerId) {
          this.onAllianceRequestReceived?.(alliance);
        }
        break;
      }

      case 'ALLIANCE_ACCEPTED': {
        const { allianceId, expiresAt } = msg.payload;
        this.onAllianceAcceptedReceived?.(allianceId, expiresAt);
        break;
      }

      case 'ALLIANCE_DECLINED': {
        const { allianceId } = msg.payload;
        this.onAllianceDeclinedReceived?.(allianceId);
        break;
      }

      case 'ALLIANCE_EXPIRED': {
        const { allianceId } = msg.payload;
        this.onAllianceExpiredReceived?.(allianceId);
        break;
      }

      case 'ROOM_STATE_REQUEST': {
        // Respond with current known room state
        this.broadcastMessage('ROOM_STATE_SYNC', {
          islandOwners: Array.from(this.islandOwners.entries()),
          completedFarms: Array.from(this.completedFarms.entries())
        });
        break;
      }

      case 'ROOM_STATE_SYNC': {
        const { islandOwners, completedFarms } = msg.payload;
        if (Array.isArray(islandOwners)) {
          for (const [st, owner] of islandOwners) {
            if (st !== this.localHomeIsland) {
              this.islandOwners.set(st, owner);
            }
          }
          this.onIslandOwnershipChanged?.(this.islandOwners);
        }
        if (Array.isArray(completedFarms)) {
          for (const [id, f] of completedFarms) {
            this.completedFarms.set(id, f);
          }
        }
        break;
      }
    }
  }

  private startHeartbeat(): void {
    // Send join announcement
    this.sendHeartbeat('PLAYER_JOIN');

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat('PLAYER_HEARTBEAT');
    }, 1500);

    // Prune stale players older than 6 seconds
    this.pruneTimer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, p] of this.remotePlayers.entries()) {
        if (now - p.lastSeen > 6000) {
          this.remotePlayers.delete(id);
          changed = true;
        }
      }
      if (changed) {
        this.onRemotePlayerUpdate?.(Array.from(this.remotePlayers.values()));
      }
    }, 2000);
  }

  private sendHeartbeat(type: NetworkMessageType = 'PLAYER_HEARTBEAT'): void {
    this.broadcastMessage(type, {
      playerId: this.localPlayerId,
      playerName: this.localPlayerName,
      homeIsland: this.localHomeIsland,
      currentLocation: this.currentLocation,
      x: 0,
      y: 0.34,
      z: 0,
      rotationY: 0,
      isMoving: false
    });
  }

  public sendMovement(x: number, y: number, z: number, rotationY: number, isMoving: boolean): void {
    const now = Date.now();
    // Throttle movement network traffic to max 12 Hz
    if (now - this.lastMoveSentTime < 80) return;
    this.lastMoveSentTime = now;

    this.broadcastMessage('PLAYER_MOVE', {
      x,
      y,
      z,
      rotationY,
      isMoving,
      currentLocation: this.currentLocation
    });
  }

  public notifyTilePlaced(island: IndianState, tile: PlacedTile): void {
    this.broadcastMessage('TILE_PLACED', { island, tile, placedBy: this.localPlayerId });
  }

  public notifyFarmCompleted(island: IndianState, farm: CompletedFarm): void {
    this.completedFarms.set(farm.id, farm);
    this.broadcastMessage('FARM_COMPLETED', { island, farm, completedBy: this.localPlayerId });
  }

  public notifyAllianceRequest(alliance: AllianceRecord): void {
    this.broadcastMessage('ALLIANCE_REQUEST', alliance);
  }

  public notifyAllianceAccepted(allianceId: string, expiresAt: number): void {
    this.broadcastMessage('ALLIANCE_ACCEPTED', { allianceId, expiresAt });
  }

  public notifyAllianceDeclined(allianceId: string): void {
    this.broadcastMessage('ALLIANCE_DECLINED', { allianceId });
  }

  public notifyAllianceExpired(allianceId: string): void {
    this.broadcastMessage('ALLIANCE_EXPIRED', { allianceId });
  }

  public updateCurrentLocation(newLoc: WorldDestinationId): void {
    this.currentLocation = newLoc;
    this.sendHeartbeat('PLAYER_MOVE');
  }

  public getIslandOwners(): Map<IndianState, { playerId: string; playerName: string }> {
    return new Map(this.islandOwners);
  }

  public getRemotePlayersAt(location: WorldDestinationId): RemotePlayerState[] {
    return Array.from(this.remotePlayers.values()).filter(p => p.currentLocation === location);
  }

  public destroy(): void {
    this.broadcastMessage('PLAYER_LEAVE', { playerId: this.localPlayerId });
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.pruneTimer) clearInterval(this.pruneTimer);
    this.channel?.close();
  }
}

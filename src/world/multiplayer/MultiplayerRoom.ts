import { IndianState } from '../culture/CultureTypes';
import { PlacedTile } from '../hex/TerrainField';
import { CompletedFarm } from '../farming/FarmDetectionSystem';
import { AllianceRecord } from '../alliance/AllianceSystem';
import { WorldDestinationId } from '../travel/WorldMapSystem';
import { supabase } from '../supabase/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

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
  | 'ROOM_STATE_SYNC'
  | 'PLAYER_TRAVEL_STATE';

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

  // Transports
  private supabaseChannel: RealtimeChannel | null = null;
  public isSupabaseConnected: boolean = false;
  private channel: BroadcastChannel | null = null;
  private seenMessages: Set<string> = new Set();

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
  public onConnectionStateChange?: (connected: boolean) => void;

  private heartbeatTimer: any = null;
  private pruneTimer: any = null;
  private lastMoveSentTime: number = 0;
  public isSinglePlayer: boolean = false;

  constructor(
    roomId: string = 'sangam_haat',
    playerName?: string,
    homeIsland: IndianState = 'bihar',
    isSinglePlayer: boolean = false,
    initialMembers?: Array<{ playerId: string; playerName: string; culture: IndianState | null }>
  ) {
    this.roomId = roomId;
    this.isSinglePlayer = isSinglePlayer;
    this.localPlayerId = this.getOrCreatePlayerId();
    this.localHomeIsland = homeIsland;
    this.currentLocation = homeIsland;
    this.localPlayerName = playerName || this.getDefaultPlayerName(homeIsland);

    // Register local player's home island ownership
    this.islandOwners.set(homeIsland, {
      playerId: this.localPlayerId,
      playerName: this.localPlayerName
    });

    // Register known server members' home islands
    if (initialMembers) {
      for (const m of initialMembers) {
        if (m.culture) {
          this.islandOwners.set(m.culture, {
            playerId: m.playerId,
            playerName: m.playerName
          });
        }
      }
    }

    if (!this.isSinglePlayer) {
      this.initTransport();
      this.startHeartbeat();
    }
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
    // 1. Supabase Realtime Channel (Internet-wide cross-device multiplayer)
    try {
      this.supabaseChannel = supabase.channel(`islandhaat_room_${this.roomId}`, {
        config: {
          broadcast: { self: false }
        }
      });

      this.supabaseChannel
        .on('broadcast', { event: 'island_msg' }, ({ payload }) => {
          if (payload && payload.senderId !== this.localPlayerId) {
            this.handleIncomingMessage(payload);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            this.isSupabaseConnected = true;
            this.onConnectionStateChange?.(true);
            this.sendHeartbeat('PLAYER_JOIN');
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            this.isSupabaseConnected = false;
            this.onConnectionStateChange?.(false);
          }
        });
    } catch (e) {
      console.warn('Supabase Realtime channel setup failed, using local fallback:', e);
    }

    // 2. BroadcastChannel (Same-device zero-latency cross-tab channel)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel(`islandhaat_room_${this.roomId}`);
        this.channel.onmessage = (e) => this.handleIncomingMessage(e.data);
      } catch (e) {
        console.warn('BroadcastChannel unavailable, falling back to local storage sync:', e);
      }
    }

    // 3. Storage event fallback for cross-window sync
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
    }, 400);
  }

  public broadcastMessage(type: NetworkMessageType, payload: any): void {
    const msg: NetworkMessage = {
      type,
      senderId: this.localPlayerId,
      timestamp: Date.now(),
      payload
    };

    // 1. Broadcast via Supabase Realtime across the internet
    if (this.supabaseChannel && this.isSupabaseConnected) {
      this.supabaseChannel.send({
        type: 'broadcast',
        event: 'island_msg',
        payload: msg
      }).catch(() => {});
    }

    // 2. Broadcast via BroadcastChannel for local browser tabs
    if (this.channel) {
      this.channel.postMessage(msg);
    }

    // 3. Mirror to localStorage
    try {
      localStorage.setItem(`islandhaat_msg_${this.roomId}`, JSON.stringify(msg));
    } catch (_) {}
  }

  private handleIncomingMessage(msg: NetworkMessage): void {
    if (!msg || msg.senderId === this.localPlayerId) return;

    // Deduplicate identical messages arriving via multiple transports
    const msgKey = `${msg.senderId}_${msg.timestamp}_${msg.type}`;
    if (this.seenMessages.has(msgKey)) return;
    this.seenMessages.add(msgKey);
    if (this.seenMessages.size > 500) {
      const oldest = this.seenMessages.values().next().value;
      if (oldest) this.seenMessages.delete(oldest);
    }

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

      case 'PLAYER_TRAVEL_STATE': {
        const { playerId, state, to } = msg.payload;
        const p = this.remotePlayers.get(playerId);
        if (p) {
          if (state === 'arrived') {
            p.currentLocation = to;
          }
          this.onRemotePlayerUpdate?.(Array.from(this.remotePlayers.values()));
        }
        break;
      }
    }
  }

  private startHeartbeat(): void {
    this.sendHeartbeat('PLAYER_JOIN');

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat('PLAYER_HEARTBEAT');
    }, 1500);

    // Prune stale players older than 7 seconds
    this.pruneTimer = setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [id, p] of this.remotePlayers.entries()) {
        if (now - p.lastSeen > 7000) {
          this.remotePlayers.delete(id);
          changed = true;
        }
      }
      if (changed) {
        this.onRemotePlayerUpdate?.(Array.from(this.remotePlayers.values()));
      }
    }, 2500);
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

  public broadcastTravelState(state: 'sailing' | 'arrived', from: WorldDestinationId, to: WorldDestinationId): void {
    if (state === 'arrived') {
      this.currentLocation = to;
    }
    if (this.isSinglePlayer) return;

    this.broadcastMessage('PLAYER_TRAVEL_STATE', {
      playerId: this.localPlayerId,
      playerName: this.localPlayerName,
      state,
      from,
      to,
      currentLocation: this.currentLocation
    });
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
    if (this.supabaseChannel) {
      supabase.removeChannel(this.supabaseChannel);
      this.supabaseChannel = null;
    }
    this.channel?.close();
  }
}

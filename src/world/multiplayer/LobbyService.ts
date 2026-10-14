import { supabase } from '../supabase/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { IndianState } from '../culture/CultureTypes';
import { ServerRoom, RoomMember, ServerStatus } from './MultiplayerTypes';
import { SessionManager } from '../session/SessionManager';

export class LobbyService {
  private static instance: LobbyService;
  public static get(): LobbyService {
    if (!LobbyService.instance) {
      LobbyService.instance = new LobbyService();
    }
    return LobbyService.instance;
  }

  private activeChannel: RealtimeChannel | null = null;
  private localBroadcast: BroadcastChannel | null = null;
  private currentRoom: ServerRoom | null = null;
  private localPlayerId: string;
  private localPlayerName: string;

  // Listeners
  public onLobbyUpdated?: (room: ServerRoom) => void;
  public onGameStarted?: (room: ServerRoom) => void;
  public onServerClosed?: (reason: string) => void;

  private constructor() {
    this.localPlayerId = this.getOrCreatePlayerId();
    this.localPlayerName = SessionManager.getPlayerName();
  }

  public getLocalPlayerId(): string {
    return this.localPlayerId;
  }

  public setPlayerName(name: string): void {
    const res = SessionManager.setPlayerName(name);
    this.localPlayerName = res.name;
  }

  public getPlayerName(): string {
    this.localPlayerName = SessionManager.getPlayerName();
    return this.localPlayerName;
  }

  public getCurrentRoom(): ServerRoom | null {
    return this.currentRoom;
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

  /**
   * Generates a clean, readable, non-ambiguous invitation code, e.g. "HAAT-8K2P"
   */
  public generateInviteCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // excludes ambiguous 0, 1, I, O
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `HAAT-${code}`;
  }

  /**
   * Creates a new multiplayer server as host.
   */
  public async createServer(serverName: string, hostPlayerName?: string): Promise<{ success: boolean; room?: ServerRoom; error?: string }> {
    try {
      if (hostPlayerName) this.setPlayerName(hostPlayerName);

      const code = this.generateInviteCode();
      const roomId = `room_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const cleanName = serverName.trim() || 'Sangam Archipelago';

      const hostMember: RoomMember = {
        playerId: this.localPlayerId,
        playerName: this.localPlayerName,
        isHost: true,
        isReady: false,
        culture: null,
        joinedAt: Date.now()
      };

      const room: ServerRoom = {
        id: roomId,
        code,
        name: cleanName,
        hostId: this.localPlayerId,
        status: 'waiting',
        maxPlayers: 6,
        members: [hostMember],
        createdAt: Date.now()
      };

      // Try database insert if table exists
      try {
        await supabase.from('rooms').insert({
          id: roomId,
          code,
          name: cleanName,
          host_id: this.localPlayerId,
          status: 'waiting',
          max_players: 6
        });
        await supabase.from('room_players').insert({
          id: `${roomId}_${this.localPlayerId}`,
          room_id: roomId,
          player_id: this.localPlayerId,
          player_name: this.localPlayerName,
          is_host: true,
          is_ready: false
        });
      } catch (dbErr) {
        // Table may not exist yet in user's Supabase project; Realtime channel handles live room coordination!
      }

      this.currentRoom = room;
      this.subscribeToRoomChannel(room.code);
      this.persistRoomToStorage(room);

      return { success: true, room };
    } catch (e: any) {
      console.error('Failed to create server:', e);
      return { success: false, error: e?.message || 'Failed to create server room.' };
    }
  }

  /**
   * Joins an existing server using an invitation code.
   */
  public async joinServer(inviteCode: string, playerName?: string): Promise<{ success: boolean; room?: ServerRoom; error?: string }> {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 5) {
      return { success: false, error: 'Please enter a valid invitation code (e.g. HAAT-8K2P).' };
    }

    if (playerName) this.setPlayerName(playerName);

    // 1. Try querying Supabase DB
    let dbRoom: any = null;
    try {
      const { data } = await supabase.from('rooms').select('*').eq('code', cleanCode).maybeSingle();
      if (data) dbRoom = data;
    } catch (_) {}

    // 2. Also check local storage / peers for the room
    const storedRoom = this.loadRoomFromStorage(cleanCode);

    if (dbRoom && dbRoom.status !== 'waiting') {
      return { success: false, error: `Server is currently ${dbRoom.status === 'in_game' ? 'already in game' : 'closed'}.` };
    }

    // Connect to room's realtime channel to negotiate join with host
    return new Promise((resolve) => {
      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          // Fallback if stored room is found
          if (storedRoom) {
            if (storedRoom.members.length >= 6) {
              resolve({ success: false, error: 'Server has reached maximum capacity (6/6 players).' });
              return;
            }
            if (storedRoom.status !== 'waiting') {
              resolve({ success: false, error: 'This game has already started.' });
              return;
            }
            this.executeJoin(storedRoom);
            resolve({ success: true, room: this.currentRoom! });
          } else {
            resolve({ success: false, error: `Could not connect to room "${cleanCode}". Please verify the code and ensure host is online.` });
          }
        }
      }, 4000);

      this.subscribeToRoomChannel(cleanCode);

      // Listen for host response to JOIN_REQUEST
      const onJoined = (room: ServerRoom) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve({ success: true, room });
        }
      };

      // Broadcast join request
      setTimeout(() => {
        this.broadcastLobbyMessage('JOIN_REQUEST', {
          player: {
            playerId: this.localPlayerId,
            playerName: this.localPlayerName,
            isHost: false,
            isReady: false,
            culture: null,
            joinedAt: Date.now()
          }
        });
      }, 300);

      // Hook temporary one-time listener
      const prevCb = this.onLobbyUpdated;
      this.onLobbyUpdated = (room) => {
        prevCb?.(room);
        if (room.members.some(m => m.playerId === this.localPlayerId)) {
          onJoined(room);
        }
      };
    });
  }

  private executeJoin(room: ServerRoom): void {
    if (!room.members.some(m => m.playerId === this.localPlayerId)) {
      room.members.push({
        playerId: this.localPlayerId,
        playerName: this.localPlayerName,
        isHost: false,
        isReady: false,
        culture: null,
        joinedAt: Date.now()
      });
    }
    this.currentRoom = room;
    this.persistRoomToStorage(room);
    this.broadcastLobbyMessage('LOBBY_STATE', { room });
    this.onLobbyUpdated?.(room);
  }

  /**
   * Selects and reserves a unique culture for the local player.
   */
  public reserveCulture(culture: IndianState): { success: boolean; reason?: string } {
    if (!this.currentRoom) return { success: false, reason: 'No active room.' };

    // Check if another member already has this culture
    const existingHolder = this.currentRoom.members.find(
      m => m.culture === culture && m.playerId !== this.localPlayerId
    );
    if (existingHolder) {
      return {
        success: false,
        reason: `${culture.toUpperCase()} is already selected by ${existingHolder.playerName}.`
      };
    }

    // Assign to local player
    const member = this.currentRoom.members.find(m => m.playerId === this.localPlayerId);
    if (member) {
      member.culture = culture;
      // Changing culture resets ready state to ensure conscious confirmation
      member.isReady = false;
    }

    this.persistRoomToStorage(this.currentRoom);
    this.broadcastLobbyMessage('CULTURE_RESERVED', {
      playerId: this.localPlayerId,
      culture
    });
    this.onLobbyUpdated?.(this.currentRoom);

    // Update DB if available
    try {
      supabase.from('room_players').update({ culture, is_ready: false })
        .eq('room_id', this.currentRoom.id)
        .eq('player_id', this.localPlayerId);
    } catch (_) {}

    return { success: true };
  }

  /**
   * Toggles the local player's ready state.
   */
  public toggleReady(): { success: boolean; isReady: boolean; reason?: string } {
    if (!this.currentRoom) return { success: false, isReady: false, reason: 'No active room.' };

    const member = this.currentRoom.members.find(m => m.playerId === this.localPlayerId);
    if (!member) return { success: false, isReady: false, reason: 'Player not in room.' };

    if (!member.culture) {
      return { success: false, isReady: false, reason: 'Please select a cultural island before getting ready!' };
    }

    member.isReady = !member.isReady;
    this.persistRoomToStorage(this.currentRoom);
    this.broadcastLobbyMessage('READY_TOGGLED', {
      playerId: this.localPlayerId,
      isReady: member.isReady
    });
    this.onLobbyUpdated?.(this.currentRoom);

    // Update DB
    try {
      supabase.from('room_players').update({ is_ready: member.isReady })
        .eq('room_id', this.currentRoom.id)
        .eq('player_id', this.localPlayerId);
    } catch (_) {}

    return { success: true, isReady: member.isReady };
  }

  /**
   * Host starts the game. Validates all requirements.
   */
  public startGame(): { success: boolean; reason?: string } {
    if (!this.currentRoom) return { success: false, reason: 'No active room.' };

    const room = this.currentRoom;
    if (room.hostId !== this.localPlayerId) {
      return { success: false, reason: 'Only the host can start the game.' };
    }

    if (room.members.length < 2) {
      return { success: false, reason: 'At least 2 players are required to start a multiplayer session.' };
    }

    // Check culture uniqueness and assignment
    const cultures = new Set<IndianState>();
    for (const m of room.members) {
      if (!m.culture) {
        return { success: false, reason: `${m.playerName} has not selected a cultural island yet.` };
      }
      if (cultures.has(m.culture)) {
        return { success: false, reason: `Culture ${m.culture.toUpperCase()} is duplicated. Each player must have a unique culture!` };
      }
      cultures.add(m.culture);

      if (!m.isReady) {
        return { success: false, reason: `${m.playerName} is not ready yet.` };
      }
    }

    if (room.status !== 'waiting') {
      return { success: false, reason: 'Server is already starting or in game.' };
    }

    // Mark starting
    room.status = 'in_game';
    this.persistRoomToStorage(room);

    this.broadcastLobbyMessage('GAME_STARTED', { room });
    this.onGameStarted?.(room);

    // Update DB
    try {
      supabase.from('rooms').update({ status: 'in_game', updated_at: new Date().toISOString() })
        .eq('id', room.id);
    } catch (_) {}

    return { success: true };
  }

  /**
   * Leaves the active server room.
   */
  public leaveServer(): void {
    if (!this.currentRoom) return;

    const room = this.currentRoom;
    const isHost = room.hostId === this.localPlayerId;

    if (isHost) {
      // Host departure: cleanly close server
      room.status = 'closed';
      this.broadcastLobbyMessage('SERVER_CLOSED', {
        reason: `Host ${this.localPlayerName} closed the server.`
      });
      try {
        supabase.from('rooms').update({ status: 'closed' }).eq('id', room.id);
      } catch (_) {}
    } else {
      // Non-host departure: remove self and release culture
      room.members = room.members.filter(m => m.playerId !== this.localPlayerId);
      this.broadcastLobbyMessage('MEMBER_LEFT', {
        playerId: this.localPlayerId,
        playerName: this.localPlayerName
      });
      try {
        supabase.from('room_players').delete()
          .eq('room_id', room.id)
          .eq('player_id', this.localPlayerId);
      } catch (_) {}
    }

    this.cleanupChannel();
    this.currentRoom = null;
    this.removeRoomFromStorage(room.code);
  }

  // -------------------------------------------------------------------------
  // REALTIME MESSAGING & CHANNEL MANAGEMENT
  // -------------------------------------------------------------------------

  private subscribeToRoomChannel(code: string): void {
    this.cleanupChannel();

    // 1. Supabase Realtime Channel
    try {
      this.activeChannel = supabase.channel(`islandhaat_lobby_${code}`, {
        config: { broadcast: { self: false } }
      });

      this.activeChannel
        .on('broadcast', { event: 'lobby_event' }, ({ payload }) => {
          this.handleIncomingLobbyMessage(payload);
        })
        .subscribe();
    } catch (e) {
      console.warn('Supabase lobby channel setup failed, using BroadcastChannel fallback:', e);
    }

    // 2. BroadcastChannel for fast local cross-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.localBroadcast = new BroadcastChannel(`islandhaat_lobby_${code}`);
        this.localBroadcast.onmessage = (e) => this.handleIncomingLobbyMessage(e.data);
      } catch (_) {}
    }

    // 3. Storage event fallback
    window.addEventListener('storage', (e) => {
      if (e.key === `islandhaat_lobby_msg_${code}` && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          this.handleIncomingLobbyMessage(msg);
        } catch (_) {}
      }
    });
  }

  private broadcastLobbyMessage(type: string, payload: any): void {
    const msg = {
      type,
      senderId: this.localPlayerId,
      timestamp: Date.now(),
      payload
    };

    if (this.activeChannel) {
      this.activeChannel.send({
        type: 'broadcast',
        event: 'lobby_event',
        payload: msg
      }).catch(() => {});
    }

    if (this.localBroadcast) {
      this.localBroadcast.postMessage(msg);
    }

    try {
      if (this.currentRoom) {
        localStorage.setItem(`islandhaat_lobby_msg_${this.currentRoom.code}`, JSON.stringify(msg));
      }
    } catch (_) {}
  }

  private handleIncomingLobbyMessage(msg: any): void {
    if (!msg || msg.senderId === this.localPlayerId) return;

    switch (msg.type) {
      case 'JOIN_REQUEST': {
        // If I am host, add player and broadcast authoritative room state
        if (this.currentRoom && this.currentRoom.hostId === this.localPlayerId) {
          const newPlayer = msg.payload.player as RoomMember;
          if (this.currentRoom.members.length >= 6) {
            this.broadcastLobbyMessage('JOIN_REJECTED', {
              playerId: newPlayer.playerId,
              reason: 'Server is full.'
            });
            return;
          }
          if (this.currentRoom.status !== 'waiting') {
            this.broadcastLobbyMessage('JOIN_REJECTED', {
              playerId: newPlayer.playerId,
              reason: 'Game already in progress.'
            });
            return;
          }
          if (!this.currentRoom.members.some(m => m.playerId === newPlayer.playerId)) {
            this.currentRoom.members.push(newPlayer);
          }
          this.persistRoomToStorage(this.currentRoom);
          this.broadcastLobbyMessage('LOBBY_STATE', { room: this.currentRoom });
          this.onLobbyUpdated?.(this.currentRoom);
        }
        break;
      }

      case 'LOBBY_STATE': {
        const room = msg.payload.room as ServerRoom;
        if (room) {
          this.currentRoom = room;
          this.persistRoomToStorage(room);
          this.onLobbyUpdated?.(room);
        }
        break;
      }

      case 'CULTURE_RESERVED': {
        const { playerId, culture } = msg.payload;
        if (this.currentRoom) {
          const m = this.currentRoom.members.find(x => x.playerId === playerId);
          if (m) {
            m.culture = culture;
            m.isReady = false;
          }
          this.persistRoomToStorage(this.currentRoom);
          this.onLobbyUpdated?.(this.currentRoom);
        }
        break;
      }

      case 'READY_TOGGLED': {
        const { playerId, isReady } = msg.payload;
        if (this.currentRoom) {
          const m = this.currentRoom.members.find(x => x.playerId === playerId);
          if (m) {
            m.isReady = isReady;
          }
          this.persistRoomToStorage(this.currentRoom);
          this.onLobbyUpdated?.(this.currentRoom);
        }
        break;
      }

      case 'MEMBER_LEFT': {
        const { playerId } = msg.payload;
        if (this.currentRoom) {
          this.currentRoom.members = this.currentRoom.members.filter(x => x.playerId !== playerId);
          this.persistRoomToStorage(this.currentRoom);
          this.onLobbyUpdated?.(this.currentRoom);
        }
        break;
      }

      case 'GAME_STARTED': {
        const room = msg.payload.room as ServerRoom;
        if (room) {
          this.currentRoom = room;
          this.persistRoomToStorage(room);
          this.onGameStarted?.(room);
        }
        break;
      }

      case 'SERVER_CLOSED': {
        const reason = msg.payload?.reason || 'Server was closed by the host.';
        this.cleanupChannel();
        this.currentRoom = null;
        this.onServerClosed?.(reason);
        break;
      }
    }
  }

  private cleanupChannel(): void {
    if (this.activeChannel) {
      try { this.activeChannel.unsubscribe(); } catch (_) {}
      this.activeChannel = null;
    }
    if (this.localBroadcast) {
      try { this.localBroadcast.close(); } catch (_) {}
      this.localBroadcast = null;
    }
  }

  private persistRoomToStorage(room: ServerRoom): void {
    try {
      localStorage.setItem(`islandhaat_room_${room.code}`, JSON.stringify(room));
    } catch (_) {}
  }

  private loadRoomFromStorage(code: string): ServerRoom | null {
    try {
      const data = localStorage.getItem(`islandhaat_room_${code}`);
      return data ? JSON.parse(data) : null;
    } catch (_) {
      return null;
    }
  }

  private removeRoomFromStorage(code: string): void {
    try {
      localStorage.removeItem(`islandhaat_room_${code}`);
      localStorage.removeItem(`islandhaat_lobby_msg_${code}`);
    } catch (_) {}
  }
}

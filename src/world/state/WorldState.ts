import { PlacedTile, TerrainField } from '../hex/TerrainField';
import { TileDef, TILE_LIBRARY, COMBOS, ComboDef, ResourceKind, LandmarkKind } from '../data/tileLibrary';
import { HEX_DIRS, OPPOSITE, hexKey, parseKey } from '../hex/Hex';
import { IndianState, CulturalQuest } from '../culture/CultureTypes';
import { CULTURE_PROFILES } from '../culture/CultureRegistry';
import { TileInventorySystem, TileInventoryState } from '../inventory/TileInventorySystem';
import { CropInventorySystem, CropInventory } from '../inventory/CropInventorySystem';
import { AllianceSystem, AllianceRecord } from '../alliance/AllianceSystem';
import { MultiplayerRoom } from '../multiplayer/MultiplayerRoom';
import { FarmDetectionSystem, CompletedFarm } from '../farming/FarmDetectionSystem';
import { WorldDestinationId } from '../travel/WorldMapSystem';
import { ISLAND_CROPS, GAME_START_CONFIG, CoreTileType, CropType } from '../farming/CropConfig';

export interface WorldEvent {
  id: string;
  type: 'fire' | 'festival' | 'market_day' | 'heavy_rain';
  title: string;
  description: string;
  targetTileKey: string;
  resolved: boolean;
}

export interface IslandPersistentData {
  destinationId: WorldDestinationId;
  tiles: PlacedTile[];
  registeredFarms: CompletedFarm[];
  lastVisited: number;
}

export class WorldState {
  public selectedCulture: IndianState = 'bihar';
  public cultureScore: number = 0;
  public activeQuest: CulturalQuest;

  // Active scene terrain & current destination
  public terrain: TerrainField = new TerrainField();
  public currentRotation: number = 0; // 0..5
  public currentLocation: WorldDestinationId = 'bihar';

  // Per-Island Authoritative Persistent State Registry
  public islands: Map<WorldDestinationId, IslandPersistentData> = new Map();

  // Core Gameplay & Multiplayer Systems
  public tileInventory: TileInventorySystem;
  public cropInventory: CropInventorySystem;
  public alliances: AllianceSystem;
  public multiplayer: MultiplayerRoom;
  public registeredFarms: Map<string, CompletedFarm> = new Map();

  // Backwards compatibility properties
  public coins: number = 420;
  public refills: number = 5;
  public level: number = 1;
  public totalTilesPlaced: number = 0;

  public inventory: Record<ResourceKind, number> = {
    grain: 3,
    wood: 2,
    fibre: 2,
    clay: 2,
    stone: 2,
    water: 3,
    music: 2
  };

  public activeSynergies: string[] = [];
  public activeEvent: WorldEvent | null = null;
  public hasOpenedChest: boolean = false;
  public roomId: string;
  public isSinglePlayer: boolean;

  constructor(
    culture: IndianState = 'bihar',
    roomId: string = 'sangam_haat',
    isSinglePlayer: boolean = false,
    initialMembers?: Array<{ playerId: string; playerName: string; culture: IndianState | null }>
  ) {
    this.selectedCulture = culture;
    this.currentLocation = culture;
    this.roomId = roomId;
    this.isSinglePlayer = isSinglePlayer;
    const profile = CULTURE_PROFILES[culture];

    // Initialize systems
    this.tileInventory = new TileInventorySystem();
    this.cropInventory = new CropInventorySystem(undefined, profile.startingResources.coins);
    this.coins = this.cropInventory.getCoins();
    this.alliances = new AllianceSystem();
    this.multiplayer = new MultiplayerRoom(roomId, undefined, culture, isSinglePlayer, initialMembers);

    this.inventory = {
      grain: profile.startingResources.grain,
      wood: profile.startingResources.wood,
      fibre: profile.startingResources.fibre,
      clay: profile.startingResources.clay,
      stone: profile.startingResources.stone,
      water: profile.startingResources.water,
      music: profile.startingResources.music
    };

    // Initialize state starting quest
    this.activeQuest = JSON.parse(JSON.stringify(profile.quests[0]));

    // Initialize starting home island
    this.loadIsland(culture);
    this.setupMultiplayerListeners();
  }

  private setupMultiplayerListeners(): void {
    // When remote tile placement arrives
    this.multiplayer.onRemoteTilePlaced = (island, tile) => {
      if (island === this.currentLocation) {
        this.terrain.setTile(tile);
      }
      let rec = this.islands.get(island);
      if (!rec) {
        rec = {
          destinationId: island,
          tiles: [],
          registeredFarms: [],
          lastVisited: Date.now()
        };
        this.islands.set(island, rec);
      }
      if (!rec.tiles.some((t) => t.key === tile.key)) {
        rec.tiles.push(tile);
      }
      this.saveToStorage();
    };

    // When remote farm completes
    this.multiplayer.onRemoteFarmCompleted = (island, farm) => {
      if (island === this.currentLocation) {
        this.registeredFarms.set(farm.id, farm);
      }
      let rec = this.islands.get(island);
      if (rec) {
        if (!rec.registeredFarms.some((f) => f.id === farm.id)) {
          rec.registeredFarms.push(farm);
        }
      }
      this.saveToStorage();
    };

    // When alliance request is received by host
    this.multiplayer.onAllianceRequestReceived = (alliance) => {
      this.alliances.registerAuthoritativeRecord(alliance);
    };

    // When alliance accept is received by visitor
    this.multiplayer.onAllianceAcceptedReceived = (allianceId, expiresAt) => {
      const rec = this.alliances.getAllianceById(allianceId);
      if (rec) {
        rec.status = 'active';
        rec.expiresAt = expiresAt;
        rec.activatedAt = Date.now();
        this.alliances.registerAuthoritativeRecord(rec);
      }
    };

    // When alliance decline is received
    this.multiplayer.onAllianceDeclinedReceived = (allianceId) => {
      const rec = this.alliances.getAllianceById(allianceId);
      if (rec) {
        rec.status = 'declined';
        this.alliances.registerAuthoritativeRecord(rec);
      }
    };

    // When alliance expires
    this.multiplayer.onAllianceExpiredReceived = (allianceId) => {
      const rec = this.alliances.getAllianceById(allianceId);
      if (rec) {
        rec.status = 'expired';
        this.alliances.registerAuthoritativeRecord(rec);
      }
    };
  }

  // =========================================================================
  // PER-ISLAND SAVE & RESTORE LIFECYCLE
  // =========================================================================

  /**
   * Captures the authoritative snapshot of the current active island terrain & farms.
   */
  public saveIslandSnapshot(destId: WorldDestinationId = this.currentLocation): void {
    const currentTiles = this.terrain.getAllTiles();
    if (currentTiles.length === 0) return;

    const currentFarms = Array.from(this.registeredFarms.values());
    this.islands.set(destId, {
      destinationId: destId,
      tiles: [...currentTiles],
      registeredFarms: [...currentFarms],
      lastVisited: Date.now()
    });
  }

  /**
   * Loads an island's state. If saved state exists, restores all tiles and farms.
   * If not, generates the default starter base layout for that destination.
   */
  public loadIsland(destId: WorldDestinationId): void {
    this.terrain.clear();
    this.registeredFarms.clear();

    const saved = this.islands.get(destId);
    if (saved && saved.tiles && saved.tiles.length > 0) {
      for (const t of saved.tiles) {
        this.terrain.setTile(t);
      }
      if (Array.isArray(saved.registeredFarms)) {
        for (const f of saved.registeredFarms) {
          this.registeredFarms.set(f.id, f);
        }
      }
    } else {
      // First visit: generate starter layout and save initial snapshot
      if (destId === 'central_haat') {
        this.generateCentralHaatBase();
      } else {
        this.generateCultureBase(destId as IndianState);
      }
      this.saveIslandSnapshot(destId);
    }
  }

  /**
   * Switches destination authoritatively: saves the departing island state,
   * switches location, and restores the destination's persistent state.
   */
  public switchDestination(destId: WorldDestinationId): void {
    if (this.currentLocation === destId) return;

    // 1. Snapshot the island we are leaving
    this.saveIslandSnapshot(this.currentLocation);
    this.saveToStorage();

    // 2. Change current location
    this.currentLocation = destId;
    this.multiplayer.updateCurrentLocation(destId);

    // 3. Load destination island's authoritative state
    this.loadIsland(destId);

    // 4. Save updated registry
    this.saveToStorage();
  }

  public initDefaultWorld(culture: IndianState = this.selectedCulture): void {
    this.loadIsland(culture);
  }

  public generateCultureBase(culture: IndianState): void {
    switch (culture) {
      case 'bihar':
        this.placeDirect(0, 0, 'start', 0);
        this.placeDirect(1, 0, 'bihar_tile', 0);
        this.placeDirect(0, 1, 'farm', 0);
        this.placeDirect(-1, 1, 'forest', 0);
        this.placeDirect(-1, 0, 'water', 0);
        this.placeDirect(0, -1, 'haat', 0);
        this.placeDirect(1, -1, 'pottery', 0);
        this.placeDirect(0, -3, 'islet', 0);
        break;

      case 'maharashtra':
        this.placeDirect(0, 0, 'start', 0);
        this.placeDirect(1, 0, 'maha_tile', 0);
        this.placeDirect(1, -1, 'mountain', 0);
        this.placeDirect(0, 1, 'quarry', 0);
        this.placeDirect(-1, 1, 'meadow', 0);
        this.placeDirect(0, -1, 'mountain', 0);
        this.placeDirect(-1, 0, 'farm', 0);
        this.placeDirect(2, -2, 'islet', 0);
        break;

      case 'west_bengal':
        this.placeDirect(0, 0, 'start', 0);
        this.placeDirect(1, 0, 'bengal_tile', 0);
        this.placeDirect(0, 1, 'water', 0);
        this.placeDirect(-1, 1, 'coastal', 0);
        this.placeDirect(-1, 0, 'farm', 0);
        this.placeDirect(0, -1, 'meadow', 0);
        this.placeDirect(1, -1, 'forest', 0);
        this.placeDirect(-1, -2, 'islet', 0);
        break;

      case 'karnataka':
        this.placeDirect(0, 0, 'start', 0);
        this.placeDirect(1, 0, 'karnataka_tile', 0);
        this.placeDirect(0, 1, 'haat', 0);
        this.placeDirect(1, -1, 'quarry', 0);
        this.placeDirect(-1, 0, 'forest', 0);
        this.placeDirect(0, -1, 'meadow', 0);
        this.placeDirect(-1, 1, 'farmland', 0);
        this.placeDirect(2, -1, 'islet', 0);
        break;

      case 'gujarat':
        this.placeDirect(0, 0, 'start', 0);
        this.placeDirect(1, 0, 'gujarat_tile', 0);
        this.placeDirect(0, 1, 'haat', 0);
        this.placeDirect(1, -1, 'meadow', 0);
        this.placeDirect(-1, 0, 'farm', 0);
        this.placeDirect(0, -1, 'water', 0);
        this.placeDirect(-1, 1, 'weaving_hut', 0);
        this.placeDirect(2, 0, 'islet', 0);
        break;

      case 'rajasthan':
        this.placeDirect(0, 0, 'start', 0);
        this.placeDirect(1, 0, 'rajasthan_tile', 0);
        this.placeDirect(0, 1, 'haat', 0);
        this.placeDirect(1, -1, 'mountain', 0);
        this.placeDirect(-1, 0, 'farm', 0);
        this.placeDirect(0, -1, 'meadow', 0);
        this.placeDirect(-1, 1, 'pottery', 0);
        this.placeDirect(0, -3, 'islet', 0);
        break;
    }
  }

  public generateCentralHaatBase(): void {
    this.placeDirect(0, 0, 'haat', 0);
    this.placeDirect(1, 0, 'haat', 0);
    this.placeDirect(0, 1, 'start', 0); // Arrival pier
    this.placeDirect(-1, 1, 'water', 0);
    this.placeDirect(-1, 0, 'water', 0);
    this.placeDirect(0, -1, 'pavilion', 0);
    this.placeDirect(1, -1, 'haat', 0);
    this.placeDirect(2, -1, 'coastal', 0);
    this.placeDirect(-2, 1, 'coastal', 0);
    this.placeDirect(0, 2, 'coastal', 0);
  }

  private placeDirect(q: number, r: number, defId: string, rotation = 0): void {
    const tile: PlacedTile = {
      key: hexKey(q, r),
      q,
      r,
      defId,
      rotation,
      placedAt: Date.now()
    };
    this.terrain.setTile(tile);
  }

  // --- Hand HUD Adapter: Displays single active tile (hidden queue) ---
  public get hand(): TileDef[] {
    const active = this.tileInventory.getActiveTile();
    if (!active) return [];
    const def = TILE_LIBRARY[active];
    return def ? [def] : [];
  }
  public set hand(_: TileDef[]) {}

  public get selectedIndex(): number {
    return 0;
  }
  public set selectedIndex(_: number) {}

  public refillHand(): void {
    // Tile inventory system manages queue draws authoritatively
  }

  public getSelectedTile(): TileDef | null {
    const active = this.tileInventory.getActiveTile();
    if (!active) return null;
    return TILE_LIBRARY[active] || null;
  }

  public selectTile(_index: number): void {
    this.currentRotation = 0;
  }

  public rotateCurrentTile(): number {
    this.currentRotation = (this.currentRotation + 1) % 6;
    return this.currentRotation;
  }

  public getAvailableSlots(): { q: number; r: number }[] {
    const tiles = this.terrain.getAllTiles();
    const map = new Map<string, { q: number; r: number }>();

    for (const tile of tiles) {
      if (tile.defId === 'islet') continue;

      for (const dir of HEX_DIRS) {
        const nq = tile.q + dir.q;
        const nr = tile.r + dir.r;
        const key = hexKey(nq, nr);
        if (!this.terrain.getTile(key)) {
          map.set(key, { q: nq, r: nr });
        }
      }
    }
    return Array.from(map.values());
  }

  public canPlaceAtCurrentLocation(): { allowed: boolean; reason?: string } {
    // 1. Central Haat is market & gathering only
    if (this.currentLocation === 'central_haat') {
      return { allowed: false, reason: 'Building is prohibited at the Central Haat marketplace.' };
    }

    // 2. Out of placement chances
    if (!this.tileInventory.canPlaceTile()) {
      return { allowed: false, reason: 'No placement chances remaining. Complete 3-tile farms to earn bonus chances!' };
    }

    // 3. Visiting another player's island
    if (this.currentLocation !== this.selectedCulture) {
      const hostIsland = this.currentLocation as IndianState;
      const allianceCheck = this.alliances.hasActiveAlliance(this.multiplayer.localPlayerId, hostIsland);
      if (!allianceCheck.hasPermission) {
        return {
          allowed: false,
          reason: 'You are visiting an allied island! Request an alliance to build and farm here.'
        };
      }
    }

    return { allowed: true };
  }

  public isValidPlacement(q: number, r: number): boolean {
    const perm = this.canPlaceAtCurrentLocation();
    if (!perm.allowed) return false;

    if (this.terrain.getTileAt(q, r)) return false;
    for (const dir of HEX_DIRS) {
      const neighbor = this.terrain.getTileAt(q + dir.q, r + dir.r);
      if (neighbor) return true;
    }
    return false;
  }

  public evaluateMatch(q: number, r: number, def: TileDef, rotation: number): { matches: number; total: number } {
    let matches = 0;
    let total = 0;

    const edges = [...def.edges];
    const shift = rotation % 6;
    const rotated: string[] = [];
    for (let i = 0; i < 6; i++) {
      rotated.push(edges[(i - shift + 6) % 6]);
    }

    HEX_DIRS.forEach((dir, dirIdx) => {
      const neighbor = this.terrain.getTileAt(q + dir.q, r + dir.r);
      if (neighbor) {
        total++;
        const neighborEdges = this.terrain.getRotatedEdges(neighbor);
        const myEdge = rotated[dirIdx];
        const theirEdge = neighborEdges[OPPOSITE[dirIdx]];
        if (myEdge === theirEdge) {
          matches++;
        }
      }
    });

    return { matches, total };
  }

  public placeTile(q: number, r: number): {
    tile: PlacedTile;
    matches: number;
    coinsEarned: number;
    newFarms: CompletedFarm[];
    cropAwarded?: { crop: CropType; amount: number };
    bonusChancesRemaining: number;
  } | null {
    const perm = this.canPlaceAtCurrentLocation();
    if (!perm.allowed) return null;

    if (!this.isValidPlacement(q, r)) return null;

    if (!this.tileInventory.acquirePlacementLock()) return null;

    const def = this.getSelectedTile();
    if (!def) {
      this.tileInventory.releasePlacementLock();
      return null;
    }

    const { matches } = this.evaluateMatch(q, r, def, this.currentRotation);
    const tile: PlacedTile = {
      key: hexKey(q, r),
      q,
      r,
      defId: def.id,
      rotation: this.currentRotation,
      placedAt: Date.now()
    };

    this.terrain.setTile(tile);
    this.totalTilesPlaced++;

    // Consume active tile and exactly one placement chance
    const consumed = this.tileInventory.consumeActiveTile();
    if (!consumed) {
      return null;
    }

    // Broadcast tile placement over multiplayer room
    const targetIsland = (this.currentLocation === 'central_haat' ? this.selectedCulture : this.currentLocation) as IndianState;
    this.multiplayer.notifyTilePlaced(targetIsland, tile);

    // 3-Tile Farmland Matching & Farm Formation
    const newFarms = FarmDetectionSystem.detectNewFarms(this.terrain, new Set(this.registeredFarms.keys()));
    let cropAwarded: { crop: CropType; amount: number } | undefined = undefined;

    for (const farm of newFarms) {
      this.registeredFarms.set(farm.id, farm);

      // Award 3 units of regional crop
      const cropInfo = ISLAND_CROPS[targetIsland] || ISLAND_CROPS['bihar'];
      this.cropInventory.addHarvestedCrops(cropInfo.crop, GAME_START_CONFIG.farmCompletionCropsAwarded);
      farm.cropAwarded = cropInfo.crop;
      farm.rewardClaimed = true;
      cropAwarded = { crop: cropInfo.crop, amount: GAME_START_CONFIG.farmCompletionCropsAwarded };

      // Award 1 bonus tile + 1 bonus placement chance
      this.tileInventory.awardFarmBonus();

      // Broadcast farm completion over multiplayer room
      this.multiplayer.notifyFarmCompleted(targetIsland, farm);
    }

    // Base rewards
    const baseCoins = def.rarity === 'rare' ? 25 : 10;
    const matchBonus = matches * 8 + (matches >= 4 ? 20 : 0);
    let coinsEarned = baseCoins + matchBonus;

    // Apply Cultural Specialist Passives
    const cultureProfile = CULTURE_PROFILES[this.selectedCulture];
    const specialist = cultureProfile.specialist;

    if (specialist.abilityName === 'Living Patterns') {
      if (def.culturalTags.includes('craft') || def.culturalTags.includes('heritage')) {
        this.cultureScore += 25;
        coinsEarned += 12;
      }
    } else if (specialist.abilityName === 'Master Builder') {
      if (def.culturalTags.includes('stone') || def.culturalTags.includes('architecture')) {
        this.cultureScore += 20;
        coinsEarned += 15;
      }
    } else if (specialist.abilityName === 'Festival Creativity') {
      if (def.culturalTags.includes('festival') || def.culturalTags.includes('community')) {
        this.cultureScore += 30;
        coinsEarned += 10;
      }
    } else if (specialist.abilityName === 'Skilled Craftsmanship') {
      if (def.culturalTags.includes('wood') || def.culturalTags.includes('craft')) {
        this.cultureScore += 20;
        coinsEarned += 15;
      }
    } else if (specialist.abilityName === 'Water Stewardship') {
      if (def.culturalTags.includes('water')) {
        this.cultureScore += 25;
        this.inventory.water += 1;
        coinsEarned += 12;
      }
    }

    this.cropInventory.addCoins(coinsEarned);
    this.coins = this.cropInventory.getCoins();
    this.cultureScore += 10;

    // Progress cultural quest
    if (!this.activeQuest.completed) {
      if (this.activeQuest.goalType === 'place_building') {
        this.activeQuest.currentCount++;
        if (this.activeQuest.currentCount >= this.activeQuest.targetCount) {
          this.completeActiveQuest();
        }
      }
    }

    this.checkSynergies();
    if (this.totalTilesPlaced >= 4 && this.level === 1) this.level = 2;
    if (this.totalTilesPlaced >= 10 && this.level === 2) this.level = 3;

    // Persist current island modifications immediately
    this.saveIslandSnapshot(this.currentLocation);
    this.saveToStorage();

    return {
      tile,
      matches,
      coinsEarned,
      newFarms,
      cropAwarded,
      bonusChancesRemaining: this.tileInventory.getTotalPlacementChances()
    };
  }

  public completeActiveQuest(): void {
    if (this.activeQuest.completed) return;
    this.activeQuest.completed = true;
    this.cropInventory.addCoins(this.activeQuest.rewardCoins);
    this.coins = this.cropInventory.getCoins();
    this.cultureScore += this.activeQuest.rewardCultureScore;
    if (this.activeQuest.rewardResource) {
      this.inventory[this.activeQuest.rewardResource.kind] += this.activeQuest.rewardResource.amount;
    }
  }

  public checkSynergies(): void {
    const tiles = this.terrain.getAllTiles();
    for (const combo of COMBOS) {
      if (this.activeSynergies.includes(combo.id)) continue;

      for (const t1 of tiles) {
        const def1 = TILE_LIBRARY[t1.defId];
        if (def1 && def1.landmark === combo.a) {
          for (const dir of HEX_DIRS) {
            const t2 = this.terrain.getTileAt(t1.q + dir.q, t1.r + dir.r);
            if (t2) {
              const def2 = TILE_LIBRARY[t2.defId];
              if (def2 && def2.landmark === combo.b) {
                this.activeSynergies.push(combo.id);
                this.cropInventory.addCoins(combo.culture);
                this.coins = this.cropInventory.getCoins();
                this.cultureScore += combo.culture;
                break;
              }
            }
          }
        }
      }
    }
  }

  public triggerRandomEvent(): WorldEvent | null {
    if (this.activeEvent) return null;
    const tilesWithLandmarks = this.terrain.getAllTiles().filter((t) => !!TILE_LIBRARY[t.defId]?.landmark);
    if (tilesWithLandmarks.length === 0) return null;

    const targetTile = tilesWithLandmarks[Math.floor(Math.random() * tilesWithLandmarks.length)];
    targetTile.isDamaged = true;

    this.activeEvent = {
      id: `fire_${Date.now()}`,
      type: 'fire',
      title: 'Farmhouse Fire Hazard!',
      description: 'Smoke is rising! Enter exploration mode, collect water, and extinguish the flames.',
      targetTileKey: targetTile.key,
      resolved: false
    };

    return this.activeEvent;
  }

  public resolveActiveEvent(): boolean {
    if (!this.activeEvent) return false;
    const tile = this.terrain.getTile(this.activeEvent.targetTileKey);
    if (tile) {
      tile.isDamaged = false;
    }
    this.activeEvent.resolved = true;
    this.cropInventory.addCoins(40);
    this.coins = this.cropInventory.getCoins();
    this.cultureScore += 25;
    this.activeEvent = null;
    this.saveIslandSnapshot(this.currentLocation);
    this.saveToStorage();
    return true;
  }

  // =========================================================================
  // PERSISTENCE & SAVE/LOAD
  // =========================================================================

  public saveToStorage(): void {
    this.saveIslandSnapshot(this.currentLocation);

    const saveObj = {
      selectedCulture: this.selectedCulture,
      currentLocation: this.currentLocation,
      cultureScore: this.cultureScore,
      refills: this.refills,
      level: this.level,
      totalTilesPlaced: this.totalTilesPlaced,
      inventory: this.inventory,
      activeSynergies: this.activeSynergies,
      activeQuest: this.activeQuest,
      tileInventory: this.tileInventory.serialize(),
      cropInventory: this.cropInventory.serialize(),
      // Per-Island Authoritative Registry
      islands: Array.from(this.islands.entries()),
      // Legacy backward-compatibility fields
      tiles: this.terrain.getAllTiles(),
      registeredFarms: Array.from(this.registeredFarms.entries())
    };
    try {
      const key = this.roomId ? `cultural_islands_save_${this.roomId}` : 'cultural_islands_save_v1';
      localStorage.setItem(key, JSON.stringify(saveObj));
      if (!this.roomId || this.roomId === 'sangam_haat' || this.isSinglePlayer) {
        localStorage.setItem('cultural_islands_save_v1', JSON.stringify(saveObj));
      }
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  public static loadFromStorage(roomId?: string): WorldState | null {
    try {
      const key = roomId ? `cultural_islands_save_${roomId}` : 'cultural_islands_save_v1';
      let dataStr = localStorage.getItem(key);
      if (!dataStr && roomId) {
        dataStr = localStorage.getItem('cultural_islands_save_v1');
      }
      if (!dataStr) return null;
      const data = JSON.parse(dataStr);

      const isSingle = data.isSinglePlayer ?? (roomId === 'solo');
      const state = new WorldState(data.selectedCulture || 'bihar', roomId || data.roomId || 'sangam_haat', isSingle);
      state.cultureScore = data.cultureScore || 0;
      state.refills = data.refills || 5;
      state.level = data.level || 1;
      state.totalTilesPlaced = data.totalTilesPlaced || 0;
      if (data.currentLocation) state.currentLocation = data.currentLocation;
      if (data.inventory) state.inventory = data.inventory;
      if (data.activeSynergies) state.activeSynergies = data.activeSynergies;
      if (data.activeQuest) state.activeQuest = data.activeQuest;

      if (data.tileInventory) {
        state.tileInventory.deserialize(data.tileInventory);
      }
      if (data.cropInventory) {
        state.cropInventory.deserialize(data.cropInventory);
        state.coins = state.cropInventory.getCoins();
      }

      // Restore island-scoped records
      if (Array.isArray(data.islands) && data.islands.length > 0) {
        state.islands = new Map(data.islands);
      }

      // Restore active island terrain
      const locToLoad = state.currentLocation || state.selectedCulture;
      if (state.islands.has(locToLoad)) {
        state.loadIsland(locToLoad);
      } else if (Array.isArray(data.tiles) && data.tiles.length > 0) {
        // Legacy migration
        const legacyFarms = Array.isArray(data.registeredFarms)
          ? data.registeredFarms.map((item: any) => (Array.isArray(item) ? item[1] : item))
          : [];
        state.islands.set(state.selectedCulture, {
          destinationId: state.selectedCulture,
          tiles: data.tiles,
          registeredFarms: legacyFarms,
          lastVisited: Date.now()
        });
        state.loadIsland(locToLoad);
      } else {
        state.loadIsland(state.selectedCulture);
      }

      return state;
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      return null;
    }
  }
}

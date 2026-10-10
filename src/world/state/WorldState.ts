import { PlacedTile, TerrainField } from '../hex/TerrainField';
import { TileDef, TILE_LIBRARY, COMBOS, ComboDef, ResourceKind, drawableTiles, LandmarkKind } from '../data/tileLibrary';
import { HEX_DIRS, OPPOSITE, hexKey, parseKey } from '../hex/Hex';
import { IndianState, CulturalQuest } from '../culture/CultureTypes';
import { CULTURE_PROFILES } from '../culture/CultureRegistry';

export interface WorldEvent {
  id: string;
  type: 'fire' | 'festival' | 'market_day' | 'heavy_rain';
  title: string;
  description: string;
  targetTileKey: string;
  resolved: boolean;
}

export class WorldState {
  public selectedCulture: IndianState = 'bihar';
  public cultureScore: number = 0;
  public activeQuest: CulturalQuest;

  public terrain: TerrainField = new TerrainField();
  public hand: TileDef[] = [];
  public selectedIndex: number = 0;
  public currentRotation: number = 0; // 0..5

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

  constructor(culture: IndianState = 'bihar') {
    this.selectedCulture = culture;
    const profile = CULTURE_PROFILES[culture];

    // Apply culture starting resources
    this.coins = profile.startingResources.coins;
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

    this.initDefaultWorld();
    this.refillHand();
  }

  public initDefaultWorld(): void {
    this.terrain.clear();

    // 1. Center Landing start tile
    this.placeDirect(0, 0, 'start', 0);

    // 2. Cultural Starting Landmark Tile directly connected
    const stateTileMap: Record<IndianState, string> = {
      bihar: 'bihar_tile',
      maharashtra: 'maha_tile',
      west_bengal: 'bengal_tile',
      karnataka: 'karnataka_tile',
      gujarat: 'gujarat_tile',
      rajasthan: 'rajasthan_tile'
    };
    const startingTileId = stateTileMap[this.selectedCulture] || 'bihar_tile';
    this.placeDirect(1, 0, startingTileId, 0);

    // 3. Nearby treasure islet
    this.placeDirect(0, -3, 'islet', 0);
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

  public refillHand(): void {
    const pool = drawableTiles(this.level);
    this.hand = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      this.hand.push(pool[idx]);
    }
    this.selectedIndex = 0;
    this.currentRotation = 0;
  }

  public getSelectedTile(): TileDef | null {
    return this.hand[this.selectedIndex] || null;
  }

  public selectTile(index: number): void {
    if (index >= 0 && index < this.hand.length) {
      this.selectedIndex = index;
      this.currentRotation = 0;
    }
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

  public isValidPlacement(q: number, r: number): boolean {
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

  public placeTile(q: number, r: number): { tile: PlacedTile; matches: number; coinsEarned: number } | null {
    const def = this.getSelectedTile();
    if (!def || !this.isValidPlacement(q, r)) return null;

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

    // Remove placed tile from hand & draw new one
    this.hand.splice(this.selectedIndex, 1);
    if (this.hand.length === 0) {
      this.refillHand();
    } else {
      this.selectedIndex = Math.min(this.selectedIndex, this.hand.length - 1);
    }

    // Base rewards
    const baseCoins = def.rarity === 'rare' ? 25 : 10;
    const matchBonus = matches * 8 + (matches >= 4 ? 20 : 0);
    let coinsEarned = baseCoins + matchBonus;

    // --- APPLY SPECIALIST PASSIVE ABILITIES ---
    const cultureProfile = CULTURE_PROFILES[this.selectedCulture];
    const specialist = cultureProfile.specialist;

    if (specialist.abilityName === 'Living Patterns') {
      // Bihar: +25% culture score on craft tiles
      if (def.culturalTags.includes('craft') || def.culturalTags.includes('heritage')) {
        this.cultureScore += 25;
        coinsEarned += 12;
      }
    } else if (specialist.abilityName === 'Master Builder') {
      // Maharashtra: stone placement development bonus
      if (def.culturalTags.includes('stone') || def.culturalTags.includes('architecture')) {
        this.cultureScore += 20;
        coinsEarned += 15;
      }
    } else if (specialist.abilityName === 'Festival Creativity') {
      // West Bengal: festival structure bonus
      if (def.culturalTags.includes('festival') || def.culturalTags.includes('community')) {
        this.cultureScore += 30;
        coinsEarned += 10;
      }
    } else if (specialist.abilityName === 'Skilled Craftsmanship') {
      // Karnataka: woodworking bonus
      if (def.culturalTags.includes('wood') || def.culturalTags.includes('craft')) {
        this.cultureScore += 20;
        coinsEarned += 15;
      }
    } else if (specialist.abilityName === 'Water Stewardship') {
      // Rajasthan: water task resilience bonus
      if (def.culturalTags.includes('water')) {
        this.cultureScore += 25;
        this.inventory.water += 1;
        coinsEarned += 12;
      }
    }

    this.coins += coinsEarned;
    this.cultureScore += 10;

    // --- PROGRESS ACTIVE CULTURAL QUEST ---
    if (!this.activeQuest.completed) {
      if (this.activeQuest.goalType === 'place_building') {
        this.activeQuest.currentCount++;
        if (this.activeQuest.currentCount >= this.activeQuest.targetCount) {
          this.completeActiveQuest();
        }
      }
    }

    // Check synergies & level progression
    this.checkSynergies();
    if (this.totalTilesPlaced >= 4 && this.level === 1) this.level = 2;
    if (this.totalTilesPlaced >= 10 && this.level === 2) this.level = 3;

    // Save game state automatically
    this.saveToStorage();

    return { tile, matches, coinsEarned };
  }

  public completeActiveQuest(): void {
    if (this.activeQuest.completed) return;
    this.activeQuest.completed = true;
    this.coins += this.activeQuest.rewardCoins;
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
                this.coins += combo.culture;
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
    const tilesWithLandmarks = this.terrain.getAllTiles().filter(t => !!TILE_LIBRARY[t.defId]?.landmark);
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
    this.coins += 40;
    this.cultureScore += 25;
    this.activeEvent = null;
    this.saveToStorage();
    return true;
  }

  // =========================================================================
  // PERSISTENCE & SAVE/LOAD
  // =========================================================================

  public saveToStorage(): void {
    const saveObj = {
      selectedCulture: this.selectedCulture,
      cultureScore: this.cultureScore,
      coins: this.coins,
      refills: this.refills,
      level: this.level,
      totalTilesPlaced: this.totalTilesPlaced,
      inventory: this.inventory,
      activeSynergies: this.activeSynergies,
      activeQuest: this.activeQuest,
      tiles: this.terrain.getAllTiles()
    };
    try {
      localStorage.setItem('cultural_islands_save_v1', JSON.stringify(saveObj));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  public static loadFromStorage(): WorldState | null {
    try {
      const dataStr = localStorage.getItem('cultural_islands_save_v1');
      if (!dataStr) return null;
      const data = JSON.parse(dataStr);

      const state = new WorldState(data.selectedCulture || 'bihar');
      state.cultureScore = data.cultureScore || 0;
      state.coins = data.coins || 420;
      state.refills = data.refills || 5;
      state.level = data.level || 1;
      state.totalTilesPlaced = data.totalTilesPlaced || 0;
      if (data.inventory) state.inventory = data.inventory;
      if (data.activeSynergies) state.activeSynergies = data.activeSynergies;
      if (data.activeQuest) state.activeQuest = data.activeQuest;

      if (Array.isArray(data.tiles)) {
        state.terrain.clear();
        for (const t of data.tiles) {
          state.terrain.setTile(t);
        }
      }
      return state;
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      return null;
    }
  }
}

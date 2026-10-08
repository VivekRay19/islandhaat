import { PlacedTile, TerrainField } from '../hex/TerrainField';
import { TileDef, TILE_LIBRARY, COMBOS, ComboDef, ResourceKind, drawableTiles, LandmarkKind } from '../data/tileLibrary';
import { HEX_DIRS, OPPOSITE, hexKey, parseKey } from '../hex/Hex';

export interface WorldEvent {
  id: string;
  type: 'fire' | 'festival' | 'market_day' | 'heavy_rain';
  title: string;
  description: string;
  targetTileKey: string;
  resolved: boolean;
}

export class WorldState {
  public terrain: TerrainField = new TerrainField();
  public hand: TileDef[] = [];
  public selectedIndex: number = 0;
  public currentRotation: number = 0; // 0..5

  public coins: number = 0;
  public refills: number = 5;
  public level: number = 1;
  public totalTilesPlaced: number = 0;

  public inventory: Record<ResourceKind, number> = {
    grain: 3,
    wood: 2,
    fibre: 1,
    clay: 1,
    stone: 1,
    water: 2,
    music: 1
  };

  public activeSynergies: string[] = [];
  public activeEvent: WorldEvent | null = null;
  public hasOpenedChest: boolean = false;

  constructor() {
    this.initDefaultWorld();
    this.refillHand();
  }

  public initDefaultWorld(): void {
    this.terrain.clear();
    // Starting island matching reference composition:
    // Center start tile
    this.placeDirect(0, 0, 'start', 0);
    // Nearby treasure islet
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
      // Don't expand adjacent to isolated treasure islet until bridged
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

    // Shift edges by rotation
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

    // Coin rewards based on matches & tile value
    const baseCoins = def.rarity === 'rare' ? 25 : 10;
    const matchBonus = matches * 8 + (matches >= 4 ? 20 : 0);
    const coinsEarned = baseCoins + matchBonus;
    this.coins += coinsEarned;

    // Check synergies
    this.checkSynergies();

    // Check level progression
    if (this.totalTilesPlaced >= 4 && this.level === 1) this.level = 2;
    if (this.totalTilesPlaced >= 10 && this.level === 2) this.level = 3;

    return { tile, matches, coinsEarned };
  }

  public checkSynergies(): void {
    const tiles = this.terrain.getAllTiles();
    for (const combo of COMBOS) {
      if (this.activeSynergies.includes(combo.id)) continue;

      // Search if both landmarks are adjacent
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
    this.activeEvent = null;
    return true;
  }
}

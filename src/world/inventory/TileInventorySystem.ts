import { CoreTileType, CORE_TILE_TYPES, GAME_START_CONFIG } from '../farming/CropConfig';

export interface TileInventoryState {
  tileQueue: CoreTileType[];
  activeTile: CoreTileType | null;
  initialPlacementChances: number;
  bonusPlacementChances: number;
  totalTilesPlaced: number;
}

export class TileInventorySystem {
  private tileQueue: CoreTileType[] = [];
  private activeTile: CoreTileType | null = null;
  private initialPlacementChances: number = GAME_START_CONFIG.initialPlacementChances;
  private bonusPlacementChances: number = 0;
  private totalTilesPlaced: number = 0;
  private isPlacingLock: boolean = false;

  constructor(savedState?: Partial<TileInventoryState>) {
    if (savedState && savedState.activeTile !== undefined) {
      this.deserialize(savedState);
    } else {
      this.initializeNewGame();
    }
  }

  /**
   * Initializes starting state: 7 random tiles, 9 initial placement chances, 0 bonus chances.
   */
  public initializeNewGame(
    queueSize: number = GAME_START_CONFIG.initialTileQueueSize,
    placementChances: number = GAME_START_CONFIG.initialPlacementChances
  ): void {
    this.tileQueue = [];
    this.initialPlacementChances = placementChances;
    this.bonusPlacementChances = 0;
    this.totalTilesPlaced = 0;
    this.isPlacingLock = false;

    // Draw random tiles from the 6 core types
    for (let i = 0; i < queueSize; i++) {
      this.tileQueue.push(this.drawRandomCoreTile());
    }

    // Set the first tile as the active tile (hidden future draws remain in tileQueue)
    this.activeTile = this.tileQueue.shift() || this.drawRandomCoreTile();
  }

  /**
   * Draws a single random tile from the 6 core types.
   */
  public drawRandomCoreTile(): CoreTileType {
    const idx = Math.floor(Math.random() * CORE_TILE_TYPES.length);
    return CORE_TILE_TYPES[idx];
  }

  /**
   * Returns only the currently active tile. Future draws are concealed.
   */
  public getActiveTile(): CoreTileType | null {
    return this.activeTile;
  }

  /**
   * Returns remaining initial placement chances (out of 9).
   */
  public getInitialPlacementChances(): number {
    return this.initialPlacementChances;
  }

  /**
   * Returns bonus placement chances earned from completed farms.
   */
  public getBonusPlacementChances(): number {
    return this.bonusPlacementChances;
  }

  /**
   * Returns total usable placement chances (initial + bonus).
   */
  public getTotalPlacementChances(): number {
    return this.initialPlacementChances + this.bonusPlacementChances;
  }

  /**
   * Returns total count of tiles in queue + active tile.
   */
  public getRemainingTileCount(): number {
    return (this.activeTile ? 1 : 0) + this.tileQueue.length;
  }

  /**
   * Checks whether the player can legally place a tile right now.
   */
  public canPlaceTile(): boolean {
    return this.getTotalPlacementChances() > 0 && this.activeTile !== null && !this.isPlacingLock;
  }

  /**
   * Concurrency lock: prevents rapid repeated clicks from duplicating placements.
   */
  public acquirePlacementLock(): boolean {
    if (this.isPlacingLock || !this.canPlaceTile()) return false;
    this.isPlacingLock = true;
    return true;
  }

  public releasePlacementLock(): void {
    this.isPlacingLock = false;
  }

  /**
   * Consumes the active tile and exactly one placement chance upon verified placement.
   */
  public consumeActiveTile(): {
    placedTile: CoreTileType;
    remainingInitial: number;
    remainingBonus: number;
    nextTile: CoreTileType | null;
  } | null {
    if (!this.activeTile || this.getTotalPlacementChances() <= 0) {
      this.isPlacingLock = false;
      return null;
    }

    const placedTile = this.activeTile;

    // Deduct placement chance: consume initial chances first, then bonus
    if (this.initialPlacementChances > 0) {
      this.initialPlacementChances--;
    } else if (this.bonusPlacementChances > 0) {
      this.bonusPlacementChances--;
    }

    this.totalTilesPlaced++;

    // Draw the next tile from the queue if chances remain
    if (this.getTotalPlacementChances() > 0) {
      if (this.tileQueue.length > 0) {
        this.activeTile = this.tileQueue.shift()!;
      } else {
        // If queue is exhausted but placement chances remain, draw a fresh tile
        this.activeTile = this.drawRandomCoreTile();
      }
    } else {
      this.activeTile = null;
    }

    this.isPlacingLock = false;

    return {
      placedTile,
      remainingInitial: this.initialPlacementChances,
      remainingBonus: this.bonusPlacementChances,
      nextTile: this.activeTile
    };
  }

  /**
   * Awards +1 bonus tile and +1 bonus placement opportunity from a completed farm.
   */
  public awardFarmBonus(): {
    bonusTile: CoreTileType;
    newBonusChances: number;
  } {
    const bonusTile = this.drawRandomCoreTile();

    // Award bonus chance
    this.bonusPlacementChances += GAME_START_CONFIG.farmCompletionBonusChancesAwarded;

    // If activeTile was empty, immediately promote bonusTile to activeTile
    if (!this.activeTile) {
      this.activeTile = bonusTile;
    } else {
      this.tileQueue.push(bonusTile);
    }

    return {
      bonusTile,
      newBonusChances: this.bonusPlacementChances
    };
  }

  public serialize(): TileInventoryState {
    return {
      tileQueue: [...this.tileQueue],
      activeTile: this.activeTile,
      initialPlacementChances: this.initialPlacementChances,
      bonusPlacementChances: this.bonusPlacementChances,
      totalTilesPlaced: this.totalTilesPlaced
    };
  }

  public deserialize(data: Partial<TileInventoryState>): void {
    if (Array.isArray(data.tileQueue)) this.tileQueue = [...data.tileQueue];
    if (data.activeTile !== undefined) this.activeTile = data.activeTile;
    if (typeof data.initialPlacementChances === 'number') this.initialPlacementChances = data.initialPlacementChances;
    if (typeof data.bonusPlacementChances === 'number') this.bonusPlacementChances = data.bonusPlacementChances;
    if (typeof data.totalTilesPlaced === 'number') this.totalTilesPlaced = data.totalTilesPlaced;
    this.isPlacingLock = false;
  }
}

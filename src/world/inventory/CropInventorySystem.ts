import { CropType, MARKET_PRICES, ISLAND_CROPS } from '../farming/CropConfig';

export type CropInventory = Record<CropType, number>;

export class CropInventorySystem {
  private crops: CropInventory = {
    makhana: 0,
    wheat: 0,
    jute: 0,
    rice: 0,
    cotton: 0,
    bajra: 0
  };
  private coins: number = 420;

  constructor(initialCrops?: Partial<CropInventory>, initialCoins = 420) {
    if (initialCrops) {
      this.crops = { ...this.crops, ...initialCrops };
    }
    this.coins = initialCoins;
  }

  public getCrops(): CropInventory {
    return { ...this.crops };
  }

  public getCropQuantity(crop: CropType): number {
    return this.crops[crop] || 0;
  }

  public getCoins(): number {
    return this.coins;
  }

  /**
   * Adds harvested crops directly to storage. Does NOT automatically sell them.
   */
  public addHarvestedCrops(crop: CropType, amount: number): { crop: CropType; amount: number; newTotal: number } {
    if (amount <= 0) return { crop, amount: 0, newTotal: this.crops[crop] };
    this.crops[crop] = (this.crops[crop] || 0) + amount;
    return {
      crop,
      amount,
      newTotal: this.crops[crop]
    };
  }

  /**
   * Performs an authoritative sale transaction of crops for coins.
   * Validates quantity on server/authoritative state and prevents negative balances.
   */
  public sellCrops(
    crop: CropType,
    quantity: number
  ): { success: boolean; coinsEarned: number; remaining: number; error?: string } {
    if (quantity <= 0) {
      return { success: false, coinsEarned: 0, remaining: this.crops[crop], error: 'Invalid quantity' };
    }

    const available = this.crops[crop] || 0;
    if (quantity > available) {
      return {
        success: false,
        coinsEarned: 0,
        remaining: available,
        error: `Insufficient ${crop}: have ${available}, requested ${quantity}`
      };
    }

    const unitPrice = MARKET_PRICES[crop] || 10;
    const coinsEarned = quantity * unitPrice;

    // Transactional state mutation
    this.crops[crop] -= quantity;
    this.coins += coinsEarned;

    return {
      success: true,
      coinsEarned,
      remaining: this.crops[crop]
    };
  }

  public addCoins(amount: number): number {
    if (amount > 0) this.coins += amount;
    return this.coins;
  }

  public deductCoins(amount: number): boolean {
    if (amount > this.coins) return false;
    this.coins -= amount;
    return true;
  }

  public serialize(): { crops: CropInventory; coins: number } {
    return {
      crops: { ...this.crops },
      coins: this.coins
    };
  }

  public deserialize(data: { crops?: Partial<CropInventory>; coins?: number }): void {
    if (data.crops) {
      this.crops = { ...this.crops, ...data.crops };
    }
    if (typeof data.coins === 'number') {
      this.coins = data.coins;
    }
  }
}

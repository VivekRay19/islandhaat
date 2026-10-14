import { CropType, MARKET_PRICES, ISLAND_CROPS } from '../farming/CropConfig';
import { CropInventorySystem } from '../inventory/CropInventorySystem';

export interface MarketTransactionResult {
  success: boolean;
  crop: CropType;
  quantitySold: number;
  unitPrice: number;
  coinsEarned: number;
  newCropBalance: number;
  newCoinBalance: number;
  error?: string;
}

export class CentralHaatSystem {
  private cropInventory: CropInventorySystem;
  private isProcessingTransaction: boolean = false;

  constructor(cropInventory: CropInventorySystem) {
    this.cropInventory = cropInventory;
  }

  /**
   * Authoritatively executes a crop sale at the Central Haat.
   * Enforces server-side price lookup, prevents double-submission, and checks quantity bounds.
   */
  public executeCropSale(crop: CropType, requestedQuantity: number): MarketTransactionResult {
    if (this.isProcessingTransaction) {
      return {
        success: false,
        crop,
        quantitySold: 0,
        unitPrice: MARKET_PRICES[crop] || 0,
        coinsEarned: 0,
        newCropBalance: this.cropInventory.getCropQuantity(crop),
        newCoinBalance: this.cropInventory.getCoins(),
        error: 'A market transaction is currently being processed. Please wait.'
      };
    }

    if (!requestedQuantity || requestedQuantity <= 0 || !Number.isInteger(requestedQuantity)) {
      return {
        success: false,
        crop,
        quantitySold: 0,
        unitPrice: MARKET_PRICES[crop] || 0,
        coinsEarned: 0,
        newCropBalance: this.cropInventory.getCropQuantity(crop),
        newCoinBalance: this.cropInventory.getCoins(),
        error: 'Invalid sale quantity requested.'
      };
    }

    const available = this.cropInventory.getCropQuantity(crop);
    if (requestedQuantity > available) {
      return {
        success: false,
        crop,
        quantitySold: 0,
        unitPrice: MARKET_PRICES[crop] || 0,
        coinsEarned: 0,
        newCropBalance: available,
        newCoinBalance: this.cropInventory.getCoins(),
        error: `Cannot sell ${requestedQuantity} ${crop}: you only have ${available} in storage.`
      };
    }

    this.isProcessingTransaction = true;

    try {
      const res = this.cropInventory.sellCrops(crop, requestedQuantity);
      this.isProcessingTransaction = false;

      if (!res.success) {
        return {
          success: false,
          crop,
          quantitySold: 0,
          unitPrice: MARKET_PRICES[crop] || 0,
          coinsEarned: 0,
          newCropBalance: this.cropInventory.getCropQuantity(crop),
          newCoinBalance: this.cropInventory.getCoins(),
          error: res.error || 'Transaction failed.'
        };
      }

      return {
        success: true,
        crop,
        quantitySold: requestedQuantity,
        unitPrice: MARKET_PRICES[crop],
        coinsEarned: res.coinsEarned,
        newCropBalance: res.remaining,
        newCoinBalance: this.cropInventory.getCoins()
      };
    } catch (e: any) {
      this.isProcessingTransaction = false;
      return {
        success: false,
        crop,
        quantitySold: 0,
        unitPrice: MARKET_PRICES[crop] || 0,
        coinsEarned: 0,
        newCropBalance: this.cropInventory.getCropQuantity(crop),
        newCoinBalance: this.cropInventory.getCoins(),
        error: e.message || 'Unexpected transaction error.'
      };
    }
  }

  public getMarketPrices(): Record<CropType, number> {
    return { ...MARKET_PRICES };
  }
}

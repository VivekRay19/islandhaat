import { IndianState } from '../culture/CultureTypes';

export type CoreTileType = 'farmland' | 'meadow' | 'forest' | 'mountain' | 'water' | 'coastal';

export const CORE_TILE_TYPES: CoreTileType[] = [
  'farmland',
  'meadow',
  'forest',
  'mountain',
  'water',
  'coastal'
];

export const CORE_TILE_METADATA: Record<CoreTileType, { name: string; emoji: string; description: string }> = {
  farmland: {
    name: 'Farmland',
    emoji: '🌾',
    description: 'Tilled fertile soil. Connect 3 Farmlands to form a unified farm that yields 3 regional crops!'
  },
  meadow: {
    name: 'Meadow',
    emoji: '🌸',
    description: 'Open grassland dotted with vibrant regional wildflowers.'
  },
  forest: {
    name: 'Forest',
    emoji: '🌲',
    description: 'Dense indigenous woodland providing shade, timber, and biodiversity.'
  },
  mountain: {
    name: 'Mountain',
    emoji: '⛰️',
    description: 'Elevated rocky highlands and rugged stone strata.'
  },
  water: {
    name: 'Water',
    emoji: '💧',
    description: 'Deep tranquil river channels and fresh island lakes.'
  },
  coastal: {
    name: 'Coastal',
    emoji: '🏖️',
    description: 'Sandy shores and gentle surf where the island meets the sea.'
  }
};

export type CropType = 'makhana' | 'wheat' | 'jute' | 'rice' | 'cotton' | 'bajra';

export interface CropInfo {
  crop: CropType;
  displayName: string;
  emoji: string;
  marketPrice: number; // Base coin value per crop at Central Haat
  description: string;
}

export const ISLAND_CROPS: Record<IndianState, CropInfo> = {
  bihar: {
    crop: 'makhana',
    displayName: 'Mithila Makhana',
    emoji: '⚪',
    marketPrice: 20,
    description: 'Prized aquatic fox nuts cultivated in sacred Mithila village ponds.'
  },
  maharashtra: {
    crop: 'wheat',
    displayName: 'Sahyadri Wheat',
    emoji: '🌾',
    marketPrice: 12,
    description: 'Golden high-protein wheat harvested from the sunny Deccan plateau.'
  },
  west_bengal: {
    crop: 'jute',
    displayName: 'Bengal Golden Jute',
    emoji: '🌿',
    marketPrice: 14,
    description: 'Strong, glossy natural fibre harvested along the fertile Gangetic delta wetlands.'
  },
  karnataka: {
    crop: 'rice',
    displayName: 'Sona Masoori Rice',
    emoji: '🍚',
    marketPrice: 15,
    description: 'Aromatic, fine paddy rice grown along the Krishna and Tungabhadra valleys.'
  },
  gujarat: {
    crop: 'cotton',
    displayName: 'Gujarat Cotton',
    emoji: '☁️',
    marketPrice: 18,
    description: 'Pure white long-staple cotton essential for Gujarat’s legendary handloom weavers.'
  },
  rajasthan: {
    crop: 'bajra',
    displayName: 'Marwar Bajra',
    emoji: '🌾',
    marketPrice: 10,
    description: 'Hearty, drought-resilient pearl millet cherished across the Thar desert.'
  }
};

export const MARKET_PRICES: Record<CropType, number> = {
  makhana: 20,
  wheat: 12,
  jute: 14,
  rice: 15,
  cotton: 18,
  bajra: 10
};

export const GAME_START_CONFIG = {
  initialTileQueueSize: 7,          // 7 random starting tiles
  initialPlacementChances: 9,       // 9 placement chances
  farmCompletionCropsAwarded: 3,    // 3 crops per farm
  farmCompletionBonusTilesAwarded: 1, // 1 bonus random tile per farm
  farmCompletionBonusChancesAwarded: 1 // 1 bonus placement chance per farm
};

export const ALLIANCE_CONFIG = {
  durationSeconds: 180, // 3 minutes of temporary island modification & farming
  maxPendingTimeSeconds: 60
};

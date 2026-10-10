import { ResourceKind } from '../data/tileLibrary';

export type IndianState = 'bihar' | 'maharashtra' | 'west_bengal' | 'karnataka' | 'gujarat' | 'rajasthan';

export interface SpecialistProfile {
  id: string;
  name: string;
  state: IndianState;
  roleTitle: string;
  signatureTool: string;
  tagline: string;
  biography: string;
  abilityName: string;
  abilityDescription: string;
  passiveBonusText: string;
  iconSvg: string;
}

export interface CulturalQuest {
  id: string;
  state: IndianState;
  title: string;
  subtitle: string;
  description: string;
  goalType: 'place_building' | 'connect_path' | 'trade_haat' | 'harvest_resource' | 'cultural_score';
  targetCount: number;
  currentCount: number;
  targetTag?: string;
  rewardText: string;
  rewardCoins: number;
  rewardCultureScore: number;
  rewardResource?: { kind: ResourceKind; amount: number };
  completed: boolean;
}

export interface CrossStateTradeGood {
  id: string;
  originState: IndianState;
  name: string;
  description: string;
  costCoins: number;
  requiredResource: { kind: ResourceKind; amount: number };
  unlockedDecoration: string;
  cultureBonus: number;
}

export interface CultureProfile {
  id: IndianState;
  stateName: string;
  displayName: string;
  regionTitle: string;
  tagline: string;
  overview: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    terrainTone: number; // Hex color for 3D grass/ground
    rockTone: number;    // Hex color for 3D cliffs/stone
    roofTone: number;    // Hex color for 3D architecture roofs
  };
  startingResources: Record<ResourceKind, number> & { coins: number };
  signatureCrafts: string[];
  signatureStructures: string[];
  specialist: SpecialistProfile;
  quests: CulturalQuest[];
  crossTradeItems: CrossStateTradeGood[];
  initialTileLandmark: string;
}

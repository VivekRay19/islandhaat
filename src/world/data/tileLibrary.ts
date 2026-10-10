// Data-driven tile library for the 3D island.
// Rendering reads these definitions; nothing here knows about meshes.

export type Terrain = 'grass' | 'forest' | 'field' | 'water' | 'stone' | 'village';

export type ResourceKind = 'grain' | 'wood' | 'fibre' | 'clay' | 'stone' | 'water' | 'music';

export type LandmarkKind =
  | 'farmhouse'
  | 'houses'
  | 'weaving_hut'
  | 'pottery'
  | 'lumber_camp'
  | 'quarry'
  | 'haat'
  | 'pavilion'
  | 'shrine'
  | 'bihar_workshop'
  | 'bihar_sikki'
  | 'bihar_pond'
  | 'maha_watchtower'
  | 'maha_wada'
  | 'maha_gateway'
  | 'maha_paithani'
  | 'maha_warli'
  | 'maha_cistern'
  | 'bengal_pandal'
  | 'bengal_jorbangla'
  | 'bengal_baluchari'
  | 'bengal_ghat'
  | 'karnataka_toy_shop'
  | 'karnataka_mysore'
  | 'karnataka_yakshagana'
  | 'gujarat_textile'
  | 'gujarat_stepwell'
  | 'gujarat_bandhani'
  | 'rajasthan_haveli'
  | 'rajasthan_bluepottery'
  | 'rajasthan_kathputli';

export interface Production {
  resource: ResourceKind | 'coins';
  amount: number;
  every: number; // seconds
}

export interface TileDef {
  id: string;
  name: string;
  /** Six edges in base orientation: E, NE, NW, W, SW, SE. */
  edges: [Terrain, Terrain, Terrain, Terrain, Terrain, Terrain];
  landmark?: LandmarkKind;
  produces?: Production;
  culturalTags: string[];
  rarity: 'common' | 'rare';
  unlockLevel: number;
  weight: number;
  description: string;
  /** Hidden tiles are never drawn into the hand (start tile, treasure islet). */
  hidden?: boolean;
}

const T = (
  e: [Terrain, Terrain, Terrain, Terrain, Terrain, Terrain]
): [Terrain, Terrain, Terrain, Terrain, Terrain, Terrain] => e;

export const TILE_LIBRARY: Record<string, TileDef> = {
  start: {
    id: 'start',
    name: 'Landing',
    edges: T(['grass', 'grass', 'grass', 'grass', 'grass', 'grass']),
    culturalTags: [],
    rarity: 'common',
    unlockLevel: 1,
    weight: 0,
    description: 'Where your island began.',
    hidden: true
  },
  islet: {
    id: 'islet',
    name: 'Treasure Islet',
    edges: T(['stone', 'stone', 'grass', 'grass', 'grass', 'grass']),
    culturalTags: [],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 0,
    description: 'A lonely rock with something shiny on it.',
    hidden: true
  },
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    edges: T(['grass', 'grass', 'grass', 'grass', 'grass', 'grass']),
    culturalTags: ['nature'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 2,
    description: 'Open grassland with wildflowers.'
  },
  grove: {
    id: 'grove',
    name: 'Grove',
    edges: T(['forest', 'forest', 'forest', 'grass', 'grass', 'grass']),
    produces: { resource: 'wood', amount: 1, every: 24 },
    culturalTags: ['nature'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 2.6,
    description: 'Half woodland, half meadow.'
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    edges: T(['forest', 'forest', 'forest', 'forest', 'forest', 'forest']),
    produces: { resource: 'wood', amount: 1, every: 16 },
    culturalTags: ['nature'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 1.6,
    description: 'Dense trees — joins neighbouring forests into one woodland.'
  },
  farm: {
    id: 'farm',
    name: 'Farm',
    edges: T(['field', 'field', 'grass', 'grass', 'grass', 'field']),
    landmark: 'farmhouse',
    produces: { resource: 'grain', amount: 2, every: 18 },
    culturalTags: ['agriculture'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 2,
    description: 'A thatched farmhouse with golden fields.'
  },
  fields: {
    id: 'fields',
    name: 'Fields',
    edges: T(['field', 'field', 'field', 'field', 'grass', 'grass']),
    produces: { resource: 'grain', amount: 1, every: 20 },
    culturalTags: ['agriculture'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 1.6,
    description: 'Rows of ripening grain.'
  },
  river: {
    id: 'river',
    name: 'River',
    edges: T(['water', 'grass', 'grass', 'water', 'grass', 'grass']),
    produces: { resource: 'water', amount: 1, every: 22 },
    culturalTags: ['water'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 1.6,
    description: 'A straight river — connect water edges to make it flow.'
  },
  stream: {
    id: 'stream',
    name: 'Stream',
    edges: T(['water', 'grass', 'water', 'grass', 'grass', 'grass']),
    produces: { resource: 'water', amount: 1, every: 24 },
    culturalTags: ['water'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 1.2,
    description: 'A bending stream.'
  },
  hill: {
    id: 'hill',
    name: 'Hill',
    edges: T(['stone', 'stone', 'grass', 'grass', 'grass', 'forest']),
    produces: { resource: 'stone', amount: 1, every: 24 },
    culturalTags: ['nature'],
    rarity: 'common',
    unlockLevel: 1,
    weight: 1.4,
    description: 'Rocky highland.'
  },
  lumber: {
    id: 'lumber',
    name: 'Lumber',
    edges: T(['forest', 'forest', 'forest', 'forest', 'grass', 'grass']),
    landmark: 'lumber_camp',
    produces: { resource: 'wood', amount: 2, every: 14 },
    culturalTags: ['wood', 'craft'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 0.55,
    description: 'A woodcutter’s cabin with stacked logs.'
  },
  lake: {
    id: 'lake',
    name: 'Lake',
    edges: T(['water', 'water', 'grass', 'water', 'grass', 'grass']),
    produces: { resource: 'water', amount: 1, every: 18 },
    culturalTags: ['water'],
    rarity: 'common',
    unlockLevel: 2,
    weight: 1,
    description: 'Three waterways meet in a pool.'
  },
  quarry: {
    id: 'quarry',
    name: 'Quarry',
    edges: T(['stone', 'stone', 'stone', 'grass', 'grass', 'stone']),
    landmark: 'quarry',
    produces: { resource: 'stone', amount: 2, every: 18 },
    culturalTags: ['stone', 'architecture'],
    rarity: 'common',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Cut stone blocks and a wooden crane.'
  },
  village: {
    id: 'village',
    name: 'Village',
    edges: T(['village', 'grass', 'grass', 'village', 'grass', 'grass']),
    landmark: 'houses',
    produces: { resource: 'coins', amount: 3, every: 20 },
    culturalTags: ['community'],
    rarity: 'common',
    unlockLevel: 2,
    weight: 1.5,
    description: 'Terracotta-roofed homes around a well.'
  },
  lanes: {
    id: 'lanes',
    name: 'Lanes',
    edges: T(['village', 'grass', 'village', 'grass', 'village', 'grass']),
    produces: { resource: 'coins', amount: 1, every: 24 },
    culturalTags: ['community'],
    rarity: 'common',
    unlockLevel: 2,
    weight: 1,
    description: 'Footpaths with cottages and lanterns.'
  },
  weaving: {
    id: 'weaving',
    name: 'Weaving Hut',
    edges: T(['village', 'grass', 'grass', 'grass', 'field', 'grass']),
    landmark: 'weaving_hut',
    produces: { resource: 'fibre', amount: 2, every: 20 },
    culturalTags: ['textile', 'craft'],
    rarity: 'common',
    unlockLevel: 2,
    weight: 1,
    description: 'A round hut with a handloom and drying cloth.'
  },
  pottery: {
    id: 'pottery',
    name: 'Pottery',
    edges: T(['water', 'grass', 'grass', 'village', 'grass', 'grass']),
    landmark: 'pottery',
    produces: { resource: 'clay', amount: 2, every: 20 },
    culturalTags: ['clay', 'craft'],
    rarity: 'common',
    unlockLevel: 2,
    weight: 1,
    description: 'A potter’s workshop with a brick kiln.'
  },
  haat: {
    id: 'haat',
    name: 'Haat',
    edges: T(['village', 'village', 'grass', 'village', 'village', 'grass']),
    landmark: 'haat',
    produces: { resource: 'coins', amount: 4, every: 18 },
    culturalTags: ['trade', 'community'],
    rarity: 'common',
    unlockLevel: 3,
    weight: 0.8,
    description: 'The village market — walk in and trade at the stalls.'
  },
  pavilion: {
    id: 'pavilion',
    name: 'Pavilion',
    edges: T(['grass', 'village', 'grass', 'grass', 'village', 'grass']),
    landmark: 'pavilion',
    produces: { resource: 'music', amount: 1, every: 20 },
    culturalTags: ['music', 'festival'],
    rarity: 'common',
    unlockLevel: 3,
    weight: 0.8,
    description: 'An open music pavilion for festivals.'
  },
  sacred_grove: {
    id: 'sacred_grove',
    name: 'Sacred Grove',
    edges: T(['village', 'forest', 'forest', 'forest', 'forest', 'forest']),
    landmark: 'shrine',
    culturalTags: ['heritage', 'nature'],
    rarity: 'rare',
    unlockLevel: 3,
    weight: 0.4,
    description: 'An old banyan sheltering a small stone shrine.'
  },
  bihar_tile: {
    id: 'bihar_tile',
    name: 'Mithila Workshop',
    edges: T(['grass', 'field', 'village', 'village', 'grass', 'grass']),
    landmark: 'bihar_workshop',
    produces: { resource: 'fibre', amount: 3, every: 16 },
    culturalTags: ['craft', 'heritage', 'bihar'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.2,
    description: 'Earthen walls adorned with traditional Madhubani painted murals and golden Sikki grass crafts.'
  },
  maha_tile: {
    id: 'maha_tile',
    name: 'Sahyadri Watchtower',
    edges: T(['stone', 'stone', 'village', 'stone', 'grass', 'grass']),
    landmark: 'maha_watchtower',
    produces: { resource: 'stone', amount: 3, every: 16 },
    culturalTags: ['architecture', 'stone', 'maharashtra'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.2,
    description: 'A fortified basalt watchtower inspired by Western Ghat hill bastions and Paithani handlooms.'
  },
  bengal_tile: {
    id: 'bengal_tile',
    name: 'Festival Pandal',
    edges: T(['village', 'water', 'village', 'grass', 'grass', 'water']),
    landmark: 'bengal_pandal',
    produces: { resource: 'music', amount: 3, every: 16 },
    culturalTags: ['festival', 'community', 'west_bengal'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.2,
    description: 'A celebratory festival gathering pavilion with terracotta reliefs and floral festoons.'
  },
  karnataka_tile: {
    id: 'karnataka_tile',
    name: 'Channapatna Studio',
    edges: T(['forest', 'village', 'forest', 'grass', 'stone', 'grass']),
    landmark: 'karnataka_toy_shop',
    produces: { resource: 'wood', amount: 3, every: 16 },
    culturalTags: ['wood', 'craft', 'karnataka'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.2,
    description: 'Lacquered wooden toy lathe studio flanked by Hampi monolithic carved granite pillars.'
  },
  gujarat_tile: {
    id: 'gujarat_tile',
    name: 'Patola Bazaar',
    edges: T(['village', 'water', 'village', 'village', 'grass', 'water']),
    landmark: 'gujarat_textile',
    produces: { resource: 'coins', amount: 5, every: 16 },
    culturalTags: ['trade', 'textile', 'gujarat'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.2,
    description: 'A vibrant maritime bazaar with double-ikat Patola canopies and tie-dye drying frames.'
  },
  rajasthan_tile: {
    id: 'rajasthan_tile',
    name: 'Sandstone Haveli',
    edges: T(['stone', 'field', 'village', 'stone', 'grass', 'grass']),
    landmark: 'rajasthan_haveli',
    produces: { resource: 'clay', amount: 3, every: 16 },
    culturalTags: ['heritage', 'water', 'rajasthan'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.2,
    description: 'Golden Jaisalmer sandstone haveli with ornate jharokha balconies and Jaipur blue pottery.'
  },

  // --- MAHARASHTRA SPECIAL BUILDS ---
  maha_wada: {
    id: 'maha_wada',
    name: 'Wada Courtyard House',
    edges: T(['village', 'grass', 'village', 'stone', 'grass', 'grass']),
    landmark: 'maha_wada',
    produces: { resource: 'coins', amount: 4, every: 18 },
    culturalTags: ['architecture', 'heritage', 'maharashtra'],
    rarity: 'rare',
    unlockLevel: 1,
    weight: 1.0,
    description: 'Traditional Maratha Wada residence featuring a sunlit central inner courtyard, carved sagwan timber columns, and sloping terracotta roof.'
  },
  maha_gateway: {
    id: 'maha_gateway',
    name: 'Sahyadri Fort Gateway',
    edges: T(['stone', 'stone', 'village', 'stone', 'stone', 'grass']),
    landmark: 'maha_gateway',
    produces: { resource: 'stone', amount: 4, every: 18 },
    culturalTags: ['architecture', 'stone', 'maharashtra'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Panhala-inspired hill-fort stone gateway with rounded bastions, thick defensive walls, stone steps, and flying saffron flag.'
  },
  maha_paithani: {
    id: 'maha_paithani',
    name: 'Paithani Weaving House',
    edges: T(['village', 'grass', 'village', 'grass', 'field', 'grass']),
    landmark: 'maha_paithani',
    produces: { resource: 'fibre', amount: 4, every: 18 },
    culturalTags: ['textile', 'craft', 'maharashtra'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Active silk handloom workshop with a visible wooden pit loom, golden zari spools, and Paithani peacock-motif sarees.'
  },
  maha_warli: {
    id: 'maha_warli',
    name: 'Warli Art Pavilion',
    edges: T(['grass', 'village', 'grass', 'grass', 'village', 'grass']),
    landmark: 'maha_warli',
    produces: { resource: 'music', amount: 2, every: 20 },
    culturalTags: ['heritage', 'community', 'maharashtra'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.8,
    description: 'Open community gathering space adorned with authentic white geometric Warli Tarpa dance murals on warm red-ochre earthen plaster.'
  },
  maha_cistern: {
    id: 'maha_cistern',
    name: 'Fort Water Cistern',
    edges: T(['water', 'stone', 'water', 'stone', 'grass', 'grass']),
    landmark: 'maha_cistern',
    produces: { resource: 'water', amount: 4, every: 16 },
    culturalTags: ['water', 'architecture', 'maharashtra'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.8,
    description: 'Ancient Sahyadri hill-fort stone water tank (tanka) with stepped stone descent providing vital mountain water storage.'
  },

  // --- BIHAR SPECIAL BUILDS ---
  bihar_sikki: {
    id: 'bihar_sikki',
    name: 'Sikki Craft House',
    edges: T(['village', 'field', 'grass', 'village', 'grass', 'grass']),
    landmark: 'bihar_sikki',
    produces: { resource: 'fibre', amount: 3, every: 18 },
    culturalTags: ['craft', 'heritage', 'bihar'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Workshop and exhibition cottage dedicated to golden Sikki grass basketry, storage vessels, and woven handcrafted toys.'
  },
  bihar_pond: {
    id: 'bihar_pond',
    name: 'Community Pokhar Pond',
    edges: T(['water', 'grass', 'village', 'water', 'grass', 'grass']),
    landmark: 'bihar_pond',
    produces: { resource: 'water', amount: 3, every: 18 },
    culturalTags: ['water', 'community', 'bihar'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Sacred village pond with clay embankment steps, floating lotus blossoms, and an earthen gathering pavilion.'
  },

  // --- WEST BENGAL SPECIAL BUILDS ---
  bengal_jorbangla: {
    id: 'bengal_jorbangla',
    name: 'Jor-Bangla Heritage House',
    edges: T(['village', 'grass', 'village', 'grass', 'water', 'grass']),
    landmark: 'bengal_jorbangla',
    produces: { resource: 'clay', amount: 4, every: 18 },
    culturalTags: ['heritage', 'architecture', 'west_bengal'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Bishnupur-inspired twin hut architectural structure featuring curved terracotta char-chala roofs and carved floral relief panels.'
  },
  bengal_baluchari: {
    id: 'bengal_baluchari',
    name: 'Baluchari Weaving House',
    edges: T(['village', 'grass', 'village', 'grass', 'field', 'grass']),
    landmark: 'bengal_baluchari',
    produces: { resource: 'fibre', amount: 4, every: 18 },
    culturalTags: ['textile', 'craft', 'west_bengal'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Traditional Bengal silk workshop with an active handloom producing rich Baluchari brocades with intricate mythological motifs.'
  },
  bengal_ghat: {
    id: 'bengal_ghat',
    name: 'Riverfront Craft Ghat',
    edges: T(['water', 'water', 'village', 'water', 'grass', 'grass']),
    landmark: 'bengal_ghat',
    produces: { resource: 'coins', amount: 4, every: 18 },
    culturalTags: ['water', 'trade', 'west_bengal'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Brick river landing with stepped bathing ghat, moored wooden dinghy boat, and fishing net repair stations.'
  },

  // --- KARNATAKA SPECIAL BUILDS ---
  karnataka_mysore: {
    id: 'karnataka_mysore',
    name: 'Mysore Art House',
    edges: T(['village', 'grass', 'village', 'stone', 'grass', 'grass']),
    landmark: 'karnataka_mysore',
    produces: { resource: 'coins', amount: 4, every: 18 },
    culturalTags: ['craft', 'heritage', 'karnataka'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Heritage studio dedicated to classic Mysore gold-leaf gesso paintings, carved rosewood frames, and brass incense burners.'
  },
  karnataka_yakshagana: {
    id: 'karnataka_yakshagana',
    name: 'Yakshagana Courtyard',
    edges: T(['grass', 'village', 'grass', 'grass', 'village', 'grass']),
    landmark: 'karnataka_yakshagana',
    produces: { resource: 'music', amount: 3, every: 18 },
    culturalTags: ['festival', 'heritage', 'karnataka'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Stepped granite performance space for coastal Yakshagana dance theatre, complete with ornate headdress crowns and percussion drums.'
  },

  // --- GUJARAT SPECIAL BUILDS ---
  gujarat_stepwell: {
    id: 'gujarat_stepwell',
    name: 'Artisan Stepwell (Vav)',
    edges: T(['water', 'stone', 'village', 'water', 'stone', 'grass']),
    landmark: 'gujarat_stepwell',
    produces: { resource: 'water', amount: 5, every: 16 },
    culturalTags: ['water', 'architecture', 'gujarat'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Rani ki Vav-inspired multi-tiered subterranean water structure with descending carved stone colonnades and cool subterranean pool.'
  },
  gujarat_bandhani: {
    id: 'gujarat_bandhani',
    name: 'Bandhani Craft Studio',
    edges: T(['village', 'grass', 'village', 'grass', 'water', 'grass']),
    landmark: 'gujarat_bandhani',
    produces: { resource: 'fibre', amount: 4, every: 18 },
    culturalTags: ['textile', 'craft', 'gujarat'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Textile tie-dye workshop equipped with natural dye vats, fabric-stretching lines, and drying lengths of vibrant dot-patterned Bandhani.'
  },

  // --- RAJASTHAN SPECIAL BUILDS ---
  rajasthan_bluepottery: {
    id: 'rajasthan_bluepottery',
    name: 'Blue Pottery Studio',
    edges: T(['village', 'stone', 'village', 'grass', 'stone', 'grass']),
    landmark: 'rajasthan_bluepottery',
    produces: { resource: 'clay', amount: 4, every: 18 },
    culturalTags: ['craft', 'heritage', 'rajasthan'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Jaipur artisanal studio with a brick kiln and display shelves filled with quartz-glazed cobalt blue and turquoise floral pottery.'
  },
  rajasthan_kathputli: {
    id: 'rajasthan_kathputli',
    name: 'Kathputli Puppet Stage',
    edges: T(['grass', 'village', 'grass', 'grass', 'village', 'grass']),
    landmark: 'rajasthan_kathputli',
    produces: { resource: 'music', amount: 3, every: 18 },
    culturalTags: ['festival', 'heritage', 'rajasthan'],
    rarity: 'rare',
    unlockLevel: 2,
    weight: 0.9,
    description: 'Canopied Rajasthani string puppet performance pavilion with embroidered stage drapes and traditional wooden Kathputli dolls.'
  }
};

export const RESOURCE_INFO: Record<ResourceKind | 'coins', { name: string; color: string }> = {
  coins: { name: 'Coins', color: '#f5c542' },
  grain: { name: 'Grain', color: '#e8c25a' },
  wood: { name: 'Wood', color: '#b57a45' },
  fibre: { name: 'Textile', color: '#e0609a' },
  clay: { name: 'Clay', color: '#d4703f' },
  stone: { name: 'Stone', color: '#a3a7ad' },
  water: { name: 'Water', color: '#4fb6ec' },
  music: { name: 'Music', color: '#a58bf0' }
};

export interface ComboDef {
  id: string;
  name: string;
  a: LandmarkKind;
  b: LandmarkKind;
  description: string;
  lore: string;
  culture: number;
}

/** Cultural Connect: adjacent landmark pairs that grow a new structure on their shared edge. */
export const COMBOS: ComboDef[] = [
  {
    id: 'craft_district',
    name: 'Craft District',
    a: 'weaving_hut',
    b: 'pottery',
    description: 'Textile + Clay',
    lore: 'Weavers and potters share a shaded courtyard — cloth dries beside fresh pots.',
    culture: 30
  },
  {
    id: 'harvest_grounds',
    name: 'Harvest Grounds',
    a: 'farmhouse',
    b: 'pavilion',
    description: 'Grain + Music',
    lore: 'When the grain is in, the drums come out. A marigold arch marks the harvest dance.',
    culture: 30
  },
  {
    id: 'heritage_gate',
    name: 'Heritage Gateway',
    a: 'lumber_camp',
    b: 'quarry',
    description: 'Wood + Stone',
    lore: 'Carved timber on stone pillars — a gateway built to outlast its builders.',
    culture: 30
  },
  {
    id: 'market_lane',
    name: 'Market Lane',
    a: 'haat',
    b: 'houses',
    description: 'Haat + Homes',
    lore: 'Lanterns line the lane from the homes to the Haat on market evenings.',
    culture: 25
  },
  {
    id: 'textile_bazaar',
    name: 'Textile Bazaar',
    a: 'haat',
    b: 'weaving_hut',
    description: 'Haat + Textile',
    lore: 'Fresh cloth goes straight from the loom to the market, bright bunting overhead.',
    culture: 25
  }
];

export const LANDMARK_LABEL: Record<LandmarkKind, string> = {
  farmhouse: 'Farmhouse',
  houses: 'Village Homes',
  weaving_hut: 'Weaving Hut',
  pottery: 'Pottery Workshop',
  lumber_camp: 'Lumber Camp',
  quarry: 'Quarry',
  haat: 'Haat',
  pavilion: 'Music Pavilion',
  shrine: 'Heritage Shrine',
  bihar_workshop: 'Mithila Workshop',
  bihar_sikki: 'Sikki Grass Craft House',
  bihar_pond: 'Community Pokhar Pond',
  maha_watchtower: 'Sahyadri Watchtower',
  maha_wada: 'Traditional Wada House',
  maha_gateway: 'Sahyadri Fort Gateway',
  maha_paithani: 'Paithani Weaving House',
  maha_warli: 'Warli Art Pavilion',
  maha_cistern: 'Fort Water Cistern',
  bengal_pandal: 'Festival Pandal',
  bengal_jorbangla: 'Jor-Bangla House',
  bengal_baluchari: 'Baluchari Weaving House',
  bengal_ghat: 'Riverfront Craft Ghat',
  karnataka_toy_shop: 'Channapatna Studio',
  karnataka_mysore: 'Mysore Art House',
  karnataka_yakshagana: 'Yakshagana Courtyard',
  gujarat_textile: 'Patola Bazaar',
  gujarat_stepwell: 'Artisan Stepwell',
  gujarat_bandhani: 'Bandhani Craft Studio',
  rajasthan_haveli: 'Sandstone Haveli',
  rajasthan_bluepottery: 'Blue Pottery Studio',
  rajasthan_kathputli: 'Kathputli Puppet Stage'
};

export function drawableTiles(level: number): TileDef[] {
  return Object.values(TILE_LIBRARY).filter((d) => !d.hidden && d.unlockLevel <= level);
}

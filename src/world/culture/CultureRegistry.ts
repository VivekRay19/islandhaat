import { CultureProfile, IndianState } from './CultureTypes';

export const CULTURE_PROFILES: Record<IndianState, CultureProfile> = {
  // =========================================================================
  // 1. BIHAR — MITHILA ARTISAN
  // =========================================================================
  bihar: {
    id: 'bihar',
    stateName: 'Bihar',
    displayName: 'Mithila & Magadha Heritage',
    regionTitle: 'Mithila Region, Bihar',
    tagline: 'Living Patterns & Handmade Clay Traditions',
    overview:
      'Inspired by the renowned Madhubani art of Mithila and traditional Sikki golden grass weaving. Features warm earthen walls with painted nature murals, shaded village courtyards, and riverside pottery kilns.',
    palette: {
      primary: '#d97706',      // Ochre/warm clay
      secondary: '#b45309',    // Terracotta earth
      accent: '#4338ca',       // Indigo dye
      terrainTone: 0x5aa838,   // Lush gangetic fertile grass
      rockTone: 0x78604d,      // Warm alluvial rock
      roofTone: 0xd97706       // Hand-thatched / earth-ochre roofs
    },
    startingResources: {
      coins: 450,
      grain: 4,
      wood: 2,
      fibre: 3,
      clay: 4,
      stone: 1,
      water: 3,
      music: 2
    },
    signatureCrafts: ['Madhubani Painting', 'Sikki Grass Craft', 'Terracotta Diyas', 'Tikuli Art'],
    signatureStructures: [
      'Mithila Art Workshop',
      'Sikki Craft House',
      'Village Courtyard',
      'Madhubani Art Pavilion'
    ],
    specialist: {
      id: 'mithila_artisan',
      name: 'Sunita the Mithila Artisan',
      state: 'bihar',
      roleTitle: 'Mithila Artisan',
      signatureTool: 'Bamboo Nib & Natural Dyes',
      tagline: 'Preserving ancient painted folklore and golden grass craftsmanship.',
      biography:
        'Hailing from Madhubani, Sunita transforms earthen courtyards into vibrant narratives of lotuses, peacocks, and celestial motifs using indigenous organic pigments.',
      abilityName: 'Living Patterns',
      abilityDescription:
        'Craft-based cultural structures grant +25% bonus Cultural Score and +10 bonus coins when connected to village courtyards.',
      passiveBonusText: '+25% Cultural Score from craft buildings and murals',
      iconSvg: `
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle cx="24" cy="24" r="22" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
          <path d="M12 28 C16 16 32 16 36 28 C30 32 18 32 12 28 Z" fill="#b45309"/>
          <circle cx="24" cy="18" r="7" fill="#f59e0b"/>
          <path d="M18 38 L30 38 L24 44 Z" fill="#d97706"/>
          <circle cx="24" cy="18" r="3" fill="#ffffff"/>
        </svg>
      `
    },
    quests: [
      {
        id: 'bihar_intro',
        state: 'bihar',
        title: 'Bring the Village to Life',
        subtitle: 'Found your initial Mithila craft heritage',
        description:
          'Construct a Mithila Craft Workshop and connect it with an adjacent meadow or village path to begin creating traditional painted murals.',
        goalType: 'place_building',
        targetCount: 1,
        currentCount: 0,
        targetTag: 'craft',
        rewardText: 'Mithila Peacock Wall Painting & +35 Coins',
        rewardCoins: 35,
        rewardCultureScore: 50,
        rewardResource: { kind: 'clay', amount: 2 },
        completed: false
      },
      {
        id: 'bihar_sikki',
        state: 'bihar',
        title: 'Golden Grass Weaving',
        subtitle: 'Harvest golden Sikki grass for trade',
        description: 'Collect wild reeds and fibre along the riverside to establish a Sikki weaving hut.',
        goalType: 'harvest_resource',
        targetCount: 3,
        currentCount: 0,
        rewardText: 'Woven Sikki Basket Decoration & +40 Coins',
        rewardCoins: 40,
        rewardCultureScore: 40,
        completed: false
      }
    ],
    crossTradeItems: [
      {
        id: 'trade_madhubani_scroll',
        originState: 'bihar',
        name: 'Mithila Tree of Life Scroll',
        description: 'Exquisite hand-painted botanical textile scroll traded from Mithila artisans.',
        costCoins: 30,
        requiredResource: { kind: 'fibre', amount: 2 },
        unlockedDecoration: 'mithila_scroll',
        cultureBonus: 25
      }
    ],
    initialTileLandmark: 'bihar_workshop'
  },

  // =========================================================================
  // 2. MAHARASHTRA — SAHYADRI ARCHITECT
  // =========================================================================
  maharashtra: {
    id: 'maharashtra',
    stateName: 'Maharashtra',
    displayName: 'Sahyadri & Maratha Heritage',
    regionTitle: 'Sahyadri Hills & Deccan, Maharashtra',
    tagline: 'Basalt Hill-Fort Architecture & Paithani Silks',
    overview:
      'Inspired by the rugged stone fortifications of the Western Ghats (Sahyadris), grand wada courtyards, and vibrant Paithani handlooms. Features dark basalt masonry, stone watchtowers, and saffron banners.',
    palette: {
      primary: '#475569',      // Basalt stone slate
      secondary: '#ea580c',    // Saffron orange
      accent: '#0284c7',       // Peacock blue
      terrainTone: 0x4d882c,   // Hill plateau green
      rockTone: 0x334155,      // Dark Deccan basalt
      roofTone: 0xb45309       // Terracotta baked clay tiles
    },
    startingResources: {
      coins: 420,
      grain: 3,
      wood: 3,
      fibre: 2,
      clay: 2,
      stone: 5,
      water: 2,
      music: 1
    },
    signatureCrafts: ['Paithani Weaving', 'Warli Art', 'Kolhapuri Craft', 'Copperware'],
    signatureStructures: [
      'Sahyadri Watchtower',
      'Hill-Fort Gateway',
      'Paithani Weaving House',
      'Stone Courtyard Wada'
    ],
    specialist: {
      id: 'sahyadri_architect',
      name: 'Malhar the Sahyadri Architect',
      state: 'maharashtra',
      roleTitle: 'Sahyadri Architect',
      signatureTool: 'Stone Chisel & Fort Blueprint',
      tagline: 'Master builder of Deccan bastions, basalt arches, and stepped hill gateways.',
      biography:
        'Trained in the enduring stonework of Raigad and Sinhagad, Malhar specializes in building resilient stone settlements and stone-paved defense watchpoints.',
      abilityName: 'Master Builder',
      abilityDescription:
        'Reduces stone costs for all structures by 25% and provides +20 bonus coins whenever 3 connected pathways or stone tiles are constructed.',
      passiveBonusText: '-25% Stone requirement on all construction & fort walls',
      iconSvg: `
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle cx="24" cy="24" r="22" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
          <path d="M14 36 L14 20 L20 16 L28 16 L34 20 L34 36 Z" fill="#334155"/>
          <rect x="20" y="24" width="8" height="12" fill="#ea580c"/>
          <path d="M22 10 L28 6 L28 14 Z" fill="#ea580c"/>
        </svg>
      `
    },
    quests: [
      {
        id: 'maha_intro',
        state: 'maharashtra',
        title: 'Build a Connected Settlement',
        subtitle: 'Fortify your island with basalt architecture',
        description: 'Construct a Sahyadri Watchtower and connect it with 2 stone or settlement pathways.',
        goalType: 'place_building',
        targetCount: 1,
        currentCount: 0,
        targetTag: 'stone',
        rewardText: 'Maratha Saffron Bastion Standard & +40 Coins',
        rewardCoins: 40,
        rewardCultureScore: 50,
        rewardResource: { kind: 'stone', amount: 3 },
        completed: false
      },
      {
        id: 'maha_paithani',
        state: 'maharashtra',
        title: 'Gold-Bordered Handlooms',
        subtitle: 'Establish the Paithani weaving workshop',
        description: 'Produce textiles to craft traditional peacock-motif Paithani sarees.',
        goalType: 'harvest_resource',
        targetCount: 3,
        currentCount: 0,
        rewardText: 'Paithani Peacock Loom & +45 Coins',
        rewardCoins: 45,
        rewardCultureScore: 45,
        completed: false
      }
    ],
    crossTradeItems: [
      {
        id: 'trade_paithani_fabric',
        originState: 'maharashtra',
        name: 'Royal Paithani Silk Brocade',
        description: 'Gold-embroidered peacock silk fabric crafted by Paithan master weavers.',
        costCoins: 35,
        requiredResource: { kind: 'fibre', amount: 2 },
        unlockedDecoration: 'paithani_tapestry',
        cultureBonus: 30
      }
    ],
    initialTileLandmark: 'maha_watchtower'
  },

  // =========================================================================
  // 3. WEST BENGAL — PANDAL DESIGNER
  // =========================================================================
  west_bengal: {
    id: 'west_bengal',
    stateName: 'West Bengal',
    displayName: 'Bengal Delta & Bishnupur Heritage',
    regionTitle: 'Rarh & Delta Region, West Bengal',
    tagline: 'Terracotta Temples, Kantha Quilts & Festival Pandals',
    overview:
      'Inspired by Bishnupur terracotta carved relief architecture, Bengal handloom silk, and grand community festival spaces. Features curved *do-chala* roofs, river ghats, and joyful festival pavilions.',
    palette: {
      primary: '#b91c1c',      // Terracotta red
      secondary: '#0284c7',    // River delta azure
      accent: '#ca8a04',       // Festive gold
      terrainTone: 0x48a834,   // Delta lush green
      rockTone: 0x854d2e,      // Baked alluvial terracotta stone
      roofTone: 0xc2410c       // Bishnupur terracotta curved roof
    },
    startingResources: {
      coins: 430,
      grain: 3,
      wood: 2,
      fibre: 4,
      clay: 4,
      stone: 1,
      water: 4,
      music: 2
    },
    signatureCrafts: ['Terracotta Relief Art', 'Kantha Embroidery', 'Baluchari Silk', 'Sholapith Craft'],
    signatureStructures: [
      'Terracotta Craft House',
      'Bengali Handloom Workshop',
      'Festival Pandal',
      'Riverfront Courtyard Ghat'
    ],
    specialist: {
      id: 'pandal_designer',
      name: 'Ananya the Pandal Designer',
      state: 'west_bengal',
      roleTitle: 'Pandal Designer',
      signatureTool: 'Bamboo Framework & Sholapith Carvings',
      tagline: 'Architect of vibrant community celebration spaces and decorative festive pavilions.',
      biography:
        'Raised in Kumartuli and Kolkata, Ananya crafts breathtaking temporary and permanent community festival pavilions adorned with terracotta tiles and radiant drapery.',
      abilityName: 'Festival Creativity',
      abilityDescription:
        'Festival and cultural celebration structures yield +35% bonus rewards and cost 20% fewer decorative craft resources to establish.',
      passiveBonusText: '+35% rewards from festivals and cultural gathering spots',
      iconSvg: `
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle cx="24" cy="24" r="22" fill="#fee2e2" stroke="#b91c1c" stroke-width="2"/>
          <path d="M12 36 L24 14 L36 36 Z" fill="#c2410c"/>
          <path d="M20 36 L24 22 L28 36 Z" fill="#facc15"/>
          <circle cx="24" cy="12" r="3" fill="#ca8a04"/>
        </svg>
      `
    },
    quests: [
      {
        id: 'bengal_intro',
        state: 'west_bengal',
        title: 'Prepare the Community Festival',
        subtitle: 'Erect a grand cultural gathering space',
        description: 'Construct a Festival Pandal pavilion connected to the riverfront or settlement.',
        goalType: 'place_building',
        targetCount: 1,
        currentCount: 0,
        targetTag: 'festival',
        rewardText: 'Bishnupur Terracotta Wall Plaque & +40 Coins',
        rewardCoins: 40,
        rewardCultureScore: 50,
        rewardResource: { kind: 'fibre', amount: 3 },
        completed: false
      },
      {
        id: 'bengal_terracotta',
        state: 'west_bengal',
        title: 'Fired Terracotta Carvings',
        subtitle: 'Craft baked-earth reliefs inspired by Bishnupur',
        description: 'Gather clay and bake ornamental terracotta tiles for village homes.',
        goalType: 'harvest_resource',
        targetCount: 3,
        currentCount: 0,
        rewardText: 'Bishnupur Terracotta Horse & +45 Coins',
        rewardCoins: 45,
        rewardCultureScore: 45,
        completed: false
      }
    ],
    crossTradeItems: [
      {
        id: 'trade_bankura_horse',
        originState: 'west_bengal',
        name: 'Bankura Terracotta Figurine',
        description: 'Iconic stylized terracotta horse figurine from the artisans of Panchmura.',
        costCoins: 35,
        requiredResource: { kind: 'clay', amount: 2 },
        unlockedDecoration: 'bankura_horse',
        cultureBonus: 25
      }
    ],
    initialTileLandmark: 'bengal_pandal'
  },

  // =========================================================================
  // 4. KARNATAKA — CHANNAPATNA CRAFTMASTER
  // =========================================================================
  karnataka: {
    id: 'karnataka',
    stateName: 'Karnataka',
    displayName: 'Vijayanagara & Mysore Heritage',
    regionTitle: 'Hampi & Southern Deccan, Karnataka',
    tagline: 'Pillared Stone Pavilions & Lacquered Woodcraft',
    overview:
      'Inspired by the monolithic stone pillars of Hampi, fragrant Mysore sandalwood, and the glossy lacquered wooden toys of Channapatna. Features warm granite colonnades, carved teak doors, and bright craft workshops.',
    palette: {
      primary: '#92400e',      // Sandalwood teak brown
      secondary: '#475569',    // Hampi monolithic stone
      accent: '#e11d48',       // Lacquer red
      terrainTone: 0x549e32,   // Deccan plateau green
      rockTone: 0x94a3b8,      // Granite boulder grey
      roofTone: 0x92400e       // Teak wood rafters / granite cornices
    },
    startingResources: {
      coins: 420,
      grain: 2,
      wood: 5,
      fibre: 2,
      clay: 2,
      stone: 3,
      water: 2,
      music: 2
    },
    signatureCrafts: ['Channapatna Wooden Toys', 'Mysore Ganjifa & Painting', 'Bidriware', 'Sandalwood Carving'],
    signatureStructures: [
      'Channapatna Toy Workshop',
      'Hampi Pillared Pavilion',
      'Mysore Heritage Art House',
      'Woodcraft Lathe Studio'
    ],
    specialist: {
      id: 'channapatna_craftmaster',
      name: 'Ramu the Craftmaster',
      state: 'karnataka',
      roleTitle: 'Channapatna Craftmaster',
      signatureTool: 'Woodturning Lathe & Lacquer Sticks',
      tagline: 'Artisan of vibrant non-toxic lacquered wooden toys and carved teak woodcraft.',
      biography:
        'Preserving a 200-year-old tradition in Channapatna (the Toy Town), Ramu turns locally grown hale wood into glassy, rainbow-lacquered rocking horses, tops, and puzzles.',
      abilityName: 'Skilled Craftsmanship',
      abilityDescription:
        'All wood-based crafting projects grant +25% bonus resource efficiency and yield +15 bonus trade coins at the Haat.',
      passiveBonusText: '+25% woodworking efficiency & bonus coins on toy trades',
      iconSvg: `
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle cx="24" cy="24" r="22" fill="#fef3c7" stroke="#92400e" stroke-width="2"/>
          <path d="M18 16 L30 16 L28 32 L20 32 Z" fill="#e11d48"/>
          <ellipse cx="24" cy="14" rx="8" ry="4" fill="#f59e0b"/>
          <circle cx="24" cy="36" r="4" fill="#10b981"/>
        </svg>
      `
    },
    quests: [
      {
        id: 'karnataka_intro',
        state: 'karnataka',
        title: 'Create a Craft District',
        subtitle: 'Set up the Channapatna toy workshop',
        description: 'Construct a Channapatna Toy Workshop connected to a forest grove or marketplace.',
        goalType: 'place_building',
        targetCount: 1,
        currentCount: 0,
        targetTag: 'woodcraft',
        rewardText: 'Lacquered Wooden Rocking Horse & +40 Coins',
        rewardCoins: 40,
        rewardCultureScore: 50,
        rewardResource: { kind: 'wood', amount: 3 },
        completed: false
      },
      {
        id: 'karnataka_pillars',
        state: 'karnataka',
        title: 'Hampi Stone Colonnade',
        subtitle: 'Carve monolithic granite pillars',
        description: 'Gather stone to construct a heritage pillared community pavilion.',
        goalType: 'harvest_resource',
        targetCount: 3,
        currentCount: 0,
        rewardText: 'Monolithic Granite Pillar Motif & +45 Coins',
        rewardCoins: 45,
        rewardCultureScore: 45,
        completed: false
      }
    ],
    crossTradeItems: [
      {
        id: 'trade_channapatna_toy',
        originState: 'karnataka',
        name: 'Channapatna Lacquered Toy Set',
        description: 'Vibrantly colored non-toxic lacquered wooden toy set from Karnataka artisans.',
        costCoins: 30,
        requiredResource: { kind: 'wood', amount: 2 },
        unlockedDecoration: 'channapatna_set',
        cultureBonus: 25
      }
    ],
    initialTileLandmark: 'karnataka_toy_shop'
  },

  // =========================================================================
  // 5. GUJARAT — HAAT NEGOTIATOR
  // =========================================================================
  gujarat: {
    id: 'gujarat',
    stateName: 'Gujarat',
    displayName: 'Kutch & Saurashtra Heritage',
    regionTitle: 'Gulf of Khambhat & Kutch, Gujarat',
    tagline: 'Patola Textiles, Stepwells & Maritime Bazaar',
    overview:
      'Inspired by the intricate double-ikat Patola silks of Patan, Bandhani tie-dye textiles, and subterranean stepped water vavs. Features vibrant striped market awnings, mirror-work craft stalls, and bustling docks.',
    palette: {
      primary: '#0284c7',      // Indigo blue
      secondary: '#dc2626',    // Vermilion red
      accent: '#facc15',       // Turmeric yellow
      terrainTone: 0x65aa38,   // Coastal green
      rockTone: 0x9a7b56,      // Coastal sandstone
      roofTone: 0xd95738       // Terracotta tile & striped awnings
    },
    startingResources: {
      coins: 520, // Trade bonus
      grain: 2,
      wood: 2,
      fibre: 5,
      clay: 2,
      stone: 2,
      water: 3,
      music: 2
    },
    signatureCrafts: ['Patola Weaving', 'Bandhani Tie-Dye', 'Kutchi Mirror Embroidery', 'Rogan Art'],
    signatureStructures: [
      'Patola Textile Workshop',
      'Adalaj-Style Stepwell',
      'Artisan Bazaar Marketplace',
      'Seaside Trade Pier'
    ],
    specialist: {
      id: 'haat_negotiator',
      name: 'Devji the Haat Negotiator',
      state: 'gujarat',
      roleTitle: 'Haat Negotiator',
      signatureTool: 'Merchant Ledger & Brass Scales',
      tagline: 'Expert in maritime trade, vibrant textile exchange, and market diplomacy.',
      biography:
        'Hailing from the ancient port routes of Mandvi and Surat, Devji knows the true cultural value of every textile bolt, spice jar, and handcrafted heirloom.',
      abilityName: 'Skilled Exchange',
      abilityDescription:
        'Trades at the Haat yield +30% additional coins and unlock exclusive merchant offers from visiting ships.',
      passiveBonusText: '+30% coin earnings on all Haat marketplace trades',
      iconSvg: `
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle cx="24" cy="24" r="22" fill="#eff6ff" stroke="#0284c7" stroke-width="2"/>
          <path d="M24 10 L24 38 M14 20 L34 20" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
          <circle cx="14" cy="26" r="5" fill="#facc15"/>
          <circle cx="34" cy="26" r="5" fill="#dc2626"/>
        </svg>
      `
    },
    quests: [
      {
        id: 'gujarat_intro',
        state: 'gujarat',
        title: 'Establish the Artisan Trade Route',
        subtitle: 'Open the seaside Haat bazaar for maritime traders',
        description: 'Construct the Patola Textile Workshop and complete your first exchange at the Haat.',
        goalType: 'trade_haat',
        targetCount: 1,
        currentCount: 0,
        rewardText: 'Patola Geometric Awning Canopy & +50 Coins',
        rewardCoins: 50,
        rewardCultureScore: 50,
        rewardResource: { kind: 'fibre', amount: 3 },
        completed: false
      },
      {
        id: 'gujarat_vav',
        state: 'gujarat',
        title: 'Carved Stepwell of the Island',
        subtitle: 'Build water security with stepped architecture',
        description: 'Construct a carved stepwell to secure fresh water for your island community.',
        goalType: 'place_building',
        targetCount: 1,
        currentCount: 0,
        targetTag: 'water',
        rewardText: 'Carved Stepwell Niche & +45 Coins',
        rewardCoins: 45,
        rewardCultureScore: 45,
        completed: false
      }
    ],
    crossTradeItems: [
      {
        id: 'trade_patola_silk',
        originState: 'gujarat',
        name: 'Patan Double-Ikat Silk Sash',
        description: 'Masterpiece geometric silk weave dyed with natural madder and indigo.',
        costCoins: 35,
        requiredResource: { kind: 'fibre', amount: 2 },
        unlockedDecoration: 'patola_runner',
        cultureBonus: 30
      }
    ],
    initialTileLandmark: 'gujarat_textile'
  },

  // =========================================================================
  // 6. RAJASTHAN — STEPWELL ENGINEER
  // =========================================================================
  rajasthan: {
    id: 'rajasthan',
    stateName: 'Rajasthan',
    displayName: 'Marwar & Mewar Heritage',
    regionTitle: 'Thar & Shekhawati, Rajasthan',
    tagline: 'Golden Sandstone Havelis, Blue Pottery & Stepwells',
    overview:
      'Inspired by the golden sandstone architecture of Jaisalmer, ornate jharokha balconies, Jaipur blue pottery, and grand baori stepwells. Features warm desert sandstone, cobalt blue ceramics, and shaded courtyard archways.',
    palette: {
      primary: '#d97706',      // Golden sandstone
      secondary: '#0284c7',    // Jaipur cobalt blue
      accent: '#be123c',       // Marwar ruby red
      terrainTone: 0x82a536,   // Semi-arid savanna green
      rockTone: 0xc89e4c,      // Warm golden sandstone
      roofTone: 0xd97706       // Sandstone chhatris & cupolas
    },
    startingResources: {
      coins: 440,
      grain: 2,
      wood: 2,
      fibre: 2,
      clay: 4,
      stone: 4,
      water: 5, // Extra water for arid resilience
      music: 2
    },
    signatureCrafts: ['Jaipur Blue Pottery', 'Kathputli Puppets', 'Block Printing', 'Jharokha Stonework'],
    signatureStructures: [
      'Haveli-Inspired House',
      'Stepwell Baori',
      'Blue Pottery Workshop',
      'Puppet Performance Pavilion'
    ],
    specialist: {
      id: 'stepwell_engineer',
      name: 'Rana the Stepwell Engineer',
      state: 'rajasthan',
      roleTitle: 'Stepwell Engineer',
      signatureTool: 'Plumb Line & Water Incline Gauge',
      tagline: 'Master of desert water conservation, geometric baoris, and carved haveli architecture.',
      biography:
        'Drawing upon generations of desert water stewardship in Abhaneri and Jodhpur, Rana designs stepped reservoirs that harvest every droplet of rainwater.',
      abilityName: 'Water Stewardship',
      abilityDescription:
        'Increases island water storage capacity by +50% and reduces construction and farm water requirements by 30%.',
      passiveBonusText: '+50% water storage & -30% water consumption on farming',
      iconSvg: `
        <svg viewBox="0 0 48 48" width="100%" height="100%">
          <circle cx="24" cy="24" r="22" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
          <path d="M12 18 L36 18 L32 24 L16 24 L20 30 L28 30 L24 36 Z" fill="#0284c7"/>
          <circle cx="24" cy="12" r="3" fill="#d97706"/>
        </svg>
      `
    },
    quests: [
      {
        id: 'rajasthan_intro',
        state: 'rajasthan',
        title: "Secure the Community's Water Supply",
        subtitle: 'Build a stepped water baori',
        description: 'Construct a Stepwell reservoir to secure sustainable water storage for the island.',
        goalType: 'place_building',
        targetCount: 1,
        currentCount: 0,
        targetTag: 'water_baori',
        rewardText: 'Carved Sandstone Jharokha Balcony & +45 Coins',
        rewardCoins: 45,
        rewardCultureScore: 50,
        rewardResource: { kind: 'water', amount: 3 },
        completed: false
      },
      {
        id: 'rajasthan_pottery',
        state: 'rajasthan',
        title: 'Cobalt Glaze Blue Pottery',
        subtitle: 'Craft glazed quartz ceramics of Jaipur',
        description: 'Collect clay and minerals to create iconic blue pottery decorative vases.',
        goalType: 'harvest_resource',
        targetCount: 3,
        currentCount: 0,
        rewardText: 'Jaipur Blue Pottery Urn & +45 Coins',
        rewardCoins: 45,
        rewardCultureScore: 45,
        completed: false
      }
    ],
    crossTradeItems: [
      {
        id: 'trade_blue_pottery',
        originState: 'rajasthan',
        name: 'Jaipur Blue Pottery Urn',
        description: 'Distinctive turquoise-and-cobalt glazed floral ceramic vase from Jaipur.',
        costCoins: 30,
        requiredResource: { kind: 'clay', amount: 2 },
        unlockedDecoration: 'blue_pottery_urn',
        cultureBonus: 25
      }
    ],
    initialTileLandmark: 'rajasthan_haveli'
  }
};

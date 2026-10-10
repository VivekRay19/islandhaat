import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator';

export class Materials {
  private static instance: Materials;

  // PBR Terrain Materials
  public grass: THREE.MeshStandardMaterial;
  public darkGrass: THREE.MeshStandardMaterial;
  public earth: THREE.MeshStandardMaterial;
  public darkSoil: THREE.MeshStandardMaterial;
  public stone: THREE.MeshStandardMaterial;
  public cliffRock: THREE.MeshStandardMaterial;
  public sand: THREE.MeshStandardMaterial;
  public field: THREE.MeshStandardMaterial;
  public cobblestone: THREE.MeshStandardMaterial;

  // Water Material
  public water: THREE.MeshStandardMaterial;
  public waterfall: THREE.MeshStandardMaterial;
  public waterFoam: THREE.MeshStandardMaterial;

  // Architecture & Construction Materials
  public wood: THREE.MeshStandardMaterial;
  public darkWood: THREE.MeshStandardMaterial;
  public woodPlanks: THREE.MeshStandardMaterial;
  public thatch: THREE.MeshStandardMaterial;
  public terracotta: THREE.MeshStandardMaterial;
  public whitePlaster: THREE.MeshStandardMaterial;
  public clayPot: THREE.MeshStandardMaterial;

  // Fabrics & Canopies
  public fabricPinkStripe: THREE.MeshStandardMaterial;
  public fabricYellowStripe: THREE.MeshStandardMaterial;
  public fabricBlueStripe: THREE.MeshStandardMaterial;
  public fabricBanner: THREE.MeshStandardMaterial;

  // Lights & FX
  public lanternGlow: THREE.MeshBasicMaterial;
  public windowGlow: THREE.MeshBasicMaterial;
  public fireFlames: THREE.MeshBasicMaterial;
  public smoke: THREE.MeshBasicMaterial;
  public goldCoin: THREE.MeshStandardMaterial;

  // Foliage
  public treeFoliageA: THREE.MeshStandardMaterial;
  public treeFoliageB: THREE.MeshStandardMaterial;
  public treeFoliageC: THREE.MeshStandardMaterial;
  public palmFrond: THREE.MeshStandardMaterial;
  public blossomPink: THREE.MeshStandardMaterial;
  public flowerPetal: THREE.MeshStandardMaterial;

  // Placement highlights
  public slotValid: THREE.MeshBasicMaterial;
  public slotInvalid: THREE.MeshBasicMaterial;
  public ghostMat: THREE.MeshStandardMaterial;

  // Regional Cultural Materials
  public madhubaniCanvas: THREE.MeshStandardMaterial;
  public paithaniZari: THREE.MeshStandardMaterial;
  public terracottaRelief: THREE.MeshStandardMaterial;
  public mysoreGold: THREE.MeshStandardMaterial;
  public patolaIkat: THREE.MeshStandardMaterial;
  public bluePottery: THREE.MeshStandardMaterial;
  public warliArt: THREE.MeshStandardMaterial;
  public baluchariSilk: THREE.MeshStandardMaterial;

  // Regional Architecture & Rocks
  public sandstone: THREE.MeshStandardMaterial;
  public basaltRock: THREE.MeshStandardMaterial;
  public graniteStone: THREE.MeshStandardMaterial;
  public ochrePlaster: THREE.MeshStandardMaterial;
  public bengalBrick: THREE.MeshStandardMaterial;
  public saffronStandard: THREE.MeshStandardMaterial;

  // Maharashtra Specific Bright Palette
  public sahyadriSunlitGrass: THREE.MeshStandardMaterial;
  public sahyadriFoliage: THREE.MeshStandardMaterial;
  public sahyadriMonsoon: THREE.MeshStandardMaterial;
  public sahyadriWarmStone: THREE.MeshStandardMaterial;
  public sahyadriSunlitStone: THREE.MeshStandardMaterial;
  public sahyadriEarth: THREE.MeshStandardMaterial;
  public sahyadriTerracottaRoof: THREE.MeshStandardMaterial;
  public sahyadriLimePlaster: THREE.MeshStandardMaterial;
  public paithaniTeal: THREE.MeshStandardMaterial;
  public paithaniMagenta: THREE.MeshStandardMaterial;
  public sahyadriSaffron: THREE.MeshStandardMaterial;
  public sahyadriFreshWater: THREE.MeshStandardMaterial;

  // State terrain maps
  private stateTerrains: Map<string, THREE.MeshStandardMaterial> = new Map();
  private stateCliffs: Map<string, THREE.MeshStandardMaterial> = new Map();
  private stateStratas: Map<string, THREE.MeshStandardMaterial> = new Map();

  private constructor() {
    // Generate Procedural Textures
    const grassTex = TextureGenerator.createGrassTexture();
    grassTex.repeat.set(2, 2);

    const cliffTex = TextureGenerator.createCliffTexture();
    cliffTex.repeat.set(1, 2);

    const roofTex = TextureGenerator.createRoofTileTexture();
    roofTex.repeat.set(2, 2);

    const woodTex = TextureGenerator.createWoodPlankTexture();
    woodTex.repeat.set(2, 2);

    const wheatTex = TextureGenerator.createWheatTexture();
    wheatTex.repeat.set(2, 2);

    const pinkStripeTex = TextureGenerator.createAwningTexture('#ec4899', '#ffffff');
    const yellowStripeTex = TextureGenerator.createAwningTexture('#eab308', '#ffffff');
    const blueStripeTex = TextureGenerator.createAwningTexture('#0284c7', '#ffffff');

    // --- TERRAIN ---
    this.grass = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x68c946,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false
    });

    this.darkGrass = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x48962c,
      roughness: 0.9,
      metalness: 0.05
    });

    this.earth = new THREE.MeshStandardMaterial({
      map: cliffTex,
      color: 0x85532d,
      roughness: 0.95,
      metalness: 0.0
    });

    this.cliffRock = new THREE.MeshStandardMaterial({
      map: cliffTex,
      color: 0x64748b,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });

    this.darkSoil = new THREE.MeshStandardMaterial({
      color: 0x3e2718,
      roughness: 0.95,
      metalness: 0.0
    });

    this.sand = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.9,
      metalness: 0.0
    });

    this.stone = new THREE.MeshStandardMaterial({
      map: cliffTex,
      color: 0x94a3b8,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true
    });

    this.cobblestone = new THREE.MeshStandardMaterial({
      map: cliffTex,
      color: 0xa8a29e,
      roughness: 0.8,
      metalness: 0.1
    });

    this.field = new THREE.MeshStandardMaterial({
      map: wheatTex,
      color: 0xfacc15,
      roughness: 0.75,
      metalness: 0.05
    });

    // --- WATER ---
    this.water = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
      flatShading: false
    });

    this.waterfall = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92
    });

    this.waterFoam = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      transparent: true,
      opacity: 0.8
    });

    // --- ARCHITECTURE ---
    this.wood = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x9a5a32,
      roughness: 0.75,
      metalness: 0.05
    });

    this.darkWood = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x5a341a,
      roughness: 0.8,
      metalness: 0.05
    });

    this.woodPlanks = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0xb46b38,
      roughness: 0.7,
      metalness: 0.05
    });

    this.thatch = new THREE.MeshStandardMaterial({
      color: 0xd4a359,
      roughness: 0.95,
      metalness: 0.0
    });

    this.terracotta = new THREE.MeshStandardMaterial({
      map: roofTex,
      color: 0xd95738,
      roughness: 0.65,
      metalness: 0.05
    });

    this.whitePlaster = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.0
    });

    this.clayPot = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      roughness: 0.7,
      metalness: 0.05
    });

    // --- FABRICS ---
    this.fabricPinkStripe = new THREE.MeshStandardMaterial({
      map: pinkStripeTex,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    this.fabricYellowStripe = new THREE.MeshStandardMaterial({
      map: yellowStripeTex,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    this.fabricBlueStripe = new THREE.MeshStandardMaterial({
      map: blueStripeTex,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    this.fabricBanner = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.85,
      side: THREE.DoubleSide
    });

    // --- FOLIAGE ---
    this.treeFoliageA = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x22c55e,
      roughness: 0.8,
      metalness: 0.05
    });

    this.treeFoliageB = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x16a34a,
      roughness: 0.85,
      metalness: 0.05
    });

    this.treeFoliageC = new THREE.MeshStandardMaterial({
      map: grassTex,
      color: 0x15803d,
      roughness: 0.9,
      metalness: 0.05
    });

    this.palmFrond = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    this.blossomPink = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.75,
      metalness: 0.05
    });

    this.flowerPetal = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      roughness: 0.6
    });

    // --- LIGHTS & SPECIAL FX ---
    this.lanternGlow = new THREE.MeshBasicMaterial({ color: 0xffd166 });
    this.windowGlow = new THREE.MeshBasicMaterial({ color: 0xffe27a });
    this.fireFlames = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.9 });
    this.smoke = new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.45 });
    this.goldCoin = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.25 });

    // --- SLOTS & GHOSTS ---
    this.slotValid = new THREE.MeshBasicMaterial({
      color: 0x4ade80,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    this.slotInvalid = new THREE.MeshBasicMaterial({
      color: 0xf87171,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    this.ghostMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      roughness: 0.3
    });

    // --- REGIONAL CULTURAL MATERIALS ---
    this.madhubaniCanvas = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createMadhubaniTexture(),
      roughness: 0.85,
      metalness: 0.0
    });

    this.paithaniZari = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createPaithaniZariTexture(),
      roughness: 0.45,
      metalness: 0.4
    });

    this.terracottaRelief = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createTerracottaReliefTexture(),
      roughness: 0.7,
      metalness: 0.05
    });

    this.mysoreGold = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createMysoreGoldTexture(),
      roughness: 0.35,
      metalness: 0.45
    });

    this.patolaIkat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createPatolaIkatTexture(),
      roughness: 0.6,
      metalness: 0.05
    });

    this.bluePottery = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createBluePotteryTexture(),
      roughness: 0.25,
      metalness: 0.1
    });

    this.sandstone = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.8,
      metalness: 0.05
    });

    this.basaltRock = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.88,
      metalness: 0.15
    });

    this.graniteStone = new THREE.MeshStandardMaterial({
      color: 0xa8a29e,
      roughness: 0.82,
      metalness: 0.1
    });

    this.ochrePlaster = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.9,
      metalness: 0.0
    });

    this.bengalBrick = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.8,
      metalness: 0.05
    });

    this.saffronStandard = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.7,
      metalness: 0.0
    });

    // Cultural Craft Textures
    this.warliArt = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createWarliTexture(),
      roughness: 0.85,
      metalness: 0.0
    });

    this.baluchariSilk = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createBaluchariTexture(),
      roughness: 0.5,
      metalness: 0.2
    });

    // Maharashtra Specific Brighter Palette (#A5C982, #A69B8A, #B98259, #C96F4D, #F1E2C9, etc.)
    this.sahyadriSunlitGrass = new THREE.MeshStandardMaterial({
      color: 0xA5C982,
      roughness: 0.75,
      metalness: 0.02
    });

    this.sahyadriFoliage = new THREE.MeshStandardMaterial({
      color: 0x648B56,
      roughness: 0.80,
      metalness: 0.02
    });

    this.sahyadriMonsoon = new THREE.MeshStandardMaterial({
      color: 0xC1D99A,
      roughness: 0.72,
      metalness: 0.02
    });

    this.sahyadriWarmStone = new THREE.MeshStandardMaterial({
      color: 0xA69B8A,
      roughness: 0.82,
      metalness: 0.05
    });

    this.sahyadriSunlitStone = new THREE.MeshStandardMaterial({
      color: 0xD0C1A5,
      roughness: 0.76,
      metalness: 0.04
    });

    this.sahyadriEarth = new THREE.MeshStandardMaterial({
      color: 0xB98259,
      roughness: 0.88,
      metalness: 0.02
    });

    this.sahyadriTerracottaRoof = new THREE.MeshStandardMaterial({
      color: 0xC96F4D,
      roughness: 0.65,
      metalness: 0.03
    });

    this.sahyadriLimePlaster = new THREE.MeshStandardMaterial({
      color: 0xF1E2C9,
      roughness: 0.86,
      metalness: 0.0
    });

    this.paithaniTeal = new THREE.MeshStandardMaterial({
      color: 0x237D83,
      roughness: 0.45,
      metalness: 0.28
    });

    this.paithaniMagenta = new THREE.MeshStandardMaterial({
      color: 0xA94470,
      roughness: 0.45,
      metalness: 0.28
    });

    this.sahyadriSaffron = new THREE.MeshStandardMaterial({
      color: 0xE4A23B,
      roughness: 0.7,
      metalness: 0.0
    });

    this.sahyadriFreshWater = new THREE.MeshStandardMaterial({
      color: 0x78BCD2,
      roughness: 0.1,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88
    });

    // Populate State Terrains & Cliffs
    const states = ['bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan'];
    for (const st of states) {
      const terrainTex = TextureGenerator.createStateTerrainTexture(st);
      terrainTex.repeat.set(2, 2);

      let col = 0x5cb83c;
      let cliffCol = 0x64748b;
      let strataCol = 0x85532d;
      let roughness = 0.85;

      if (st === 'bihar') {
        col = 0xca8a04; // Warm alluvial earth / clay
        cliffCol = 0x854d0e; // Silt cliff
        strataCol = 0x713f12;
      } else if (st === 'maharashtra') {
        // Brighter Sunlit Sahyadri Landscape
        col = 0xA5C982; // Sunlit fresh grass
        cliffCol = 0xA69B8A; // Warm stone
        strataCol = 0xB98259; // Warm earthen soil
        roughness = 0.78;
      } else if (st === 'west_bengal') {
        col = 0x16a34a; // Lush riverbank green
        cliffCol = 0x78350f; // River clay
        strataCol = 0x451a03;
      } else if (st === 'karnataka') {
        col = 0xb45309; // Red laterite / granite
        cliffCol = 0x78716c; // Golden grey granite
        strataCol = 0x57534e;
      } else if (st === 'gujarat') {
        col = 0xd97706; // Semi-arid courtyard earth
        cliffCol = 0xa16207;
        strataCol = 0x78350f;
      } else if (st === 'rajasthan') {
        col = 0xfacc15; // Golden Thar sand
        cliffCol = 0xca8a04; // Sandstone strata
        strataCol = 0xa16207;
        roughness = 0.95;
      }

      this.stateTerrains.set(st, new THREE.MeshStandardMaterial({
        map: terrainTex,
        color: col,
        roughness: roughness,
        metalness: 0.05
      }));

      this.stateCliffs.set(st, new THREE.MeshStandardMaterial({
        color: cliffCol,
        roughness: 0.9,
        metalness: 0.1,
        flatShading: true
      }));

      this.stateStratas.set(st, new THREE.MeshStandardMaterial({
        color: strataCol,
        roughness: 0.95,
        metalness: 0.05
      }));
    }
  }

  public getTerrainMaterial(state: string): THREE.MeshStandardMaterial {
    return this.stateTerrains.get(state) || this.grass;
  }

  public getCliffMaterial(state: string): THREE.MeshStandardMaterial {
    return this.stateCliffs.get(state) || this.cliffRock;
  }

  public getBaseStrataMaterial(state: string): THREE.MeshStandardMaterial {
    return this.stateStratas.get(state) || this.earth;
  }

  public static get(): Materials {
    if (!Materials.instance) {
      Materials.instance = new Materials();
    }
    return Materials.instance;
  }
}

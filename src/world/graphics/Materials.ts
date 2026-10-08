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
  }

  public static get(): Materials {
    if (!Materials.instance) {
      Materials.instance = new Materials();
    }
    return Materials.instance;
  }
}

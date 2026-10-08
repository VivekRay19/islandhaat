import * as THREE from 'three';

export class Materials {
  private static instance: Materials;

  public grass: THREE.MeshLambertMaterial;
  public darkGrass: THREE.MeshLambertMaterial;
  public earth: THREE.MeshLambertMaterial;
  public darkSoil: THREE.MeshLambertMaterial;
  public stone: THREE.MeshLambertMaterial;
  public darkStone: THREE.MeshLambertMaterial;
  public field: THREE.MeshLambertMaterial;
  public water: THREE.MeshStandardMaterial;
  public wood: THREE.MeshLambertMaterial;
  public darkWood: THREE.MeshLambertMaterial;
  public thatch: THREE.MeshLambertMaterial;
  public terracotta: THREE.MeshLambertMaterial;
  public whitePlaster: THREE.MeshLambertMaterial;
  public fabricPink: THREE.MeshLambertMaterial;
  public fabricYellow: THREE.MeshLambertMaterial;
  public fabricBlue: THREE.MeshLambertMaterial;
  public lanternGlow: THREE.MeshBasicMaterial;
  public fireFlames: THREE.MeshBasicMaterial;
  public smoke: THREE.MeshBasicMaterial;
  public goldCoin: THREE.MeshStandardMaterial;

  // Placement highlights
  public slotValid: THREE.MeshBasicMaterial;
  public slotInvalid: THREE.MeshBasicMaterial;
  public ghostMat: THREE.MeshLambertMaterial;

  // Shared geometric meshes
  public treeFoliageA: THREE.MeshLambertMaterial;
  public treeFoliageB: THREE.MeshLambertMaterial;
  public treeFoliageC: THREE.MeshLambertMaterial;
  public flowerPetal: THREE.MeshLambertMaterial;

  private constructor() {
    this.grass = new THREE.MeshLambertMaterial({ color: 0x4fa838 });
    this.darkGrass = new THREE.MeshLambertMaterial({ color: 0x3d8c2b });
    this.earth = new THREE.MeshLambertMaterial({ color: 0x8a5d3b });
    this.darkSoil = new THREE.MeshLambertMaterial({ color: 0x4a3222 });
    this.stone = new THREE.MeshLambertMaterial({ color: 0x8c9199 });
    this.darkStone = new THREE.MeshLambertMaterial({ color: 0x62666d });
    this.field = new THREE.MeshLambertMaterial({ color: 0xd9a738 });
    
    this.water = new THREE.MeshStandardMaterial({
      color: 0x2b8fe6,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88
    });

    this.wood = new THREE.MeshLambertMaterial({ color: 0x935f34 });
    this.darkWood = new THREE.MeshLambertMaterial({ color: 0x5c3a1e });
    this.thatch = new THREE.MeshLambertMaterial({ color: 0xc89e4c });
    this.terracotta = new THREE.MeshLambertMaterial({ color: 0xcc5432 });
    this.whitePlaster = new THREE.MeshLambertMaterial({ color: 0xf2ece1 });

    this.fabricPink = new THREE.MeshLambertMaterial({ color: 0xeb407a });
    this.fabricYellow = new THREE.MeshLambertMaterial({ color: 0xfbc02d });
    this.fabricBlue = new THREE.MeshLambertMaterial({ color: 0x29b6f6 });

    this.lanternGlow = new THREE.MeshBasicMaterial({ color: 0xffb300 });
    this.fireFlames = new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.9 });
    this.smoke = new THREE.MeshBasicMaterial({ color: 0x555555, transparent: true, opacity: 0.4 });
    this.goldCoin = new THREE.MeshStandardMaterial({ color: 0xffc107, metalness: 0.8, roughness: 0.3 });

    this.slotValid = new THREE.MeshBasicMaterial({
      color: 0x66bb6a,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });

    this.slotInvalid = new THREE.MeshBasicMaterial({
      color: 0xef5350,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });

    this.ghostMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65
    });

    this.treeFoliageA = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    this.treeFoliageB = new THREE.MeshLambertMaterial({ color: 0x388e3c });
    this.treeFoliageC = new THREE.MeshLambertMaterial({ color: 0x43a047 });
    this.flowerPetal = new THREE.MeshLambertMaterial({ color: 0xff4081 });
  }

  public static get(): Materials {
    if (!Materials.instance) {
      Materials.instance = new Materials();
    }
    return Materials.instance;
  }
}

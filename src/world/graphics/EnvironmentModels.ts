import * as THREE from 'three';
import { Materials } from './Materials';
import { LandmarkKind } from '../data/tileLibrary';

export class EnvironmentModels {
  private static mats = Materials.get();

  /** Creates a low-poly tree with randomized scale & foliage type */
  public static createTree(variant: 'pine' | 'round' | 'banyan' | 'blossom' = 'round', seed = 0): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.35, 6);
    const trunkMat = mats.wood;
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.175;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    if (variant === 'pine') {
      // 3 Tier cone pine
      const tier1 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.3, 6), mats.treeFoliageA);
      tier1.position.y = 0.32;
      tier1.castShadow = true;
      group.add(tier1);

      const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.25, 6), mats.treeFoliageB);
      tier2.position.y = 0.46;
      tier2.castShadow = true;
      group.add(tier2);

      const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.2, 6), mats.treeFoliageC);
      tier3.position.y = 0.58;
      tier3.castShadow = true;
      group.add(tier3);
    } else if (variant === 'round') {
      // Rounded icosahedron canopy
      const canopyGeo = new THREE.DodecahedronGeometry(0.22, 1);
      const canopy = new THREE.Mesh(canopyGeo, mats.treeFoliageB);
      canopy.position.y = 0.42;
      canopy.scale.set(1, 1.15, 1);
      canopy.castShadow = true;
      group.add(canopy);
    } else if (variant === 'blossom') {
      // Pink blossoming fruit tree
      const canopyGeo = new THREE.DodecahedronGeometry(0.2, 1);
      const canopy = new THREE.Mesh(canopyGeo, mats.fabricPink);
      canopy.position.y = 0.4;
      canopy.castShadow = true;
      group.add(canopy);
    } else if (variant === 'banyan') {
      // Banyan with wide canopy
      const wideCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 1), mats.treeFoliageA);
      wideCanopy.position.y = 0.45;
      wideCanopy.scale.set(1.4, 0.8, 1.4);
      wideCanopy.castShadow = true;
      group.add(wideCanopy);

      // Aerial roots
      for (let i = 0; i < 3; i++) {
        const root = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.35, 4), mats.darkWood);
        const ang = (i * Math.PI * 2) / 3;
        root.position.set(Math.cos(ang) * 0.18, 0.175, Math.sin(ang) * 0.18);
        root.castShadow = true;
        group.add(root);
      }
    }

    const s = 0.85 + (seed % 30) * 0.01;
    group.scale.set(s, s, s);
    return group;
  }

  /** Creates Farmhouse with thatched roof, crops, and fence */
  public static createFarm(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Main cottage base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.25, 0.32), mats.whitePlaster);
    base.position.set(-0.1, 0.125, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Thatched gabled roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.24, 4), mats.thatch);
    roof.position.set(-0.1, 0.35, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.3, 1, 1.1);
    roof.castShadow = true;
    group.add(roof);

    // Wooden door
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.02), mats.wood);
    door.position.set(-0.1, 0.07, 0.165);
    group.add(door);

    // Hay bale
    const hay = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8), mats.field);
    hay.rotation.z = Math.PI / 2;
    hay.position.set(0.2, 0.06, -0.15);
    hay.castShadow = true;
    group.add(hay);

    // Wheat crop patches
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const stalk = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.16, 5), mats.field);
        stalk.position.set(0.1 + c * 0.1, 0.08, 0.05 + r * 0.1);
        stalk.castShadow = true;
        group.add(stalk);
      }
    }

    return group;
  }

  /** Creates Village Houses */
  public static createHouses(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // House 1
    const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.28), mats.whitePlaster);
    h1.position.set(-0.15, 0.12, -0.1);
    h1.castShadow = true;
    group.add(h1);

    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.2, 4), mats.terracotta);
    roof1.position.set(-0.15, 0.32, -0.1);
    roof1.rotation.y = Math.PI / 4;
    roof1.scale.set(1.2, 1, 1.1);
    roof1.castShadow = true;
    group.add(roof1);

    // House 2
    const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.24), mats.whitePlaster);
    h2.position.set(0.18, 0.1, 0.12);
    h2.castShadow = true;
    group.add(h2);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.18, 4), mats.terracotta);
    roof2.position.set(0.18, 0.27, 0.12);
    roof2.rotation.y = Math.PI / 4;
    roof2.scale.set(1.2, 1, 1.1);
    roof2.castShadow = true;
    group.add(roof2);

    // Stone well in center
    const well = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.08, 8), mats.stone);
    well.position.set(0.05, 0.04, -0.12);
    well.castShadow = true;
    group.add(well);

    return group;
  }

  /** Creates Weaving Hut with Handloom */
  public static createWeavingHut(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Round clay hut
    const hut = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.26, 8), mats.earth);
    hut.position.set(-0.12, 0.13, 0);
    hut.castShadow = true;
    group.add(hut);

    // Conical thatch roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.22, 8), mats.thatch);
    roof.position.set(-0.12, 0.36, 0);
    roof.castShadow = true;
    group.add(roof);

    // Handloom frame (timber posts + beam)
    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 4), mats.wood);
    post1.position.set(0.18, 0.11, -0.1);
    post1.castShadow = true;
    group.add(post1);

    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 4), mats.wood);
    post2.position.set(0.18, 0.11, 0.1);
    post2.castShadow = true;
    group.add(post2);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.24), mats.wood);
    topBeam.position.set(0.18, 0.22, 0);
    group.add(topBeam);

    // Hanging colourful cloth
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.15), mats.fabricPink);
    cloth.position.set(0.18, 0.14, 0);
    cloth.rotation.y = Math.PI / 2;
    group.add(cloth);

    return group;
  }

  /** Creates Pottery Workshop with Kiln */
  public static createPotteryWorkshop(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Brick Kiln
    const kiln = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 8), mats.terracotta);
    kiln.position.set(-0.14, 0.16, -0.05);
    kiln.castShadow = true;
    group.add(kiln);

    // Work table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.16), mats.wood);
    table.position.set(0.15, 0.08, 0.08);
    table.castShadow = true;
    group.add(table);

    // Clay Pots on table & ground
    for (let i = 0; i < 3; i++) {
      const pot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 1), mats.terracotta);
      pot.position.set(0.08 + i * 0.07, 0.15, 0.08);
      pot.scale.set(1, 1.2, 1);
      pot.castShadow = true;
      group.add(pot);
    }

    return group;
  }

  /** Creates Lumber Camp with Logs */
  public static createLumberCamp(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.3), mats.darkWood);
    cabin.position.set(-0.12, 0.11, -0.08);
    cabin.castShadow = true;
    group.add(cabin);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.18, 4), mats.wood);
    roof.position.set(-0.12, 0.29, -0.08);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.3, 1, 1.1);
    roof.castShadow = true;
    group.add(roof);

    // Stacked logs
    for (let i = 0; i < 3; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.28, 6), mats.wood);
      log.rotation.z = Math.PI / 2;
      log.position.set(0.18, 0.04 + (i > 1 ? 0.06 : 0), -0.05 + (i % 2) * 0.09);
      log.castShadow = true;
      group.add(log);
    }

    return group;
  }

  /** Creates Quarry with Stone & Scaffold Crane */
  public static createQuarry(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Large stone blocks
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.2), mats.stone);
    b1.position.set(-0.1, 0.08, -0.1);
    b1.castShadow = true;
    group.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.16), mats.darkStone);
    b2.position.set(0.12, 0.06, -0.05);
    b2.castShadow = true;
    group.add(b2);

    // Crane Mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.45, 4), mats.wood);
    mast.position.set(0.1, 0.225, 0.12);
    mast.castShadow = true;
    group.add(mast);

    // Crane Jib
    const jib = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 4), mats.wood);
    jib.position.set(0.02, 0.4, 0.08);
    jib.rotation.z = Math.PI / 4;
    group.add(jib);

    return group;
  }

  /** Creates Haat Marketplace with canopied stalls */
  public static createHaatMarket(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Central marketplace stone flagstone
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.5, 0.04, 6), mats.stone);
    plaza.position.set(0, 0.02, 0);
    plaza.receiveShadow = true;
    group.add(plaza);

    // Stall 1 (Pink/Red Canopy)
    const s1 = this.createMarketStall(mats.fabricPink);
    s1.position.set(-0.2, 0, -0.15);
    s1.rotation.y = 0.4;
    group.add(s1);

    // Stall 2 (Yellow Canopy)
    const s2 = this.createMarketStall(mats.fabricYellow);
    s2.position.set(0.2, 0, -0.12);
    s2.rotation.y = -0.5;
    group.add(s2);

    // Stall 3 (Blue Canopy)
    const s3 = this.createMarketStall(mats.fabricBlue);
    s3.position.set(0, 0, 0.2);
    s3.rotation.y = Math.PI;
    group.add(s3);

    // Central Lantern Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6), mats.darkWood);
    pole.position.set(0, 0.225, 0);
    pole.castShadow = true;
    group.add(pole);

    const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 1), mats.lanternGlow);
    lantern.position.set(0, 0.42, 0);
    group.add(lantern);

    return group;
  }

  private static createMarketStall(canopyMat: THREE.Material): THREE.Group {
    const mats = this.mats;
    const stall = new THREE.Group();

    // Wooden table counter
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.12), mats.wood);
    table.position.set(0, 0.05, 0);
    table.castShadow = true;
    stall.add(table);

    // 4 Canopy poles
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 4), mats.wood);
    p1.position.set(-0.1, 0.14, -0.05);
    stall.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 4), mats.wood);
    p2.position.set(0.1, 0.14, -0.05);
    stall.add(p2);

    const p3 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 4), mats.wood);
    p3.position.set(-0.1, 0.14, 0.05);
    stall.add(p3);

    const p4 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.28, 4), mats.wood);
    p4.position.set(0.1, 0.14, 0.05);
    stall.add(p4);

    // Sloped Fabric Canopy
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.1, 4), canopyMat);
    canopy.position.set(0, 0.28, 0);
    canopy.rotation.y = Math.PI / 4;
    canopy.scale.set(1.4, 0.8, 1);
    canopy.castShadow = true;
    stall.add(canopy);

    return stall;
  }

  /** Creates Music Pavilion */
  public static createPavilion(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Hexagonal plinth
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.06, 6), mats.stone);
    plinth.position.y = 0.03;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 6 Carved pillars
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 6), mats.wood);
      pillar.position.set(Math.cos(a) * 0.3, 0.19, Math.sin(a) * 0.3);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // Tiered Pagoda Roof
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.16, 6), mats.terracotta);
    roof1.position.y = 0.4;
    roof1.castShadow = true;
    group.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.14, 6), mats.terracotta);
    roof2.position.y = 0.52;
    roof2.castShadow = true;
    group.add(roof2);

    return group;
  }

  /** Creates Sacred Heritage Shrine */
  public static createShrine(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Stone Steps
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.05, 8), mats.stone);
    s1.position.y = 0.025;
    group.add(s1);

    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.05, 8), mats.stone);
    s2.position.y = 0.075;
    group.add(s2);

    // Central Stupa / Sanctum
    const stupa = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 1), mats.stone);
    stupa.position.y = 0.22;
    stupa.scale.set(1, 1.2, 1);
    stupa.castShadow = true;
    group.add(stupa);

    // Golden Finial
    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), mats.goldCoin);
    finial.position.y = 0.4;
    finial.castShadow = true;
    group.add(finial);

    // Glowing Diya Lamp
    const diya = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 1), mats.lanternGlow);
    diya.position.set(0, 0.12, 0.2);
    group.add(diya);

    return group;
  }

  /** Creates Interactive Treasure Chest */
  public static createTreasureChest(): { group: THREE.Group; lid: THREE.Mesh } {
    const mats = this.mats;
    const group = new THREE.Group();

    // Chest Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.18, 0.22), mats.wood);
    body.position.y = 0.09;
    body.castShadow = true;
    group.add(body);

    // Metal banding
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.19, 0.04), mats.goldCoin);
    band.position.y = 0.09;
    group.add(band);

    // Hinged Lid
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 8, 1, false, 0, Math.PI), mats.wood);
    lid.rotation.z = Math.PI / 2;
    lid.position.set(0, 0.18, -0.11);
    lid.castShadow = true;
    group.add(lid);

    return { group, lid };
  }

  /** Builds landmark by kind */
  public static buildLandmark(kind: LandmarkKind): THREE.Group {
    switch (kind) {
      case 'farmhouse':
        return this.createFarm();
      case 'houses':
        return this.createHouses();
      case 'weaving_hut':
        return this.createWeavingHut();
      case 'pottery':
        return this.createPotteryWorkshop();
      case 'lumber_camp':
        return this.createLumberCamp();
      case 'quarry':
        return this.createQuarry();
      case 'haat':
        return this.createHaatMarket();
      case 'pavilion':
        return this.createPavilion();
      case 'shrine':
        return this.createShrine();
      default:
        return new THREE.Group();
    }
  }
}

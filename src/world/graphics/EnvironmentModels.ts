import * as THREE from 'three';
import { Materials } from './Materials';
import { LandmarkKind } from '../data/tileLibrary';
import { CulturalModelBuilder } from './CulturalModelBuilder';

export class EnvironmentModels {
  private static mats = Materials.get();

  // =========================================================================
  // 1. HIGH-QUALITY STYLIZED 3D TREE LIBRARY
  // =========================================================================

  /** Creates a rich stylized tree with organic branching and layered foliage */
  public static createTree(variant: 'pine' | 'round' | 'banyan' | 'blossom' | 'palm' = 'round', seed = 0): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    if (variant === 'palm') {
      return this.createPalmTree(seed);
    }

    // Organic tapered Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.045, 0.08, 0.42, 8);
    const trunk = new THREE.Mesh(trunkGeo, mats.wood);
    trunk.position.y = 0.21;
    trunk.rotation.z = (Math.sin(seed) * 0.08);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // Root flares
    for (let i = 0; i < 3; i++) {
      const ang = (i * Math.PI * 2) / 3 + seed;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.12, 4), mats.wood);
      root.position.set(Math.cos(ang) * 0.06, 0.04, Math.sin(ang) * 0.06);
      root.rotation.x = Math.sin(ang) * 0.4;
      root.rotation.z = Math.cos(ang) * 0.4;
      root.castShadow = true;
      group.add(root);
    }

    if (variant === 'pine') {
      // 3-Tier Layered Soft Pine / Cypress
      const tiers = [
        { y: 0.32, r: 0.26, h: 0.28, mat: mats.treeFoliageC },
        { y: 0.48, r: 0.21, h: 0.24, mat: mats.treeFoliageB },
        { y: 0.62, r: 0.15, h: 0.20, mat: mats.treeFoliageA }
      ];
      tiers.forEach((t) => {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r, t.h, 7), t.mat);
        cone.position.y = t.y;
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);
      });
    } else if (variant === 'blossom') {
      // Lush Pink Blossom Tree with multi-cluster crown
      const clusters = [
        { x: 0, y: 0.44, z: 0, s: 0.24 },
        { x: -0.12, y: 0.38, z: 0.08, s: 0.18 },
        { x: 0.11, y: 0.40, z: -0.06, s: 0.19 },
        { x: 0.04, y: 0.52, z: 0.05, s: 0.16 }
      ];
      clusters.forEach((c) => {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(c.s, 1), mats.blossomPink);
        mesh.position.set(c.x, c.y, c.z);
        mesh.castShadow = true;
        group.add(mesh);
      });
    } else if (variant === 'banyan') {
      // Sprawling Tropical Banyan with aerial roots
      const mainCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 1), mats.treeFoliageA);
      mainCrown.position.y = 0.46;
      mainCrown.scale.set(1.4, 0.75, 1.3);
      mainCrown.castShadow = true;
      group.add(mainCrown);

      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI * 2) / 4 + 0.3;
        const root = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.4, 5), mats.darkWood);
        root.position.set(Math.cos(a) * 0.22, 0.2, Math.sin(a) * 0.22);
        root.castShadow = true;
        group.add(root);
      }
    } else {
      // Rich Deciduous Oak (Multi-layer foliage clusters)
      const clusters = [
        { x: 0, y: 0.44, z: 0, r: 0.25, mat: mats.treeFoliageB },
        { x: -0.11, y: 0.38, z: 0.09, r: 0.18, mat: mats.treeFoliageA },
        { x: 0.12, y: 0.40, z: -0.07, r: 0.19, mat: mats.treeFoliageC },
        { x: -0.06, y: 0.48, z: -0.08, r: 0.17, mat: mats.treeFoliageB },
        { x: 0.05, y: 0.54, z: 0.04, r: 0.16, mat: mats.treeFoliageA }
      ];
      clusters.forEach((c) => {
        const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(c.r, 1), c.mat);
        mesh.position.set(c.x, c.y, c.z);
        mesh.scale.set(1.05, 0.95, 1.05);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
      });
    }

    const s = 0.88 + (seed % 20) * 0.012;
    group.scale.set(s, s, s);
    return group;
  }

  /** Creates Tropical Coconut Palm with curved trunk and radial fronds */
  public static createPalmTree(seed = 0): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Curved Trunk with ring segments
    const segments = 5;
    const segHeight = 0.09;
    let currX = 0;
    let currY = 0;
    const curveDir = Math.sin(seed) * 0.035;

    for (let i = 0; i < segments; i++) {
      const nextX = currX + curveDir * (i + 1);
      const nextY = currY + segHeight;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.04 - i * 0.003, 0.045 - i * 0.003, segHeight, 6), mats.wood);
      seg.position.set((currX + nextX) / 2, (currY + nextY) / 2, 0);
      seg.rotation.z = -curveDir * 3;
      seg.castShadow = true;
      group.add(seg);
      currX = nextX;
      currY = nextY;
    }

    // Top Fronds
    const frondCount = 6;
    for (let f = 0; f < frondCount; f++) {
      const a = (f * Math.PI * 2) / frondCount;
      const frond = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.36), mats.palmFrond);
      frond.position.set(currX + Math.cos(a) * 0.12, currY + 0.02, Math.sin(a) * 0.12);
      frond.rotation.y = -a;
      frond.rotation.x = Math.PI / 3;
      frond.castShadow = true;
      group.add(frond);
    }

    // Coconuts
    for (let c = 0; c < 3; c++) {
      const ca = (c * Math.PI * 2) / 3;
      const nut = new THREE.Mesh(new THREE.DodecahedronGeometry(0.03, 0), mats.darkWood);
      nut.position.set(currX + Math.cos(ca) * 0.04, currY - 0.02, Math.sin(ca) * 0.04);
      group.add(nut);
    }

    return group;
  }

  // =========================================================================
  // 2. PRODUCTION QUALITY BUILDINGS & WORKSHOPS
  // =========================================================================

  /**
   * Creates Detailed Production-Quality Farmhouse
   * Includes stone base, plaster walls, wooden beams, terracotta roof,
   * chimney + smoke, glowing windows, crop field with furrow rows, and fence.
   */
  public static createFarm(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Stone Foundation Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.44), mats.stone);
    plinth.position.set(-0.12, 0.04, -0.05);
    plinth.receiveShadow = true;
    plinth.castShadow = true;
    group.add(plinth);

    // 2. Main Cottage Walls (Plaster + Corner Timber Beams)
    const cottage = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.38), mats.whitePlaster);
    cottage.position.set(-0.12, 0.22, -0.05);
    cottage.castShadow = true;
    cottage.receiveShadow = true;
    group.add(cottage);

    // Timber corner posts
    const beamOffsets = [
      { x: -0.34, z: -0.23 }, { x: 0.10, z: -0.23 },
      { x: -0.34, z: 0.13 }, { x: 0.10, z: 0.13 }
    ];
    beamOffsets.forEach((b) => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.04), mats.darkWood);
      beam.position.set(b.x, 0.22, b.z);
      beam.castShadow = true;
      group.add(beam);
    });

    // 3. Multi-Pitched Terracotta Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.26, 4), mats.terracotta);
    roof.position.set(-0.12, 0.48, -0.05);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.35, 1, 1.15);
    roof.castShadow = true;
    group.add(roof);

    // 4. Chimney with Brick Strata & Smoke Puff
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.08), mats.terracotta);
    chimney.position.set(0.04, 0.52, -0.12);
    chimney.castShadow = true;
    group.add(chimney);

    const smokePuff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 1), mats.smoke);
    smokePuff.position.set(0.04, 0.70, -0.12);
    group.add(smokePuff);

    // 5. Wooden Front Door & Windows with Interior Warm Light
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.16, 0.02), mats.wood);
    door.position.set(-0.12, 0.16, 0.145);
    group.add(door);

    const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), mats.windowGlow);
    win1.position.set(-0.25, 0.24, 0.145);
    group.add(win1);

    const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), mats.windowGlow);
    win2.position.set(0.02, 0.24, 0.145);
    group.add(win2);

    // 6. Farm Field with Furrow Crop Rows (Golden Wheat)
    const fieldPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.52), mats.field);
    fieldPlinth.position.set(0.24, 0.02, 0.12);
    fieldPlinth.receiveShadow = true;
    group.add(fieldPlinth);

    // 3 Rows of swaying wheat crops
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const crop = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 5), mats.field);
        crop.position.set(0.08 + col * 0.11, 0.09, -0.06 + row * 0.16);
        crop.rotation.z = (Math.random() - 0.5) * 0.2;
        crop.castShadow = true;
        group.add(crop);
      }
    }

    // 7. Hay Bales & Wooden Barrel Props
    const hayBale = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 8), mats.field);
    hayBale.rotation.z = Math.PI / 2;
    hayBale.position.set(-0.32, 0.08, 0.22);
    hayBale.castShadow = true;
    group.add(hayBale);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.12, 6), mats.wood);
    barrel.position.set(0.05, 0.06, 0.22);
    barrel.castShadow = true;
    group.add(barrel);

    // 8. Wooden Split-Rail Fence
    const fencePosts = [
      { x: 0.02, z: 0.38 }, { x: 0.24, z: 0.38 }, { x: 0.46, z: 0.38 }
    ];
    fencePosts.forEach((fp) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.16, 4), mats.wood);
      p.position.set(fp.x, 0.08, fp.z);
      p.castShadow = true;
      group.add(p);
    });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.02), mats.wood);
    rail.position.set(0.24, 0.12, 0.38);
    group.add(rail);

    return group;
  }

  /**
   * Creates Village Houses with Multi-Tier Terracotta Roofs and Stone Well
   */
  public static createHouses(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // House 1 (Main Village Villa)
    const h1Base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.36), mats.whitePlaster);
    h1Base.position.set(-0.16, 0.14, -0.1);
    h1Base.castShadow = true;
    h1Base.receiveShadow = true;
    group.add(h1Base);

    const h1Roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.24, 4), mats.terracotta);
    h1Roof.position.set(-0.16, 0.38, -0.1);
    h1Roof.rotation.y = Math.PI / 4;
    h1Roof.scale.set(1.3, 1, 1.15);
    h1Roof.castShadow = true;
    group.add(h1Roof);

    // Window glows
    const w1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), mats.windowGlow);
    w1.position.set(-0.16, 0.16, 0.085);
    group.add(w1);

    // House 2 (Cottage 2)
    const h2Base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.28), mats.whitePlaster);
    h2Base.position.set(0.22, 0.11, 0.12);
    h2Base.castShadow = true;
    group.add(h2Base);

    const h2Roof = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.2, 4), mats.terracotta);
    h2Roof.position.set(0.22, 0.31, 0.12);
    h2Roof.rotation.y = Math.PI / 4;
    h2Roof.scale.set(1.25, 1, 1.15);
    h2Roof.castShadow = true;
    group.add(h2Roof);

    // Central Stone Water Well with Canopy
    const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.11, 0.12, 8), mats.cobblestone);
    wellBase.position.set(0.06, 0.06, -0.15);
    wellBase.castShadow = true;
    group.add(wellBase);

    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 4), mats.wood);
    p1.position.set(0.01, 0.18, -0.15);
    group.add(p1);
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 4), mats.wood);
    p2.position.set(0.11, 0.18, -0.15);
    group.add(p2);

    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.10, 4), mats.terracotta);
    wellRoof.position.set(0.06, 0.32, -0.15);
    wellRoof.rotation.y = Math.PI / 4;
    wellRoof.castShadow = true;
    group.add(wellRoof);

    return group;
  }

  /**
   * Creates Haat Marketplace & Seaside Boardwalk
   * Includes wooden pier, multi-stall shops with striped canvas awnings,
   * baskets, jars, fruit crates, lantern poles, and flags.
   */
  public static createHaatMarket(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Large Boardwalk Pier Foundation (Wooden Decking)
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.84), mats.woodPlanks);
    pier.position.set(0, 0.03, 0);
    pier.receiveShadow = true;
    pier.castShadow = true;
    group.add(pier);

    // Pier Pilings
    const pilings = [
      { x: -0.42, z: -0.38 }, { x: 0.42, z: -0.38 },
      { x: -0.42, z: 0.38 }, { x: 0.42, z: 0.38 }
    ];
    pilings.forEach((p) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.2, 6), mats.darkWood);
      post.position.set(p.x, -0.06, p.z);
      post.castShadow = true;
      group.add(post);
    });

    // 2. Market Stalls
    // Stall 1 (Pink/White Striped Handloom Cloth Stall)
    const s1 = this.createDetailedStall(mats.fabricPinkStripe, 'cloth');
    s1.position.set(-0.24, 0.06, -0.18);
    s1.rotation.y = 0.3;
    group.add(s1);

    // Stall 2 (Yellow/White Striped Spice & Grain Stall)
    const s2 = this.createDetailedStall(mats.fabricYellowStripe, 'grain');
    s2.position.set(0.24, 0.06, -0.15);
    s2.rotation.y = -0.4;
    group.add(s2);

    // Stall 3 (Blue/White Striped Pottery & Craft Stall)
    const s3 = this.createDetailedStall(mats.fabricBlueStripe, 'pottery');
    s3.position.set(0, 0.06, 0.24);
    s3.rotation.y = Math.PI;
    group.add(s3);

    // 3. Central Festival Lantern Tower
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.65, 6), mats.darkWood);
    tower.position.set(0, 0.32, 0);
    tower.castShadow = true;
    group.add(tower);

    const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.07, 1), mats.lanternGlow);
    lantern.position.set(0, 0.62, 0);
    group.add(lantern);

    // Hanging Festival Banners
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.26), mats.fabricBanner);
    banner.position.set(0.08, 0.48, 0);
    banner.rotation.y = Math.PI / 2;
    group.add(banner);

    // 4. Moored Wooden Boat
    const boat = this.createBoat();
    boat.position.set(0.48, 0.02, 0.38);
    boat.rotation.y = -0.6;
    group.add(boat);

    return group;
  }

  private static createDetailedStall(canopyMat: THREE.Material, type: 'cloth' | 'grain' | 'pottery'): THREE.Group {
    const mats = this.mats;
    const stall = new THREE.Group();

    // Wooden Counter Table
    const counter = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.16), mats.wood);
    counter.position.set(0, 0.06, 0);
    counter.castShadow = true;
    stall.add(counter);

    // 4 Canopy Timber Posts
    const pX = [-0.14, 0.14];
    const pZ = [-0.07, 0.07];
    pX.forEach(x => {
      pZ.forEach(z => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 4), mats.darkWood);
        post.position.set(x, 0.18, z);
        stall.add(post);
      });
    });

    // Curved Striped Awning
    const awning = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.14, 4), canopyMat);
    awning.position.set(0, 0.36, 0);
    awning.rotation.y = Math.PI / 4;
    awning.scale.set(1.5, 0.8, 1.1);
    awning.castShadow = true;
    stall.add(awning);

    // Goods on Counter
    if (type === 'pottery') {
      for (let i = 0; i < 3; i++) {
        const pot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035, 1), mats.clayPot);
        pot.position.set(-0.08 + i * 0.08, 0.15, 0);
        stall.add(pot);
      }
    } else if (type === 'grain') {
      const sack = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 0), mats.thatch);
      sack.position.set(-0.06, 0.15, 0);
      stall.add(sack);

      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.06, 6), mats.wood);
      basket.position.set(0.06, 0.15, 0);
      stall.add(basket);
    } else {
      const clothRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), mats.fabricPinkStripe);
      clothRoll.rotation.z = Math.PI / 2;
      clothRoll.position.set(0, 0.15, 0);
      stall.add(clothRoll);
    }

    return stall;
  }

  /** Creates Moored Fishing / Haat Boat */
  private static createBoat(): THREE.Group {
    const mats = this.mats;
    const boat = new THREE.Group();

    const hull = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), mats.wood);
    hull.rotation.x = Math.PI / 2;
    hull.rotation.y = Math.PI / 4;
    hull.scale.set(1, 1.8, 0.5);
    hull.castShadow = true;
    boat.add(hull);

    // Sail mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.32, 4), mats.darkWood);
    mast.position.set(0, 0.16, 0);
    boat.add(mast);

    const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.22), mats.whitePlaster);
    sail.position.set(0.07, 0.18, 0);
    sail.rotation.y = Math.PI / 2;
    boat.add(sail);

    return boat;
  }

  /** Creates Traditional Handloom Weaving Hut */
  public static createWeavingHut(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Round Plaster Hut
    const hut = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.28, 8), mats.whitePlaster);
    hut.position.set(-0.12, 0.14, 0);
    hut.castShadow = true;
    group.add(hut);

    // Thatched Conical Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.26, 8), mats.thatch);
    roof.position.set(-0.12, 0.40, 0);
    roof.castShadow = true;
    group.add(roof);

    // Handloom Framework outside
    const loom = new THREE.Group();
    loom.position.set(0.20, 0, 0);

    const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.26, 4), mats.darkWood);
    post1.position.set(0, 0.13, -0.1);
    loom.add(post1);
    const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.26, 4), mats.darkWood);
    post2.position.set(0, 0.13, 0.1);
    loom.add(post2);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.24), mats.darkWood);
    topBeam.position.set(0, 0.25, 0);
    loom.add(topBeam);

    // Hanging handwoven cloth runner
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.18), mats.fabricPinkStripe);
    cloth.position.set(0, 0.16, 0);
    cloth.rotation.y = Math.PI / 2;
    loom.add(cloth);

    group.add(loom);
    return group;
  }

  /** Creates Pottery Workshop with Kiln Oven and Pots */
  public static createPotteryWorkshop(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Terracotta Kiln Dome
    const kiln = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.36, 8), mats.clayPot);
    kiln.position.set(-0.14, 0.18, -0.06);
    kiln.castShadow = true;
    group.add(kiln);

    // Kiln fire opening
    const opening = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 0), mats.fireFlames);
    opening.position.set(-0.14, 0.08, 0.12);
    group.add(opening);

    // Workbench with clay pots
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.10, 0.18), mats.wood);
    bench.position.set(0.16, 0.08, 0.08);
    bench.castShadow = true;
    group.add(bench);

    for (let i = 0; i < 3; i++) {
      const pot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 1), mats.clayPot);
      pot.position.set(0.08 + i * 0.08, 0.17, 0.08);
      group.add(pot);
    }

    return group;
  }

  /** Creates Lumber Camp with Cabin and Stacked Logs */
  public static createLumberCamp(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.24, 0.32), mats.darkWood);
    cabin.position.set(-0.14, 0.12, -0.08);
    cabin.castShadow = true;
    group.add(cabin);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.20, 4), mats.wood);
    roof.position.set(-0.14, 0.32, -0.08);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.3, 1, 1.15);
    roof.castShadow = true;
    group.add(roof);

    // Stacked Timber Logs
    for (let i = 0; i < 4; i++) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.32, 6), mats.wood);
      log.rotation.z = Math.PI / 2;
      const layer = i < 2 ? 0.04 : 0.10;
      const zOff = (i % 2 === 0 ? -0.05 : 0.05);
      log.position.set(0.18, layer, zOff);
      log.castShadow = true;
      group.add(log);
    }

    return group;
  }

  /** Creates Stone Quarry with Derrick Crane */
  public static createQuarry(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.24), mats.stone);
    b1.position.set(-0.12, 0.09, -0.1);
    b1.castShadow = true;
    group.add(b1);

    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.18), mats.cliffRock);
    b2.position.set(0.14, 0.07, -0.05);
    b2.castShadow = true;
    group.add(b2);

    // Timber Derrick Crane
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.52, 4), mats.wood);
    mast.position.set(0.10, 0.26, 0.14);
    mast.castShadow = true;
    group.add(mast);

    const jib = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.34, 4), mats.wood);
    jib.position.set(0.01, 0.44, 0.10);
    jib.rotation.z = Math.PI / 4;
    group.add(jib);

    return group;
  }

  /** Creates Music & Cultural Pavilion */
  public static createPavilion(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 0.08, 6), mats.cobblestone);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 6 Carved Pillars
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.36, 6), mats.wood);
      pillar.position.set(Math.cos(a) * 0.34, 0.22, Math.sin(a) * 0.34);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // Two-Tiered Terracotta Pagoda Roof
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.18, 6), mats.terracotta);
    roof1.position.y = 0.45;
    roof1.castShadow = true;
    group.add(roof1);

    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.14, 6), mats.terracotta);
    roof2.position.y = 0.58;
    roof2.castShadow = true;
    group.add(roof2);

    return group;
  }

  /** Creates Hilltop Heritage Shrine / Watchtower */
  public static createShrine(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // Terraced Stone Steps
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.06, 8), mats.stone);
    s1.position.y = 0.03;
    group.add(s1);

    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.30, 0.06, 8), mats.stone);
    s2.position.y = 0.09;
    group.add(s2);

    // Watchtower Sanctuary
    const sanctum = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.36, 0.32), mats.whitePlaster);
    sanctum.position.y = 0.27;
    sanctum.castShadow = true;
    group.add(sanctum);

    // Golden Finial & Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.22, 4), mats.terracotta);
    roof.position.y = 0.52;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), mats.goldCoin);
    finial.position.y = 0.68;
    finial.castShadow = true;
    group.add(finial);

    // Glowing Diya Lamp
    const diya = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 1), mats.lanternGlow);
    diya.position.set(0, 0.14, 0.22);
    group.add(diya);

    return group;
  }

  /** Creates Interactive Gold-Trimmed Treasure Chest */
  public static createTreasureChest(): { group: THREE.Group; lid: THREE.Mesh } {
    const mats = this.mats;
    const group = new THREE.Group();

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.20, 0.24), mats.darkWood);
    body.position.y = 0.10;
    body.castShadow = true;
    group.add(body);

    const band = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.21, 0.05), mats.goldCoin);
    band.position.y = 0.10;
    group.add(band);

    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 8, 1, false, 0, Math.PI), mats.wood);
    lid.rotation.z = Math.PI / 2;
    lid.position.set(0, 0.20, -0.12);
    lid.castShadow = true;
    group.add(lid);

    return { group, lid };
  }

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
      case 'bihar_workshop':
        return CulturalModelBuilder.createBiharWorkshop();
      case 'maha_watchtower':
        return CulturalModelBuilder.createMaharashtraWatchtower();
      case 'bengal_pandal':
        return CulturalModelBuilder.createBengalPandal();
      case 'karnataka_toy_shop':
        return CulturalModelBuilder.createKarnatakaToyShop();
      case 'gujarat_textile':
        return CulturalModelBuilder.createGujaratTextile();
      case 'rajasthan_haveli':
        return CulturalModelBuilder.createRajasthanHaveli();
      default:
        return new THREE.Group();
    }
  }
}

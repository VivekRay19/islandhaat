import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';

export class CulturalModelBuilder {
  private static mats = Materials.get();

  // =========================================================================
  // 1. BIHAR — MITHILA ART WORKSHOP & SIKKI CRAFT HOUSE
  // =========================================================================

  public static createBiharWorkshop(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Earthen Courtyard Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.48), mats.earth);
    plinth.position.set(-0.1, 0.04, 0);
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Rural Earthen Cottage Walls (Warm clay/cream plaster)
    const cottage = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.26, 0.36), mats.whitePlaster);
    cottage.position.set(-0.1, 0.21, 0);
    cottage.castShadow = true;
    group.add(cottage);

    // 3. Madhubani Painted Mural Panel (Exterior Wall)
    const mural = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), mats.fabricYellowStripe);
    mural.position.set(-0.1, 0.22, 0.185);
    group.add(mural);

    // Mural border frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.02), mats.darkWood);
    frame.position.set(-0.1, 0.22, 0.18);
    group.add(frame);

    // 4. Sloped Thatched Roof with Overhang
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.24, 4), mats.thatch);
    roof.position.set(-0.1, 0.44, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 0.9, 1.2);
    roof.castShadow = true;
    group.add(roof);

    // 5. Sikki Golden Grass Craft Baskets on Courtyard Ground
    for (let i = 0; i < 3; i++) {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.06, 6), mats.thatch);
      basket.position.set(0.18 + (i % 2) * 0.08, 0.07, -0.08 + i * 0.09);
      basket.castShadow = true;
      group.add(basket);
    }

    // 6. Terracotta Clay Pots & Diyas
    const pot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 1), mats.clayPot);
    pot.position.set(0.12, 0.08, 0.18);
    pot.castShadow = true;
    group.add(pot);

    const diya = new THREE.Mesh(new THREE.DodecahedronGeometry(0.03, 1), mats.lanternGlow);
    diya.position.set(0.04, 0.06, 0.18);
    group.add(diya);

    return group;
  }

  // =========================================================================
  // 2. MAHARASHTRA — SAHYADRI WATCHTOWER & HILL-FORT BASTION
  // =========================================================================

  public static createMaharashtraWatchtower(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Warm Stone Foundation Plinth (Sunlit Sahyadri stone)
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.50, 0.10, 8), mats.sahyadriWarmStone);
    plinth.position.y = 0.05;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Sunlit Stone Watchtower Cylinder (Hill-fort bastion style)
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.58, 8), mats.sahyadriSunlitStone);
    tower.position.y = 0.39;
    tower.castShadow = true;
    group.add(tower);

    // 3. Fort Parapet Crenellations (Warm masonry rim)
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.08, 8), mats.sahyadriWarmStone);
    rim.position.y = 0.72;
    rim.castShadow = true;
    group.add(rim);

    // 4. Saffron Maratha Flag Standard
    const flagpole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 4), mats.darkWood);
    flagpole.position.set(0, 0.90, 0);
    group.add(flagpole);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.12), mats.sahyadriSaffron);
    flag.position.set(0.09, 1.02, 0);
    flag.rotation.y = Math.PI / 2;
    group.add(flag);

    // 5. Fort Gateway Arch
    const gate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.04), mats.darkWood);
    gate.position.set(0, 0.19, 0.26);
    group.add(gate);

    // 6. Paithani Weaving Display with authentic teal silk and magenta border
    const loomPost = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.04), mats.wood);
    loomPost.position.set(-0.25, 0.11, -0.15);
    group.add(loomPost);

    const paithaniCloth = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.18), mats.paithaniTeal);
    paithaniCloth.position.set(-0.25, 0.12, -0.13);
    group.add(paithaniCloth);

    const paithaniBorder = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.04), mats.paithaniMagenta);
    paithaniBorder.position.set(-0.25, 0.05, -0.129);
    group.add(paithaniBorder);

    return group;
  }

  // =========================================================================
  // 3. WEST BENGAL — FESTIVAL PANDAL & BISHNUPUR TERRACOTTA HOUSE
  // =========================================================================

  public static createBengalPandal(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Brick & Clay Ghat Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.terracotta);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Bishnupur Terracotta Wall Base
    const sanctum = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.38), mats.terracotta);
    sanctum.position.y = 0.24;
    sanctum.castShadow = true;
    group.add(sanctum);

    // 3. Curved Do-Chala Bengal Style Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 4), mats.terracotta);
    roof.position.y = 0.50;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 0.85, 1.25);
    roof.castShadow = true;
    group.add(roof);

    // 4. Festive Pandal Archway (Fabric canopy at front)
    const archPole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 4), mats.wood);
    archPole1.position.set(-0.22, 0.21, 0.24);
    group.add(archPole1);

    const archPole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 4), mats.wood);
    archPole2.position.set(0.22, 0.21, 0.24);
    group.add(archPole2);

    const archCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.14, 4), mats.fabricPinkStripe);
    archCanopy.position.set(0, 0.42, 0.24);
    archCanopy.rotation.y = Math.PI / 4;
    archCanopy.scale.set(1.8, 0.7, 0.8);
    archCanopy.castShadow = true;
    group.add(archCanopy);

    // 5. Festival Lanterns / Diyas
    for (let i = 0; i < 2; i++) {
      const lamp = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 1), mats.lanternGlow);
      lamp.position.set(i === 0 ? -0.22 : 0.22, 0.36, 0.24);
      group.add(lamp);
    }

    return group;
  }

  // =========================================================================
  // 4. KARNATAKA — HAMPI PILLARED PAVILION & CHANNAPATNA TOY STUDIO
  // =========================================================================

  public static createKarnatakaToyShop(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Granite Stepped Plinth (Hampi architectural style)
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.08, 6), mats.stone);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Monolithic Carved Pillars (6 Pillars)
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.38, 0.045), mats.stone);
      pillar.position.set(Math.cos(a) * 0.32, 0.23, Math.sin(a) * 0.32);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // 3. Teak Wood Ceiling & Carved Cornice
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.08, 6), mats.darkWood);
    roof.position.y = 0.46;
    roof.castShadow = true;
    group.add(roof);

    const roofCupola = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 6), mats.terracotta);
    roofCupola.position.y = 0.58;
    roofCupola.castShadow = true;
    group.add(roofCupola);

    // 4. Central Channapatna Woodturning Lathe Workbench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.10, 0.16), mats.wood);
    bench.position.set(0, 0.09, 0);
    bench.castShadow = true;
    group.add(bench);

    // 5. Glossy Lacquered Channapatna Toys (Rainbow colors)
    const toy1 = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6), mats.fabricPinkStripe);
    toy1.position.set(-0.06, 0.18, 0.02);
    group.add(toy1);

    const toy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 1), mats.goldCoin);
    toy2.position.set(0.05, 0.17, -0.02);
    group.add(toy2);

    const toy3 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6), mats.fabricBlueStripe);
    toy3.position.set(0, 0.17, 0.04);
    group.add(toy3);

    return group;
  }

  // =========================================================================
  // 5. GUJARAT — PATOLA TEXTILE WORKSHOP & STEPWELL BAZAAR
  // =========================================================================

  public static createGujaratTextile(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Stone & Timber Trading Deck Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.woodPlanks);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Artisan Workshop Base
    const workshop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.34), mats.whitePlaster);
    workshop.position.set(-0.08, 0.21, -0.06);
    workshop.castShadow = true;
    group.add(workshop);

    // 3. Patola Geometric Striped Double-Ikat Canopy
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.22, 4), mats.fabricPinkStripe);
    canopy.position.set(-0.08, 0.44, -0.06);
    canopy.rotation.y = Math.PI / 4;
    canopy.scale.set(1.4, 0.85, 1.2);
    canopy.castShadow = true;
    group.add(canopy);

    // 4. Bandhani Tie-Dye Textile Drying Racks (Front)
    const rackPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 4), mats.wood);
    rackPost1.position.set(0.18, 0.16, 0.14);
    group.add(rackPost1);

    const rackPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 4), mats.wood);
    rackPost2.position.set(0.18, 0.16, -0.14);
    group.add(rackPost2);

    const rackBeam = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.30), mats.wood);
    rackBeam.position.set(0.18, 0.28, 0);
    group.add(rackBeam);

    const dyedCloth = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.18), mats.fabricYellowStripe);
    dyedCloth.position.set(0.18, 0.19, 0);
    dyedCloth.rotation.y = Math.PI / 2;
    group.add(dyedCloth);

    // 5. Merchant Brass Scales & Trade Baskets
    const brassChest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.10), mats.goldCoin);
    brassChest.position.set(-0.16, 0.08, 0.16);
    group.add(brassChest);

    return group;
  }

  // =========================================================================
  // 6. RAJASTHAN — SANDSTONE HAVELI & BLUE POTTERY WORKSHOP
  // =========================================================================

  public static createRajasthanHaveli(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Golden Sandstone Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.48), mats.cliffRock);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Haveli Two-Story Golden Sandstone Residence
    const haveli = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.38, 0.36), mats.stone);
    haveli.position.y = 0.27;
    haveli.castShadow = true;
    group.add(haveli);

    // 3. Ornate Jharokha Balcony (Upper floor oriel window)
    const jharokha = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.08), mats.stone);
    jharokha.position.set(0, 0.36, 0.21);
    jharokha.castShadow = true;
    group.add(jharokha);

    const jharokhaCanopy = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.08, 4), mats.terracotta);
    jharokhaCanopy.position.set(0, 0.46, 0.21);
    jharokhaCanopy.rotation.y = Math.PI / 4;
    group.add(jharokhaCanopy);

    // 4. Rooftop Chhatri Cupolas (Four corners / central)
    const chhatriPillars = [
      { x: -0.16, z: -0.12 }, { x: 0.16, z: -0.12 }
    ];
    chhatriPillars.forEach(cp => {
      const dome = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.10, 6), mats.terracotta);
      dome.position.set(cp.x, 0.52, cp.z);
      dome.castShadow = true;
      group.add(dome);
    });

    // 5. Jaipur Blue Pottery Display Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.14), mats.wood);
    table.position.set(0.16, 0.08, 0.15);
    table.castShadow = true;
    group.add(table);

    // Cobalt Blue Pottery Vases
    for (let i = 0; i < 3; i++) {
      const vase = new THREE.Mesh(new THREE.DodecahedronGeometry(0.038, 1), mats.fabricBlueStripe);
      vase.position.set(0.10 + i * 0.06, 0.15, 0.15);
      vase.scale.set(1, 1.3, 1);
      group.add(vase);
    }

    return group;
  }

  // =========================================================================
  // MASTER BUILDER DISPATCH
  // =========================================================================

  public static buildLandmarkForState(landmarkId: string, state: IndianState): THREE.Group {
    switch (state) {
      case 'bihar':
        return this.createBiharWorkshop();
      case 'maharashtra':
        return this.createMaharashtraWatchtower();
      case 'west_bengal':
        return this.createBengalPandal();
      case 'karnataka':
        return this.createKarnatakaToyShop();
      case 'gujarat':
        return this.createGujaratTextile();
      case 'rajasthan':
        return this.createRajasthanHaveli();
      default:
        return this.createBiharWorkshop();
    }
  }
}

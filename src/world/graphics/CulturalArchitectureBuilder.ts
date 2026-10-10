import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';

export class CulturalArchitectureBuilder {
  private static mats = Materials.get();

  // =========================================================================
  // 1. REGIONAL VILLAGE HOUSES
  // =========================================================================

  public static createHouse(state: IndianState): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    switch (state) {
      case 'bihar': {
        // Mithila Earthen Courtyard Cottage with painted murals & thatch
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.46), mats.earth);
        plinth.position.y = 0.04;
        plinth.receiveShadow = true;
        group.add(plinth);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.38), mats.ochrePlaster);
        walls.position.set(0, 0.22, 0);
        walls.castShadow = true;
        group.add(walls);

        // Exterior Madhubani Painted Mural Panel
        const mural = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.16), mats.madhubaniCanvas);
        mural.position.set(0, 0.22, 0.192);
        group.add(mural);

        // Authentic Thatched Bamboo Sloped Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.26, 4), mats.thatch);
        roof.position.set(0, 0.46, 0);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.4, 0.85, 1.25);
        roof.castShadow = true;
        group.add(roof);

        // Bamboo awning post at front
        const post1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 4), mats.wood);
        post1.position.set(-0.24, 0.16, 0.26);
        group.add(post1);
        const post2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 4), mats.wood);
        post2.position.set(0.24, 0.16, 0.26);
        group.add(post2);

        // Sikki grass baskets outside
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.06, 6), mats.thatch);
        basket.position.set(0.18, 0.07, 0.22);
        group.add(basket);
        break;
      }

      case 'maharashtra': {
        // Sahyadri Stone & Timber Wada with deep verandah (osari)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.10, 0.48), mats.basaltRock);
        plinth.position.y = 0.05;
        plinth.receiveShadow = true;
        group.add(plinth);

        // Lower masonry walls in dark basalt stone
        const baseWalls = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.40), mats.basaltRock);
        baseWalls.position.set(0, 0.18, 0);
        baseWalls.castShadow = true;
        group.add(baseWalls);

        // Upper timber posts and plaster floor
        const topWalls = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.36), mats.whitePlaster);
        topWalls.position.set(0, 0.33, 0);
        topWalls.castShadow = true;
        group.add(topWalls);

        // Sagwan timber corner posts
        [-0.22, 0.22].forEach(x => {
          [-0.18, 0.18].forEach(z => {
            const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.04), mats.darkWood);
            post.position.set(x, 0.25, z);
            group.add(post);
          });
        });

        // Sloping Terracotta tiled roof with timber eaves
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 4), mats.terracotta);
        roof.position.set(0, 0.48, 0);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.35, 1, 1.2);
        roof.castShadow = true;
        group.add(roof);

        // Verandah front railing
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.04, 0.02), mats.darkWood);
        rail.position.set(0, 0.16, 0.21);
        group.add(rail);
        break;
      }

      case 'west_bengal': {
        // Curved Do-Chala Bengal Terracotta House
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.46), mats.bengalBrick);
        plinth.position.y = 0.04;
        plinth.receiveShadow = true;
        group.add(plinth);

        const walls = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.36), mats.whitePlaster);
        walls.position.set(0, 0.21, 0);
        walls.castShadow = true;
        group.add(walls);

        // Bishnupur carved terracotta plaques on front wall
        const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.14), mats.terracottaRelief);
        plaque.position.set(0, 0.22, 0.182);
        group.add(plaque);

        // Sweeping curved Do-Chala thatched/terracotta roof
        const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.38, 0.24, 8, 1, false, 0, Math.PI), mats.terracotta);
        roof.position.set(0, 0.42, 0);
        roof.rotation.z = Math.PI / 2;
        roof.scale.set(1.4, 1.0, 1.25);
        roof.castShadow = true;
        group.add(roof);

        // Bamboo porch overhang
        const awning = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.16), mats.thatch);
        awning.position.set(0, 0.28, 0.25);
        awning.rotation.x = -Math.PI / 6;
        group.add(awning);
        break;
      }

      case 'karnataka': {
        // Vijayanagara Heritage Stone-Pillared House
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.10, 0.50), mats.graniteStone);
        plinth.position.y = 0.05;
        plinth.receiveShadow = true;
        group.add(plinth);

        // Dressed granite sanctum
        const core = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.32), mats.graniteStone);
        core.position.set(0, 0.24, -0.04);
        core.castShadow = true;
        group.add(core);

        // 4 Carved Granite Columns with bracket capitals
        const colOffsets = [
          { x: -0.22, z: 0.18 }, { x: -0.08, z: 0.18 },
          { x: 0.08, z: 0.18 }, { x: 0.22, z: 0.18 }
        ];
        colOffsets.forEach(c => {
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.30, 6), mats.graniteStone);
          pillar.position.set(c.x, 0.24, c.z);
          pillar.castShadow = true;
          group.add(pillar);

          const capital = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.06), mats.graniteStone);
          capital.position.set(c.x, 0.39, c.z);
          group.add(capital);
        });

        // Layered Stone-Shingle Flat/Stepped Roof
        const roof1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.48), mats.stone);
        roof1.position.set(0, 0.42, 0.05);
        roof1.castShadow = true;
        group.add(roof1);

        const roof2 = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.36), mats.stone);
        roof2.position.set(0, 0.48, 0.05);
        roof2.castShadow = true;
        group.add(roof2);

        // Mysore brass lamp prop
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.14, 6), mats.goldCoin);
        lamp.position.set(0.18, 0.16, 0.12);
        group.add(lamp);
        break;
      }

      case 'gujarat': {
        // Carved Wooden Gujarati Pol House with Otla porch & Jharokhas
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.48), mats.sandstone);
        plinth.position.y = 0.06;
        plinth.receiveShadow = true;
        group.add(plinth);

        // Main 2-story Pol House body
        const houseBody = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.36), mats.ochrePlaster);
        houseBody.position.set(0, 0.30, 0);
        houseBody.castShadow = true;
        group.add(houseBody);

        // Upper floor wooden carved bracket balcony (Jharokha)
        const balcony = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.08), mats.darkWood);
        balcony.position.set(0, 0.36, 0.20);
        balcony.castShadow = true;
        group.add(balcony);

        // Hanging Bandhani textile drape
        const drape = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.14), mats.patolaIkat);
        drape.position.set(0, 0.26, 0.21);
        group.add(drape);

        // Sloping Terracotta Roof with decorative ridge
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.20, 4), mats.terracotta);
        roof.position.set(0, 0.56, 0);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.35, 1, 1.2);
        roof.castShadow = true;
        group.add(roof);

        // Otla porch wooden bench
        const bench = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.08), mats.wood);
        bench.position.set(-0.14, 0.15, 0.20);
        group.add(bench);
        break;
      }

      case 'rajasthan': {
        // Sandstone Haveli with Jharokha balconies & Jaali screens
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.10, 0.48), mats.sandstone);
        plinth.position.y = 0.05;
        plinth.receiveShadow = true;
        group.add(plinth);

        // Multi-story Golden Sandstone Haveli structure
        const haveli = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.40, 0.38), mats.sandstone);
        haveli.position.set(0, 0.29, 0);
        haveli.castShadow = true;
        group.add(haveli);

        // Signature Carved Jharokha Balcony at front
        const jharokha = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.16, 0.09), mats.sandstone);
        jharokha.position.set(0, 0.35, 0.21);
        jharokha.castShadow = true;
        group.add(jharokha);

        // Jharokha domed canopy (Chhatri arch)
        const dome = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.10, 8), mats.sandstone);
        dome.position.set(0, 0.47, 0.21);
        dome.castShadow = true;
        group.add(dome);

        // Pierced Jaali lattice panel
        const jaali = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.02), mats.whitePlaster);
        jaali.position.set(0, 0.34, 0.26);
        group.add(jaali);

        // Rooftop Parapet with crenellated stone balustrade
        const parapet = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.40), mats.sandstone);
        parapet.position.set(0, 0.51, 0);
        group.add(parapet);

        // Jaipur Blue Pottery vase outside entrance
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.10, 8), mats.bluePottery);
        vase.position.set(0.16, 0.15, 0.20);
        vase.castShadow = true;
        group.add(vase);
        break;
      }
    }

    return group;
  }

  // =========================================================================
  // 2. REGIONAL FARMS & AGRICULTURE
  // =========================================================================

  public static createFarm(state: IndianState): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    switch (state) {
      case 'bihar': {
        // Bihar Rice & Litchi Farm with bamboo granary & irrigation channel
        const farmPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.52), mats.earth);
        farmPlinth.position.y = 0.02;
        group.add(farmPlinth);

        // Thatched round grain storage (Kothar)
        const kotharBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.16, 8), mats.ochrePlaster);
        kotharBase.position.set(-0.16, 0.10, -0.12);
        group.add(kotharBase);

        const kotharRoof = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.14, 8), mats.thatch);
        kotharRoof.position.set(-0.16, 0.24, -0.12);
        group.add(kotharRoof);

        // Green paddy furrow rows with earthen dykes
        for (let row = 0; row < 3; row++) {
          const dyke = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.03, 0.06), mats.earth);
          dyke.position.set(0.12, 0.03, -0.16 + row * 0.14);
          group.add(dyke);

          for (let col = 0; col < 4; col++) {
            const crop = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.11, 4), mats.grass);
            crop.position.set(0.02 + col * 0.07, 0.08, -0.16 + row * 0.14);
            group.add(crop);
          }
        }

        // Bullock cart wooden wheel prop
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 12), mats.darkWood);
        wheel.position.set(-0.18, 0.08, 0.16);
        wheel.rotation.y = Math.PI / 4;
        group.add(wheel);
        break;
      }

      case 'maharashtra': {
        // Sahyadri Terraced Hill Farm with dry-stone walls & jowar/millet crops
        const terrace1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.26), mats.basaltRock);
        terrace1.position.set(0, 0.03, -0.13);
        group.add(terrace1);

        const terrace2 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.10, 0.26), mats.basaltRock);
        terrace2.position.set(0, 0.05, 0.13);
        group.add(terrace2);

        // Stone boundary retaining wall
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.04), mats.stone);
        wall.position.set(0, 0.12, 0);
        group.add(wall);

        // Hardy Jowar / Bajra crops on terraces
        for (let i = 0; i < 8; i++) {
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.20, 4), mats.treeFoliageB);
          stalk.position.set(-0.20 + (i % 4) * 0.13, 0.16, i < 4 ? -0.13 : 0.13);
          group.add(stalk);
        }

        // Stone threshing circle
        const thresher = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 8), mats.stone);
        thresher.position.set(-0.15, 0.08, 0.14);
        group.add(thresher);
        break;
      }

      case 'west_bengal': {
        // Bengal Flooded Rice Paddy with bamboo fish traps & hay stacks
        const paddyPlinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.04, 0.52), mats.earth);
        paddyPlinth.position.y = 0.02;
        group.add(paddyPlinth);

        // Flooded shallow water section
        const waterSheet = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.02, 0.36), mats.water);
        waterSheet.position.set(0.08, 0.04, 0);
        group.add(waterSheet);

        // Rice saplings emerging from water
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const sapling = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.10, 4), mats.grass);
            sapling.position.set(-0.04 + c * 0.10, 0.08, -0.12 + r * 0.12);
            group.add(sapling);
          }
        }

        // Traditional conical hay stack (Palui)
        const hay = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.24, 7), mats.thatch);
        hay.position.set(-0.18, 0.14, -0.12);
        hay.castShadow = true;
        group.add(hay);

        // Bamboo fish trap basket (Polo)
        const trap = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 6), mats.wood);
        trap.position.set(-0.16, 0.06, 0.14);
        group.add(trap);
        break;
      }

      case 'karnataka': {
        // Karnataka Coconut & Arecanut Orchard with granite irrigation conduit
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.52), mats.graniteStone);
        plinth.position.y = 0.02;
        group.add(plinth);

        // Dressed granite water channel
        const channel = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.03, 0.08), mats.stone);
        channel.position.set(0, 0.04, 0);
        group.add(channel);

        const water = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.015, 0.05), mats.water);
        water.position.set(0, 0.05, 0);
        group.add(water);

        // 2 Tall Arecanut / Slender Palm trunks
        [-0.14, 0.16].forEach(x => {
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.44, 6), mats.wood);
          trunk.position.set(x, 0.24, -0.14);
          group.add(trunk);

          const crown = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.18, 6), mats.palmFrond);
          crown.position.set(x, 0.48, -0.14);
          group.add(crown);
        });

        // Stepped Granite Well
        const well = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.08, 6), mats.graniteStone);
        well.position.set(-0.14, 0.06, 0.16);
        group.add(well);
        break;
      }

      case 'gujarat': {
        // Gujarat Cotton & Groundnut Field with stone bullock water wheel
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.52), mats.ochrePlaster);
        plinth.position.y = 0.02;
        group.add(plinth);

        // White cotton plant tufts
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 0), mats.treeFoliageA);
            bush.position.set(-0.06 + col * 0.11, 0.06, -0.12 + row * 0.12);
            group.add(bush);

            const cotton = new THREE.Mesh(new THREE.DodecahedronGeometry(0.02, 0), mats.whitePlaster);
            cotton.position.set(-0.06 + col * 0.11, 0.09, -0.12 + row * 0.12);
            group.add(cotton);
          }
        }

        // Stacked cotton sacks covered under thatch
        const sack = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.12), mats.thatch);
        sack.position.set(-0.18, 0.06, -0.12);
        group.add(sack);

        // Water drawing wheel post
        const wheelPost = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.04), mats.wood);
        wheelPost.position.set(-0.16, 0.11, 0.15);
        group.add(wheelPost);
        break;
      }

      case 'rajasthan': {
        // Rajasthan Arid Bajra Oasis with Persian Wheel (Rahat) well & stone walls
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.52), mats.sandstone);
        plinth.position.y = 0.02;
        group.add(plinth);

        // Sandstone well with timber pulley arch
        const well = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.10, 8), mats.sandstone);
        well.position.set(-0.14, 0.07, -0.12);
        group.add(well);

        const arch = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.22, 0.14), mats.wood);
        arch.position.set(-0.14, 0.18, -0.12);
        group.add(arch);

        // Drought-resistant Bajra (millet) clumps
        for (let i = 0; i < 6; i++) {
          const bajra = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.22, 4), mats.field);
          bajra.position.set(0.06 + (i % 3) * 0.11, 0.13, -0.06 + Math.floor(i / 3) * 0.14);
          group.add(bajra);
        }

        // Stone boundary wall & watering trough
        const trough = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.08), mats.sandstone);
        trough.position.set(-0.14, 0.05, 0.14);
        group.add(trough);
        break;
      }
    }

    return group;
  }

  // =========================================================================
  // 3. REGIONAL MARKETPLACES / HAATS
  // =========================================================================

  public static createMarket(state: IndianState): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    switch (state) {
      case 'bihar': {
        // Sikki Village Haat with bamboo poles, painted banners & clay pots
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.50), mats.earth);
        plinth.position.y = 0.03;
        group.add(plinth);

        // Bamboo canopy frame with woven thatch awning
        const posts = [
          { x: -0.18, z: -0.14 }, { x: 0.18, z: -0.14 },
          { x: -0.18, z: 0.14 }, { x: 0.18, z: 0.14 }
        ];
        posts.forEach(p => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 4), mats.wood);
          post.position.set(p.x, 0.18, p.z);
          group.add(post);
        });

        const canopy = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), mats.thatch);
        canopy.position.set(0, 0.35, 0);
        canopy.rotation.x = Math.PI / 2;
        group.add(canopy);

        // Madhubani painted banner hanging from stall
        const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.10), mats.madhubaniCanvas);
        banner.position.set(0, 0.28, 0.171);
        group.add(banner);

        // Displays of Sikki baskets & clay terracotta pots
        for (let i = 0; i < 4; i++) {
          const pot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 1), mats.clayPot);
          pot.position.set(-0.12 + (i % 2) * 0.09, 0.08, -0.05 + Math.floor(i / 2) * 0.10);
          group.add(pot);
        }
        break;
      }

      case 'maharashtra': {
        // Fortified Stone Bazaar under saffron banners with brass scales
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.basaltRock);
        plinth.position.y = 0.04;
        group.add(plinth);

        // Basalt merchant counter
        const counter = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.20), mats.stone);
        counter.position.set(0, 0.13, 0);
        group.add(counter);

        // Saffron Maratha market canopy
        const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.16, 4), mats.saffronStandard);
        canopy.position.set(0, 0.38, 0);
        canopy.rotation.y = Math.PI / 4;
        canopy.scale.set(1.4, 0.8, 1.2);
        group.add(canopy);

        // Paithani silk fabric roll on counter
        const silkRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), mats.paithaniZari);
        silkRoll.rotation.z = Math.PI / 2;
        silkRoll.position.set(0.10, 0.23, 0);
        group.add(silkRoll);

        // Brass merchant scales
        const scalePost = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 4), mats.goldCoin);
        scalePost.position.set(-0.12, 0.24, 0);
        group.add(scalePost);
        break;
      }

      case 'west_bengal': {
        // Riverfront Ghat Fish & Jute Bazaar with striped awnings
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.bengalBrick);
        plinth.position.y = 0.04;
        group.add(plinth);

        // Bamboo stalls with striped fabric awning
        const awning = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.16, 4), mats.fabricPinkStripe);
        awning.position.set(0, 0.38, 0);
        awning.rotation.y = Math.PI / 4;
        awning.scale.set(1.4, 0.75, 1.2);
        group.add(awning);

        // Carved terracotta tile sign
        const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.08), mats.terracottaRelief);
        sign.position.set(0, 0.26, 0.18);
        group.add(sign);

        // Fish baskets & clay cups (bhar)
        const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.06, 6), mats.thatch);
        basket.position.set(-0.12, 0.09, 0.12);
        group.add(basket);
        break;
      }

      case 'karnataka': {
        // Pillared Mandapa Stone Bazaar with sandalwood & toy stalls
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.10, 0.52), mats.graniteStone);
        plinth.position.y = 0.05;
        group.add(plinth);

        // 4 Carved Granite Columns
        [-0.18, 0.18].forEach(x => {
          [-0.14, 0.14].forEach(z => {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.32, 6), mats.graniteStone);
            pillar.position.set(x, 0.23, z);
            group.add(pillar);
          });
        });

        // Granite flat roof slab
        const slab = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.42), mats.stone);
        slab.position.set(0, 0.41, 0);
        group.add(slab);

        // Channapatna bright lacquer toy stall display
        const toyTable = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.14), mats.darkWood);
        toyTable.position.set(0, 0.14, 0);
        group.add(toyTable);

        // Lacquered spinning top props
        const top1 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 8), mats.blossomPink);
        top1.position.set(-0.06, 0.23, 0);
        group.add(top1);
        const top2 = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 8), mats.goldCoin);
        top2.position.set(0.06, 0.23, 0);
        group.add(top2);
        break;
      }

      case 'gujarat': {
        // Bustling Textile Merchant Haat with Patola & Bandhani canopies
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.sandstone);
        plinth.position.y = 0.04;
        group.add(plinth);

        // Wooden trade platform (gaddi) with white mattress
        const gaddi = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.28), mats.whitePlaster);
        gaddi.position.set(0, 0.12, 0);
        group.add(gaddi);

        // Draped Patola double-ikat canopy
        const canopy = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.34), mats.patolaIkat);
        canopy.position.set(0, 0.36, 0);
        canopy.rotation.x = Math.PI / 2;
        group.add(canopy);

        // Hanging Bandhani fabrics
        const drape = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.20), mats.fabricYellowStripe);
        drape.position.set(-0.18, 0.24, 0.15);
        group.add(drape);

        // Merchant ledger book (Chopda)
        const chopda = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.10), mats.fabricBanner);
        chopda.position.set(0.08, 0.19, 0);
        group.add(chopda);
        break;
      }

      case 'rajasthan': {
        // Shaded Haveli Bazaar with Sanganeri canopies & Blue Pottery
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.sandstone);
        plinth.position.y = 0.04;
        group.add(plinth);

        // Sandstone merchant alcove with cusped arch
        const alcove = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.32, 0.24), mats.sandstone);
        alcove.position.set(0, 0.22, -0.08);
        group.add(alcove);

        // Block-printed fabric awning
        const awning = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.24), mats.fabricYellowStripe);
        awning.position.set(0, 0.38, 0.12);
        awning.rotation.x = -Math.PI / 6;
        group.add(awning);

        // Displays of Jaipur Cobalt Blue Pottery urns
        const pot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8), mats.bluePottery);
        pot1.position.set(-0.12, 0.12, 0.14);
        group.add(pot1);

        const pot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8), mats.bluePottery);
        pot2.position.set(0.12, 0.12, 0.14);
        group.add(pot2);
        break;
      }
    }

    return group;
  }
}

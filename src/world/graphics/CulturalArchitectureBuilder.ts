import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';
import { CulturalModelBuilder } from './CulturalModelBuilder';

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
        // Traditional Wada Courtyard House with open central chowk and Tulsi Vrindavan
        return this.createWada();
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
        // Sunlit Sahyadri Terraced Hill Farm with warm dry-stone walls & lush monsoon jowar crops
        const terrace1 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.26), mats.sahyadriWarmStone);
        terrace1.position.set(0, 0.03, -0.13);
        group.add(terrace1);

        const terrace2 = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.10, 0.26), mats.sahyadriSunlitStone);
        terrace2.position.set(0, 0.05, 0.13);
        group.add(terrace2);

        // Warm stone boundary retaining wall
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.04), mats.sahyadriWarmStone);
        wall.position.set(0, 0.12, 0);
        group.add(wall);

        // Lush monsoon vegetation & golden jowar stalks on terraces
        for (let i = 0; i < 8; i++) {
          const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.20, 4), i % 2 === 0 ? mats.sahyadriSunlitGrass : mats.sahyadriMonsoon);
          stalk.position.set(-0.20 + (i % 4) * 0.13, 0.16, i < 4 ? -0.13 : 0.13);
          group.add(stalk);
        }

        // Sunlit stone threshing circle
        const thresher = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 8), mats.sahyadriSunlitStone);
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
        // Sunlit Sahyadri Stone Bazaar under saffron banners with brass scales & vibrant Paithani silk
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.sahyadriWarmStone);
        plinth.position.y = 0.04;
        group.add(plinth);

        // Sunlit stone merchant counter
        const counter = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.20), mats.sahyadriSunlitStone);
        counter.position.set(0, 0.13, 0);
        group.add(counter);

        // Saffron Maratha market canopy
        const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.16, 4), mats.sahyadriSaffron);
        canopy.position.set(0, 0.38, 0);
        canopy.rotation.y = Math.PI / 4;
        canopy.scale.set(1.4, 0.8, 1.2);
        group.add(canopy);

        // Paithani peacock teal silk roll on counter
        const silkRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.16, 8), mats.paithaniTeal);
        silkRoll.rotation.z = Math.PI / 2;
        silkRoll.position.set(0.10, 0.23, 0);
        group.add(silkRoll);

        // Shimmering magenta border on roll
        const silkBorder = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.04, 8), mats.paithaniMagenta);
        silkBorder.rotation.z = Math.PI / 2;
        silkBorder.position.set(0.16, 0.23, 0);
        group.add(silkBorder);

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

  // =========================================================================
  // 4. REGIONAL CORE LANDMARKS DELEGATION
  // =========================================================================

  public static createBiharWorkshop(): THREE.Group {
    return CulturalModelBuilder.createBiharWorkshop();
  }

  public static createMaharashtraWatchtower(): THREE.Group {
    return CulturalModelBuilder.createMaharashtraWatchtower();
  }

  public static createBengalPandal(): THREE.Group {
    return CulturalModelBuilder.createBengalPandal();
  }

  public static createKarnatakaToyShop(): THREE.Group {
    return CulturalModelBuilder.createKarnatakaToyShop();
  }

  public static createGujaratTextile(): THREE.Group {
    return CulturalModelBuilder.createGujaratTextile();
  }

  public static createRajasthanHaveli(): THREE.Group {
    return CulturalModelBuilder.createRajasthanHaveli();
  }

  // =========================================================================
  // 5. MAHARASHTRA SPECIALIZED CULTURAL ARCHITECTURE
  // =========================================================================

  /** Traditional Wada Courtyard House with open central Chowk and Tulsi Vrindavan */
  public static createWada(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Raised warm stone foundation plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.10, 0.54), mats.sahyadriWarmStone);
    plinth.position.y = 0.05;
    plinth.receiveShadow = true;
    group.add(plinth);

    // Front stone steps leading to doorway
    const steps = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.08), mats.sahyadriSunlitStone);
    steps.position.set(0, 0.025, 0.29);
    group.add(steps);

    // 2. Open Courtyard (Chowk) Perimeter Wings: North, South, East, West
    // North Wing (Back)
    const northWing = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.14), mats.sahyadriLimePlaster);
    northWing.position.set(0, 0.22, -0.18);
    northWing.castShadow = true;
    group.add(northWing);

    // South Wing (Front) with central doorway opening
    const southWingL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), mats.sahyadriLimePlaster);
    southWingL.position.set(-0.17, 0.22, 0.18);
    southWingL.castShadow = true;
    group.add(southWingL);

    const southWingR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.28, 0.14), mats.sahyadriLimePlaster);
    southWingR.position.set(0.17, 0.22, 0.18);
    southWingR.castShadow = true;
    group.add(southWingR);

    // Heavy dark timber door frame and entrance lintel (Dindi Darwaza)
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.06), mats.darkWood);
    doorFrame.position.set(0, 0.20, 0.18);
    group.add(doorFrame);

    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.20, 0.02), mats.wood);
    doorLeaf.position.set(0, 0.18, 0.17);
    group.add(doorLeaf);

    // East Wing & West Wing
    const eastWing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.22), mats.sahyadriLimePlaster);
    eastWing.position.set(0.19, 0.22, 0);
    eastWing.castShadow = true;
    group.add(eastWing);

    const westWing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.22), mats.sahyadriLimePlaster);
    westWing.position.set(-0.19, 0.22, 0);
    westWing.castShadow = true;
    group.add(westWing);

    // 3. Inner Chowk Verandah Timber Pillars (Osari)
    const pillarPositions = [
      [-0.10, -0.09], [0.10, -0.09],
      [-0.10, 0.09], [0.10, 0.09]
    ];
    pillarPositions.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.025), mats.darkWood);
      pillar.position.set(x, 0.20, z);
      pillar.castShadow = true;
      group.add(pillar);

      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.05), mats.darkWood);
      bracket.position.set(x, 0.31, z);
      group.add(bracket);
    });

    // 4. Central Open Courtyard Tulsi Vrindavan
    const vrindavanBase = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.10, 0.08), mats.sahyadriSunlitStone);
    vrindavanBase.position.set(0, 0.14, 0);
    vrindavanBase.castShadow = true;
    group.add(vrindavanBase);

    // Holy basil greenery
    const basil = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035, 1), mats.sahyadriFoliage);
    basil.position.set(0, 0.21, 0);
    group.add(basil);

    // Brass diya light
    const diya = new THREE.Mesh(new THREE.DodecahedronGeometry(0.015, 0), mats.lanternGlow);
    diya.position.set(0.04, 0.17, 0);
    group.add(diya);

    // 5. Authentic Terracotta Hip Roofs sloping inwards and outwards
    const nRoof = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.18), mats.sahyadriTerracottaRoof);
    nRoof.position.set(0, 0.38, -0.18);
    nRoof.rotation.x = 0.25;
    nRoof.castShadow = true;
    group.add(nRoof);

    const sRoof = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.18), mats.sahyadriTerracottaRoof);
    sRoof.position.set(0, 0.38, 0.18);
    sRoof.rotation.x = -0.25;
    sRoof.castShadow = true;
    group.add(sRoof);

    const eRoof = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.26), mats.sahyadriTerracottaRoof);
    eRoof.position.set(0.20, 0.38, 0);
    eRoof.rotation.z = -0.25;
    eRoof.castShadow = true;
    group.add(eRoof);

    const wRoof = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.26), mats.sahyadriTerracottaRoof);
    wRoof.position.set(-0.20, 0.38, 0);
    wRoof.rotation.z = 0.25;
    wRoof.castShadow = true;
    group.add(wRoof);

    // Saffron festive toran over entrance
    const toran = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.03), mats.sahyadriSaffron);
    toran.position.set(0, 0.30, 0.23);
    group.add(toran);

    return group;
  }

  /** Sahyadri Hill-Fort Gateway with twin rounded bastions & Maratha standard */
  public static createFortGateway(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Warm stone foundation plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.10, 0.44), mats.sahyadriWarmStone);
    plinth.position.y = 0.05;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Twin Semi-Cylindrical Bastions (Buruj)
    const leftBastion = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.52, 12), mats.sahyadriSunlitStone);
    leftBastion.position.set(-0.19, 0.31, 0);
    leftBastion.castShadow = true;
    group.add(leftBastion);

    const rightBastion = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.52, 12), mats.sahyadriSunlitStone);
    rightBastion.position.set(0.19, 0.31, 0);
    rightBastion.castShadow = true;
    group.add(rightBastion);

    // Bastion Crenellations
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const merlonL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.05), mats.sahyadriWarmStone);
      merlonL.position.set(-0.19 + Math.cos(angle) * 0.12, 0.60, Math.sin(angle) * 0.12);
      group.add(merlonL);

      const merlonR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.05), mats.sahyadriWarmStone);
      merlonR.position.set(0.19 + Math.cos(angle) * 0.12, 0.60, Math.sin(angle) * 0.12);
      group.add(merlonR);
    }

    // 3. Central Gateway Arch & Wall
    const archWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.16), mats.sahyadriWarmStone);
    archWall.position.set(0, 0.44, 0);
    archWall.castShadow = true;
    group.add(archWall);

    // Heavy wooden iron-studded gateway doors
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.04), mats.darkWood);
    door.position.set(0, 0.21, 0);
    door.castShadow = true;
    group.add(door);

    // Iron studs
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 2; c++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 4), mats.sahyadriWarmStone);
        spike.rotation.x = Math.PI / 2;
        spike.position.set(-0.04 + c * 0.08, 0.12 + r * 0.08, 0.03);
        group.add(spike);
      }
    }

    // 4. Overhead Walkway Rampart
    const rampart = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.18), mats.sahyadriSunlitStone);
    rampart.position.set(0, 0.56, 0);
    group.add(rampart);

    // 5. Tall Mast with fluttering Saffron Maratha Flag
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.50, 6), mats.darkWood);
    mast.position.set(0, 0.82, 0);
    group.add(mast);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.14), mats.sahyadriSaffron);
    flag.position.set(0.11, 0.94, 0);
    flag.rotation.y = Math.PI / 2;
    group.add(flag);

    // 6. Braziers on bastion fronts
    [-0.19, 0.19].forEach(x => {
      const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.04, 6), mats.goldCoin);
      brazier.position.set(x, 0.34, 0.15);
      group.add(brazier);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.05, 4), mats.fireFlames);
      flame.position.set(x, 0.38, 0.15);
      group.add(flame);
    });

    return group;
  }

  /** Paithani Weaving House with authentic handloom and peacock teal/magenta silk */
  public static createPaithaniWeavingHouse(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Plinth in warm stone
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.sahyadriWarmStone);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Open timber-framed weaving workshop
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.28, 0.08), mats.sahyadriLimePlaster);
    backWall.position.set(0, 0.20, -0.18);
    backWall.castShadow = true;
    group.add(backWall);

    const posts = [
      [-0.22, -0.16], [0.22, -0.16],
      [-0.22, 0.18], [0.22, 0.18]
    ];
    posts.forEach(([x, z]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.03), mats.darkWood);
      post.position.set(x, 0.22, z);
      post.castShadow = true;
      group.add(post);
    });

    // Terracotta sloping roof with timber eaves
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.40, 0.20, 4), mats.sahyadriTerracottaRoof);
    roof.position.set(0, 0.44, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 0.8, 1.25);
    roof.castShadow = true;
    group.add(roof);

    // 3. Paithani Pit Loom Frame
    const loomBeams = [
      { s: [0.02, 0.22, 0.02], p: [-0.14, 0.16, 0] },
      { s: [0.02, 0.22, 0.02], p: [0.14, 0.16, 0] },
      { s: [0.30, 0.025, 0.025], p: [0, 0.26, 0] },
      { s: [0.28, 0.04, 0.04], p: [0, 0.14, -0.08] }
    ];
    loomBeams.forEach(b => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(b.s[0], b.s[1], b.s[2]), mats.wood);
      beam.position.set(b.p[0], b.p[1], b.p[2]);
      group.add(beam);
    });

    // 4. Stretched Warp & Woven Paithani Silk Fabric
    const silkWarp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.02, 0.22), mats.paithaniTeal);
    silkWarp.position.set(0, 0.15, 0.02);
    silkWarp.castShadow = true;
    group.add(silkWarp);

    const zariBorder = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.025, 0.06), mats.paithaniMagenta);
    zariBorder.position.set(0, 0.155, 0.11);
    group.add(zariBorder);

    const goldZari = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.028, 0.02), mats.paithaniZari);
    goldZari.position.set(0, 0.158, 0.13);
    group.add(goldZari);

    // Weaver's shuttle
    const shuttle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), mats.goldCoin);
    shuttle.position.set(-0.02, 0.175, 0.06);
    group.add(shuttle);

    // 5. Hanging yarn skeins
    [-0.12, 0, 0.12].forEach((x, i) => {
      const spoolMat = i === 0 ? mats.paithaniTeal : i === 1 ? mats.paithaniMagenta : mats.sahyadriSaffron;
      const spool = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 6), spoolMat);
      spool.position.set(x, 0.22, -0.13);
      group.add(spool);
    });

    return group;
  }

  /** Warli Community Art Pavilion with white rice-paste Tarpa dance mural */
  public static createWarliPavilion(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Warm earthen foundation plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.sahyadriEarth);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    const step = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.08), mats.sahyadriWarmStone);
    step.position.set(0, 0.02, 0.28);
    group.add(step);

    // 2. Red-Ochre Mud Plaster Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.06), mats.sahyadriEarth);
    backWall.position.set(0, 0.22, -0.16);
    backWall.castShadow = true;
    group.add(backWall);

    // 3. Authentic Warli Folk Art Mural Panel
    const muralCenter = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.26), mats.warliArt);
    muralCenter.position.set(0, 0.22, -0.128);
    group.add(muralCenter);

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.02), mats.darkWood);
    frameTop.position.set(0, 0.355, -0.125);
    group.add(frameTop);
    const frameBtm = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.02, 0.02), mats.darkWood);
    frameBtm.position.set(0, 0.085, -0.125);
    group.add(frameBtm);

    // 4. Open Timber Posts supporting canopy
    const posts = [
      [-0.22, 0.18], [0.22, 0.18]
    ];
    posts.forEach(([x, z]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 6), mats.darkWood);
      post.position.set(x, 0.22, z);
      post.castShadow = true;
      group.add(post);
    });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.18, 4), mats.sahyadriTerracottaRoof);
    roof.position.set(0, 0.44, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 0.75, 1.3);
    roof.castShadow = true;
    group.add(roof);

    // 5. Tarpa horn & clay pots
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.08), mats.wood);
    bench.position.set(-0.14, 0.10, 0.08);
    group.add(bench);

    const tarpaHorn = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.16, 6), mats.wood);
    tarpaHorn.rotation.z = Math.PI / 3;
    tarpaHorn.position.set(-0.14, 0.16, 0.08);
    group.add(tarpaHorn);

    const pot = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 1), mats.clayPot);
    pot.position.set(0.16, 0.10, 0.08);
    group.add(pot);

    const diya = new THREE.Mesh(new THREE.DodecahedronGeometry(0.025, 0), mats.lanternGlow);
    diya.position.set(0.16, 0.16, 0.08);
    group.add(diya);

    return group;
  }

  /** Rock-cut Water Cistern (Tanka) with clear mountain spring water */
  public static createFortCistern(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Rock-cut outer rim in warm stone
    const outerRim = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.54), mats.sahyadriWarmStone);
    outerRim.position.y = 0.07;
    outerRim.receiveShadow = true;
    group.add(outerRim);

    // 2. Stepped rock-cut reservoir descent
    const stepTiers = [
      { size: [0.44, 0.06, 0.40], y: 0.10 },
      { size: [0.36, 0.06, 0.32], y: 0.06 },
      { size: [0.28, 0.06, 0.24], y: 0.02 }
    ];
    stepTiers.forEach(t => {
      const borderN = new THREE.Mesh(new THREE.BoxGeometry(t.size[0], t.size[1], 0.04), mats.sahyadriSunlitStone);
      borderN.position.set(0, t.y, -t.size[2] / 2 + 0.02);
      group.add(borderN);

      const borderS = new THREE.Mesh(new THREE.BoxGeometry(t.size[0], t.size[1], 0.04), mats.sahyadriSunlitStone);
      borderS.position.set(0, t.y, t.size[2] / 2 - 0.02);
      group.add(borderS);

      const borderW = new THREE.Mesh(new THREE.BoxGeometry(0.04, t.size[1], t.size[2]), mats.sahyadriSunlitStone);
      borderW.position.set(-t.size[0] / 2 + 0.02, t.y, 0);
      group.add(borderW);

      const borderE = new THREE.Mesh(new THREE.BoxGeometry(0.04, t.size[1], t.size[2]), mats.sahyadriSunlitStone);
      borderE.position.set(t.size[0] / 2 - 0.02, t.y, 0);
      group.add(borderE);
    });

    // 3. Clear Mountain Spring Water Surface
    const waterPool = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.22), mats.sahyadriFreshWater);
    waterPool.position.set(0, 0.05, 0);
    group.add(waterPool);

    // 4. Stone Inlet Spout
    const spoutMount = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.06), mats.sahyadriSunlitStone);
    spoutMount.position.set(0, 0.16, -0.21);
    group.add(spoutMount);

    const waterStream = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 6), mats.sahyadriFreshWater);
    waterStream.position.set(0, 0.10, -0.16);
    group.add(waterStream);

    // 5. Stone canopy arch
    const pillar1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.28, 6), mats.sahyadriWarmStone);
    pillar1.position.set(-0.20, 0.24, -0.18);
    group.add(pillar1);
    const pillar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.28, 6), mats.sahyadriWarmStone);
    pillar2.position.set(0.20, 0.24, -0.18);
    group.add(pillar2);

    const stoneArch = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.08), mats.sahyadriWarmStone);
    stoneArch.position.set(0, 0.38, -0.18);
    group.add(stoneArch);

    // Brass lota
    const brassLota = new THREE.Mesh(new THREE.DodecahedronGeometry(0.03, 1), mats.goldCoin);
    brassLota.position.set(0.16, 0.16, 0.18);
    group.add(brassLota);

    // Monsoon ferns
    const fern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.03, 0), mats.sahyadriMonsoon);
    fern.position.set(-0.20, 0.15, 0.16);
    group.add(fern);

    return group;
  }

  // =========================================================================
  // 6. BIHAR SPECIALIZED CULTURAL ARCHITECTURE
  // =========================================================================

  /** Sikki Golden Grass Craft House with woven grain kothis & drying frames */
  public static createSikkiHouse(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Earthen Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.06, 0.50), mats.earth);
    plinth.position.y = 0.03;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Mud cottage with thatch roof
    const cottage = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.32), mats.ochrePlaster);
    cottage.position.set(-0.10, 0.16, -0.06);
    cottage.castShadow = true;
    group.add(cottage);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.22, 4), mats.thatch);
    roof.position.set(-0.10, 0.36, -0.06);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.3, 0.85, 1.2);
    roof.castShadow = true;
    group.add(roof);

    // 3. Woven Sikki Golden Grass Storage Silos (Kothis/Pautis)
    for (let i = 0; i < 3; i++) {
      const kothiBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.14, 8), mats.thatch);
      kothiBody.position.set(0.16, 0.10 + i * 0.01, -0.14 + i * 0.12);
      kothiBody.castShadow = true;
      group.add(kothiBody);

      const kothiCap = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.06, 8), mats.fabricYellowStripe);
      kothiCap.position.set(0.16, 0.19 + i * 0.01, -0.14 + i * 0.12);
      group.add(kothiCap);
    }

    // 4. Horizontal Bamboo Drying Rack for Golden Wild Grass
    const rackPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 4), mats.wood);
    rackPostL.position.set(-0.18, 0.12, 0.18);
    group.add(rackPostL);

    const rackPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 4), mats.wood);
    rackPostR.position.set(0.08, 0.12, 0.18);
    group.add(rackPostR);

    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.28, 4), mats.wood);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(-0.05, 0.20, 0.18);
    group.add(crossbar);

    // Hanging golden grass bundle
    const grassBundle = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.08), mats.thatch);
    grassBundle.position.set(-0.05, 0.16, 0.185);
    group.add(grassBundle);

    return group;
  }

  /** Community Pokhar Pond with lotus pads, stepped ghat & sacred banyan shade */
  public static createPokharPond(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Earthen plinth rim
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.54), mats.earth);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Stepped brick ghat steps
    const ghatNorth = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.08), mats.bengalBrick);
    ghatNorth.position.set(0, 0.06, -0.18);
    group.add(ghatNorth);

    const ghatSouth = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.08), mats.bengalBrick);
    ghatSouth.position.set(0, 0.06, 0.18);
    group.add(ghatSouth);

    // 3. Clear lotus pond water
    const water = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.02, 0.32), mats.water);
    water.position.set(0, 0.05, 0);
    group.add(water);

    // 4. Blooming Lotus pads and blossoms
    const lotusOffsets = [
      [-0.10, -0.06], [0.08, 0.04], [-0.04, 0.08], [0.12, -0.08]
    ];
    lotusOffsets.forEach(([x, z]) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.005, 6), mats.sahyadriMonsoon);
      pad.position.set(x, 0.062, z);
      group.add(pad);

      const flower = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.03, 5), mats.blossomPink);
      flower.position.set(x, 0.08, z);
      group.add(flower);
    });

    // 5. Sacred tree shade trunk & altar
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.36, 6), mats.wood);
    trunk.position.set(-0.20, 0.18, -0.18);
    trunk.castShadow = true;
    group.add(trunk);

    const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 1), mats.treeFoliageA);
    canopy.position.set(-0.20, 0.36, -0.18);
    canopy.castShadow = true;
    group.add(canopy);

    // Sacred terracotta diya on ghat step
    const diya = new THREE.Mesh(new THREE.DodecahedronGeometry(0.02, 0), mats.lanternGlow);
    diya.position.set(0.12, 0.09, 0.18);
    group.add(diya);

    return group;
  }

  // =========================================================================
  // 7. WEST BENGAL SPECIALIZED CULTURAL ARCHITECTURE
  // =========================================================================

  /** Jor-Bangla Heritage House with twin curved Do-Chala terracotta roofs */
  public static createJorBanglaHouse(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Terracotta brick plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.50), mats.bengalBrick);
    plinth.position.y = 0.04;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Twin adjoining rectangular structures (East & West hut)
    [-0.12, 0.12].forEach(x => {
      const hut = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.36), mats.ochrePlaster);
      hut.position.set(x, 0.20, 0);
      hut.castShadow = true;
      group.add(hut);

      // Bishnupur carved terracotta relief plaques on facade
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.16), mats.terracottaRelief);
      plaque.position.set(x, 0.20, 0.182);
      group.add(plaque);

      // Curved barrel-vaulted Do-Chala terracotta roof
      const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.22, 0.26, 8, 1, false, 0, Math.PI), mats.terracotta);
      roof.position.set(x, 0.38, 0);
      roof.rotation.z = Math.PI / 2;
      roof.scale.set(1.4, 0.9, 1.2);
      roof.castShadow = true;
      group.add(roof);

      // Roof finial crest (Kalasha)
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), mats.goldCoin);
      finial.position.set(x, 0.49, 0);
      group.add(finial);
    });

    // 3. Central unifying arched terracotta gateway
    const centralPillar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.06), mats.bengalBrick);
    centralPillar.position.set(0, 0.20, 0.18);
    group.add(centralPillar);

    return group;
  }

  /** Baluchari Weaving House with jacquard loom & royal mythic silk panels */
  public static createBaluchariHouse(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Plinth in Bengal terracotta brick
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.bengalBrick);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Workshop structure
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.10), mats.whitePlaster);
    backWall.position.set(0, 0.20, -0.18);
    group.add(backWall);

    // Curved terracotta roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.40, 0.20, 4), mats.terracotta);
    roof.position.set(0, 0.44, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.4, 0.8, 1.25);
    roof.castShadow = true;
    group.add(roof);

    // 3. Timber Jacquard Loom Frame
    const loomPost1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.30, 0.03), mats.darkWood);
    loomPost1.position.set(-0.16, 0.20, 0);
    group.add(loomPost1);
    const loomPost2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.30, 0.03), mats.darkWood);
    loomPost2.position.set(0.16, 0.20, 0);
    group.add(loomPost2);

    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.03), mats.darkWood);
    crossbeam.position.set(0, 0.32, 0);
    group.add(crossbeam);

    // 4. Baluchari Silk Tapestry with gold jacquard figurative motifs
    const silkTapestry = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.20), mats.baluchariSilk);
    silkTapestry.position.set(0, 0.22, 0.02);
    group.add(silkTapestry);

    // Silk spools & yarn basket
    const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.06, 6), mats.thatch);
    basket.position.set(-0.16, 0.09, 0.16);
    group.add(basket);

    return group;
  }

  /** Riverfront Craft Ghat with stepped brick ghat & wooden fishing dinghi */
  public static createRiverGhat(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Water sheet
    const water = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.32), mats.water);
    water.position.set(0, 0.02, 0.10);
    group.add(water);

    // 2. Descending terracotta brick ghat steps
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.04, 0.08), mats.bengalBrick);
      step.position.set(0, 0.14 - i * 0.03, -0.22 + i * 0.08);
      step.receiveShadow = true;
      group.add(step);
    }

    // 3. Bengal Dinghi Boat moored to bamboo stake
    const dinghi = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.32), mats.darkWood);
    dinghi.position.set(-0.12, 0.04, 0.12);
    dinghi.rotation.y = 0.2;
    group.add(dinghi);

    // Bamboo arched cabin hood (Chhoi)
    const chhoi = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.14, 6, 1, false, 0, Math.PI), mats.thatch);
    chhoi.position.set(-0.12, 0.09, 0.12);
    chhoi.rotation.z = Math.PI / 2;
    group.add(chhoi);

    // Bamboo mooring post
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 4), mats.wood);
    post.position.set(0.06, 0.12, 0.06);
    group.add(post);

    // Clay cups (Bhar) and fish baskets
    const bhar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.015, 0.03, 6), mats.clayPot);
    bhar.position.set(0.16, 0.14, -0.16);
    group.add(bhar);

    return group;
  }

  // =========================================================================
  // 8. KARNATAKA SPECIALIZED CULTURAL ARCHITECTURE
  // =========================================================================

  /** Mysore Heritage Art House with gold-leaf paintings & carved teak pillars */
  public static createMysoreArtHouse(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Granite plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.graniteStone);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Studio back wall & stepped roof
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.12), mats.whitePlaster);
    backWall.position.set(0, 0.20, -0.16);
    group.add(backWall);

    // Carved wooden bracket columns
    [-0.18, 0.18].forEach(x => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.32, 6), mats.wood);
      col.position.set(x, 0.22, 0.16);
      group.add(col);
    });

    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.06, 0.44), mats.stone);
    roofSlab.position.set(0, 0.40, 0);
    group.add(roofSlab);

    // 3. Ornate Mysore Gold-Leaf Painting Easel Display
    const easel = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.02), mats.darkWood);
    easel.position.set(0, 0.22, 0.02);
    group.add(easel);

    const painting = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.18), mats.mysoreGold);
    painting.position.set(0, 0.22, 0.035);
    group.add(painting);

    // Brass Kuthuvilakku lamp
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.18, 6), mats.goldCoin);
    lamp.position.set(0.18, 0.16, 0.12);
    group.add(lamp);

    return group;
  }

  /** Yakshagana Courtyard with Rangasthala stage, Kireeta crown & Chande drums */
  public static createYakshaganaCourtyard(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Stepped granite performance arena
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), mats.graniteStone);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Central Rangasthala wooden performance stage
    const stage = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.32), mats.wood);
    stage.position.set(0, 0.10, 0);
    group.add(stage);

    // 3. Yakshagana Kireeta Headdress Display
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), mats.darkWood);
    stand.position.set(0, 0.20, 0);
    group.add(stand);

    // Golden halo crown (Kireeta)
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 6), mats.mysoreGold);
    crown.position.set(0, 0.32, 0);
    group.add(crown);

    const crownWings = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.02), mats.fabricPinkStripe);
    crownWings.position.set(0, 0.30, 0);
    group.add(crownWings);

    // 4. Coastal Percussion: Tall Chande drum & Maddale drum
    const chande = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), mats.darkWood);
    chande.position.set(-0.12, 0.18, 0.06);
    group.add(chande);

    const maddale = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), mats.wood);
    maddale.rotation.z = Math.PI / 2;
    maddale.position.set(0.12, 0.15, 0.06);
    group.add(maddale);

    return group;
  }

  // =========================================================================
  // 9. GUJARAT SPECIALIZED CULTURAL ARCHITECTURE
  // =========================================================================

  /** Artisan Stepwell (Rani ki Vav) with descending colonnades & subterranean pool */
  public static createStepwell(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Sandstone ground plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.12, 0.54), mats.sandstone);
    plinth.position.y = 0.06;
    plinth.receiveShadow = true;
    group.add(plinth);

    // 2. Stepped subterranean tiers descending from back to front
    const tiers = [
      { y: 0.10, z: -0.16, h: 0.06 },
      { y: 0.06, z: -0.06, h: 0.06 },
      { y: 0.02, z: 0.04, h: 0.06 }
    ];
    tiers.forEach(t => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(0.40, t.h, 0.09), mats.sandstone);
      step.position.set(0, t.y, t.z);
      group.add(step);
    });

    // Subterranean clear water pool
    const water = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.16), mats.water);
    water.position.set(0, 0.02, 0.14);
    group.add(water);

    // 3. Carved Sandstone Pavilion Colonnades (Pillared Pavilion overhead)
    const pillars = [
      [-0.16, -0.16], [0.16, -0.16],
      [-0.16, 0.02], [0.16, 0.02]
    ];
    pillars.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.32, 0.035), mats.sandstone);
      pillar.position.set(x, 0.22, z);
      pillar.castShadow = true;
      group.add(pillar);

      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.06), mats.sandstone);
      bracket.position.set(x, 0.36, z);
      group.add(bracket);
    });

    // Sandstone Pavilion Roof Beam
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.24), mats.sandstone);
    lintel.position.set(0, 0.40, -0.07);
    group.add(lintel);

    return group;
  }

  /** Bandhani Craft Studio with dye vats & vibrant drying dot-resist fabrics */
  public static createBandhaniStudio(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Sandstone courtyard plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.sandstone);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Dye vats (Indigo, Madder red, Turmeric yellow)
    const vats = [
      { x: -0.16, z: -0.12, mat: mats.fabricBlueStripe },
      { x: 0, z: -0.14, mat: mats.fabricPinkStripe },
      { x: 0.16, z: -0.12, mat: mats.fabricYellowStripe }
    ];
    vats.forEach(v => {
      const vatTub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.10, 8), mats.clayPot);
      vatTub.position.set(v.x, 0.09, v.z);
      group.add(vatTub);

      const dyeLiquid = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 8), v.mat);
      dyeLiquid.position.set(v.x, 0.13, v.z);
      group.add(dyeLiquid);
    });

    // 3. Elevated Bamboo Drying Clotheslines with billowing Bandhani textiles
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 4), mats.wood);
    postL.position.set(-0.20, 0.16, 0.12);
    group.add(postL);

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 4), mats.wood);
    postR.position.set(0.20, 0.16, 0.12);
    group.add(postR);

    // Billowing dotted fabric sheets
    const fabric1 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), mats.patolaIkat);
    fabric1.position.set(-0.08, 0.22, 0.12);
    group.add(fabric1);

    const fabric2 = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), mats.fabricPinkStripe);
    fabric2.position.set(0.08, 0.22, 0.12);
    group.add(fabric2);

    return group;
  }

  // =========================================================================
  // 10. RAJASTHAN SPECIALIZED CULTURAL ARCHITECTURE
  // =========================================================================

  /** Jaipur Blue Pottery Studio with brick kiln & quartz-glazed cobalt floral urns */
  public static createBluePotteryStudio(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Sandstone plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.sandstone);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Traditional Round Brick Firing Kiln (Bhatti) with chimney
    const kiln = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.24, 8), mats.terracotta);
    kiln.position.set(-0.14, 0.16, -0.10);
    kiln.castShadow = true;
    group.add(kiln);

    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.20, 6), mats.terracotta);
    chimney.position.set(-0.14, 0.36, -0.10);
    group.add(chimney);

    const kilnGlow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.02), mats.fireFlames);
    kilnGlow.position.set(-0.14, 0.10, 0.03);
    group.add(kilnGlow);

    // 3. Multi-Shelf Display of Cobalt & Turquoise Glazed Blue Pottery
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.08), mats.wood);
    shelf.position.set(0.14, 0.18, -0.08);
    group.add(shelf);

    // Blue pottery urns and bowls
    [-0.05, 0.05].forEach(x => {
      const urn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.09, 8), mats.bluePottery);
      urn.position.set(0.14 + x, 0.26, -0.04);
      group.add(urn);

      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 8), mats.bluePottery);
      plate.rotation.x = Math.PI / 3;
      plate.position.set(0.14 + x, 0.16, -0.04);
      group.add(plate);
    });

    // 4. Artisan pottery kick-wheel
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.02, 8), mats.stone);
    wheel.position.set(0, 0.06, 0.14);
    group.add(wheel);

    const freshPot = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 6), mats.clayPot);
    freshPot.position.set(0, 0.10, 0.14);
    group.add(freshPot);

    return group;
  }

  /** Kathputli Puppet Stage with embroidered drapes, marionettes & folk dholak */
  public static createKathputliPavilion(): THREE.Group {
    const mats = this.mats;
    const group = new THREE.Group();

    // 1. Sandstone stage plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.50), mats.sandstone);
    plinth.position.y = 0.04;
    group.add(plinth);

    // 2. Stage puppet backdrop & draped valance
    const backdrop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.04), mats.fabricPinkStripe);
    backdrop.position.set(0, 0.24, -0.10);
    group.add(backdrop);

    const valance = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.06), mats.fabricYellowStripe);
    valance.position.set(0, 0.40, -0.08);
    group.add(valance);

    // Stage corner pillars
    [-0.22, 0.22].forEach(x => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.40, 0.03), mats.sandstone);
      col.position.set(x, 0.24, -0.08);
      group.add(col);
    });

    // 3. Hanging Marionette Puppets (King & Queen dolls)
    [-0.08, 0.08].forEach((x, i) => {
      // String
      const string = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.14, 3), mats.darkWood);
      string.position.set(x, 0.31, -0.04);
      group.add(string);

      // Puppet head with turban
      const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.02, 0), mats.wood);
      head.position.set(x, 0.24, -0.04);
      group.add(head);

      const turban = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.02, 6), i === 0 ? mats.saffronStandard : mats.fabricPinkStripe);
      turban.position.set(x, 0.26, -0.04);
      group.add(turban);

      // Flared cloth ghagra skirt
      const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6), i === 0 ? mats.fabricYellowStripe : mats.fabricPinkStripe);
      skirt.position.set(x, 0.18, -0.04);
      group.add(skirt);
    });

    // 4. Folk Dholak Drum on the floor
    const dholak = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), mats.darkWood);
    dholak.rotation.z = Math.PI / 2;
    dholak.position.set(0.12, 0.10, 0.12);
    group.add(dholak);

    return group;
  }
}


import * as THREE from 'three';
import { Materials } from '../graphics/Materials';
import { EnvironmentModels } from '../graphics/EnvironmentModels';
import { WaterSystem } from '../graphics/WaterSystem';
import { Tweens } from '../core/Tweens';
import { lerp, damp } from '../core/math';

export class IntroWorld3D {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private water: WaterSystem;
  private tweens: Tweens = new Tweens();
  private mats = Materials.get();

  // Animated elements
  private dogTail: THREE.Mesh | null = null;
  private dogHead: THREE.Mesh | null = null;
  private playerScarf: THREE.Mesh | null = null;
  private sailboat: THREE.Group | null = null;
  private clouds: THREE.Group[] = [];
  private birds: THREE.Group[] = [];
  private villagers: { group: THREE.Group; startX: number; speed: number; direction: number }[] = [];
  private chimneySmokes: { mesh: THREE.Mesh; startY: number; speed: number }[] = [];
  private waterfallParticles: THREE.Points | null = null;

  // Camera breathing & transition
  private cameraBasePos = new THREE.Vector3(-1.8, 4.2, 8.5);
  private cameraTarget = new THREE.Vector3(1.2, 1.4, 0);
  private cameraTime = 0;
  public isTransitioning = false;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xf8a576, 0.018); // Warm sunset atmospheric haze

    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 150);
    this.camera.position.copy(this.cameraBasePos);
    this.camera.lookAt(this.cameraTarget);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    this.water = new WaterSystem(this.scene);
    (this.water.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x2380b8);

    this.setupLighting();
    this.setupSkyAndSun();
    this.setupForegroundCliff();
    this.setupMainIsland();
    this.setupHaatPier();
    this.setupDistantIslets();
    this.setupCloudsAndBirds();
  }

  private setupLighting(): void {
    // Warm sunset directional sunlight
    const sunLight = new THREE.DirectionalLight(0xffeed6, 1.4);
    sunLight.position.set(15, 6, -18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Warm peach sky / lavender ambient
    const hemiLight = new THREE.HemisphereLight(0xffb787, 0x4a3b5a, 0.7);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    const ambLight = new THREE.AmbientLight(0xffa07a, 0.35);
    this.scene.add(ambLight);
  }

  private setupSkyAndSun(): void {
    this.scene.background = new THREE.Color(0xf69d62);

    // Glowing sunset sun disc on horizon
    const sunGeo = new THREE.CircleGeometry(2.4, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3a8, side: THREE.DoubleSide });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(18, 5.5, -35);
    this.scene.add(sunMesh);
  }

  private setupForegroundCliff(): void {
    const mats = this.mats;
    const fg = new THREE.Group();

    // 1. Grassy cliff edge
    const cliffBase = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), mats.earth);
    cliffBase.scale.set(1.4, 0.9, 1.2);
    cliffBase.position.set(-3.2, 1.2, 4.5);
    cliffBase.castShadow = true;
    cliffBase.receiveShadow = true;
    fg.add(cliffBase);

    const cliffTop = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.4, 8), mats.grass);
    cliffTop.position.set(-3.2, 2.1, 4.5);
    cliffTop.receiveShadow = true;
    fg.add(cliffTop);

    // 2. Rustic Wooden Fence
    for (let i = 0; i < 4; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 5), mats.darkWood);
      post.position.set(-4.0 + i * 0.55, 2.35, 4.8 - i * 0.2);
      post.rotation.z = (Math.random() - 0.5) * 0.15;
      post.castShadow = true;
      fg.add(post);

      if (i < 3) {
        const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.04), mats.wood);
        rail1.position.set(-3.72 + i * 0.55, 2.45, 4.7 - i * 0.2);
        rail1.rotation.y = -0.35;
        fg.add(rail1);

        const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.04), mats.wood);
        rail2.position.set(-3.72 + i * 0.55, 2.25, 4.7 - i * 0.2);
        rail2.rotation.y = -0.35;
        fg.add(rail2);
      }
    }

    // 3. Wildflowers and rocks on cliff
    for (let i = 0; i < 8; i++) {
      const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 0), i % 2 === 0 ? mats.fabricYellow : mats.fabricPink);
      flower.position.set(-3.6 + Math.random() * 1.2, 2.32, 4.0 + Math.random() * 0.8);
      fg.add(flower);
    }

    // 4. Player Character (Adventurer looking towards island)
    const player = new THREE.Group();
    player.position.set(-2.6, 2.3, 4.2);
    player.rotation.y = 0.55; // Facing toward main island

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xe0a880 });
    const tunicMat = new THREE.MeshLambertMaterial({ color: 0xf8f1e5 }); // Cream tunic
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x8d5b38 }); // Brown vest
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x3b6685 }); // Indigo pants
    const scarfMat = new THREE.MeshLambertMaterial({ color: 0xd32f2f }); // Crimson scarf

    // Body
    const pBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.16), tunicMat);
    pBody.position.y = 0.32;
    pBody.castShadow = true;
    player.add(pBody);

    const pVest = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.17), vestMat);
    pVest.position.y = 0.33;
    player.add(pVest);

    // Head & Hair
    const pHead = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.18), skinMat);
    pHead.position.y = 0.56;
    pHead.castShadow = true;
    player.add(pHead);

    const pHair = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.2), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
    pHair.position.set(0, 0.62, 0);
    player.add(pHair);

    // Traveler Backpack
    const pPack = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.12), new THREE.MeshLambertMaterial({ color: 0x6d4c41 }));
    pPack.position.set(0, 0.34, -0.12);
    pPack.castShadow = true;
    player.add(pPack);

    // Scarf with fluttering tail
    const pScarf = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.2), scarfMat);
    pScarf.position.y = 0.46;
    player.add(pScarf);

    const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.25), scarfMat);
    scarfTail.position.set(-0.1, 0.44, -0.18);
    scarfTail.rotation.x = -0.4;
    player.add(scarfTail);
    this.playerScarf = scarfTail;

    // Legs
    const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.09), pantsMat);
    lLeg.position.set(-0.06, 0.11, 0);
    lLeg.castShadow = true;
    player.add(lLeg);

    const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.09), pantsMat);
    rLeg.position.set(0.06, 0.11, 0);
    rLeg.castShadow = true;
    player.add(rLeg);

    player.scale.set(0.95, 0.95, 0.95);
    fg.add(player);

    // 5. Cute Companion Dog
    const dog = new THREE.Group();
    dog.position.set(-2.15, 2.3, 4.3);
    dog.rotation.y = 0.45;

    const dogWhiteMat = new THREE.MeshLambertMaterial({ color: 0xfdfdfd });
    const dogBrownMat = new THREE.MeshLambertMaterial({ color: 0x8d5b38 });

    // Dog body
    const dBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.26), dogWhiteMat);
    dBody.position.y = 0.18;
    dBody.castShadow = true;
    dog.add(dBody);

    const dSpot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.1, 0.12), dogBrownMat);
    dSpot.position.set(0.01, 0.2, 0.02);
    dog.add(dSpot);

    // Dog head
    const dHead = new THREE.Group();
    dHead.position.set(0, 0.28, 0.14);

    const dHeadMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), dogWhiteMat);
    dHead.add(dHeadMesh);

    // Brown Floppy Ears
    const lEar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.06), dogBrownMat);
    lEar.position.set(-0.08, 0.02, 0);
    lEar.rotation.z = 0.2;
    dHead.add(lEar);

    const rEar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.06), dogBrownMat);
    rEar.position.set(0.08, 0.02, 0);
    rEar.rotation.z = -0.2;
    dHead.add(rEar);

    dog.add(dHead);
    this.dogHead = dHeadMesh;

    // Dog Tail (animated)
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.14), dogBrownMat);
    tail.position.set(0, 0.22, -0.16);
    tail.rotation.x = 0.6;
    dog.add(tail);
    this.dogTail = tail;

    dog.scale.set(0.85, 0.85, 0.85);
    fg.add(dog);

    this.scene.add(fg);
  }

  private setupMainIsland(): void {
    const mats = this.mats;
    const island = new THREE.Group();
    island.position.set(0.8, 0, -2);

    // Central Green Hill / Cliffs
    const mainHill = new THREE.Mesh(new THREE.DodecahedronGeometry(4.5, 1), mats.grass);
    mainHill.scale.set(1.6, 0.8, 1.4);
    mainHill.position.set(-0.5, 1.6, 0);
    mainHill.receiveShadow = true;
    mainHill.castShadow = true;
    island.add(mainHill);

    // Mountain Peak with Cultural Pagoda Temple Tower
    const peak = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.2, 7), mats.stone);
    peak.position.set(-1.8, 3.2, -1.2);
    peak.castShadow = true;
    island.add(peak);

    // Cultural Tower on Peak
    const tower = EnvironmentModels.createPavilion();
    tower.position.set(-1.8, 4.8, -1.2);
    tower.scale.set(1.3, 1.3, 1.3);
    island.add(tower);

    // Cascading Waterfall
    const fallGeo = new THREE.PlaneGeometry(0.6, 2.6, 8, 8);
    const fallMat = new THREE.MeshBasicMaterial({ color: 0x90caf9, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const fallMesh = new THREE.Mesh(fallGeo, fallMat);
    fallMesh.position.set(-1.2, 2.1, 1.2);
    fallMesh.rotation.y = 0.4;
    fallMesh.rotation.x = 0.15;
    island.add(fallMesh);

    // Golden Wheat Fields
    const farmField = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 1.6), mats.field);
    farmField.position.set(-1.2, 1.35, 1.8);
    farmField.rotation.y = -0.2;
    farmField.receiveShadow = true;
    island.add(farmField);

    // Wheat crop stalks
    for (let i = 0; i < 18; i++) {
      const stalk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 4), mats.field);
      stalk.position.set(-1.8 + (i % 6) * 0.25, 1.48, 1.2 + Math.floor(i / 6) * 0.35);
      stalk.castShadow = true;
      island.add(stalk);
    }

    // Village Farmhouses with chimneys
    const farmHouse = EnvironmentModels.createFarm();
    farmHouse.position.set(-2.2, 1.4, 2.0);
    farmHouse.scale.set(1.1, 1.1, 1.1);
    island.add(farmHouse);

    // Chimney Smoke particles
    const smokeGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const smokeMesh = new THREE.Mesh(smokeGeo, mats.smoke);
    smokeMesh.position.set(-2.3, 2.1, 2.0);
    island.add(smokeMesh);
    this.chimneySmokes.push({ mesh: smokeMesh, startY: 2.1, speed: 0.6 });

    // Lush Palm & Fruit Trees
    const treePositions = [
      { x: -0.2, y: 2.2, z: 0.2, type: 'banyan' },
      { x: -2.8, y: 1.8, z: 0.5, type: 'blossom' },
      { x: 0.5, y: 1.6, z: 1.5, type: 'round' },
      { x: -1.0, y: 2.8, z: -0.8, type: 'pine' },
      { x: 1.2, y: 1.2, z: 2.2, type: 'round' }
    ];

    treePositions.forEach((tp, idx) => {
      const tree = EnvironmentModels.createTree(tp.type as any, idx * 9);
      tree.position.set(tp.x, tp.y, tp.z);
      island.add(tree);
    });

    this.scene.add(island);
  }

  private setupHaatPier(): void {
    const mats = this.mats;
    const haatGroup = new THREE.Group();
    haatGroup.position.set(3.2, 0.3, 0.5);

    // 1. Large Wooden Pier Boardwalk stretching over ocean
    const pierPlank = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 2.2), mats.wood);
    pierPlank.position.set(0, 0.1, 0);
    pierPlank.receiveShadow = true;
    pierPlank.castShadow = true;
    haatGroup.add(pierPlank);

    // Pier Pilings / Wooden Stilts in water
    for (let x = -1.6; x <= 1.6; x += 0.8) {
      for (let z = -0.9; z <= 0.9; z += 0.9) {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 5), mats.darkWood);
        stilt.position.set(x, -0.25, z);
        stilt.castShadow = true;
        haatGroup.add(stilt);
      }
    }

    // 2. Haat Market Stalls with Striped Canopies
    const stall1 = this.createCanopyStall(mats.fabricPink, mats.fabricYellow);
    stall1.position.set(-0.8, 0.17, -0.4);
    stall1.rotation.y = 0.2;
    haatGroup.add(stall1);

    const stall2 = this.createCanopyStall(mats.fabricBlue, mats.fabricYellow);
    stall2.position.set(0.6, 0.17, -0.35);
    stall2.rotation.y = -0.15;
    haatGroup.add(stall2);

    const stall3 = this.createCanopyStall(mats.terracotta, mats.fabricPink);
    stall3.position.set(0, 0.17, 0.5);
    stall3.rotation.y = Math.PI;
    haatGroup.add(stall3);

    // 3. Festival Bunting Garlands & Lanterns
    for (let i = 0; i < 5; i++) {
      const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 1), mats.lanternGlow);
      lantern.position.set(-1.2 + i * 0.6, 0.65, -0.8);
      haatGroup.add(lantern);
    }

    // 4. Miniature Animated Villagers
    for (let i = 0; i < 3; i++) {
      const vGroup = new THREE.Group();
      const vBody = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.08), i % 2 === 0 ? mats.fabricPink : mats.fabricBlue);
      vBody.position.y = 0.16;
      vBody.castShadow = true;
      vGroup.add(vBody);

      const vHead = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), mats.thatch);
      vHead.position.y = 0.28;
      vGroup.add(vHead);

      vGroup.position.set(-0.5 + i * 0.5, 0.17, -0.1 + (i % 2) * 0.3);
      haatGroup.add(vGroup);

      this.villagers.push({
        group: vGroup,
        startX: vGroup.position.x,
        speed: 0.3 + i * 0.1,
        direction: 1
      });
    }

    // 5. Wooden Sailboat Moored Beside Pier
    const boat = new THREE.Group();
    boat.position.set(1.2, 0.05, 1.6);
    boat.rotation.y = -0.4;

    const hull = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 4), mats.wood);
    hull.rotation.z = Math.PI / 2;
    hull.rotation.y = Math.PI / 4;
    hull.scale.set(0.6, 1.2, 0.5);
    boat.add(hull);

    // Mast & Sail
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 4), mats.darkWood);
    mast.position.set(0, 0.45, 0);
    boat.add(mast);

    const sail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 3), mats.whitePlaster);
    sail.position.set(0.12, 0.55, 0);
    sail.rotation.z = -Math.PI / 2;
    sail.scale.set(1, 0.1, 0.9);
    boat.add(sail);

    haatGroup.add(boat);
    this.sailboat = boat;

    this.scene.add(haatGroup);
  }

  private createCanopyStall(mat1: THREE.Material, mat2: THREE.Material): THREE.Group {
    const mats = this.mats;
    const stall = new THREE.Group();

    // Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.3), mats.wood);
    table.position.y = 0.1;
    table.castShadow = true;
    stall.add(table);

    // Canopies
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 4), mat1);
    canopy.position.set(0, 0.45, 0);
    canopy.rotation.y = Math.PI / 4;
    canopy.scale.set(1.4, 0.6, 1.1);
    canopy.castShadow = true;
    stall.add(canopy);

    return stall;
  }

  private setupDistantIslets(): void {
    const mats = this.mats;
    const islets = [
      { x: -9, z: -14, s: 1.6 },
      { x: 12, z: -18, s: 2.2 },
      { x: 16, z: -8, s: 1.4 },
      { x: -14, z: -6, s: 1.8 }
    ];

    islets.forEach((it, idx) => {
      const rock = new THREE.Mesh(new THREE.ConeGeometry(1.5 * it.s, 1.8 * it.s, 6), mats.stone);
      rock.position.set(it.x, 0.5, it.z);
      this.scene.add(rock);

      const tree = EnvironmentModels.createTree('pine', idx * 7);
      tree.position.set(it.x, 1.6 * it.s, it.z);
      tree.scale.set(it.s * 0.8, it.s * 0.8, it.s * 0.8);
      this.scene.add(tree);
    });
  }

  private setupCloudsAndBirds(): void {
    // Drifting Fluffy Clouds
    const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    for (let i = 0; i < 4; i++) {
      const cGroup = new THREE.Group();
      for (let b = 0; b < 3; b++) {
        const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 + b * 0.3, 1), cloudMat);
        puff.position.set(b * 0.9, (b % 2) * 0.2, 0);
        puff.scale.set(1.4, 0.6, 1);
        cGroup.add(puff);
      }
      cGroup.position.set(-18 + i * 11, 7 + (i % 2) * 1.5, -15 - i * 4);
      this.scene.add(cGroup);
      this.clouds.push(cGroup);
    }

    // Flying Birds (Silhouettes)
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x3e2723, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) {
      const bird = new THREE.Group();
      const lWing = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), birdMat);
      lWing.position.x = -0.09;
      lWing.rotation.z = 0.3;
      bird.add(lWing);

      const rWing = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.08), birdMat);
      rWing.position.x = 0.09;
      rWing.rotation.z = -0.3;
      bird.add(rWing);

      bird.position.set(4 + i * 0.8, 6.5 + i * 0.3, -12 - i * 0.5);
      this.scene.add(bird);
      this.birds.push(bird);
    }
  }

  public swooshIntoIsland(onComplete: () => void): void {
    this.isTransitioning = true;
    const startP = this.camera.position.clone();
    const endP = new THREE.Vector3(0.5, 2.2, 2.5);

    this.tweens.add({
      duration: 1.4,
      update: (k) => {
        this.camera.position.lerpVectors(startP, endP, k);
      },
      complete: onComplete
    });
  }

  public update(dt: number, reduceMotion = false): void {
    this.tweens.update(dt);
    this.water.update(dt);
    this.cameraTime += dt;

    if (!reduceMotion && !this.isTransitioning) {
      // Gentle camera breathing & subtle parallax
      const swayX = Math.sin(this.cameraTime * 0.4) * 0.12;
      const swayY = Math.cos(this.cameraTime * 0.3) * 0.08;
      this.camera.position.x = this.cameraBasePos.x + swayX;
      this.camera.position.y = this.cameraBasePos.y + swayY;
      this.camera.lookAt(this.cameraTarget);
    }

    // 1. Dog tail wag & head turn
    if (this.dogTail) {
      this.dogTail.rotation.y = Math.sin(this.cameraTime * 8) * 0.45;
    }
    if (this.dogHead) {
      this.dogHead.rotation.y = Math.sin(this.cameraTime * 1.5) * 0.2;
    }

    // 2. Player scarf flutter
    if (this.playerScarf) {
      this.playerScarf.rotation.y = Math.sin(this.cameraTime * 6) * 0.25 - 0.2;
    }

    // 3. Sailboat gentle rocking
    if (this.sailboat) {
      this.sailboat.rotation.z = Math.sin(this.cameraTime * 2) * 0.06;
      this.sailboat.position.y = 0.05 + Math.sin(this.cameraTime * 1.8) * 0.02;
    }

    // 4. Chimney Smoke rising
    this.chimneySmokes.forEach(s => {
      s.mesh.position.y += dt * s.speed;
      s.mesh.scale.multiplyScalar(1 + dt * 0.3);
      if (s.mesh.position.y > s.startY + 1.2) {
        s.mesh.position.y = s.startY;
        s.mesh.scale.set(1, 1, 1);
      }
    });

    // 5. Villagers walking on boardwalk
    this.villagers.forEach(v => {
      v.group.position.x += dt * v.speed * v.direction;
      if (Math.abs(v.group.position.x - v.startX) > 0.45) {
        v.direction *= -1;
      }
    });

    // 6. Clouds slow drift
    this.clouds.forEach(c => {
      c.position.x += dt * 0.2;
      if (c.position.x > 25) c.position.x = -25;
    });

    // 7. Flying birds
    this.birds.forEach((b, idx) => {
      b.position.x -= dt * (1.2 + idx * 0.1);
      b.position.y += Math.sin(this.cameraTime * 4 + idx) * 0.005;
      if (b.position.x < -20) b.position.x = 22;
    });

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public destroy(): void {
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';

export interface SpecialistParts {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  propsGroup: THREE.Group;
}

export class CulturalSpecialistBuilder {
  private static mats = Materials.get();

  /**
   * Builds distinct cultural specialist character model with articulated limb pivots for natural locomotion
   */
  public static createSpecialist(state: IndianState): SpecialistParts {
    const mats = this.mats;
    const root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5caa6, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 }); // Leather juttis/shoes

    // 1. Torso Group (Center pivot at waist level)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.22, 0);
    root.add(torsoGroup);

    // 2. Head Group (Pivot at neck level)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.24, 0);
    torsoGroup.add(headGroup);

    // Head Mesh with stylised facial geometry
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 3. Arm Groups (Pivots at shoulder joints)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.15, 0.18, 0);
    torsoGroup.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.15, 0.18, 0);
    torsoGroup.add(rightArm);

    // 4. Leg Groups (Pivots at hip joints)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.065, 0, 0);
    torsoGroup.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.065, 0, 0);
    torsoGroup.add(rightLeg);

    // 5. Props Group (Attached to arms or waist)
    const propsGroup = new THREE.Group();
    torsoGroup.add(propsGroup);

    // State-specific clothing and traditional costume assembly
    switch (state) {
      case 'bihar': {
        // Mithila Artisan: Kurta-dhoti, artisan shoulder sash, kalam stylus & palette
        const kurtaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 }); // Light cream
        const dhotiMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }); // White cotton
        const sashMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 }); // Red sash

        // Torso & Sash
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.14), kurtaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        torsoGroup.add(torso);

        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.16), sashMat);
        sash.position.set(0, 0.12, 0.02);
        torsoGroup.add(sash);

        // Hair Knot
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), hairMat);
        hair.position.set(0, 0.08, -0.02);
        headGroup.add(hair);

        // Arms (Kurta sleeves + hands)
        const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), kurtaMat);
        lSleeve.position.set(0, -0.08, 0);
        lSleeve.castShadow = true;
        leftArm.add(lSleeve);
        const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.04), skinMat);
        lHand.position.set(0, -0.18, 0);
        leftArm.add(lHand);

        const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), kurtaMat);
        rSleeve.position.set(0, -0.08, 0);
        rSleeve.castShadow = true;
        rightArm.add(rSleeve);
        const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.04), skinMat);
        rHand.position.set(0, -0.18, 0);
        rightArm.add(rHand);

        // Legs (Dhoti cloth + shoes)
        const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.09), dhotiMat);
        lLegMesh.position.set(0, -0.08, 0);
        lLegMesh.castShadow = true;
        leftLeg.add(lLegMesh);
        const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.11), shoeMat);
        lShoe.position.set(0, -0.18, 0.02);
        leftLeg.add(lShoe);

        const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.09), dhotiMat);
        rLegMesh.position.set(0, -0.08, 0);
        rLegMesh.castShadow = true;
        rightLeg.add(rLegMesh);
        const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.11), shoeMat);
        rShoe.position.set(0, -0.18, 0.02);
        rightLeg.add(rShoe);

        // Hand Props
        const palette = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 8), mats.madhubaniCanvas);
        palette.position.set(0, -0.17, 0.06);
        palette.rotation.x = Math.PI / 4;
        rightArm.add(palette);

        const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 4), mats.wood);
        stylus.position.set(0, -0.17, 0.05);
        stylus.rotation.x = Math.PI / 3;
        leftArm.add(stylus);
        break;
      }

      case 'maharashtra': {
        // Sahyadri Architect: Pagadi turban, Maratha vest, blueprint scroll & calipers
        const angarkhaMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
        const vestMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }); // Slate blue
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.65 }); // Royal Crimson Pagadi

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.24, 0.14), angarkhaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        torsoGroup.add(torso);

        const vest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.15), vestMat);
        vest.position.set(0, 0.09, 0);
        torsoGroup.add(vest);

        // Maratha Pagadi
        const pagadi = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.08, 8), turbanMat);
        pagadi.position.set(0, 0.10, 0.01);
        pagadi.rotation.z = 0.1;
        headGroup.add(pagadi);

        const peak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.10, 4), turbanMat);
        peak.position.set(0.06, 0.15, 0.04);
        headGroup.add(peak);

        // Limbs
        const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.16, 0.065), angarkhaMat);
        lSleeve.position.set(0, -0.08, 0);
        leftArm.add(lSleeve);
        const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.16, 0.065), angarkhaMat);
        rSleeve.position.set(0, -0.08, 0);
        rightArm.add(rSleeve);

        const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), angarkhaMat);
        lLegMesh.position.set(0, -0.08, 0);
        leftLeg.add(lLegMesh);
        const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.11), shoeMat);
        lShoe.position.set(0, -0.18, 0.02);
        leftLeg.add(lShoe);

        const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), angarkhaMat);
        rLegMesh.position.set(0, -0.08, 0);
        rightLeg.add(rLegMesh);
        const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.11), shoeMat);
        rShoe.position.set(0, -0.18, 0.02);
        rightLeg.add(rShoe);

        // Hand Props
        const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.20, 6), mats.whitePlaster);
        scroll.position.set(0, -0.16, 0.06);
        scroll.rotation.z = Math.PI / 3;
        rightArm.add(scroll);

        const mallet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), mats.basaltRock);
        mallet.position.set(0, -0.16, 0.05);
        leftArm.add(mallet);
        break;
      }

      case 'west_bengal': {
        // Pandal Designer: Indigo Kurta, yellow Uttariya scarf, measuring rod & streamers
        const kurtaMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 }); // Royal indigo
        const uttariyaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.75 }); // Yellow scarf

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.14), kurtaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        torsoGroup.add(torso);

        const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.15), uttariyaMat);
        scarf.position.set(-0.06, 0.08, 0.02);
        torsoGroup.add(scarf);

        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.16), hairMat);
        hair.position.set(0, 0.08, -0.02);
        headGroup.add(hair);

        const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), kurtaMat);
        lSleeve.position.set(0, -0.08, 0);
        leftArm.add(lSleeve);
        const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), kurtaMat);
        rSleeve.position.set(0, -0.08, 0);
        rightArm.add(rSleeve);

        const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mats.whitePlaster);
        lLegMesh.position.set(0, -0.08, 0);
        leftLeg.add(lLegMesh);
        const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mats.whitePlaster);
        rLegMesh.position.set(0, -0.08, 0);
        rightLeg.add(rLegMesh);

        // Ruler prop
        const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.02), mats.wood);
        ruler.position.set(0, -0.14, 0.06);
        ruler.rotation.x = Math.PI / 6;
        rightArm.add(ruler);
        break;
      }

      case 'karnataka': {
        // Channapatna Craftmaster: Mysore Peta turban with gold trim, craft apron & lathe chisel
        const tunicMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 }); // Mysore green
        const apronMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Leather apron
        const petaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Golden amber

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.24, 0.14), tunicMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        torsoGroup.add(torso);

        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.20, 0.15), apronMat);
        apron.position.set(0, 0.06, 0.02);
        torsoGroup.add(apron);

        // Mysore Peta Turban
        const peta = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.09, 8), petaMat);
        peta.position.set(0, 0.10, 0);
        headGroup.add(peta);

        const goldBorder = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.015, 6, 12), mats.goldCoin);
        goldBorder.position.set(0, 0.07, 0);
        goldBorder.rotation.x = Math.PI / 2;
        headGroup.add(goldBorder);

        const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), tunicMat);
        lSleeve.position.set(0, -0.08, 0);
        leftArm.add(lSleeve);
        const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), tunicMat);
        rSleeve.position.set(0, -0.08, 0);
        rightArm.add(rSleeve);

        const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mats.whitePlaster);
        lLegMesh.position.set(0, -0.08, 0);
        leftLeg.add(lLegMesh);
        const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mats.whitePlaster);
        rLegMesh.position.set(0, -0.08, 0);
        rightLeg.add(rLegMesh);

        // Channapatna Lacquered Toy
        const toyTop = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.07, 8), mats.blossomPink);
        toyTop.position.set(0, -0.15, 0.05);
        rightArm.add(toyTop);
        break;
      }

      case 'gujarat': {
        // Haat Negotiator: Kediyu pleated tunic, wrapped turban, bahi-khata ledger & coin pouch
        const kediyuMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.7 }); // Fuchsia
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 }); // Saffron

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.15), kediyuMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        torsoGroup.add(torso);

        const flare = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.08, 8), kediyuMat);
        flare.position.set(0, 0.01, 0);
        torsoGroup.add(flare);

        const turban = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.04, 8, 12), turbanMat);
        turban.position.set(0, 0.09, 0);
        turban.rotation.x = Math.PI / 2;
        headGroup.add(turban);

        const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), kediyuMat);
        lSleeve.position.set(0, -0.08, 0);
        leftArm.add(lSleeve);
        const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), kediyuMat);
        rSleeve.position.set(0, -0.08, 0);
        rightArm.add(rSleeve);

        const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mats.whitePlaster);
        lLegMesh.position.set(0, -0.08, 0);
        leftLeg.add(lLegMesh);
        const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), mats.whitePlaster);
        rLegMesh.position.set(0, -0.08, 0);
        rightLeg.add(rLegMesh);

        // Ledger
        const bahi = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.12), mats.fabricBanner);
        bahi.position.set(0, -0.15, 0.05);
        rightArm.add(bahi);
        break;
      }

      case 'rajasthan': {
        // Stepwell Engineer: Royal Saffron Safa turban, Angarkha with waist sash, plumb-bob level & scale
        const angarkhaMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
        const safaMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });
        const sashMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 });

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.25, 0.14), angarkhaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        torsoGroup.add(torso);

        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.16), sashMat);
        sash.position.set(0, 0.03, 0);
        torsoGroup.add(sash);

        // Safa Turban
        const safa = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.11, 8), safaMat);
        safa.position.set(0, 0.10, 0);
        headGroup.add(safa);

        const safaTail = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.20), safaMat);
        safaTail.position.set(0, -0.02, -0.11);
        headGroup.add(safaTail);

        const lSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), angarkhaMat);
        lSleeve.position.set(0, -0.08, 0);
        leftArm.add(lSleeve);
        const rSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), angarkhaMat);
        rSleeve.position.set(0, -0.08, 0);
        rightArm.add(rSleeve);

        const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), angarkhaMat);
        lLegMesh.position.set(0, -0.08, 0);
        leftLeg.add(lLegMesh);
        const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), angarkhaMat);
        rLegMesh.position.set(0, -0.08, 0);
        rightLeg.add(rLegMesh);

        // Water level prop
        const plumb = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.05, 6), mats.goldCoin);
        plumb.position.set(0, -0.16, 0.05);
        rightArm.add(plumb);
        break;
      }
    }

    root.scale.set(0.95, 0.95, 0.95);
    return {
      root,
      torsoGroup,
      headGroup,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      propsGroup
    };
  }
}

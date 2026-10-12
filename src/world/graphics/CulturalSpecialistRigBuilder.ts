import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';

/**
 * Full Multi-Joint Articulation Hierarchy for Stylized Indian Cultural Specialist
 */
export interface SpecialistJointRig {
  root: THREE.Group;
  pelvis: THREE.Group;
  spineLower: THREE.Group;
  spineUpper: THREE.Group;
  chest: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;

  // Left Arm (Clavicle -> Shoulder -> UpperArm -> Elbow -> Forearm -> Wrist -> Hand)
  leftClavicle: THREE.Group;
  leftShoulder: THREE.Group;
  leftUpperArm: THREE.Group;
  leftElbow: THREE.Group;
  leftForearm: THREE.Group;
  leftWrist: THREE.Group;
  leftHand: THREE.Group;

  // Right Arm
  rightClavicle: THREE.Group;
  rightShoulder: THREE.Group;
  rightUpperArm: THREE.Group;
  rightElbow: THREE.Group;
  rightForearm: THREE.Group;
  rightWrist: THREE.Group;
  rightHand: THREE.Group;

  // Left Leg (Hip -> Thigh -> Knee -> Shin -> Ankle -> Foot)
  leftHip: THREE.Group;
  leftThigh: THREE.Group;
  leftKnee: THREE.Group;
  leftShin: THREE.Group;
  leftAnkle: THREE.Group;
  leftFoot: THREE.Group;

  // Right Leg
  rightHip: THREE.Group;
  rightThigh: THREE.Group;
  rightKnee: THREE.Group;
  rightShin: THREE.Group;
  rightAnkle: THREE.Group;
  rightFoot: THREE.Group;

  // Cultural props and accessories group
  propsGroup: THREE.Group;
}

export class CulturalSpecialistRigBuilder {
  private static mats = Materials.get();

  /**
   * Constructs an organic, multi-joint stylized human rig with true anatomical pivots:
   * Shoulders, Elbows, Wrists, Hips, Knees, and Ankles.
   */
  public static createRig(state: IndianState): SpecialistJointRig {
    const mats = this.mats;
    const root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5caa6, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

    // 1. Root & Pelvis (Root anchor at y = 0.22)
    const pelvis = new THREE.Group();
    pelvis.position.set(0, 0.22, 0);
    root.add(pelvis);

    // 2. Spine Hierarchy (Lower Spine -> Upper Spine / Chest)
    const spineLower = new THREE.Group();
    spineLower.position.set(0, 0.04, 0);
    pelvis.add(spineLower);

    const spineUpper = new THREE.Group();
    spineUpper.position.set(0, 0.08, 0);
    spineLower.add(spineUpper);

    const chest = new THREE.Group();
    chest.position.set(0, 0.06, 0);
    spineUpper.add(chest);

    // 3. Neck & Head
    const neck = new THREE.Group();
    neck.position.set(0, 0.10, 0);
    chest.add(neck);

    const head = new THREE.Group();
    head.position.set(0, 0.04, 0);
    neck.add(head);

    // Rounded Stylized Head Mesh
    const headMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 1), skinMat);
    headMesh.scale.set(1.0, 1.1, 1.0);
    headMesh.position.set(0, 0.06, 0);
    headMesh.castShadow = true;
    head.add(headMesh);

    // Nose
    const noseMesh = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.03, 4), skinMat);
    noseMesh.rotation.x = Math.PI / 2;
    noseMesh.position.set(0, 0.05, 0.095);
    head.add(noseMesh);

    // 4. Arms Architecture (Clavicles -> Shoulders -> UpperArms -> Elbows -> Forearms -> Wrists -> Hands)
    // Left Arm
    const leftClavicle = new THREE.Group();
    leftClavicle.position.set(-0.06, 0.08, 0);
    chest.add(leftClavicle);

    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.08, 0, 0);
    leftClavicle.add(leftShoulder);

    const leftUpperArm = new THREE.Group();
    leftShoulder.add(leftUpperArm);

    // Elbow Pivot: placed exactly at bottom of upper arm (-0.11m)
    const leftElbow = new THREE.Group();
    leftElbow.position.set(0, -0.11, 0);
    leftUpperArm.add(leftElbow);

    const leftForearm = new THREE.Group();
    leftElbow.add(leftForearm);

    // Wrist Pivot: placed at end of forearm (-0.10m)
    const leftWrist = new THREE.Group();
    leftWrist.position.set(0, -0.10, 0);
    leftForearm.add(leftWrist);

    const leftHand = new THREE.Group();
    leftWrist.add(leftHand);

    // Stylized Sculpted Hand with Thumb & Palm
    const lPalm = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.045, 0.024), skinMat);
    lPalm.position.set(0, -0.022, 0);
    lPalm.castShadow = true;
    leftHand.add(lPalm);
    const lThumb = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.022, 0.014), skinMat);
    lThumb.position.set(0.020, -0.015, 0.008);
    leftHand.add(lThumb);

    // Right Arm
    const rightClavicle = new THREE.Group();
    rightClavicle.position.set(0.06, 0.08, 0);
    chest.add(rightClavicle);

    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.08, 0, 0);
    rightClavicle.add(rightShoulder);

    const rightUpperArm = new THREE.Group();
    rightShoulder.add(rightUpperArm);

    const rightElbow = new THREE.Group();
    rightElbow.position.set(0, -0.11, 0);
    rightUpperArm.add(rightElbow);

    const rightForearm = new THREE.Group();
    rightElbow.add(rightForearm);

    const rightWrist = new THREE.Group();
    rightWrist.position.set(0, -0.10, 0);
    rightForearm.add(rightWrist);

    const rightHand = new THREE.Group();
    rightWrist.add(rightHand);

    const rPalm = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.045, 0.024), skinMat);
    rPalm.position.set(0, -0.022, 0);
    rPalm.castShadow = true;
    rightHand.add(rPalm);
    const rThumb = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.022, 0.014), skinMat);
    rThumb.position.set(-0.020, -0.015, 0.008);
    rightHand.add(rThumb);

    // 5. Legs Architecture (Hips -> Thighs -> Knees -> Shins -> Ankles -> Feet)
    // Left Leg
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.07, 0, 0);
    pelvis.add(leftHip);

    const leftThigh = new THREE.Group();
    leftHip.add(leftThigh);

    // Knee Pivot: placed exactly at bottom of thigh (-0.11m)
    const leftKnee = new THREE.Group();
    leftKnee.position.set(0, -0.11, 0);
    leftThigh.add(leftKnee);

    const leftShin = new THREE.Group();
    leftKnee.add(leftShin);

    // Ankle Pivot: placed at bottom of shin (-0.10m)
    const leftAnkle = new THREE.Group();
    leftAnkle.position.set(0, -0.10, 0);
    leftShin.add(leftAnkle);

    const leftFoot = new THREE.Group();
    leftAnkle.add(leftFoot);

    // Right Leg
    const rightHip = new THREE.Group();
    rightHip.position.set(0.07, 0, 0);
    pelvis.add(rightHip);

    const rightThigh = new THREE.Group();
    rightHip.add(rightThigh);

    const rightKnee = new THREE.Group();
    rightKnee.position.set(0, -0.11, 0);
    rightThigh.add(rightKnee);

    const rightShin = new THREE.Group();
    rightKnee.add(rightShin);

    const rightAnkle = new THREE.Group();
    rightAnkle.position.set(0, -0.10, 0);
    rightShin.add(rightAnkle);

    const rightFoot = new THREE.Group();
    rightAnkle.add(rightFoot);

    // 6. Props Group
    const propsGroup = new THREE.Group();
    pelvis.add(propsGroup);

    // 7. State-Specific Cultural Tailoring and Costume Geometry
    this.applyCulturalCostume(state, {
      pelvis, spineLower, spineUpper, chest, neck, head,
      leftUpperArm, leftElbow, leftForearm, leftHand,
      rightUpperArm, rightElbow, rightForearm, rightHand,
      leftThigh, leftKnee, leftShin, leftFoot,
      rightThigh, rightKnee, rightShin, rightFoot,
      propsGroup
    });

    root.scale.set(0.95, 0.95, 0.95);

    return {
      root, pelvis, spineLower, spineUpper, chest, neck, head,
      leftClavicle, leftShoulder, leftUpperArm, leftElbow, leftForearm, leftWrist, leftHand,
      rightClavicle, rightShoulder, rightUpperArm, rightElbow, rightForearm, rightWrist, rightHand,
      leftHip, leftThigh, leftKnee, leftShin, leftAnkle, leftFoot,
      rightHip, rightThigh, rightKnee, rightShin, rightAnkle, rightFoot,
      propsGroup
    };
  }

  private static applyCulturalCostume(state: IndianState, joints: any): void {
    const mats = this.mats;
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5caa6, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });

    // Helper: builds rounded 2-segment limbs (Upper + Lower) with organic caps
    const createLimbMesh = (mat: THREE.Material, upperGroup: THREE.Group, lowerGroup: THREE.Group, rUpper = 0.038, rLower = 0.032) => {
      // Upper limb: positioned with top at joint pivot
      const upper = new THREE.Mesh(new THREE.CylinderGeometry(rUpper * 1.05, rUpper * 0.9, 0.11, 10), mat);
      upper.position.set(0, -0.055, 0);
      upper.castShadow = true;
      upperGroup.add(upper);

      // Rounded joint ball at elbow/knee to prevent gaps when rotating
      const jointCap = new THREE.Mesh(new THREE.SphereGeometry(rUpper * 0.95, 8, 8), mat);
      jointCap.position.set(0, 0, 0);
      lowerGroup.add(jointCap);

      // Lower limb
      const lower = new THREE.Mesh(new THREE.CylinderGeometry(rLower * 1.05, rLower * 0.85, 0.10, 10), mat);
      lower.position.set(0, -0.050, 0);
      lower.castShadow = true;
      lowerGroup.add(lower);
    };

    // Helper: builds sculpted curved footwear with ground sole
    const createFootMesh = (footGroup: THREE.Group, mat = shoeMat) => {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 0.11), mat);
      shoe.position.set(0, -0.018, 0.025);
      shoe.castShadow = true;
      footGroup.add(shoe);
      // Upturned toe curve typical of Indian juttis
      const toeTip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.04, 4), mat);
      toeTip.rotation.x = Math.PI / 3;
      toeTip.position.set(0, -0.012, 0.08);
      footGroup.add(toeTip);
    };

    switch (state) {
      case 'bihar': {
        // Mithila Artisan: Kurta-dhoti, artisan shoulder sash, kalam stylus & palette
        const kurtaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 });
        const dhotiMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });
        const sashMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 });

        // Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 10), kurtaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        joints.spineLower.add(torso);

        const sash = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 6, 12), sashMat);
        sash.position.set(0, 0.10, 0);
        sash.rotation.x = Math.PI / 3;
        joints.chest.add(sash);

        // Hair Knot
        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMat);
        hair.position.set(0, 0.07, -0.03);
        joints.head.add(hair);

        // Multi-segment Sleeves & Limbs
        createLimbMesh(kurtaMat, joints.leftUpperArm, joints.leftForearm, 0.036, 0.030);
        createLimbMesh(kurtaMat, joints.rightUpperArm, joints.rightForearm, 0.036, 0.030);

        // Legs (Dhoti cloth)
        createLimbMesh(dhotiMat, joints.leftThigh, joints.leftShin, 0.046, 0.038);
        createLimbMesh(dhotiMat, joints.rightThigh, joints.rightShin, 0.046, 0.038);
        createFootMesh(joints.leftFoot);
        createFootMesh(joints.rightFoot);

        // Mithila Palette & Kalam Stylus
        const palette = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 8), mats.madhubaniCanvas);
        palette.position.set(0, -0.04, 0.04);
        palette.rotation.x = Math.PI / 4;
        joints.rightHand.add(palette);

        const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.12, 4), mats.wood);
        stylus.position.set(0, -0.04, 0.03);
        stylus.rotation.x = Math.PI / 3;
        joints.leftHand.add(stylus);
        break;
      }

      case 'maharashtra': {
        // Sahyadri Architect: Pagadi turban, Maratha vest, blueprint scroll & calipers
        const angarkhaMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
        const vestMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.65 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 10), angarkhaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        joints.spineLower.add(torso);

        const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.11, 0.15, 10), vestMat);
        vest.position.set(0, 0.09, 0);
        joints.chest.add(vest);

        // Maratha Pagadi
        const pagadi = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.08, 8), turbanMat);
        pagadi.position.set(0, 0.09, 0.01);
        pagadi.rotation.z = 0.1;
        joints.head.add(pagadi);
        const peak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.09, 4), turbanMat);
        peak.position.set(0.05, 0.14, 0.03);
        joints.head.add(peak);

        createLimbMesh(angarkhaMat, joints.leftUpperArm, joints.leftForearm, 0.036, 0.030);
        createLimbMesh(angarkhaMat, joints.rightUpperArm, joints.rightForearm, 0.036, 0.030);
        createLimbMesh(angarkhaMat, joints.leftThigh, joints.leftShin, 0.044, 0.038);
        createLimbMesh(angarkhaMat, joints.rightThigh, joints.rightShin, 0.044, 0.038);
        createFootMesh(joints.leftFoot);
        createFootMesh(joints.rightFoot);

        // Blueprint Scroll & Mallet
        const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 6), mats.whitePlaster);
        scroll.position.set(0, -0.04, 0.04);
        scroll.rotation.z = Math.PI / 3;
        joints.rightHand.add(scroll);

        const mallet = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.035), mats.basaltRock);
        mallet.position.set(0, -0.04, 0.03);
        joints.leftHand.add(mallet);
        break;
      }

      case 'west_bengal': {
        // Pandal Designer: Indigo Kurta, yellow Uttariya scarf, measuring rod & streamers
        const kurtaMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.7 });
        const uttariyaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.75 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 10), kurtaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        joints.spineLower.add(torso);

        const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 12), uttariyaMat);
        scarf.position.set(-0.02, 0.08, 0);
        scarf.rotation.x = Math.PI / 4;
        joints.chest.add(scarf);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), hairMat);
        hair.position.set(0, 0.07, -0.02);
        joints.head.add(hair);

        createLimbMesh(kurtaMat, joints.leftUpperArm, joints.leftForearm, 0.036, 0.030);
        createLimbMesh(kurtaMat, joints.rightUpperArm, joints.rightForearm, 0.036, 0.030);
        createLimbMesh(mats.whitePlaster, joints.leftThigh, joints.leftShin, 0.044, 0.038);
        createLimbMesh(mats.whitePlaster, joints.rightThigh, joints.rightShin, 0.044, 0.038);
        createFootMesh(joints.leftFoot);
        createFootMesh(joints.rightFoot);

        // Bamboo measuring ruler
        const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 0.015), mats.wood);
        ruler.position.set(0, -0.05, 0.04);
        ruler.rotation.x = Math.PI / 6;
        joints.rightHand.add(ruler);
        break;
      }

      case 'karnataka': {
        // Channapatna Craftmaster: Mysore Peta turban with gold trim, craft apron & toy
        const tunicMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 });
        const apronMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
        const petaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 10), tunicMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        joints.spineLower.add(torso);

        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.14), apronMat);
        apron.position.set(0, 0.06, 0.02);
        joints.chest.add(apron);

        const peta = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.09, 0.08, 8), petaMat);
        peta.position.set(0, 0.09, 0);
        joints.head.add(peta);

        const goldBorder = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 6, 12), mats.goldCoin);
        goldBorder.position.set(0, 0.06, 0);
        goldBorder.rotation.x = Math.PI / 2;
        joints.head.add(goldBorder);

        createLimbMesh(tunicMat, joints.leftUpperArm, joints.leftForearm, 0.036, 0.030);
        createLimbMesh(tunicMat, joints.rightUpperArm, joints.rightForearm, 0.036, 0.030);
        createLimbMesh(mats.whitePlaster, joints.leftThigh, joints.leftShin, 0.044, 0.038);
        createLimbMesh(mats.whitePlaster, joints.rightThigh, joints.rightShin, 0.044, 0.038);
        createFootMesh(joints.leftFoot);
        createFootMesh(joints.rightFoot);

        // Channapatna Lacquered Toy
        const toyTop = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 8), mats.blossomPink);
        toyTop.position.set(0, -0.04, 0.04);
        joints.rightHand.add(toyTop);
        break;
      }

      case 'gujarat': {
        // Haat Negotiator: Kediyu pleated tunic, wrapped turban & ledger
        const kediyuMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.7 });
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 10), kediyuMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        joints.spineLower.add(torso);

        const flare = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.07, 8), kediyuMat);
        flare.position.set(0, 0.01, 0);
        joints.pelvis.add(flare);

        const turban = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.035, 8, 12), turbanMat);
        turban.position.set(0, 0.08, 0);
        turban.rotation.x = Math.PI / 2;
        joints.head.add(turban);

        createLimbMesh(kediyuMat, joints.leftUpperArm, joints.leftForearm, 0.036, 0.030);
        createLimbMesh(kediyuMat, joints.rightUpperArm, joints.rightForearm, 0.036, 0.030);
        createLimbMesh(mats.whitePlaster, joints.leftThigh, joints.leftShin, 0.044, 0.038);
        createLimbMesh(mats.whitePlaster, joints.rightThigh, joints.rightShin, 0.044, 0.038);
        createFootMesh(joints.leftFoot);
        createFootMesh(joints.rightFoot);

        // Bahi-Khata ledger
        const bahi = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.10), mats.fabricBanner);
        bahi.position.set(0, -0.04, 0.04);
        joints.rightHand.add(bahi);
        break;
      }

      case 'rajasthan': {
        // Stepwell Engineer: Royal Saffron Safa turban, Angarkha with waist sash & plumb-bob
        const angarkhaMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
        const safaMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 });
        const sashMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 });

        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.20, 10), angarkhaMat);
        torso.position.set(0, 0.08, 0);
        torso.castShadow = true;
        joints.spineLower.add(torso);

        const sash = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 12), sashMat);
        sash.position.set(0, 0.04, 0);
        sash.rotation.x = Math.PI / 2;
        joints.spineLower.add(sash);

        // Safa Turban
        const safa = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.10, 8), safaMat);
        safa.position.set(0, 0.09, 0);
        joints.head.add(safa);

        const safaTail = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.18), safaMat);
        safaTail.position.set(0, -0.02, -0.10);
        joints.head.add(safaTail);

        createLimbMesh(angarkhaMat, joints.leftUpperArm, joints.leftForearm, 0.036, 0.030);
        createLimbMesh(angarkhaMat, joints.rightUpperArm, joints.rightForearm, 0.036, 0.030);
        createLimbMesh(angarkhaMat, joints.leftThigh, joints.leftShin, 0.044, 0.038);
        createLimbMesh(angarkhaMat, joints.rightThigh, joints.rightShin, 0.044, 0.038);
        createFootMesh(joints.leftFoot);
        createFootMesh(joints.rightFoot);

        // Gold Plumb-bob level
        const plumb = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.045, 6), mats.goldCoin);
        plumb.position.set(0, -0.04, 0.04);
        joints.rightHand.add(plumb);
        break;
      }
    }
  }
}

import * as THREE from 'three';
import { Materials } from './Materials';
import { IndianState } from '../culture/CultureTypes';

export class CulturalSpecialistBuilder {
  private static mats = Materials.get();

  /**
   * Builds distinct cultural specialist character model
   */
  public static createSpecialist(state: IndianState): THREE.Group {
    const mats = this.mats;
    const root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5caa6, roughness: 0.6 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });

    // Base body group
    const body = new THREE.Group();

    switch (state) {
      case 'bihar': {
        // Mithila Artisan: Kurta-dhoti, artisan shoulder sash, kalam stylus & palette
        const kurtaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 }); // Light cream
        const dhotiMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }); // White cotton
        const sashMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 }); // Red sash

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.14), kurtaMat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        body.add(torso);

        // Artisan shoulder sash
        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.16), sashMat);
        sash.position.set(0, 0.28, 0.02);
        body.add(sash);

        // Head & traditional hair knot
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
        head.position.y = 0.44;
        head.castShadow = true;
        body.add(head);

        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.16), hairMat);
        hair.position.set(0, 0.50, -0.02);
        body.add(hair);

        // Legs (Dhoti)
        const legs = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.18, 0.12), dhotiMat);
        legs.position.y = 0.09;
        body.add(legs);

        // Right Hand Prop: Wooden Kalam Stylus & Painter's Palette
        const palette = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 8), mats.madhubaniCanvas);
        palette.position.set(0.18, 0.24, 0.08);
        palette.rotation.x = Math.PI / 4;
        body.add(palette);

        const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), mats.wood);
        stylus.position.set(-0.16, 0.24, 0.08);
        stylus.rotation.x = Math.PI / 3;
        body.add(stylus);
        break;
      }

      case 'maharashtra': {
        // Sahyadri Architect: Pagadi turban, Maratha vest, blueprint scroll & calipers
        const angarkhaMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
        const vestMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 }); // Slate blue
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.65 }); // Royal Crimson Pagadi

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.27, 0.14), angarkhaMat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        body.add(torso);

        const vest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.20, 0.15), vestMat);
        vest.position.y = 0.26;
        body.add(vest);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
        head.position.y = 0.44;
        body.add(head);

        // Maratha Pagadi (Angular pointed turban)
        const pagadi = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.10, 0.08, 8), turbanMat);
        pagadi.position.set(0, 0.52, 0.01);
        pagadi.rotation.z = 0.1;
        body.add(pagadi);

        const peak = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.10, 4), turbanMat);
        peak.position.set(0.06, 0.56, 0.04);
        body.add(peak);

        // Hand Prop: Architectural Blueprint Scroll & Mason Mallet
        const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), mats.whitePlaster);
        scroll.position.set(0.18, 0.22, 0.08);
        scroll.rotation.z = Math.PI / 3;
        body.add(scroll);

        const mallet = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.04), mats.basaltRock);
        mallet.position.set(-0.17, 0.22, 0.08);
        body.add(mallet);
        break;
      }

      case 'west_bengal': {
        // Pandal Designer: Kurta, folded Uttariya scarf, measuring rod & streamers
        const kurtaMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 }); // Royal indigo
        const uttariyaMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.75 }); // Yellow scarf

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.14), kurtaMat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        body.add(torso);

        // Folded Uttariya across left shoulder
        const scarf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.30, 0.15), uttariyaMat);
        scarf.position.set(-0.06, 0.25, 0.02);
        body.add(scarf);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
        head.position.y = 0.44;
        body.add(head);

        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.16), hairMat);
        hair.position.set(0, 0.50, -0.02);
        body.add(hair);

        // Hand Prop: Bamboo Architectural Measuring Scale
        const ruler = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.32, 0.02), mats.wood);
        ruler.position.set(0.18, 0.28, 0.08);
        ruler.rotation.x = Math.PI / 6;
        body.add(ruler);

        // Festival paper streamer roll
        const streamer = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), mats.fabricPinkStripe);
        streamer.position.set(-0.16, 0.20, 0.06);
        body.add(streamer);
        break;
      }

      case 'karnataka': {
        // Channapatna Craftmaster: Mysore Peta turban with gold trim, craft apron & lathe chisel
        const tunicMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.7 }); // Mysore green
        const apronMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Leather apron
        const petaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Golden amber

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.26, 0.14), tunicMat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        body.add(torso);

        const apron = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.15), apronMat);
        apron.position.set(0, 0.22, 0.02);
        body.add(apron);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
        head.position.y = 0.44;
        body.add(head);

        // Mysore Peta Turban with golden lace border
        const peta = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.10, 0.09, 8), petaMat);
        peta.position.set(0, 0.52, 0);
        body.add(peta);

        const goldBorder = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.015, 6, 12), mats.goldCoin);
        goldBorder.position.set(0, 0.49, 0);
        goldBorder.rotation.x = Math.PI / 2;
        body.add(goldBorder);

        // Hand Prop: Channapatna Lacquered Toy & Wood Chisel
        const toyTop = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 8), mats.blossomPink);
        toyTop.position.set(0.18, 0.24, 0.08);
        body.add(toyTop);

        const chisel = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 4), mats.graniteStone);
        chisel.position.set(-0.16, 0.22, 0.08);
        chisel.rotation.x = Math.PI / 4;
        body.add(chisel);
        break;
      }

      case 'gujarat': {
        // Haat Negotiator: Kediyu pleated tunic, wrapped turban, bahi-khata ledger & coin pouch
        const kediyuMat = new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.7 }); // Fuchsia / purple
        const turbanMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 }); // Saffron turban

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.15), kediyuMat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        body.add(torso);

        // Flared pleated lower kediyu rim
        const flare = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.08, 8), kediyuMat);
        flare.position.set(0, 0.14, 0);
        body.add(flare);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
        head.position.y = 0.44;
        body.add(head);

        // Wrapped Gujarati Feta / Turban
        const turban = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.04, 8, 12), turbanMat);
        turban.position.set(0, 0.51, 0);
        turban.rotation.x = Math.PI / 2;
        body.add(turban);

        // Hand Prop: Red Bahi-Khata (Accounting ledger) & Brass Coin Pouch
        const bahi = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.03, 0.14), mats.fabricBanner);
        bahi.position.set(0.18, 0.22, 0.08);
        bahi.rotation.y = Math.PI / 6;
        body.add(bahi);

        const pouch = new THREE.Mesh(new THREE.DodecahedronGeometry(0.04, 1), mats.goldCoin);
        pouch.position.set(-0.16, 0.18, 0.08);
        body.add(pouch);
        break;
      }

      case 'rajasthan': {
        // Stepwell Engineer: Royal Saffron Safa turban, Angarkha with waist sash, plumb-bob level & scale
        const angarkhaMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }); // Pure white
        const safaMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.6 }); // Orange Safa
        const sashMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7 }); // Royal blue sash

        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.28, 0.14), angarkhaMat);
        torso.position.y = 0.24;
        torso.castShadow = true;
        body.add(torso);

        const sash = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.06, 0.16), sashMat);
        sash.position.set(0, 0.18, 0);
        body.add(sash);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.15), skinMat);
        head.position.y = 0.44;
        body.add(head);

        // Broad Marwari Safa (Grand layered turban)
        const safa = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.11, 8), safaMat);
        safa.position.set(0, 0.52, 0);
        body.add(safa);

        // Safa flowing tail hanging down back
        const safaTail = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.20), safaMat);
        safaTail.position.set(0, 0.40, -0.11);
        body.add(safaTail);

        // Hand Prop: Water Level Plumb-Bob Instrument & Mason Scale
        const plumb = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 6), mats.goldCoin);
        plumb.position.set(0.18, 0.18, 0.08);
        plumb.rotation.x = Math.PI;
        body.add(plumb);

        const string = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.10, 4), mats.whitePlaster);
        string.position.set(0.18, 0.24, 0.08);
        body.add(string);

        const scale = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.02), mats.sandstone);
        scale.position.set(-0.16, 0.26, 0.08);
        scale.rotation.x = Math.PI / 5;
        body.add(scale);
        break;
      }
    }

    body.scale.set(0.95, 0.95, 0.95);
    root.add(body);
    return root;
  }
}

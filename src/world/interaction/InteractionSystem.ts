import * as THREE from 'three';
import { CharacterController } from '../character/CharacterController';
import { PlacedTile } from '../hex/TerrainField';
import { TILE_LIBRARY, LandmarkKind } from '../data/tileLibrary';
import { SQRT3, HEX_R } from '../hex/Hex';

export interface InteractableTarget {
  id: string;
  type: LandmarkKind | 'chest' | 'fire' | 'water';
  label: string;
  actionText: string;
  position: THREE.Vector3;
  tileKey?: string;
  data?: any;
}

export class InteractionSystem {
  private activeTarget: InteractableTarget | null = null;
  public interactionRange: number = 1.6;

  public findNearestInteractable(
    character: CharacterController,
    tiles: PlacedTile[],
    chestPos?: THREE.Vector3,
    activeFireTileKey?: string | null
  ): InteractableTarget | null {
    const charPos = character.position;
    let closest: InteractableTarget | null = null;
    let minDist = this.interactionRange;

    // 1. Check Chest
    if (chestPos) {
      const d = charPos.distanceTo(chestPos);
      if (d < minDist) {
        minDist = d;
        closest = {
          id: 'treasure_chest',
          type: 'chest',
          label: 'Treasure Chest',
          actionText: 'Open Chest',
          position: chestPos.clone()
        };
      }
    }

    // 2. Check Placed Tile Landmarks
    for (const tile of tiles) {
      const cx = SQRT3 * HEX_R * (tile.q + tile.r / 2);
      const cz = 1.5 * HEX_R * tile.r;
      const tilePos = new THREE.Vector3(cx, 0.4, cz);
      const d = charPos.distanceTo(tilePos);

      if (d < minDist) {
        // Fire event takes priority
        if (tile.key === activeFireTileKey) {
          minDist = d;
          closest = {
            id: `fire_${tile.key}`,
            type: 'fire',
            label: 'Blazing Fire!',
            actionText: 'Extinguish Flame',
            position: tilePos,
            tileKey: tile.key
          };
          continue;
        }

        const def = TILE_LIBRARY[tile.defId];
        if (def && def.landmark) {
          minDist = d;
          const actions: Record<LandmarkKind, { label: string; action: string }> = {
            farmhouse: { label: 'Terraced Farm', action: 'Harvest Grain' },
            houses: { label: 'Village Homes', action: 'Greet Neighbors' },
            weaving_hut: { label: 'Weaving Handloom', action: 'Weave Textile' },
            pottery: { label: 'Terracotta Kiln', action: 'Mould Pottery' },
            lumber_camp: { label: 'Lumber Camp', action: 'Gather Timber' },
            quarry: { label: 'Stone Quarry', action: 'Carve Masonry' },
            haat: { label: 'Haat Marketplace', action: 'Enter Haat Trade' },
            pavilion: { label: 'Music Pavilion', action: 'Play Folk Rhythm' },
            shrine: { label: 'Heritage Shrine', action: 'Offer Diya Light' }
          };

          const info = actions[def.landmark] || { label: 'Structure', action: 'Interact' };
          closest = {
            id: `landmark_${tile.key}`,
            type: def.landmark,
            label: info.label,
            actionText: info.action,
            position: tilePos,
            tileKey: tile.key
          };
        }
      }
    }

    this.activeTarget = closest;
    return closest;
  }

  public getActiveTarget(): InteractableTarget | null {
    return this.activeTarget;
  }
}

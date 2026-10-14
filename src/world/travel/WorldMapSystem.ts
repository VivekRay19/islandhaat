import { IndianState } from '../culture/CultureTypes';
import { CULTURE_PROFILES } from '../culture/CultureRegistry';

export type WorldDestinationId = IndianState | 'central_haat';

export interface WorldMapDestination {
  id: WorldDestinationId;
  name: string;
  region: string;
  emoji: string;
  cropDisplayName: string;
  isCentralHaat: boolean;
  ownerId?: string;
  ownerName?: string;
  isHomeIsland: boolean;
  isCurrentLocation: boolean;
  isAccessible: boolean;
  mapCoords: { x: number; y: number }; // normalized 0..100 percentage coordinates
}

export class WorldMapSystem {
  /**
   * Returns authoritative destinations list for the World Map.
   */
  public static getDestinations(
    currentLocation: WorldDestinationId,
    playerHomeIsland: IndianState,
    islandOwners: Map<IndianState, { playerId: string; playerName: string }>
  ): WorldMapDestination[] {
    const states: IndianState[] = ['bihar', 'maharashtra', 'west_bengal', 'karnataka', 'gujarat', 'rajasthan'];

    // Map positions arranged harmoniously around the central haat
    const layoutCoords: Record<WorldDestinationId, { x: number; y: number }> = {
      central_haat: { x: 50, y: 50 },
      rajasthan: { x: 24, y: 28 },
      bihar: { x: 74, y: 26 },
      west_bengal: { x: 80, y: 55 },
      gujarat: { x: 20, y: 56 },
      maharashtra: { x: 34, y: 76 },
      karnataka: { x: 64, y: 78 }
    };

    const destinations: WorldMapDestination[] = [];

    // 1. Central Haat (Shared Marketplace)
    destinations.push({
      id: 'central_haat',
      name: 'The Central Haat',
      region: 'Crossroads of Indian Haats',
      emoji: '🏪',
      cropDisplayName: 'Grand Marketplace',
      isCentralHaat: true,
      isHomeIsland: false,
      isCurrentLocation: currentLocation === 'central_haat',
      isAccessible: true, // Central Haat is always open to all players
      mapCoords: layoutCoords.central_haat
    });

    // 2. The Six Cultural Islands
    for (const state of states) {
      const profile = CULTURE_PROFILES[state];
      const isHome = state === playerHomeIsland;
      const owner = islandOwners.get(state);
      const isOwned = isHome || !!owner;
      const isCurrent = currentLocation === state;

      destinations.push({
        id: state,
        name: profile.stateName,
        region: profile.regionTitle,
        emoji: this.getStateEmoji(state),
        cropDisplayName: this.getStateCropName(state),
        isCentralHaat: false,
        ownerId: isHome ? 'me' : owner?.playerId,
        ownerName: isHome ? 'You' : owner?.playerName,
        isHomeIsland: isHome,
        isCurrentLocation: isCurrent,
        // Rules: Player can visit home island, Central Haat, or another player's owned island!
        // Unselected/unowned islands remain inaccessible in v1.
        isAccessible: isHome || isOwned,
        mapCoords: layoutCoords[state]
      });
    }

    return destinations;
  }

  private static getStateEmoji(state: IndianState): string {
    switch (state) {
      case 'bihar': return '🦚';
      case 'maharashtra': return '🚩';
      case 'west_bengal': return '🪔';
      case 'karnataka': return '🐘';
      case 'gujarat': return '🧵';
      case 'rajasthan': return '🏰';
    }
  }

  private static getStateCropName(state: IndianState): string {
    switch (state) {
      case 'bihar': return 'Mithila Makhana';
      case 'maharashtra': return 'Sahyadri Wheat';
      case 'west_bengal': return 'Bengal Jute';
      case 'karnataka': return 'Sona Masoori Rice';
      case 'gujarat': return 'Gujarat Cotton';
      case 'rajasthan': return 'Marwar Bajra';
    }
  }
}

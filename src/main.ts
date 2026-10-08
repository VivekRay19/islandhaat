import { IslandGame } from './world/IslandGame';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (container) {
    // Mount complete 3D Island Engine
    new IslandGame(container);
  }
});

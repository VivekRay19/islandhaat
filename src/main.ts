import { GameManager } from './world/GameManager';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (container) {
    // Mount the living 3D Intro & Island Game Manager
    new GameManager(container);
  }
});

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TypeScript, Three.js, Vite, HTML5 Canvas / CSS3 HUD

## Users

Players who appreciate cultural heritage, miniature world-building, cozy strategy, and Indian folk arts. They interact via keyboard (WASD / Arrows), mouse click & drag, and interactive hotkeys (R to rotate, E to interact, Escape to toggle modes, F2 for diagnostics).

## Product Purpose

Island Haat is a digital cultural tile-placement and 3D miniature island-building game themed around *Cultural Connect*. It enables players to build living island haats and settlements exploring six distinct regional Indian identities: Bihar, Maharashtra, West Bengal, Karnataka, Gujarat, and Rajasthan.

## Positioning

Unlike generic hex-builders with simple palette recolors, Island Haat grounds every biome in authentic architecture, craft traditions (Madhubani, Warli, Baluchari, Patola, Channapatna, Blue Pottery), specialist abilities, and inter-state haat trade dynamics.

## Operating Context

- **Intro Screen**: Approved high-resolution key art (`/assets/intro_background.jpg`) with separate layered interactive SVG/CSS 3D title, ambient canvas particles (fireflies, birds, smoke, water shimmer), settings, audio, and New Game / Continue options.
- **Culture Selection**: Diorama preview gallery with interactive 3D miniature scenes, specialist lore, abilities, and regional palette breakdowns.
- **Build Mode**: Strategic isometric hex-tile placement with placement validation, rotation, combos, and floating rewards.
- **Explore Mode**: Seamless third-person exploration controlling the cultural specialist character and companion dog, walking across placed tiles, harvesting farms, putting out fires, opening treasure chests, and trading at Haat bazaars.
- **Diagnostics & Galleries**: Real-time asset verification (F2) and 6-state / 4-time comparison viewers.

## Capabilities and Constraints

- **Functional Preservation**: Maintain all existing controls (WASD/arrows movement, mouse drag/pan, R rotate, E interact, Space jump, Esc mode toggle), save/load persistence in `localStorage`, day/night cycle, economy, and quests.
- **Visual Direction**: Polished, stylized-realistic 3D miniature dioramas with authentic architectural silhouettes, warm materials, natural lighting, soft shadows, animated water, and day/night transitions.
- **Artwork Integrity**: Preserve the approved high-resolution intro screen artwork intact without modification, recreation, or compression.
- **Performance Priority**: Smooth 60 FPS animation, frame-time consistency, memory cleanup on scene destruction, and responsive rendering on varied screen sizes (1920x1080 to 1366x768).

## Brand Commitments

- **Warm, Handcrafted Aesthetics**: Ochre plasters, terracotta rooflines, sunlit laterite stone, carved timber columns, woven textiles, and folk art motifs.
- **Cultural Authenticity**: Accurate representation of Mithila, Sahyadri Wada & fort gateways, Bishnupur terracotta, Vijayanagara granite & Channapatna toys, Rani ki Vav stepwells & Patola silks, and Jaipur Havelis & Blue Pottery.

## Evidence on Hand

- Core game systems in `src/world/` (`IslandGame.ts`, `TileMeshBuilder.ts`, `CulturalArchitectureBuilder.ts`, `WaterSystem.ts`, `DayNightSystem.ts`, `CharacterController.ts`, `WorldUI.ts`).
- Intro screen key art asset in `public/assets/intro_background.jpg`.
- Audio soundscape in `src/world/audio/`.

## Product Principles

1. **Respect the Craft**: Visual and architectural designs must reflect authentic regional Indian craft techniques rather than generic placeholders.
2. **Smooth, Tactile Interaction**: Tile placements, transitions, and character locomotion should feel responsive, fluid, and stutter-free.
3. **Preserve What Works**: Functional gameplay, controls, and approved assets remain solid foundations; improvements refine rather than replace.
4. **Lightweight & Self-Contained**: Client-side execution without heavy runtime dependencies or backend latency.

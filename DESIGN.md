---
name: "Island Haat"
description: "A cultural tile-placement and 3D miniature island-building game celebrating six regional Indian craft traditions"
colors:
  primary: "#f59e0b"
  primary-hover: "#d97706"
  accent-gold: "#facc15"
  accent-cyan: "#38bdf8"
  accent-emerald: "#4ade80"
  neutral-bg: "#0b1522"
  neutral-surface: "#0f172a"
  neutral-surface-light: "#1e293b"
  text-primary: "#ffffff"
  text-secondary: "#cbd5e1"
  text-muted: "#94a3b8"
  border-subtle: "rgba(255, 255, 255, 0.12)"
  border-accent: "rgba(250, 204, 21, 0.3)"
typography:
  display:
    fontFamily: "Cinzel, Georgia, serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "1.5px"
  headline:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "1px"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.5px"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
---

# Design System: Island Haat

## Overview

Island Haat combines a tactile, handcrafted miniature aesthetic with rich 3D stylized realism and clean, dark-glass HUD ergonomics. The visual design draws from traditional Indian architectural vernaculars (Mithila earthen homes, Sahyadri wadas and hill forts, Bishnupur terracotta temples, Vijayanagara granite mandapas, Gujarat pol houses and stepwells, and Rajasthani sandstone havelis) framed by glowing marigold, gold, and turquoise UI accents.

## Colors

- **Primary Amber (`#f59e0b`) & Gold (`#facc15`)**: Used for key interactive buttons, active quest highlights, and title accents.
- **Deep Slate Canvas (`#0b1522` / `#0f172a`)**: Backdrops the 3D scene and HUD containers to provide maximum contrast for miniature structures.
- **Surface Overlays (`#1e293b` with 80-90% opacity)**: Frosted glass panels for modals, cards, and resource ribbons.
- **Status Accents**:
  - Emerald Green (`#4ade80`): Quest completions, active buffs, and confirmations.
  - Cyan Sky (`#38bdf8`): Hotkey hints, info pills, and diagnostics.
  - Crimson / Saffron (`#ef4444` / `#ea580c`): Fire alerts and danger states.

## Typography

- **Display**: `Cinzel`, serif. Evokes Indian heritage and classic architectural inscriptions. Used for titles and key chapter headers.
- **UI & Body**: `Plus Jakarta Sans`, sans-serif. Modern, clean geometric sans-serif that ensures effortless legibility across tiny counters, tooltip pills, and resource trackers.

## Layout

- **Fullscreen Immersion**: 100vw x 100vh canvas viewport.
- **HUD Anchor Points**:
  - **Top Bar**: Edge-to-edge floating bar housing Island Title, Day Counter, Cultural State Pill, Resource Counts, and Sun Clock.
  - **Bottom Center (Build Mode)**: Deck hand ribbon with tile cards, stack refill counter, and mode switcher button.
  - **Left Center (Explore Mode)**: Dynamic WASD direction compass and current quest objective.
  - **Center Overlay (Explore Mode)**: Contextual interaction button pill (`[E] Harvest / Trade`).

## Elevation & Depth

- **HUD Elevation**: Low-profile frosted glass with `backdrop-filter: blur(12px)` and subtle white inner borders (`rgba(255, 255, 255, 0.12)`).
- **3D World Depth**: Soft PCF shadow mapping with cascade directional sunlight and hemisphere bounce, complemented by depth fog.

## Shapes

- **Hexagonal Form**: The foundational geometry of the game world (circumradius $R = 1.0$), reflected in tile meshes, selection cursors, and slot highlights.
- **Rounded Corners**: 8px to 16px radius on UI cards and modals for friendly, approachable tactile feel. Pill-shaped buttons (`rounded.full`) for interactive actions.

## Components

- **Intro Title (`IslandHaatTitle`)**: Dimensional multi-layered SVG text with warm gradients, floral vine filigree, and subtle breathing animation.
- **Cultural Tile Card**: Rectangular card displaying tile thumbnail, name, terrain edges, and placement cost.
- **Resource Pill**: Compact chip featuring resource emoji and animated counter.
- **Modal Dialog**: Centered modal with glassmorphic backdrop, crisp header, scrollable body, and high-contrast dismissal button.

## Do's and Don'ts

### Do
- Keep HUD elements translucent so the 3D diorama remains the primary visual focal point.
- Ensure all 3D materials use physically grounded roughness and metalness values.
- Respect the approved high-resolution intro screen artwork.
- Use delta-time throughout all camera, character, and procedural animations.

### Don't
- Don't replace rich architectural models with generic solid-colored primitive shapes.
- Don't block the main thread with heavy synchronous geometry rebuilds during runtime.
- Don't alter the functional keybindings (WASD, R, E, Space, Escape, F2).
- Don't leave listeners active across scene transitions.

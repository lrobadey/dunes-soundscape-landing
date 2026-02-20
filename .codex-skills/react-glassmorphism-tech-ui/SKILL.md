---
name: react-glassmorphism-tech-ui
description: Build glassmorphism and futuristic tech/HUD UI in React with tokenized surfaces, progressive enhancement for backdrop blur, accessible semantics/focus/contrast, and performance-minded motion. Use for tasks mentioning glassmorphism, frosted glass, backdrop-filter, acrylic/blur surfaces, neon/cyberpunk/HUD overlays, grid/scanline effects, or “futuristic”/“sci-fi tech” React styling.
---

# React Glassmorphism Tech UI

## Overview

Design and implement a glassmorphism + futuristic tech UI system in React by treating “glass” as a reusable surface primitive, driven by design tokens, with accessibility and performance constraints baked in.

## Workflow

### 1. Confirm constraints (do first)

Ask for (or infer) these before making styling decisions:
- Target framework and styling approach (CSS Modules, plain CSS, Tailwind, CSS-in-JS).
- Whether the UI sits on top of complex imagery/video (drives blur/tint strength).
- Minimum accessibility bar (contrast, visible focus ring, reduced motion).
- Browser/device constraints (older iOS/Android, low-end GPUs).
- Motion budget (subtle transitions vs HUD scanlines/glitch; must honor reduced motion).

### 2. Establish tokens (the control plane)

Prefer CSS custom properties so tokens can change at runtime (theme, density, “glass vs solid”):
- `--glass-bg`, `--glass-bg-strong` (fallback when blur unsupported)
- `--glass-border`, `--glass-shadow`, `--glass-blur`
- `--text`, `--text-muted`, `--focus-ring`, `--radius`

Keep tokens neutral by default; plug in brand colors as accents (glow, lines, highlights).

### 3. Build surface primitives (compose upward)

Implement a small set of primitives and reuse them everywhere:
- `GlassSurface`: tinted + bordered surface that upgrades to blur via `@supports`.
- `Surface`/`Panel`: solid alternative for readability-heavy screens.
- `Glow`/`Highlight`: decorative accent layers; keep them optional.
- `GridOverlay`/`NoiseOverlay`: purely decorative; must be disable-able for reduced motion.

Progressive enhancement rule:
- Always render a readable fallback without `backdrop-filter`.
- Use `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))` to upgrade.

### 4. Make motion safe and cheap

Default to compositor-friendly animation:
- Prefer `opacity` and `transform`; avoid animating layout/paint-heavy properties.
- Honor `prefers-reduced-motion: reduce` by removing scanlines/parallax/large transforms.

If pointer-driven lighting is requested:
- Update CSS variables on `requestAnimationFrame()` and avoid React rerenders for pointer move.

### 5. Enforce accessibility by construction

For every interactive component:
- Correct semantics (`button` for clickable cards, labels/aria for inputs).
- Visible focus (`:focus-visible` ring with sufficient contrast against glass).
- Contrast: ensure text and key UI boundaries remain distinguishable over dynamic backgrounds.
- Motion control: no essential information conveyed only through animation.

### 6. Performance guardrails for blur/glow

Treat blur as a budget item:
- Keep blurred surfaces small (menus, cards, panels), not full-screen.
- Prefer a stronger tint if you need readability but can’t afford heavy blur.
- Avoid stacking multiple blurred layers; test on low-end hardware.

## Resources

### references/

Read these when you need detail beyond the workflow:
- `references/glassmorphism-tech-ui-react.md`: Full guide content (design + implementation notes).
- `references/a11y-performance-checklist.md`: Ship checklist for contrast, focus, motion, and blur budget.

### assets/

Reusable code templates (edit to match the project’s stack):
- `assets/templates/css-modules/`: Glass card, scene, and HUD overlay examples.

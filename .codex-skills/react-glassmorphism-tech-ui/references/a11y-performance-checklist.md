# A11y + Performance Checklist (Glass / HUD UI)

Use this as a ship checklist for glassmorphism and tech/HUD aesthetics.

## Accessibility

- Text contrast stays readable over the *real* background (imagery/video/gradients), not just a flat test color.
- Non-text boundaries are visible (button edges, icons, toggles, focus outlines).
- Every interactive control has correct semantics (e.g., clickable cards are `button`s) and a visible `:focus-visible` style.
- Reduced motion is honored (`prefers-reduced-motion: reduce` disables scanlines/parallax/repeated pulses).
- Motion is not required to understand state; the UI still communicates status without animation.
- No flashing/glitch effects that could be unsafe; avoid rapid luminance changes.
- Decorative overlays are `aria-hidden` and do not block pointer/focus.

## Backdrop blur

- UI remains usable when `backdrop-filter` is unsupported (fallback tint is sufficient).
- Blur is applied only to bounded surfaces (cards/panels/menus), not large full-screen layers.
- Overlapping blurred layers are minimized (avoid stacking blur-on-blur).
- Stacking context changes are intentional (z-index layering verified).

## Performance

- Animations prioritize `transform`/`opacity`; avoid layout/paint-heavy animations by default.
- Pointer tracking uses `requestAnimationFrame()` and CSS variables; avoid rerender-on-move.
- GPU budget is checked on low-end hardware (mobile, integrated graphics) for blur + glows.
- `will-change` is only used to fix a measured issue and removed if unnecessary.


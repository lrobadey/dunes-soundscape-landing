# Glassmorphism + Futuristic Tech UI in React (Reference)

This reference supports the `$react-glassmorphism-tech-ui` skill. Use it as a design and implementation guide when building frosted-glass surfaces, HUD-like overlays, neon accents, and tech-y motion patterns in React.

## Core framing

Treat glassmorphism as a *material system* (a reusable "surface" primitive), not an app-wide default theme.

Common constraints:
- Readability over complex backgrounds is fragile (tint, blur, and typography must compensate).
- `backdrop-filter` is not free (extra compositing work, stacking-context surprises).
- Overuse of translucent layers makes affordances ambiguous.
- Motion motifs (scanlines, parallax, glitch) can violate reduced-motion expectations.

## A reliable "glass surface" formula

A robust glass surface usually needs:
1. Tinted, semi-transparent fill (so content stays readable even without blur).
2. Blur (progressive enhancement, sized to background complexity).
3. Edge definition (border/stroke, subtle highlights).
4. Constrained footprint (avoid full-screen blur; keep panels/cards bounded).

### Progressive enhancement pattern

Implement a readable fallback first:
- Base: `background: var(--glass-bg-strong); border: 1px solid var(--glass-border);`
- Upgrade: `backdrop-filter: blur(var(--glass-blur)) saturate(...);`

Feature query:
- `@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) { ... }`

## React architecture (least-regret)

Preferred layering:
1. Tokens (CSS variables): the control plane for blur, tint, borders, radii, text, and accents.
2. Surface primitives: `GlassSurface`, `Surface`, `Glow`, `GridOverlay`, `NoiseOverlay`.
3. Components: `Card`, `Button`, `Popover`, `Panel`.
4. Scenes: pages and layouts that compose components.
5. State/effects: animations, pointer tracking, timers.

Purity boundary:
- Keep React render pure. Run animation setup, pointer listeners, and direct DOM writes in effects.

Pointer-driven lighting (performance-safe pattern):
- Write pointer coordinates into CSS variables on `requestAnimationFrame()` to avoid rerenders.
- Use those variables inside gradients (e.g., radial glows) so the browser handles compositing.

## Motion patterns that stay usable

Defaults:
- Prefer `opacity` and `transform`.
- Avoid animating layout/paint-heavy properties when possible.

Reduced motion:
- Ensure `prefers-reduced-motion: reduce` disables scanlines, large parallax, and repeated pulses.
- Keep state feedback (hover/focus/active) visible even when motion is reduced.

Tool choices:
- CSS transitions: small state changes (hover/focus).
- CSS keyframes: looping ambient effects (scanline, subtle shimmer).
- Web Animations API: cancellable micro-animations and timelines without a heavy library.
- Framer Motion: orchestration and reduced-motion aware variants (optional).

## Accessibility failure modes to avoid

Glass and neon often fail due to:
- Low text contrast over dynamic content.
- Weak or invisible focus indicators.
- Unclear interactive affordances (especially on translucent cards).
- Motion overload (ambient effects that distract or cannot be paused).
- Flashing/glitch patterns that can be unsafe.

Practical mitigations:
- Use `button` semantics for clickable cards; keep hover/focus states explicit.
- Use `:focus-visible` and pick a focus ring token that contrasts against both light and dark tints.
- Prefer solid surfaces for forms and dense text when needed.

## Performance notes specific to blur/glow

Backdrop blur considerations:
- Blur cost increases with area and with the number of overlapping blurred layers.
- New stacking contexts can change z-index expectations; isolate overlay stacks intentionally.

Guardrails:
- Keep blur on bounded components (menus, cards, panels).
- Keep decorative overlays cheap (static gradients are cheaper than heavy filters).
- Only use `will-change` to fix a measured problem; do not blanket-apply it.

## Tooling and delivery notes

Cross-browser CSS:
- Use Autoprefixer and a clear Browserslist target when shipping blur/filters.

Accessible primitives:
- Consider Radix Primitives / React Aria for behavior + a11y without locking you into a visual style.
- Use Floating UI for positioning and dismissal/focus management for overlays.

Testing:
- Component tests: React Testing Library style tests (user interactions).
- Cross-browser: Playwright (Chromium/WebKit/Firefox) to validate blur, stacking, and focus.
- A11y regression: axe-based checks as guardrails (not certification).

## Templates included with this skill

See:
- `assets/templates/css-modules/GlassCard.tsx`
- `assets/templates/css-modules/GlassCard.module.css`
- `assets/templates/css-modules/GlassScene.tsx`
- `assets/templates/css-modules/GlassScene.module.css`
- `assets/templates/css-modules/TechHud.tsx`
- `assets/templates/css-modules/TechHud.module.css`


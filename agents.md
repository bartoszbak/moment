# Agents

## Animations and transitions

### Goal

Bring back page transitions without making already-visible content blink on first paint or during hydration.

### What we implemented

- Route changes use a separate overlay wipe instead of animating the live page tree.
- Page sections reveal after navigation with a short `opacity + y` entrance.
- First render does not animate.
- Static content cards and forms do not animate on mount.
- Capture flow keeps only the local camera/preview swap animation.

### Why the earlier approach failed

Animating the page container itself with fade or slide transitions made visible content re-animate after hydration. That reads as blinking, especially on the homepage and onboarding card layouts.

### Current pattern

#### 1. App-level transition shell

Implemented in [components/layout/app-shell.tsx](/Users/bartbak/Repo/moment/components/layout/app-shell.tsx).

- Track `pathname` with `usePathname()`.
- Compare it against the previous pathname.
- Only mark `routeChanged` as `true` when the pathname actually changes after the initial render.
- Respect `prefers-reduced-motion` through `useReducedMotion()`.
- On route change, render a full-screen overlay and animate that overlay from left to right.

This keeps the page content visually stable while still giving navigation a transition.

#### 2. Page-level reveal component

Implemented in [components/layout/page-reveal.tsx](/Users/bartbak/Repo/moment/components/layout/page-reveal.tsx).

- Read `routeChanged` and `shouldAnimate` from the app shell context.
- If there was no actual route change, set `initial={false}`.
- If there was a route change, animate sections with a small `y` offset and `opacity`.
- Use short delays to stagger large page sections, not every small element.

This gives pages motion only after navigation, not on first load.

#### 3. Screen usage

Applied to:

- [app/page.tsx](/Users/bartbak/Repo/moment/app/page.tsx)
- [app/(app)/onboarding/page.tsx](/Users/bartbak/Repo/moment/app/(app)/onboarding/page.tsx)
- [app/animations-dev/page.tsx](/Users/bartbak/Repo/moment/app/animations-dev/page.tsx)

The `/animations-dev` route is the sandbox for tuning transition timing and reveal distance before changing production screens.

### Motion rules

- Do not animate the entire rendered page with `opacity` on mount.
- Do not use `blur()` for route transitions.
- Do not put mount animations on always-visible cards, forms, or layout containers.
- Use only `transform` and `opacity` for UI transitions.
- Use `ease-out` for entering/revealed content.
- Keep durations around `200ms` to `320ms`.
- Animate page sections, not every child node.

### Reuse recipe

For a new screen:

1. Keep the page under [components/layout/app-shell.tsx](/Users/bartbak/Repo/moment/components/layout/app-shell.tsx).
2. Wrap one or two major sections with [components/layout/page-reveal.tsx](/Users/bartbak/Repo/moment/components/layout/page-reveal.tsx).
3. Use small stagger delays like `0.08`, `0.16`, `0.24`.
4. Avoid adding independent mount animations to nested cards inside those sections.
5. If tuning is needed, prototype it first in [app/animations-dev/page.tsx](/Users/bartbak/Repo/moment/app/animations-dev/page.tsx).

### Files involved

- [components/layout/app-shell.tsx](/Users/bartbak/Repo/moment/components/layout/app-shell.tsx)
- [components/layout/page-reveal.tsx](/Users/bartbak/Repo/moment/components/layout/page-reveal.tsx)
- [app/page.tsx](/Users/bartbak/Repo/moment/app/page.tsx)
- [app/(app)/onboarding/page.tsx](/Users/bartbak/Repo/moment/app/(app)/onboarding/page.tsx)
- [app/animations-dev/page.tsx](/Users/bartbak/Repo/moment/app/animations-dev/page.tsx)

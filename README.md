# Near Health — Landing Page

Landing page for [Near Health](https://near.health), built with **React + Vite**.

Live: [nearhealth.github.io/landing](https://nearhealth.github.io/landing/)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ (CI uses 20)
- npm

### Stack

| Layer | What |
|-------|------|
| Framework | React 19 + Vite 8 |
| Animation | GSAP 3 (`ScrollTrigger`, `SplitText`) + Lenis smooth scroll |
| Lottie | `@lottiefiles/dotlottie-react` (`.lottie` format) |
| Testing | Playwright (functional + visual regression) |
| Lint | ESLint 9 (`react-hooks`, `react-refresh`) |
| Hosting | GitHub Pages (auto-deploy on push to `main`); generic hosts via `build-production.sh`; Vercel via `vercel.json` rewrites |

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build & Deploy

```bash
# Full build for GitHub Pages (base: /landing/)
npm run build              # vite build + SSG prerender via scripts/prerender.mjs

# SPA-only build (skips prerender — faster iteration)
npm run build:spa

# Generic hosting (DreamHost, Netlify, etc. — base: /)
./build-production.sh      # outputs to ./production/
```

**Auto-deploy.** Pushes to `main` trigger `.github/workflows/deploy.yml`, which runs `npm ci → playwright install chromium → npm run build` and publishes `dist/` to GitHub Pages via `actions/deploy-pages@v4`.

**Prerender.** After `vite build`, `scripts/prerender.mjs` boots Vite preview, opens the built site with Playwright, snapshots the rendered `#root` HTML, and inlines it into `dist/index.html`. Skipped automatically when `VERCEL=1` (build container lacks Chromium system libs).

**Vercel.** `vercel.json` rewrites `/landing/:path*` to `/:path*` so the same bundle works under either path.

---

## Architecture

### Project Structure

```
src/
├── App.jsx                          # Root — composes sections; mounts useLenis()
├── main.jsx                         # React entry point
│
├── components/
│   ├── ui/                          # Reusable UI primitives (folder per component)
│   │   ├── Button/                  #   variant: primary|secondary|outline|ghost, size: sm|md
│   │   ├── SectionTitle/            #   Heading + optional subtitle
│   │   ├── NearBrand/               #   Logo icon + n/e/a/r wordmark (inline SVGs)
│   │   ├── ResponsiveVideo/         #   Desktop/mobile video source switching
│   │   ├── ScrollPlayVideo/         #   Plays video while in viewport, pauses out
│   │   └── GridOverlay/             #   Dev-only 12-col layout grid (DEV builds only)
│   │
│   ├── Navbar/                      # Glass navbar + mix-blend-mode auto-invert
│   ├── Hero/                        # Hero + Built-for carousel + hero video
│   │   └── BuiltForCarousel.jsx     #   Sub-component used by Hero
│   ├── CareJourney/                 # For Brokers / For Providers cards
│   ├── MemberExperience/            # Chat demo video section
│   ├── HowItWorks/                  # 3-step flow with arrows
│   ├── PostEnrollment/              # Dark card with feature grid
│   ├── OnePlatform/                 # Phone image + coverage ticker
│   ├── RealWorld/                   # 4 feature cards
│   ├── ShapedSection/               # Photo with text overlay
│   ├── CareConnected/               # Lottie animation card
│   ├── FooterCta/                   # CTA buttons
│   └── Footer/                      # Links + socials
│       └── FooterLogo.jsx           #   Large NearBrand used in footer
│
├── hooks/
│   ├── useIsMobile.js               # Shared breakpoint hook (768px)
│   ├── useLenis.js                  # Mounts Lenis smooth scroll + GSAP ticker
│   └── useScrollReveal.js           # Section-scoped GSAP reveal lifecycle
│
├── utils/
│   ├── assetPath.js                 # asset() — resolves paths with Vite base URL
│   ├── reveal.js                    # splitLines / lineRevealVars / blockRevealVars / selfTrigger
│   ├── eases.js                     # Custom GSAP eases (registered on import)
│   └── layout.js                    # Shared layout/measurement helpers
│
└── styles/
    └── global.css                   # Design tokens, base resets, fluid scales

public/
├── fonts.css                        # @font-face for Gilroy (self-hosted)
└── assets/
    ├── fonts/                       # Gilroy-{Regular,Medium,Semibold,Bold}.woff2 + .woff
    ├── icons/                       # near-logo.svg, n.svg, e.svg, a.svg, r.svg
    ├── images/                      # Photos, platform screenshots
    ├── *.mp4                        # Hero + AI Chat videos (desktop + mobile variants)
    └── CTA_Gradient_*.lottie        # Lottie gradient backgrounds

scripts/
├── prerender.mjs                    # Playwright-based SSG prerender (runs after vite build)
├── navbar-snap.mjs                  # Screenshot tool for navbar regression checks
└── optimize-videos.sh               # ffmpeg helper for video assets

tests/
├── hero-scroll.spec.ts              # Hero scroll behavior
├── hero-screenshots.spec.ts         # Hero visual checks
├── breakpoint-audit.spec.ts         # Layout audit across breakpoints
├── lottie-morph.spec.ts             # CareConnected Lottie behavior
├── built-for-carousel*.spec.js      # Built-for marquee tests
├── inspect-bg.spec.ts               # Background diagnostic
└── visual/                          # Per-section visual regression + snapshots

.github/workflows/deploy.yml         # GitHub Pages auto-deploy on push to main
vercel.json                          # /landing/* path rewrites for Vercel
build-production.sh                  # Manual build for generic hosts (./production/)
```

### Design Principles

**1. One component per section**
Each visible section of the page is its own folder containing `<Name>.jsx` + `<Name>.css`. `App.jsx` simply stacks them in order. Easy to reorder, remove, or add sections.

**2. Shared UI primitives (`ui/`)**
Reusable building blocks used across multiple sections:
- `Button` — all CTA buttons use this with `variant` and `size` props
- `SectionTitle` — consistent heading typography everywhere
- `NearBrand` — inline-SVG logo + wordmark; retintable via `color` (uses `currentColor`)
- `ResponsiveVideo` — swaps desktop/mobile video sources automatically
- `ScrollPlayVideo` — auto-plays video while in viewport
- `GridOverlay` — dev-only 12-column overlay (rendered only when `import.meta.env.DEV`)

**3. Responsive by default**
- **Fluid typography** via CSS `clamp()` — no font-size breakpoint overrides
- **Fluid spacing** via CSS custom properties (`--space-section`, `--space-lg`, `--space-md`, `--space-sm`)
- **Fluid padding** — `--px: clamp(20px, 5vw, 80px)`
- **Auto-fit grids** — cards reflow naturally (`repeat(auto-fit, minmax(...))`)
- **CSS breakpoints only for layout shifts** (1024px: stack columns, 768px: mobile nav)

**4. Mobile/desktop asset switching**
The `useIsMobile()` hook provides a single source of truth for the 768px breakpoint. Components use it to swap video sources (`ResponsiveVideo`), images (`OnePlatform`), and Lottie files (`CareConnected`).

**5. Asset path resolution**
All assets in `public/` are referenced via the `asset()` helper, which prepends `import.meta.env.BASE_URL`. Paths work both on GitHub Pages (`/landing/`) and generic hosts (`/`).

### CSS Architecture

Styles are split:

- **`src/styles/global.css`** — design tokens, base resets, fluid scales, font-family bindings.
- **`public/fonts.css`** — `@font-face` declarations for self-hosted Gilroy (linked from `index.html`).
- **`src/components/<Name>/<Name>.css`** — each component owns its own stylesheet, co-located with its JSX.

There is no monolithic `App.css`.

Design tokens (defined in `global.css`):

| Token | Value | Usage |
|-------|-------|-------|
| `--fs-hero` | `clamp(48px, 6.5vw, 96px)` | Hero heading |
| `--fs-h2` | `clamp(32px, 4vw, 58px)` | Section titles |
| `--fs-body` | `clamp(14px, 1.2vw, 18px)` | Body text |
| `--fs-btn` | `clamp(10px, 0.85vw, 12px)` | Button labels |
| `--space-section` | `clamp(60px, 8vw, 120px)` | Between sections |
| `--space-lg` | `clamp(24px, 3vw, 48px)` | Large gaps |
| `--space-md` | `clamp(16px, 2vw, 32px)` | Medium gaps |
| `--space-sm` | `clamp(8px, 1vw, 16px)` | Small gaps |
| `--px` | `clamp(20px, 5vw, 80px)` | Page padding |

### Typography

Font: **Gilroy**, self-hosted under `public/assets/fonts/` (`.woff2` + `.woff` fallback). Declared via `@font-face` in `public/fonts.css` and linked from `index.html`. No third-party CDN.

- Headings: Gilroy-Regular (400)
- Body: Gilroy-Medium (500)
- Buttons / labels: Gilroy-SemiBold (600)
- Emphasis: Gilroy-Bold (700)
- Fallback: Inter (Google Fonts), then system fonts

### Scroll & Animation

The site uses **GSAP** for entrance reveals and **Lenis** for smooth-scrolling. Both are wired in `src/App.jsx` and short-circuit when `prefers-reduced-motion: reduce` is set, leaving content in its natural visible state.

**`useLenis()` — `src/hooks/useLenis.js`**
Instantiates a Lenis smooth-scroll controller, registers it with GSAP's RAF ticker, and forwards Lenis's `scroll` event to `ScrollTrigger.update`. Called once at the root.

**`useScrollReveal({ scopeRef, prepare, animate, deps })` — `src/hooks/useScrollReveal.js`**
Section-scoped reveal lifecycle:
1. `prepare` runs synchronously inside `useLayoutEffect` (before paint) — set `autoAlpha: 0` here to avoid FOUC.
2. After `document.fonts.ready` resolves, `animate` runs inside a `gsap.context(scopeRef)` so all tweens, SplitTexts, and ScrollTriggers tear down on unmount.
3. If the section is already in/past the viewport at mount (e.g. browser-restored scroll), the reveal is skipped so the section stays visible.

**Reveal toolkit — `src/utils/reveal.js`**
Tiny helpers used by every section's `animate` callback:
- `splitLines(el)` — builds a `SplitText` instance with `mask: 'lines'`
- `lineRevealVars({ duration, stagger })` — slide-up + fade vars for `gsap.from(split.lines, ...)`
- `blockRevealFromVars()` / `blockRevealVars()` — pre-hide + tween-to vars for non-text blocks (cards, images, videos)
- `selfTrigger(el, overrides)` — one-shot `ScrollTrigger` keyed on the element itself (`start: 'top 85%'`, `once: true`)

Custom GSAP eases live in `src/utils/eases.js` (imported for side-effects at the top of `useScrollReveal.js`).

### Navbar Glass + Auto Color Inversion

The navbar combines a **frosted-glass** backdrop with automatic light/dark text inversion via `mix-blend-mode: difference`.

**Layered architecture.** `App.jsx` renders three sibling elements:
- `<nav class="navbar">` — the flex bar (logo + links + CTA). Carries `mix-blend-mode: difference` on its inner `.nav-container`.
- `<div class="navbar-blur">` — sibling div carrying `backdrop-filter: blur(20px) saturate(150%)`. Kept outside the blend-mode parent so the blur isn't trapped.
- `<div class="navbar-edge">` — sibling div carrying the white hairline. Also escapes the blend mode so the line stays visible.

A `.navbar-cta-fixed` anchor (the "Request a demo" pill) is also a sibling, for the same reason — it has its own colors and must escape the blend.

**Show/hide on scroll.** `Navbar.jsx` runs a small RAF-throttled scroll listener that toggles a `.navbar--hidden` modifier on direction reversal. CSS selectors of the form `.navbar--hidden ~ .navbar-blur` slide every sibling layer together. No separate hook.

**Auto color inversion.**

```css
.nav-container { mix-blend-mode: difference; }
.nav-link, .nav-cta { color: white; }
```

With `difference` blending, white content automatically inverts against whatever's behind the glass: dark over light, light over dark (e.g. PostEnrollment `#0A1C1E`). The logo SVGs use `fill: currentColor` so they participate in the same blend.

**Key files:**
- `src/App.jsx` — renders `.navbar`, `.navbar-blur`, `.navbar-edge`, `.navbar-cta-fixed` as siblings
- `src/components/Navbar/Navbar.{jsx,css}` — show/hide logic + glass + blend mode
- `src/components/ui/NearBrand/NearBrand.css` — logo styling for the blend

### Testing

Playwright drives both functional and visual regression tests.

```bash
npm test                  # all specs in tests/
npm run test:visual       # only tests/visual/ (per-section snapshots)
npm run test:visual:update  # refresh snapshots after intentional UI changes
npm run lint              # eslint .
```

What's covered (`tests/`):
- `hero-scroll.spec.ts` — hero scroll/parallax behavior
- `hero-screenshots.spec.ts` — hero visual at key breakpoints
- `breakpoint-audit.spec.ts` — layout audit across viewport sizes
- `lottie-morph.spec.ts` — CareConnected Lottie animation
- `built-for-carousel*.spec.js` — Hero "Built for" marquee
- `inspect-bg.spec.ts` — background rendering diagnostic
- `visual/section-screenshots.spec.js` — per-section snapshots (committed under `tests/visual/*-snapshots/`)

The same `chromium` binary used by tests is also used by `scripts/prerender.mjs`.

### Adding a Mobile Version

The architecture is ready for mobile-specific layouts:

1. **Layout changes** — add rules inside the existing `@media (max-width: 768px)` block in the relevant component's `.css` file (or in `global.css` for cross-cutting tokens).
2. **Mobile-only content** — use `useIsMobile()` to conditionally render.
3. **Mobile assets** — use `ResponsiveVideo` or check `useIsMobile()` for images / Lottie files.
4. **No new components needed** — the same components adapt via CSS + the mobile hook.

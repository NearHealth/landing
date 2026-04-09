# Near Health — Landing Page

Landing page for [Near Health](https://near.health), built with **React + Vite**.

Live: [nearhealth.github.io/landing](https://nearhealth.github.io/landing/)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Build & Deploy

```bash
# GitHub Pages (base: /landing/)
npm run build

# Generic hosting (DreamHost, Netlify, etc. — base: /)
./build-production.sh    # outputs to ./production/
```

---

## Architecture

### Project Structure

```
src/
├── App.jsx                    # Root — composes all sections in order
├── App.css                    # Global styles (fluid, responsive)
├── main.jsx                   # React entry point
│
├── components/
│   ├── ui/                    # Reusable UI primitives
│   │   ├── Button.jsx         # variant: primary|secondary|outline|ghost, size: sm|md
│   │   ├── SectionTitle.jsx   # Heading + optional subtitle
│   │   ├── NearBrand.jsx      # Logo icon + n/e/a/r wordmark, size: sm|lg
│   │   └── ResponsiveVideo.jsx# Desktop/mobile video source switching
│   │
│   ├── Navbar.jsx             # Fixed nav with scroll behavior
│   ├── Hero.jsx               # Hero + Built-for carousel + video
│   ├── CareJourney.jsx        # For Brokers / For Providers cards
│   ├── MemberExperience.jsx   # Chat demo video section
│   ├── HowItWorks.jsx         # 3-step flow with arrows
│   ├── PostEnrollment.jsx     # Dark card with feature grid
│   ├── OnePlatform.jsx        # Phone image + coverage ticker
│   ├── RealWorld.jsx          # 4 feature cards
│   ├── ShapedSection.jsx      # Photo with text overlay
│   ├── CareConnected.jsx      # Lottie animation card
│   ├── FooterCta.jsx          # CTA buttons
│   ├── FooterLogo.jsx         # Large NearBrand
│   └── Footer.jsx             # Links + socials
│
├── hooks/
│   ├── useIsMobile.js         # Shared breakpoint hook (768px)
│   └── useScrollAnimation.js  # useNavbarScroll() + useFadeIn()
│
└── utils/
    └── assetPath.js           # asset() — resolves paths with Vite base URL

public/
└── assets/
    ├── icons/                 # near-logo.svg, n.svg, e.svg, a.svg, r.svg
    ├── images/                # Photos, platform screenshots
    ├── Hero_Desktop.mp4       # Hero video (desktop)
    ├── Hero_Mobile.mp4        # Hero video (mobile)
    ├── AI Chat_Desktop.mp4    # Member experience video (desktop)
    ├── AI Chat_Mobile.mp4     # Member experience video (mobile)
    ├── CTA_Gradient_Desktop.lottie
    └── CTA_Gradient_Mobile.lottie
```

### Design Principles

**1. One component per section**
Each visible section of the page is its own component. `App.jsx` simply stacks them in order. This makes it easy to reorder, remove, or add sections.

**2. Shared UI primitives (`ui/`)**
Reusable building blocks used across multiple sections:
- `Button` — all CTA buttons use this with `variant` and `size` props
- `SectionTitle` — consistent heading typography everywhere
- `NearBrand` — logo + wordmark, used in Navbar (sm) and Footer (lg)
- `ResponsiveVideo` — swaps desktop/mobile video sources automatically

**3. Responsive by default**
- **Fluid typography** via CSS `clamp()` — no font-size breakpoint overrides
- **Fluid spacing** via CSS custom properties (`--space-section`, `--space-lg`, `--space-md`, `--space-sm`)
- **Fluid padding** — `--px: clamp(20px, 5vw, 80px)`
- **Auto-fit grids** — cards reflow naturally (`repeat(auto-fit, minmax(...))`)
- **CSS breakpoints only for layout shifts** (1024px: stack columns, 768px: mobile nav)

**4. Mobile/desktop asset switching**
The `useIsMobile()` hook provides a single source of truth for the 768px breakpoint. Components use it to:
- Swap video sources (`ResponsiveVideo`)
- Swap images (`OnePlatform`)
- Swap Lottie files (`CareConnected`)

**5. Asset path resolution**
All assets in `public/` are referenced via the `asset()` helper, which prepends `import.meta.env.BASE_URL`. This ensures paths work both on GitHub Pages (`/landing/`) and generic hosts (`/`).

### CSS Architecture

All styles live in `App.css` using:

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

Font: **Gilroy** (loaded from CDNfonts)
- Headings: Gilroy-Regular (400)
- Body: Gilroy-Medium (500)
- Buttons/labels: Gilroy-SemiBold (600)
- Fallback: Inter, system fonts

### Adding a Mobile Version

The architecture is ready for mobile-specific layouts:

1. **Layout changes** — add rules inside the existing `@media (max-width: 768px)` block in `App.css`
2. **Mobile-only content** — use `useIsMobile()` to conditionally render
3. **Mobile assets** — use `ResponsiveVideo` or check `useIsMobile()` for images
4. **No new components needed** — the same components adapt via CSS + the mobile hook

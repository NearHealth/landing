# Technical Specification

## 1. Architecture

React 19 + Vite 8 (Rolldown), plain JavaScript/JSX, ESM. Multi-page app: each page is a
separate Vite entry (`src/{main,terms,privacy,contact}.jsx` → `index.html`,
`terms/index.html`, `privacy/index.html`, `contact/index.html`). Pages are statically
prerendered by `scripts/prerender.mjs` (Playwright renders each route, snapshots `#root`
into the built HTML). Deployed under base path `/landing/`.

```
src/
├── components/<Name>/<Name>.jsx + .css   # feature components, co-located CSS
├── components/ui/                        # shared primitives (Button, SectionH2, …)
├── content/legal/*.md + parseLegal.js    # legal copy + parser
├── constants/sections.js                 # CONTACT_URL, section ids, nav config
├── styles/global.css                     # design tokens
├── utils/assetPath.js                    # asset() base-path resolver
└── App.jsx, main/terms/privacy/contact.jsx
```

## 2. Key Design Decisions

- **Co-located CSS, no CSS framework.** Hand-written CSS per component; global tokens in
  `styles/global.css` (`--font`, `--font-heading`, `--dark`, `--navbar-h`, `--page-px`, …).
- **MPA over SPA routing.** Separate HTML entry per page (no client router); standalone
  pages reuse the shell (`site-bg` + `<Navbar standalone/>` + `<Footer/>`).
- **Always client-render** (`createRoot`, no hydration) — prerendered markup is a snapshot,
  live markup is viewport-dependent.
- **Backend-agnostic forms.** Submission is injected via an `onSubmit` prop at the page
  level; the form component owns fields/validation/state but not the endpoint.

## 3. Dependencies (pinned in package.json)

- `react` / `react-dom` ^19
- `vite` ^8, `@vitejs/plugin-react` ^6
- `react-markdown` ^10 (legal pages)
- `gsap`, `motion`, `lenis`, `@lottiefiles/dotlottie-react` (animation; code-split)
- `@playwright/test` ^1 (tests + prerender)

## 4. Cross-cutting Patterns

- **State management:** local component state (`useState`); no global store.
- **Error handling (forms):** inline per-field validation on blur, error summary +
  focus-first-invalid on submit, preserve input on failure.
- **Asset/URL resolution:** always via `asset()` / `import.meta.env.BASE_URL`.

## 5. Risks / Considerations

- `npm run lint` is broken (no `eslint.config.js`) — not part of the gate until fixed.
- `npm run test` requires `npx playwright install` (browsers not in the repo).
- `vite.config.js` carries a local-only `server` tweak hidden via `skip-worktree`.

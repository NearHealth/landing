# Testing Specification

## 1. Framework & Tooling

- **Test framework:** Playwright (`@playwright/test` ^1)
- **Kinds:** browser-driven e2e / interaction specs + visual-regression snapshots
- **Run:** `npm run test` (all) · `npm run test:visual` (snapshots) ·
  `npm run test:visual:update` (refresh snapshots)
- **Prerequisite:** `npx playwright install` (Chromium not committed to the repo)

## 2. Conventions

- **File naming:** `*.spec.js` / `*.spec.ts`
- **Layout:** `tests/-mirror` — specs live under `tests/`, not co-located with `src/`
- **Visual specs:** under `tests/visual/`

## 3. What to Test

- Critical interactions: navbar single-click jumps, contact-form validation &
  submit lifecycle, dropdown dependency (org → partnership).
- Visual regression on key flows/sections.

## 4. What NOT to Test

- Third-party internals (GSAP, Lottie, Lenis, react-markdown)
- Generated build output (`dist/`)
- Exact prerender HTML bytes (prerender is best-effort and viewport-dependent)

## 5. Test Data Strategy

Inline fixtures per spec; no shared factory layer. Forms are exercised with literal
field values; submission is stubbed via the injected `onSubmit` prop (no live endpoint).

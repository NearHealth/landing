# Requirements

## 1. Overview

NearHealth's marketing landing site: a React + Vite multi-page app (home, Terms,
Privacy, Contact) statically prerendered and served from a static host under the
`/landing/` base path. Audience is prospective partners (brokers, agencies, FMOs,
providers, MSOs) and early-access sign-ups. Goal: communicate the product and capture
qualified interest via the contact form.

## 2. Functional Requirements (cross-cutting only)

Per-FR detail lives in `specs/frs/<id>.md`. Concerns that span features:

- **Accessibility posture:** UI targets WCAG 2.1 AA — every interactive control is
  keyboard-operable with a visible focus indicator, form fields carry programmatic
  labels (`<label>`/`aria-label`), errors are announced (`aria-live` / `aria-invalid`),
  and color is never the sole signal.
- **Responsive contract:** every page is usable from 360px mobile up; touch targets
  ≥ 44px; input font ≥ 16px (no iOS zoom-on-focus).
- **Static-host constraint:** no server runtime in the repo. Anything needing a backend
  (form submission, etc.) is injected at the call site (props / config), not hard-wired.
- **Base-path discipline:** all asset/URL references resolve through `asset()` /
  `import.meta.env.BASE_URL`; never hard-code `/landing/`.
- **Browser support:** modern evergreen + Safari. No WebM video, no `text-wrap: balance`.

## 3. Non-Functional Requirements

### NFR-1: Performance
Fast first paint; heavy third-party libs (GSAP, Lottie, Lenis) code-split so the React
shell hydrates without waiting on them (see `vite.config.js` manualChunks).

### NFR-2: Security
No secrets in client code. Submission endpoints are never hard-coded recipient addresses;
user input is treated as untrusted by whatever backend is later wired in.

### NFR-3: Availability
Static hosting; prerender soft-fails (the SPA still hydrates if the prerender step is
skipped). A flaky Playwright prerender must never block a deploy.

## 4. Edge Cases

<!-- Added during spec review / implementation. -->

## Security / Abuse Cases

| Attacker Goal | Attack Vector | Mitigation |
|--------------|---------------|------------|
| Spam the contact form | Bot auto-fill of public form | Frontend honeypot + time-to-fill (open item); server-side filtering is backend scope |

## 5. Out of Scope

- Backend / API runtime (form submission endpoint, server-side validation, rate limiting)
- Auth / user accounts
- CMS — content lives in the repo (JSX + Markdown)

## 6. Traceability Matrix

| Requirement | Implementation | Tests |
|-------------|---------------|-------|

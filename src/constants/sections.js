// Section anchor IDs — single source of truth for nav-link targets. Each value
// matches a section's `id` attribute (see the corresponding component) and is
// used three ways: as the anchor `href`, as the `querySelector` selector, and
// as the `nav:goto` event detail — so it carries the leading '#'.
//
// Extracted from the inline strings that were scattered across App.jsx and
// Navbar.jsx (same spirit as NAV_LINK_GAP in utils/layout.js): change a target
// here and every link/scroll/remount-key follows.
export const SECTIONS = {
  hero: '#hero',                    // Hero.jsx
  builtFor: '#built-for',           // CareJourney.jsx
  howItWorks: '#how-it-works',      // HowItWorks.jsx
  whyNear: '#why-near',             // PostEnrollment.jsx
  careConnected: '#care-connected', // CareConnected.jsx
  contact: '#contact',              // FooterCta.jsx
}

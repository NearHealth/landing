// Shared layout constants. Keep in sync with the matching custom properties
// in src/styles/global.css: --navbar-h, --navbar-sticky-offset.
export const NAVBAR_HEIGHT = 66
export const NAVBAR_STICKY_OFFSET = 82   // NAVBAR_HEIGHT + 16px breathing room

// Gap below the navbar where a section lands after a nav-link jump (App.jsx).
// Kept separate from NAVBAR_STICKY_OFFSET so tweaking the click-to-section
// landing doesn't shift the Hero's scroll-scrub math.
export const NAV_LINK_GAP = 56

// Viewport breakpoints (px). Matched to the CSS @media queries; CSS custom
// properties cannot be used inside @media queries, so the value is duplicated.
export const BREAKPOINT_PHONE  = 480     // narrow phone — image swap, dense grids
export const BREAKPOINT_TABLET = 1024    // tablet and below — column layouts, no scrub

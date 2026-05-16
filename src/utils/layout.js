// Shared layout constants. Keep in sync with the matching custom properties
// in src/styles/global.css: --navbar-h, --navbar-sticky-offset.
export const NAVBAR_HEIGHT = 66
export const NAVBAR_STICKY_OFFSET = 82   // NAVBAR_HEIGHT + 16px breathing room

// Viewport breakpoints (px). Matched to the CSS @media queries; CSS custom
// properties cannot be used inside @media queries, so the value is duplicated.
export const BREAKPOINT_PHONE  = 480     // narrow phone — image swap, dense grids
export const BREAKPOINT_TABLET = 1024    // tablet and below — column layouts, no scrub

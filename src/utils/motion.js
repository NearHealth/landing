// Reduced-motion-aware variants.
//
// Accessibility guidance: reduced motion means *gentler* motion, not none —
// keep opacity/comprehension transitions and strip only on-screen movement.
// So movement-sensitive users (and anyone whose device quietly has "Reduce
// Motion" on) still get a calm fade-in instead of a dead, instant-pop page.

// Keys that represent on-screen movement — removed under reduced motion.
// Opacity, pathLength, filter and `transition` (incl. staggerChildren) are kept.
const MOVEMENT_KEYS = ['x', 'y', 'z', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'rotateZ']

// Return a copy of `variants` with movement keys removed from every state.
// Leaves the input object untouched.
export function fadeOnly(variants) {
  if (!variants) return variants
  const out = {}
  for (const state in variants) {
    const def = variants[state]
    if (def && typeof def === 'object' && !Array.isArray(def)) {
      const clean = {}
      for (const key in def) if (!MOVEMENT_KEYS.includes(key)) clean[key] = def[key]
      out[state] = clean
    } else {
      out[state] = def
    }
  }
  return out
}

// Full variants when motion is allowed; movement-stripped (fade-only) when reduced.
// Use this in place of the old `reduce ? undefined : variants` pattern so the
// element still fades rather than disabling its animation entirely.
export function softVariants(reduce, variants) {
  return reduce ? fadeOnly(variants) : variants
}

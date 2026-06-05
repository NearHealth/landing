import { useEffect } from 'react'
import Lenis from 'lenis'

// Lenis smooth scroll driven by its own rAF loop (was a GSAP ticker). No GSAP
// dependency — nothing else on the page uses ScrollTrigger anymore (reveals are
// on Motion's whileInView), so there's no ScrollTrigger.update to pump here.
// Optional `lenisRef` lets callers (e.g. App's nav-jump handler) reach the live
// instance for programmatic, immediate scrolls that stay in sync with Lenis's
// virtual scroll position (a raw window.scrollTo would fight it).
export function useLenis(lenisRef) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis()
    if (lenisRef) lenisRef.current = lenis

    let rafId
    const raf = (time) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      if (lenisRef) lenisRef.current = null
    }
  }, [lenisRef])
}

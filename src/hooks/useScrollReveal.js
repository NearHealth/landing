import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import '../utils/eases'

/**
 * Build a scroll-triggered reveal for a section.
 *
 * Lifecycle:
 *   1. `prepare` runs synchronously inside useLayoutEffect (before paint),
 *      so call `gsap.set(targets, { autoAlpha: 0 })` here to avoid any FOUC.
 *   2. After `document.fonts.ready` resolves, `animate` runs inside a
 *      `gsap.context` scoped to `scopeRef`. Build SplitTexts, timelines,
 *      and ScrollTriggers here.
 *   3. On unmount the context reverts (undoes splits, kills triggers) and
 *      clearProps wipes any inline styles `prepare` set.
 *
 * If the user prefers reduced motion, neither callback runs and the
 * targets stay in their natural visible state.
 *
 * @param {{
 *   scopeRef: import('react').RefObject<HTMLElement>,
 *   prepare?: () => HTMLElement[] | void,
 *   animate: (api: { gsap: typeof gsap }) => void,
 *   deps?: unknown[],
 * }} cfg
 */
export function useScrollReveal({ scopeRef, prepare, animate, deps = [] }) {
  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    // Skip the reveal if the section is already in or past the viewport at mount —
    // e.g. on reload after the browser restored scroll to mid-page. Otherwise
    // prepare() hides everything and the ScrollTrigger never fires (its start was
    // crossed before the trigger existed), leaving the section invisible.
    if (scope.getBoundingClientRect().top < window.innerHeight) return

    const hidden = prepare?.() || []

    let cancelled = false
    let ctx

    const run = () => {
      if (cancelled) return
      ctx = gsap.context(() => animate({ gsap }), scope)
    }

    const ready = document.fonts && document.fonts.ready
    if (ready && typeof ready.then === 'function') ready.then(run)
    else run()

    return () => {
      cancelled = true
      if (ctx) ctx.revert()
      if (hidden.length) gsap.set(hidden, { clearProps: 'opacity,visibility,transform' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

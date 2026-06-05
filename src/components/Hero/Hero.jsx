import { useLayoutEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import useIsMobile from '../../hooks/useIsMobile'
import { BREAKPOINT_TABLET, NAVBAR_STICKY_OFFSET } from '../../utils/layout'
import { softVariants } from '../../utils/motion'
import ResponsiveVideo from '../ui/ResponsiveVideo/ResponsiveVideo'
import BuiltForCarousel from './BuiltForCarousel'
import './Hero.css'

// ── Motion entrance (staggered fade-up). Same variants drive BOTH columns so
// the right side appears exactly like the left. ──
const heroContainer = { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } } }
const heroItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

// Scrub tuning (mirrors the previous GSAP values).
const SCRUB_VH = 0.6      // scrub scroll distance as a fraction of viewport height
const EXPAND_FRAC = 0.538 // expand over this fraction of the scrub, then hold
const TAIL_GAP = 120      // px gap below the expanded card before CareJourney
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

export default function Hero() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()

  const heroRef = useRef(null)
  const rightColRef = useRef(null)   // scrub runway (was bottomRowRef)
  const slotRef = useRef(null)       // .hero-video-card — never transformed; measured for geometry
  const mobileVideoRef = useRef(null)

  // Geometry recomputed on layout + resize; the transforms read it each frame
  // (function form), so resizing needs no transform re-creation.
  const geom = useRef(null)
  const mgeom = useRef(null)

  const { scrollY } = useScroll()

  // ── Desktop: expand the video from its natural box → a centered,
  // viewport-filling box, and fade the surrounding text out in parallel. ──
  const dExpand = (y) => {
    const g = geom.current
    return g ? clamp01((y - g.start) / (g.expandEnd - g.start)) : 0
  }
  // Always return a CONCRETE size once geometry is measured — never undefined.
  // Returning undefined at rest left a STALE inline width on the element: Framer
  // skips applying an undefined motion value, so the last EXPANDED width stuck
  // instead of clearing. On a fast scroll back to top the width jumps from a large
  // value straight past p=0 in one frame, that big width stays, and the left-
  // anchored inner overflows to the RIGHT ("video won't take the container width").
  // At rest dExpand=0 → width=w0 / height=h0, exactly the slot box, so the inner
  // always lands flush with zero reliance on a CSS 100% fallback. g.w0/g.h0 are
  // refreshed by measure() on resize (the slot is never transformed, so its size
  // only changes on resize), so this stays responsive; reading geom instead of a
  // per-frame getBoundingClientRect avoids a forced reflow on the hottest scroll
  // animation on the page.
  const cardW = useTransform(scrollY, (y) => {
    const g = geom.current
    return g ? g.w0 + (g.wFull - g.w0) * dExpand(y) : undefined
  })
  const cardH = useTransform(scrollY, (y) => {
    const g = geom.current
    return g ? g.h0 + (g.hFull - g.h0) * dExpand(y) : undefined
  })
  const cardX = useTransform(scrollY, (y) => { const g = geom.current; return g ? g.dx * dExpand(y) : 0 })
  const cardY = useTransform(scrollY, (y) => { const g = geom.current; return g ? g.dy * dExpand(y) : 0 })
  // Left block (heading + subtitle/buttons) dissolves by opacity from the very
  // start of scroll — fully faded after half a viewport, before the card sticks.
  const textFade = useTransform(scrollY, (y) => {
    const g = geom.current
    return g ? 1 - clamp01(y / g.fadeLen) : 1
  })

  // ── Mobile: video grows to full-bleed (width → 100vw, radius → 0). ──
  const mExpand = (y) => {
    const g = mgeom.current
    return g ? clamp01((y - g.start) / (g.end - g.start)) : 0
  }
  const mW = useTransform(scrollY, (y) => { const g = mgeom.current; return g ? g.w0 + (g.vw - g.w0) * mExpand(y) : undefined })
  // Symmetric margin that keeps the video centred at EVERY width — from its
  // resting (max-width-capped) box to full-bleed. (vw − w)/2 is the centred gap
  // from each viewport edge; minus pagePx because the margin is relative to the
  // padded container, not the viewport. Applied to both sides so the CSS
  // `margin: 0 auto` never fights the inline value (which used to push it off-centre).
  const mMargin = useTransform(scrollY, (y) => {
    const g = mgeom.current
    if (!g) return 0
    const w = g.w0 + (g.vw - g.w0) * mExpand(y)
    return (g.vw - w) / 2 - g.pagePx
  })
  const mRadius = useTransform(scrollY, (y) => { const g = mgeom.current; return g ? g.r0 * (1 - mExpand(y)) : undefined })

  // Desktop geometry + scrub runway sizing (replaces GSAP onRefreshInit).
  useLayoutEffect(() => {
    const right = rightColRef.current
    const hero = heroRef.current
    const clear = () => {
      geom.current = null
      if (right) right.style.minHeight = ''
      if (hero) hero.style.paddingBottom = ''
    }
    if (isMobile || reduce) { clear(); return }

    const measure = () => {
      const slot = slotRef.current
      if (!slot || !right || !hero) return
      if (window.innerWidth <= BREAKPOINT_TABLET) { clear(); return }
      const vw = window.innerWidth
      const vh = window.innerHeight
      const pad = Math.max(72, Math.min(96, 0.05 * vw))
      const rect = slot.getBoundingClientRect()
      const w0 = rect.width
      const h0 = rect.height
      const cardAbsTop = rect.top + window.scrollY
      const slotTop = slot.offsetTop
      const wFull = Math.min(vw - 2 * pad, 1440)
      const hFull = vh - 2 * pad
      const start = cardAbsTop - NAVBAR_STICKY_OFFSET // scroll where the card sticks
      // Centre the expanded card in the viewport, BUT never let its right edge
      // drift right of the slot's resting right edge. On screens wider than 1440
      // the width caps at 1440 while the centred right edge ((vw+wFull)/2) lands
      // RIGHT of rect.right, so the card visibly "slides right past the container"
      // as it contracts on scroll-up. Capping dx at (w0 - wFull) pins the right
      // edge to the slot — the card then grows leftward only, killing that drift —
      // while staying perfectly centred at ≤1440 where centring is already safe.
      const dx = Math.min(vw / 2 - rect.left - wFull / 2, w0 - wFull)
      geom.current = {
        w0, h0, wFull, hFull,
        dx,
        dy: pad - NAVBAR_STICKY_OFFSET,
        start,
        expandEnd: start + EXPAND_FRAC * SCRUB_VH * vh,
        fadeLen: 0.5 * vh,
      }
      // Runway tall enough for the full scrub while the card stays stuck, plus
      // the slot's own offset below the built-for ticker. Tail keeps the gap to
      // CareJourney at TAIL_GAP (hero net height unchanged by slotTop).
      right.style.minHeight = `${SCRUB_VH * vh + h0 + NAVBAR_STICKY_OFFSET + slotTop}px`
      hero.style.paddingBottom = `${TAIL_GAP + vh - pad - NAVBAR_STICKY_OFFSET - h0 - slotTop}px`
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [isMobile, reduce])

  // Mobile geometry for the full-bleed expand.
  useLayoutEffect(() => {
    if (!isMobile || reduce) { mgeom.current = null; return }
    const measure = () => {
      const el = mobileVideoRef.current
      if (!el) return
      const pagePx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-px')) || 19.5
      const r0 = parseFloat(getComputedStyle(el).borderRadius) || 30
      const rect = el.getBoundingClientRect()
      const top = rect.top + window.scrollY
      mgeom.current = {
        w0: el.offsetWidth,
        vw: window.innerWidth,
        pagePx, r0,
        start: top - window.innerHeight * 0.6, // begins when el top hits 60% vh
        end: top - window.innerHeight * 0.2,   // full-bleed by 20% vh
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [isMobile, reduce])

  // Entrance props — fade-only (no movement) under reduced motion. The scroll
  // scrub below stays disabled under reduced motion (it's heavy scroll-driven
  // movement); only this opacity entrance is preserved.
  const enter = { initial: 'hidden', animate: 'visible', variants: softVariants(reduce, heroContainer) }
  const itemVariants = softVariants(reduce, heroItem)

  return (
    <div className="hero-outer">
    <section className="hero" id="hero" ref={heroRef}>
      <div className="container hero-container">
        {isMobile ? (
          /* ── Mobile layout ── */
          <>
            <div className="hero-mobile-top">
              <h1 className="hero-heading hero-heading--mobile">The future of <br />post-enrollment <br />healthcare.</h1>
              <p className="hero-subtitle hero-subtitle--mobile">Where everything connects –<br />and care actually moves.</p>
              <div className="hero-buttons hero-buttons--mobile">
                <a href="#contact" className="btn btn--primary">Request a demo</a>
                <a href="#contact" className="btn btn--secondary">Talk to us</a>
              </div>
            </div>
            <BuiltForCarousel />
            <motion.div
              className="hero-mobile-video"
              ref={mobileVideoRef}
              style={reduce ? undefined : { width: mW, marginLeft: mMargin, marginRight: mMargin, borderRadius: mRadius, maxWidth: 'none' }}
            >
              <ResponsiveVideo desktop="assets/video/hero_desktop.mp4" mobile="assets/video/hero_mobile.mp4" desktopWebm="assets/video/hero_desktop.webm" mobileWebm="assets/video/hero_mobile.webm" />
            </motion.div>
          </>
        ) : (
          /* ── Desktop layout (v2: two columns — text left, carousel + video
                right; Figma 2057:663). Entrance + scrub are Motion-driven. ── */
          <div className="hero-grid">
            {/* Left column. Each item: outer = Motion entrance (opacity + y),
                inner = scroll-fade opacity (textFade) — kept on separate
                elements so the two opacity drivers don't fight (combined =
                entrance × scroll). */}
            <motion.div className="hero-left-col" {...enter}>
              <motion.div variants={itemVariants}>
                <motion.h1 className="hero-heading" style={{ opacity: textFade }}>
                  The future of<br />post-enrollment<br />healthcare.
                </motion.h1>
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.div className="hero-left" style={{ opacity: textFade }}>
                  <p className="hero-subtitle">The first AI-native infrastructure bridging coverage and care.</p>
                  <div className="hero-buttons">
                    <a href="#contact" className="btn btn--primary">Request a demo</a>
                    <a href="#contact" className="btn btn--secondary">Talk to us</a>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right column — built-for ticker above the sticky video. This
                column is the scrub runway (min-height set in the effect). */}
            <motion.div className="hero-right-col" ref={rightColRef} {...enter}>
              <motion.div className="hero-carousel-wrap" variants={itemVariants}>
                <motion.div style={{ opacity: textFade }}>
                  <BuiltForCarousel />
                </motion.div>
              </motion.div>
              <motion.div className="hero-video-card" ref={slotRef} variants={itemVariants}>
                <motion.div
                  className="hero-video-card-inner"
                  style={reduce ? undefined : { width: cardW, height: cardH, x: cardX, y: cardY }}
                >
                  <ResponsiveVideo desktop="assets/video/hero_desktop.mp4" mobile="assets/video/hero_mobile.mp4" desktopWebm="assets/video/hero_desktop.webm" mobileWebm="assets/video/hero_mobile.webm" />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
    </div>
  )
}

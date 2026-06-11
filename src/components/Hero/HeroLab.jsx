import { useLayoutEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import useIsMobile from '../../hooks/useIsMobile'
import { BREAKPOINT_TABLET, NAVBAR_STICKY_OFFSET } from '../../utils/layout'
import { softVariants } from '../../utils/motion'
import ResponsiveVideo from '../ui/ResponsiveVideo/ResponsiveVideo'
import BuiltForCarousel from './BuiltForCarousel'
import './HeroLab.css'

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
// PORTRAIT-ONLY cap on the viewport height the scrub math scales with. On a
// vertical (portrait) monitor the raw vh balloons the runway + bottom padding
// and stretches the card into a cropped portrait, so there we clamp to this
// reference height (card stays aspect-correct, top-anchored). In LANDSCAPE the
// cap is bypassed (vhEff = vh) so the expanded card fills the full viewport
// height — see measure(). See also the isPortrait branch there.
const MAX_SCRUB_VH = 900
const CARD_ASPECT = 532 / 947 // expanded card height ÷ width
const POST_HERO_GAP = 80 // constant gap the next section keeps below the video
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

// translateY for the .post-hero riser at a given scroll. It keeps the next
// section POST_HERO_GAP below the video's CURRENT (growing) bottom edge through
// the expand + hold, then — past `release` — freezes, so the +sy term stops
// compounding and the block resumes normal upward scroll. videoBottomVp is the
// inner card's bottom in viewport coords (sticky top + centring offset + height).
const postHeroYAt = (g, scrollY) => {
  const sy = Math.min(scrollY, g.release)
  let videoBottomVp
  if (sy < g.start) {
    // Pre-sticky: the card is still in normal flow at its resting size, riding up
    // with the scroll. (Continuous with the branch below at sy === start.)
    videoBottomVp = g.cardAbsTop - sy + g.h0
  } else {
    const p = clamp01((sy - g.start) / (g.expandEnd - g.start))
    videoBottomVp = NAVBAR_STICKY_OFFSET + g.dy * p + (g.h0 + (g.hFull - g.h0) * p)
  }
  return videoBottomVp + POST_HERO_GAP - g.postHeroTop + sy
}

export default function HeroLab() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()

  const heroRef = useRef(null)
  const rightColRef = useRef(null)   // scrub runway (was bottomRowRef)
  const slotRef = useRef(null)       // .hero-video-card — never transformed; measured for geometry
  const mobileVideoRef = useRef(null)

  // Geometry recomputed on layout + resize; the transforms read it via the
  // function form (no transform re-creation needed), but a resize without scroll
  // still needs resizeTick (below) to nudge them to re-read the fresh geom.
  const geom = useRef(null)
  const mgeom = useRef(null)

  const { scrollY } = useScroll()
  // Bumped by measure() on resize. useTransform only re-evaluates when an input
  // changes, so a resize WITHOUT scroll (e.g. closing DevTools widens the
  // viewport) wouldn't otherwise recompute the card size — it would stick at the
  // stale w0. Feeding this as a second input forces the recompute on resize.
  const resizeTick = useMotionValue(0)

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
  const cardW = useTransform([scrollY, resizeTick], ([y]) => {
    const g = geom.current
    return g ? g.w0 + (g.wFull - g.w0) * dExpand(y) : undefined
  })
  const cardH = useTransform([scrollY, resizeTick], ([y]) => {
    const g = geom.current
    return g ? g.h0 + (g.hFull - g.h0) * dExpand(y) : undefined
  })
  const cardX = useTransform([scrollY, resizeTick], ([y]) => { const g = geom.current; return g ? g.dx * dExpand(y) : 0 })
  const cardY = useTransform([scrollY, resizeTick], ([y]) => { const g = geom.current; return g ? g.dy * dExpand(y) : 0 })
  // Left block (heading + subtitle/buttons) dissolves by opacity from the very
  // start of scroll — fully faded after half a viewport, before the card sticks.
  const textFade = useTransform([scrollY, resizeTick], ([y]) => {
    const g = geom.current
    return g ? 1 - clamp01(y / g.fadeLen) : 1
  })

  // Drive the .post-hero riser (it lives in App, a sibling) via a :root CSS var.
  // Keeps the next section glued POST_HERO_GAP below the video's bottom through
  // the expand+hold, then scrolls normally.
  const postHeroY = useTransform([scrollY, resizeTick], ([y]) => {
    const g = geom.current
    return g ? postHeroYAt(g, y) : 0
  })
  useMotionValueEvent(postHeroY, 'change', (v) => {
    document.documentElement.style.setProperty('--post-hero-y', `${v}px`)
  })

  // LAB: the post-hero block sits dimmed (30%) until the video expand plays it
  // in — opacity ramps 0.3 → 1 across the same expand progress, hitting full at
  // fullscreen.
  const postHeroOpacity = useTransform([scrollY, resizeTick], ([y]) => {
    const g = geom.current
    return g ? 0.3 + 0.7 * dExpand(y) : 1
  })
  useMotionValueEvent(postHeroOpacity, 'change', (v) => {
    document.documentElement.style.setProperty('--post-hero-opacity', `${v}`)
  })

  // ── Mobile: video grows to full-bleed (width → 100vw, radius → 0). ──
  const mExpand = (y) => {
    const g = mgeom.current
    return g ? clamp01((y - g.start) / (g.end - g.start)) : 0
  }
  const mW = useTransform([scrollY, resizeTick], ([y]) => { const g = mgeom.current; return g ? g.w0 + (g.vw - g.w0) * mExpand(y) : undefined })
  // Symmetric margin that keeps the video centred at EVERY width — from its
  // resting (max-width-capped) box to full-bleed. (vw − w)/2 is the centred gap
  // from each viewport edge; minus pagePx because the margin is relative to the
  // padded container, not the viewport. Applied to both sides so the CSS
  // `margin: 0 auto` never fights the inline value (which used to push it off-centre).
  const mMargin = useTransform([scrollY, resizeTick], ([y]) => {
    const g = mgeom.current
    if (!g) return 0
    const w = g.w0 + (g.vw - g.w0) * mExpand(y)
    return (g.vw - w) / 2 - g.pagePx
  })
  const mRadius = useTransform([scrollY, resizeTick], ([y]) => { const g = mgeom.current; return g ? g.r0 * (1 - mExpand(y)) : undefined })

  // Desktop geometry + scrub runway sizing (replaces GSAP onRefreshInit).
  useLayoutEffect(() => {
    const right = rightColRef.current
    const hero = heroRef.current
    const clear = () => {
      geom.current = null
      if (right) right.style.minHeight = ''
      if (hero) {
        hero.style.paddingBottom = ''
        hero.style.minHeight = ''
        hero.style.removeProperty('--hero-two-line-h')
        hero.style.removeProperty('--hero-video-offset')
      }
      // Mobile / reduced motion: no riser offset, full opacity.
      document.documentElement.style.setProperty('--post-hero-y', '0px')
      document.documentElement.style.setProperty('--post-hero-opacity', '1')
    }
    if (isMobile || reduce) { clear(); return }

    const measure = () => {
      const slot = slotRef.current
      if (!slot || !right || !hero) return
      if (window.innerWidth <= BREAKPOINT_TABLET) { clear(); return }
      const vw = window.innerWidth
      const vh = window.innerHeight
      // The scrub scroll-distance + final card size scale with vhEff.
      // LANDSCAPE: use the full vh so the expanded card fills the viewport
      // height (hFull = vh − 2·pad → equal pad top/bottom = filled AND vertically
      // centred). PORTRAIT (vertical, non-tablet monitors): keep the
      // MAX_SCRUB_VH cap — there an uncapped vh would balloon the runway and
      // stretch the card into a cropped portrait. Tablets never reach this
      // branch (width ≤ TABLET exits to the mobile layout above).
      const isPortrait = vh > vw
      const vhEff = isPortrait ? Math.min(vh, MAX_SCRUB_VH) : vh
      const pad = Math.max(72, Math.min(96, 0.05 * vw))
      const rect = slot.getBoundingClientRect()
      const w0 = rect.width
      const h0 = rect.height
      const cardAbsTop = rect.top + window.scrollY
      const slotTop = slot.offsetTop
      // −10px breathing room on narrow screens (where the expanded width is
      // vw−2·pad). Absorbed by the 1440 cap on wide screens, so they're unchanged.
      const wFull = Math.min(vw - 2 * pad - 10, 1440)
      // LAB: fill the (capped) viewport height. On a normal desktop (vh ≤ cap)
      // this is vh−2·pad, so with dy=pad−82 the card fills AND centres (equal top/
      // bottom gaps) — true fullscreen. On tall/zoomed screens vhEff caps it, so
      // it stays top-anchored and never inflates into a portrait (the cap, not an
      // aspect lock, is what prevents that). object-fit: cover handles the crop.
      const hFull = vhEff - 2 * pad
      const start = cardAbsTop - NAVBAR_STICKY_OFFSET // scroll where the card sticks
      const dx = Math.min(vw / 2 - rect.left - wFull / 2, w0 - wFull)
      // LAB: anchor the card near the top (at `pad`), not centred — it expands in
      // place on tall screens (client request).
      const dy = pad - NAVBAR_STICKY_OFFSET
      const release = start + SCRUB_VH * vhEff // video unpins; riser stops tracking
      // Card bottom (viewport-y) when fully expanded & sticky (p=1): = pad + hFull.
      const videoBottomAtRelease = NAVBAR_STICKY_OFFSET + dy + hFull
      // The .post-hero block must NATURALLY sit here so its riser translateY is
      // exactly 0 at release — i.e. it ends on its real layout position. A non-zero
      // end offset would leave empty space under the footer, since a transform
      // doesn't shrink the document's scroll height.
      const targetPostHeroTop = videoBottomAtRelease + POST_HERO_GAP + release

      geom.current = {
        w0, h0, wFull, hFull, dx, dy, start, cardAbsTop, release,
        expandEnd: start + EXPAND_FRAC * SCRUB_VH * vhEff,
        postHeroTop: targetPostHeroTop, // refined to the measured value just below
        fadeLen: 0.5 * vhEff,
      }
      // Runway: tall enough to keep the card sticky through the scrub (vhEff so it
      // doesn't balloon on tall screens).
      right.style.minHeight = `${SCRUB_VH * vhEff + h0 + NAVBAR_STICKY_OFFSET + slotTop}px`
      // Drop the CSS `min-height: 100vh` floor: on tall screens it forces the hero
      // taller than `target`, so the padding below can't reach target and the
      // riser's translateY can't return to 0 (→ a gap under the footer). The
      // pulled-up post-hero fills the lower viewport instead.
      hero.style.minHeight = '0px'
      // Tune the hero's bottom padding so .post-hero's natural top == target → the
      // riser translateY lands on 0 at release, leaving no gap under the footer.
      const postHeroEl = document.querySelector('.post-hero')
      if (postHeroEl) {
        hero.style.paddingBottom = '0px'
        const baseTop = postHeroEl.offsetTop // hero height with no tail padding
        const padBottom = Math.max(0, Math.round(targetPostHeroTop - baseTop))
        hero.style.paddingBottom = `${padBottom}px`
        geom.current.postHeroTop = baseTop + padBottom
      } else {
        hero.style.paddingBottom = ''
      }

      // Set the riser offset for the current scroll synchronously (before paint),
      // so it's correct on first load + every resize without waiting for a scroll.
      document.documentElement.style.setProperty('--post-hero-y', `${postHeroYAt(geom.current, window.scrollY)}px`)
      document.documentElement.style.setProperty('--post-hero-opacity', `${0.3 + 0.7 * dExpand(window.scrollY)}`)

      // (The right block's two-line alignment is now pure CSS via .hero-h1-mirror
      // — no JS measurement needed. The scrub reads the resulting video position.)

      // Force the scroll-driven card transforms to recompute against the fresh
      // geom even though scrollY didn't change (resize-without-scroll).
      resizeTick.set(resizeTick.get() + 1)
    }
    measure()
    window.addEventListener('resize', measure)
    // Webfont (Gilroy) swap shifts line metrics — re-measure once it settles.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => measure())
    }
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
      // Recompute the resting width/margin/radius against the fresh geom on a
      // resize-without-scroll (same DevTools-close stick as desktop).
      resizeTick.set(resizeTick.get() + 1)
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
              <p className="hero-subtitle hero-subtitle--mobile">The first AI-native infrastructure bridging coverage and care.</p>
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
              <ResponsiveVideo desktop="assets/video/hero_desktop.mp4" mobile="assets/video/hero_mobile.mp4" desktopPoster="assets/video/hero_desktop_poster.jpg" mobilePoster="assets/video/hero_mobile_poster.jpg" />
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
              {/* Invisible h1 mirror: inherits the heading's exact font metrics
                  and renders two lines (cap + ascender), so its flow height equals
                  the heading's first two lines at ANY width — the video below it
                  is pushed down to align with line 2, pure-CSS, no JS measuring.
                  Swap T/l for an SVG later to keep it out of SEO/text. */}
              <div className="hero-h1-mirror" aria-hidden="true">T<br />l</div>
              <motion.div className="hero-video-card" ref={slotRef} variants={itemVariants}>
                <motion.div
                  className="hero-video-card-inner"
                  style={reduce ? undefined : { width: cardW, height: cardH, x: cardX, y: cardY }}
                >
                  <ResponsiveVideo desktop="assets/video/hero_desktop.mp4" mobile="assets/video/hero_mobile.mp4" desktopPoster="assets/video/hero_desktop_poster.jpg" mobilePoster="assets/video/hero_mobile_poster.jpg" />
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

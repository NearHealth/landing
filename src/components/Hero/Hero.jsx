import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useIsMobile from '../../hooks/useIsMobile'
import { BREAKPOINT_TABLET, NAVBAR_STICKY_OFFSET } from '../../utils/layout'
import ResponsiveVideo from '../ui/ResponsiveVideo/ResponsiveVideo'
import BuiltForCarousel from './BuiltForCarousel'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const isMobile = useIsMobile()
  const bottomRowRef = useRef(null)
  const cardRef = useRef(null)
  const headingRef = useRef(null)
  const carouselWrapRef = useRef(null)
  const leftRef = useRef(null)
  const mobileVideoRef = useRef(null)

  useEffect(() => {
    if (isMobile) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Skip the scrub on tablet width: layout collapses to a column at <=1024px
    if (window.innerWidth <= BREAKPOINT_TABLET) return

    const row = bottomRowRef.current
    const card = cardRef.current
    if (!row || !card) return
    const heroEl = row.closest('.hero')

    const targets = { dx: 0, dy: 0, w: 0, h: 0, w0: 0, h0: 0 }
    const fadeTargets = [headingRef.current, carouselWrapRef.current, leftRef.current].filter(Boolean)

    const ctx = gsap.context(() => {
      // The visible inner card grows from its natural pixel size → a viewport-
      // sized rect with equal padding on all four sides. We animate real
      // width/height (not transform: scale) so the inner <video>'s box ends
      // up at the right aspect ratio — object-fit: cover then crops cleanly
      // instead of the entire scaled box being stretched.
      // The first 0.7 of the timeline runs the resize; the remaining 0.6
      // is an empty hold that keeps the scrub pinned at full size.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: row,
          start: 'top top',
          end: () => '+=' + window.innerHeight * 0.6,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            // Read the inner card's natural geometry (no transform, no
            // animated width/height). It sits absolutely positioned over the
            // outer layout slot, so its rect matches the slot's natural size.
            // NAVBAR_STICKY_OFFSET mirrors the CSS `position: sticky; top` on
            // the outer slot — we can't read getBoundingClientRect().top because
            // onRefreshInit fires at scroll = 0 (card not yet stuck).
            const SCRUB_VH = 0.6 // matches scrollTrigger end above (0.7 scale + 0.6 hold)
            const TAIL_GAP = 120 // empty space below the expanded video; pairs with CareJourney's 120px top padding for a 240px section gap
            const vw = window.innerWidth
            const vh = window.innerHeight
            const pad = Math.max(72, Math.min(96, 0.05 * vw)) // ≥72px keeps the expanded card clear of the 66px navbar
            gsap.set(card, { clearProps: 'width,height,transform' })
            const r = card.getBoundingClientRect()
            targets.w0 = r.width
            targets.h0 = r.height
            targets.w = Math.min(vw - 2 * pad, 1440)
            targets.h = vh - 2 * pad
            // Center the resized box on the viewport. Anchor is the inner's
            // top-left (top:0, left:0 of the slot, slot top = NAVBAR_STICKY_OFFSET).
            targets.dx = vw / 2 - r.left - targets.w / 2
            targets.dy = pad - NAVBAR_STICKY_OFFSET
            // Calibrate the sticky range and hero tail so:
            //   1. the slot unsticks the moment the scrub completes
            //      (no dead pinned scroll between the animation and CareJourney)
            //   2. the constant post-unstick gap below the expanded card lands
            //      at exactly TAIL_GAP px. Derivation:
            //        gap = paddingBottom + pad + NAVBAR_STICKY_OFFSET + slotH - vh
            if (heroEl) {
              row.style.minHeight = `${SCRUB_VH * vh + targets.h0 + NAVBAR_STICKY_OFFSET}px`
              heroEl.style.paddingBottom = `${TAIL_GAP + vh - pad - NAVBAR_STICKY_OFFSET - targets.h0}px`
            }
          },
        },
      })

      tl.fromTo(
        card,
        { width: () => targets.w0, height: () => targets.h0 },
        {
          x: () => targets.dx,
          y: () => targets.dy,
          width: () => targets.w,
          height: () => targets.h,
          ease: 'none',
          duration: 0.7,
        },
      )
      // Hold: empty tween of duration 0.6 keeps the scrub pinned at full size
      // for ~60% of the viewport before the trigger releases.
      tl.to({}, { duration: 0.6 })

      if (fadeTargets.length) {
        gsap.to(fadeTargets, {
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top top',
            end: () => '+=' + window.innerHeight * 0.5,
            scrub: 0.6,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [isMobile])

  // Mobile-only: on scroll the video expands from its natural card size to
  // full viewport width, becoming the key focal point. Border-radius melts
  // to 0 so it reads as a cinematic full-bleed moment.
  useEffect(() => {
    if (!isMobile) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const el = mobileVideoRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      // Break out of .container's horizontal padding by animating marginLeft
      // to -pagePx and width to 100vw. This mirrors the coverage-carousel
      // breakout pattern and avoids fighting CSS width: 100% with GSAP.
      // borderRadius is read as a computed px value so GSAP can tween it.
      const getValues = () => {
        const pagePx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--page-px')) || 19.5
        const br = parseFloat(getComputedStyle(el).borderRadius) || 30
        return { pagePx, br }
      }

      const { pagePx, br } = getValues()

      // Snapshot natural state so GSAP can revert on ScrollTrigger refresh.
      const naturalML = parseFloat(getComputedStyle(el).marginLeft) || 0
      const naturalW  = el.offsetWidth

      gsap.to(el, {
          marginLeft: -pagePx,
          width: window.innerWidth,
          maxWidth: 'none',
          borderRadius: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 60%',
            end: 'top 20%',
            scrub: 0.8,
            invalidateOnRefresh: true,
            onRefresh: () => {
              const { pagePx: px } = getValues()
              gsap.set(el, { clearProps: 'marginLeft,width,maxWidth,borderRadius' })
            },
          },
        }
      )
    })

    return () => ctx.revert()
  }, [isMobile])

  return (
    <div className="hero-outer">
    <section className="hero" id="hero">
      <div className="container hero-container">
        {isMobile ? (
          /* ── Mobile layout ── */
          <>
            <div className="hero-mobile-top">
              <h1 className="hero-heading hero-heading--mobile">Turning<br />coverage<br />into care</h1>
              <p className="hero-subtitle hero-subtitle--mobile">Where everything connects –<br />and care actually moves.</p>
              <div className="hero-buttons hero-buttons--mobile">
                <a href="#contact" className="btn btn--primary">Request a demo</a>
                <a href="#contact" className="btn btn--secondary">Talk to us</a>
              </div>
            </div>
            <BuiltForCarousel />
            <div className="hero-mobile-video" ref={mobileVideoRef}>
              <ResponsiveVideo desktop="assets/Hero_Desktop.mp4" mobile="assets/Hero_Mobile.mp4" desktopWebm="assets/Hero_Desktop.webm" mobileWebm="assets/Hero_Mobile.webm" />
            </div>
          </>
        ) : (
          /* ── Desktop layout ── */
          <>
            <div className="hero-top-row">
              <h1 ref={headingRef} className="hero-heading">Turning<br />coverage<br />into care</h1>
              <div ref={carouselWrapRef} className="hero-carousel-wrap">
                <BuiltForCarousel />
              </div>
            </div>
            <div ref={bottomRowRef} className="hero-bottom-row">
              <div ref={leftRef} className="hero-left">
                <p className="hero-subtitle">Near coordinates care after enrolment without adding operational burden.</p>
                <div className="hero-buttons">
                  <a href="#contact" className="btn btn--primary">Request a demo</a>
                  <a href="#contact" className="btn btn--secondary">Talk to us</a>
                </div>
              </div>
              <div className="hero-video-card">
                <div ref={cardRef} className="hero-video-card-inner">
                  <ResponsiveVideo desktop="assets/Hero_Desktop.mp4" mobile="assets/Hero_Mobile.mp4" desktopWebm="assets/Hero_Desktop.webm" mobileWebm="assets/Hero_Mobile.webm" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
    </div>
  )
}

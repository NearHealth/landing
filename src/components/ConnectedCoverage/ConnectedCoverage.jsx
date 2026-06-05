import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BREAKPOINT_TABLET } from '../../utils/layout'
import { asset } from '../../utils/assetPath'
import { softVariants } from '../../utils/motion'
import SectionH2 from '../ui/SectionH2/SectionH2'
import './ConnectedCoverage.css'

// Motion entrance (scroll-triggered fade-up). Replaces the GSAP reveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

const INITIAL = ['Vision', 'Dental', 'Medicare', 'Individual', 'Employer']
const COPIES = 4
const items = Array.from({ length: COPIES }, () => INITIAL).flat()

// px per second — slow enough that the eye can read each label as it passes.
const SPEED = 70

export default function ConnectedCoverage() {
  const reduce = useReducedMotion()
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const reveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.4 }, variants: softVariants(reduce, fadeUp) }

  /* Continuous horizontal flow.
     - tx decreases linearly each frame at SPEED px/s
     - when tx crosses one INITIAL-set-width, snap it back so loops are seamless
     - per-frame: each item's distance from container center drives both opacity
       (gentle, wide falloff) and a --t custom prop (sharp falloff, drives color
        via color-mix in CSS) so the active label crisply reads as solid */
  useEffect(() => {
    if (typeof window === 'undefined') return
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const els = Array.from(track.children)
    let centers = []
    let halfWidths = []
    let smoothT = []
    let setWidth = 0
    let spacing = 0
    let containerCenter = 0
    let baseTx = 0

    const measure = () => {
      halfWidths = els.map((el) => el.offsetWidth / 2)
      centers = els.map((el) => el.offsetLeft + el.offsetWidth / 2)
      setWidth = centers[INITIAL.length] - centers[0]
      // Average gap between adjacent item centres — used to scale the
      // active/inactive crossfade so neighbouring items hand off cleanly.
      spacing = setWidth / INITIAL.length
      containerCenter = container.offsetWidth / 2
      const startIdx = INITIAL.length + Math.floor(INITIAL.length / 2)
      baseTx = containerCenter - centers[startIdx]
      if (smoothT.length === 0) smoothT = els.map(() => 1)
    }
    measure()

    let tx = baseTx
    let last = 0
    let raf = 0

    // Symmetric: the reverse transition (black→white, leaving centre) uses the
    // exact same timing/easing as the forward (white→black, reaching centre) —
    // client request. Same tau both directions.
    const TAU_DARKEN = 0.045
    const TAU_LIGHTEN = 0.045

    // Winner-take-all highlight: only the single item nearest the centre is
    // ever darkened — and only once it's genuinely near the centre (narrow
    // band below), so the active state reads as "this one is centred", with a
    // brief neutral beat between items rather than a continuous smear.
    const paint = (dt) => {
      let minDist = Infinity
      let minIdx = -1
      for (let i = 0; i < els.length; i++) {
        const d = Math.abs(centers[i] + tx - containerCenter)
        if (d < minDist) { minDist = d; minIdx = i }
      }

      for (let i = 0; i < els.length; i++) {
        const el = els[i]
        const dist = Math.abs(centers[i] + tx - containerCenter)
        // Active item: smoothstep dark→white over a NARROW central band so it
        // only goes black when actually centred (was spacing*0.5 — half a slot
        // early, which read as delayed/smeared). 0.30 → fully white once it's
        // ~30% of a slot past centre. Inactive items: forced to white.
        let t = 1
        if (i === minIdx) {
          const x = Math.min(1, dist / (spacing * 0.30))
          t = x * x * (3 - 2 * x)
        }
        // Direction-dependent tau: both snappy; darkening a touch slower so the
        // activation reads intentional. dt=0 (reduced-motion) snaps immediately.
        const darkening = t < smoothT[i]
        const lerpFactor = dt > 0 ? 1 - Math.exp(-dt / (darkening ? TAU_DARKEN : TAU_LIGHTEN)) : 1
        smoothT[i] += (t - smoothT[i]) * lerpFactor
        el.style.setProperty('--t', smoothT[i].toString())
      }
    }

    const tick = (time) => {
      if (!last) last = time
      const dt = (time - last) / 1000
      last = time

      tx -= (window.innerWidth <= BREAKPOINT_TABLET ? 35 : SPEED) * dt

      // Wrap tx and rotate smoothT to match. When tx jumps by setWidth, every
      // item visually lands where the item INITIAL.length slots ahead used to
      // be. Without rotating smoothT, the active-colour state becomes stale and
      // causes a visible flash on the wrap frame.
      let wraps = 0
      while (setWidth > 0 && tx <= baseTx - setWidth) { tx += setWidth; wraps++ }
      if (wraps > 0) {
        const shift = (wraps * INITIAL.length) % smoothT.length
        smoothT = [...smoothT.slice(shift), ...smoothT.slice(0, shift)]
      }

      track.style.transform = `translate3d(${tx}px, 0, 0)`
      paint(dt)

      raf = requestAnimationFrame(tick)
    }

    if (reduceMotion) {
      // Static state: fix the start frame so labels still read sensibly.
      track.style.transform = `translate3d(${baseTx}px, 0, 0)`
      paint(0)
      return
    }

    raf = requestAnimationFrame(tick)

    const onResize = () => {
      const prevSet = setWidth
      measure()
      // Keep the visible offset stable across resize: shift tx by the change in baseTx.
      if (prevSet > 0) tx = ((tx - baseTx) % setWidth + setWidth) % setWidth + (baseTx - setWidth)
    }
    window.addEventListener('resize', onResize)

    // Webfonts can shift item widths after first measure; re-measure when they settle.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        const prevSet = setWidth
        measure()
        if (prevSet > 0) tx = ((tx - baseTx) % setWidth + setWidth) % setWidth + (baseTx - setWidth)
      })
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section className="connected-coverage" id="connected-coverage">
      <div className="container connected-coverage-inner">
        <div className="platform-text">
          <SectionH2
            lines={['Connected across', 'coverage lines.']}
            marginBottom={18}
            mobileMarginBottom={18}
          />
          <motion.p className="platform-subtitle" {...reveal}>Supporting the coverage types brokers and providers work with every day.</motion.p>
        </div>
        <motion.div className="platform-phone" {...reveal}>
          <img
            src={asset('assets/images/hand-smartphone.webp')}
            alt="Hand holding a smartphone with the Near Health app"
            loading="lazy"
            className="platform-phone-img"
          />
        </motion.div>
      </div>

      <div className="coverage-carousel" ref={containerRef}>
        <div className="carousel-track" ref={trackRef}>
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className="carousel-item">{item}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

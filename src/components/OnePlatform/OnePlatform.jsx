import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import { asset } from '../../utils/assetPath'
import './OnePlatform.css'

const INITIAL = ['Vision', 'Dental', 'Medicare', 'ACA', 'Employer']
const COPIES = 4
const items = Array.from({ length: COPIES }, () => INITIAL).flat()

// px per second — slow enough that the eye can read each label as it passes.
const SPEED = 70

export default function OnePlatform() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const phoneRef = useRef(null)
  const trackRef = useRef(null)
  const containerRef = useRef(null)

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      gsap.set([titleRef.current, subtitleRef.current], { autoAlpha: 0 })
      gsap.set(phoneRef.current, blockRevealFromVars())
      return [titleRef.current, subtitleRef.current, phoneRef.current]
    },
    animate: () => {
      const titleSplit = splitLines(titleRef.current)
      const subSplit = splitLines(subtitleRef.current)
      gsap.set([titleRef.current, subtitleRef.current], { autoAlpha: 1 })

      gsap.from(titleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(titleRef.current) })
      gsap.from(subSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(subtitleRef.current) })
      gsap.to(phoneRef.current, { ...blockRevealVars({ stagger: 0 }), scrollTrigger: selfTrigger(phoneRef.current) })
    },
  })

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

    // Asymmetric time constants: darkening (inactive→active) feels abrupt
    // at the same speed as lightening, so we ease it in more slowly.
    const TAU_DARKEN = 0.08
    const TAU_LIGHTEN = 0.04

    // Winner-take-all highlight: only the single item nearest the centre is
    // ever darkened. As soon as another item becomes the closest, the
    // highlight hands off — there's no moment where two items are both
    // partially dark, and no white-only gap between consecutive actives.
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
        // Active item: smoothstep dark→white over its half of the spacing.
        // It hits ~white right as the next item takes over (dist ≈ spacing/2),
        // so the swap is visually continuous despite being a hard logical flip.
        // Inactive items: forced to white.
        let t = 1
        if (i === minIdx) {
          const x = Math.min(1, dist / (spacing * 0.5))
          t = x * x * (3 - 2 * x)
        }
        // Direction-dependent tau: darkening (t < smoothT) eases in slowly so
        // the active colour builds gradually; lightening stays snappy.
        // dt=0 (reduced-motion) snaps immediately.
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

      tx -= (window.innerWidth <= 768 ? 35 : SPEED) * dt

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
    <section className="one-platform" id="one-platform" ref={sectionRef}>
      <div className="container one-platform-inner">
        <div className="platform-text">
          <h2 className="section-title" ref={titleRef}>One platform.<br />All coverage.</h2>
          <p className="platform-subtitle" ref={subtitleRef}>Supporting the coverage types brokers and providers work with every day.</p>
        </div>
        <div className="platform-phone" ref={phoneRef}>
          <img
            src={asset('activate-care.jpg')}
            alt="Near Health - Activate Care"
            loading="lazy"
            className="platform-phone-img"
          />
        </div>
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

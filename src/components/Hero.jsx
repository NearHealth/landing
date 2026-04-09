import { useState, useEffect, useRef } from 'react'
import useIsMobile from '../hooks/useIsMobile'
import ResponsiveVideo from './ui/ResponsiveVideo'

const ITEMS = ['Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs']
const ITEM_H = 28
const ITEM_W = 120
const INTERVAL = 1220
const LINE_ANIM_DURATION = 800

export default function Hero() {
  const isMobile = useIsMobile()
  const [scrollPos, setScrollPos] = useState(0)
  const [lineReady, setLineReady] = useState(false)
  const [carouselActive, setCarouselActive] = useState(false)
  const trackRef = useRef(null)

  useEffect(() => {
    const lineTimer = setTimeout(() => setLineReady(true), 100)
    const carouselTimer = setTimeout(() => setCarouselActive(true), 100 + LINE_ANIM_DURATION)
    return () => { clearTimeout(lineTimer); clearTimeout(carouselTimer) }
  }, [])

  useEffect(() => {
    if (!carouselActive) return
    const step = isMobile ? ITEM_W : ITEM_H
    const id = setInterval(() => setScrollPos((p) => p + step), INTERVAL)
    return () => clearInterval(id)
  }, [carouselActive, isMobile])

  const handleTransitionEnd = () => {
    const step = isMobile ? ITEM_W : ITEM_H
    if (scrollPos >= ITEMS.length * step) {
      const el = trackRef.current
      if (!el) return
      el.style.transition = 'none'
      setScrollPos((p) => p - ITEMS.length * step)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (el) el.style.transition = 'transform 0.6s ease'
        })
      })
    }
  }

  const tripled = [...ITEMS, ...ITEMS, ...ITEMS]

  return (
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
            <div className="hero-mobile-built-for">
              <span className="built-for-label-mobile">Built for</span>
              <div className={`built-for-line-v${lineReady ? ' built-for-line-v--active' : ''}`}></div>
              <div className="built-for-h-viewport">
                <div
                  className="built-for-h-track"
                  ref={trackRef}
                  style={{
                    transform: `translateX(-${scrollPos}px)`,
                    transition: 'transform 0.6s ease',
                    opacity: carouselActive ? 1 : 0,
                  }}
                  onTransitionEnd={handleTransitionEnd}
                >
                  {tripled.map((item, i) => (
                    <span className="built-for-h-item" key={i}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="hero-mobile-video">
              <ResponsiveVideo desktop="assets/Hero_Desktop.mp4" mobile="assets/Hero_Mobile.mp4" />
            </div>
          </>
        ) : (
          /* ── Desktop layout ── */
          <>
            <div className="hero-top-row">
              <h1 className="hero-heading">Turning coverage<br />into care</h1>
              <div className="hero-built-for">
                <span className="built-for-label">Built for</span>
                <div className={`built-for-divider${lineReady ? ' built-for-divider--active' : ''}`}></div>
                <div className="built-for-viewport">
                  <div
                    className="built-for-track"
                    ref={trackRef}
                    style={{
                      transform: `translateY(-${scrollPos}px)`,
                      transition: 'transform 0.6s ease',
                      opacity: carouselActive ? 1 : 0,
                    }}
                    onTransitionEnd={handleTransitionEnd}
                  >
                    {tripled.map((item, i) => (
                      <div className="built-for-item" key={i}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="hero-bottom-row">
              <div className="hero-left">
                <p className="hero-subtitle">Near coordinates care after enrolment without adding operational burden.</p>
                <div className="hero-buttons">
                  <a href="#contact" className="btn btn--primary">Request a demo</a>
                  <a href="#contact" className="btn btn--secondary">Talk to us</a>
                </div>
              </div>
              <div className="hero-video-card">
                <ResponsiveVideo desktop="assets/Hero_Desktop.mp4" mobile="assets/Hero_Mobile.mp4" />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

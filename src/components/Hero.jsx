import { useState, useEffect, useRef } from 'react'

const ITEMS = ['Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs']
const ITEM_H = 28
const INTERVAL = 1220

export default function Hero() {
  const [scrollY, setScrollY] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setScrollY((p) => p + ITEM_H), INTERVAL)
    return () => clearInterval(id)
  }, [])

  const handleTransitionEnd = () => {
    if (scrollY >= ITEMS.length * ITEM_H) {
      const el = trackRef.current
      if (!el) return
      el.style.transition = 'none'
      setScrollY((p) => p - ITEMS.length * ITEM_H)
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
        <div className="hero-left">
          <h1 className="hero-heading">Turning coverage<br />into care</h1>
          <p className="hero-subtitle">Near coordinates care after enrolment without adding operational burden.</p>
          <div className="hero-buttons">
            <a href="#contact" className="btn btn-primary">Request a demo</a>
            <a href="#contact" className="btn btn-secondary">Talk to us</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-built-for">
            <span className="built-for-label">Built for</span>
            <div className="built-for-divider"></div>
            <div className="built-for-viewport">
              <div
                className="built-for-track"
                ref={trackRef}
                style={{
                  transform: `translateY(-${scrollY}px)`,
                  transition: 'transform 0.6s ease',
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {tripled.map((item, i) => (
                  <div className="built-for-item" key={i}>{item}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="hero-video-card">
            <video autoPlay muted loop playsInline>
              <source src="/assets/Hero_Desktop.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}

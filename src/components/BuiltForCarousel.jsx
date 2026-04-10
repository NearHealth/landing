import { useState, useEffect, useRef } from 'react'
import useIsMobile from '../hooks/useIsMobile'

const ITEMS = ['Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs']
const ITEM_H = 28
const ITEM_W = 80
const INTERVAL = 1220
const LINE_ANIM_DURATION = 800

export default function BuiltForCarousel() {
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

  if (isMobile) {
    return (
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
    )
  }

  return (
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
  )
}

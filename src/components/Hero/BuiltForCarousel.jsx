import { useState, useEffect } from 'react'
import useIsMobile from '../../hooks/useIsMobile'

const TRIPLED = [
  'Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs',
  'Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs',
  'Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs',
]
const LINE_ANIM_DURATION = 800
const LINE_DELAY = 250
const CAROUSEL_DELAY = LINE_DELAY + LINE_ANIM_DURATION

export default function BuiltForCarousel() {
  const isMobile = useIsMobile()
  const [lineReady, setLineReady] = useState(false)
  const [carouselActive, setCarouselActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const lineTimer = setTimeout(() => setLineReady(true), LINE_DELAY)
    const carouselTimer = setTimeout(() => setCarouselActive(true), CAROUSEL_DELAY)
    return () => { clearTimeout(lineTimer); clearTimeout(carouselTimer) }
  }, [])

  useEffect(() => {
    const onVisibility = () => setIsPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (isMobile) {
    return (
      <div className="hero-mobile-built-for">
        <span className="built-for-label-mobile">Built for</span>
        <div className={`built-for-line-v${lineReady ? ' built-for-line-v--active' : ''}`}></div>
        <div className="built-for-h-viewport">
          <div
            className={`built-for-h-track${carouselActive ? ' built-for-h-track--active' : ''}`}
            style={{ opacity: carouselActive ? 1 : 0 }}
          >
            {TRIPLED.map((item, i) => (
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
          className={[
            'built-for-track',
            carouselActive ? 'built-for-track--active' : '',
            isPaused ? 'built-for-track--paused' : '',
          ].filter(Boolean).join(' ')}
          style={{ opacity: carouselActive ? 1 : 0 }}
        >
          {TRIPLED.map((item, i) => (
            <div className="built-for-item" key={i}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

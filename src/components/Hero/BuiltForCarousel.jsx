import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useIsMobile from '../../hooks/useIsMobile'

const ITEMS = ['Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs']
const TRIPLED = [...ITEMS, ...ITEMS, ...ITEMS]

const ITEM_H   = 14   // px — matches Hero.css .built-for-item height
const GAP      = 8    // px — matches Hero.css .built-for-track gap
const LOOP_H   = ITEMS.length * (ITEM_H + GAP)  // 154px — includes the gap after the last item before the repeat
const DURATION = 14.4 // seconds per loop
const DELAY    = 1.35 // seconds before start

export default function BuiltForCarousel() {
  const isMobile = useIsMobile()
  const trackRef = useRef(null)

  useEffect(() => {
    if (isMobile) return
    const track = trackRef.current
    if (!track) return

    // GSAP modulo loop: y advances continuously, modulo LOOP_H keeps it in range.
    // No snap-back at the loop boundary — eliminates the CSS infinite-animation flash.
    const proxy = { y: 0 }
    const speed = LOOP_H / DURATION  // px per second

    const ctx = gsap.context(() => {
      gsap.delayedCall(DELAY, () => {
        gsap.ticker.add(ticker)
      })
    })

    function ticker(time, deltaTime) {
      proxy.y = (proxy.y + speed * (deltaTime / 1000)) % LOOP_H
      gsap.set(track, { y: -proxy.y })
    }

    return () => {
      ctx.revert()
      gsap.ticker.remove(ticker)
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <div className="hero-mobile-built-for">
        <span className="built-for-label-mobile">Built for</span>
        <div className="built-for-line-v"></div>
        <div className="built-for-h-viewport">
          <div className="built-for-h-track">
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
      <div className="built-for-divider"></div>
      <div className="built-for-viewport">
        <div className="built-for-track" ref={trackRef}>
          {TRIPLED.map((item, i) => (
            <div className="built-for-item" key={i}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

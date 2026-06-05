import useIsMobile from '../../hooks/useIsMobile'

const ITEMS = ['Agents', 'Agencies', 'FMOs', 'GAs', 'Clinics', 'Groups', 'MSOs']
const TRIPLED = [...ITEMS, ...ITEMS, ...ITEMS]

// Pure-CSS marquee — no GSAP. The desktop vertical loop and the mobile
// horizontal loop both run via CSS keyframes (`built-for-scroll-v` /
// `built-for-scroll` in Hero.css), each translating by exactly one ITEMS set so
// the repeat in TRIPLED makes the loop seamless (translate3d keeps the element
// on one compositor layer across the boundary — no 1-frame snap).
export default function BuiltForCarousel() {
  const isMobile = useIsMobile()

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
        <div className="built-for-track">
          {TRIPLED.map((item, i) => (
            <div className="built-for-item" key={i}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

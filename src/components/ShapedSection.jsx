import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

export default function ShapedSection() {
  const fade = useFadeIn()
  const isMobile = useIsMobile()

  return (
    <section className="shaped-section" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <h2 className="section-title">Shaped by real-world use</h2>
        <div className="shaped-photo">
          <img
            src={asset(isMobile ? 'assets/images/shaped-real-world-use.jpg' : 'assets/images/shaped-real-world.png')}
            alt="Real-world healthcare"
            loading="lazy"
          />
          <div className="shaped-overlay">
            <p className="shaped-overlay-text">
              From intake and scheduling to claims and follow-ups, every part reflects real operational needs – not assumptions. This isn&rsquo;t a top-down product. It&rsquo;s built from how care actually moves. Because the best systems aren&rsquo;t imagined. They&rsquo;re shaped by the people who rely on them.
            </p>
            <div className="shaped-overlay-badge">
              <img src={asset('assets/icons/near-logo.svg')} alt="" className="shaped-badge-icon" />
              <span>Designed alongside the people who<br />handle these workflows every day.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

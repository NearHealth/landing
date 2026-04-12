import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

const tickerItems = ['Vision', 'Dental', 'Medicare', 'ACA', 'Employer-sponsored']

export default function OnePlatform() {
  const fade = useFadeIn()
  const isMobile = useIsMobile()

  const renderTicker = () =>
    tickerItems.flatMap((item, i) => [
      <span className="ticker-item" key={`item-${i}`}>{item}</span>,
      <span className="ticker-dot" key={`dot-${i}`}>·</span>,
    ])

  return (
    <section className="one-platform" ref={fade.ref}>
      <div className={`container one-platform-inner ${fade.className}`}>
        <div className="platform-text">
          <h2 className="section-title">One platform.<br />All coverage.</h2>
          <p className="platform-subtitle">Supporting the coverage types brokers and providers work with every day.</p>
        </div>
        <div className="platform-phone">
          <picture>
            <source srcSet={asset(isMobile ? 'assets/images/one-platform-mobile.webp' : 'assets/images/one-platform-desktop.webp')} type="image/webp" />
            <img
              src={asset(isMobile ? 'assets/images/one-platform-mobile.jpg' : 'assets/images/one-platform-desktop.jpg')}
              alt="Near Health - Activate Care"
              loading="lazy"
              className="platform-phone-img"
            />
          </picture>
        </div>
      </div>
      <div className="coverage-ticker">
        <div className="ticker-track">
          {renderTicker()}
          {renderTicker()}
        </div>
      </div>
    </section>
  )
}

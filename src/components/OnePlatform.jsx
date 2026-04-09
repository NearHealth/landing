import { useFadeIn } from '../hooks/useScrollAnimation'

const tickerItems = ['Vision', 'Dental', 'Medicare', 'ACA', 'Employer-sponsored']

export default function OnePlatform() {
  const fade = useFadeIn()

  const renderTicker = () =>
    tickerItems.flatMap((item, i) => [
      <span className={`ticker-item${item === 'Medicare' ? '' : ' ticker-faded'}`} key={`item-${i}`}>{item}</span>,
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
          <img src="/assets/images/one-platform.png" alt="Near Health mobile app" loading="lazy" className="platform-phone-img" />
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

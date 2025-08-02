import { useFadeIn } from '../hooks/useScrollAnimation'

function CareCard({ title, subtitle, desc, imgAlt, bars }) {
  return (
    <div className="care-card">
      <div className="care-card-photo">
        <img src="/assets/images/care-journey.png" alt={imgAlt} loading="lazy" />
        <div className="care-card-overlay">
          <h3>{title}</h3>
          <span>{subtitle}</span>
        </div>
      </div>
      <div className="care-card-body">
        <div className="care-card-bars">
          {bars.map((w, i) => (
            <div className="bar" key={i}><span style={{ width: w }}></span></div>
          ))}
        </div>
        <div className="care-card-divider"></div>
        <p className="care-card-text">{desc}</p>
        <a href="#contact" className="care-card-cta">Learn more →</a>
      </div>
    </div>
  )
}

export default function CareJourney() {
  const fade = useFadeIn()

  return (
    <section className="care-journey" id="built-for" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="care-journey-header">
          <h2 className="section-title">Serving the full care journey</h2>
          <p className="section-subtitle">A coordinated path across brokers, providers, and members.</p>
        </div>
        <div className="care-cards">
          <CareCard
            title="For Brokers"
            subtitle="Agents · Agencies · FMOs · GAs"
            desc="Deliver post-enrollment support that truly scales - and focus on relationships, not operations."
            imgAlt="Broker using Near Health"
            bars={['90%', '75%', '55%']}
          />
          <CareCard
            title="For Providers"
            subtitle="Clinics · Groups · MSOs"
            desc="Turn access into growth by connecting you with the right patients, at the right moment."
            imgAlt="Provider using Near Health"
            bars={['95%', '80%', '70%']}
          />
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import SectionTitle from './ui/SectionTitle'
import { asset } from '../utils/assetPath'

const cards = [
  {
    title: 'For Brokers',
    subtitle: 'Agents · Agencies · FMOs · GAs',
    image: asset('assets/images/person1.jpg'),
    features: [
      'Reduce manual follow-ups and service workload.',
      'Improve member experience and retention.',
      'Coordinate care with visibility.',
    ],
    desc: 'Deliver post-enrollment support that truly scales - and focus on relationships, not operations.',
  },
  {
    title: 'For Providers',
    subtitle: 'Clinics · Groups · MSOs',
    image: asset('assets/images/person2.jpg'),
    features: [
      'Expand your reach through a trusted, AI-powered provider network.',
      'Gain visibility with high-intent patients and broker-driven referrals.',
      'Streamline intake and scheduling with better-prepared patients.',
    ],
    desc: 'Turn access into growth by connecting you with the right patients, at the right moment.',
  },
]

function CareCard({ card }) {
  const isMobile = useIsMobile()
  const [hovered, setHovered] = useState(false)
  const showLottie = isMobile || hovered

  return (
    <div
      className="care-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showLottie && (
        <DotLottieReact
          src={asset('assets/Hover_Gradient.json')}
          loop
          autoplay
          className="care-card-lottie"
          layout={{ fit: 'fill' }}
        />
      )}
      <div className="care-card-photo">
        <img src={card.image} alt={card.title} loading="lazy" />
        <div className="care-card-overlay">
          <h3>{card.title}</h3>
          <span>{card.subtitle}</span>
        </div>
      </div>
      <div className="care-card-body">
        <ul className="care-card-features">
          {card.features.map((f, j) => (
            <li key={j}>{f}</li>
          ))}
        </ul>
        <div className="care-card-divider"></div>
        <p className="care-card-text">{card.desc}</p>
        <a href="#contact" className="care-card-btn">Learn more</a>
      </div>
    </div>
  )
}

export default function CareJourney() {
  const fade = useFadeIn()

  return (
    <section className="care-journey" id="built-for" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <SectionTitle subtitle="A coordinated path across brokers, providers, and members." className="care-journey-header">
          Serving the full care journey
        </SectionTitle>
        <div className="care-cards">
          {cards.map((card, i) => (
            <CareCard key={i} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

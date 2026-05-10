import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import useIsMobile from '../../hooks/useIsMobile'
import SectionTitle from '../ui/SectionTitle/SectionTitle'
import { asset } from '../../utils/assetPath'
import './CareJourney.css'

const cards = [
  {
    title: 'For Brokers',
    subtitle: 'Agents · Agencies · FMOs · GAs',
    image: asset('assets/images/person1.jpg'),
    imageWebp: asset('assets/images/person1.webp'),
    features: [
      'Reduce manual follow-ups and service workload.',
      'Improve member experience and retention.',
      'Coordinate care with visibility.',
    ],
    desc: <>Deliver post-enrollment support that truly scales - and focus on<br />relationships, not operations.</>,
  },
  {
    title: 'For Providers',
    subtitle: 'Clinics · Groups · MSOs',
    image: asset('assets/images/person2.jpg'),
    imageWebp: asset('assets/images/person2.webp'),
    features: [
      'Expand your reach through a trusted, AI-powered provider network.',
      'Gain visibility with high-intent patients and broker-driven referrals.',
      'Streamline intake and scheduling with better-prepared patients.',
    ],
    desc: <>Turn access into growth by connecting you with the right patients, at<br />the right moment.</>,
  },
]

function CareCard({ card, refProp }) {
  const isMobile = useIsMobile()
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const cardRef = useRef(null)

  const lottieSrc = asset(isMobile
    ? 'assets/Hover_Gradient_Mobile.lottie'
    : 'assets/Hover_Gradient_Desktop.lottie'
  )

  // Desktop: fade in on hover
  useEffect(() => {
    if (isMobile || !mounted) return
    if (!hovered) { setVisible(false); return }
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [mounted, hovered, isMobile])

  // Mobile: show lottie when card scrolls into view
  useEffect(() => {
    if (!isMobile) return
    const el = cardRef.current
    if (!el) return

    let raf
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'bottom 15%',
      onToggle(self) {
        if (self.isActive) {
          setMounted(true)
          raf = requestAnimationFrame(() => setVisible(true))
        } else {
          cancelAnimationFrame(raf)
          setVisible(false)
        }
      },
    })

    return () => {
      cancelAnimationFrame(raf)
      st.kill()
    }
  }, [isMobile])

  const activate = () => {
    if (isMobile) return
    setMounted(true)
    setHovered(true)
  }
  const deactivate = () => {
    if (isMobile) return
    setHovered(false)
  }

  return (
    <div
      className="care-card"
      ref={(el) => {
        cardRef.current = el
        if (typeof refProp === 'function') refProp(el)
      }}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
    >
      {mounted && (
        <DotLottieReact
          src={lottieSrc}
          loop
          autoplay
          className={`care-card-lottie${visible ? ' is-visible' : ''}`}
          layout={{ fit: 'fill' }}
        />
      )}
      <div className="care-card-photo">
        <picture>
          <source srcSet={card.imageWebp} type="image/webp" />
          <img src={card.image} alt={card.title} loading="lazy" />
        </picture>
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
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const cardsRef = useRef([])

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      const cards = cardsRef.current.filter(Boolean)
      gsap.set(headerRef.current, { autoAlpha: 0 })
      gsap.set(cards, blockRevealFromVars())
      return [headerRef.current, ...cards]
    },
    animate: () => {
      const cards = cardsRef.current.filter(Boolean)
      const heading = headerRef.current.querySelector('.section-title')
      const subtitle = headerRef.current.querySelector('.section-subtitle')
      const headingSplit = splitLines(heading)
      const subtitleSplit = subtitle ? splitLines(subtitle) : null
      gsap.set(headerRef.current, { autoAlpha: 1 })

      gsap.from(headingSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(heading) })
      if (subtitleSplit) {
        gsap.from(subtitleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(subtitle) })
      }
      if (cards.length) {
        gsap.to(cards, {
          ...blockRevealVars({ stagger: 0.12 }),
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: selfTrigger(cards[0]),
        })
      }
    },
  })

  return (
    <section className="care-journey" id="built-for" ref={sectionRef}>
      <div className="container">
        <div ref={headerRef}>
          <SectionTitle subtitle="A coordinated path across brokers, providers, and members." className="care-journey-header">
            Serving the full care journey
          </SectionTitle>
        </div>
        <div className="care-cards">
          {cards.map((card, i) => (
            <CareCard
              key={i}
              card={card}
              refProp={(el) => { cardsRef.current[i] = el }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

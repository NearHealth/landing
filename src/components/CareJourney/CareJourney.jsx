import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import useIsMobile from '../../hooks/useIsMobile'
import SectionH2 from '../ui/SectionH2/SectionH2'
import { asset } from '../../utils/assetPath'
import { softVariants } from '../../utils/motion'
import './CareJourney.css'

// Motion entrance (scroll-triggered fade-up). Mirrors the old GSAP blockReveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
const cardsStagger = { visible: { transition: { staggerChildren: 0.12 } } }

const cards = [
  {
    title: 'For Brokers',
    subtitle: 'Agents · Agencies · FMOs · GAs',
    image: asset('assets/images/broker-desktop.jpg'),
    imageWebp: asset('assets/images/broker-desktop.webp'),
    imageMobile: asset('assets/images/broker-mobile.jpg'),
    features: [
      'Stay connected after enrollment',
      'Support clients faster',
      'Grow without service overload',
    ],
    desc: 'Deliver post-enrollment support that truly scales - and focus on relationships, not operations.',
  },
  {
    title: 'For Providers',
    subtitle: 'Clinics · Groups · MSOs',
    image: asset('assets/images/provider-desktop-overlay.jpg'),
    imageWebp: asset('assets/images/provider-desktop-overlay.webp'),
    imageMobile: asset('assets/images/provider-mobile.jpg'),
    features: [
      'Increase patient flow',
      'Reduce intake friction',
      'Improve care continuity',
    ],
    desc: 'Turn access into growth by connecting you with the right patients, at the right moment.',
  },
]

function CareCard({ card, variants }) {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const [active, setActive] = useState(false)
  const cardElRef = useRef(null)
  // Glow (pure CSS port of Hover_Gradient.lottie) renders on both layouts,
  // skipped only under reduced motion. Desktop drives it on hover; mobile has
  // no hover, so it activates while the card sits in the viewport instead.
  const showGlow = !reduce

  const onEnter = (showGlow && !isMobile) ? () => setActive(true) : undefined
  const onLeave = (showGlow && !isMobile) ? () => setActive(false) : undefined

  // Mobile: light the glow while the card is in view (mirrors the hover state).
  useEffect(() => {
    if (!showGlow || !isMobile) return
    const el = cardElRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [showGlow, isMobile])

  return (
    <motion.a ref={cardElRef} href="#contact" className="care-card" variants={variants} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div className="care-card-surface">
        {/* Glow — exact CSS port of Hover_Gradient.lottie. Two cyan spheres
            inside the surface clip (z-index 0), below content; fades in when
            active (hover on desktop, in-view on mobile). */}
        {showGlow && (
          <div className={`care-card-glow-css${active ? ' is-on' : ''}`} aria-hidden="true">
            <div className="gsphere gsphere--1" />
            <div className="gsphere gsphere--2" />
          </div>
        )}
        <div className="care-card-photo">
          <picture>
            <source srcSet={card.imageWebp} type="image/webp" />
            <img src={isMobile && card.imageMobile ? card.imageMobile : card.image} alt={card.title} loading="lazy" />
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
          {/* Space reserved; only the button's appearance animates on hover. */}
          <span className="care-card-btn">Learn more</span>
        </div>
      </div>
    </motion.a>
  )
}

export default function CareJourney() {
  const sectionRef = useRef(null)
  const reduce = useReducedMotion()

  // Equalize feature/text block heights across the two cards.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const equalize = () => {
      ;['.care-card-features', '.care-card-text'].forEach(sel => {
        const els = section.querySelectorAll(sel)
        els.forEach(el => { el.style.minHeight = '' })
        const max = Math.max(...Array.from(els).map(el => el.offsetHeight))
        els.forEach(el => { el.style.minHeight = `${max}px` })
      })
    }
    const ro = new ResizeObserver(equalize)
    ro.observe(section)
    equalize()
    return () => ro.disconnect()
  }, [])

  // Scroll-triggered entrance (fade-up); fade-only (no movement) under reduced motion.
  const inView = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 } }
  const itemVariants = softVariants(reduce, fadeUp)

  return (
    <section className="care-journey" id="built-for" ref={sectionRef}>
      <div className="container">
        <div className="care-journey-header">
          <SectionH2
            lines={['Enrollment got digital.', 'Care coordination didn’t.']}
            mobileLines={['Enrollment got digital.', 'Care coordination', 'didn’t.']}
            marginBottom={16}
            mobileMarginBottom={22}
          />
          <div className="care-journey-subtitle">
            <motion.p
              className="section-subtitle"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.6 }}
              variants={itemVariants}
            >
              Members struggle to use their coverage. Brokers lose visibility after enrollment. Providers face disconnected patient journeys.
            </motion.p>
          </div>
        </div>
        <motion.div
          className="care-cards"
          {...inView}
          variants={softVariants(reduce, cardsStagger)}
        >
          {cards.map((card, i) => (
            <CareCard key={i} card={card} variants={itemVariants} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { asset } from '../../utils/assetPath'
import { softVariants, fadeOnly } from '../../utils/motion'
import SectionH2 from '../ui/SectionH2/SectionH2'
import './ShapedSection.css'

const BADGE_TEXT_MOBILE = 'Designed alongside the people who handle these workflows every day.'
const BADGE_TEXT_DESKTOP = (
  <>The best systems are shaped by the<br />people who rely on them.</>
)

// Motion entrance (scroll-triggered fade-up). Replaces the GSAP line reveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
// Statement card: elements fade in top → bottom (text first, badge second).
const overlayStagger = { visible: { transition: { staggerChildren: 0.12 } } }
// The statement text builds up word-by-word so it reads as appearing line by line.
const textStagger = { visible: { transition: { staggerChildren: 0.04 } } }
const wordFadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const STATEMENT =
  'Near was created from direct exposure to the operational inefficiencies, fragmented systems, and coordination gaps across healthcare.'

export default function ShapedSection() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 480 : false
  )
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 480)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const reduce = useReducedMotion()

  return (
    <section className="shaped-section" id="shaped">
      <div className="container">
        <SectionH2
          lines={['Shaped by real-world use']}
          mobileLines={['Shaped by', 'real-world use']}
          marginBottom={32}
          mobileMarginBottom={16}
        />
        <div className="shaped-photo">
          <picture>
            {/* Mobile crop (380×665) below 480px, desktop crop (1440×725) above.
                Exports already match the card aspect, so plain object-fit: cover
                fills the frame edge-to-edge with no distortion. */}
            <source media="(max-width: 480px)" srcSet={asset('assets/images/shaped-mobile.jpg')} />
            <img
              src={asset('assets/images/shaped-desktop.jpg')}
              alt="Real-world healthcare"
              loading="lazy"
            />
          </picture>
          <motion.div
            className="shaped-overlay"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={softVariants(reduce, overlayStagger)}
          >
            {/* Under reduced motion: skip the per-word build and fade the whole
                statement in as one calm block (movement stripped). */}
            <motion.p className="shaped-overlay-text" variants={reduce ? fadeOnly(wordFadeUp) : textStagger}>
              {reduce
                ? STATEMENT
                : STATEMENT.split(' ').map((word, i) => (
                    <motion.span
                      key={i}
                      className="shaped-overlay-word"
                      variants={wordFadeUp}
                    >
                      {word}{' '}
                    </motion.span>
                  ))}
            </motion.p>
            <motion.div className="shaped-overlay-badge" variants={softVariants(reduce, fadeUp)}>
              <img src={asset('assets/icons/near-logo.svg')} alt="Near Health logo" className="shaped-badge-icon" />
              <span>
                {isMobile ? BADGE_TEXT_MOBILE : BADGE_TEXT_DESKTOP}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

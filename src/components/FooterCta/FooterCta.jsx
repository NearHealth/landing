import { motion, useReducedMotion } from 'motion/react'
import Button from '../ui/Button/Button'
import { usePlayInView } from '../../hooks/usePlayInView'
import { softVariants } from '../../utils/motion'
import { CONTACT_URL } from '../../constants/sections'
import './FooterCta.css'

// Motion entrance (scroll-triggered fade-up). Replaces the GSAP reveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function FooterCta() {
  const reduce = useReducedMotion()
  const [sectionRef, paused] = usePlayInView()
  const reveal = (amount = 0.5) =>
    ({ initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount }, variants: softVariants(reduce, fadeUp) })

  return (
    <section ref={sectionRef} className={`footer-cta${paused ? ' is-paused' : ''}`} id="contact">
      <div className="container">
        <motion.p className="footer-cta-text" {...reveal(0.6)}>Near brings coverage, care, and support together.</motion.p>
        <motion.div className="footer-cta-buttons" {...reveal(0.6)}>
          <Button variant="primary" href={CONTACT_URL.earlyAccess()}>Early access</Button>
          <Button variant="secondary" href={CONTACT_URL.talk()}>Talk to us</Button>
        </motion.div>
      </div>
    </section>
  )
}

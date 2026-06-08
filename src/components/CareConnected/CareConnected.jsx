import { motion, useReducedMotion } from 'motion/react'
import SectionH2 from '../ui/SectionH2/SectionH2'
import { usePlayInView } from '../../hooks/usePlayInView'
import { softVariants } from '../../utils/motion'
import './CareConnected.css'

// Motion entrance (scroll-triggered fade-up) on the container — kept off the
// card itself so it doesn't clash with the card's mobile scale transform.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function CareConnected() {
  const reduce = useReducedMotion()
  const [sectionRef, paused] = usePlayInView()
  const reveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.3 }, variants: softVariants(reduce, fadeUp) }

  return (
    <section ref={sectionRef} className={`care-connected${paused ? ' is-paused' : ''}`} id="care-connected">
      <motion.div className="container" {...reveal}>
        <div className="care-connected-card">
          {reduce ? (
            // Reduced motion: cheap static CSS gradient (no animation).
            <>
              <span className="cta-blob cta-blob--a" aria-hidden="true" />
              <span className="cta-blob cta-blob--b" aria-hidden="true" />
            </>
          ) : (
            // Exact CSS port of CTA_Gradient.lottie — two cyan spheres swirling
            // behind the headline (z-index 1), paused off-screen via .is-paused.
            <div className="cta-pill-glow" aria-hidden="true">
              <div className="cta-sphere cta-sphere--1" />
              <div className="cta-sphere cta-sphere--2" />
            </div>
          )}
          <SectionH2 lines={['Care, connected.']} marginBottom={0} mobileMarginBottom={0} />
        </div>
      </motion.div>
    </section>
  )
}

import { motion, useReducedMotion } from 'motion/react'
import { asset } from '../../utils/assetPath'
import { softVariants } from '../../utils/motion'
import SectionH2 from '../ui/SectionH2/SectionH2'
import './RealWorld.css'

const features = [
  { title: 'Secure by design',
    desc: (
      <>
        <span className="desktop-only">HIPAA &amp; SOC2 infrastructure for secure coordination.</span>
        <span className="mobile-only">HIPAA &amp; SOC2-conscious infrastructure with traceable workflows.</span>
      </>
    ),
    icon: <img src={asset('assets/images/shield-check.svg')} alt="Secure by design" width="32" height="32" /> },
  { title: 'Seamless integration', desc: 'Designed to fit existing broker and provider operations.',
    icon: <img src={asset('assets/images/seamless-integration.svg')} alt="Seamless integration" width="32" height="32" /> },
  { title: 'AI that drives action', desc: 'Text and voice experiences that move requests forward.',
    icon: <img src={asset('assets/images/star-four-fill.svg')} alt="AI that drives action" width="32" height="32" /> },
  { title: 'Built for scale', desc: 'From growing teams to complex operational networks.',
    icon: <img src={asset('assets/images/built-for-scale.svg')} alt="Built for scale" width="32" height="32" /> },
]

// Motion entrance (scroll-triggered, staggered fade-up). Replaces the GSAP reveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

export default function RealWorld() {
  const reduce = useReducedMotion()
  const gridReveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.3 }, variants: softVariants(reduce, stagger) }

  return (
    <section className="real-world" id="real-world">
      <div className="container">
        <SectionH2
          lines={['Designed for modern healthcare operations.']}
          mobileLines={['Designed for modern', 'healthcare operations.']}
          marginBottom={32}
          mobileMarginBottom={28}
        />
        <motion.div className="features-grid" {...gridReveal}>
          {features.map((f, i) => (
            <motion.div className="feature-card" key={i} variants={softVariants(reduce, fadeUp)}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

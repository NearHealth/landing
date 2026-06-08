import { motion, useReducedMotion } from 'motion/react'
import { asset } from '../../utils/assetPath'
import { softVariants } from '../../utils/motion'
import SectionH2 from '../ui/SectionH2/SectionH2'
import './PostEnrollment.css'

const audiences = [
  {
    icon: asset('assets/images/post-enrollment-brokers.svg'),
    title: 'Brokers',
    desc: 'Better retention through better support.',
  },
  {
    icon: asset('assets/images/post-enrollment-providers.svg'),
    title: 'Providers',
    desc: 'Reach patients already seeking care.',
  },
  {
    icon: asset('assets/images/post-enrollment-members.svg'),
    title: 'Members',
    desc: 'Navigate healthcare with clarity.',
  },
]

// Motion entrance (scroll-triggered, staggered fade-up). Replaces the GSAP reveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function PostEnrollment() {
  const reduce = useReducedMotion()
  const listReveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.3 }, variants: softVariants(reduce, stagger) }

  return (
    <section className="post-enrollment" id="why-near">
      <div className="container">
        <div className="post-glow" aria-hidden="true">
          <div className="post-glow-sphere post-glow-sphere--1" />
          <div className="post-glow-sphere post-glow-sphere--2" />
        </div>
        <SectionH2
          lines={['Designed for the', 'post-enrollment reality']}
          marginBottom={146}
          mobileMarginBottom={52}
        />
        <motion.div className="post-list" {...listReveal}>
          {audiences.map((a) => (
            <motion.div className="post-item" key={a.title} variants={softVariants(reduce, fadeUp)}>
              <div className="post-icon">
                <img src={a.icon} alt={`${a.title} icon`} width="26" height="26" />
              </div>
              <div className="post-item-body">
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

import { motion, useReducedMotion } from 'motion/react'
import Button from '../ui/Button/Button'
import SectionH2 from '../ui/SectionH2/SectionH2'
import ScrollPlayVideo from '../ui/ScrollPlayVideo/ScrollPlayVideo'
import { softVariants } from '../../utils/motion'
import './MemberExperience.css'

// Motion entrance (scroll-triggered fade-up). Replaces the GSAP reveal.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export default function MemberExperience() {
  const reduce = useReducedMotion()
  // Per-element scroll reveal; fade-only (no movement) under reduced motion.
  const reveal = (amount = 0.3) =>
    ({ initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount }, variants: softVariants(reduce, fadeUp) })

  return (
    <section className="member-experience" id="member-experience">
      <div className="container">
        <div className="member-header">
          <SectionH2
            lines={['Healthcare navigation,', 'simplified.']}
            marginBottom={0}
            mobileMarginBottom={32}
          />
          <motion.p className="member-desc" {...reveal(0.6)}>One AI-powered experience for benefits, care access, scheduling, and support.</motion.p>
        </div>
        <motion.div className="member-video-animate" {...reveal(0.15)}>
          <div className="member-video-wrap">
            <ScrollPlayVideo
              desktopWebm="assets/video/ai_chat_desktop.webm"
              mobileWebm="assets/video/ai_chat_mobile.webm"
              desktop="assets/video/ai_chat_desktop.mp4"
              mobile="assets/video/ai_chat_mobile.mp4"
              desktopPoster="assets/video/ai_chat_desktop_poster.jpg"
              mobilePoster="assets/video/ai_chat_mobile_poster.jpg"
              className="member-video"
            />
          </div>
        </motion.div>
        <div className="member-footer">
          <motion.p className="member-footer-text" {...reveal(0.6)}>Brokers and providers stay informed.</motion.p>
          <motion.div className="member-footer-btns" {...reveal(0.6)}>
            <Button variant="primary" href="#contact">Request a demo</Button>
            <Button variant="secondary" href="#contact">Talk to us</Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

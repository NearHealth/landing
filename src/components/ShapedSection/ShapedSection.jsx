import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, selfTrigger } from '../../utils/reveal'
import { asset } from '../../utils/assetPath'
import './ShapedSection.css'

export default function ShapedSection() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 480 : false
  )
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth <= 480)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const textRef = useRef(null)
  const badgeRef = useRef(null)

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      const targets = [badgeRef.current, textRef.current, titleRef.current].filter(Boolean)
      gsap.set(targets, { autoAlpha: 0 })
      return targets
    },
    animate: () => {
      const targets = [badgeRef.current, textRef.current, titleRef.current].filter(Boolean)
      const splits = targets.map((el) => splitLines(el))
      gsap.set(targets, { autoAlpha: 1 })

      targets.forEach((el, i) => {
        gsap.from(splits[i].lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(el) })
      })
    },
  })

  return (
    <section className="shaped-section" id="shaped" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title" ref={titleRef}>Shaped by<br className="mobile-br" /> real-world use</h2>
        <div className="shaped-photo" ref={cardRef}>
          <img
            src={asset(isMobile ? 'shaped-mobile.jpg' : 'shaped.jpg')}
            alt="Real-world healthcare"
            loading="lazy"
          />
          <div className="shaped-overlay">
            <p className="shaped-overlay-text" ref={textRef}>
              From intake and scheduling to<br className="mobile-br" />claims and follow-ups, every part<br className="mobile-br" />reflects real operational needs —<br className="mobile-br" />not assumptions. This isn&rsquo;t a top-<br className="mobile-br" />down product. It&rsquo;s built from how<br className="mobile-br" />care actually moves. Because the<br className="mobile-br" />best systems aren&rsquo;t imagined.<br className="mobile-br" />They&rsquo;re shaped by the people who<br className="mobile-br" />rely on them.
            </p>
            <div className="shaped-overlay-badge">
              <img src={asset('assets/icons/near-logo.svg')} alt="" className="shaped-badge-icon" />
              <span ref={badgeRef}>Designed alongside the people who<br />handle these workflows every day.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

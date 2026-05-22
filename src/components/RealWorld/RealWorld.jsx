import { useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import { asset } from '../../utils/assetPath'
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
    icon: <img src={asset('assets/images/plugs-fill.svg')} alt="Seamless integration" width="32" height="32" /> },
  { title: 'AI that drives action', desc: 'Text and voice experiences that move requests forward.',
    icon: <img src={asset('assets/images/star-four-fill.svg')} alt="AI that drives action" width="32" height="32" /> },
  { title: 'Built for scale', desc: 'From growing teams to complex operational networks.',
    icon: <img src={asset('assets/images/steps-fill.svg')} alt="Built for scale" width="32" height="32" /> },
]

export default function RealWorld() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const cardsRef = useRef([])

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      const cards = cardsRef.current.filter(Boolean)
      gsap.set(titleRef.current, { autoAlpha: 0 })
      gsap.set(cards, blockRevealFromVars())
      return [titleRef.current, ...cards]
    },
    animate: () => {
      const cards = cardsRef.current.filter(Boolean)
      const titleSplit = splitLines(titleRef.current)
      gsap.set(titleRef.current, { autoAlpha: 1 })

      gsap.from(titleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(titleRef.current) })
      if (cards.length) {
        gsap.to(cards, { ...blockRevealVars({ stagger: 0.1 }), scrollTrigger: selfTrigger(cards[0]) })
      }
    },
  })

  return (
    <section className="real-world" id="real-world" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title" ref={titleRef}>Designed for modern healthcare operations.</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              className="feature-card"
              key={i}
              ref={(el) => { cardsRef.current[i] = el }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

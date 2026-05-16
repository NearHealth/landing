import { useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import { asset } from '../../utils/assetPath'
import './RealWorld.css'

const features = [
  { title: 'HIPAA-compliant', desc: <>Secure, compliant infrastructure<br />with complete audit trails.</>,
    icon: <img src={asset('assets/images/hippa-compliant-icon.svg')} alt="" width="19" height="26" /> },
  { title: 'Role-based access', desc: 'Structured permissions across members, brokers, and providers.',
    icon: <img src={asset('assets/images/role-access.svg')} alt="" width="20" height="20" /> },
  { title: 'Deep integrations', desc: <>Scheduling, enrollment, and<br />plan data - fully connected.</>,
    icon: <img src={asset('assets/images/deep-integration.svg')} alt="" width="22" height="22" /> },
  { title: 'Multi-tenant ready', desc: 'Supports branded experiences across agencies and provider networks.',
    icon: <img src={asset('assets/images/Multi-tenant ready-icon.svg')} alt="" width="22" height="22" /> },
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
        <h2 className="section-title" ref={titleRef}>Built for real-world operations</h2>
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

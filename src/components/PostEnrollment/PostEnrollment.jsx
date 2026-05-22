import React, { useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'
import './PostEnrollment.css'

const audiences = [
  {
    icon: asset('assets/images/post-enrollment-brokers.svg'),
    title: 'Brokers',
    desc: 'Better retention through better support',
  },
  {
    icon: asset('assets/images/post-enrollment-providers.svg'),
    title: 'Providers',
    desc: 'Reach patients already seeking care',
  },
  {
    icon: asset('assets/images/post-enrollment-members.svg'),
    title: 'Members',
    desc: 'Navigate healthcare with clarity',
  },
]

export default function PostEnrollment() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const cardsRef = useRef([])
  const isMobile = useIsMobile()

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      const cards = cardsRef.current.filter(Boolean)
      gsap.set(titleRef.current, { autoAlpha: 0 })
      if (cards.length) gsap.set(cards, blockRevealFromVars())
      return [titleRef.current, ...cards]
    },
    animate: () => {
      const cards = cardsRef.current.filter(Boolean)
      const titleSplit = splitLines(titleRef.current)
      gsap.set(titleRef.current, { autoAlpha: 1 })

      gsap.from(titleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(titleRef.current) })
      if (cards.length) {
        gsap.to(cards, { ...blockRevealVars({ stagger: 0.08 }), scrollTrigger: selfTrigger(cards[0]) })
      }
    },
    deps: [isMobile],
  })

  return (
    <section className="post-enrollment" id="why-near" ref={sectionRef}>
      <div className="container">
        <div className="post-glow" aria-hidden="true"></div>
        <h2 className="section-title" ref={titleRef}>Designed for the<br />post-enrollment reality</h2>
        <div className="post-list">
          {audiences.map((a, i) => (
            <div
              className="post-item"
              key={a.title}
              ref={(el) => { cardsRef.current[i] = el }}
            >
              <div className="post-icon">
                <img src={a.icon} alt={`${a.title} icon`} width="26" height="26" />
              </div>
              <div className="post-item-body">
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

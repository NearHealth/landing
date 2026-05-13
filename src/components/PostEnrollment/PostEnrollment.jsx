import React, { useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'
import './PostEnrollment.css'

const features = [
  {
    icon: <img src={asset('assets/images/where-actually-begins-icon.svg')} alt="" width="20" height="20" />,
    title: 'Where care actually begins',
    desc: 'The moment where coverage turns into real needs.',
  },
  {
    icon: <img src={asset('assets/images/AI that moves care forward-icon.svg')} alt="" width="20" height="20" />,
    title: 'AI that moves care forward',
    desc: 'Resolves requests and turns intent into action.',
  },
  {
    icon: <img src={asset('assets/images/One connected flow-icon.svg')} alt="" width="20" height="20" />,
    title: 'One connected flow',
    desc: 'Members, brokers, and providers move in sync.',
  },
  {
    icon: <img src={asset('assets/images/Built to scale across networks.svg')} alt="" width="20" height="20" />,
    title: 'Built to scale across networks',
    desc: 'From individual teams to full ecosystems.',
  },
  {
    icon: <img src={asset('assets/images/integration-ready.svg')} alt="" width="20" height="20" />,
    title: 'Integration-ready',
    desc: 'Fits seamlessly into existing broker and provider workflows.',
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
      const dividers = sectionRef.current.querySelectorAll('.post-divider-v:not(.post-divider-hidden)')
      gsap.set(titleRef.current, { autoAlpha: 0 })
      if (cards.length) gsap.set(cards, blockRevealFromVars())
      if (dividers.length) gsap.set(dividers, { autoAlpha: 0 })
      return [titleRef.current, ...cards, ...dividers]
    },
    animate: () => {
      const cards = cardsRef.current.filter(Boolean)
      const dividers = sectionRef.current.querySelectorAll('.post-divider-v:not(.post-divider-hidden)')
      const titleSplit = splitLines(titleRef.current)
      gsap.set(titleRef.current, { autoAlpha: 1 })

      gsap.from(titleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(titleRef.current) })
      if (cards.length) {
        gsap.to(cards, { ...blockRevealVars({ stagger: 0.08 }), scrollTrigger: selfTrigger(cards[0]) })
      }
      if (dividers.length) {
        gsap.to(dividers, {
          autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06,
          scrollTrigger: selfTrigger(dividers[0]),
        })
      }
    },
    deps: [isMobile],
  })

  return (
    <section className="post-enrollment" id="why-near" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title" ref={titleRef}>Designed for the<br />post-enrollment reality</h2>
        {isMobile ? (
          <div className="post-list">
            {features.map((f, i) => (
              <div
                className="post-list-item"
                key={i}
                ref={(el) => { cardsRef.current[i] = el }}
              >
                <div className="post-list-header">
                  <div className="post-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                </div>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="post-grid">
              {features.slice(0, 3).map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="post-divider-v"></div>}
                  <div
                    className="post-col"
                    ref={(el) => { cardsRef.current[i] = el }}
                  >
                    <div className="post-icon">{f.icon}</div>
                    <div className="post-col-body">
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="post-grid post-grid-bottom">
              {features.slice(3).map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <div className="post-divider-v"></div>}
                  <div
                    className="post-col"
                    ref={(el) => { cardsRef.current[3 + i] = el }}
                  >
                    <div className="post-icon">{f.icon}</div>
                    <div className="post-col-body">
                      <h3>{f.title}</h3>
                      <p>{f.desc}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              <div className="post-divider-v post-divider-hidden"></div>
              <div className="post-col post-col-hidden"></div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

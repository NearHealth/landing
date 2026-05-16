import React, { useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'
import './PostEnrollment.css'

const features = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#pe-icon-clip)"><path d="M19.5312 4.93707L15.0632 0.468016C14.9146 0.319402 14.7382 0.201513 14.5441 0.121081C14.3499 0.0406501 14.1418 -0.000747681 13.9317 -0.000747681C13.7215 -0.000747681 13.5134 0.0406501 13.3193 0.121081C13.1251 0.201513 12.9487 0.319402 12.8002 0.468016L0.469013 12.8002C0.319791 12.9482 0.201484 13.1244 0.120969 13.3186C0.0404533 13.5127 -0.000663447 13.721 8.09504e-06 13.9312V18.4002C8.09504e-06 18.8246 0.168581 19.2315 0.468643 19.5316C0.768704 19.8317 1.17568 20.0002 1.60003 20.0002H6.06908C6.27927 20.0009 6.4875 19.9598 6.68167 19.8793C6.87583 19.7988 7.05205 19.6805 7.20009 19.5312L19.5312 7.20009C19.6798 7.05151 19.7977 6.87511 19.8782 6.68097C19.9586 6.48682 20 6.27873 20 6.06858C20 5.85843 19.9586 5.65034 19.8782 5.4562C19.7977 5.26205 19.6798 5.08565 19.5312 4.93707ZM16.0002 8.46811L11.5311 4.00006L13.9312 1.60003L18.4002 6.06808L16.0002 8.46811Z" fill="#5EE6FD"/></g><defs><clipPath id="pe-icon-clip"><rect width="20" height="20" fill="white"/></clipPath></defs></svg>,
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
        <h2 className="section-title" ref={titleRef}>Designed for the<br className="mobile-br" />post-enrollment<br className="mobile-br" /> reality</h2>
        {isMobile ? (
          <div className="post-list">
            {features.map((f, i) => (
              <div
                className="post-list-item"
                key={i}
                ref={(el) => { cardsRef.current[i] = el }}
              >
                <div className="post-icon">{f.icon}</div>
                <div className="post-list-body">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
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

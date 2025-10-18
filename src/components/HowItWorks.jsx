import { useEffect, useRef, useState } from 'react'
import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

const steps = [
  { title: 'Capture what matters', desc: 'Every request starts with real intent.', num: '01' },
  { title: 'Guide it forward', desc: 'Turning intent into clear next steps.', num: '02' },
  { title: 'Align everyone', desc: 'Members, brokers, and providers stay in sync.', num: '03' },
]

function CenterIcon({ delay = 0 }) {
  return (
    <div className="how-center-icon" style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      <div className="how-circle">
        <img src={asset('assets/icons/near-logo-coloured.svg')} alt="" className="how-circle-logo" />
      </div>
    </div>
  )
}

function StepCard({ title, desc, num, delay = 0, refProp }) {
  return (
    <div className="how-step-card" ref={refProp} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      <div className="how-step-top">
        <h3>{title}</h3>
        <span className="how-num">{num}</span>
      </div>
      <p>{desc}</p>
    </div>
  )
}

export default function HowItWorks() {
  const fade = useFadeIn()
  const isMobile = useIsMobile()
  const layoutRef = useRef(null)
  const card1Ref = useRef(null)
  const card2Ref = useRef(null)
  const card3Ref = useRef(null)
  const [curves, setCurves] = useState(null)

  useEffect(() => {
    if (isMobile) { setCurves(null); return }

    const compute = () => {
      const layout = layoutRef.current
      const c1 = card1Ref.current
      const c2 = card2Ref.current
      const c3 = card3Ref.current
      if (!layout || !c1 || !c2 || !c3) return

      const lb = layout.getBoundingClientRect()
      const r1 = c1.getBoundingClientRect()
      const r2 = c2.getBoundingClientRect()
      const r3 = c3.getBoundingClientRect()

      // All positions relative to layout top-left
      const x1 = r1.left - lb.left + r1.width / 2   // Card 01 bottom-center x
      const y1 = r1.bottom - lb.top                   // Card 01 bottom y
      const x2L = r2.left - lb.left                   // Card 02 left edge
      const y2 = r2.top - lb.top + r2.height / 2     // Card 02 vertical center
      const x2R = r2.right - lb.left                  // Card 02 right edge
      const x3 = r3.left - lb.left + r3.width / 2   // Card 03 bottom-center x
      const y3 = r3.bottom - lb.top                   // Card 03 bottom y

      const W = lb.width
      const H = lb.height

      // Left curve: Card01 bottom-center → Card02 left-middle
      // Figma shape: M0.5 0 C 0.5 85 69.45 154 154.5 154 H268.5
      // Ratios: control1=(0, 0.552h), control2=(0.259w, h), corner=(0.576w, h), end=(w, h)
      const lW = x2L - x1
      const lH = y2 - y1
      const left = `M ${x1} ${y1} C ${x1} ${y1 + lH * 0.552}, ${x1 + lW * 0.259} ${y2}, ${x1 + lW * 0.576} ${y2} L ${x2L} ${y2}`

      // Right curve: Card03 bottom-center → Card02 right-middle
      // Figma shape: M268 0 C 268 82.29 201.29 149 119 149 H0
      // Mirror of left: control1=(w, 0.552h), control2=(0.741w, h), corner=(0.444w, h), end=(0, h)
      const rW = x3 - x2R
      const rH = y2 - y3
      const right = `M ${x3} ${y3} C ${x3} ${y3 + rH * 0.552}, ${x3 - rW * 0.259} ${y2}, ${x3 - rW * 0.576} ${y2} L ${x2R} ${y2}`

      setCurves({ W, H, left, right })
    }

    let timer
    if (fade.visible) {
      // Cards animate translateY(16px)→0 over 0.6s — wait for them to settle before measuring
      timer = setTimeout(() => requestAnimationFrame(compute), 650)
    } else {
      requestAnimationFrame(() => requestAnimationFrame(compute))
    }

    window.addEventListener('resize', compute)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', compute)
    }
  }, [isMobile, fade.visible])

  return (
    <section className="how-it-works" id="how-it-works" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="how-header">
          <span className="how-label">How it works</span>
          <h2 className="section-title">From policy to care,<br />in a few steps</h2>
          <p className="how-desc">Near activates coverage by coordinating brokers, providers, and patients inside one structured system.</p>
        </div>

        {isMobile ? (
          <>
            <CenterIcon delay={0.1} />
            <div className="how-steps-row">
              {steps.map((s, i) => (
                <StepCard key={s.num} {...s} delay={0.15 + i * 0.1} />
              ))}
            </div>
          </>
        ) : (
          <div className="how-layout" ref={layoutRef}>
            <div className="how-steps-row">
              <StepCard {...steps[0]} delay={0.1} refProp={card1Ref} />
              <CenterIcon delay={0.2} />
              <StepCard {...steps[2]} delay={0.3} refProp={card3Ref} />
            </div>
            <div className="how-curves-row">
              <StepCard {...steps[1]} delay={0.4} refProp={card2Ref} />
            </div>
            {curves && (
              <svg
                className="how-curves"
                width={curves.W}
                height={curves.H}
                viewBox={`0 0 ${curves.W} ${curves.H}`}
                fill="none"
              >
                <path d={curves.left}  stroke="#0A1C1E" strokeWidth="1" strokeOpacity="0.2" />
                <path d={curves.right} stroke="#0A1C1E" strokeWidth="1" strokeOpacity="0.2" />
              </svg>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

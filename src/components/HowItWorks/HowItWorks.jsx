import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import { PRIMARY_EASE } from '../../utils/eases'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'
import './HowItWorks.css'

const steps = [
  { title: 'Capture what matters', desc: 'Every request starts with real intent.', num: '01' },
  { title: 'Guide it forward', desc: 'Turning intent into clear next steps.', num: '02' },
  { title: 'Align everyone', desc: 'Members, brokers, and providers stay in sync.', num: '03' },
]

function CenterIcon({ refProp }) {
  return (
    <div className="how-center-icon" ref={refProp}>
      <div className="how-circle">
        <img src={asset('assets/icons/near-logo-coloured.svg')} alt="" className="how-circle-logo" />
      </div>
    </div>
  )
}

function StepCard({ title, desc, num, refProp }) {
  return (
    <div className="how-step-card" ref={refProp}>
      <div className="how-step-top">
        <h3>{title}</h3>
        <span className="how-num">{num}</span>
      </div>
      <p>{desc}</p>
    </div>
  )
}

export default function HowItWorks() {
  const isMobile = useIsMobile()
  const sectionRef = useRef(null)
  const layoutRef = useRef(null)
  const labelRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const card1Ref = useRef(null)
  const card2Ref = useRef(null)
  const card3Ref = useRef(null)
  const centerIconRef = useRef(null)
  const svgRef = useRef(null)
  const leftPathRef = useRef(null)
  const rightPathRef = useRef(null)

  // Measure the connector geometry from layout offsets (transform-agnostic, so the
  // y:24 pre-reveal offset on cards doesn't pollute the curve targets).
  const writeCurves = useCallback(() => {
    const layout = layoutRef.current
    const c1 = card1Ref.current
    const c2 = card2Ref.current
    const c3 = card3Ref.current
    const svg = svgRef.current
    const lp = leftPathRef.current
    const rp = rightPathRef.current
    if (!layout || !c1 || !c2 || !c3 || !svg || !lp || !rp) return null

    const W = layout.offsetWidth
    const H = layout.offsetHeight
    const x1 = c1.offsetLeft + c1.offsetWidth / 2
    const y1 = c1.offsetTop + c1.offsetHeight
    const x2L = c2.offsetLeft
    const y2 = c2.offsetTop + c2.offsetHeight / 2
    const x2R = c2.offsetLeft + c2.offsetWidth
    const x3 = c3.offsetLeft + c3.offsetWidth / 2
    const y3 = c3.offsetTop + c3.offsetHeight

    // Card 01 bottom-center → Card 02 left-middle. Drawn in journey order (M = card1).
    const lW = x2L - x1
    const lH = y2 - y1
    const left = `M ${x1} ${y1} C ${x1} ${y1 + lH * 0.552}, ${x1 + lW * 0.259} ${y2}, ${x1 + lW * 0.576} ${y2} L ${x2L} ${y2}`

    // Card 02 right-middle → Card 03 bottom-center. Reversed from the symmetric form
    // so the dashoffset draw flows card2 → card3, matching the 01→02→03 reading.
    const rW = x3 - x2R
    const rH = y2 - y3
    const right = `M ${x2R} ${y2} L ${x3 - rW * 0.576} ${y2} C ${x3 - rW * 0.259} ${y2}, ${x3} ${y3 + rH * 0.552}, ${x3} ${y3}`

    svg.setAttribute('width', W)
    svg.setAttribute('height', H)
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
    lp.setAttribute('d', left)
    rp.setAttribute('d', right)
    return { lp, rp, leftLen: lp.getTotalLength(), rightLen: rp.getTotalLength() }
  }, [])

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      const text = [labelRef.current, titleRef.current, descRef.current]
      const blocks = [card1Ref.current, card2Ref.current, card3Ref.current, centerIconRef.current].filter(Boolean)
      const paths = [leftPathRef.current, rightPathRef.current].filter(Boolean)
      gsap.set(text, { autoAlpha: 0 })
      gsap.set(blocks, blockRevealFromVars())
      // Step 1 emerges from a smaller offset so it feels softer than the later steps.
      if (card1Ref.current) gsap.set(card1Ref.current, blockRevealFromVars({ y: 16 }))
      if (paths.length) gsap.set(paths, { autoAlpha: 0 })
      return [...text, ...blocks, ...paths]
    },
    animate: () => {
      const labelSplit = splitLines(labelRef.current)
      const titleSplit = splitLines(titleRef.current)
      const descSplit = splitLines(descRef.current)
      gsap.set([labelRef.current, titleRef.current, descRef.current], { autoAlpha: 1 })

      const curves = !isMobile ? writeCurves() : null
      if (curves) {
        gsap.set(curves.lp, { autoAlpha: 1, strokeDasharray: curves.leftLen, strokeDashoffset: curves.leftLen })
        gsap.set(curves.rp, { autoAlpha: 1, strokeDasharray: curves.rightLen, strokeDashoffset: curves.rightLen })
      }

      // Header lines — each piece triggers as its own element scrolls in.
      gsap.from(labelSplit.lines, { ...lineRevealVars({ stagger: 0.05 }), scrollTrigger: selfTrigger(labelRef.current) })
      gsap.from(titleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(titleRef.current) })
      gsap.from(descSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(descRef.current) })

      if (centerIconRef.current) {
        gsap.to(centerIconRef.current, { ...blockRevealVars({ stagger: 0 }), scrollTrigger: selfTrigger(centerIconRef.current) })
      }

      // Journey is a single composed sequence whose three card fades grow
      // progressively slower — each step takes longer to settle than the last,
      // so the sequence eases toward resolution rather than hitting a uniform beat.
      const journey = gsap.timeline({ scrollTrigger: selfTrigger(card1Ref.current) })
      const cardBase = { autoAlpha: 1, y: 0, ease: 'expo.out' }
      journey.to(card1Ref.current, { ...cardBase, duration: 0.5 })
      if (curves) journey.to(curves.lp, { strokeDashoffset: 0, duration: 0.45, ease: PRIMARY_EASE }, '-=0.2')
      journey.to(card2Ref.current, { ...cardBase, duration: 1.5 }, '-=0.2')
      if (curves) journey.to(curves.rp, { strokeDashoffset: 0, duration: 0.6, ease: PRIMARY_EASE }, '-=1.05')
      journey.to(card3Ref.current, { ...cardBase, duration: 2.6 }, '-=0.45')
    },
    deps: [isMobile],
  })

  useEffect(() => {
    if (isMobile) return
    // Always draw the connector geometry, even if useScrollReveal bailed for reduced motion.
    writeCurves()
    const onResize = () => writeCurves()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [isMobile, writeCurves])

  return (
    <section className="how-it-works" id="how-it-works" ref={sectionRef}>
      <div className="container">
        <div className="how-header">
          <span className="how-label" ref={labelRef}>How it works</span>
          <h2 className="section-title" ref={titleRef}>From policy to care,<br className="mobile-br" />in a few steps</h2>
          <p className="how-desc" ref={descRef}>Near activates coverage by coordinating brokers, providers, and patients inside one structured system.</p>
        </div>

        {isMobile ? (
          <>
            <CenterIcon refProp={centerIconRef} />
            <div className="how-steps-row">
              <StepCard {...steps[0]} refProp={card1Ref} />
              <StepCard {...steps[1]} refProp={card2Ref} />
              <StepCard {...steps[2]} refProp={card3Ref} />
            </div>
          </>
        ) : (
          <div className="how-layout" ref={layoutRef}>
            <div className="how-steps-row">
              <StepCard {...steps[0]} refProp={card1Ref} />
              <CenterIcon refProp={centerIconRef} />
              <StepCard {...steps[2]} refProp={card3Ref} />
            </div>
            <div className="how-curves-row">
              <StepCard {...steps[1]} refProp={card2Ref} />
            </div>
            <svg className="how-curves" ref={svgRef} fill="none">
              <path ref={leftPathRef}  stroke="#0A1C1E" strokeWidth="1" strokeOpacity="0.2" />
              <path ref={rightPathRef} stroke="#0A1C1E" strokeWidth="1" strokeOpacity="0.2" />
            </svg>
          </div>
        )}
      </div>
    </section>
  )
}

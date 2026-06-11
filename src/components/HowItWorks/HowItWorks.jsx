import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'
import { softVariants } from '../../utils/motion'
import SectionH2 from '../ui/SectionH2/SectionH2'
import './HowItWorks.css'

const steps = [
  { title: 'More clarity', desc: 'Coverage becomes easier to understand.', num: '01' },
  { title: 'Better access', desc: 'Care and support stay aligned.', num: '02' },
  { title: 'Less friction', desc: 'Healthcare feels easier to navigate.', num: '03' },
]

// Gentle ease-out (easeOutCubic) — soft deceleration, no abrupt snap.
const EASE = [0.33, 1, 0.68, 1]
// Sequenced reveal: card1 → left curve → card2 → right curve → card3 → logo (last).
// Tightened so the whole explanation resolves in ≲1.6s — keeps the left→right→
// connect→logo order, but clean and quick rather than illustrative.
const vText = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }
const vCard1 = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.7, ease: EASE } } }
const vCard2 = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.7, ease: EASE } } }
const vCard3 = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { delay: 0.6, duration: 0.7, ease: EASE } } }
// Curves draw just after their cards land.
const vLeftCurve = { hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { delay: 0.45, duration: 0.7, ease: EASE } } }
const vRightCurve = { hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1, transition: { delay: 0.8, duration: 0.7, ease: EASE } } }
// Logo appears LAST, as the culmination — a gentle fade + soft scale settle.
const vLogo = { hidden: { opacity: 0, scale: 0.92, y: 6 }, visible: { opacity: 1, scale: 1, y: 0, transition: { delay: 1.0, duration: 0.7, ease: EASE } } }
// Mobile: simple staggered fade-up.
const vItem = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }
const vStagger = { visible: { transition: { staggerChildren: 0.1 } } }

function CenterIcon({ variants }) {
  return (
    <motion.div className="how-center-icon" variants={variants}>
      <div className="how-circle">
        <img src={asset('assets/icons/near-logo-coloured.svg')} alt="Near Health logo" className="how-circle-logo" />
      </div>
    </motion.div>
  )
}

function StepCard({ title, desc, num, variants, cardRef }) {
  return (
    <motion.div className="how-step-card" variants={variants} ref={cardRef}>
      <div className="how-step-top">
        <h3>{title}</h3>
        <span className="how-num">{num}</span>
      </div>
      <p>{desc}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  const isMobile = useIsMobile()
  const reduce = useReducedMotion()
  const layoutRef = useRef(null)
  const card1Ref = useRef(null)
  const card2Ref = useRef(null)
  const card3Ref = useRef(null)
  const [curves, setCurves] = useState(null) // { w, h, left, right }

  // Measure connector geometry from layout offsets (transform-agnostic, so the
  // cards' entrance y-offset never pollutes the curve targets). motion.path
  // then animates pathLength to draw them.
  const writeCurves = useCallback(() => {
    const layout = layoutRef.current
    const c1 = card1Ref.current, c2 = card2Ref.current, c3 = card3Ref.current
    if (!layout || !c1 || !c2 || !c3) return
    const W = layout.offsetWidth, H = layout.offsetHeight
    const x1 = c1.offsetLeft + c1.offsetWidth / 2
    const y1 = c1.offsetTop + c1.offsetHeight
    const x2L = c2.offsetLeft
    const y2 = c2.offsetTop + c2.offsetHeight / 2
    const x2R = c2.offsetLeft + c2.offsetWidth
    const x3 = c3.offsetLeft + c3.offsetWidth / 2
    const y3 = c3.offsetTop + c3.offsetHeight
    // Card 01 bottom-center → Card 02 left-middle.
    const lW = x2L - x1, lH = y2 - y1
    const left = `M ${x1} ${y1} C ${x1} ${y1 + lH * 0.552}, ${x1 + lW * 0.259} ${y2}, ${x1 + lW * 0.576} ${y2} L ${x2L} ${y2}`
    // Card 02 right-middle → Card 03 bottom-center (reversed so it draws 02→03).
    const rW = x3 - x2R, rH = y2 - y3
    const right = `M ${x2R} ${y2} L ${x3 - rW * 0.576} ${y2} C ${x3 - rW * 0.259} ${y2}, ${x3} ${y3 + rH * 0.552}, ${x3} ${y3}`
    setCurves({ w: W, h: H, left, right })
  }, [])

  useLayoutEffect(() => {
    if (isMobile) { setCurves(null); return }
    writeCurves()
    window.addEventListener('resize', writeCurves)
    return () => window.removeEventListener('resize', writeCurves)
  }, [isMobile, writeCurves])

  // Containers always orchestrate; children fade-only (no movement) under reduced motion.
  const headerReveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.6 } }
  const layoutReveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.3 } }
  const mobileReveal = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.2 }, variants: softVariants(reduce, vStagger) }
  const v = (variants) => softVariants(reduce, variants)

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <motion.div className="how-header" {...headerReveal}>
          <motion.span className="how-label" variants={v(vText)}>How it works</motion.span>
          <SectionH2
            lines={['From coverage', 'to connected care.']}
            marginBottom={20}
            mobileMarginBottom={16}
          />
          <motion.p className="how-desc" variants={v(vText)}>Near helps make healthcare easier to understand, access, and navigate.</motion.p>
        </motion.div>

        {isMobile ? (
          <motion.div {...mobileReveal}>
            <CenterIcon variants={v(vItem)} />
            <div className="how-steps-row">
              <StepCard {...steps[0]} variants={v(vItem)} />
              <StepCard {...steps[1]} variants={v(vItem)} />
              <StepCard {...steps[2]} variants={v(vItem)} />
            </div>
          </motion.div>
        ) : (
          <motion.div className="how-layout" ref={layoutRef} {...layoutReveal}>
            <div className="how-steps-row">
              <StepCard {...steps[0]} variants={v(vCard1)} cardRef={card1Ref} />
              <CenterIcon variants={v(vLogo)} />
              <StepCard {...steps[2]} variants={v(vCard3)} cardRef={card3Ref} />
            </div>
            <div className="how-curves-row">
              <StepCard {...steps[1]} variants={v(vCard2)} cardRef={card2Ref} />
            </div>
            <svg
              className="how-curves" fill="none"
              width={curves?.w} height={curves?.h}
              viewBox={curves ? `0 0 ${curves.w} ${curves.h}` : undefined}
            >
              {curves && (
                <>
                  <motion.path d={curves.left} stroke="#0A1C1E" strokeWidth="1" strokeOpacity="0.2" variants={v(vLeftCurve)} />
                  <motion.path d={curves.right} stroke="#0A1C1E" strokeWidth="1" strokeOpacity="0.2" variants={v(vRightCurve)} />
                </>
              )}
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { softVariants } from '../../../utils/motion'
import './SectionH2.css'

// Line-mask reveal (was GSAP SplitText + ScrollTrigger). Each line slides up
// from y:100% behind its overflow-clipped mask and fades in, staggered.
// expo.out ≈ cubic-bezier(0.16, 1, 0.3, 1).
const headingV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const lineV = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
}

// Hoisted to module scope on purpose: a component defined inside SectionH2's
// render gets a fresh identity every render, so React would unmount/remount the
// lines whenever a parent re-renders (e.g. CareJourney churns `activeIndex` on
// every mobile scroll frame). Remounting resets the motion spans to `hidden`,
// and since the heading has scrolled out of the `whileInView` threshold by then,
// `once: true` never re-fires — so the heading vanishes after its reveal.
function Line({ text, animate, variants }) {
  return animate ? (
    <span className="nh-h2__mask">
      <motion.span className="nh-h2__line" variants={variants}>{text}</motion.span>
    </span>
  ) : (
    <span className="nh-h2__mask">
      <span className="nh-h2__line">{text}</span>
    </span>
  )
}

export default function SectionH2({
  lines,
  mobileLines,
  marginBottom = 16,
  mobileMarginBottom = 22,
}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  // Skip the reveal if the heading is already scrolled past at mount (e.g. a
  // reload that restored scroll mid-page) — otherwise whileInView would never
  // fire and the text would stay hidden. Invisible content above the fold so
  // the resulting state swap isn't seen.
  const [skip, setSkip] = useState(false)
  useLayoutEffect(() => {
    if (ref.current && ref.current.getBoundingClientRect().bottom < 0) setSkip(true)
  }, [])

  // Animate unless the heading was already scrolled past at mount. Under reduced
  // motion we still reveal — but fade-only (no upward slide behind the mask).
  const animate = !skip
  const lineVariants = softVariants(reduce, lineV)

  const baseLines = Array.isArray(lines) && lines.length ? lines : ['']
  const phoneLines = Array.isArray(mobileLines) && mobileLines.length ? mobileLines : null
  const classes = `nh-h2${phoneLines ? ' nh-h2--has-mobile-lines' : ''}`

  const orchestration = animate
    ? { initial: 'hidden', whileInView: 'visible', viewport: { once: true, amount: 0.35 }, variants: headingV }
    : {}

  return (
    <motion.h2
      ref={ref}
      className={classes}
      style={{
        '--nh-h2-mb': `${marginBottom}px`,
        '--nh-h2-mb-mobile': `${mobileMarginBottom}px`,
      }}
      {...orchestration}
    >
      <span className="nh-h2__set nh-h2__set--desktop">
        {baseLines.map((line, idx) => (
          <Line text={line} animate={animate} variants={lineVariants} key={`d-${idx}`} />
        ))}
      </span>
      {phoneLines && (
        <span className="nh-h2__set nh-h2__set--mobile">
          {phoneLines.map((line, idx) => (
            <Line text={line} animate={animate} variants={lineVariants} key={`m-${idx}`} />
          ))}
        </span>
      )}
    </motion.h2>
  )
}

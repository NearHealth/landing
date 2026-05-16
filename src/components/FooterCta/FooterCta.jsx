import { useRef } from 'react'
import gsap from 'gsap'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import Button from '../ui/Button/Button'
import './FooterCta.css'

export default function FooterCta() {
  const sectionRef = useRef(null)
  const textRef = useRef(null)
  const buttonsRef = useRef(null)

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      gsap.set(textRef.current, { autoAlpha: 0 })
      gsap.set(buttonsRef.current, blockRevealFromVars())
      return [textRef.current, buttonsRef.current]
    },
    animate: () => {
      const split = splitLines(textRef.current)
      gsap.set(textRef.current, { autoAlpha: 1 })

      gsap.from(split.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(textRef.current) })
      gsap.to(buttonsRef.current, { ...blockRevealVars({ stagger: 0 }), scrollTrigger: selfTrigger(buttonsRef.current) })
    },
  })

  return (
    <section className="footer-cta" id="contact" ref={sectionRef}>
      <div className="container">
        <p className="footer-cta-text" ref={textRef}>Near connects enrollment to care - across brokers and providers. If you&rsquo;re an agency or provider organization, we&rsquo;d love to connect.</p>
        <div className="footer-cta-buttons" ref={buttonsRef}>
          <Button variant="primary" href="#">Request a demo</Button>
          <Button variant="secondary" href="#">Talk to us</Button>
        </div>
      </div>
    </section>
  )
}

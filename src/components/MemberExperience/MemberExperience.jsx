import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { splitLines, lineRevealVars, blockRevealVars, blockRevealFromVars, selfTrigger } from '../../utils/reveal'
import Button from '../ui/Button/Button'
import SectionTitle from '../ui/SectionTitle/SectionTitle'
import ScrollPlayVideo from '../ui/ScrollPlayVideo/ScrollPlayVideo'
import './MemberExperience.css'

gsap.registerPlugin(ScrollTrigger)

export default function MemberExperience() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const videoRef = useRef(null)
  const footerTextRef = useRef(null)
  const footerBtnsRef = useRef(null)

  useScrollReveal({
    scopeRef: sectionRef,
    prepare: () => {
      const text = [titleRef.current, descRef.current, footerTextRef.current]
      const blocks = [videoRef.current, footerBtnsRef.current]
      gsap.set(text, { autoAlpha: 0 })
      gsap.set(blocks, blockRevealFromVars())
      return [...text, ...blocks]
    },
    animate: () => {
      const titleSplit = splitLines(titleRef.current)
      const descSplit = splitLines(descRef.current)
      const footerTextSplit = splitLines(footerTextRef.current)
      gsap.set([titleRef.current, descRef.current, footerTextRef.current], { autoAlpha: 1 })

      gsap.from(titleSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(titleRef.current) })
      gsap.from(descSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(descRef.current) })
      gsap.to(videoRef.current, { ...blockRevealVars({ stagger: 0 }), scrollTrigger: selfTrigger(videoRef.current) })
      gsap.from(footerTextSplit.lines, { ...lineRevealVars(), scrollTrigger: selfTrigger(footerTextRef.current) })
      gsap.to(footerBtnsRef.current, { ...blockRevealVars({ stagger: 0 }), scrollTrigger: selfTrigger(footerBtnsRef.current) })
    },
  })

  return (
    <section className="member-experience" id="member-experience" ref={sectionRef}>
      <div className="container">
        <div className="member-header">
          <div ref={titleRef}>
            <SectionTitle>What your members experience</SectionTitle>
          </div>
          <p className="member-desc" ref={descRef}>Members can interact via chat or voice for everyday questions after enrollment. Near takes over the request, keeps brokers in the loop, and routes care when needed.</p>
        </div>
        <div className="member-video-animate" ref={videoRef}>
          <div className="member-video-wrap">
            <ScrollPlayVideo
              desktop="assets/AI_Chat_Desktop.mp4"
              mobile="assets/AI_Chat_Mobile.mp4"
              desktopPoster="assets/AI_Chat_Desktop_poster.jpg"
              mobilePoster="assets/AI_Chat_Mobile_poster.jpg"
              className="member-video"
            />
          </div>
        </div>
        <div className="member-footer">
          <p className="member-footer-text" ref={footerTextRef}>Brokers and providers stay informed</p>
          <div className="member-footer-btns" ref={footerBtnsRef}>
            <Button variant="primary" href="#contact">Request a demo</Button>
            <Button variant="secondary" href="#contact">Talk to us</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

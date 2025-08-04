import { useState, useEffect } from 'react'
import { useFadeIn } from '../hooks/useScrollAnimation'
import Button from './ui/Button'
import SectionTitle from './ui/SectionTitle'

export default function MemberExperience() {
  const fade = useFadeIn()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  return (
    <section className="member-experience" id="member-experience" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="member-header">
          <SectionTitle>What your members<br />experience</SectionTitle>
          <p className="member-desc">Members can interact via chat or voice for everyday questions after enrollment. Near takes over the request, keeps brokers in the loop, and routes care when needed.</p>
        </div>
        <div className="member-video-wrap">
          <video autoPlay muted loop playsInline className="member-video">
            <source src={isMobile ? '/assets/AI Chat_Mobile.mp4' : '/assets/AI Chat_Desktop.mp4'} type="video/mp4" />
          </video>
        </div>
        <div className="member-footer">
          <p className="member-footer-text">Brokers and providers stay informed</p>
          <div className="member-footer-btns">
            <Button variant="primary" href="#contact">Request a demo</Button>
            <Button variant="secondary" href="#contact">Talk to us</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

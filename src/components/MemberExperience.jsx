import { useFadeIn } from '../hooks/useScrollAnimation'
import Button from './ui/Button'
import SectionTitle from './ui/SectionTitle'
import ResponsiveVideo from './ui/ResponsiveVideo'

export default function MemberExperience() {
  const fade = useFadeIn()

  return (
    <section className="member-experience" id="member-experience" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="member-header">
          <SectionTitle>What your members<br />experience</SectionTitle>
          <p className="member-desc">Members can interact via chat or voice for everyday questions after enrollment. Near takes over the request, keeps brokers in the loop, and routes care when needed.</p>
        </div>
        <div className="member-video-wrap">
          <ResponsiveVideo
            desktop="assets/AI Chat_Desktop.mp4"
            mobile="assets/AI Chat_Mobile.mp4"
            desktopWebm="assets/AI Chat_Desktop.webm"
            mobileWebm="assets/AI Chat_Mobile.webm"
            scrollPlay
            className="member-video"
          />
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

import { useFadeIn } from '../hooks/useScrollAnimation'

export default function MemberExperience() {
  const fade = useFadeIn()

  return (
    <section className="member-experience" id="member-experience" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="member-header">
          <h2 className="section-title">What your members<br />experience</h2>
          <p className="member-desc">Members can interact via chat or voice for everyday questions after enrollment. Near takes over the request, keeps brokers in the loop, and routes care when needed.</p>
        </div>
        <div className="member-video-wrap">
          <video autoPlay muted loop playsInline className="member-video">
            <source src="/assets/AI Chat_Desktop.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="member-footer">
          <p className="member-footer-text">Brokers and providers stay informed</p>
          <div className="member-footer-btns">
            <a href="#contact" className="btn btn-primary">Request a demo</a>
            <a href="#contact" className="btn btn-secondary">Talk to us</a>
          </div>
        </div>
      </div>
    </section>
  )
}

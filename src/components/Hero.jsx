import useIsMobile from '../hooks/useIsMobile'
import ResponsiveVideo from './ui/ResponsiveVideo'
import BuiltForCarousel from './BuiltForCarousel'

export default function Hero() {
  const isMobile = useIsMobile()

  return (
    <section className="hero" id="hero">
      <div className="container hero-container">
        {isMobile ? (
          /* ── Mobile layout ── */
          <>
            <div className="hero-mobile-top">
              <h1 className="hero-heading hero-heading--mobile">Turning<br />coverage<br />into care</h1>
              <p className="hero-subtitle hero-subtitle--mobile">Where everything connects –<br />and care actually moves.</p>
              <div className="hero-buttons hero-buttons--mobile">
                <a href="#contact" className="btn btn--primary">Request a demo</a>
                <a href="#contact" className="btn btn--secondary">Talk to us</a>
              </div>
            </div>
            <BuiltForCarousel />
            <div className="hero-mobile-video">
              <ResponsiveVideo desktop="assets/Hero_Desktop.mp4" mobile="assets/Hero_Mobile.mp4" desktopWebm="assets/Hero_Desktop.webm" mobileWebm="assets/Hero_Mobile.webm" />
            </div>
          </>
        ) : (
          /* ── Desktop layout ── */
          <>
            <div className="hero-top-row">
              <h1 className="hero-heading">Turning coverage<br />into care</h1>
              <BuiltForCarousel />
            </div>
            <div className="hero-bottom-row">
              <div className="hero-left">
                <p className="hero-subtitle">Near coordinates care after enrolment without adding operational burden.</p>
                <div className="hero-buttons">
                  <a href="#contact" className="btn btn--primary">Request a demo</a>
                  <a href="#contact" className="btn btn--secondary">Talk to us</a>
                </div>
              </div>
              <div className="hero-video-card">
                <ResponsiveVideo desktop="assets/Hero_Desktop.mp4" mobile="assets/Hero_Mobile.mp4" desktopWebm="assets/Hero_Desktop.webm" mobileWebm="assets/Hero_Mobile.webm" />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

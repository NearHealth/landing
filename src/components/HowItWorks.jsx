import { useFadeIn } from '../hooks/useScrollAnimation'

export default function HowItWorks() {
  const fade = useFadeIn()

  return (
    <section className="how-it-works" id="how-it-works" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="how-header">
          <span className="how-label">How it works</span>
          <h2 className="section-title">From policy to care,<br />in a few steps</h2>
          <p className="how-desc">Near activates coverage by coordinating brokers, providers, and patients inside one structured system.</p>
        </div>
        <div className="how-steps-row">
          <div className="how-step-card">
            <div className="how-step-top">
              <h3>Capture what matters</h3>
              <span className="how-num">01</span>
            </div>
            <p>Every request starts with real intent.</p>
          </div>

          <div className="how-arrow how-arrow-down">
            <svg width="268" height="154" viewBox="0 0 268 154" fill="none">
              <path d="M0 10 C80 10, 120 144, 268 144" stroke="#0A1C1E" strokeWidth="1.5" strokeDasharray="5 5" />
              <path d="M258 138 L268 144 L258 150" stroke="#0A1C1E" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="how-center-icon">
            <div className="how-circle">
              <img src="/assets/icons/near-logo.svg" alt="" className="how-circle-logo" />
            </div>
          </div>

          <div className="how-arrow how-arrow-up">
            <svg width="268" height="154" viewBox="0 0 268 154" fill="none">
              <path d="M0 144 C80 144, 120 10, 268 10" stroke="#0A1C1E" strokeWidth="1.5" strokeDasharray="5 5" />
              <path d="M258 4 L268 10 L258 16" stroke="#0A1C1E" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          <div className="how-step-card">
            <div className="how-step-top">
              <h3>Align everyone</h3>
              <span className="how-num">03</span>
            </div>
            <p>Members, brokers, and providers stay in sync.</p>
          </div>
        </div>
        <div className="how-step-center-row">
          <div className="how-step-card">
            <div className="how-step-top">
              <h3>Guide it forward</h3>
              <span className="how-num">02</span>
            </div>
            <p>Turning intent into clear next steps.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

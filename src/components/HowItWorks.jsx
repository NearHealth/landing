import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

const steps = [
  { title: 'Capture what matters', desc: 'Every request starts with real intent.', num: '01' },
  { title: 'Guide it forward', desc: 'Turning intent into clear next steps.', num: '02' },
  { title: 'Align everyone around it', desc: 'Members, brokers, and providers stay in sync.', num: '03' },
]

function CenterIcon() {
  return (
    <div className="how-center-icon">
      <div className="how-circle">
        <img src={asset('assets/icons/near-logo-coloured.svg')} alt="" className="how-circle-logo" />
      </div>
    </div>
  )
}

function StepCard({ title, desc, num }) {
  return (
    <div className="how-step-card">
      <div className="how-step-top">
        <h3>{title}</h3>
        <span className="how-num">{num}</span>
      </div>
      <p>{desc}</p>
    </div>
  )
}

export default function HowItWorks() {
  const fade = useFadeIn()
  const isMobile = useIsMobile()

  return (
    <section className="how-it-works" id="how-it-works" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="how-header">
          <span className="how-label">How it works</span>
          <h2 className="section-title">From policy to care,<br />in a few steps</h2>
          <p className="how-desc">Near activates coverage by coordinating brokers, providers, and patients inside one structured system.</p>
        </div>

        {isMobile ? (
          /* Mobile: center icon + vertical timeline */
          <>
            <CenterIcon />
            <div className="how-steps-row">
              {steps.map((s) => (
                <StepCard key={s.num} {...s} />
              ))}
            </div>
          </>
        ) : (
          /* Desktop: horizontal with arrows */
          <>
            <div className="how-steps-row">
              <StepCard {...steps[0]} />

              <div className="how-arrow how-arrow-down">
                <svg width="268" height="154" viewBox="0 0 268 154" fill="none">
                  <path d="M0 10 C80 10, 120 144, 268 144" stroke="#0A1C1E" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M258 138 L268 144 L258 150" stroke="#0A1C1E" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              <CenterIcon />

              <div className="how-arrow how-arrow-up">
                <svg width="268" height="154" viewBox="0 0 268 154" fill="none">
                  <path d="M0 144 C80 144, 120 10, 268 10" stroke="#0A1C1E" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M258 4 L268 10 L258 16" stroke="#0A1C1E" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              <StepCard {...steps[2]} />
            </div>
            <div className="how-step-center-row">
              <StepCard {...steps[1]} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

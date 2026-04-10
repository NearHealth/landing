import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

const steps = [
  { title: 'Capture what matters', desc: 'Every request starts with real intent.', num: '01' },
  { title: 'Guide it forward', desc: 'Turning intent into clear next steps.', num: '02' },
  { title: 'Align everyone around it', desc: 'Members, brokers, and providers stay in sync.', num: '03' },
]

function CenterIcon({ delay = 0 }) {
  return (
    <div className="how-center-icon" style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      <div className="how-circle">
        <img src={asset('assets/icons/near-logo-coloured.svg')} alt="" className="how-circle-logo" />
      </div>
    </div>
  )
}

function StepCard({ title, desc, num, delay = 0 }) {
  return (
    <div className="how-step-card" style={delay ? { transitionDelay: `${delay}s` } : undefined}>
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
            <CenterIcon delay={0.1} />
            <div className="how-steps-row">
              {steps.map((s, i) => (
                <StepCard key={s.num} {...s} delay={0.15 + i * 0.1} />
              ))}
            </div>
          </>
        ) : (
          /* Desktop: horizontal with arrows */
          <>
            <div className="how-steps-row">
              <StepCard {...steps[0]} delay={0.1} />

              <div className="how-arrow how-arrow-down" style={{ transitionDelay: '0.15s' }}>
                <svg width="268" height="154" viewBox="0 0 268 154" fill="none">
                  <path d="M0 10 C80 10, 120 144, 268 144" stroke="#0A1C1E" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M258 138 L268 144 L258 150" stroke="#0A1C1E" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              <CenterIcon delay={0.2} />

              <div className="how-arrow how-arrow-up" style={{ transitionDelay: '0.25s' }}>
                <svg width="268" height="154" viewBox="0 0 268 154" fill="none">
                  <path d="M0 144 C80 144, 120 10, 268 10" stroke="#0A1C1E" strokeWidth="1.5" strokeDasharray="5 5" />
                  <path d="M258 4 L268 10 L258 16" stroke="#0A1C1E" strokeWidth="1.5" fill="none" />
                </svg>
              </div>

              <StepCard {...steps[2]} delay={0.3} />
            </div>
            <div className="how-step-center-row">
              <StepCard {...steps[1]} delay={0.4} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

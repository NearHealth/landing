import { useFadeIn } from '../hooks/useScrollAnimation'
import { asset } from '../utils/assetPath'

const features = [
  { title: 'HIPAA-compliant', desc: 'Secure, compliant infrastructure with complete audit trails.',
    icon: <img src={asset('assets/images/hippa-compliant-icon.svg')} alt="" width="19" height="26" /> },
  { title: 'Role-based access', desc: 'Structured permissions across members, brokers, and providers.',
    icon: <img src={asset('assets/images/role-access.svg')} alt="" width="20" height="20" /> },
  { title: 'Deep integrations', desc: 'Scheduling, enrollment, and plan data - fully connected.',
    icon: <img src={asset('assets/images/deep-integration.svg')} alt="" width="22" height="22" /> },
  { title: 'Multi-tenant ready', desc: 'Supports branded experiences across agencies and provider networks.',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="5" width="8" height="12" rx="1" stroke="#0A1C1E" strokeWidth="2"/><rect x="13" y="5" width="8" height="12" rx="1" stroke="#0A1C1E" strokeWidth="2"/><path d="M9 11h4" stroke="#0A1C1E" strokeWidth="2"/></svg> },
]

export default function RealWorld() {
  const fade = useFadeIn()

  return (
    <section className="real-world" id="real-world" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <h2 className="section-title" style={{ transitionDelay: '0s' }}>Built for real-world operations</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{ transitionDelay: `${0.1 + i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

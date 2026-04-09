import { useFadeIn } from '../hooks/useScrollAnimation'

const features = [
  { title: 'HIPAA-compliant', desc: 'Secure, compliant infrastructure with complete audit trails.',
    icon: <svg width="17" height="23" viewBox="0 0 17 23" fill="none"><rect x="1" y="1" width="15" height="21" rx="2" stroke="#0A1C1E" strokeWidth="2"/><path d="M5 5h7M5 9h7M5 13h4" stroke="#0A1C1E" strokeWidth="1.5"/><circle cx="8.5" cy="18" r="1.5" fill="#0A1C1E"/></svg> },
  { title: 'Role-based access', desc: 'Structured permissions across members, brokers, and providers.',
    icon: <svg width="18" height="19" viewBox="0 0 18 19" fill="none"><circle cx="9" cy="7" r="4" stroke="#0A1C1E" strokeWidth="2"/><path d="M1 18c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#0A1C1E" strokeWidth="2"/></svg> },
  { title: 'Deep integrations', desc: 'Scheduling, enrollment, and plan data - fully connected.',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="6" cy="6" r="3" stroke="#0A1C1E" strokeWidth="2"/><circle cx="16" cy="6" r="3" stroke="#0A1C1E" strokeWidth="2"/><circle cx="6" cy="16" r="3" stroke="#0A1C1E" strokeWidth="2"/><circle cx="16" cy="16" r="3" stroke="#0A1C1E" strokeWidth="2"/><path d="M9 6h4M6 9v4M16 9v4M9 16h4" stroke="#0A1C1E" strokeWidth="1.5"/></svg> },
  { title: 'Multi-tenant ready', desc: 'Supports branded experiences across agencies and provider networks.',
    icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="1" y="5" width="8" height="12" rx="1" stroke="#0A1C1E" strokeWidth="2"/><rect x="13" y="5" width="8" height="12" rx="1" stroke="#0A1C1E" strokeWidth="2"/><path d="M9 11h4" stroke="#0A1C1E" strokeWidth="2"/></svg> },
]

export default function RealWorld() {
  const fade = useFadeIn()

  return (
    <section className="real-world" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <h2 className="section-title">Built for real-world operations</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
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

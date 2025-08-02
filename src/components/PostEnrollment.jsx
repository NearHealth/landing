import React from 'react'
import { useFadeIn } from '../hooks/useScrollAnimation'

const features = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="#5EE6FD" strokeWidth="2"/><path d="M6 10h8M10 6v8" stroke="#5EE6FD" strokeWidth="2"/></svg>,
    title: 'Where care actually begins',
    desc: 'The moment where coverage turns into real needs.',
  },
  {
    icon: <svg width="20" height="18" viewBox="0 0 20 18" fill="none"><path d="M1 9l6 6L19 1" stroke="#5EE6FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: 'AI that moves care forward',
    desc: 'Resolves requests and turns intent into action.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1" y="1" width="8" height="8" rx="1" stroke="#5EE6FD" strokeWidth="2"/><rect x="11" y="1" width="8" height="8" rx="1" stroke="#5EE6FD" strokeWidth="2"/><rect x="1" y="11" width="8" height="8" rx="1" stroke="#5EE6FD" strokeWidth="2"/><rect x="11" y="11" width="8" height="8" rx="1" stroke="#5EE6FD" strokeWidth="2"/></svg>,
    title: 'One connected flow',
    desc: 'Members, brokers, and providers move in sync.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1v18M1 10h18" stroke="#5EE6FD" strokeWidth="2"/><circle cx="10" cy="10" r="9" stroke="#5EE6FD" strokeWidth="2"/></svg>,
    title: 'Built to scale across networks',
    desc: 'From individual teams to full ecosystems.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="6" stroke="#5EE6FD" strokeWidth="2"/><circle cx="13" cy="13" r="6" stroke="#5EE6FD" strokeWidth="2"/><circle cx="13" cy="13" r="3" fill="#5EE6FD"/></svg>,
    title: 'Integration-ready',
    desc: 'Fits seamlessly into existing broker and provider workflows.',
  },
]

export default function PostEnrollment() {
  const fade = useFadeIn()

  return (
    <section className="post-enrollment" id="why-near" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <h2 className="section-title">Designed for the<br />post-enrollment reality</h2>
        <div className="post-grid">
          {features.slice(0, 3).map((f, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="post-divider-v"></div>}
              <div className="post-col">
                <div className="post-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="post-grid post-grid-bottom">
          {features.slice(3).map((f, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="post-divider-v"></div>}
              <div className="post-col">
                <div className="post-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </React.Fragment>
          ))}
          <div className="post-divider-v post-divider-hidden"></div>
          <div className="post-col post-col-hidden"></div>
        </div>
      </div>
    </section>
  )
}

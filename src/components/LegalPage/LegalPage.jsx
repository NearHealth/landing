import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import { asset } from '../../utils/assetPath'
import { CONTACT_URL } from '../../constants/sections'
import './LegalPage.css'

// Shared layout for the standalone legal pages (Terms of Service, Privacy
// Policy). REUSES the landing page's background (.site-bg), header (<Navbar/>)
// and footer (<Footer/>) — nothing is recreated. Content (identical at every
// breakpoint) is driven by props; the layout differs only by viewport: desktop
// shows the "On this page" TOC + 64px H1 in a two-column row, mobile collapses
// to a single 48px-H2 column (TOC hidden via CSS).
//
// `sections` is an array of { id, title, blocks }, where each block is a
// paragraph (string), a bullet list (string[]), or a contact line
// ({ contact: 'lead-in text…' }) rendered with a mailto link.

const CONTACT_EMAIL = 'hello@near.health'

function Block({ block }) {
  if (Array.isArray(block)) {
    return (
      <ul className="legal-list">
        {block.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    )
  }
  if (block && typeof block === 'object' && block.contact) {
    return (
      <p>
        {block.contact}{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    )
  }
  return <p>{block}</p>
}

export default function LegalPage({ title, lastUpdated, intro, sections }) {
  return (
    <>
      {/* Same full-document background <img> as the landing page (App.jsx). */}
      <img className="site-bg" src={asset('assets/images/site-bg.jpg')} alt="" aria-hidden="true" />
      {/* Navbar + its three blend/blur siblings must keep this exact order so
          Navbar.css's `.navbar--hidden ~ …` slide-up selectors hit them. */}
      <Navbar standalone />
      <div className="navbar-blur" aria-hidden="true" />
      <div className="navbar-edge" aria-hidden="true" />
      <a href={CONTACT_URL.earlyAccess()} className="navbar-cta-fixed">Early access</a>

      <main className="legal">
        <div className="legal-inner">
          <header className="legal-header">
            <p className="legal-eyebrow">LEGAL</p>
            <h1 className="legal-title">{title}</h1>
            <p className="legal-updated">Last updated: {lastUpdated}</p>
            <div className="legal-intro">
              {intro.map((text, i) => <p key={i}>{text}</p>)}
            </div>
          </header>

          <div className="legal-body">
            <nav className="legal-toc" aria-label="On this page">
              <p className="legal-toc-label">ON THIS PAGE</p>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                ))}
              </ul>
            </nav>

            <div className="legal-sections">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="legal-section">
                  <h2>{s.title}</h2>
                  {s.blocks.map((block, i) => <Block key={i} block={block} />)}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

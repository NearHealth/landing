import Markdown from 'react-markdown'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import { asset } from '../../utils/assetPath'
import { CONTACT_URL } from '../../constants/sections'
import './LegalPage.css'

// Shared layout for the standalone legal pages (Terms of Service, Privacy
// Policy). REUSES the landing page's background (.site-bg), header (<Navbar/>)
// and footer (<Footer/>) — nothing is recreated. Content comes from a Markdown
// file (see ../../content/legal/*.md) parsed by parseLegal() into:
//   { title, lastUpdated, intro, sections: [{ id, title, body }] }
// where `intro` and each section `body` are raw Markdown rendered with
// react-markdown. The page header (eyebrow / 64px H1 / last-updated) spans the
// full width; below it a two-column row holds the content on the left (intro +
// sections) and a sticky "On this page" TOC on the right (hidden on mobile).

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
          </header>

          <div className="legal-body">
            <div className="legal-content">
              {intro && (
                <div className="legal-intro">
                  <Markdown>{intro}</Markdown>
                </div>
              )}

              <div className="legal-sections">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="legal-section">
                    <h2>{s.title}</h2>
                    <Markdown>{s.body}</Markdown>
                  </section>
                ))}
              </div>
            </div>

            <nav className="legal-toc" aria-label="On this page">
              <p className="legal-toc-label">ON THIS PAGE</p>
              <ul>
                {sections.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

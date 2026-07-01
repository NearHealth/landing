import { useEffect, useState } from 'react'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import ContactForm from '../ContactForm/ContactForm'
import { asset } from '../../utils/assetPath'
import { CONTACT_URL } from '../../constants/sections'
import './ContactPage.css'

// Standalone /contact page: the landing shell (site-bg + Navbar + Footer) + an
// intent-driven hero + the reusable <ContactForm/>. The hero title/subtitle and the
// form's submit label are chosen by the ?intent= query param so one page serves both
// CTAs (see CONTACT_URL in constants/sections.js):
//   ?intent=early-access  → "Get early access"   (the relabelled "Request a demo")
//   ?intent=talk          → "Talk to Us"
// On success the hero + form fade out together and a "Thank you" panel fades in with
// a button and a countdown that redirects to the homepage. Submission is simulated at
// this call site (the real endpoint is wired here later); ?fail=1 forces the
// system-error path for QA.

const INTENTS = {
  'early-access': {
    title: 'Get early access',
    titleMobile: 'Get early access to Near.',
    subtitle: 'Tell us a bit about your organization so we can \nunderstand your interest and keep you updated as \nNear moves toward launch.',
    submitLabel: 'Submit interest',
  },
  talk: {
    title: 'Talk to Us',
    subtitle: "Tell us a bit about your organization and how\nyou'd like to connect with Near.",
    submitLabel: 'Send message',
  },
}
const DEFAULT_INTENT = 'early-access'

// The landing home page lives at the app base path (e.g. /landing/).
const HOME_URL = import.meta.env.BASE_URL
const REDIRECT_SECONDS = 8

function getIntentKey() {
  if (typeof window === 'undefined') return DEFAULT_INTENT
  const param = new URLSearchParams(window.location.search).get('intent')
  return INTENTS[param] ? param : DEFAULT_INTENT
}

function shouldSimulateFail() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('fail') === '1'
}

// Stand-in for the real backend call. Resolves after a short delay (success) or
// rejects when ?fail=1 (the form's system-error path). Replace with a real fetch()
// to the contact endpoint once it exists — ContactForm only needs a Promise.
function simulateSubmit() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldSimulateFail()) reject(new Error('Simulated submission failure'))
      else resolve({ ok: true })
    }, 900)
  })
}

// Post-submit panel: thank-you message, a manual "back to home" button, and a
// live countdown that auto-redirects to the homepage.
function ContactThanks() {
  const [count, setCount] = useState(REDIRECT_SECONDS)
  useEffect(() => {
    if (count <= 0) { window.location.href = HOME_URL; return }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  return (
    <div className="contact-thanks" role="status">
      <h1>Thank you.</h1>
      <p>We received your request and our team will be in touch soon.</p>
      <a className="contact-thanks__btn" href={HOME_URL}>Back to home</a>
      <p className="contact-thanks__timer" aria-live="polite">
        Redirecting to the homepage in {count}s…
      </p>
    </div>
  )
}

export default function ContactPage() {
  const intentKey = getIntentKey()
  const intent = INTENTS[intentKey]
  const [phase, setPhase] = useState('form') // 'form' | 'leaving' | 'done'

  // Keep the browser tab title in sync with the intent (the static HTML ships the
  // early-access default; this overrides it client-side for the talk variant).
  useEffect(() => {
    document.title = `${intent.title} — Near Health`
  }, [intent.title])

  // On a successful submit, fade the hero + form out, then swap in the thank-you.
  function handleSuccess() {
    setPhase('leaving')
    setTimeout(() => setPhase('done'), 420) // matches the .contact-page__content fade
  }

  return (
    <>
      {/* Same full-document background <img> as the landing + legal pages. */}
      <img className="site-bg" src={asset('assets/images/site-bg.jpg')} alt="" aria-hidden="true" />
      {/* Navbar + its three blend/blur siblings must keep this exact order so
          Navbar.css's `.navbar--hidden ~ …` slide-up selectors hit them. */}
      <Navbar standalone />
      <div className="navbar-blur" aria-hidden="true" />
      <div className="navbar-edge" aria-hidden="true" />
      <a href={CONTACT_URL.earlyAccess()} className="navbar-cta-fixed">Early access</a>

      <main className="contact-page">
        {phase === 'done' ? (
          <ContactThanks />
        ) : (
          <div className={`contact-page__content${phase === 'leaving' ? ' is-leaving' : ''}`}>
            <div className="contact-hero">
              {/* Desktop/mobile titles swap via CSS so the mobile copy can differ
                  (e.g. early-access reads "Get early access to Near."). */}
              <h1>
                <span className="contact-hero__title-desktop">{intent.title}</span>
                <span className="contact-hero__title-mobile">{intent.titleMobile || intent.title}</span>
              </h1>
              <p>{intent.subtitle.split('\n').reduce((acc, line, i) =>
                i === 0 ? [line] : [...acc, <br key={i} className="contact-hero__subtitle-break" />, line], []
              )}</p>
            </div>

            <div className="contact-page__form">
              <ContactForm onSubmit={simulateSubmit} onSuccess={handleSuccess} submitLabel={intent.submitLabel} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}

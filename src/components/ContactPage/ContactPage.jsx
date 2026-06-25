import { useEffect, useState } from 'react'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import { asset } from '../../utils/assetPath'
import { CONTACT_URL } from '../../constants/sections'
import './ContactPage.css'

// Standalone contact-form page. REUSES the landing page's background (.site-bg),
// header (<Navbar standalone/>) and footer (<Footer/>) — same shell as LegalPage.
// The form itself is a React port of the Near-Contact-Form.html prototype: the two
// custom dropdowns, the leading-icon collapse, inline validation, the spinner and
// the success swap are all driven by state (no DOM manipulation in effects).
//
// The hero title/subtitle are chosen by the `intent` query param so a single page
// serves both CTAs (see CONTACT_URL in constants/sections.js):
//   ?intent=early-access  → "Get early access"   (the relabelled "Request a demo")
//   ?intent=talk          → "Talk to Us"
const INTENTS = {
  'early-access': {
    title: 'Get early access',
    // Mobile wraps to a shorter, fuller phrase per Figma (Mobile H2).
    titleMobile: 'Get early access to Near.',
    subtitle: 'Tell us a bit about your organization so we can understand your interest and keep you updated as Near moves toward launch.',
  },
  talk: {
    title: 'Talk to Us',
    subtitle: "Tell us a bit about your organization and how you'd like to connect with Near.",
  },
}
const DEFAULT_INTENT = 'early-access'

function getIntentKey() {
  if (typeof window === 'undefined') return DEFAULT_INTENT
  const param = new URLSearchParams(window.location.search).get('intent')
  return INTENTS[param] ? param : DEFAULT_INTENT
}

/* ---- Dropdown data (ported verbatim from the prototype) ---- */
const ORG_TYPES = [
  'Broker', 'Agency', 'FMO / IMO', 'Provider', 'Clinic',
  'MSO', 'Healthcare Organization', 'Investor / Advisor', 'Strategic Partner', 'Other',
]
const GROUP_OF = {
  'Broker': 'A', 'Agency': 'A', 'FMO / IMO': 'A',
  'Provider': 'B', 'Clinic': 'B', 'MSO': 'B', 'Healthcare Organization': 'B',
  'Investor / Advisor': 'C', 'Strategic Partner': 'C',
  'Other': 'D',
}
const GROUPS = {
  A: ['Early access', 'Broker / Agency partnership', 'Learn about post-enrollment support', 'Platform or product inquiry', 'Strategic partnership', 'Other'],
  B: ['Early access', 'Provider / Clinic partnership', 'Learn about patient referrals', 'Platform or product inquiry', 'Strategic partnership', 'Other'],
  C: ['Investment inquiry', 'Strategic partnership', 'Product overview', 'General inquiry', 'Other'],
  D: ['General inquiry', 'Platform or product inquiry', 'Strategic partnership', 'Other'],
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TEXT_FIELDS = [
  { id: 'first',   placeholder: 'First name',   msg: 'Please enter your first name', icon: UserIcon },
  { id: 'last',    placeholder: 'Last name',    msg: 'Please enter your last name',  icon: UserIcon },
  { id: 'email',   placeholder: 'email',        msg: 'Please enter your email',      icon: MailIcon, email: true, type: 'email' },
  { id: 'company', placeholder: 'Company name', msg: 'Please enter your company name', icon: BuildingIcon },
]

// Demo toggle: add ?fail=1 to simulate a failed submission (system-error state).
function shouldSimulateFail() {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('fail') === '1'
}

/* ---- Leading-field icons ---- */
function UserIcon() {
  return <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>
}
function MailIcon() {
  return <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
}
function BuildingIcon() {
  return <svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21v-4h6v4" /><path d="M8 7h2M8 11h2M14 7h2M14 11h2" /></svg>
}
function NoteIcon() {
  return <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-4 3v-3H4z" /></svg>
}
function CheckIcon() {
  return <svg className="check" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
}
function ChevronIcon() {
  return <svg className="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
}

function TextField({ field, value, error, onChange, onBlur }) {
  const Icon = field.icon
  const hasText = value.trim().length > 0
  return (
    <div className={`field-group${error ? ' invalid' : ''}`}>
      <div className={`field${hasText ? ' has-text' : ''}`}>
        <Icon />
        <input
          id={field.id}
          type={field.type || 'text'}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.id, e.target.value)}
          onBlur={() => onBlur(field.id)}
        />
      </div>
      <div className="err">{error || ''}</div>
    </div>
  )
}

function Dropdown({ placeholder, value, options, open, disabled, error, onToggle, onSelect }) {
  return (
    <div className={`select-wrap${error ? ' invalid' : ''}`}>
      <div
        className={`select${open ? ' open' : ''}${value ? ' has-value' : ''}${disabled ? ' disabled' : ''}`}
        onClick={(e) => { e.stopPropagation(); if (!disabled) onToggle() }}
      >
        <span className="label">{value || placeholder}</span>
        <ChevronIcon />
      </div>
      <div className={`options${open ? ' open' : ''}`}>
        {options.map((opt) => (
          <div
            key={opt}
            className={`opt${opt === value ? ' selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); onSelect(opt) }}
          >
            <CheckIcon />
            <span>{opt}</span>
          </div>
        ))}
      </div>
      <div className="err">{error || ''}</div>
    </div>
  )
}

export default function ContactPage() {
  const intentKey = getIntentKey()
  const intent = INTENTS[intentKey]

  const [fields, setFields] = useState({ first: '', last: '', email: '', company: '', message: '' })
  const [errors, setErrors] = useState({})
  const [orgValue, setOrgValue] = useState(null)
  const [intValue, setIntValue] = useState(null)
  const [orgOpen, setOrgOpen] = useState(false)
  const [intOpen, setIntOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [systemError, setSystemError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [attempted, setAttempted] = useState(false)

  // Keep the browser tab title in sync with the intent (the static HTML ships the
  // early-access default; this overrides it client-side for the talk variant).
  useEffect(() => {
    document.title = `${intent.title} — Near Health`
  }, [intent.title])

  // Click anywhere outside an open dropdown closes it. Each select/option handler
  // stopPropagation()s, so clicks on the controls themselves don't trigger this.
  useEffect(() => {
    const closeAll = () => { setOrgOpen(false); setIntOpen(false) }
    document.addEventListener('click', closeAll)
    return () => document.removeEventListener('click', closeAll)
  }, [])

  const interestOptions = orgValue ? GROUPS[GROUP_OF[orgValue]] : []

  function fieldError(id, value) {
    const f = TEXT_FIELDS.find((x) => x.id === id)
    const val = value.trim()
    if (!val) return f.msg
    if (f.email && !EMAIL_RE.test(val)) return 'Please enter a valid email address'
    return undefined
  }

  function computeErrors() {
    const e = {}
    for (const f of TEXT_FIELDS) {
      const msg = fieldError(f.id, fields[f.id])
      if (msg) e[f.id] = msg
    }
    if (!orgValue) e.org = 'Please select your organization type'
    if (!intValue) e.interested = 'Please select an option'
    return e
  }

  function handleChange(id, value) {
    setFields((prev) => ({ ...prev, [id]: value }))
    // Clear/refresh this field's error live once it already has one (§8.1).
    if (errors[id]) {
      const msg = fieldError(id, value)
      setErrors((prev) => {
        const next = { ...prev }
        if (msg) next[id] = msg; else delete next[id]
        return next
      })
    }
  }

  function handleBlur(id) {
    if (!errors[id]) return
    const msg = fieldError(id, fields[id])
    setErrors((prev) => {
      const next = { ...prev }
      if (msg) next[id] = msg; else delete next[id]
      return next
    })
  }

  function selectOrg(value) {
    setOrgValue(value)
    setOrgOpen(false)
    // Reset + re-enable the dependent "interested in" dropdown (§7 rules 2 & 3).
    setIntValue(null)
    setErrors((prev) => { const n = { ...prev }; delete n.org; delete n.interested; return n })
  }

  function selectInterest(value) {
    setIntValue(value)
    setIntOpen(false)
    setErrors((prev) => { const n = { ...prev }; delete n.interested; return n })
  }

  function toggleOrg() { setIntOpen(false); setOrgOpen((o) => !o) }
  function toggleInterest() { setOrgOpen(false); setIntOpen((o) => !o) }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = computeErrors()
    setErrors(errs)
    setAttempted(true)
    if (Object.keys(errs).length > 0) {
      const firstInvalid = TEXT_FIELDS.find((f) => errs[f.id])
      if (firstInvalid) document.getElementById(firstInvalid.id)?.focus({ preventScroll: false })
      return
    }
    setSystemError(false) // clear any previous failure before retrying
    setSubmitting(true)
    // TODO: replace this simulated round-trip with a real API call (POST the form
    // payload to the backend, then show success / system-error from the response).
    setTimeout(() => {
      if (shouldSimulateFail()) { // POST failed → keep values, re-enable, show error
        setSubmitting(false)
        setSystemError(true)
        return
      }
      setSubmitting(false)
      setSubmitted(true)
    }, 900)
  }

  const showSummary = attempted && Object.keys(errors).length > 0
  const messageHasText = fields.message.trim().length > 0

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
        {submitted ? (
          <div className="contact-success">
            <h1>Thank you.</h1>
            <p>We received your request and our team will be in touch soon.</p>
          </div>
        ) : (
          <>
            <div className="contact-hero">
              {/* Desktop/mobile titles swap via CSS so the mobile copy can differ
                  (e.g. early-access reads "Get early access to Near."). When an
                  intent has no mobile-specific title, both spans show the same text. */}
              <h1>
                <span className="contact-hero__title-desktop">{intent.title}</span>
                <span className="contact-hero__title-mobile">{intent.titleMobile || intent.title}</span>
              </h1>
              <p>{intent.subtitle}</p>
            </div>

            <div className="form-wrap">
              <form className="form-card" noValidate onSubmit={handleSubmit}>
                <div className="row">
                  <TextField field={TEXT_FIELDS[0]} value={fields.first} error={errors.first} onChange={handleChange} onBlur={handleBlur} />
                  <TextField field={TEXT_FIELDS[1]} value={fields.last} error={errors.last} onChange={handleChange} onBlur={handleBlur} />
                </div>
                <TextField field={TEXT_FIELDS[2]} value={fields.email} error={errors.email} onChange={handleChange} onBlur={handleBlur} />
                <TextField field={TEXT_FIELDS[3]} value={fields.company} error={errors.company} onChange={handleChange} onBlur={handleBlur} />

                <Dropdown
                  placeholder="Organization type"
                  value={orgValue}
                  options={ORG_TYPES}
                  open={orgOpen}
                  error={errors.org}
                  onToggle={toggleOrg}
                  onSelect={selectOrg}
                />

                <Dropdown
                  placeholder={orgValue ? 'Select an option' : "I'm interested in (select your organization type first)"}
                  value={intValue}
                  options={interestOptions}
                  open={intOpen}
                  disabled={!orgValue}
                  error={errors.interested}
                  onToggle={toggleInterest}
                  onSelect={selectInterest}
                />

                <div className={`field area${messageHasText ? ' has-text' : ''}`}>
                  <NoteIcon />
                  <textarea
                    placeholder="Tell us about your organization (Optional)"
                    value={fields.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                  />
                </div>

                <div className="submit-area">
                  <button className={`btn-submit${submitting ? ' loading' : ''}`} type="submit">Submit Request</button>
                  <div className={`form-error-summary${showSummary ? ' show' : ''}`}>Please complete the required fields.</div>
                  <div className={`form-system-error${systemError ? ' show' : ''}`}>
                    <svg viewBox="0 0 24 24"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    <span>Something went wrong. Please try again.</span>
                  </div>
                  <div className="legal">By submitting, you agree to Near&rsquo;s Privacy Policy.</div>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  )
}

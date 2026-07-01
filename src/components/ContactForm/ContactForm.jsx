import { useEffect, useRef, useState } from 'react'
import {
  TextField, SelectField, TextareaField, SubmitButton, LegalNote,
  UserIcon, MailIcon, BuildingIcon, NoteIcon, WarnIcon,
} from '../ui/form'
import './ContactForm.css'

// Reusable, atom-composed contact form. Owns all field state, inline validation,
// the Organization→Partnership dependency, the submit lifecycle (loading → success
// / system-error) and a honeypot. Submission is injected via `onSubmit(payload)`
// (returns a Promise) — no endpoint is hard-coded, so each page wires its own.
// Layout/atoms are page-agnostic; the hero lives on the page, not here.
//
// Props:
//   onSubmit(payload) => Promise   resolve → success; reject → system error
//   onSuccess()                    optional — called on a successful submit so a
//                                  page can own the success UI (hide hero, redirect,
//                                  …). When provided, the form does NOT render its
//                                  own success swap; without it, it shows the default.
//   submitLabel                    button text (default "Send message")

// Local + domain are dot-separated non-empty segments — so consecutive dots
// ("a@b..c"), a leading/trailing dot, or a dot right next to "@" are all rejected,
// and the domain must carry at least one dot (a TLD).
const EMAIL_RE = /^[^\s@.]+(\.[^\s@.]+)*@[^\s@.]+(\.[^\s@.]+)+$/

const TEXT_FIELDS = [
  { id: 'first',   label: 'First name',   required: true,  icon: UserIcon,     autoComplete: 'given-name',  msg: 'Please enter your first name' },
  { id: 'last',    label: 'Last name',    required: true,  icon: UserIcon,     autoComplete: 'family-name', msg: 'Please enter your last name' },
  { id: 'email',   label: 'Email',        required: true,  icon: MailIcon,     type: 'email', inputMode: 'email', autoComplete: 'email', email: true, msg: 'Please enter your email' },
  { id: 'company', label: 'Company name', required: false, icon: BuildingIcon, autoComplete: 'organization' },
]

// Dropdown data — carried verbatim from the original ContactPage prototype.
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

const SUBMIT_ORDER = [...TEXT_FIELDS.map((f) => f.id), 'organizationType', 'partnershipType']

export default function ContactForm({ onSubmit, onSuccess, submitLabel = 'Send message' }) {
  // A successful submit (or a dropped honeypot) hands off to the page's onSuccess
  // when provided, otherwise falls back to the form's own success swap.
  const succeed = () => { if (onSuccess) onSuccess(); else setSubmitted(true) }
  const [fields, setFields] = useState({ first: '', last: '', email: '', company: '', message: '', honeypot: '' })
  const [organizationType, setOrganizationType] = useState(null)
  const [partnershipType, setPartnershipType] = useState(null)
  const [orgOpen, setOrgOpen] = useState(false)
  const [intOpen, setIntOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [systemError, setSystemError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Time-to-fill anchor for the honeypot meta — stamped once on first render.
  const mountedAt = useRef(null)
  if (mountedAt.current === null) mountedAt.current = Date.now()

  // A click anywhere outside an open dropdown closes it. The trigger/option
  // handlers stopPropagation() so clicks on the controls don't trip this.
  useEffect(() => {
    const closeAll = () => { setOrgOpen(false); setIntOpen(false) }
    document.addEventListener('click', closeAll)
    return () => document.removeEventListener('click', closeAll)
  }, [])

  const partnershipOptions = organizationType ? GROUPS[GROUP_OF[organizationType]] : []

  function fieldError(id, value) {
    const f = TEXT_FIELDS.find((x) => x.id === id)
    if (!f) return undefined // optional fields (e.g. message) have no validation
    const val = (value ?? '').trim()
    if (f.required && !val) return f.msg
    if (f.email && val && !EMAIL_RE.test(val)) return 'Please enter a valid email address'
    return undefined
  }

  function computeErrors() {
    const e = {}
    for (const f of TEXT_FIELDS) {
      const msg = fieldError(f.id, fields[f.id])
      if (msg) e[f.id] = msg
    }
    if (!organizationType) e.organizationType = 'Please select your organization type'
    // Partnership depends on org — only flag it once an org type has been chosen,
    // otherwise the org error is the one actionable message.
    else if (!partnershipType) e.partnershipType = 'Please select a partnership type'
    return e
  }

  function setOrClear(id, msg) {
    setErrors((prev) => {
      const next = { ...prev }
      if (msg) next[id] = msg; else delete next[id]
      return next
    })
  }

  function handleChange(id, value) {
    setFields((prev) => ({ ...prev, [id]: value }))
    // Live-clear/refresh a field's error once it already has one (checklist §2).
    if (errors[id]) setOrClear(id, fieldError(id, value))
  }

  // Validate on blur (checklist §3) — show the error when leaving an invalid field.
  function handleBlur(id) {
    setOrClear(id, fieldError(id, fields[id]))
  }

  function selectOrg(value) {
    setOrganizationType(value)
    setOrgOpen(false)
    setPartnershipType(null) // reset the dependent dropdown
    setErrors((prev) => { const n = { ...prev }; delete n.organizationType; delete n.partnershipType; return n })
  }
  function selectPartnership(value) {
    setPartnershipType(value)
    setIntOpen(false)
    setOrClear('partnershipType', undefined)
  }
  function toggleOrg() { setIntOpen(false); setOrgOpen((o) => !o) }
  function togglePartnership() { setOrgOpen(false); setIntOpen((o) => !o) }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = computeErrors()
    setErrors(errs)
    setAttempted(true)
    if (Object.keys(errs).length > 0) {
      const firstId = SUBMIT_ORDER.find((id) => errs[id])
      if (firstId) document.getElementById(firstId)?.focus({ preventScroll: false })
      return
    }
    // Honeypot: a filled hidden field means a bot — silently drop (no onSubmit).
    if (fields.honeypot.trim()) { succeed(); return }

    setSystemError(false)
    setSubmitting(true)
    const payload = {
      first: fields.first.trim(),
      last: fields.last.trim(),
      email: fields.email.trim(),
      company: fields.company.trim(),
      organizationType,
      partnershipType,
      message: fields.message.trim(),
      meta: { elapsedMs: Date.now() - mountedAt.current, honeypot: fields.honeypot },
    }
    try {
      // onSubmit is a required prop — call it directly so a missing handler fails
      // loudly (the optional-chain form would silently "succeed" with no submit).
      await onSubmit(payload)
      setSubmitting(false)
      succeed()
    } catch {
      setSubmitting(false)
      setSystemError(true)
    }
  }

  if (submitted) {
    return (
      <div className="contact-form-success" role="status">
        <h2>Thank you.</h2>
        <p>We received your request and our team will be in touch soon.</p>
      </div>
    )
  }

  const showSummary = attempted && Object.keys(errors).length > 0

  const textField = (f) => (
    <TextField
      id={f.id} label={f.label} required={f.required}
      type={f.type} inputMode={f.inputMode} autoComplete={f.autoComplete}
      placeholder={f.placeholder} icon={f.icon}
      value={fields[f.id]} error={errors[f.id]} onChange={handleChange} onBlur={handleBlur}
    />
  )

  return (
    <form className="contact-form" noValidate onSubmit={handleSubmit}>
      <div className="contact-form__row">
        {textField(TEXT_FIELDS[0])}
        {textField(TEXT_FIELDS[1])}
      </div>
      <div className="contact-form__row">
        {textField(TEXT_FIELDS[2])}
        {textField(TEXT_FIELDS[3])}
      </div>
      <div className="contact-form__row">
        <SelectField
          id="organizationType" label="Organization type" required placeholder="Organization type*"
          value={organizationType} options={ORG_TYPES} open={orgOpen} error={errors.organizationType}
          onToggle={toggleOrg} onSelect={selectOrg} onClose={() => setOrgOpen(false)}
        />
        <SelectField
          id="partnershipType" label="Partnership type" required
          placeholder={organizationType ? 'Partnership type*' : 'Partnership type'}
          value={partnershipType} options={partnershipOptions} open={intOpen} disabled={!organizationType}
          error={errors.partnershipType}
          onToggle={togglePartnership} onSelect={selectPartnership} onClose={() => setIntOpen(false)}
        />
      </div>

      <TextareaField
        id="message" label="Message" placeholder="Tell us about your organization" icon={NoteIcon}
        value={fields.message} error={errors.message} onChange={handleChange} onBlur={handleBlur}
      />

      {/* Honeypot — off-screen, hidden from AT + keyboard; only bots fill it. */}
      <input
        className="contact-form__hp" type="text" name="company_website" tabIndex={-1}
        autoComplete="off" aria-hidden="true"
        value={fields.honeypot} onChange={(e) => handleChange('honeypot', e.target.value)}
      />

      <div className="contact-form__submit-area">
        <SubmitButton label={submitLabel} loading={submitting} />
        {showSummary && (
          <p className="contact-form__summary" role="alert">Please complete the required fields.</p>
        )}
        {systemError && (
          <p className="contact-form__system" role="alert">
            <WarnIcon />
            <span>Something went wrong. Please try again.</span>
          </p>
        )}
        <LegalNote />
      </div>
    </form>
  )
}

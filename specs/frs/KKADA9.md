---
title: Reusable contact form component
milestone: M2
status: active
archived_at: null
id: fr_01KWCKBBADPE30GAX6RTKKADA9
created_at: 2026-06-30T15:46:16.013Z
---

# Reusable contact form component

## Requirement

Rebuild the contact form as a reusable, atom-composed component usable on several pages,
upgraded to the new Figma design and the contact-form checklist (with agreed deliberate
breaks). Presentational atoms live in `src/components/ui/form/`; a smart `ContactForm`
container owns field state, validation, the Organization→Partnership dependency, and the
submit lifecycle, and takes an injected `onSubmit(payload)` prop (no endpoint hard-coded).
`ContactPage` is rebuilt to consume `<ContactForm/>` while keeping its intent-driven hero.
States/validation/dropdown logic are carried over from the current `ContactPage.jsx`.

## Acceptance Criteria

- AC-KKADA9.1: Presentational atoms exist in `src/components/ui/form/` — `TextField`,
  `SelectField`, `TextareaField`, `SubmitButton`, `LegalNote`, `FieldError` — each controlled
  via props (value/onChange/error/…) with no submission or validation logic.
- AC-KKADA9.2: A `ContactForm` container composes the atoms and owns all state (fields,
  errors, dropdown open/value, submit lifecycle); it accepts `onSubmit(payload) => Promise`,
  an optional `onSuccess()` callback, and a `submitLabel` prop (default "Send message").
- AC-KKADA9.3: Visual matches the Figma frames (3-1007 / 3-1129 / 3-1185): glass card
  (rgba(255,255,255,.3)+10.75px blur, 44px radius, 24px pad, 16px gap, max 640px); fields
  glass rgba(255,255,255,.7), 24px radius, 17/13 pad, 22px leading icon; submit is the cyan
  #5EE6FD pill, uppercase Gilroy-Semibold 12px.
- AC-KKADA9.4: Two-column on desktop & tablet (First/Last, Email/Company, Org/Partnership),
  single-column on mobile, submit full-width on mobile.
- AC-KKADA9.5: Each field shows its name in the placeholder (matching the Figma), with a
  visually-hidden `<label>` kept for screen readers. First name, Last name, Email,
  Organization type, Partnership type are required (asterisk in the placeholder +
  aria-required); Company and Message are optional.
- AC-KKADA9.6: Validation on blur and on submit — required + email-format with specific
  per-field messages beside the field; input preserved on error; a failed submit shows an
  error summary and moves focus to the first invalid field.
- AC-KKADA9.7: Selecting an Organization type populates Partnership type options
  (GROUP_OF/GROUPS); Partnership disabled until Org chosen; changing Org resets Partnership;
  click-outside closes an open dropdown.
- AC-KKADA9.8: On submit the button shows loading and is disabled in-flight (double-submit
  protection); on resolve the form calls its `onSuccess` prop (or, standalone, falls back to
  its own success swap); reject → system-error shown, input preserved, button re-enabled.
- AC-KKADA9.9: Submission goes only through the injected `onSubmit(payload)` prop — no endpoint
  hard-coded; `payload` carries field values plus `meta` (time-to-fill ms, honeypot value).
- AC-KKADA9.10: A hidden honeypot field + time-to-fill are present; when the honeypot is
  filled the form does not call `onSubmit` (bot submission silently dropped).
- AC-KKADA9.11: Accessibility — each field programmatically labelled; `aria-invalid` /
  `aria-required` as applicable; errors announced via `aria-live`; visible focus; color never
  the sole error signal; correct `type`/`inputmode`/`autocomplete`; touch targets ≥44px and
  input font ≥16px.
- AC-KKADA9.12: `ContactPage` renders `<ContactForm/>` with its intent-driven hero (page reads
  `?intent=`, passes title/subtitle to the hero and `submitLabel` to the form); the old
  `setTimeout` simulation is replaced by the `onSubmit` prop. On success the page (via
  `onSuccess`) fades the hero + form out and swaps in a "Thank you" panel with a button and a
  countdown that redirects to the homepage. The hero subtitle uses the home page's subtitle
  sizes (`--fs-subtitle` / `--fs-body-mobile`).
- AC-KKADA9.13: `npm run build:spa` passes.

## Technical Design

- Atoms in `src/components/ui/form/` (controlled, presentational). Container
  `src/components/ContactForm/ContactForm.jsx` + co-located CSS; tokens from `styles/global.css`.
- Field config (id, label, type, inputmode, autocomplete, required, icon): first→`given-name`,
  last→`family-name`, email→`type=email`/`inputmode=email`/`autocomplete=email`,
  company→`organization`. Dropdown data (`ORG_TYPES`, `GROUP_OF`, `GROUPS`) carried from the
  current `ContactPage.jsx`.
- `onSubmit(payload)` returns a Promise (resolve → success, reject → system-error).
  `payload = { first, last, email, company, organizationType, partnershipType, message,
  meta: { elapsedMs, honeypot } }`.
- State: `useState` per field + errors map + dropdown open/value + submitting + systemError +
  submitted; a document click-listener closes dropdowns.
- Page boundary: the hero stays in `ContactPage`; `ContactForm` is page-agnostic and reusable.

## Testing

- Playwright specs (submit stubbed via `onSubmit`): empty submit → field errors + summary +
  focus first invalid; invalid email message; Org→Partnership dependency & disabled state;
  loading + double-submit protection; success swap; reject → system-error with preserved input;
  honeypot-filled → `onSubmit` not called; responsive 2-col desktop / 1-col mobile.
- Gate: `npm run build:spa`.

## Notes

- Deliberate checklist breaks (design wins): 2-column layout (vs §1 single-column); asterisk on
  required (vs §1 "mark optional"); placeholder-only fields (vs §2 "visible labels") — a
  visually-hidden `<label>` + aria-required keep it accessible. Organization/Partnership also
  carry a required asterisk in the placeholder, a minor divergence from Figma.
- Success is page-orchestrated: on a successful submit `ContactPage` fades the hero + form out
  and shows a "Thank you" panel with a button + an ~8s countdown redirect to the homepage (via
  `ContactForm`'s `onSuccess`). Standalone reuse (no `onSuccess`) falls back to the form's own
  success swap.
- The `/contact` hero subtitle uses the home page's subtitle sizes (`--fs-subtitle` /
  `--fs-body-mobile`).
- Out of scope: backend items — server-side validation, CSRF/sanitize, rate limiting,
  notifications, analytics. Submission is prop-injected; the real endpoint is wired later at the
  page level.

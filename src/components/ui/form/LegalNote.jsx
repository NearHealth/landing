// The "By submitting, you agree to Near's Privacy Policy." line under the submit
// button. The Privacy Policy link defaults to the built privacy page under the
// app's base path (/landing/privacy/).

const DEFAULT_PRIVACY_HREF = `${import.meta.env.BASE_URL}privacy/`

export default function LegalNote({ privacyHref = DEFAULT_PRIVACY_HREF }) {
  return (
    <p className="fld-legal">
      By submitting, you agree to Near&rsquo;s{' '}
      <a href={privacyHref}>Privacy Policy.</a>
    </p>
  )
}

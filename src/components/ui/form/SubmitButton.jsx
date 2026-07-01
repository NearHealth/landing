// Primary submit button — the cyan pill from the Figma form. `loading` swaps the
// label for a spinner (CSS ::after) and disables the button, which doubles as
// double-submit protection (checklist §2). aria-busy announces the in-flight state.

export default function SubmitButton({ label, loading = false, type = 'submit' }) {
  return (
    <button
      type={type}
      className={`fld-submit${loading ? ' is-loading' : ''}`}
      disabled={loading}
      aria-busy={loading || undefined}
    >
      {label}
    </button>
  )
}

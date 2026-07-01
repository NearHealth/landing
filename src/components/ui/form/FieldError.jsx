// Inline, per-field error message. Presentational: the parent decides when an
// error exists and passes it as children. Always rendered (a stable role="alert"
// node, not remounted, which is the AT-reliable pattern). The wrapper animates its
// height (grid-template-rows 0fr↔1fr) + opacity so the message eases in/out instead
// of snapping the form's size. `id` links it to its input via aria-describedby.

export default function FieldError({ id, children }) {
  return (
    <div className={`fld-error-wrap${children ? ' is-shown' : ''}`}>
      <p className="fld-error" id={id} role="alert">{children}</p>
    </div>
  )
}

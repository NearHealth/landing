import FieldError from './FieldError'

// Single-line text input atom: a glass "control" pill holding an optional leading
// icon + the input, with the field name shown inside as the placeholder (matching
// the Figma). The real <label> is kept but visually hidden (.sr-only) so screen
// readers still get a stable name; the required state is carried by aria-required
// (and the "*" appended to the placeholder). Controlled & presentational.
//
// Props: { id, label, required, type, inputMode, autoComplete, placeholder,
//          icon: Icon, value, error, onChange(id,value), onBlur(id) }
// `placeholder` defaults to the label (+ "*" when required).

export default function TextField({
  id, label, required = false, type = 'text', inputMode, autoComplete,
  placeholder, icon: Icon, value, error, onChange, onBlur,
}) {
  const errorId = `${id}-error`
  const ph = placeholder ?? `${label}${required ? '*' : ''}`
  return (
    <div className="fld">
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className={`fld-control${value ? ' has-value' : ''}${error ? ' is-invalid' : ''}`}>
        {Icon && <span className="fld-icon"><Icon /></span>}
        <input
          id={id}
          className="fld-input"
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={ph}
          value={value}
          required={required}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(id, e.target.value)}
          onBlur={() => onBlur?.(id)}
        />
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

import FieldError from './FieldError'

// Multi-line message atom: a taller glass control holding a leading icon and a
// <textarea>, with the field name shown inside as the placeholder. Same
// sr-only-label + aria contract as TextField. Props: { id, label, required,
// placeholder, icon: Icon, value, error, onChange(id,value), onBlur(id) }.

export default function TextareaField({
  id, label, required = false, placeholder, icon: Icon, value, error, onChange, onBlur,
}) {
  const errorId = `${id}-error`
  const ph = placeholder ?? `${label}${required ? '*' : ''}`
  return (
    <div className="fld">
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className={`fld-control fld-control--area${value ? ' has-value' : ''}${error ? ' is-invalid' : ''}`}>
        {Icon && <span className="fld-icon"><Icon /></span>}
        <textarea
          id={id}
          className="fld-input fld-textarea"
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

import { useEffect, useRef, useState } from 'react'
import { ChevronIcon, CheckIcon } from './icons'
import FieldError from './FieldError'

// Custom glass dropdown atom matching the Figma select (no native <select> so the
// panel/checkmarks can be styled). Keyboard-accessible combobox: the trigger is a
// real <button> (Tab-focusable, Enter/Space/ArrowDown to open); the panel is a
// role="listbox" with arrow / Home / End / Enter / Escape handling and roving focus.
// Controlled by the parent: { open, value, options, disabled } in; { onToggle,
// onSelect(opt), onClose } out.
//
// Props: { id, label, required, placeholder, value, options, open, disabled, error,
//          onToggle, onSelect, onClose }

export default function SelectField({
  id, label, required = false, placeholder, value, options = [],
  open, disabled = false, error, onToggle, onSelect, onClose,
}) {
  const errorId = `${id}-error`
  const listId = `${id}-listbox`
  const triggerRef = useRef(null)
  const optionRefs = useRef([])
  const [active, setActive] = useState(-1)

  // On open, seed the active option (selected, else first) and focus it.
  useEffect(() => {
    if (!open) return
    setActive(value ? Math.max(0, options.indexOf(value)) : 0)
  }, [open, value, options])

  useEffect(() => {
    if (open && active >= 0) optionRefs.current[active]?.focus()
  }, [open, active])

  function close(refocus = true) {
    onClose?.()
    if (refocus) triggerRef.current?.focus()
  }

  function onTriggerKey(e) {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) onToggle()
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      close()
    }
  }

  function onListKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(options.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (active >= 0) { onSelect(options[active]); triggerRef.current?.focus() } }
    else if (e.key === 'Escape') { e.preventDefault(); close() }
    else if (e.key === 'Tab') { close(false) }
  }

  return (
    <div className="fld">
      <div className="fld-select-wrap">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          className={`fld-select${open ? ' is-open' : ''}${value ? ' has-value' : ''}${disabled ? ' is-disabled' : ''}${error ? ' is-invalid' : ''}`}
          aria-label={value ? `${label}: ${value}` : label}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onClick={(e) => { e.stopPropagation(); if (!disabled) onToggle() }}
          onKeyDown={onTriggerKey}
        >
          <span className="fld-select-value">{value || placeholder}</span>
          <ChevronIcon />
        </button>
        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="fld-options is-open"
            onKeyDown={onListKey}
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((opt, i) => (
              <li
                key={opt}
                ref={(el) => { optionRefs.current[i] = el }}
                role="option"
                aria-selected={opt === value}
                tabIndex={-1}
                className={`fld-opt${opt === value ? ' is-selected' : ''}${i === active ? ' is-active' : ''}`}
                onClick={(e) => { e.stopPropagation(); onSelect(opt) }}
                onMouseEnter={() => setActive(i)}
              >
                <CheckIcon />
                <span>{opt}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  )
}

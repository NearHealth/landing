import { useEffect, useState } from 'react'
import './GridOverlay.css'

const COLUMNS = 12
const STORAGE_KEY = 'grid-overlay-on'

// Dev-only utility — render this component conditionally on
// `import.meta.env.DEV` at the call site (see App.jsx) so the button,
// the keyboard listener, and the overlay never ship to production.
export default function GridOverlay() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setOn(window.localStorage.getItem(STORAGE_KEY) === '1')
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'g' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        setOn((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0')
    }
  }, [on])

  return (
    <>
      <button
        type="button"
        className={`grid-overlay-toggle${on ? ' is-on' : ''}`}
        onClick={() => setOn((v) => !v)}
        aria-pressed={on}
        aria-label="Toggle 12-column grid overlay"
      >
        Grid
      </button>
      {on && (
        <div className="grid-overlay" aria-hidden="true">
          <div className="grid-overlay-inner">
            {Array.from({ length: COLUMNS }, (_, i) => (
              <div key={i} className="grid-overlay-col" />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

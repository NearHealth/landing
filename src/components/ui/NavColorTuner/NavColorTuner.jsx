import { useEffect, useState, useCallback, useRef } from 'react'
import './NavColorTuner.css'

const STORAGE_KEY = 'nav-color-tuner'
const DEFAULT_SOURCE = '#ECF5F2'

// Dev-only utility — render conditionally on import.meta.env.DEV in App.jsx.
// Lets you tune the .nav-link source color and see the live rendered color
// produced by the navbar's mix-blend-mode: difference against whatever's
// scrolling under the navbar.
//
// "Rendered (auto)" samples the element directly beneath a nav link via
// elementFromPoint, walks up to find the first solid background, and applies
// the difference formula. Updates on scroll/resize/source change — no click
// needed. Doesn't model the backdrop blur kernel exactly, so use "Pick" for a
// pixel-perfect EyeDropper reading when you need ground truth.

function parseColor(str) {
  if (!str) return null
  if (str.startsWith('#')) {
    const hex = str.slice(1)
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      }
    }
    return null
  }
  const m = str.match(/rgba?\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\)/)
  if (!m) return null
  const a = m[4] != null ? parseFloat(m[4]) : 1
  if (a === 0) return null
  return { r: +m[1], g: +m[2], b: +m[3] }
}

function toHex({ r, g, b }) {
  const h = (n) => Math.round(n).toString(16).padStart(2, '0').toUpperCase()
  return `#${h(r)}${h(g)}${h(b)}`
}

function difference(bg, fg) {
  return {
    r: Math.abs(bg.r - fg.r),
    g: Math.abs(bg.g - fg.g),
    b: Math.abs(bg.b - fg.b),
  }
}

// Inverse of `difference`: given a backdrop and a target rendered color,
// return the source whose `|backdrop - source|` lands on the target.
// Two candidates per channel (backdrop + target, backdrop - target); pick
// whichever stays inside [0, 255]; if both do, prefer the additive one
// (brighter source = more contrast headroom if the backdrop drifts).
function invertForTarget(bg, target) {
  const channel = (b, t) => {
    const add = b + t
    const sub = b - t
    if (add <= 255 && sub >= 0) return add
    if (add <= 255) return add
    if (sub >= 0) return sub
    return Math.max(0, Math.min(255, add))
  }
  return {
    r: channel(bg.r, target.r),
    g: channel(bg.g, target.g),
    b: channel(bg.b, target.b),
  }
}

// Walk up the DOM from a hit-tested element to the first ancestor with a
// non-transparent computed background-color. Falls back to white.
function resolveBackdrop(el) {
  let cur = el
  while (cur && cur !== document.documentElement) {
    const bg = window.getComputedStyle(cur).backgroundColor
    const parsed = parseColor(bg)
    if (parsed) return parsed
    cur = cur.parentElement
  }
  return { r: 255, g: 255, b: 255 }
}

// Hit-test underneath the navbar while its layers are temporarily click-through
// so elementFromPoint returns the section beneath rather than the navbar itself.
// Tries the nav-link first, then falls back to the navbar bounds (so it still
// works on mobile / narrow viewports where .nav-link is display:none).
function sampleUnderNavLink() {
  let target = document.querySelector('.nav-link')
  let rect = target?.getBoundingClientRect()
  if (!target || !rect || rect.width === 0 || rect.height === 0) {
    target = document.querySelector('.navbar')
    rect = target?.getBoundingClientRect()
  }
  if (!target || !rect || rect.width === 0 || rect.height === 0) return null

  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  const layers = [
    document.querySelector('.navbar'),
    document.querySelector('.navbar-blur'),
    document.querySelector('.navbar-edge'),
    document.querySelector('.navbar-cta-fixed'),
  ].filter(Boolean)
  const prev = layers.map((el) => el.style.pointerEvents)
  layers.forEach((el) => { el.style.pointerEvents = 'none' })

  const below = document.elementFromPoint(cx, cy)

  layers.forEach((el, i) => { el.style.pointerEvents = prev[i] })

  return below ? resolveBackdrop(below) : null
}

export default function NavColorTuner() {
  const [open, setOpen] = useState(false)
  const [source, setSource] = useState(DEFAULT_SOURCE)
  const [backdrop, setBackdrop] = useState(null)
  const [picked, setPicked] = useState(null)
  const [pickError, setPickError] = useState(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.open) setOpen(true)
        if (saved.source) setSource(saved.source)
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.style.setProperty('--nav-link-color', source)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ open, source }))
    } catch { /* ignore */ }
  }, [open, source])

  // Auto-sample the backdrop on scroll/resize while panel is open.
  useEffect(() => {
    if (!open) return
    const schedule = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const bg = sampleUnderNavLink()
        if (bg) setBackdrop(bg)
      })
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [open])

  const pickRendered = useCallback(async () => {
    setPickError(null)
    if (typeof window === 'undefined' || !('EyeDropper' in window)) {
      setPickError('EyeDropper not supported in this browser (try Chrome/Edge).')
      return
    }
    try {
      const result = await new window.EyeDropper().open()
      setPicked(result.sRGBHex.toUpperCase())
    } catch { /* user cancelled */ }
  }, [])

  // Given a target rendered color, sample the current backdrop fresh and
  // back-solve the source. Updates source state which propagates to .nav-link.
  // Falls back through: fresh sample → last sampled backdrop → white.
  const applyTarget = useCallback((targetHex) => {
    const target = parseColor(targetHex)
    if (!target) {
      setPickError(`Couldn't parse target color: ${targetHex}`)
      return
    }
    const bg = sampleUnderNavLink() || backdrop || { r: 255, g: 255, b: 255 }
    setPickError(null)
    setBackdrop(bg)
    setSource(toHex(invertForTarget(bg, target)))
  }, [backdrop])

  const pickTarget = useCallback(async () => {
    setPickError(null)
    if (typeof window === 'undefined' || !('EyeDropper' in window)) {
      setPickError('EyeDropper not supported in this browser (try Chrome/Edge).')
      return
    }
    try {
      const result = await new window.EyeDropper().open()
      applyTarget(result.sRGBHex.toUpperCase())
    } catch { /* user cancelled */ }
  }, [applyTarget])

  const sourceRgb = parseColor(source)
  const predicted = backdrop && sourceRgb ? toHex(difference(backdrop, sourceRgb)) : null

  return (
    <>
      <button
        type="button"
        className={`nav-tuner-toggle${open ? ' is-on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-pressed={open}
        aria-label="Toggle nav color tuner"
      >
        Nav color
      </button>
      {open && (
        <>
          {/* Control panel — bottom-left. The native color picker opens near
              this panel and may cover it; the readout chip below is positioned
              away so values stay visible during interaction. */}
          <div className="nav-tuner" role="dialog" aria-label="Nav link color tuner">
            <div className="nav-tuner-row">
              <label className="nav-tuner-label" htmlFor="nav-tuner-source">Source</label>
              <input
                id="nav-tuner-source"
                type="color"
                value={source}
                onChange={(e) => setSource(e.target.value.toUpperCase())}
              />
              <input
                type="text"
                className="nav-tuner-hex"
                value={source}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setSource(/^#[0-9a-fA-F]{6}$/.test(v) ? v.toUpperCase() : v)
                }}
                spellCheck={false}
              />
              <button
                type="button"
                className="nav-tuner-mini"
                onClick={() => setSource(DEFAULT_SOURCE)}
                title="Reset to default"
              >↺</button>
            </div>
            <div className="nav-tuner-divider" aria-hidden="true" />
            <div className="nav-tuner-row">
              <label className="nav-tuner-label" htmlFor="nav-tuner-target">Target</label>
              <input
                id="nav-tuner-target"
                type="color"
                defaultValue="#E1CDCC"
                onChange={(e) => applyTarget(e.target.value.toUpperCase())}
              />
              <input
                type="text"
                className="nav-tuner-hex"
                placeholder="#E1CDCC"
                onChange={(e) => {
                  const v = e.target.value.trim()
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) applyTarget(v.toUpperCase())
                }}
                spellCheck={false}
              />
              <button
                type="button"
                className="nav-tuner-mini"
                onClick={pickTarget}
                title="Pick desired rendered from screen"
              >Pick</button>
            </div>
            <div className="nav-tuner-row">
              <button type="button" className="nav-tuner-mini" onClick={pickRendered} title="Read actual on-screen color">
                Pick actual rendered
              </button>
            </div>
            <p className="nav-tuner-hint">
              Live readouts pinned top-right so the color picker dialog doesn't cover them.
            </p>
            {pickError && <p className="nav-tuner-error">{pickError}</p>}
          </div>

          {/* Readout chip — top-right, away from the color picker dialog. */}
          <div className="nav-tuner-readout" aria-live="polite">
            <div className="nav-tuner-row">
              <span className="nav-tuner-label">Backdrop</span>
              <span
                className="nav-tuner-swatch"
                style={{ background: backdrop ? toHex(backdrop) : 'transparent' }}
                aria-hidden="true"
              />
              <span className="nav-tuner-hex nav-tuner-hex--readonly">
                {backdrop ? toHex(backdrop) : '—'}
              </span>
            </div>
            <div className="nav-tuner-row">
              <span className="nav-tuner-label">Rendered</span>
              <span
                className="nav-tuner-swatch"
                style={{ background: predicted || 'transparent' }}
                aria-hidden="true"
              />
              <span className="nav-tuner-hex nav-tuner-hex--readonly">
                {predicted || '—'}
              </span>
            </div>
            <div className="nav-tuner-row">
              <span className="nav-tuner-label">Picked</span>
              <span
                className="nav-tuner-swatch"
                style={{ background: picked || 'transparent' }}
                aria-hidden="true"
              />
              <span className="nav-tuner-hex nav-tuner-hex--readonly">
                {picked || '—'}
              </span>
            </div>
          </div>
        </>
      )}
    </>
  )
}

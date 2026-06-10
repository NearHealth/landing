import { useEffect, useState } from 'react'
import './GradientTuner.css'

// Dev-only live tuner for the hover + pill glow gradients. Render conditionally
// on `import.meta.env.DEV` at the call site so it never ships to production.
// Writes CSS vars on :root; the gradients fall back to their baked values when
// the tuner isn't mounted, so production is unaffected.
const STORAGE_KEY = 'gradient-tuner'

// Every group is described once here and drives the sliders, the CSS-var writes
// and the per-group "Copy" button. `unit` is the label suffix shown in the UI;
// `css` is the CSS custom property and `fmt` turns the raw value into its value.
const GROUPS = [
  {
    id: 'hover', title: 'Hover',
    fields: [
      { key: 'hs1', label: 'Center', min: 0, max: 100, css: '--hg-s1', fmt: (v) => `${v}%` },
      { key: 'hs2', label: 'Mid', min: 0, max: 100, css: '--hg-s2', fmt: (v) => `${v}%` },
      { key: 'hs3', label: 'Edge', min: 0, max: 100, css: '--hg-s3', fmt: (v) => `${v}%` },
      { key: 'hmid', label: 'Mid α', min: 0, max: 100, css: '--hg-mid', fmt: (v) => `${v / 100}` },
      { key: 'hscale', label: 'Scale', min: 0.5, max: 4, step: 0.01, unit: '×', css: '--hg-scale', fmt: (v) => `${v}` },
    ],
  },
  {
    id: 'pill', title: 'Pill',
    fields: [
      { key: 'ps1', label: 'Center', min: 0, max: 100, css: '--pg-s1', fmt: (v) => `${v}%` },
      { key: 'ps2', label: 'Mid', min: 0, max: 100, css: '--pg-s2', fmt: (v) => `${v}%` },
      { key: 'ps3', label: 'Edge', min: 0, max: 100, css: '--pg-s3', fmt: (v) => `${v}%` },
      { key: 'pmid', label: 'Mid α', min: 0, max: 100, css: '--pg-mid', fmt: (v) => `${v / 100}` },
      { key: 'pscale', label: 'Scale', min: 0.3, max: 4, step: 0.01, unit: '×', css: '--pg-scale', fmt: (v) => `${v}` },
    ],
  },
  {
    // Mobile pill (≤480px) — separate vars so the glow can be tuned for the
    // smaller 380×208 pill without touching the desktop values. CareConnected.css
    // reads --pgm-* inside its mobile media query, falling back to --pg-*.
    id: 'pillMobile', title: 'Pill · mobile',
    fields: [
      { key: 'pms1', label: 'Center', min: 0, max: 100, css: '--pgm-s1', fmt: (v) => `${v}%` },
      { key: 'pms2', label: 'Mid', min: 0, max: 100, css: '--pgm-s2', fmt: (v) => `${v}%` },
      { key: 'pms3', label: 'Edge', min: 0, max: 100, css: '--pgm-s3', fmt: (v) => `${v}%` },
      { key: 'pmmid', label: 'Mid α', min: 0, max: 100, css: '--pgm-mid', fmt: (v) => `${v / 100}` },
      { key: 'pmscale', label: 'Scale', min: 0.3, max: 4, step: 0.01, unit: '×', css: '--pgm-scale', fmt: (v) => `${v}` },
    ],
  },
  {
    id: 'glow', title: 'Designed-for glow',
    fields: [
      { key: 'deSx', label: 'Scale X', min: 0.5, max: 1, step: 0.01, unit: '', css: '--de-distort', fmt: (v) => `${v}` },
      { key: 'deSize', label: 'Size', min: 0.5, max: 3, step: 0.01, unit: '×', css: '--de-size', fmt: (v) => `${v}` },
      { key: 'deSpeed', label: 'Speed', min: 2, max: 40, step: 0.5, unit: 's', css: '--de-speed', fmt: (v) => `${v}s` },
      { key: 'deBlur', label: 'Blur', min: 0, max: 150, step: 1, unit: 'px', css: '--de-blur', fmt: (v) => `${v}px` },
      { key: 'deOpacity', label: 'Opacity', min: 0, max: 100, step: 1, css: '--de-opacity', fmt: (v) => `${v / 100}` },
    ],
  },
]

const DEFAULTS = {
  hs1: 30, hs2: 50, hs3: 60, hmid: 70, hscale: 3,         // hover
  ps1: 45, ps2: 70, ps3: 100, pmid: 70, pscale: 1.5,      // pill (desktop)
  pms1: 52, pms2: 70, pms3: 95, pmmid: 60, pmscale: 1.4,  // pill (mobile)
  deSx: 0.78, deSize: 1.32, deSpeed: 9, deBlur: 67, deOpacity: 62, // designed-for glow
}

function Slider({ label, value, min, max, step = 1, unit = '%', onChange }) {
  return (
    <label className="gt-row">
      <span>{label}<b>{value}{unit}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
    </label>
  )
}

export default function GradientTuner() {
  const [on, setOn] = useState(false)
  const [v, setV] = useState(DEFAULTS)
  // Which group dropdowns are expanded, and which one just copied (for the ✓).
  const [open, setOpen] = useState({})
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved) setV((p) => ({ ...p, ...saved }))
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const r = document.documentElement.style
    for (const g of GROUPS) for (const f of g.fields) r.setProperty(f.css, f.fmt(v[f.key]))
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  }, [v])

  const set = (k) => (e) => setV((p) => ({ ...p, [k]: +e.target.value }))
  const toggle = (id) => setOpen((p) => ({ ...p, [id]: !p[id] }))

  // Copy a group's current values as ready-to-paste CSS custom properties.
  const copyGroup = (g) => {
    const css = g.fields.map((f) => `  ${f.css}: ${f.fmt(v[f.key])};`).join('\n')
    try { window.navigator.clipboard.writeText(css) } catch { /* ignore */ }
    setCopied(g.id)
    window.setTimeout(() => setCopied((c) => (c === g.id ? null : c)), 1200)
  }

  return (
    <>
      <button
        type="button"
        className={`gt-toggle${on ? ' is-on' : ''}`}
        onClick={() => setOn((o) => !o)}
        aria-pressed={on}
      >
        Gradients
      </button>
      {on && (
        <div className="gt-panel">
          {GROUPS.map((g) => (
            <div className={`gt-group${open[g.id] ? ' is-open' : ''}`} key={g.id}>
              <div className="gt-group-head">
                <button
                  type="button"
                  className="gt-group-toggle"
                  onClick={() => toggle(g.id)}
                  aria-expanded={!!open[g.id]}
                >
                  <span className="gt-caret" aria-hidden="true">▸</span>
                  {g.title}
                </button>
                <button
                  type="button"
                  className="gt-copy"
                  onClick={() => copyGroup(g)}
                  title="Copy as CSS custom properties"
                >
                  {copied === g.id ? '✓' : 'Copy'}
                </button>
              </div>
              {open[g.id] && (
                <div className="gt-group-body">
                  {g.fields.map((f) => (
                    <Slider
                      key={f.key}
                      label={f.label}
                      value={v[f.key]}
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      unit={f.unit}
                      onChange={set(f.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          <button type="button" className="gt-reset" onClick={() => setV(DEFAULTS)}>Reset</button>
        </div>
      )}
    </>
  )
}

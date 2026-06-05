import { useState } from 'react'
import './AnimationsLab.css'
// The CSS animation lives in its own file so it can be edited in isolation.
import '../animations/pill.css'

export default function AnimationsLab() {
  // Gradient tuning — applied as CSS vars on .lab, inherited by every sphere.
  const [s1, setS1] = useState(38)   // centre (transparent) stop %
  const [s2, setS2] = useState(48)   // mid stop %
  const [s3, setS3] = useState(63)   // edge stop %
  const [mid, setMid] = useState(50) // mid colour alpha %
  const [pillScale, setPillScale] = useState(1) // pill container scale

  const vars = {
    '--g-s1': `${s1}%`,
    '--g-s2': `${s2}%`,
    '--g-s3': `${s3}%`,
    '--g-mid': mid / 100,
    '--pill-scale': pillScale,
  }

  return (
    <div className="lab" style={vars}>
      {/* ── Pill (CTA_Gradient) ── */}
      <section className="lab-pane">
        <span className="lab-label">CSS · pill</span>
        <div className="pill-box">
          <div className="pill-null">
            <div className="pill-grad pill-grad--1" />
            <div className="pill-grad pill-grad--2" />
          </div>
        </div>
      </section>

      <div className="lab-controls">
        <label>
          <span>Center stop <b>{s1}%</b></span>
          <input type="range" min="0" max="100" value={s1} onChange={(e) => setS1(+e.target.value)} />
        </label>
        <label>
          <span>Mid stop <b>{s2}%</b></span>
          <input type="range" min="0" max="100" value={s2} onChange={(e) => setS2(+e.target.value)} />
        </label>
        <label>
          <span>Edge stop <b>{s3}%</b></span>
          <input type="range" min="0" max="100" value={s3} onChange={(e) => setS3(+e.target.value)} />
        </label>
        <label>
          <span>Mid alpha <b>{mid}%</b></span>
          <input type="range" min="0" max="100" value={mid} onChange={(e) => setMid(+e.target.value)} />
        </label>
        <label>
          <span>Pill scale <b>{pillScale.toFixed(2)}×</b></span>
          <input type="range" min="0.3" max="3" step="0.01" value={pillScale} onChange={(e) => setPillScale(+e.target.value)} />
        </label>
      </div>
    </div>
  )
}

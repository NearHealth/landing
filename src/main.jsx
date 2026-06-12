import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

// Always client-render. The prerendered #root snapshot (scripts/prerender.mjs)
// is captured at a fixed desktop viewport (1280×800), but several components
// pick their initial markup from the live viewport — e.g. ShapedSection,
// ResponsiveVideo, ScrollPlayVideo read window.innerWidth / matchMedia — so
// hydrateRoot would mismatch (React #418) on any client that isn't 1280px wide.
// The static HTML still serves SEO + first paint; createRoot then takes over,
// replacing #root with the viewport-correct render (no hydration comparison).
const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

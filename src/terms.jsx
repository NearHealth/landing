import React from 'react'
import ReactDOM from 'react-dom/client'
import TermsPage from './components/TermsPage/TermsPage'
import './styles/global.css'

// Always client-render — same rationale as main.jsx: the prerendered #root
// snapshot is captured at a fixed desktop viewport, but the page picks markup
// from the live viewport, so we createRoot (no hydration comparison) here too.
const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <TermsPage />
  </React.StrictMode>
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import ContactPage from './components/ContactPage/ContactPage'
import './styles/global.css'

// Always client-render — same rationale as main.jsx / privacy.jsx.
const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ContactPage />
  </React.StrictMode>
)

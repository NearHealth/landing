import React from 'react'
import ReactDOM from 'react-dom/client'
import PrivacyPage from './components/PrivacyPage/PrivacyPage'
import './styles/global.css'

// Always client-render — same rationale as main.jsx / terms.jsx.
const root = document.getElementById('root')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <PrivacyPage />
  </React.StrictMode>
)

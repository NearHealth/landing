import React from 'react'
import ReactDOM from 'react-dom/client'
import AppLab from './AppLab'
import './styles/global.css'

// Experiment entry. Served at /landing/lab.html — a full isolated copy of the
// site (AppLab → HeroLab) for prototyping the Hero scroll-scrub behaviour
// without touching the live page. No prerender/hydration: the lab #root is empty.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLab />
  </React.StrictMode>
)

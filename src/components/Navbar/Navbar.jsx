import { useState } from 'react'
import NearBrand from '../ui/NearBrand/NearBrand'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLinkClick = (e, id) => {
    e.preventDefault()
    const target = document.querySelector(id)
    if (target) {
      const offset = document.querySelector('.navbar')?.offsetHeight || 0
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' })
      history.pushState(null, '', id)
    }
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      {/* Glass plate is a SIBLING of nav-container so mix-blend-mode on
          links/logo can blend against the rendered glass (which carries the
          backdrop-filter result of the page below). If the glass were a
          parent or background on .navbar, the blend would be trapped. */}
      <div className="navbar__glass" aria-hidden="true" />
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <NearBrand size="sm" />
        </a>
        <div className={`nav-links${menuOpen ? ' active' : ''}`}>
          <a href="#built-for" className="nav-link" onClick={(e) => handleLinkClick(e, '#built-for')}>Built for</a>
          <a href="#how-it-works" className="nav-link" onClick={(e) => handleLinkClick(e, '#how-it-works')}>How it works</a>
          <a href="#why-near" className="nav-link" onClick={(e) => handleLinkClick(e, '#why-near')}>Why near</a>
          <a href="#contact" className="nav-link" onClick={(e) => handleLinkClick(e, '#contact')}>Talk to us</a>
        </div>
        <a href="#contact" className="btn btn-primary btn-sm nav-cta" onClick={(e) => handleLinkClick(e, '#contact')}>Request a demo</a>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  )
}

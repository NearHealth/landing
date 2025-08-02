import { useState } from 'react'
import { useNavbarScroll } from '../hooks/useScrollAnimation'

export default function Navbar() {
  const scrolled = useNavbarScroll()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLinkClick = (e, id) => {
    e.preventDefault()
    const target = document.querySelector(id)
    if (target) {
      const offset = document.querySelector('.navbar')?.offsetHeight || 0
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-container">
        <a href="#" className="nav-logo">
          <img src="/assets/icons/near-logo.svg" alt="Near Health" className="nav-logo-img" />
          <div className="nav-wordmark">
            <img src="/assets/icons/n.svg" alt="n" />
            <img src="/assets/icons/e.svg" alt="e" />
            <img src="/assets/icons/a.svg" alt="a" />
            <img src="/assets/icons/r.svg" alt="r" />
          </div>
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

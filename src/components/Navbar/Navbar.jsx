import { useEffect, useRef, useState } from 'react'
import { NAVBAR_HEIGHT } from '../../utils/layout'
import { SECTIONS } from '../../constants/sections'
import NearBrand from '../ui/NearBrand/NearBrand'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  // Hide the bar on scroll-down, reveal on scroll-up (client 0206 item 5).
  // rAF-throttled, reads native scrollY (Lenis drives native scroll). Small
  // sub-threshold deltas accumulate so slow scrolls still flip; the bar is
  // always shown within the first NAVBAR_HEIGHT px so it never hides at the top.
  const [hidden, setHidden] = useState(false)
  const navJumpUntil = useRef(0) // keep the bar shown around a nav-link jump
  useEffect(() => {
    let last = window.scrollY
    let ticking = false
    const update = () => {
      ticking = false
      const y = window.scrollY
      // During/just after a nav-link jump, force the bar shown so the
      // programmatic scroll doesn't hide it.
      if (Date.now() < navJumpUntil.current) { setHidden(false); last = y; return }
      if (y <= NAVBAR_HEIGHT) { setHidden(false); last = y; return }
      const delta = y - last
      if (delta > 6) { setHidden(true); last = y }
      else if (delta < -6) { setHidden(false); last = y }
      // else: keep `last` so tiny deltas accumulate toward the threshold.
    }
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update) }
    }
    const onGoto = () => { navJumpUntil.current = Date.now() + 800; setHidden(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('nav:goto', onGoto)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('nav:goto', onGoto)
    }
  }, [])

  const handleLinkClick = (e, id) => {
    e.preventDefault()
    // App owns the jump: it remounts the target section (replaying its reveal)
    // and scrolls instantly via Lenis. See the `nav:goto` handler in App.jsx.
    window.dispatchEvent(new CustomEvent('nav:goto', { detail: id }))
    history.pushState(null, '', id)
    setMenuOpen(false)
  }

  // Logo + "Built for": hard-reload the page and land at the very top. A real
  // navigation (vs the in-place Hero remount) avoids the flicker of the section
  // re-rendering on top of itself. scrollRestoration=manual + a hashless URL
  // guarantees the reloaded page starts at the top.
  const reloadToTop = (e) => {
    e.preventDefault()
    window.history.scrollRestoration = 'manual'
    window.location.replace(window.location.pathname)
  }

  return (
    <nav className={`navbar${hidden ? ' navbar--hidden' : ''}`}>
      {/* Glass plate is a SIBLING of nav-container so mix-blend-mode on
          links/logo can blend against the rendered glass (which carries the
          backdrop-filter result of the page below). If the glass were a
          parent or background on .navbar, the blend would be trapped. */}
      <div className="navbar__glass" aria-hidden="true" />
      <div className="nav-container">
        <a href={SECTIONS.hero} className="nav-logo" onClick={reloadToTop}>
          <NearBrand size="sm" />
        </a>
        <div className={`nav-links${menuOpen ? ' active' : ''}`}>
          <a href={SECTIONS.hero} className="nav-link" onClick={reloadToTop}>Built for</a>
          <a href={SECTIONS.howItWorks} className="nav-link" onClick={(e) => handleLinkClick(e, SECTIONS.howItWorks)}>How it works</a>
          <a href={SECTIONS.whyNear} className="nav-link" onClick={(e) => handleLinkClick(e, SECTIONS.whyNear)}>Why near</a>
          <a href={SECTIONS.careConnected} className="nav-link" onClick={(e) => handleLinkClick(e, SECTIONS.careConnected)}>Talk to us</a>
        </div>
        <a href={SECTIONS.contact} className="btn btn-primary btn-sm nav-cta" onClick={(e) => handleLinkClick(e, SECTIONS.contact)}>Request a demo</a>
        <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  )
}

import { useEffect, useRef, useState } from 'react'
import { NAVBAR_HEIGHT } from '../../utils/layout'
import { SECTIONS, CONTACT_URL } from '../../constants/sections'
import { asset } from '../../utils/assetPath'
import NearBrand from '../ui/NearBrand/NearBrand'
import './Navbar.css'

// `standalone` renders the bar on a page OTHER than the landing page (e.g. the
// Terms page). The landing page owns the in-page `nav:goto` scroll choreography
// (see App.jsx); off it, that machinery is absent, so links must be plain hrefs
// back to the landing page's sections (e.g. /landing/#how-it-works) instead.
export default function Navbar({ standalone = false }) {
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

  // Close the mobile drawer on Escape, and lock body scroll while it is open.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [menuOpen])

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

  // On a standalone page, point at the landing page + section hash and let the
  // browser navigate normally; on the landing page, dispatch the in-page jump.
  const home = asset('') // '/landing/' (or '/' in the root-domain build)
  const homeProps = standalone
    ? { href: home }
    : { href: SECTIONS.hero, onClick: reloadToTop }
  const linkProps = (id) =>
    standalone
      ? { href: `${home}${id}` }
      : { href: id, onClick: (e) => handleLinkClick(e, id) }

  return (
    <>
      <nav className={`navbar${hidden ? ' navbar--hidden' : ''}`}>
        {/* Glass plate is a SIBLING of nav-container so mix-blend-mode on
            links/logo can blend against the rendered glass (which carries the
            backdrop-filter result of the page below). If the glass were a
            parent or background on .navbar, the blend would be trapped. */}
        <div className="navbar__glass" aria-hidden="true" />
        <div className="nav-container">
          <a {...homeProps} className="nav-logo">
            <NearBrand size="sm" />
          </a>
          <div className={`nav-links${menuOpen ? ' active' : ''}`}>
            <a {...homeProps} className="nav-link">Built for</a>
            <a {...linkProps(SECTIONS.howItWorks)} className="nav-link">How it works</a>
            <a {...linkProps(SECTIONS.whyNear)} className="nav-link">Why near</a>
            <a href={CONTACT_URL.talk()} className="nav-link">Talk to us</a>
          </div>
          <a href={CONTACT_URL.earlyAccess()} className="btn btn-primary btn-sm nav-cta">Early access</a>
          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer — rendered as a SIBLING of .navbar so it escapes the
          bar's `mix-blend-mode: difference` and paints literal colours (cyan
          pill, dark text). Hidden ≥1025px via CSS. */}
      <div
        className="mobile-drawer-scrim"
        data-open={menuOpen}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="mobile-drawer"
        className="mobile-drawer"
        data-open={menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="mobile-drawer__header">
          <a
            href={CONTACT_URL.earlyAccess()}
            className="mobile-drawer__cta"
            onClick={() => setMenuOpen(false)}
          >
            Early access
          </a>
          <button
            className="mobile-drawer__close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="mobile-drawer__links" aria-label="Mobile">
          <a {...homeProps} className="mobile-drawer__link" onClick={(e) => { homeProps.onClick?.(e); setMenuOpen(false) }}>Built for</a>
          <a {...linkProps(SECTIONS.howItWorks)} className="mobile-drawer__link">How it works</a>
          <a {...linkProps(SECTIONS.whyNear)} className="mobile-drawer__link">Why near</a>
          <a href={CONTACT_URL.talk()} className="mobile-drawer__link" onClick={() => setMenuOpen(false)}>Talk to us</a>
        </nav>
      </aside>
    </>
  )
}

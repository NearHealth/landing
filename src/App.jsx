import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import CareJourney from './components/CareJourney/CareJourney'
import MemberExperience from './components/MemberExperience/MemberExperience'
import HowItWorks from './components/HowItWorks/HowItWorks'
import PostEnrollment from './components/PostEnrollment/PostEnrollment'
import ConnectedCoverage from './components/ConnectedCoverage/ConnectedCoverage'
import RealWorld from './components/RealWorld/RealWorld'
import ShapedSection from './components/ShapedSection/ShapedSection'
import CareConnected from './components/CareConnected/CareConnected'
import FooterCta from './components/FooterCta/FooterCta'
import Footer from './components/Footer/Footer'
import GridOverlay from './components/ui/GridOverlay/GridOverlay'
import GradientTuner from './components/ui/GradientTuner/GradientTuner'
import { useLenis } from './hooks/useLenis'
import { asset } from './utils/assetPath'
import { NAVBAR_HEIGHT, NAV_LINK_GAP } from './utils/layout'
import { SECTIONS } from './constants/sections'
import { useEffect, useRef, useState } from 'react'

export default function App() {
  const lenisRef = useRef(null)
  useLenis(lenisRef)

  // Nav links jump straight to a section AND replay its entrance animation.
  // We bump a per-section key → React remounts that section in its `hidden`
  // initial state, then (next frame, after the remount paints) we jump-scroll
  // to it with no smooth easing. Motion's `whileInView` then fires as the
  // section enters the viewport, so the reveal plays fresh every navigation —
  // while normal scrolling keeps `once: true` (no replay on casual scroll-by).
  const [navKeys, setNavKeys] = useState({})

  useEffect(() => {
    const bump = (id) => setNavKeys((k) => ({ ...k, [id]: (k[id] || 0) + 1 }))
    const scrollToId = (id) => {
      const el = document.querySelector(id)
      if (!el) return
      // Consistent landing offset for every nav-link jump (navbar height + a
      // 56px gap), so all sections sit the same distance below the bar.
      // #care-connected has padding:0 (unlike the 120px top padding every other
      // section carries), so its cyan pill would land jammed under the navbar —
      // add that 120px back here so it lands with the same breathing room.
      const offset = NAVBAR_HEIGHT + NAV_LINK_GAP + (id === SECTIONS.careConnected ? 120 : 0)
      // getBoundingClientRect + scrollY is offsetParent-agnostic (handles
      // sections nested in wrappers, e.g. #contact inside .footer-wrap).
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset)
      if (lenisRef.current) lenisRef.current.scrollTo(top, { immediate: true })
      else window.scrollTo({ top, behavior: 'auto' })
    }

    const onGoto = (e) => {
      const id = e.detail
      if (!document.querySelector(id)) return

      if (id === SECTIONS.hero) {
        // Hero's video is scroll-scrubbed (width/height driven by scrollY). If
        // it remounted while the page was still scrolled down, the scrub would
        // bake a stale inline width that Motion never clears on the way back.
        // So settle the scroll at the very top FIRST (sync, both Lenis + native
        // to defeat any race), THEN remount — the fresh Hero measures at y=0 and
        // loads the video from scratch with a clean CSS width.
        lenisRef.current?.scrollTo(0, { immediate: true })
        window.scrollTo(0, 0)
        requestAnimationFrame(() => bump(id))
        return
      }

      // Reveal sections: remount first (mounts hidden while still off-screen),
      // then jump — `whileInView` fires as it enters view, replaying the reveal.
      bump(id)
      requestAnimationFrame(() => scrollToId(id))
    }

    window.addEventListener('nav:goto', onGoto)
    return () => window.removeEventListener('nav:goto', onGoto)
  }, [])

  const sectionKey = (id) => `${id}:${navKeys[id] || 0}`

  return (
    <>
      {/* Full-document-height background. Pre-rasterised from the Figma blurred-
          blob SVG to a tiny 320×2049 bitmap (the blur is low-frequency, so it
          upscales 1:1). Using the SVG live forced the browser to rasterise a
          527px-radius blur at full document size (~1440×9000) — multi-frame
          jank, especially in Safari. The bitmap is a cheap GPU upscale. */}
      <img className="site-bg" src={asset('assets/images/site-bg.jpg')} alt="" aria-hidden="true" />
      <Navbar />
      {/* Both layers are siblings AFTER <Navbar/> so the
          `.navbar--hidden ~ ...` CSS selectors can slide them together.
          `navbar-blur` carries the `backdrop-filter` (kept outside the
          navbar so the parent's `mix-blend-mode: difference` doesn't trap
          it). z-index in CSS keeps it visually below the navbar.
          `navbar-edge` is the real white hairline that escapes the blend. */}
      <div className="navbar-blur" aria-hidden="true" />
      <div className="navbar-edge" aria-hidden="true" />
      {/* Real CTA button — sibling of .navbar so it escapes mix-blend-mode:
          difference. The in-navbar button is visibility:hidden (holds flex
          space). This element tracks the same show/hide animation via CSS. */}
      <a
        href={SECTIONS.contact}
        className="navbar-cta-fixed"
        onClick={(e) => {
          e.preventDefault()
          window.dispatchEvent(new CustomEvent('nav:goto', { detail: SECTIONS.contact }))
          history.pushState(null, '', SECTIONS.contact)
        }}
      >
        Request a demo
      </a>
      <Hero key={sectionKey(SECTIONS.hero)} />
      <CareJourney key={sectionKey(SECTIONS.builtFor)} />
      <MemberExperience />
      <HowItWorks key={sectionKey(SECTIONS.howItWorks)} />
      <PostEnrollment key={sectionKey(SECTIONS.whyNear)} />
      <ConnectedCoverage />
      <RealWorld />
      <ShapedSection />
      <CareConnected />
      <div className="footer-wrap">
        <FooterCta key={sectionKey(SECTIONS.contact)} />
        <Footer />
      </div>
      {import.meta.env.DEV && <GridOverlay />}
      {import.meta.env.DEV && <GradientTuner />}
    </>
  )
}

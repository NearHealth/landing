import Navbar from './components/Navbar/Navbar'
import HeroLab from './components/Hero/HeroLab'
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
import useReloadOnBreakpoint from './hooks/useReloadOnBreakpoint'
import { asset } from './utils/assetPath'
import { NAVBAR_HEIGHT, NAV_LINK_GAP } from './utils/layout'
import { SECTIONS, CONTACT_URL } from './constants/sections'
import { useEffect, useRef, useState } from 'react'

export default function App() {
  const lenisRef = useRef(null)
  useLenis(lenisRef)
  // Drag-resize across a layout breakpoint → reload, restoring the section.
  useReloadOnBreakpoint()

  // Nav links jump straight to a section AND replay its entrance animation.
  // We bump a per-section key → React remounts that section in its `hidden`
  // initial state, then (next frame, after the remount paints) we jump-scroll
  // to it with no smooth easing. Motion's `whileInView` then fires as the
  // section enters the viewport, so the reveal plays fresh every navigation —
  // while normal scrolling keeps `once: true` (no replay on casual scroll-by).
  const [navKeys, setNavKeys] = useState({})

  useEffect(() => {
    const bump = (id) => setNavKeys((k) => ({ ...k, [id]: (k[id] || 0) + 1 }))
    const scrollToId = (id, pass = 0) => {
      const el = document.querySelector(id)
      if (!el) return
      // Land every section so its CONTENT START (the box top + the section's
      // own padding-top) sits at the same viewport height as the hero's "The
      // future of…" headline — the same breathing room below the navbar on
      // every jump. Reading each section's computed padding-top keeps this
      // responsive (120px desktop / 71px mobile / 0 on #care-connected) and
      // replaces the old fixed offset + per-section #care-connected hack.
      //
      // heroTop comes from the hero section's OWN top padding (a static CSS
      // value, 165px desktop / 143px mobile) — which equals the heading's
      // resting top but, unlike the heading's live rect, is immune to the
      // one-time translateY entrance animation that would skew a measurement
      // taken during the first ~0.7s after load.
      const heroEl = document.querySelector('.hero')
      const heroTop = heroEl
        ? parseFloat(getComputedStyle(heroEl).paddingTop) || (NAVBAR_HEIGHT + NAV_LINK_GAP)
        : NAVBAR_HEIGHT + NAV_LINK_GAP
      const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0
      // getBoundingClientRect + scrollY is offsetParent-agnostic (handles
      // sections nested in wrappers, e.g. #contact inside .footer-wrap).
      const targetFor = (node) =>
        Math.max(0, node.getBoundingClientRect().top + window.scrollY - (heroTop - padTop))
      const top = targetFor(el)
      if (!lenisRef.current) { window.scrollTo({ top, behavior: 'auto' }); return }
      lenisRef.current.scrollTo(top, { immediate: true })
      // .post-hero carries a scroll-linked translateY(--post-hero-y) that VARIES
      // in the riser zone near the top and FREEZES past release. The rect above
      // bakes in the CURRENT value, so a jump from the top measures the wrong
      // target (lands a section early — the classic "works on the 2nd click").
      // Re-measure once the jump settles into the frozen zone, then correct.
      // Targets always land past release, so this converges in one extra pass;
      // the guard caps any pathological loop.
      if (pass >= 3) return
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const settled = document.querySelector(id) // re-query: bump() may have remounted the node
        if (!settled) return
        const top2 = targetFor(settled)
        if (Math.abs(top2 - top) >= 1) scrollToId(id, pass + 1)
      }))
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
      <a href={CONTACT_URL.earlyAccess()} className="navbar-cta-fixed">
        Early access
      </a>
      <main>
      <HeroLab key={sectionKey(SECTIONS.hero)} />
      {/* LAB: everything after the hero lives in one wrapper that rises over the
          hero's empty (letterbox + tail) area. The hero video stays sticky; this
          block slides up across the computed dead space, killing the gap. The
          pull distance is set by HeroLab on :root from the aspect-locked geom. */}
      <div className="post-hero">
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
      </div>
      </main>
      {import.meta.env.DEV && <GridOverlay />}
      {import.meta.env.DEV && <GradientTuner />}
    </>
  )
}

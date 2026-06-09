import { useEffect } from 'react'
import { BREAKPOINT_PHONE, BREAKPOINT_TABLET } from '../utils/layout'

const STORAGE_KEY = 'breakpoint-reload-section'

// Discrete layout band from viewport width. Crossing a boundary swaps the
// rendered layout: the mobile↔desktop branch flips at TABLET (useIsMobile), and
// the phone-only video <source> + hero ticker mask flip at PHONE. Several blocks
// wire themselves up imperatively on mount only — the GSAP hero scrub, the rAF
// coverage carousel, and <ResponsiveVideo>/<ScrollPlayVideo>, which pick their
// <source> at load time and never switch live. So when a drag-resize crosses a
// boundary the clean fix is a full reload that re-runs all of that — landing the
// user back on the section they were reading.
// Boundaries match the video <source media> queries exactly: the mobile clip is
// (max-width: 480) → band 0 is w ≤ 480; the desktop clip is (min-width: 481).
// The tablet/desktop flip at 1024 mirrors useIsMobile (< 1024 = mobile branch).
// So a drag-resize that would change which <source> loads always lands a reload.
const bandOf = (w) => (w <= BREAKPOINT_PHONE ? 0 : w < BREAKPOINT_TABLET ? 1 : 2)

const safeSession = {
  get(k) { try { return sessionStorage.getItem(k) } catch { return null } },
  set(k, v) { try { sessionStorage.setItem(k, v) } catch { /* private mode */ } },
  remove(k) { try { sessionStorage.removeItem(k) } catch { /* private mode */ } },
}

// id of the section currently filling the top of the viewport — the last one
// whose top has scrolled to/above the navbar band.
const currentSectionId = () => {
  const sections = document.querySelectorAll('section[id]')
  let best = null
  let bestTop = -Infinity
  for (const el of sections) {
    const top = el.getBoundingClientRect().top
    if (top <= 80 && top > bestTop) { bestTop = top; best = el }
  }
  if (!best && sections.length) best = sections[0]
  return best ? best.id : null
}

// Reload the page when a drag-resize crosses a layout breakpoint, restoring the
// section the user was on. Call once, from <App/>.
export default function useReloadOnBreakpoint() {
  useEffect(() => {
    // Restore after a breakpoint reload. Defer until layout + fonts settle so
    // offsets are final, then reuse the app's nav:goto scroll path (Lenis +
    // navbar offset aware). The nav:goto listener is registered by App's main
    // effect, which runs before this rAF/fonts callback.
    const savedId = safeSession.get(STORAGE_KEY)
    if (savedId) {
      safeSession.remove(STORAGE_KEY)
      const restore = () => {
        if (!document.getElementById(savedId)) return
        window.dispatchEvent(new CustomEvent('nav:goto', { detail: `#${savedId}` }))
      }
      const fonts = document.fonts && document.fonts.ready
      if (fonts) fonts.then(() => requestAnimationFrame(restore))
      else requestAnimationFrame(() => requestAnimationFrame(restore))
    }

    // We own scroll restoration on the breakpoint reload (below). Disabling the
    // browser's own restoration also avoids a stale scroll position being re-
    // applied after the reload — the source of the Arc fullscreen→windowed shift,
    // where the browser restored an offset captured mid-transition.
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

    let band = bandOf(window.innerWidth)
    let timer = 0
    // Debounced: only act once the resize has SETTLED. A live drag — and Arc's
    // fullscreen↔windowed animation, which streams transient/degenerate widths —
    // must not trigger a reload on an intermediate value; we reload on the final
    // width only, and never on a bogus 0.
    const onResize = () => {
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        const w = window.innerWidth
        if (!w) return
        const next = bandOf(w)
        if (next === band) return
        band = next
        const id = currentSectionId()
        if (id) safeSession.set(STORAGE_KEY, id)
        window.location.reload()
      }, 300)
    }
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize) }
  }, [])
}

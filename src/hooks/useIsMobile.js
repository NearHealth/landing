import { useState, useEffect } from 'react'
import { BREAKPOINT_TABLET } from '../utils/layout'

// Mobile/tablet branch vs desktop branch, site-wide.
//   • width < 1024            → phones + portrait small tablets (mobile branch)
//   • touch device, portrait  → tablets (incl. iPad Pro 12.9" portrait = 1024px)
//                               get the tablet/mobile branch
//   • touch device, landscape → desktop branch (iPad Pro landscape 1194/1366px
//                               uses the desktop layout + scroll scrub)
//   • non-touch ≥ 1024        → desktop
// `any-pointer: coarse` (not `pointer: coarse`) so an iPad paired with a
// trackpad — whose primary pointer turns fine — is still detected as touch.
const isMobileViewport = () => {
  if (typeof window === 'undefined') return false
  if (window.innerWidth < BREAKPOINT_TABLET) return true
  const mm = typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null
  if (!mm) return false
  const coarse = mm('(any-pointer: coarse)').matches
  const portrait = mm('(orientation: portrait)').matches
  return coarse && portrait
}

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(isMobileViewport)

  useEffect(() => {
    const handle = () => setIsMobile(isMobileViewport())
    handle()
    window.addEventListener('resize', handle)
    window.addEventListener('orientationchange', handle)
    return () => {
      window.removeEventListener('resize', handle)
      window.removeEventListener('orientationchange', handle)
    }
  }, [])

  return isMobile
}

import { useState, useEffect } from 'react'
import { BREAKPOINT_TABLET } from '../utils/layout'

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT_TABLET : false
  )

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < BREAKPOINT_TABLET)
    handle()
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  return isMobile
}

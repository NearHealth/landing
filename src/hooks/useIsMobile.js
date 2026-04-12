import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 768

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    handle()
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  return isMobile
}

import { useEffect, useRef, useState } from 'react'

// Pauses continuous (infinite) CSS animations while their host is off-screen.
// Safari keeps painting/compositing infinite animations even when scrolled away
// — blurred rotating blobs and full-width gradient repaints are especially
// costly. Toggle the returned `paused` onto a wrapper class so CSS can set
// `animation-play-state: paused` on the decorative layers.
export function usePlayInView(rootMargin = '300px') {
  const ref = useRef(null)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setPaused(false) // no IO support → never pause (fail open)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return [ref, paused]
}

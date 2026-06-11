import { useEffect, useRef } from 'react'
import { asset } from '../../../utils/assetPath'
import useVideoPlayback from '../../../hooks/useVideoPlayback'
import VideoPlayOverlay from '../VideoPlayOverlay/VideoPlayOverlay'
import VideoLoader from '../VideoLoader/VideoLoader'

// Mobile video is phones-only (≤480); tablets and up get the desktop clip
// (client 0206 item 4 — "use the desktop video on tablets in both cases").
// The poster below also follows this boundary.
const MOBILE_MEDIA = '(max-width: 480px)'
const DESKTOP_MEDIA = '(min-width: 481px)'

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA).matches

/**
 * Video that plays only when scrolled into view.
 * Source is picked at load time via native <source media>.
 * Poster is picked once at mount (no resize reactivity).
 *
 * Loading is two-stage: markup ships preload="none" (nothing fetched at page
 * load), then a wide-margin observer starts the fetch ~2 viewports before the
 * widget scrolls in, so on slow connections the buffer is ready by the time
 * the 35%-visibility play threshold fires (previously the first byte wasn't
 * requested until that same threshold — seconds of poster on slow 3G).
 *
 * Playback is supervised by useVideoPlayback (autoplay-block overlay, resume
 * after OS pauses, loop backstop) — see the hook for the failure modes.
 */
export default function ScrollPlayVideo({
  desktop, mobile,
  desktopPoster, mobilePoster, className = '',
}) {
  const videoRef = useRef(null)
  const shouldPlayRef = useRef(false) // flips with viewport intersection
  const { blocked, loading, requestPlay } = useVideoPlayback(videoRef, shouldPlayRef)
  const poster = isMobileViewport() ? mobilePoster : desktopPoster

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Stage 1: warm the buffer well ahead of the play threshold.
    const warm = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        warm.disconnect()
        video.preload = 'auto'
        if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load()
      },
      { rootMargin: '200% 0px' }
    )
    warm.observe(video)

    // Stage 2: play only once the widget has genuinely settled into view
    // (~35% visible), and on the FIRST reveal start from frame 0 so the demo
    // always plays from the top — reads as "activated on view", synced with
    // the entrance reveal.
    let started = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) { started = true; try { video.currentTime = 0 } catch { /* not seekable yet */ } }
          shouldPlayRef.current = true
          requestPlay()
        } else {
          // flag off BEFORE pausing so the hook reads this as deliberate
          shouldPlayRef.current = false
          video.pause()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(video)
    return () => { warm.disconnect(); observer.disconnect() }
  }, [requestPlay])

  return (
    <>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={poster ? asset(poster) : undefined}
        className={className}
      >
        {mobile  && <source src={asset(mobile)}  type="video/mp4" media={MOBILE_MEDIA} />}
        {desktop && <source src={asset(desktop)} type="video/mp4" media={DESKTOP_MEDIA} />}
      </video>
      <VideoLoader loading={loading && !blocked} />
      {blocked && <VideoPlayOverlay onPlay={requestPlay} />}
    </>
  )
}

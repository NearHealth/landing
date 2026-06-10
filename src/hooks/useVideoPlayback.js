import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Keeps a muted looping <video> actually playing despite the ways browsers
 * stop it in the wild:
 *  - autoplay rejected outright (iOS Low Power Mode, Android Data Saver,
 *    Safari's per-site "Stop Media with Auto-Play") → `blocked` flips true so
 *    the caller can render a manual play overlay; the first user gesture
 *    anywhere also retries, since a gesture grants activation and play()
 *    then succeeds even in Low Power Mode;
 *  - `loop` ignored at the clip boundary (iOS Low Power Mode parks the video
 *    on its last frame after one playthrough) → 'ended' backstop restarts it;
 *  - external pause with no resume (screen lock, call, tab switch, bfcache
 *    restore) → resumes on 'pause'/visibilitychange/pageshow.
 *
 * `shouldPlayRef.current` says whether the video is MEANT to be playing right
 * now (e.g. scrolled into view). The hook never starts a video whose flag is
 * false, and a deliberate pause (flag flipped off first) is left alone.
 *
 * Returns { blocked, requestPlay }: render an overlay while `blocked`, wire
 * its onClick to `requestPlay`.
 */
export default function useVideoPlayback(videoRef, shouldPlayRef) {
  const [blocked, setBlocked] = useState(false)
  const reloadedRef = useRef(false)

  const tryPlay = useCallback(() => {
    const video = videoRef.current
    if (!video || !shouldPlayRef.current) return
    // After a total network failure (every <source> candidate failed — e.g. a
    // connection blip on flaky mobile), re-run resource selection once.
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && !reloadedRef.current) {
      reloadedRef.current = true
      video.load()
    }
    const p = video.play()
    if (p && typeof p.then === 'function') {
      p.then(() => setBlocked(false)).catch((err) => {
        // Only an autoplay-policy rejection warrants the manual overlay.
        // AbortError — our own pause() interrupting a still-pending play()
        // (fast scroll past the widget) — is not a block.
        if (err && err.name === 'NotAllowedError') setBlocked(true)
      })
    }
  }, [videoRef, shouldPlayRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Cap resume-after-pause retries so a browser that insists on pausing
    // (e.g. OS media policy) isn't fought in a loop; any successful playback
    // resets the budget.
    let pauseRetries = 0
    const onPlaying = () => { pauseRetries = 0; setBlocked(false) }

    const onEnded = () => {
      try { video.currentTime = 0 } catch { /* not seekable yet */ }
      tryPlay()
    }

    const onPause = () => {
      if (!shouldPlayRef.current || video.ended || document.visibilityState !== 'visible') return
      if (pauseRetries >= 3) return
      pauseRetries += 1
      setTimeout(tryPlay, 150)
    }

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      pauseRetries = 0
      if (video.paused) tryPlay()
    }
    const onPageShow = () => { if (video.paused) tryPlay() }

    video.addEventListener('playing', onPlaying)
    video.addEventListener('ended', onEnded)
    video.addEventListener('pause', onPause)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onPageShow)

    // Initial kick for always-on videos: the bare autoplay attribute fails
    // SILENTLY when blocked (no promise to observe), so we'd never learn to
    // show the overlay. An explicit play() surfaces the rejection.
    if (shouldPlayRef.current && video.paused) tryPlay()

    return () => {
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('pause', onPause)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [videoRef, shouldPlayRef, tryPlay])

  // While blocked, the first gesture anywhere on the page unlocks playback —
  // the user doesn't have to hit the overlay itself.
  useEffect(() => {
    if (!blocked) return
    const unlock = () => tryPlay()
    window.addEventListener('pointerdown', unlock, true)
    window.addEventListener('touchend', unlock, true)
    return () => {
      window.removeEventListener('pointerdown', unlock, true)
      window.removeEventListener('touchend', unlock, true)
    }
  }, [blocked, tryPlay])

  return { blocked, requestPlay: tryPlay }
}

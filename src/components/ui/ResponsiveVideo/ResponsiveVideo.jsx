import { useEffect, useRef } from 'react'
import useIsMobile from '../../../hooks/useIsMobile'
import { asset } from '../../../utils/assetPath'

/**
 * Video that switches source based on viewport
 * @param {string} desktop - desktop video path (e.g. 'assets/Hero_Desktop.mp4')
 * @param {string} mobile - mobile video path (e.g. 'assets/Hero_Mobile.mp4')
 * @param {string} [desktopWebm] - desktop WebM path for smaller file size
 * @param {string} [mobileWebm] - mobile WebM path for smaller file size
 * @param {boolean} [scrollPlay] - if true, play only when scrolled into view
 * @param {string} className - extra classes
 */
export default function ResponsiveVideo({ desktop, mobile, desktopWebm, mobileWebm, desktopPoster, mobilePoster, scrollPlay = false, className = '' }) {
  const isMobile = useIsMobile()
  const videoRef = useRef(null)
  const mp4Src = asset(isMobile ? mobile : desktop)
  const webmSrc = (isMobile ? mobileWebm : desktopWebm)
    ? asset(isMobile ? mobileWebm : desktopWebm)
    : null
  const posterSrc = (isMobile ? mobilePoster : desktopPoster)
    ? asset(isMobile ? mobilePoster : desktopPoster)
    : undefined

  useEffect(() => {
    if (!scrollPlay) return
    const video = videoRef.current
    if (!video) return
    video.muted = true

    let visible = false
    const tryPlay = () => {
      if (visible && video.paused) video.play().catch(() => {})
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) tryPlay()
        else video.pause()
      },
      { threshold: 0.1 }
    )

    // Re-trigger play when the page becomes visible again (tab switch, app foreground)
    const onVisibilityChange = () => {
      if (!document.hidden && visible) tryPlay()
    }

    // Retry if the browser stalls or suspends the video (common on low-power mobile)
    let stalledTimer = null
    const onStalled = () => {
      clearTimeout(stalledTimer)
      stalledTimer = setTimeout(tryPlay, 300)
    }

    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('stalled', onStalled)
    video.addEventListener('suspend', onStalled)
    document.addEventListener('visibilitychange', onVisibilityChange)
    observer.observe(video)

    return () => {
      clearTimeout(stalledTimer)
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('stalled', onStalled)
      video.removeEventListener('suspend', onStalled)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      observer.disconnect()
    }
  }, [scrollPlay])

  useEffect(() => {
    if (scrollPlay) return
    const video = videoRef.current
    if (!video) return
    video.muted = true

    const handleCanPlay = () => video.play().catch(() => {})
    video.addEventListener('canplay', handleCanPlay, { once: true })
    video.load()
    video.play().catch(() => {})

    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [isMobile, scrollPlay])

  return (
    <video
      ref={videoRef}
      autoPlay={!scrollPlay}
      muted loop playsInline
      preload="auto"
      poster={posterSrc}
      className={className}
      key={isMobile ? 'mobile' : 'desktop'}
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={mp4Src} type="video/mp4" />
    </video>
  )
}

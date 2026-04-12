import { useEffect, useRef } from 'react'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'

/**
 * Video that switches source based on viewport
 * @param {string} desktop - desktop video path (e.g. 'assets/Hero_Desktop.mp4')
 * @param {string} mobile - mobile video path (e.g. 'assets/Hero_Mobile.mp4')
 * @param {string} [desktopWebm] - desktop WebM path for smaller file size
 * @param {string} [mobileWebm] - mobile WebM path for smaller file size
 * @param {boolean} [scrollPlay] - if true, play only when scrolled into view
 * @param {string} className - extra classes
 */
export default function ResponsiveVideo({ desktop, mobile, desktopWebm, mobileWebm, scrollPlay = false, className = '' }) {
  const isMobile = useIsMobile()
  const videoRef = useRef(null)
  const mp4Src = asset(isMobile ? mobile : desktop)
  const webmSrc = (isMobile ? mobileWebm : desktopWebm)
    ? asset(isMobile ? mobileWebm : desktopWebm)
    : null

  useEffect(() => {
    if (!scrollPlay) return
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play()
        else video.pause()
      },
      { threshold: 0.3 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [scrollPlay])

  useEffect(() => {
    if (scrollPlay) return
    const video = videoRef.current
    if (!video) return
    video.muted = true
    video.play().catch(() => {})
  }, [isMobile, scrollPlay])

  return (
    <video
      ref={videoRef}
      autoPlay={!scrollPlay}
      muted loop playsInline
      className={className}
      key={isMobile ? 'mobile' : 'desktop'}
    >
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={mp4Src} type="video/mp4" />
    </video>
  )
}

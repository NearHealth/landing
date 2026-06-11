import { useRef } from 'react'
import { asset } from '../../../utils/assetPath'
import useVideoPlayback from '../../../hooks/useVideoPlayback'
import VideoPlayOverlay from '../VideoPlayOverlay/VideoPlayOverlay'
import VideoLoader from '../VideoLoader/VideoLoader'

// Mobile video is phones-only (≤480); tablets and up get the desktop clip
// (client 0206 item 4 — "use the desktop video on tablets in both cases").
const MOBILE_MEDIA = '(max-width: 480px)'
const DESKTOP_MEDIA = '(min-width: 481px)'

const isMobileViewport = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_MEDIA).matches

/**
 * Video that switches source based on viewport via native <source media>.
 * Source is picked at load time only (no live resize switching — a breakpoint
 * cross triggers a full reload via useReloadOnBreakpoint, which re-picks it).
 *
 * The poster is REQUIRED for perceived performance: on a slow host Safari can
 * leave an autoplay <video> blank until the clip buffers, so the poster paints
 * the cover frame immediately. Pick it per-viewport, mirroring the <source>
 * boundary, so the cover matches the clip that will load. (index.html also
 * preloads the posters with matching media queries, so the cover is usually
 * in cache before React renders this element.)
 *
 * Playback is supervised by useVideoPlayback: the bare autoplay attribute is
 * not enough in the wild — iOS Low Power Mode / Data Saver reject it (we then
 * show a manual play overlay), and an OS-initiated pause or an ignored `loop`
 * would otherwise leave the video frozen after one playthrough.
 *
 * MP4 (H.264) only — no WebM. Safari reports it can play VP9/WebM
 * (canPlayType returns non-empty), so it commits to a leading <source
 * type="video/webm"> and then fails to decode the clip, with no runtime
 * fallback to the mp4 below it (the source list is only walked until the first
 * "playable" type). H.264 plays on every target browser, so we serve it alone.
 *
 * @param {string} desktop - desktop MP4 path
 * @param {string} mobile - mobile MP4 path
 * @param {string} [desktopPoster] - desktop cover image
 * @param {string} [mobilePoster] - mobile cover image
 * @param {string} [poster] - single cover used on both viewports (fallback)
 * @param {string} [className] - extra classes
 */
export default function ResponsiveVideo({
  desktop, mobile,
  desktopPoster, mobilePoster, poster, className = '',
}) {
  const videoRef = useRef(null)
  const shouldPlayRef = useRef(true) // always-on: meant to play whenever possible
  const { blocked, loading, requestPlay } = useVideoPlayback(videoRef, shouldPlayRef)

  const cover = isMobileViewport()
    ? (mobilePoster || poster)
    : (desktopPoster || poster)

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={cover ? asset(cover) : undefined}
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

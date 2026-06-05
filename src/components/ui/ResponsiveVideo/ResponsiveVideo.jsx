import { asset } from '../../../utils/assetPath'

// Mobile video is phones-only (≤480); tablets and up get the desktop clip
// (client 0206 item 4 — "use the desktop video on tablets in both cases").
const MOBILE_MEDIA = '(max-width: 480px)'
const DESKTOP_MEDIA = '(min-width: 481px)'

/**
 * Video that switches source based on viewport via native <source media>.
 * Source is picked at load time only (no live resize switching).
 *
 * @param {string} desktop - desktop MP4 path (e.g. 'assets/Hero_Desktop.mp4')
 * @param {string} mobile - mobile MP4 path (e.g. 'assets/Hero_Mobile.mp4')
 * @param {string} [desktopWebm] - desktop WebM path
 * @param {string} [mobileWebm] - mobile WebM path
 * @param {string} [poster] - single poster image (same on both viewports)
 * @param {string} [className] - extra classes
 */
export default function ResponsiveVideo({
  desktop, mobile, desktopWebm, mobileWebm,
  poster, className = '',
}) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster ? asset(poster) : undefined}
      className={className}
    >
      {mobileWebm  && <source src={asset(mobileWebm)}  type="video/webm" media={MOBILE_MEDIA} />}
      {mobile      && <source src={asset(mobile)}      type="video/mp4"  media={MOBILE_MEDIA} />}
      {desktopWebm && <source src={asset(desktopWebm)} type="video/webm" media={DESKTOP_MEDIA} />}
      {desktop     && <source src={asset(desktop)}     type="video/mp4"  media={DESKTOP_MEDIA} />}
    </video>
  )
}

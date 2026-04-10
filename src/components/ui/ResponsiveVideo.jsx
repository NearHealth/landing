import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'

/**
 * Video that switches source based on viewport
 * @param {string} desktop - desktop video path (e.g. 'assets/Hero_Desktop.mp4')
 * @param {string} mobile - mobile video path (e.g. 'assets/Hero_Mobile.mp4')
 * @param {string} [desktopWebm] - desktop WebM path for smaller file size
 * @param {string} [mobileWebm] - mobile WebM path for smaller file size
 * @param {string} className - extra classes
 */
export default function ResponsiveVideo({ desktop, mobile, desktopWebm, mobileWebm, className = '' }) {
  const isMobile = useIsMobile()
  const mp4Src = asset(isMobile ? mobile : desktop)
  const webmSrc = (isMobile ? mobileWebm : desktopWebm)
    ? asset(isMobile ? mobileWebm : desktopWebm)
    : null

  return (
    <video autoPlay muted loop playsInline className={className} key={isMobile ? 'mobile' : 'desktop'}>
      {webmSrc && <source src={webmSrc} type="video/webm" />}
      <source src={mp4Src} type="video/mp4" />
    </video>
  )
}

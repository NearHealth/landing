import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'

/**
 * Video that switches source based on viewport
 * @param {string} desktop - desktop video path (e.g. 'assets/Hero_Desktop.mp4')
 * @param {string} mobile - mobile video path (e.g. 'assets/Hero_Mobile.mp4')
 * @param {string} className - extra classes
 */
export default function ResponsiveVideo({ desktop, mobile, className = '' }) {
  const isMobile = useIsMobile()

  return (
    <video autoPlay muted loop playsInline className={className} key={isMobile ? 'mobile' : 'desktop'}>
      <source src={asset(isMobile ? mobile : desktop)} type="video/mp4" />
    </video>
  )
}

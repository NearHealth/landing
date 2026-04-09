import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

export default function CareConnected() {
  const isMobile = useIsMobile()

  return (
    <section className="care-connected">
      <div className="container">
        <div className="care-connected-card">
          <DotLottieReact
            src={asset(isMobile ? 'assets/CTA_Gradient_Mobile.lottie' : 'assets/CTA_Gradient_Desktop.lottie')}
            loop
            autoplay
            className="lottie-bg"
          />
          <h2>Care, connected</h2>
        </div>
      </div>
    </section>
  )
}

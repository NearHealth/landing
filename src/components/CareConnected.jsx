import { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useFadeIn } from '../hooks/useScrollAnimation'
import useIsMobile from '../hooks/useIsMobile'
import { asset } from '../utils/assetPath'

export default function CareConnected() {
  const isMobile = useIsMobile()
  const fade = useFadeIn()
  const [dotLottie, setDotLottie] = useState(null)

  useEffect(() => {
    if (!dotLottie) return
    if (fade.visible) dotLottie.play()
  }, [fade.visible, dotLottie])

  return (
    <section className="care-connected" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <div className="care-connected-card">
          <DotLottieReact
            src={asset(isMobile ? 'assets/CTA_Gradient_Mobile.lottie' : 'assets/CTA_Gradient_Desktop.lottie')}
            loop
            autoplay={false}
            dotLottieRefCallback={setDotLottie}
            className="lottie-bg"
          />
          <h2>Care, connected</h2>
        </div>
      </div>
    </section>
  )
}

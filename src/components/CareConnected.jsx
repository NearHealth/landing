import { useState, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function CareConnected() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  return (
    <section className="care-connected">
      <div className="container">
        <div className="care-connected-card">
          <DotLottieReact
            src={isMobile ? '/assets/CTA_Gradient_Mobile.lottie' : '/assets/CTA_Gradient_Desktop.lottie'}
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

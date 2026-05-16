import { useState, useEffect, useRef } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import useIsMobile from '../../hooks/useIsMobile'
import { asset } from '../../utils/assetPath'
import './CareConnected.css'

export default function CareConnected() {
  const isMobile = useIsMobile()
  const sectionRef = useRef(null)
  const [dotLottie, setDotLottie] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        io.disconnect()
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!dotLottie) return
    const tryPlay = () => { if (visible) dotLottie.play() }
    tryPlay()
    dotLottie.addEventListener('load', tryPlay)
    return () => dotLottie.removeEventListener('load', tryPlay)
  }, [visible, dotLottie])

  return (
    <section className="care-connected" id="care-connected" ref={sectionRef}>
      <div className={`container fade-in${visible ? ' visible' : ''}`}>
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

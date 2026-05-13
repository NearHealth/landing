import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NearBrand from '../ui/NearBrand/NearBrand'
import './Footer.css'

export default function Footer() {
  const footerRef = useRef(null)
  const brandRef = useRef(null)
  const gradientRef = useRef(null)

  useEffect(() => {
    const footer = footerRef.current
    const brand = brandRef.current
    const gradient = gradientRef.current
    if (!footer || !brand || !gradient) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      gsap.set([brand, gradient], { opacity: 1 })
      return
    }

    // Proxy object animated by GSAP; we write its value back to the CSS
    // custom property each frame. This sidesteps any unit-parsing quirks of
    // GSAP's direct CSS-var handling and guarantees a smooth, visible drift.
    const stopProxy = { v: 50 }
    const writeStop = () => gradient.style.setProperty('--gradient-stop', `${stopProxy.v}%`)
    writeStop()

    const ctx = gsap.context(() => {
      gsap.set(brand, { opacity: 0, y: 90 })
      gsap.set(gradient, { opacity: 0 })

      gsap.to(brand, {
        opacity: 1,
        y: 0,
        duration: 2.4,
        ease: 'expo.out',
        scrollTrigger: { trigger: footer, start: 'top 95%', once: true },
      })

      // Slower fade-in for the cyan gradient. The breathing (opacity dip +
      // stop drift) starts in parallel, so motion is visible during the
      // fade-in itself instead of waiting for it to finish.
      gsap.to(gradient, {
        opacity: 1,
        duration: 3.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom',
          once: true,
          onEnter: () => {
            gsap.to(stopProxy, {
              v: 24,
              duration: 2.2,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
              onUpdate: writeStop,
            })
            gsap.to(gradient, {
              opacity: 0.45,
              duration: 2.5,
              delay: 3.6,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: -1,
            })
          },
        },
      })
    }, footer)

    return () => ctx.revert()
  }, [])

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-gradient" ref={gradientRef} aria-hidden="true" />
      <div className="container">
        <NearBrand size="lg" className="footer-brand" ref={brandRef} />
        <span className="footer-item footer-copyright">&copy; Near Health LLC. 2026</span>
        <a href="mailto:hello@near.health" className="footer-item footer-email">hello@near.health</a>
        <a href="#" className="footer-item footer-terms">Terms</a>
        <a href="#" className="footer-item footer-privacy">Privacy</a>
        <div className="footer-socials">
          <a href="#" className="social-icon" aria-label="LinkedIn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.29291 10.3271H7.20312V16.9914H9.29291V10.3271Z" fill="currentColor"/>
              <path d="M14.9452 10.1823C14.8681 10.1727 14.7863 10.1678 14.7044 10.163C13.5343 10.1149 12.8746 10.8083 12.6435 11.1068C12.5809 11.1887 12.552 11.2368 12.552 11.2368V10.346H10.5537V17.0102H12.552H12.6435C12.6435 16.3313 12.6435 15.6572 12.6435 14.9782C12.6435 14.6123 12.6435 14.2463 12.6435 13.8803C12.6435 13.4277 12.6098 12.9462 12.8361 12.5321C13.0287 12.1854 13.3754 12.0121 13.7654 12.0121C14.9211 12.0121 14.9452 13.057 14.9452 13.1533C14.9452 13.1581 14.9452 13.1629 14.9452 13.1629V17.0391H17.0349V12.691C17.0349 11.2031 16.279 10.3267 14.9452 10.1823Z" fill="currentColor"/>
              <path d="M8.24833 9.46103C8.91849 9.46103 9.46176 8.91776 9.46176 8.24761C9.46176 7.57745 8.91849 7.03418 8.24833 7.03418C7.57818 7.03418 7.03491 7.57745 7.03491 8.24761C7.03491 8.91776 7.57818 9.46103 8.24833 9.46103Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="X">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M9.9664 7.4165H6.5L10.6099 12.4014L6.7629 16.5832H8.5404L11.45 13.4204L14.0336 16.5541H17.5L13.2707 11.4243L13.2781 11.4332L16.9197 7.47474H15.1422L12.438 10.4143L9.9664 7.4165ZM8.4134 8.28953H9.4925L15.5866 15.681H14.5075L8.4134 8.28953Z" fill="currentColor"/>
            </svg>
          </a>
          <a href="#" className="social-icon" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.1761 9.68882V11.5H8.6814L8.6545 9.68882H15.1761ZM10.7454 18.0161V8.80536C10.7454 8.17577 10.8754 7.65178 11.1353 7.23341C11.3994 6.81503 11.7528 6.50227 12.1955 6.29511C12.6382 6.08795 13.1297 5.98438 13.67 5.98438C14.0518 5.98438 14.3909 6.01484 14.6875 6.07577C14.984 6.1367 15.2033 6.19153 15.3455 6.24028L14.9068 7.94627C14.8134 7.91784 14.6956 7.8894 14.5534 7.86097C14.4113 7.82848 14.2528 7.81223 14.0782 7.81223C13.6679 7.81223 13.3775 7.91174 13.2069 8.11078C13.0404 8.30575 12.9571 8.58602 12.9571 8.95159V18.0161H10.7454Z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  )
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
        <svg ref={brandRef} className="footer-brand" width="100%" viewBox="0 0 1440 376" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Near Health">
          <path d="M246.703 375.181L180.636 276.651L248.589 144.418H248.457C215.522 144.418 185.679 162.715 170.55 192.16L102.597 324.438H66.0885L0 225.908L79.2668 71.6018C101.961 27.4356 146.737 0 196.139 0H228.043C258.916 0 286.917 15.8478 302.968 42.3784C314.896 62.1108 318.58 85.0658 313.844 106.873C330.794 113.87 345.331 126.208 355.264 142.652C371.315 169.182 372.433 201.518 358.246 229.108L283.212 375.181H246.703ZM231.551 273.672L262.381 319.648L319.304 208.846C326.386 195.051 325.838 178.894 317.813 165.629C312.704 157.175 305.183 150.907 296.412 147.464L231.551 273.694V273.672ZM50.9149 222.928L81.7446 268.904L131.585 171.875C154.28 127.709 199.055 100.273 248.457 100.273H270.296C273.607 88.5753 271.985 76.0163 265.538 65.3334C257.513 52.068 243.501 44.1442 228.087 44.1442H196.183C163.248 44.1442 133.405 62.4419 118.275 91.8861L50.9588 222.928H50.9149Z" fill="currentColor"/>
          <path d="M988.478 207.886H804.384C811.556 244.647 837.628 266.11 872.401 266.11C901.56 266.11 919.961 255.893 930.19 235.985L973.222 258.359C953.293 293.182 915.61 313.089 872.93 313.089C801.356 313.089 750.71 262 750.71 188.449C750.71 114.898 800.798 63.3389 872.401 63.3389C937.862 63.3389 988.978 116.983 988.978 188.478C988.978 196.142 988.978 200.223 988.478 207.886ZM804.384 167.015H935.804C932.747 136.361 906.645 110.318 872.401 110.318C838.157 110.318 811.556 132.809 804.384 167.015Z" fill="currentColor"/>
          <path d="M1264.08 188.478V308.01H1216.52L1212.43 271.219C1195.03 298.291 1164.87 313.118 1133.69 313.118C1069.25 313.118 1018.64 262.029 1018.64 188.478C1018.64 114.927 1071.81 63.3389 1141.89 63.3389C1211.96 63.3389 1264.11 109.319 1264.11 188.478H1264.08ZM1210.9 188.478C1210.9 139.943 1178.69 111.345 1141.86 111.345C1103 111.345 1072.31 142.498 1072.31 188.478C1072.31 234.459 1101.47 265.112 1141.86 265.112C1176.63 265.112 1210.9 238.041 1210.9 188.478Z" fill="currentColor"/>
          <path d="M1317.78 308.01V160.908C1317.78 101.656 1353.58 63.3389 1411.37 63.3389C1422.1 63.3389 1430.8 64.8657 1440 66.921V115.955C1430.8 114.927 1425.19 115.456 1421.6 115.456C1389.88 115.456 1371.48 129.755 1371.48 170.098V308.01H1317.78Z" fill="currentColor"/>
          <path d="M706.178 211.119V307.983H652.475V170.071C652.475 140.739 628.666 116.956 599.301 116.956C569.937 116.956 546.128 140.739 546.128 170.071V307.983H492.425V170.071C492.425 111.113 540.278 63.312 599.301 63.312C658.324 63.312 706.178 111.113 706.178 170.071V211.119Z" fill="currentColor"/>
        </svg>
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

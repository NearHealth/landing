import './NearBrand.css'

// Inline SVGs so the logo can be retinted via CSS `color` (fill="currentColor").
// Paths copied verbatim from /public/assets/icons/*.svg. viewBox preserved so
// the existing width/height rules in NearBrand.css keep the same sizing.

function IconN(props) {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M15.2893 10.5723V17.5008H11.448V7.63624C11.448 5.53817 9.74502 3.83702 7.64464 3.83702C5.54426 3.83702 3.84124 5.53817 3.84124 7.63624V17.5008H0V7.63624C0 3.41909 3.42285 0 7.64464 0C11.8664 0 15.2893 3.41909 15.2893 7.63624V10.5723Z" />
    </svg>
  )
}

function IconE(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M17.007 10.3392H3.83914C4.35215 12.9686 6.21705 14.5038 8.70429 14.5038C10.79 14.5038 12.1061 13.773 12.8378 12.349L15.9158 13.9494C14.4903 16.4402 11.7949 17.8641 8.74214 17.8641C3.62259 17.8641 0 14.2098 0 8.94885C0 3.68791 3.58263 0 8.70429 0C13.3865 0 17.0427 3.83702 17.0427 8.95095C17.0427 9.4991 17.0428 9.79102 17.007 10.3392ZM3.83914 7.41572H13.2394C13.0207 5.22314 11.1537 3.36028 8.70429 3.36028C6.25489 3.36028 4.35215 4.96902 3.83914 7.41572Z" />
    </svg>
  )
}

function IconA(props) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M17.5558 8.95095V17.5008H14.1539L13.8617 14.8692C12.617 16.8056 10.4599 17.8662 8.22913 17.8662C3.62048 17.8662 0 14.2119 0 8.95095C0 3.69001 3.8034 0 8.81573 0C13.8281 0 17.5579 3.28888 17.5579 8.95095H17.5558ZM13.7524 8.95095C13.7524 5.47936 11.448 3.43379 8.81362 3.43379C6.03414 3.43379 3.83914 5.66208 3.83914 8.95095C3.83914 12.2398 5.92481 14.4324 8.81362 14.4324C11.3009 14.4324 13.7524 12.4961 13.7524 8.95095Z" />
    </svg>
  )
}

function IconR(props) {
  return (
    <svg width="9" height="18" viewBox="0 0 9 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <path d="M0 17.5008V6.97889C0 2.74073 2.56083 0 6.69431 0C7.46172 0 8.08405 0.109209 8.74213 0.256222V3.76352C8.08405 3.69001 7.68248 3.72781 7.42598 3.72781C5.1574 3.72781 3.84124 4.7506 3.84124 7.63624V17.5008H0Z" />
    </svg>
  )
}

function IconNearLogo(props) {
  return (
    <svg width="27" height="27" viewBox="0 0 27 27" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Near Health" {...props}>
      <path d="M17.6461 26.8359L12.9205 19.7883L17.781 10.3299H17.7716C15.4159 10.3299 13.2813 11.6387 12.1991 13.7448L7.33857 23.2063H4.72717L0 16.1587L5.66978 5.12153C7.29308 1.96241 10.4958 0 14.0294 0H16.3114C18.5197 0 20.5226 1.13356 21.6707 3.03124C22.5239 4.44266 22.7874 6.08458 22.4486 7.6444C23.661 8.14487 24.7008 9.0274 25.4113 10.2036C26.5594 12.1013 26.6394 14.4142 25.6246 16.3876L20.2575 26.8359H17.6461ZM16.5624 19.5752L18.7675 22.8637L22.8391 14.9383C23.3457 13.9516 23.3065 12.7959 22.7325 11.8471C22.367 11.2424 21.8291 10.794 21.2017 10.5478L16.5624 19.5767V19.5752ZM3.64184 15.9456L5.84701 19.2341L9.412 12.2939C11.0353 9.13476 14.238 7.17235 17.7716 7.17235H19.3337C19.5706 6.3356 19.4545 5.43728 18.9934 4.67316C18.4193 3.72432 17.4171 3.15754 16.3145 3.15754H14.0325C11.6768 3.15754 9.54218 4.46634 8.45998 6.57242L3.64497 15.9456H3.64184Z" />
    </svg>
  )
}

export default function NearBrand({ size = 'sm', className = '', ref }) {
  return (
    <div ref={ref} className={`near-brand near-brand--${size} ${className}`.trim()}>
      <IconNearLogo className="near-brand__icon" />
      <div className="near-brand__wordmark">
        <IconN />
        <IconE />
        <IconA />
        <IconR />
      </div>
    </div>
  )
}

/**
 * Near logo icon + wordmark (n e a r)
 * @param {string} size - 'sm' (header) | 'lg' (footer)
 * @param {string} className - extra classes
 */
export default function NearBrand({ size = 'sm', className = '' }) {
  return (
    <div className={`near-brand near-brand--${size} ${className}`.trim()}>
      <img src="/assets/icons/near-logo.svg" alt="Near Health" className="near-brand__icon" />
      <div className="near-brand__wordmark">
        <img src="/assets/icons/n.svg" alt="n" />
        <img src="/assets/icons/e.svg" alt="e" />
        <img src="/assets/icons/a.svg" alt="a" />
        <img src="/assets/icons/r.svg" alt="r" />
      </div>
    </div>
  )
}

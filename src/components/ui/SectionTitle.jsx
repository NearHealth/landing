/**
 * Shared section heading with optional subtitle
 * @param {React.ReactNode} children - heading text (can include <br/>)
 * @param {string} subtitle - optional subtitle text
 * @param {string} className - extra classes
 */
export default function SectionTitle({ children, subtitle, className = '' }) {
  return (
    <div className={`section-header ${className}`.trim()}>
      <h2 className="section-title">{children}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  )
}

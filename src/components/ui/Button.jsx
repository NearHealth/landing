/**
 * Shared Button component
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost'
 * @param {string} size - 'sm' | 'md'
 * @param {string} href - optional link (renders <a> instead of <button>)
 * @param {React.ReactNode} children
 */
export default function Button({ variant = 'primary', size = 'md', href, children, className = '', ...props }) {
  const cls = `btn btn--${variant} btn--${size} ${className}`.trim()

  if (href) {
    return <a href={href} className={cls} {...props}>{children}</a>
  }
  return <button className={cls} {...props}>{children}</button>
}

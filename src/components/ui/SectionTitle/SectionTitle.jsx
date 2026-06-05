export default function SectionTitle({
  children,
  br,
  brMobile,
  titleRef = null,
  className = '',
}) {
  const classes = ['section-title', className].filter(Boolean).join(' ')
  const lines = br || brMobile

  if (Array.isArray(lines)) {
    return (
      <h2 ref={titleRef} className={classes}>
        {lines[0]}
        <br className={brMobile ? 'mobile-br' : undefined} />
        {lines[1]}
      </h2>
    )
  }

  return <h2 ref={titleRef} className={classes}>{children}</h2>
}

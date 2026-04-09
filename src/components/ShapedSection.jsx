import { useFadeIn } from '../hooks/useScrollAnimation'

export default function ShapedSection() {
  const fade = useFadeIn()

  return (
    <section className="shaped-section" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <h2 className="section-title">Shaped by real-world use</h2>
        <div className="shaped-photo">
          <img src="/assets/images/member-experience.png" alt="Real-world healthcare" loading="lazy" />
        </div>
      </div>
    </section>
  )
}

import { useFadeIn } from '../hooks/useScrollAnimation'
import Button from './ui/Button'

export default function FooterCta() {
  const fade = useFadeIn()

  return (
    <section className="footer-cta" id="contact" ref={fade.ref}>
      <div className={`container ${fade.className}`}>
        <p className="footer-cta-text">Near connects enrollment to care - across brokers and providers. If you&rsquo;re an agency or provider organization, we&rsquo;d love to connect.</p>
        <div className="footer-cta-buttons">
          <Button variant="primary" href="#">Request a demo</Button>
          <Button variant="secondary" href="#">Talk to us</Button>
        </div>
      </div>
    </section>
  )
}

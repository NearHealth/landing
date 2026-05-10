import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import CareJourney from './components/CareJourney/CareJourney'
import MemberExperience from './components/MemberExperience/MemberExperience'
import HowItWorks from './components/HowItWorks/HowItWorks'
import PostEnrollment from './components/PostEnrollment/PostEnrollment'
import OnePlatform from './components/OnePlatform/OnePlatform'
import RealWorld from './components/RealWorld/RealWorld'
import ShapedSection from './components/ShapedSection/ShapedSection'
import CareConnected from './components/CareConnected/CareConnected'
import FooterCta from './components/FooterCta/FooterCta'
import Footer from './components/Footer/Footer'
import GridOverlay from './components/ui/GridOverlay/GridOverlay'
import { useLenis } from './hooks/useLenis'

export default function App() {
  useLenis()

  return (
    <>
      <Navbar />
      {/* Both layers are siblings AFTER <Navbar/> so the
          `.navbar--hidden ~ ...` CSS selectors can slide them together.
          `navbar-blur` carries the `backdrop-filter` (kept outside the
          navbar so the parent's `mix-blend-mode: difference` doesn't trap
          it). z-index in CSS keeps it visually below the navbar.
          `navbar-edge` is the real white hairline that escapes the blend. */}
      <div className="navbar-blur" aria-hidden="true" />
      <div className="navbar-edge" aria-hidden="true" />
      <Hero />
      <CareJourney />
      <MemberExperience />
      <HowItWorks />
      <PostEnrollment />
      <OnePlatform />
      <RealWorld />
      <ShapedSection />
      <CareConnected />
      <div className="footer-wrap">
        <FooterCta />
        <Footer />
      </div>
      {import.meta.env.DEV && <GridOverlay />}
    </>
  )
}

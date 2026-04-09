import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CareJourney from './components/CareJourney'
import MemberExperience from './components/MemberExperience'
import HowItWorks from './components/HowItWorks'
import PostEnrollment from './components/PostEnrollment'
import OnePlatform from './components/OnePlatform'
import RealWorld from './components/RealWorld'
import ShapedSection from './components/ShapedSection'
import CareConnected from './components/CareConnected'
import FooterCta from './components/FooterCta'
import FooterLogo from './components/FooterLogo'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <div className="page-gradient" aria-hidden="true"></div>
      <Navbar />
      <Hero />
      <CareJourney />
      <MemberExperience />
      <HowItWorks />
      <PostEnrollment />
      <OnePlatform />
      <RealWorld />
      <ShapedSection />
      <CareConnected />
      <FooterCta />
      <FooterLogo />
      <Footer />
    </>
  )
}

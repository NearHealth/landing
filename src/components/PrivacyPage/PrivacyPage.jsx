import LegalPage from '../LegalPage/LegalPage'
import { parseLegal } from '../../content/legal/parseLegal'
import privacyMd from '../../content/legal/privacy.md?raw'

// Privacy Policy — content lives in ../../content/legal/privacy.md (verbatim
// from the Figma "Privacy policy" frames); layout/background/header/footer come
// from the shared <LegalPage/>. Edit the prose in the Markdown file, not here.

const content = parseLegal(privacyMd)

export default function PrivacyPage() {
  return <LegalPage {...content} />
}

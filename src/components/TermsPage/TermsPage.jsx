import LegalPage from '../LegalPage/LegalPage'
import { parseLegal } from '../../content/legal/parseLegal'
import termsMd from '../../content/legal/terms.md?raw'

// Terms of Service — content lives in ../../content/legal/terms.md (verbatim
// from the Figma "Terms of Service" frames); layout/background/header/footer
// come from the shared <LegalPage/>. Edit the prose in the Markdown file, not
// here.

const content = parseLegal(termsMd)

export default function TermsPage() {
  return <LegalPage {...content} />
}

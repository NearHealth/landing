import LegalPage from '../LegalPage/LegalPage'

// Terms of Service — content only; layout/background/header/footer come from
// the shared <LegalPage/>. Text is verbatim from the Figma "Terms of Service"
// frames (nodes 317-223 desktop / 317-6484 mobile; identical copy).

const LAST_UPDATED = 'June 22, 2026'

const INTRO = [
  'Welcome to Near. These Terms of Service (“Terms”) govern your access to and use of the Near website.',
  'By using this website, you agree to these Terms. If you do not agree, you should not use the website.',
]

const SECTIONS_CONTENT = [
  {
    id: 'about-near',
    title: '1. About Near',
    blocks: [
      'NEARHEALTH LLC operates Near (“Near,” “we,” “our,” or “us”).',
      'Near is a healthcare technology company developing tools to improve coordination, access, and navigation across healthcare ecosystems, including brokers, FMOs, agencies, providers, MSOs, and related organizations.',
      'This website is currently intended for informational purposes only, including learning about Near, submitting interest forms, and communicating with our team.',
      'It does not provide medical advice, insurance advice, legal advice, financial advice, or healthcare services.',
    ],
  },
  {
    id: 'website-use',
    title: '2. Website Use',
    blocks: [
      'You may use this website for lawful purposes only, including learning about Near and submitting forms such as “Get Early Access” or “Talk to Us.”',
      'You agree not to:',
      [
        'Use the website for any unlawful or fraudulent purpose',
        'Submit false, misleading, or unauthorized information',
        'Attempt to interfere with the website’s security, performance, or functionality',
        'Copy, distribute, or exploit website content without permission',
        'Submit protected health information or other sensitive data through public forms',
      ],
    ],
  },
  {
    id: 'form-submissions',
    title: '3. Form Submissions',
    blocks: [
      'When you submit a form through the Near website, including “Get Early Access” or “Talk to Us,” you may provide information such as your name, work email, organization details, role, and any message you choose to include.',
      'Submitting a form does not create a customer relationship, provider relationship, broker relationship, partnership, employment relationship, or service agreement with NEARHEALTH LLC.',
      'Form submissions are for informational and communication purposes only and do not guarantee access to any product, service, or future availability.',
      'After submission, our team may contact you using the information provided.',
    ],
  },
  {
    id: 'no-advice',
    title: '4. No Medical or Insurance Advice',
    blocks: [
      'The content on this website is for general informational purposes only.',
      'NEARHEALTH LLC does not provide medical diagnosis, treatment, emergency care, insurance enrollment, legal advice, or financial advice through this website.',
      'If you are experiencing a medical emergency, call 911 or contact emergency services immediately.',
      'You should consult qualified professionals for any medical, insurance, legal, or financial decisions.',
    ],
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual Property',
    blocks: [
      'All content on this website, including text, graphics, logos, designs, and branding elements, is owned by NEARHEALTH LLC or its licensors and is protected by applicable intellectual property laws.',
      'You may not copy, reproduce, distribute, or use any content without prior written permission.',
    ],
  },
  {
    id: 'third-party-links',
    title: '6. Third-Party Links',
    blocks: [
      'This website may contain links to third-party websites or services. NEARHEALTH LLC is not responsible for the content, security, or privacy practices of those third parties.',
    ],
  },
  {
    id: 'availability-and-changes',
    title: '7. Availability and Changes',
    blocks: [
      'We may update, modify, suspend, or discontinue any part of the website at any time without notice.',
      'We may also update these Terms from time to time. Continued use of the website after updates constitutes acceptance of the revised Terms.',
    ],
  },
  {
    id: 'disclaimer',
    title: '8. Disclaimer',
    blocks: [
      'This website is provided on an “as is” and “as available” basis. We make no warranties regarding availability, accuracy, reliability, or uninterrupted access.',
    ],
  },
  {
    id: 'limitation-of-liability',
    title: '9. Limitation of Liability',
    blocks: [
      'To the fullest extent permitted by law, NEARHEALTH LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the website.',
    ],
  },
  {
    id: 'contact-us',
    title: '10. Contact Us',
    blocks: [{ contact: 'If you have any questions about these Terms, please contact us at:' }],
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS_CONTENT}
    />
  )
}

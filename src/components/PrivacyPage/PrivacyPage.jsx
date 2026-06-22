import LegalPage from '../LegalPage/LegalPage'

// Privacy Policy — content only; layout/background/header/footer come from the
// shared <LegalPage/>. Text is verbatim from the Figma "Privacy policy" frames
// (nodes 317-6222 desktop / 317-6485 mobile; identical copy).

const LAST_UPDATED = 'June 22, 2026'

const INTRO = [
  'NEARHEALTH LLC (“Near,” “we,” “our,” or “us”) respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you interact with our website and related online forms.',
  'This Privacy Policy applies to information collected through Near’s website, including forms such as “Get Early Access” and “Talk to Us,” as well as general website usage. It does not currently apply to any future platform, mobile application, provider portal, broker portal, patient portal, or other healthcare workflows, which may be governed by separate terms and privacy notices.',
]

const SECTIONS_CONTENT = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    blocks: [
      'When you submit a form or interact with our website, we may collect information you voluntarily provide, including:',
      [
        'Full name',
        'Work email address',
        'Company or organization name',
        'Role or job title',
        'Organization type (e.g., broker, agency, FMO, MSO, provider group, health system, or other)',
        'Organization size or business scale (if provided)',
        'Message or additional information you choose to submit',
      ],
      'We may also collect certain technical and usage data automatically, such as browser type, device information, IP address, pages visited, and general interaction analytics.',
    ],
  },
  {
    id: 'how-we-use-information',
    title: '2. How We Use Information',
    blocks: [
      'We may use the information we collect to:',
      [
        'Respond to inquiries and form submissions',
        'Follow up on interest in Near’s early access program or partnership opportunities',
        'Understand the types of organizations engaging with Near',
        'Segment interest across brokers, FMOs, agencies, MSOs, provider groups, and other stakeholders',
        'Improve our website, messaging, and user experience',
        'Support internal business development, product planning, and growth efforts',
      ],
      'We do not sell personal information submitted through our website.',
    ],
  },
  {
    id: 'healthcare-information',
    title: '3. Healthcare Information',
    blocks: [
      'Please do not submit protected health information (“PHI”), medical records, insurance claims, Social Security numbers, or other sensitive health data through our website forms.',
      'Our website is intended for general business inquiries, early access requests, and partnership discussions only, not for clinical, medical, or insurance transactions.',
    ],
  },
  {
    id: 'sharing-of-information',
    title: '4. Sharing of Information',
    blocks: [
      'We may share information with:',
      [
        'Internal team members and authorized personnel',
        'Advisors and contractors supporting our operations',
        'Service providers (e.g., hosting, analytics, CRM, and communication tools)',
      ],
      'These third parties are permitted to process information only as necessary to provide services to us.',
      'We may also disclose information if required by law, regulation, legal process, or to protect the rights, safety, or security of NEARHEALTH LLC, our users, or others.',
    ],
  },
  {
    id: 'data-security',
    title: '5. Data Security',
    blocks: [
      'We implement reasonable administrative, technical, and organizational safeguards to protect information submitted through our website.',
      'However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    id: 'cookies-and-analytics',
    title: '6. Cookies and Analytics',
    blocks: [
      'We may use cookies and similar technologies to:',
      [
        'Analyze website traffic and usage patterns',
        'Improve performance and user experience',
        'Support analytics and marketing effectiveness',
      ],
      'You may adjust your browser settings to manage or disable cookies.',
    ],
  },
  {
    id: 'third-party-services',
    title: '7. Third-Party Services',
    blocks: [
      'We may use third-party providers for services such as hosting, analytics, CRM, communications, and form processing. These providers may process data on our behalf in accordance with their own privacy policies.',
    ],
  },
  {
    id: 'your-choices',
    title: '8. Your Choices',
    blocks: [
      'You may contact us to request access, updates, or deletion of information you have submitted, subject to legal or operational requirements.',
      'You may also opt out of receiving marketing communications at any time using unsubscribe mechanisms or by contacting us directly.',
    ],
  },
  {
    id: 'updates-to-this-policy',
    title: '9. Updates to This Policy',
    blocks: [
      'We may update this Privacy Policy from time to time as our website, products, and services evolve. Updates will be posted on this page with a revised “Last updated” date.',
    ],
  },
  {
    id: 'contact-us',
    title: '10. Contact Us',
    blocks: [{ contact: 'If you have any questions about this Privacy Policy, you may contact us at:' }],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro={INTRO}
      sections={SECTIONS_CONTENT}
    />
  )
}

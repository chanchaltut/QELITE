// ═══════════════════════════════════════════════════════════
//  Privacy policy and terms of use — defaults for admin → "Legal pages".
// ═══════════════════════════════════════════════════════════

import { fromContent } from '../lib/content.js';
import { SITE } from './site.js';

export const LEGAL_UPDATED_DEFAULT = 'November 2026';

export const PRIVACY_DEFAULT = [
  { heading: 'Who we are', body: `${SITE.legalName} (“QELITE”, “we”, “us”) provides management system audit and certification services. This policy explains how we handle personal information collected through ${SITE.domain} and in the course of certification.` },
  { heading: 'Information we collect', body: 'Details you give us through forms, email, phone or WhatsApp, such as your name, organisation, contact details and the certification you are interested in. During certification we also receive information about your organisation and its management system. We collect basic technical data (browser type, pages visited) to keep the site secure.' },
  { heading: 'The certificate register', body: 'For every certificate we issue, the details printed on the certificate (organisation name, address, standard, scope, certificate number and dates) and its current status are available on our online register to anyone who enters the exact certificate number. The register cannot be browsed or searched by organisation name. Copies of certificates are shown only while they are valid.' },
  { heading: 'How we use information', body: 'To respond to enquiries, plan and carry out audits, make certification decisions, maintain the certificate register, meet our legal and accreditation obligations, and improve our website. We do not sell personal information.' },
  { heading: 'Sharing', body: 'We share information only where necessary: with auditors and technical experts bound by confidentiality, with our accreditation body when it assesses us, with service providers who host our systems under confidentiality obligations, or where the law requires it.' },
  { heading: 'Retention & security', body: 'Certification records are kept for at least the certification cycle and the period our accreditation rules require. Access is limited to people who need it, and administrative access is protected by individual accounts and passwords.' },
  { heading: 'Your choices', body: 'You can ask us to access or correct your personal information. Certificate register entries remain while the certificate exists, because their purpose is to let third parties confirm its status.' },
  { heading: 'Contact', body: `Questions about this policy can be sent to ${SITE.email}.` },
];

export const TERMS_DEFAULT = [
  { heading: 'Acceptance', body: `By using ${SITE.domain}, you agree to these terms. If you do not agree, please do not use the website.` },
  { heading: 'Certificate verification', body: 'The online register shows the status of a certificate at the moment you check it. The register is the authoritative record. If a printed or electronic copy of a certificate differs from the register, the register is correct. Automated or bulk querying of the register is not permitted.' },
  { heading: 'Information only', body: 'Content about standards and certification on this website is general information, not advice on how to implement any standard.' },
  { heading: 'Certification services', body: 'Certification is provided under a separate agreement that sets out scope, audit days, fees and the rights and obligations of both parties, including the rules for using certificates and certification marks.' },
  { heading: 'Intellectual property', body: `Website content, design, branding and certification marks belong to ${SITE.legalName} and may not be reproduced or used without permission. Standard names and numbers belong to their respective publishers.` },
  { heading: 'Liability', body: `To the extent permitted by law, ${SITE.legalName} is not liable for loss arising from reliance on general website content.` },
  { heading: 'Governing law', body: 'These terms are governed by the laws of India.' },
  { heading: 'Changes', body: 'We may update these terms from time to time. The date of the latest update is shown on this page.' },
];

export const LEGAL_UPDATED = fromContent('legal', 'updated', LEGAL_UPDATED_DEFAULT);
export const PRIVACY = fromContent('legal', 'privacy', PRIVACY_DEFAULT);
export const TERMS = fromContent('legal', 'terms', TERMS_DEFAULT);

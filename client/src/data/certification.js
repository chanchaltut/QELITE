// ═══════════════════════════════════════════════════════════
//  Certificate design and accreditation — defaults for
//  admin → "Certificate design" and "Accreditation & policies".
// ═══════════════════════════════════════════════════════════

import { fromContent } from '../lib/content.js';

export const CERTIFICATE_DEFAULT = {
  issuer: 'QELITE Certification Services',
  titles: ['Certificate of Registration', 'Certificate of Compliance'],
  assessedLine: 'Has been assessed and certified by {issuer}',
  propertyNote: 'This certificate is the property of QELITE and remains valid subject to satisfactory surveillance audits.',
  signatory: { name: '[Signatory name]', designation: 'Authorised Signatory', signature: '' },
  issuerAddress: ['[Office address line 1]', '[City, State PIN, India]'],
  accreditationCode: '[Accreditation code]',
  seals: [],
  verifyNote: 'To check the validity of this certificate, scan the QR code or visit {site}/verify',
  footer:
    'This certificate is issued by QELITE Certification Services and remains its property. It must be returned on request. The current status of this certificate can be confirmed at any time on the QELITE online register; the register is the authoritative record.',
  showQr: true,
};

const SEAL_SHAPE = [{ image: '', caption: '' }];

export const CERTIFICATE = fromContent('certificate', null, { ...CERTIFICATE_DEFAULT, seals: SEAL_SHAPE });

export const ACCREDITATION_DEFAULT = {
  intro:
    'Accreditation is independent confirmation that a certification body is competent, impartial and consistent. Below are QELITE’s accreditation details and the policies that govern how we certify, so you can check them for yourself.',
  bodies: [
    {
      name: '[Accreditation body]',
      code: '[Accreditation number]',
      scope: '[Standards and sectors covered by the accreditation]',
      validUntil: '',
      logo: '',
      url: '',
    },
  ],
  policies: [
    {
      heading: 'Impartiality',
      body: 'QELITE identifies, analyses and documents any threat to impartiality arising from its activities, relationships and people, and acts to remove or minimise it. Auditors declare any prior relationship with a client and are not assigned where a conflict exists. Certification decisions are made by personnel who did not take part in the audit. Commercial considerations do not influence certification decisions.',
    },
    {
      heading: 'Confidentiality',
      body: 'Information obtained during certification activities is treated as confidential and is not disclosed to third parties without the client’s written consent, except where the law requires it. The online register shows only the details printed on the certificate and its current status.',
    },
    {
      heading: 'Complaints',
      body: 'Anyone may raise a complaint about QELITE or about an organisation we certify. Complaints can be sent by email or through the contact form. We acknowledge each complaint, investigate it with personnel who were not involved in the matter, and tell the complainant the outcome.',
    },
    {
      heading: 'Appeals',
      body: 'A client may appeal any certification decision, such as a refusal, suspension or withdrawal, in writing within 30 days. Appeals are reviewed by a person or panel independent of the original decision, and the outcome is communicated in writing.',
    },
    {
      heading: 'Suspension, withdrawal and reduction of scope',
      body: 'Certification may be suspended when a client fails to allow surveillance audits on time, has unresolved major nonconformities, or misuses the certificate. If the cause is not resolved within the stated period, certification is withdrawn or the scope is reduced. All status changes are reflected in the online register straight away.',
    },
    {
      heading: 'Use of certificates and marks',
      body: 'Certified clients may refer to their certification only within the certified scope and sites, and must not use the certification mark on products, product packaging or test reports in a way that implies product certification. Use of the mark must stop immediately on suspension or withdrawal.',
    },
  ],
};

export const ACCREDITATION = fromContent('accreditation', null, ACCREDITATION_DEFAULT);

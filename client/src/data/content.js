// ═══════════════════════════════════════════════════════════
//  Home page, About page and FAQs — defaults for the admin panel.
// ═══════════════════════════════════════════════════════════

import { fromContent } from '../lib/content.js';

// ─── Home ───────────────────────────────────────────────────
export const HERO_DEFAULT = {
  eyebrow: 'Management system certification',
  title: 'Certification that stands up',
  titleAccent: 'to every check.',
  description:
    'QELITE audits and certifies management systems to ISO and industry standards. Every certificate we issue carries a QR code and can be verified online in seconds, by your customers, auditors or tender committees.',
  primaryCta: { label: 'Request a quote', href: '/contact' },
  secondaryCta: { label: 'Explore standards', href: '/certifications' },
  proof: [
    { value: '3-year', label: 'cycle with annual surveillance' },
    { value: '24×7', label: 'online certificate verification' },
    { value: 'QR', label: 'code on every certificate' },
  ],
};

export const WHY_US_DEFAULT = [
  { icon: 'ri-scales-line', title: 'Impartial by design', desc: 'No auditor reviews work they were involved in, and every certification decision is taken by someone who was not on the audit team.' },
  { icon: 'ri-user-star-line', title: 'Auditors who know your sector', desc: 'Audit teams are matched to your industry, so the questions are relevant and the findings make practical sense.' },
  { icon: 'ri-price-tag-3-line', title: 'One fee for the whole cycle', desc: 'You get a written quote covering the initial audit, both surveillance audits and certificate issue, with no surprises in year two.' },
  { icon: 'ri-qr-code-line', title: 'Certificates anyone can verify', desc: 'Every certificate has a QR code and appears in our online register, so a buyer can confirm its status in seconds.' },
  { icon: 'ri-calendar-check-line', title: 'Audits on your timeline', desc: 'Stage 1 and Stage 2 are scheduled around your operations, with remote options where the standard allows.' },
  { icon: 'ri-file-text-line', title: 'Reports in plain English', desc: 'Findings are clear, graded and tied to the clause they relate to, so your team knows exactly what to do next.' },
];

export const JOURNEY_DEFAULT = [
  { when: 'Week 1', title: 'Application & quote', desc: 'Tell us your scope, sites and headcount. We confirm the audit days and a fixed fee for the full three-year cycle.' },
  { when: 'Week 2–4', title: 'Stage 1 audit', desc: 'A readiness review of your documentation, scope and planning. Any gaps are flagged before the main audit.' },
  { when: 'Week 3–8', title: 'Stage 2 audit', desc: 'We assess on site (or remotely, where allowed) whether your system is implemented and effective.' },
  { when: 'After closure', title: 'Certification decision', desc: 'An independent reviewer checks the audit file. Your certificate is issued and added to the online register.' },
  { when: 'Year 1 & 2', title: 'Surveillance audits', desc: 'Shorter annual audits confirm that the system continues to work and improve. Dates are printed on your certificate.' },
  { when: 'Year 3', title: 'Re-certification', desc: 'A full re-assessment before expiry renews your certificate for another three-year cycle.' },
];

export const INDUSTRIES_DEFAULT = [
  { icon: 'ri-settings-5-line', name: 'Manufacturing' },
  { icon: 'ri-heart-pulse-line', name: 'Healthcare & medical devices' },
  { icon: 'ri-restaurant-2-line', name: 'Food & beverage' },
  { icon: 'ri-code-s-slash-line', name: 'IT & software' },
  { icon: 'ri-building-2-line', name: 'Construction & engineering' },
  { icon: 'ri-capsule-line', name: 'Pharma & nutraceuticals' },
  { icon: 'ri-truck-line', name: 'Logistics & warehousing' },
  { icon: 'ri-graduation-cap-line', name: 'Education & training' },
  { icon: 'ri-hotel-line', name: 'Hospitality' },
  { icon: 'ri-flashlight-line', name: 'Energy & utilities' },
  { icon: 'ri-government-line', name: 'Government suppliers' },
  { icon: 'ri-store-2-line', name: 'Trading & distribution' },
];

// Shown only once real testimonials (with permission) are added in the admin panel
export const TESTIMONIALS_DEFAULT = [];

export const HOME_SECTIONS_DEFAULT = {
  standardsStrip: true,
  standards: true,
  verification: true,
  journey: true,
  whyUs: true,
  industries: true,
  testimonials: true,
  faq: true,
  cta: true,
};

const TESTIMONIAL_SHAPE = [{ quote: '', name: '', role: '', city: '' }];

export const HERO = fromContent('home', 'hero', HERO_DEFAULT);
export const WHY_US = fromContent('home', 'whyUs', WHY_US_DEFAULT);
export const JOURNEY = fromContent('home', 'journey', JOURNEY_DEFAULT);
export const INDUSTRIES = fromContent('home', 'industries', INDUSTRIES_DEFAULT);
export const TESTIMONIALS = fromContent('home', 'testimonials', TESTIMONIAL_SHAPE).filter((t) => t.quote && t.name);
export const HOME_SECTIONS = fromContent('home', 'sections', HOME_SECTIONS_DEFAULT);

// ─── About ──────────────────────────────────────────────────
export const ABOUT_DEFAULT = {
  heading: 'Certification you can explain to anyone.',
  story: [
    'QELITE was set up to make management system certification easier to buy, easier to plan for and easier to trust. Too many organisations reach certification without knowing what the audit will look at, what the full cycle will cost, or how a customer can check the certificate they were handed.',
    'We work the other way around. Scope, audit days and fees are agreed in writing before work starts. Audits are run by people who understand your sector. And every certificate we issue is published in a live register that anyone can check with the certificate number or by scanning the QR code.',
    'Behind that sits a simple principle: a certificate is only worth something if the audit behind it was impartial and competent, and if its status can be confirmed at any time.',
  ],
  mission: 'To issue certificates that mean what they say, backed by impartial audits and verifiable by anyone, at any time.',
  values: [
    { icon: 'ri-scales-line', title: 'Impartiality', desc: 'Certification decisions are separated from audit and commercial roles, and conflicts of interest are declared and managed.' },
    { icon: 'ri-award-line', title: 'Competence', desc: 'Auditors are qualified for the standards and sectors they audit, and their performance is monitored.' },
    { icon: 'ri-eye-line', title: 'Transparency', desc: 'Clear scopes, written fees and a public register of certificate status.' },
    { icon: 'ri-lock-line', title: 'Confidentiality', desc: 'What we see during an audit stays with us, unless the law requires otherwise.' },
  ],
  leadership: [],
};

const LEADER_SHAPE = [{ name: '', role: '', bio: '', image: '', linkedin: '' }];

export const ABOUT = fromContent('about', null, { ...ABOUT_DEFAULT, leadership: LEADER_SHAPE });
export const LEADERSHIP = (ABOUT.leadership || []).filter((p) => p.name);

// ─── FAQs ───────────────────────────────────────────────────
export const GENERAL_FAQS_DEFAULT = [
  { q: 'What does certification involve?', a: 'Certification is a two-stage audit. Stage 1 reviews your documentation and readiness, and Stage 2 confirms that your management system is implemented and effective. Once any nonconformities are closed, an independent reviewer makes the certification decision and the certificate is issued.' },
  { q: 'How long does it take?', a: 'Organisations with their system already in place usually complete certification in four to eight weeks from application. Larger, multi-site or higher-risk scopes take longer. We give you a timeline with the quote.' },
  { q: 'How much does certification cost?', a: 'Fees depend on the standard, your headcount, the number of sites and the complexity of your activities, which together set the number of audit days. We quote a fixed fee for the whole three-year cycle: initial certification and both surveillance audits.' },
  { q: 'How long is a certificate valid?', a: 'Three years, subject to satisfactory surveillance audits in years one and two. The surveillance and re-certification dates are printed on the certificate.' },
  { q: 'Can we transfer an existing certificate to QELITE?', a: 'Usually, yes, provided the current certificate is valid and there are no open major nonconformities. We review your current certificate and last audit report before accepting the transfer.' },
  { q: 'Can one audit cover several standards?', a: 'Yes. ISO 9001, ISO 14001 and ISO 45001, for example, share the same structure and can be audited together as an integrated management system, which reduces total audit time.' },
];

export const VERIFICATION_FAQS_DEFAULT = [
  { q: 'Where do I find the certificate number?', a: 'It is printed on the certificate below the scope of activities, after “Certificate No.”. Scanning the QR code on the certificate opens this page with the number already filled in.' },
  { q: 'What do the statuses mean?', a: 'Valid: the certificate is current. Suspended: certification is temporarily on hold and must not be claimed. Withdrawn: certification has been cancelled. Expired: the three-year cycle ended without re-certification.' },
  { q: 'The certificate is not found. What should I do?', a: 'Check the number character by character; letters such as O and digits such as 0 are easy to confuse. Spaces, slashes and hyphens do not matter. If it still is not found, the certificate was not issued by QELITE. Please report it to us so we can investigate.' },
  { q: 'Can I see a copy of the certificate?', a: 'For valid certificates, a copy is shown under the verification result. The register is the authoritative record. If a printed certificate differs from the register, the register is correct.' },
  { q: 'Is the register public?', a: 'Anyone with a certificate number can check it. To protect our clients, the register cannot be browsed or searched by company name.' },
];

export const GENERAL_FAQS = fromContent('faqs', 'general', GENERAL_FAQS_DEFAULT);
export const VERIFICATION_FAQS = fromContent('faqs', 'verification', VERIFICATION_FAQS_DEFAULT);

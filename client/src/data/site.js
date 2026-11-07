// ═══════════════════════════════════════════════════════════
//  QELITE — Site settings and menu
//  Defaults for admin → "Site settings" and "Menu". Published content
//  from the admin panel overrides these (src/lib/content.js).
//
//  Any value wrapped in [square brackets] is a PLACEHOLDER awaiting the
//  client's input. Placeholders are never shown on the live site: the
//  element that would display one is skipped instead.
// ═══════════════════════════════════════════════════════════

import { fromContent } from '../lib/content.js';
import { isPlaceholder } from '../lib/format.js';

export const SITE_DEFAULT = {
  demoMode: false, // true highlights [placeholders] for content review

  name: 'QELITE',
  legalName: 'QELITE Certification Services',
  tagline: 'Management System Certification',
  description:
    'QELITE audits and certifies management systems to ISO and industry standards, including quality, environment, health and safety, food safety, information security and medical devices. Every certificate it issues can be checked online.',

  url: 'https://www.qelite.in',
  domain: 'qelite.in',

  phone: {
    display: '[Phone number]',
    tel: '',
  },
  whatsapp: '',
  whatsappDisplay: '[WhatsApp number]',
  email: 'contact@qelite.in',

  address: {
    street: '[Office address]',
    city: '[City]',
    region: '',
    postalCode: '',
    country: 'India',
    countryCode: 'IN',
    mapUrl: '',
    mapEmbedUrl: '',
  },

  hours: '[Mon – Sat, 10:00 AM – 6:00 PM]',
  founded: '[Year established]',

  // Blank links are hidden
  social: {
    linkedin: '',
    facebook: '',
    instagram: '',
    x: '',
    youtube: '',
  },

  logo: '', // uploaded from the admin panel; blank = built-in logo

  ogImage: '/og-image.jpg',

  announcement: { enabled: false, text: '', linkLabel: '', href: '', startsAt: '', endsAt: '' },
  features: { floatingButtons: true },
  footerDisclaimer:
    'Certification confirms that an organisation’s management system met the requirements of the stated standard at the time of audit. It is not a guarantee of any product or service. Always confirm a certificate’s current status on the QELITE online register.',
};

export const SITE = fromContent('settings', null, SITE_DEFAULT);

/** True when a value is filled in (not blank, not a [placeholder]). */
export const filled = (v) => typeof v === 'string' && v.trim() !== '' && !isPlaceholder(v);

export const hasPhone = () => filled(SITE.phone?.display) && filled(SITE.phone?.tel);
export const hasWhatsapp = () => filled(SITE.whatsapp);

export const fullAddress = () => {
  const a = SITE.address || {};
  return [a.street, a.city, a.postalCode, a.country].filter(filled).join(', ');
};

export const waLink = (message = `Hello ${SITE.name}, I would like to know more about certification.`) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

/** Address of the public verification page for a certificate number (printed as a QR code). */
export const verifyUrl = (number) => `${SITE.url}/verify${number ? `?cert=${encodeURIComponent(number)}` : ''}`;

export const NAV_DEFAULT = [
  { name: 'Certifications', href: '/certifications', menu: 'certifications' },
  { name: 'Verify a certificate', href: '/verify', menu: '' },
  { name: 'Accreditation', href: '/accreditation', menu: '' },
  { name: 'About', href: '/about', menu: '' },
  { name: 'Contact', href: '/contact', menu: '' },
];

export const NAV = fromContent('navigation', 'main', NAV_DEFAULT);

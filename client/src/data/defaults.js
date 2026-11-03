// ═══════════════════════════════════════════════════════════
//  The site's built-in content, shaped as admin-panel documents.
//  The API imports this on first start, so the admin panel opens
//  with exactly what the website shows. Runs in Node and the browser.
// ═══════════════════════════════════════════════════════════

import { SITE_DEFAULT, NAV_DEFAULT } from './site.js';
import {
  HERO_DEFAULT, WHY_US_DEFAULT, JOURNEY_DEFAULT, INDUSTRIES_DEFAULT, TESTIMONIALS_DEFAULT, HOME_SECTIONS_DEFAULT,
  ABOUT_DEFAULT, GENERAL_FAQS_DEFAULT, VERIFICATION_FAQS_DEFAULT,
} from './content.js';
import { STANDARDS_DEFAULT } from './standards.js';
import { CERTIFICATE_DEFAULT, ACCREDITATION_DEFAULT } from './certification.js';
import { LEGAL_UPDATED_DEFAULT, PRIVACY_DEFAULT, TERMS_DEFAULT } from './legal.js';

// JSON round-trip drops functions and undefined values
const plain = (value) => JSON.parse(JSON.stringify(value));

export function buildDefaults() {
  return plain({
    settings: SITE_DEFAULT,
    navigation: { main: NAV_DEFAULT },
    home: {
      hero: HERO_DEFAULT,
      whyUs: WHY_US_DEFAULT,
      journey: JOURNEY_DEFAULT,
      industries: INDUSTRIES_DEFAULT,
      testimonials: TESTIMONIALS_DEFAULT,
      sections: HOME_SECTIONS_DEFAULT,
    },
    pages: { items: [] },
    standards: { items: STANDARDS_DEFAULT },
    certificate: CERTIFICATE_DEFAULT,
    accreditation: ACCREDITATION_DEFAULT,
    about: ABOUT_DEFAULT,
    faqs: { general: GENERAL_FAQS_DEFAULT, verification: VERIFICATION_FAQS_DEFAULT },
    legal: { updated: LEGAL_UPDATED_DEFAULT, privacy: PRIVACY_DEFAULT, terms: TERMS_DEFAULT },
    inbox: { notifyEmails: SITE_DEFAULT.email },
  });
}

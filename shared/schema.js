// ═══════════════════════════════════════════════════════════
//  Content schema — single source of truth for website management.
//
//  Each content key is one editable document (Site settings, Home page,
//  Standards, …). The same definitions drive:
//    • the admin forms        (client/src/admin)
//    • server-side validation (server/src)
//    • build-time validation  (client/scripts/fetch-snapshot.mjs)
//
//  Certificates are NOT content: they live in their own database
//  collection and are looked up at runtime (see shared/certificates.js).
//
//  Plain JavaScript with no dependencies, so it runs in the browser,
//  in Node and at build time unchanged.
// ═══════════════════════════════════════════════════════════

// ─── Field helpers ──────────────────────────────────────────
const f = (type) => (label, opts = {}) => ({ type, label, ...opts });
const text = f('text');
const textarea = f('textarea');
const toggle = f('toggle');
const url = f('url');
const image = f('image');
const date = f('date');
const icon = f('icon');
const strings = f('strings'); // array of short strings
const select = (label, options, opts = {}) => ({ type: 'select', label, options, ...opts });
const group = (label, fields, opts = {}) => ({ type: 'group', label, fields, ...opts });
const list = (label, fields, opts = {}) => ({ type: 'list', label, fields, ...opts });

const qa = { q: text('Question', { required: true, max: 300 }), a: textarea('Answer', { required: true, max: 2000 }) };
const faqList = (label, help) => list(label, qa, { itemLabel: 'q', addLabel: 'Add question', help });
const slug = (label = 'URL slug') =>
  text(label, { required: true, slug: true, unique: true, help: 'Lowercase letters, numbers and hyphens. Changing it changes the page address.' });
const ICON_HELP = 'Remix icon class, e.g. ri-shield-check-line — browse at remixicon.com';
const HIDE_HELP = 'Leave blank to hide.';

export const STANDARD_FAMILIES = [
  'Quality', 'Environment', 'Health & Safety', 'Food Safety', 'Information & IT',
  'Medical Devices', 'Energy', 'Business Continuity', 'Product Compliance', 'Social & Governance',
];
export const PAGE_PATHS = [
  '/', '/verify', '/certifications', '/accreditation', '/about', '/contact', '/faqs', '/privacy-policy', '/terms-conditions',
];

// ─── Content keys ───────────────────────────────────────────
export const CONTENT = {
  settings: {
    title: 'Site settings',
    section: 'Website',
    icon: 'ri-settings-3-line',
    description: 'Company name, contact details, address, social links, announcement bar and site-wide switches.',
    fields: {
      name: text('Brand name', { required: true, max: 60 }),
      legalName: text('Legal / certification body name', { required: true, max: 120, help: 'Printed on certificates and in the footer.' }),
      tagline: text('Tagline', { max: 120 }),
      description: textarea('Short description', { max: 400, help: 'Used in the footer and as the default Google description.' }),
      phone: group('Phone', {
        display: text('Phone (as shown)', { max: 30, help: HIDE_HELP }),
        tel: text('Phone (for dialling)', { max: 20, help: 'With country code, no spaces, e.g. +911100000000' }),
      }),
      whatsapp: text('WhatsApp number', { max: 20, help: `Digits only with country code, e.g. 919900000000. ${HIDE_HELP}` }),
      whatsappDisplay: text('WhatsApp (as shown)', { max: 30 }),
      email: text('Email', { required: true, max: 120 }),
      address: group('Office address', {
        street: text('Street', { help: HIDE_HELP }),
        city: text('City'),
        region: text('State / region'),
        postalCode: text('PIN code'),
        country: text('Country'),
        countryCode: text('Country code', { max: 2 }),
        mapUrl: url('Google Maps link', { help: 'Used for “Get directions”.' }),
        mapEmbedUrl: url('Map embed URL', { help: 'Google Maps → Share → Embed a map → copy only the src="…" link.' }),
      }),
      hours: text('Office hours', { help: HIDE_HELP }),
      founded: text('Year established', { help: HIDE_HELP }),
      social: group('Social links', {
        linkedin: url('LinkedIn', { help: HIDE_HELP }),
        facebook: url('Facebook', { help: HIDE_HELP }),
        instagram: url('Instagram', { help: HIDE_HELP }),
        x: url('X (Twitter)', { help: HIDE_HELP }),
        youtube: url('YouTube', { help: HIDE_HELP }),
      }),
      logo: image('Logo', { help: 'Wide logo on a transparent background (SVG, PNG or WebP). Leave blank to use the built-in logo.' }),
      ogImage: image('Default share image', { help: '1200 × 630 px — shown when a page is shared on WhatsApp, LinkedIn, etc.' }),
      announcement: group('Announcement bar', {
        enabled: toggle('Show announcement bar'),
        text: text('Message', { max: 160 }),
        linkLabel: text('Link text', { max: 40 }),
        href: text('Link', { help: 'A page path such as /verify, or a full URL.' }),
        startsAt: date('Show from', { help: 'Optional.' }),
        endsAt: date('Show until', { help: 'Optional — hides automatically after this date.' }),
      }),
      features: group('Site features', {
        floatingButtons: toggle('Floating call & WhatsApp buttons'),
      }),
      footerDisclaimer: textarea('Footer disclaimer', { max: 600 }),
      url: url('Website address', { required: true, help: 'Only change this if the domain changes. Printed in certificate QR codes.' }),
      domain: text('Domain', { required: true }),
      demoMode: toggle('Review mode', { help: 'Highlights missing [placeholder] content. Keep off on the live site.' }),
    },
  },

  navigation: {
    title: 'Menu',
    section: 'Website',
    icon: 'ri-menu-line',
    description: 'Header menu items.',
    fields: {
      main: list('Main menu', {
        name: text('Label', { required: true, max: 30 }),
        href: text('Link', { required: true }),
        menu: select('Drop-down', [['', 'None'], ['certifications', 'Certifications']]),
      }, { itemLabel: 'name', addLabel: 'Add menu item' }),
    },
  },

  home: {
    title: 'Home page',
    section: 'Website',
    icon: 'ri-home-4-line',
    description: 'Hero, figures, why-us, certification journey, industries, testimonials and which sections are shown.',
    fields: {
      hero: group('Hero', {
        eyebrow: text('Small heading', { max: 80 }),
        title: text('Headline', { required: true, max: 80 }),
        titleAccent: text('Headline — highlighted words', { max: 60, help: 'Shown in mint italics after the headline.' }),
        description: textarea('Description', { max: 320 }),
        primaryCta: group('Main button', { label: text('Text', { required: true }), href: text('Link', { required: true }) }),
        secondaryCta: group('Second button', { label: text('Text'), href: text('Link') }),
        proof: list('Figures', { value: text('Figure', { required: true, max: 12 }), label: text('Label', { required: true, max: 40 }) }, { itemLabel: 'label', max: 4 }),
      }),
      whyUs: list('Why QELITE', { icon: icon('Icon', { help: ICON_HELP }), title: text('Title', { required: true }), desc: textarea('Text') }, { itemLabel: 'title' }),
      journey: list('Certification journey', {
        when: text('When', { help: 'e.g. Week 1, Year 1' }),
        title: text('Step', { required: true }),
        desc: textarea('Text'),
      }, { itemLabel: 'title' }),
      industries: list('Industries', { icon: icon('Icon', { help: ICON_HELP }), name: text('Industry', { required: true }) }, { itemLabel: 'name' }),
      testimonials: list('Testimonials', {
        quote: textarea('Quote', { required: true }),
        name: text('Name', { required: true }),
        role: text('Designation, company'),
        city: text('City'),
      }, { itemLabel: 'name', help: 'The section stays hidden until at least one real testimonial is added.' }),
      sections: group('Show sections', {
        standardsStrip: toggle('Moving strip of standards'),
        standards: toggle('Certification programmes'),
        verification: toggle('Verification explainer'),
        journey: toggle('Certification journey'),
        whyUs: toggle('Why QELITE'),
        industries: toggle('Industries'),
        testimonials: toggle('Testimonials'),
        faq: toggle('FAQs'),
        cta: toggle('Closing call-to-action'),
      }),
    },
  },

  pages: {
    title: 'Pages & SEO',
    section: 'Website',
    icon: 'ri-pages-line',
    description: 'Google title and description, and the heading block, of each inner page. Only fill in what you want to change.',
    fields: {
      items: list('Page overrides', {
        path: select('Page', PAGE_PATHS, { required: true, unique: true }),
        title: text('Google title', { max: 70, help: 'About 50–60 characters.' }),
        description: textarea('Google description', { max: 170, help: 'About 140–160 characters.' }),
        eyebrow: text('Small heading'),
        heading: text('Page heading'),
        accent: text('Heading — italic words'),
        intro: textarea('Intro text'),
        noindex: toggle('Hide from Google'),
      }, { itemLabel: 'path', addLabel: 'Add page' }),
    },
  },

  standards: {
    title: 'Standards',
    section: 'Certification',
    icon: 'ri-medal-line',
    description: 'Every certification programme, its page and its FAQs. Turn off “Show on website” to hide one.',
    fields: {
      items: list('Standards', {
        code: text('Standard', { required: true, max: 40, help: 'e.g. ISO 9001:2015' }),
        title: text('Name', { required: true, max: 90, help: 'e.g. Quality Management System' }),
        slug: slug(),
        family: select('Family', STANDARD_FAMILIES, { required: true }),
        icon: icon('Icon', { help: ICON_HELP }),
        visible: toggle('Show on website'),
        featured: toggle('Feature on the home page'),
        shortDesc: textarea('Short description', { required: true, max: 260 }),
        overview: textarea('Overview', { required: true, max: 1600 }),
        whoFor: strings('Who it is for'),
        benefits: strings('Benefits'),
        focus: strings('What the audit looks at'),
        faqs: faqList('FAQs'),
      }, { itemLabel: 'code', addLabel: 'Add standard' }),
    },
  },

  certificate: {
    title: 'Certificate design',
    section: 'Certification',
    icon: 'ri-award-line',
    description: 'The wording, signatory and seals printed on every certificate QELITE generates.',
    fields: {
      issuer: text('Issued by (as printed)', { required: true, max: 120, help: 'e.g. QELITE Certification Services' }),
      titles: strings('Certificate titles to choose from', { help: 'e.g. Certificate of Registration, Certificate of Compliance' }),
      assessedLine: text('Assessment sentence', { required: true, max: 160, help: '{issuer} is replaced with the name above.' }),
      propertyNote: textarea('Validity note', { max: 300 }),
      signatory: group('Signatory', {
        name: text('Name', { help: HIDE_HELP }),
        designation: text('Designation'),
        signature: image('Signature image', { help: 'Transparent PNG of the signature, about 600 × 200 px.' }),
      }),
      issuerAddress: strings('Issuer address lines'),
      accreditationCode: text('Accreditation code', { help: `Printed under the seals. ${HIDE_HELP}` }),
      seals: list('Seals and marks', {
        image: image('Image', { required: true, help: 'Square, transparent PNG. Only use marks you are licensed to use.' }),
        caption: text('Caption'),
      }, { itemLabel: 'caption', max: 4 }),
      verifyNote: text('Verification line', { max: 160, help: '{site} is replaced with the website address.' }),
      footer: textarea('Small print', { max: 600 }),
      showQr: toggle('Print a verification QR code'),
    },
  },

  accreditation: {
    title: 'Accreditation & policies',
    section: 'Certification',
    icon: 'ri-shield-star-line',
    description: 'The accreditation page: accreditation details, impartiality, complaints and appeals, and other policies.',
    fields: {
      intro: textarea('Introduction', { max: 800 }),
      bodies: list('Accreditations', {
        name: text('Accreditation body', { required: true }),
        code: text('Accreditation number'),
        scope: textarea('Scope'),
        validUntil: text('Valid until', { help: HIDE_HELP }),
        logo: image('Logo / mark'),
        url: url('Verification link', { help: 'Where visitors can check the accreditation on the accreditor’s website.' }),
      }, { itemLabel: 'name', addLabel: 'Add accreditation', help: 'Only list accreditations that are current and can be checked on the accreditor’s website.' }),
      policies: list('Policies', {
        heading: text('Heading', { required: true }),
        body: textarea('Text', { required: true, max: 3000 }),
      }, { itemLabel: 'heading', addLabel: 'Add policy' }),
    },
  },

  about: {
    title: 'About',
    section: 'Company',
    icon: 'ri-building-line',
    description: 'The About page: story, mission, values and leadership.',
    fields: {
      heading: text('Heading', { required: true }),
      story: strings('Story paragraphs', { multiline: true }),
      mission: textarea('Mission statement', { max: 400 }),
      values: list('Values', { icon: icon('Icon', { help: ICON_HELP }), title: text('Title', { required: true }), desc: textarea('Text') }, { itemLabel: 'title' }),
      leadership: list('Leadership', {
        name: text('Name', { required: true }),
        role: text('Designation'),
        bio: textarea('Short profile', { max: 500 }),
        image: image('Photo', { help: 'Portrait 4:5 works best.' }),
        linkedin: url('LinkedIn'),
      }, { itemLabel: 'name', addLabel: 'Add person', help: 'The section stays hidden until at least one profile is filled in.' }),
    },
  },

  faqs: {
    title: 'FAQs',
    section: 'Company',
    icon: 'ri-question-answer-line',
    description: 'General and verification FAQs. Standard-specific FAQs are edited under Standards.',
    fields: {
      general: faqList('General', 'Shown on the home page and the FAQs page.'),
      verification: faqList('Certificate verification', 'Shown on the Verify page and the FAQs page.'),
    },
  },

  legal: {
    title: 'Legal pages',
    section: 'Company',
    icon: 'ri-scales-3-line',
    description: 'Privacy policy and terms of use.',
    fields: {
      updated: text('Last updated', { required: true, help: 'e.g. November 2026' }),
      privacy: list('Privacy policy', { heading: text('Heading', { required: true }), body: textarea('Text', { required: true }) }, { itemLabel: 'heading', addLabel: 'Add section' }),
      terms: list('Terms of use', { heading: text('Heading', { required: true }), body: textarea('Text', { required: true }) }, { itemLabel: 'heading', addLabel: 'Add section' }),
    },
  },

  inbox: {
    title: 'Form settings',
    section: 'Inbox',
    icon: 'ri-mail-settings-line',
    description: 'Who is emailed when a form is submitted. Never shown on the website.',
    private: true,
    fields: {
      notifyEmails: text('Send form alerts to', { help: 'One or more email addresses, separated by commas.' }),
    },
  },
};

export const CONTENT_KEYS = Object.keys(CONTENT);
export const PUBLIC_KEYS = CONTENT_KEYS.filter((k) => !CONTENT[k].private);

// ─── Validation ─────────────────────────────────────────────
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const isBlank = (v) => v == null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);
const optionValue = (o) => (Array.isArray(o) ? o[0] : o);

function validateField(field, value, path, errors) {
  if (isBlank(value)) {
    if (field.required) errors.push({ path, message: `${field.label} is required` });
    return;
  }
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'icon':
    case 'url':
    case 'image':
    case 'file':
      if (typeof value !== 'string') return errors.push({ path, message: `${field.label} must be text` });
      if (field.max && value.length > field.max) errors.push({ path, message: `${field.label} is too long (max ${field.max} characters)` });
      if (field.slug && !SLUG_RE.test(value)) errors.push({ path, message: `${field.label} may only contain lowercase letters, numbers and hyphens` });
      return;
    case 'date':
      if (typeof value !== 'string' || !DATE_RE.test(value) || Number.isNaN(Date.parse(value))) errors.push({ path, message: `${field.label} must be a valid date` });
      return;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) errors.push({ path, message: `${field.label} must be a number` });
      return;
    case 'toggle':
      if (typeof value !== 'boolean') errors.push({ path, message: `${field.label} must be on or off` });
      return;
    case 'select':
      if (!field.options.map(optionValue).includes(value)) errors.push({ path, message: `${field.label} has an unknown value` });
      return;
    case 'strings':
    case 'paragraphs':
      if (!Array.isArray(value) || value.some((s) => typeof s !== 'string')) errors.push({ path, message: `${field.label} must be a list of text` });
      return;
    case 'group':
      if (typeof value !== 'object' || Array.isArray(value)) return errors.push({ path, message: `${field.label} is malformed` });
      validateFields(field.fields, value, path, errors);
      return;
    case 'list': {
      if (!Array.isArray(value)) return errors.push({ path, message: `${field.label} must be a list` });
      if (field.max && value.length > field.max) errors.push({ path, message: `${field.label}: at most ${field.max} items` });
      value.forEach((item, i) => {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) return errors.push({ path: `${path}.${i}`, message: `${field.label} item ${i + 1} is malformed` });
        validateFields(field.fields, item, `${path}.${i}`, errors);
      });
      Object.entries(field.fields).forEach(([k, sub]) => {
        if (!sub.unique) return;
        const seen = new Map();
        value.forEach((item, i) => {
          const v = item?.[k];
          if (isBlank(v)) return;
          if (seen.has(v)) errors.push({ path: `${path}.${i}.${k}`, message: `${sub.label} “${v}” is used twice in ${field.label}` });
          seen.set(v, i);
        });
      });
      return;
    }
    default:
  }
}

function validateFields(fields, obj, path, errors) {
  Object.entries(fields).forEach(([k, field]) => validateField(field, obj?.[k], path ? `${path}.${k}` : k, errors));
}

/** Returns a list of { path, message }; empty when the document is valid. Unknown keys are allowed and kept. */
export function validateContent(key, data) {
  const def = CONTENT[key];
  if (!def) return [{ path: '', message: `Unknown content “${key}”` }];
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return [{ path: '', message: 'Content is malformed' }];
  const errors = [];
  validateFields(def.fields, data, '', errors);
  return errors;
}

/** Validates every public key of a published snapshot's content. */
export function validateSnapshot(content) {
  const errors = [];
  if (typeof content !== 'object' || content === null) return [{ path: '', message: 'Snapshot is empty' }];
  Object.entries(content).forEach(([key, data]) => {
    if (!CONTENT[key] || CONTENT[key].private) return;
    validateContent(key, data).forEach((e) => errors.push({ ...e, path: `${key}.${e.path}` }));
  });
  return errors;
}

/** An empty value of the right shape for a new list item or group. */
export function emptyValue(field) {
  switch (field.type) {
    case 'toggle': return false;
    case 'number': return null;
    case 'strings':
    case 'paragraphs':
    case 'list': return [];
    case 'group': return Object.fromEntries(Object.entries(field.fields).map(([k, sub]) => [k, emptyValue(sub)]));
    case 'select': return field.required ? optionValue(field.options[0]) : '';
    default: return '';
  }
}

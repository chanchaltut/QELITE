// Every public page, with its sitemap settings. Used by the sitemap
// (generate-seo-files.mjs) and by prerender.mjs, so the two never drift apart.
// Certificate results (/verify?cert=…) are never prerendered or listed: they are
// looked up live, one exact number at a time.
import { STANDARDS } from '../src/data/standards.js';

/** [path, changefreq, priority, lastmod?] */
export const PAGES = [
  ['/', 'weekly', '1.0'],
  ['/verify', 'monthly', '0.9'],
  ['/certifications', 'monthly', '0.9'],
  ...STANDARDS.map((s) => [`/certifications/${s.slug}`, 'monthly', '0.8']),
  ['/accreditation', 'monthly', '0.7'],
  ['/about', 'monthly', '0.6'],
  ['/faqs', 'monthly', '0.6'],
  ['/contact', 'yearly', '0.6'],
];

/** Pages prerendered to HTML but kept out of the sitemap (they are noindex). */
export const EXTRA_PAGES = ['/privacy-policy', '/terms-conditions'];

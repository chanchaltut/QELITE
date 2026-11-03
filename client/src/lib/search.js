import { STANDARDS } from '../data/standards';
import { GENERAL_FAQS, VERIFICATION_FAQS } from '../data/content';

let index;

export function getSearchIndex() {
  if (index) return index;
  index = [
    ...STANDARDS.map((s) => ({
      kind: 'Standard',
      title: `${s.code} — ${s.title}`,
      meta: s.shortDesc,
      href: `/certifications/${s.slug}`,
      icon: s.icon || 'ri-medal-line',
      keywords: `${s.family} ${s.slug.replace(/-/g, ' ')} ${s.code.replace(/[^a-z0-9]/gi, '')}`,
    })),
    ...GENERAL_FAQS.map((f) => ({ kind: 'FAQ', title: f.q, meta: 'Certification', href: '/faqs#general', icon: 'ri-question-answer-line' })),
    ...VERIFICATION_FAQS.map((f) => ({ kind: 'FAQ', title: f.q, meta: 'Verification', href: '/faqs#verification', icon: 'ri-question-answer-line' })),
    { kind: 'Page', title: 'Verify a certificate', meta: 'Check the status of any QELITE certificate', href: '/verify', icon: 'ri-shield-check-line', keywords: 'check validity register status qr' },
    { kind: 'Page', title: 'All certification programmes', meta: 'ISO and industry standards we certify', href: '/certifications', icon: 'ri-medal-line', keywords: 'standards iso services' },
    { kind: 'Page', title: 'Accreditation & policies', meta: 'Impartiality, complaints, appeals, use of marks', href: '/accreditation', icon: 'ri-shield-star-line', keywords: 'complaint appeal impartiality suspension withdrawal' },
    { kind: 'Page', title: 'Request a quote', meta: 'Fixed fee for the full three-year cycle', href: '/contact', icon: 'ri-file-list-3-line', keywords: 'price cost fee contact enquiry' },
    { kind: 'Page', title: 'About QELITE', meta: 'Who we are and how we work', href: '/about', icon: 'ri-building-line' },
    { kind: 'Page', title: 'Frequently asked questions', meta: 'Certification and verification', href: '/faqs', icon: 'ri-question-answer-line' },
  ];
  return index;
}

/** True when the text looks like a certificate number rather than words (has digits, no spaces between words). */
export const looksLikeCertNumber = (q) => /\d/.test(q) && q.replace(/[^a-z0-9]/gi, '').length >= 5 && !/\s\w+\s/.test(q.trim());

export function searchSite(query, limit = 10) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return getSearchIndex()
    .map((item) => {
      const title = item.title.toLowerCase();
      const hay = `${title} ${(item.meta || '').toLowerCase()} ${item.kind.toLowerCase()} ${(item.keywords || '').toLowerCase()}`;
      if (!terms.every((t) => hay.includes(t))) return null;
      const score = (title.startsWith(q) ? 3 : 0) + (title.includes(q) ? 2 : 0) + (item.kind === 'Standard' ? 1 : 0);
      return { ...item, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

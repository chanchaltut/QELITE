// ═══════════════════════════════════════════════════════════
//  Per-page overrides from admin → "Pages & SEO": Google title and
//  description, and the heading block of inner pages. Pages without
//  an override keep the text written in their component.
// ═══════════════════════════════════════════════════════════

import { fromContent } from '../lib/content.js';

const BLANK = { path: '', title: '', description: '', eyebrow: '', heading: '', accent: '', intro: '', noindex: false };

const PAGES = fromContent('pages', 'items', [BLANK]).filter((p) => p.path);

export const pageOverride = (path) => PAGES.find((p) => p.path === path) || null;

// Generates public/sitemap.xml and public/robots.txt from the site data, using the
// website address from Site settings. Runs automatically before every build
// (see "prebuild" in package.json).
//
// At the client's request (no AI exposure), robots.txt asks AI-training crawlers
// to stay out and no llms.txt is published. Ordinary search engines are welcome.
import fs from 'node:fs';
import { SITE } from '../src/data/site.js';
import { PAGES } from './routes.mjs';
import { pageOverride } from '../src/data/pages.js';

const today = new Date().toISOString().slice(0, 10);
const url = (path) => `${SITE.url}${path}`;

// Pages hidden from search in admin → "Pages & SEO" stay out of the sitemap too
const pages = PAGES.filter(([p]) => !pageOverride(p)?.noindex);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(([p, freq, pri, mod]) => `  <url><loc>${url(p)}</loc><lastmod>${mod || today}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`)
  .join('\n')}
</urlset>
`;
fs.writeFileSync(new URL('../public/sitemap.xml', import.meta.url), sitemap);

const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot',
  'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bytespider', 'meta-externalagent', 'cohere-ai', 'Diffbot', 'Amazonbot',
];

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# AI training and answer-engine crawlers are asked not to collect this site
${AI_CRAWLERS.map((ua) => `User-agent: ${ua}\nDisallow: /`).join('\n\n')}

Sitemap: ${url('/sitemap.xml')}
`;
fs.writeFileSync(new URL('../public/robots.txt', import.meta.url), robots);

console.log(`sitemap.xml: ${pages.length} URLs · robots.txt written for ${SITE.url}`);

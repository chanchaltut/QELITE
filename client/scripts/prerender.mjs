// Writes a static HTML file for every public page (after `vite build`), so Google,
// Bing and AI assistants that don't run JavaScript still see each page's full text,
// title, description and structured data. The browser then takes over as usual.
//
//   dist/index.html            home page
//   dist/<path>.html           every other page in routes.mjs (served at /<path> by
//                              "cleanUrls" in vercel.json)
//   dist/200.html              plain app shell for everything else (admin, unknown URLs);
//                              vercel.json rewrites to "/200" (cleanUrls serves it without .html)
import fs from 'node:fs';
import { PAGES, EXTRA_PAGES } from './routes.mjs';

// Render dates as visitors see them (India), at one fixed moment the browser reuses
// when it takes over the page (src/lib/build-time.js).
process.env.TZ = 'Asia/Kolkata';
const builtAt = Date.now();
globalThis.__PRERENDER_TIME__ = builtAt;

const dist = new URL('../dist/', import.meta.url);
const template = fs.readFileSync(new URL('index.html', dist), 'utf8');
const { render } = await import(new URL('../dist-ssr/entry-server.js', import.meta.url).href);

if (!template.includes('<!--seo:start-->') || !template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html is missing the prerender markers');
}

// Shell for routes that aren't prerendered — written before index.html is replaced
fs.writeFileSync(new URL('200.html', dist), template);

const headFrom = (helmet) =>
  ['title', 'meta', 'link', 'script'].map((k) => helmet?.[k]?.toString() || '').filter(Boolean).join('\n  ');

const paths = [...new Set([...PAGES.map(([p]) => p), ...EXTRA_PAGES])];
let ok = 0;
const fallbacks = [];

for (const path of paths) {
  let page = template;
  try {
    const { html, helmet, errors } = await render(path);
    if (errors.length) throw errors[0];
    page = template
      .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n  ${headFrom(helmet)}\n  <!--seo:end-->`)
      .replace('<div id="root"></div>', `<div id="root" data-path="${path}" data-time="${builtAt}">${html}</div>`);
    ok += 1;
  } catch (err) {
    // The page still works: the browser renders it as before
    fallbacks.push(`${path} (${err?.message?.split('\n')[0]})`);
  }
  const file = new URL(path === '/' ? 'index.html' : `.${path}.html`, dist);
  fs.mkdirSync(new URL('.', file), { recursive: true });
  fs.writeFileSync(file, page);
}

fs.rmSync(new URL('../dist-ssr/', import.meta.url), { recursive: true, force: true });
console.log(`prerendered ${ok}/${paths.length} pages`);
if (fallbacks.length) console.warn(`served without prerendering: ${fallbacks.join('; ')}`);

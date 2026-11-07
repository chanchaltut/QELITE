// Pulls the latest published content from the website API into the build.
// Runs before every build (see "prebuild" in package.json).
//
//   CONTENT_API_URL not set  → the site uses the built-in defaults in src/data
//                              (on Vercel the production API below is used instead)
//   CONTENT_API_URL=builtin  → built-in defaults, even on Vercel. Use this for the
//                              first deploys, before the API exists on Render.
//   API returns a snapshot   → validated, then written to src/generated/snapshot.js
//   API unreachable/invalid  → the build FAILS on purpose, so Vercel keeps the
//                              previous version live instead of shipping stale content
//
// --soft (used by `npm run dev`) never fails; it falls back to the defaults.
import fs from 'node:fs';
import { validateSnapshot } from '../../shared/schema.js';

// On Vercel the production API is the default, so a missing CONTENT_API_URL can
// never quietly replace the published content with the built-in defaults.
const PRODUCTION_API = 'https://qelite.onrender.com';
const SETTING = (process.env.CONTENT_API_URL || '').trim();
const BUILTIN = /^(builtin|built-in|off|none)$/i.test(SETTING);
const API = BUILTIN ? '' : (SETTING || (process.env.VERCEL ? PRODUCTION_API : '')).replace(/\/$/, '');
const soft = process.argv.includes('--soft');
const OUT = new URL('../src/generated/snapshot.js', import.meta.url);
const VERSION = new URL('../public/content-version.json', import.meta.url);
const HEADER = '// Written by scripts/fetch-snapshot.mjs before each build. null = use the defaults in src/data.\n';

fs.mkdirSync(new URL('../src/generated/', import.meta.url), { recursive: true });

function write(snapshot) {
  fs.writeFileSync(OUT, `${HEADER}export default ${JSON.stringify(snapshot)};\n`);
  const version = snapshot ? { id: snapshot.id, publishedAt: snapshot.publishedAt } : { id: null };
  fs.writeFileSync(VERSION, `${JSON.stringify(version)}\n`);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchSnapshot() {
  // Retries cover a sleeping API (free hosting tiers can take up to a minute to wake)
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(`${API}/api/public/snapshot`, { signal: AbortSignal.timeout(45000) });
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        // Not our API at all (e.g. Render's plain "Not Found" for a service that doesn't exist)
        throw new Error(`${API} did not answer like the QELITE API (HTTP ${res.status}: ${text.trim().slice(0, 60) || 'empty response'})`);
      }
      if (res.status === 404 && body?.reason === 'unpublished') return null;
      if (!res.ok || !body?.ok) throw new Error(`API responded ${res.status}`);
      return body.snapshot;
    } catch (err) {
      lastError = err;
      console.warn(`[content] attempt ${attempt} failed: ${err.message}`);
      if (attempt < 5) await wait(attempt * 5000);
    }
  }
  throw lastError;
}

async function main() {
  if (!API) {
    write(null);
    console.log(BUILTIN ? '[content] CONTENT_API_URL=builtin — using built-in content' : '[content] CONTENT_API_URL not set — using built-in content');
    return;
  }
  try {
    const snapshot = await fetchSnapshot();
    if (!snapshot) {
      write(null);
      console.log('[content] nothing published yet — using built-in content');
      return;
    }
    const errors = validateSnapshot(snapshot.content);
    if (errors.length) {
      errors.slice(0, 20).forEach((e) => console.error(`[content] ${e.path}: ${e.message}`));
      throw new Error(`published content has ${errors.length} problem(s)`);
    }
    write(snapshot);
    console.log(`[content] using published content ${snapshot.id} (${snapshot.publishedAt})`);
  } catch (err) {
    if (soft) {
      if (!fs.existsSync(OUT)) write(null);
      console.warn(`[content] ${err.message} — continuing with existing content (dev)`);
      return;
    }
    console.error(`[content] ${err.message}. Build stopped so the current live site stays as it is.`);
    console.error(
      `[content] Check that the API is deployed and ${API}/api/health shows {"ok":true}. ` +
        'If the Render service has a different address, set CONTENT_API_URL to it in Vercel. ' +
        'Until the API exists, set CONTENT_API_URL=builtin in Vercel to build with the built-in content.'
    );
    process.exit(1);
  }
}

main();

// Tells Bing (which also feeds ChatGPT search and Copilot), Yandex, Seznam, Naver
// and other IndexNow engines to recrawl every page in the live sitemap.
//
//   npm run indexnow                 all URLs in https://<site>/sitemap.xml
//   npm run indexnow -- /blog/x ...  only these paths
//
// The API already does this automatically about 5 minutes after each publish;
// use this after a code-only deploy or to resubmit by hand.
import fs from 'node:fs';
import { SITE } from '../src/data/site.js';

const site = SITE.url.replace(/\/$/, '');
const host = new URL(site).host;

// The key is the name of the 32-character .txt file in public/ (it contains itself)
const keyFile = fs.readdirSync(new URL('../public/', import.meta.url)).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file (32 hex characters + .txt) found in public/');
const key = keyFile.slice(0, -4);

const live = await fetch(`${site}/${keyFile}`, { signal: AbortSignal.timeout(20000) });
if (!live.ok || (await live.text()).trim() !== key) {
  throw new Error(`${site}/${keyFile} is not live with the right key yet — deploy first`);
}

let urlList = process.argv.slice(2).map((p) => (p.startsWith('http') ? p : `${site}${p.startsWith('/') ? '' : '/'}${p}`));
if (!urlList.length) {
  const res = await fetch(`${site}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`sitemap returned ${res.status}`);
  urlList = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
urlList = urlList.filter((u) => new URL(u).host === host).slice(0, 10000);
if (!urlList.length) throw new Error('No URLs to submit');

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `${site}/${keyFile}`, urlList }),
  signal: AbortSignal.timeout(30000),
});
const meaning = {
  200: 'accepted',
  202: 'accepted — key verification pending',
  400: 'bad request',
  403: 'key not valid for this site',
  422: 'URLs do not belong to this host',
  429: 'too many requests — try again later',
}[res.status] || (await res.text()).slice(0, 200);
console.log(`[indexnow] ${res.status} ${meaning} · ${urlList.length} URLs for ${host}`);
if (![200, 202].includes(res.status)) process.exit(1);

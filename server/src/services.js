// Outbound integrations: email (Resend), uploads (Cloudinary) and site rebuilds
// (Vercel deploy hook). Each one is optional — when it isn't configured the
// feature reports that clearly instead of failing.
import crypto from 'node:crypto';
import { config } from './config.js';

// ─── Email ───────────────────────────────────────────────────
const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!config.email.resendKey || !to.length) return { sent: false, reason: 'not-configured' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.email.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: config.email.from, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return { sent: true };
  } catch (err) {
    console.error('[email]', err.message);
    return { sent: false, reason: err.message };
  }
}

const LABELS = {
  topic: 'Topic', name: 'Name', company: 'Organisation', email: 'Email', phone: 'Phone', standards: 'Standards',
  employees: 'Employees', sites: 'Sites', message: 'Message', number: 'Certificate number', organisation: 'Organisation on certificate',
};

export function submissionEmail(typeLabel, data, page) {
  const rows = Object.entries(data)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6B675F;vertical-align:top">${escapeHtml(LABELS[k] || k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(Array.isArray(v) ? v.join(', ') : v)}</td></tr>`)
    .join('');
  return `<div style="font-family:Arial,sans-serif;font-size:15px;color:#231E15">
    <p style="font-size:18px;margin:0 0 12px"><strong>New ${escapeHtml(typeLabel.toLowerCase())}</strong> from the website</p>
    <table style="border-collapse:collapse">${rows}</table>
    <p style="color:#6B675F;font-size:13px;margin-top:16px">Sent from ${escapeHtml(page || 'the website')}. Reply directly to this email to answer, or open the admin panel: ${escapeHtml(config.siteUrl)}/admin</p>
  </div>`;
}

// ─── Cloudinary (signed direct upload from the browser) ───────
const sign = (params, secret) => {
  const base = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(base + secret).digest('hex');
};

export const uploadsEnabled = () => Boolean(config.cloudinary);

/** Parameters the admin browser needs to upload one file straight to Cloudinary. */
export function uploadSignature(resourceType) {
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  const params = { folder: 'qelite', timestamp: Math.floor(Date.now() / 1000) };
  return {
    url: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    fields: { ...params, api_key: apiKey, signature: sign(params, apiSecret) },
  };
}

export async function destroyUpload(publicId, resourceType) {
  if (!config.cloudinary) return;
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  const params = { public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  const body = new URLSearchParams({ ...params, api_key: apiKey, signature: sign(params, apiSecret) });
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Cloudinary ${res.status}`);
}

/** True when `url` is a file in this account's Cloudinary folder — only those are recorded in the library. */
export function isOwnUpload(url) {
  if (!config.cloudinary || typeof url !== 'string') return false;
  return url.startsWith(`https://res.cloudinary.com/${config.cloudinary.cloudName}/`);
}

// ─── Site rebuild ────────────────────────────────────────────
export async function triggerDeploy() {
  if (!config.deployHookUrl) {
    return { status: 'skipped', message: 'VERCEL_DEPLOY_HOOK_URL is not set — the site will update on its next deploy.' };
  }
  // Retries cover brief network or Vercel hiccups so one blip never leaves the site stale
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(config.deployHookUrl, { method: 'POST', signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        scheduleIndexNow();
        return { status: 'triggered', message: 'Rebuild started.' };
      }
      lastError = new Error(`Vercel responded ${res.status}`);
      // 4xx means the hook URL itself is wrong or was deleted — retrying won't help
      if (res.status >= 400 && res.status < 500 && res.status !== 429) break;
    } catch (err) {
      lastError = err;
    }
    console.warn(`[deploy] attempt ${attempt} failed: ${lastError.message}`);
    if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 2000));
  }
  console.error('[deploy]', lastError.message);
  return { status: 'failed', message: lastError.message };
}

// ─── IndexNow ────────────────────────────────────────────────
// Once the rebuilt site is live, tells Bing (which also feeds ChatGPT search and
// Copilot), Yandex and other IndexNow engines to recrawl every page in the sitemap.
const INDEXNOW_DELAY_MS = 5 * 60 * 1000;
let indexNowTimer = null;

function scheduleIndexNow() {
  const key = config.indexNowKey;
  if (!config.production || !key || key === 'off') return;
  clearTimeout(indexNowTimer); // several publishes in a row → one ping after the last
  indexNowTimer = setTimeout(() => submitIndexNow(key).catch((err) => console.error('[indexnow]', err.message)), INDEXNOW_DELAY_MS);
}

async function submitIndexNow(key) {
  const res = await fetch(`${config.siteUrl}/sitemap.xml`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`sitemap returned ${res.status}`);
  const urlList = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).slice(0, 10000);
  if (!urlList.length) return;
  const ping = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(config.siteUrl).host, key, keyLocation: `${config.siteUrl}/${key}.txt`, urlList }),
    signal: AbortSignal.timeout(20000),
  });
  if (![200, 202].includes(ping.status)) throw new Error(`IndexNow responded ${ping.status}`);
  console.log(`[indexnow] submitted ${urlList.length} URLs`);
}

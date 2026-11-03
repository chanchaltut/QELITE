// Public endpoints: the published snapshot (read by the site build), certificate
// verification and form submissions.
import express from 'express';
import rateLimit from 'express-rate-limit';
import { Content, Publish, Submission, SUBMISSION_TYPES, Certificate, CertificateFile } from '../models.js';
import { lookupKey, effectiveStatus, PUBLIC_CERT_FIELDS } from '../../../shared/certificates.js';
import { asyncRoute, HttpError } from '../http.js';
import { toSnapshot } from '../content.js';
import { sendEmail, submissionEmail } from '../services.js';

export const publicRouter = express.Router();

publicRouter.get(
  '/snapshot',
  asyncRoute(async (req, res) => {
    const latest = await Publish.findOne().sort({ createdAt: -1 });
    if (!latest) return res.status(404).json({ ok: false, reason: 'unpublished' });
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, snapshot: toSnapshot(latest) });
  })
);

// ─── Certificate verification ────────────────────────────────
// One exact number per request. There is deliberately no listing, no search by
// organisation and no partial matching, so the register can't be browsed, and
// per-IP limits make guessing numbers impractical.
const limitMessage = { ok: false, error: 'Too many checks in a short time. Please wait a few minutes and try again.' };
const verifyLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false, message: limitMessage });
const fileLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false, message: limitMessage });

const requestedKey = (req) => {
  const key = lookupKey(String(req.query.number || '').slice(0, 80));
  if (key.length < 4) throw new HttpError(400, 'Enter the full certificate number as printed on the certificate.');
  return key;
};

const noStore = (res) => {
  res.set('Cache-Control', 'no-store');
  res.set('X-Robots-Tag', 'noindex, nofollow');
};

publicRouter.get(
  '/certificates',
  verifyLimiter,
  asyncRoute(async (req, res) => {
    noStore(res);
    const key = requestedKey(req);
    const cert = await Certificate.findOneAndUpdate(
      { lookupKey: key },
      { $inc: { verifyCount: 1 }, $set: { lastVerifiedAt: new Date() } },
      { new: true, projection: { remarks: 0, createdBy: 0, updatedBy: 0 } }
    ).lean();
    if (!cert) return res.json({ ok: true, found: false });

    const status = effectiveStatus(cert);
    const certificate = Object.fromEntries(PUBLIC_CERT_FIELDS.map((k) => [k, cert[k] || '']));
    res.json({
      ok: true,
      found: true,
      certificate: { ...certificate, status, hasFile: status === 'valid' && Boolean(cert.file?.size), checkedAt: new Date().toISOString() },
    });
  })
);

// The uploaded PDF copy, only while the certificate is valid
publicRouter.get(
  '/certificates/file',
  fileLimiter,
  asyncRoute(async (req, res) => {
    noStore(res);
    const key = requestedKey(req);
    const cert = await Certificate.findOne({ lookupKey: key }, { number: 1, status: 1, expiryDate: 1, file: 1 }).lean();
    if (!cert || effectiveStatus(cert) !== 'valid' || !cert.file?.size) throw new HttpError(404, 'No certificate copy is available for this number.');
    const file = await CertificateFile.findOne({ certificate: cert._id });
    if (!file) throw new HttpError(404, 'No certificate copy is available for this number.');

    const name = `QELITE-${cert.number.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}.pdf`;
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Length', String(file.data.length));
    res.set('Content-Disposition', `${req.query.download ? 'attachment' : 'inline'}; filename="${name}"`);
    res.send(file.data);
  })
);

// ─── Forms ───────────────────────────────────────────────────
const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many submissions. Please try again in a few minutes, or call us.' },
});

const KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,19}$/;

/** Keeps only short scalar fields (and short lists of them) from a visitor's submission. */
function cleanSubmission(body) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) throw new HttpError(400, 'Malformed submission.');
  const data = {};
  for (const [key, raw] of Object.entries(body).slice(0, 30)) {
    if (!KEY_RE.test(key) || key === 'page' || key === 'website') continue;
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      const v = String(raw).trim().slice(0, 4000);
      if (v) data[key] = v;
    } else if (Array.isArray(raw)) {
      const v = raw.filter((x) => typeof x === 'string' || typeof x === 'number').slice(0, 50).map((x) => String(x).trim().slice(0, 200)).filter(Boolean);
      if (v.length) data[key] = v;
    }
  }
  return data;
}

async function notifyEmails() {
  const inbox = await Content.findOne({ key: 'inbox' }).lean();
  return String(inbox?.draft?.notifyEmails || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => EMAIL_RE.test(s));
}

publicRouter.post(
  '/:type',
  formLimiter,
  asyncRoute(async (req, res) => {
    const { type } = req.params;
    if (!SUBMISSION_TYPES[type]) throw new HttpError(404, 'Unknown form.');

    // Honeypot: bots fill every field; real visitors never see this one
    if (req.body?.website) return res.json({ ok: true });

    const data = cleanSubmission(req.body);
    if (data.email && !EMAIL_RE.test(data.email)) throw new HttpError(400, 'Please enter a valid email address.');
    if (data.phone && !PHONE_RE.test(data.phone)) throw new HttpError(400, 'Please enter a valid phone number.');
    if (!data.email && !data.phone) {
      throw new HttpError(400, 'Please include a phone number or email so we can reach you.');
    }
    const page = typeof req.body.page === 'string' ? req.body.page.slice(0, 200) : '';

    await Submission.create({ type, data, page });
    res.json({ ok: true });

    // Email alert after responding, so the visitor never waits on it
    const to = await notifyEmails();
    const who = data.company || data.name || data.email || data.phone;
    const what = Array.isArray(data.standards) ? data.standards.join(', ') : data.number || data.topic || '';
    sendEmail({
      to,
      subject: `${SUBMISSION_TYPES[type].replace(/s$/, '')}: ${who}${what ? ` — ${what}` : ''}`,
      html: submissionEmail(SUBMISSION_TYPES[type].replace(/s$/, ''), data, page),
      replyTo: data.email,
    });
  })
);

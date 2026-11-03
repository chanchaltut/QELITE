// Admin endpoints for the certificate register (mounted at /api/admin/certificates;
// every route requires a signed-in user). Deleting a certificate is owner-only:
// editors withdraw or suspend instead, which keeps the public record honest.
import crypto from 'node:crypto';
import express from 'express';
import mongoose from 'mongoose';
import { Certificate, CertificateFile, audit } from '../models.js';
import { asyncRoute, HttpError } from '../http.js';
import { requireOwner } from '../auth.js';
import { lookupKey, pickCertificate, validateCertificate, effectiveStatus, todayIST } from '../../../shared/certificates.js';

export const certificatesRouter = express.Router();

const MAX_PDF = 10 * 1024 * 1024;
const PAGE_SIZE = 50;

const validId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Certificate not found.');
  return id;
};

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Shape sent to the admin panel: everything except internal Mongo fields, plus the visible status. */
const toAdmin = (c, today = todayIST()) => ({
  id: String(c._id),
  number: c.number,
  title: c.title,
  organisation: c.organisation,
  address: c.address,
  standard: c.standard,
  standardTitle: c.standardTitle,
  scope: c.scope,
  issueDate: c.issueDate,
  surveillance1: c.surveillance1,
  surveillance2: c.surveillance2,
  expiryDate: c.expiryDate,
  status: c.status,
  effectiveStatus: effectiveStatus(c, today),
  remarks: c.remarks,
  file: c.file?.size ? { name: c.file.name, size: c.file.size, uploadedAt: c.file.uploadedAt, uploadedBy: c.file.uploadedBy } : null,
  rev: c.rev,
  verifyCount: c.verifyCount || 0,
  lastVerifiedAt: c.lastVerifiedAt,
  createdBy: c.createdBy,
  updatedBy: c.updatedBy,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

function listFilter(query) {
  const today = todayIST();
  const filter = {};
  const q = String(query.q || '').trim().slice(0, 100);
  if (q) {
    const re = new RegExp(escapeRe(q), 'i');
    const key = lookupKey(q);
    filter.$or = [{ organisation: re }, { standard: re }, { number: re }, ...(key.length >= 2 ? [{ lookupKey: new RegExp(escapeRe(key)) }] : [])];
  }
  switch (query.status) {
    case 'valid':
      Object.assign(filter, { status: 'valid', expiryDate: { $gte: today } });
      break;
    case 'expired':
      Object.assign(filter, { status: 'valid', expiryDate: { $lt: today } });
      break;
    case 'suspended':
    case 'withdrawn':
      filter.status = query.status;
      break;
    case 'due': {
      // Surveillance or re-certification falling in the next 60 days
      const until = addDays(today, 60);
      const window = { $gte: today, $lte: until };
      filter.status = 'valid';
      filter.$and = [{ $or: [{ surveillance1: window }, { surveillance2: window }, { expiryDate: window }] }];
      break;
    }
    default:
  }
  return filter;
}

// ─── Summary (dashboard) ─────────────────────────────────────
certificatesRouter.get(
  '/summary',
  asyncRoute(async (req, res) => {
    const today = todayIST();
    const until = addDays(today, 60);
    const window = { $gte: today, $lte: until };
    const [total, valid, expired, suspended, withdrawn, due, recentChecks, lookups] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ status: 'valid', expiryDate: { $gte: today } }),
      Certificate.countDocuments({ status: 'valid', expiryDate: { $lt: today } }),
      Certificate.countDocuments({ status: 'suspended' }),
      Certificate.countDocuments({ status: 'withdrawn' }),
      Certificate.find({ status: 'valid', $or: [{ surveillance1: window }, { surveillance2: window }, { expiryDate: window }] }, { file: 0 })
        .sort({ expiryDate: 1 })
        .limit(8)
        .lean(),
      Certificate.find({ lastVerifiedAt: { $exists: true } }, { number: 1, organisation: 1, standard: 1, lastVerifiedAt: 1, verifyCount: 1, status: 1, expiryDate: 1 })
        .sort({ lastVerifiedAt: -1 })
        .limit(6)
        .lean(),
      Certificate.aggregate([{ $group: { _id: null, n: { $sum: '$verifyCount' } } }]),
    ]);
    res.json({
      ok: true,
      counts: { total, valid, expired, suspended, withdrawn },
      lookups: lookups[0]?.n || 0,
      due: due.map((c) => toAdmin(c, today)),
      recentChecks: recentChecks.map((c) => toAdmin(c, today)),
    });
  })
);

// ─── List and export ─────────────────────────────────────────
certificatesRouter.get(
  '/',
  asyncRoute(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const filter = listFilter(req.query);
    const [items, total] = await Promise.all([
      Certificate.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
      Certificate.countDocuments(filter),
    ]);
    const today = todayIST();
    res.json({ ok: true, items: items.map((c) => toAdmin(c, today)), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) });
  })
);

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

certificatesRouter.get(
  '/export.csv',
  asyncRoute(async (req, res) => {
    const items = await Certificate.find(listFilter(req.query)).sort({ createdAt: -1 }).limit(20000).lean();
    const today = todayIST();
    const header = ['Certificate number', 'Title', 'Organisation', 'Address', 'Standard', 'Standard name', 'Scope', 'Initial registration', 'First surveillance', 'Second surveillance', 'Expiry', 'Status', 'PDF uploaded', 'Times verified', 'Last verified', 'Internal notes'];
    const rows = items.map((c) => [
      c.number, c.title, c.organisation, c.address, c.standard, c.standardTitle, c.scope, c.issueDate, c.surveillance1, c.surveillance2, c.expiryDate,
      effectiveStatus(c, today), c.file?.size ? 'Yes' : 'No', c.verifyCount || 0, c.lastVerifiedAt ? c.lastVerifiedAt.toISOString() : '', c.remarks,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="qelite-certificates-${today}.csv"`);
    res.send(`﻿${csv}`);
  })
);

// ─── One certificate ─────────────────────────────────────────
const duplicateError = (number) =>
  new HttpError(409, `Certificate number ${number} is already in the register. Each number can be used once (spaces, slashes and hyphens are ignored when comparing).`, {
    errors: [{ path: 'number', message: 'This number is already in use' }],
  });

certificatesRouter.get(
  '/:id',
  asyncRoute(async (req, res) => {
    const cert = await Certificate.findById(validId(req.params.id)).lean();
    if (!cert) throw new HttpError(404, 'Certificate not found.');
    res.json({ ok: true, item: toAdmin(cert) });
  })
);

certificatesRouter.post(
  '/',
  asyncRoute(async (req, res) => {
    const data = pickCertificate(req.body);
    const errors = validateCertificate(data);
    if (errors.length) throw new HttpError(422, 'Please fix the highlighted fields.', { errors });
    const key = lookupKey(data.number);
    if (await Certificate.exists({ lookupKey: key })) throw duplicateError(data.number);
    try {
      const cert = await Certificate.create({ ...data, lookupKey: key, createdBy: req.user.email, updatedBy: req.user.email });
      audit(req.user, 'certificate-create', data.number, data.organisation);
      res.status(201).json({ ok: true, item: toAdmin(cert.toObject()) });
    } catch (err) {
      if (err?.code === 11000) throw duplicateError(data.number);
      throw err;
    }
  })
);

certificatesRouter.put(
  '/:id',
  asyncRoute(async (req, res) => {
    const id = validId(req.params.id);
    const current = await Certificate.findById(id).lean();
    if (!current) throw new HttpError(404, 'Certificate not found.');
    if (Number(req.body?.rev) !== current.rev) {
      throw new HttpError(409, 'Someone else saved this certificate after you opened it. Reload to see their changes, then make yours again.');
    }
    const data = pickCertificate(req.body);
    const errors = validateCertificate(data);
    if (errors.length) throw new HttpError(422, 'Please fix the highlighted fields.', { errors });
    const key = lookupKey(data.number);
    if (key !== current.lookupKey && (await Certificate.exists({ lookupKey: key }))) throw duplicateError(data.number);

    let updated;
    try {
      updated = await Certificate.findOneAndUpdate(
        { _id: id, rev: current.rev },
        { $set: { ...data, lookupKey: key, updatedBy: req.user.email }, $inc: { rev: 1 } },
        { new: true }
      ).lean();
    } catch (err) {
      if (err?.code === 11000) throw duplicateError(data.number);
      throw err;
    }
    if (!updated) throw new HttpError(409, 'Someone else saved this certificate at the same moment. Reload and try again.');

    const changes = [];
    if (current.status !== data.status) changes.push(`status ${current.status} → ${data.status}`);
    if (current.number !== data.number) changes.push(`number ${current.number} → ${data.number}`);
    audit(req.user, 'certificate-update', data.number, changes.join('; '));
    res.json({ ok: true, item: toAdmin(updated) });
  })
);

certificatesRouter.delete(
  '/:id',
  requireOwner,
  asyncRoute(async (req, res) => {
    const cert = await Certificate.findById(validId(req.params.id));
    if (!cert) throw new HttpError(404, 'Certificate not found.');
    await CertificateFile.deleteOne({ certificate: cert._id });
    await cert.deleteOne();
    audit(req.user, 'certificate-delete', cert.number, cert.organisation);
    res.json({ ok: true });
  })
);

// ─── PDF copy ────────────────────────────────────────────────
// The browser sends the file itself as the request body (Content-Type: application/pdf).
certificatesRouter.put(
  '/:id/file',
  express.raw({ type: 'application/pdf', limit: MAX_PDF }),
  asyncRoute(async (req, res) => {
    const cert = await Certificate.findById(validId(req.params.id));
    if (!cert) throw new HttpError(404, 'Certificate not found.');
    const data = req.body;
    if (!Buffer.isBuffer(data) || data.length === 0) throw new HttpError(400, 'Choose a PDF file to upload.');
    if (data.subarray(0, 5).toString('latin1') !== '%PDF-') throw new HttpError(400, 'That file is not a PDF. Export the certificate as PDF and try again.');

    let rawName = req.get('X-File-Name') || 'certificate.pdf';
    try {
      rawName = decodeURIComponent(rawName);
    } catch {
      /* keep as sent */
    }
    const name = String(rawName).replace(/[^\w.\- ]+/g, '_').slice(0, 120) || 'certificate.pdf';
    const sha256 = crypto.createHash('sha256').update(data).digest('hex');
    await CertificateFile.findOneAndUpdate(
      { certificate: cert._id },
      { $set: { data, size: data.length, sha256, contentType: 'application/pdf' } },
      { upsert: true }
    );
    cert.file = { name, size: data.length, uploadedAt: new Date(), uploadedBy: req.user.email };
    cert.updatedBy = req.user.email;
    cert.rev += 1;
    await cert.save();
    audit(req.user, 'certificate-file-upload', cert.number, `${name} (${Math.round(data.length / 1024)} KB)`);
    res.json({ ok: true, item: toAdmin(cert.toObject()) });
  })
);

certificatesRouter.get(
  '/:id/file',
  asyncRoute(async (req, res) => {
    const cert = await Certificate.findById(validId(req.params.id), { number: 1, file: 1 }).lean();
    const file = cert && (await CertificateFile.findOne({ certificate: cert._id }));
    if (!file) throw new HttpError(404, 'No PDF has been uploaded for this certificate.');
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Length', String(file.data.length));
    res.set('Content-Disposition', `inline; filename="${(cert.file?.name || 'certificate.pdf').replace(/"/g, '')}"`);
    res.send(file.data);
  })
);

certificatesRouter.delete(
  '/:id/file',
  asyncRoute(async (req, res) => {
    const cert = await Certificate.findById(validId(req.params.id));
    if (!cert) throw new HttpError(404, 'Certificate not found.');
    await CertificateFile.deleteOne({ certificate: cert._id });
    cert.file = undefined;
    cert.updatedBy = req.user.email;
    cert.rev += 1;
    await cert.save();
    audit(req.user, 'certificate-file-remove', cert.number);
    res.json({ ok: true, item: toAdmin(cert.toObject()) });
  })
);

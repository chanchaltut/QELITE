// Admin endpoints — every route here requires a signed-in user.
import express from 'express';
import mongoose from 'mongoose';
import { CONTENT, PUBLIC_KEYS, validateContent } from '../../../shared/schema.js';
import { Content, Publish, Submission, SUBMISSION_TYPES, Media, User, Audit, audit } from '../models.js';
import { asyncRoute, HttpError } from '../http.js';
import { requireOwner, hashPassword, checkPasswordStrength } from '../auth.js';
import { describe, collect, validateAll, recordPublish } from '../content.js';
import { triggerDeploy, uploadsEnabled, uploadSignature, destroyUpload, isOwnUpload } from '../services.js';
import { config } from '../config.js';
import { certificatesRouter } from './certificates.js';

export const adminRouter = express.Router();

adminRouter.use('/certificates', certificatesRouter);

const validId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, 'Not found.');
  return id;
};

// ─── Dashboard ───────────────────────────────────────────────
adminRouter.get(
  '/dashboard',
  asyncRoute(async (req, res) => {
    const [counts, recent, docs, lastPublish] = await Promise.all([
      Submission.aggregate([{ $group: { _id: { type: '$type', status: '$status' }, n: { $sum: 1 } } }]),
      Submission.find({}).sort({ createdAt: -1 }).limit(6).lean(),
      Content.find().lean(),
      Publish.findOne({}, { content: 0 }).sort({ createdAt: -1 }).lean(),
    ]);
    const byType = Object.fromEntries(Object.keys(SUBMISSION_TYPES).map((t) => [t, { total: 0, new: 0 }]));
    counts.forEach(({ _id, n }) => {
      if (!byType[_id.type]) return;
      byType[_id.type].total += n;
      if (_id.status === 'new') byType[_id.type].new += n;
    });
    res.json({
      ok: true,
      submissions: byType,
      recent,
      unpublished: docs.map(describe).filter((d) => d.hasChanges),
      lastPublish,
      integrations: {
        uploads: uploadsEnabled(),
        email: Boolean(config.email.resendKey),
        deploy: Boolean(config.deployHookUrl),
      },
    });
  })
);

// ─── Content ─────────────────────────────────────────────────
adminRouter.get(
  '/content',
  asyncRoute(async (req, res) => {
    const docs = await Content.find().lean();
    const order = Object.keys(CONTENT);
    res.json({ ok: true, items: docs.map(describe).sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key)) });
  })
);

const findContent = async (key) => {
  if (!CONTENT[key]) throw new HttpError(404, 'Unknown section.');
  const doc = await Content.findOne({ key });
  if (!doc) throw new HttpError(404, 'This section has not been set up yet.');
  return doc;
};

adminRouter.get(
  '/content/:key',
  asyncRoute(async (req, res) => {
    const doc = await findContent(req.params.key);
    res.json({ ok: true, ...describe(doc), draft: doc.draft, published: doc.published });
  })
);

adminRouter.put(
  '/content/:key',
  asyncRoute(async (req, res) => {
    const { key } = req.params;
    const { data, version } = req.body || {};
    const doc = await findContent(key);
    if (version !== doc.version) {
      throw new HttpError(409, 'Someone else saved this section after you opened it. Reload to see their changes, then make yours again.');
    }
    const errors = validateContent(key, data);
    if (errors.length) throw new HttpError(422, 'Please fix the highlighted fields.', { errors });

    // Private settings (e.g. form alert emails) take effect immediately; they are never published
    const updated = await Content.findOneAndUpdate(
      { key, version: doc.version },
      {
        $set: { draft: data, updatedBy: req.user.email, ...(CONTENT[key].private ? { published: data } : {}) },
        $inc: { version: 1 },
      },
      { new: true }
    );
    if (!updated) throw new HttpError(409, 'Someone else saved this section at the same moment. Reload and try again.');
    audit(req.user, 'save', key);
    res.json({ ok: true, ...describe(updated), draft: updated.draft, published: updated.published });
  })
);

adminRouter.post(
  '/content/:key/discard',
  asyncRoute(async (req, res) => {
    const doc = await findContent(req.params.key);
    doc.draft = doc.published;
    doc.version += 1;
    doc.updatedBy = req.user.email;
    doc.markModified('draft');
    await doc.save();
    audit(req.user, 'discard', doc.key);
    res.json({ ok: true, ...describe(doc), draft: doc.draft, published: doc.published });
  })
);

// Drafts as a snapshot, for the "Preview" button
adminRouter.get(
  '/preview',
  asyncRoute(async (req, res) => {
    res.json({ ok: true, snapshot: { id: 'preview', publishedAt: new Date().toISOString(), content: await collect('draft') } });
  })
);

// ─── Publishing ──────────────────────────────────────────────
// `replaceDrafts` is used by restore; a normal publish leaves drafts (and their
// version numbers) untouched, so an editor can keep working in an open form.
async function publishContent(content, user, note, { replaceDrafts = false } = {}) {
  const errors = validateAll(content);
  if (errors.length) throw new HttpError(422, 'Some sections have problems. Fix them before publishing.', { errors });

  const now = new Date();
  await Promise.all(
    Object.entries(content).map(([key, data]) =>
      Content.updateOne(
        { key },
        replaceDrafts
          ? { $set: { draft: data, published: data, publishedAt: now }, $inc: { version: 1 } }
          : { $set: { published: data, publishedAt: now } }
      )
    )
  );
  const publish = await recordPublish({ content, user, note });
  publish.deploy = await triggerDeploy();
  await publish.save();
  audit(user, 'publish', publish.snapshotId, note || '');
  return publish;
}

adminRouter.post(
  '/publish',
  asyncRoute(async (req, res) => {
    const note = String(req.body?.note || '').slice(0, 200);
    const publish = await publishContent(await collect('draft'), req.user, note);
    res.json({ ok: true, publish: { snapshotId: publish.snapshotId, createdAt: publish.createdAt, deploy: publish.deploy } });
  })
);

adminRouter.get(
  '/publishes',
  asyncRoute(async (req, res) => {
    const items = await Publish.find({}, { content: 0 }).sort({ createdAt: -1 }).limit(60).lean();
    res.json({ ok: true, items });
  })
);

// Rollback: publishes an earlier version again (as a new entry, so it can itself be undone)
adminRouter.post(
  '/publishes/:id/restore',
  asyncRoute(async (req, res) => {
    const old = await Publish.findById(validId(req.params.id)).lean();
    if (!old) throw new HttpError(404, 'That version no longer exists.');
    const current = await collect('published');
    // Sections added after that version keep their current content
    const content = Object.fromEntries(PUBLIC_KEYS.filter((k) => current[k] || old.content[k]).map((k) => [k, old.content[k] ?? current[k]]));
    const publish = await publishContent(content, req.user, `Restored version ${old.snapshotId}`, { replaceDrafts: true });
    res.json({ ok: true, publish: { snapshotId: publish.snapshotId, createdAt: publish.createdAt, deploy: publish.deploy } });
  })
);

// Re-runs the site build without changing content (e.g. after a failed deploy)
adminRouter.post(
  '/redeploy',
  asyncRoute(async (req, res) => {
    const deploy = await triggerDeploy();
    audit(req.user, 'redeploy', '', deploy.status);
    res.json({ ok: true, deploy });
  })
);

// ─── Inbox ───────────────────────────────────────────────────
const submissionQuery = (q) => {
  const filter = {};
  if (q.type && SUBMISSION_TYPES[q.type]) filter.type = q.type;
  if (q.status && ['new', 'in-progress', 'done', 'spam'].includes(q.status)) filter.status = q.status;
  const text = String(q.q || '').trim().slice(0, 100);
  if (text) {
    const re = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = ['name', 'email', 'phone', 'message', 'company', 'number', 'organisation', 'topic'].map((f) => ({ [`data.${f}`]: re }));
  }
  return filter;
};

adminRouter.get(
  '/submissions',
  asyncRoute(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const filter = submissionQuery(req.query);
    const [items, total] = await Promise.all([
      Submission.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50).lean(),
      Submission.countDocuments(filter),
    ]);
    res.json({ ok: true, items, total, page, pages: Math.max(1, Math.ceil(total / 50)), types: SUBMISSION_TYPES });
  })
);

const csvCell = (v) => {
  let s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

adminRouter.get(
  '/submissions/export.csv',
  asyncRoute(async (req, res) => {
    const items = await Submission.find(submissionQuery(req.query)).sort({ createdAt: -1 }).limit(20000).lean();
    const fields = [...new Set(items.flatMap((i) => Object.keys(i.data || {})))];
    const header = ['Date', 'Form', 'Status', ...fields, 'Page', 'Notes'];
    const rows = items.map((i) => [
      i.createdAt.toISOString(), SUBMISSION_TYPES[i.type], i.status, ...fields.map((f) => i.data?.[f]), i.page, i.notes,
    ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="${req.query.type || 'submissions'}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(`\uFEFF${csv}`); // BOM so Excel reads UTF-8 (₹, names)
  })
);

adminRouter.patch(
  '/submissions/:id',
  asyncRoute(async (req, res) => {
    const update = {};
    if (['new', 'in-progress', 'done', 'spam'].includes(req.body?.status)) update.status = req.body.status;
    if (typeof req.body?.notes === 'string') update.notes = req.body.notes.slice(0, 4000);
    const item = await Submission.findByIdAndUpdate(validId(req.params.id), { $set: update }, { new: true }).lean();
    if (!item) throw new HttpError(404, 'Not found.');
    res.json({ ok: true, item });
  })
);

adminRouter.delete(
  '/submissions/:id',
  asyncRoute(async (req, res) => {
    const item = await Submission.findByIdAndDelete(validId(req.params.id)).lean();
    if (!item) throw new HttpError(404, 'Not found.');
    audit(req.user, 'delete-submission', item.type, item.data?.email || item.data?.phone || '');
    res.json({ ok: true });
  })
);

// ─── Media ───────────────────────────────────────────────────
adminRouter.post('/media/sign', (req, res, next) => {
  if (!uploadsEnabled()) return next(new HttpError(503, 'Uploads are not set up yet (CLOUDINARY_URL). You can paste an image link instead.'));
  const resourceType = req.body?.resourceType === 'raw' ? 'raw' : 'image';
  res.json({ ok: true, ...uploadSignature(resourceType) });
});

adminRouter.post(
  '/media',
  asyncRoute(async (req, res) => {
    const { url, publicId, resourceType, filename, bytes, width, height } = req.body || {};
    if (!isOwnUpload(url) || typeof publicId !== 'string') throw new HttpError(400, 'Unrecognised upload.');
    const item = await Media.create({
      url, publicId, resourceType: resourceType === 'raw' ? 'raw' : 'image',
      filename: String(filename || '').slice(0, 200), bytes, width, height, uploadedBy: req.user.email,
    });
    res.json({ ok: true, item });
  })
);

adminRouter.get(
  '/media',
  asyncRoute(async (req, res) => {
    const items = await Media.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ ok: true, items, enabled: uploadsEnabled() });
  })
);

adminRouter.delete(
  '/media/:id',
  asyncRoute(async (req, res) => {
    const item = await Media.findById(validId(req.params.id));
    if (!item) throw new HttpError(404, 'Not found.');
    // Refuse to delete a file the site still uses
    const docs = await Content.find().lean();
    const inUse = docs.filter((d) => JSON.stringify([d.draft, d.published]).includes(item.publicId)).map((d) => CONTENT[d.key]?.title || d.key);
    if (inUse.length) throw new HttpError(409, `This file is still used in: ${inUse.join(', ')}. Remove it there first.`);
    await destroyUpload(item.publicId, item.resourceType).catch((err) => console.error('[media]', err.message));
    await item.deleteOne();
    audit(req.user, 'delete-media', item.filename || item.publicId);
    res.json({ ok: true });
  })
);

// ─── Users (owner only) ──────────────────────────────────────
adminRouter.get(
  '/users',
  requireOwner,
  asyncRoute(async (req, res) => {
    const users = await User.find().sort({ createdAt: 1 });
    res.json({ ok: true, items: users.map((u) => u.toPublic()) });
  })
);

adminRouter.post(
  '/users',
  requireOwner,
  asyncRoute(async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const role = req.body?.role === 'owner' ? 'owner' : 'editor';
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a name and a valid email.');
    const weak = checkPasswordStrength(req.body?.password);
    if (weak) throw new HttpError(400, weak);
    if (await User.exists({ email })) throw new HttpError(409, 'A user with that email already exists.');
    const user = await User.create({ name, email, role, passwordHash: await hashPassword(req.body.password) });
    audit(req.user, 'add-user', email, role);
    res.json({ ok: true, item: user.toPublic() });
  })
);

adminRouter.patch(
  '/users/:id',
  requireOwner,
  asyncRoute(async (req, res) => {
    const user = await User.findById(validId(req.params.id));
    if (!user) throw new HttpError(404, 'Not found.');
    if (req.body?.role && ['owner', 'editor'].includes(req.body.role) && req.body.role !== user.role) {
      if (user.role === 'owner' && (await User.countDocuments({ role: 'owner' })) === 1) throw new HttpError(400, 'There must always be at least one owner.');
      user.role = req.body.role;
    }
    if (req.body?.password) {
      const weak = checkPasswordStrength(req.body.password);
      if (weak) throw new HttpError(400, weak);
      user.passwordHash = await hashPassword(req.body.password);
      user.tokenVersion += 1;
      user.lockedUntil = undefined;
      user.failedLogins = 0;
    }
    await user.save();
    audit(req.user, 'update-user', user.email);
    res.json({ ok: true, item: user.toPublic() });
  })
);

adminRouter.delete(
  '/users/:id',
  requireOwner,
  asyncRoute(async (req, res) => {
    if (String(req.user._id) === req.params.id) throw new HttpError(400, 'You can’t remove your own account.');
    const user = await User.findById(validId(req.params.id));
    if (!user) throw new HttpError(404, 'Not found.');
    if (user.role === 'owner' && (await User.countDocuments({ role: 'owner' })) === 1) throw new HttpError(400, 'There must always be at least one owner.');
    await user.deleteOne();
    audit(req.user, 'remove-user', user.email);
    res.json({ ok: true });
  })
);

adminRouter.get(
  '/audit',
  asyncRoute(async (req, res) => {
    const items = await Audit.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ ok: true, items });
  })
);


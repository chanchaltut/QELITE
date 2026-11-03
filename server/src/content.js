// Content storage: drafts, publishing and the public snapshot.
import crypto from 'node:crypto';
import { CONTENT, CONTENT_KEYS, PUBLIC_KEYS, validateContent } from '../../shared/schema.js';
import { Content, Publish } from './models.js';

const KEEP_PUBLISHES = 60;

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Adds any content key missing from the database, using the site's built-in content. */
export async function ensureContent(defaults) {
  const existing = new Set((await Content.find({}, { key: 1 }).lean()).map((c) => c.key));
  const missing = CONTENT_KEYS.filter((k) => !existing.has(k) && defaults[k]);
  for (const key of missing) {
    await Content.create({ key, draft: defaults[key], published: defaults[key], updatedBy: 'initial import' });
  }
  if (missing.length) console.log(`[content] imported: ${missing.join(', ')}`);
}

export function describe(doc) {
  const def = CONTENT[doc.key];
  return {
    key: doc.key,
    title: def?.title || doc.key,
    section: def?.section,
    icon: def?.icon,
    description: def?.description,
    private: Boolean(def?.private),
    hasChanges: !def?.private && !same(doc.draft, doc.published),
    version: doc.version,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    publishedAt: doc.publishedAt,
  };
}

/** Public content keyed by content key, from drafts (preview) or published values. */
export async function collect(field) {
  const docs = await Content.find({ key: { $in: PUBLIC_KEYS } }).lean();
  return Object.fromEntries(docs.map((d) => [d.key, d[field]]));
}

export function validateAll(content) {
  const errors = [];
  Object.entries(content).forEach(([key, data]) => {
    validateContent(key, data).forEach((e) => errors.push({ key, title: CONTENT[key]?.title, path: e.path, message: e.message }));
  });
  return errors;
}

export const newSnapshotId = () => `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;

/** Stores a publish record and trims old history. */
export async function recordPublish({ content, user, note }) {
  const publish = await Publish.create({ snapshotId: newSnapshotId(), content, publishedBy: user?.email, note });
  const old = await Publish.find({}, { _id: 1 }).sort({ createdAt: -1 }).skip(KEEP_PUBLISHES).lean();
  if (old.length) await Publish.deleteMany({ _id: { $in: old.map((o) => o._id) } });
  return publish;
}

export const toSnapshot = (publish) => ({ id: publish.snapshotId, publishedAt: publish.createdAt.toISOString(), content: publish.content });

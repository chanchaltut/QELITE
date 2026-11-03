// ═══════════════════════════════════════════════════════════
//  Published content from the admin panel.
//
//  The build writes the latest published snapshot to
//  src/generated/snapshot.js (see scripts/fetch-snapshot.mjs), so content
//  ships inside the site — visitors never wait on the API.
//
//  Every value is merged over the defaults in src/data field by field:
//  a missing or wrongly-typed field falls back to its default, so a bad
//  value can never crash a page.
// ═══════════════════════════════════════════════════════════

import built from '../generated/snapshot.js';

const PREVIEW_KEY = 'qe-preview';
const PREVIEW_FLAG = 'qe-preview-on';

// Admin "Preview" stores the draft snapshot locally and opens the site with ?preview=1.
function loadPreview() {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === '1') sessionStorage.setItem(PREVIEW_FLAG, '1');
    if (params.get('preview') === '0') sessionStorage.removeItem(PREVIEW_FLAG);
    if (sessionStorage.getItem(PREVIEW_FLAG) !== '1') return null;
    const saved = JSON.parse(localStorage.getItem(PREVIEW_KEY) || 'null');
    return saved?.content ? saved : null;
  } catch {
    return null;
  }
}

const preview = loadPreview();
const snapshot = preview || built || null;

export const isPreview = Boolean(preview);
export const snapshotInfo = snapshot ? { id: snapshot.id, publishedAt: snapshot.publishedAt } : null;

export const exitPreview = () => {
  try {
    sessionStorage.removeItem(PREVIEW_FLAG);
  } catch {
    /* storage unavailable */
  }
  window.location.href = window.location.pathname;
};

const isObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

// Blank value for a field missing from a new list item: strings → '', lists → [], flags → false.
const blankLike = (tpl) => {
  if (Array.isArray(tpl)) return [];
  if (isObject(tpl)) return conform({}, tpl, true);
  if (typeof tpl === 'string') return '';
  if (typeof tpl === 'boolean') return false;
  return null;
};

/**
 * Shapes `value` like `tpl`. Objects merge key by key; arrays are replaced
 * whole, with each item shaped like the template's first item; null is
 * accepted anywhere (it is how a field is cleared). Inside list items,
 * missing fields become blanks rather than the template's sample text.
 */
export function conform(value, tpl, inItem = false) {
  if (tpl === null || tpl === undefined) return value === undefined ? tpl : value;
  if (value === undefined) return inItem ? blankLike(tpl) : tpl;
  if (value === null) return null;
  if (Array.isArray(tpl)) {
    if (!Array.isArray(value)) return tpl;
    const itemTpl = tpl.find((t) => t !== null && t !== undefined);
    if (itemTpl === undefined) return value;
    // Drop items of the wrong kind (e.g. a string where an object is expected) instead of guessing
    const sameKind = (v) => (isObject(itemTpl) ? isObject(v) : typeof v === typeof itemTpl);
    return value.filter(sameKind).map((v) => conform(v, itemTpl, true));
  }
  if (isObject(tpl)) {
    if (!isObject(value)) return tpl;
    const out = { ...value };
    Object.keys(tpl).forEach((k) => {
      out[k] = conform(value[k], tpl[k], inItem);
    });
    return out;
  }
  return typeof value === typeof tpl ? value : tpl;
}

/** True when the published snapshot contains this content key. */
export const hasContent = (key) => isObject(snapshot?.content?.[key]);

/** Published value of `key.field` (or the whole `key` document), shaped like `fallback`. */
export function fromContent(key, field, fallback) {
  const doc = snapshot?.content?.[key];
  if (!isObject(doc)) return fallback;
  const value = field ? doc[field] : doc;
  try {
    return conform(value, fallback);
  } catch {
    return fallback;
  }
}

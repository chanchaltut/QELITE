// Image URL helpers. Cloudinary uploads (from the admin panel) get automatic
// format/quality and responsive widths; other URLs are used as they are.

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;
const LOCAL_HERO = /^\/images\/hero-\d+\.webp$/;

/** Cloudinary URL resized to `width` (omit for original size) in the best format for the browser. */
export function img(src, width) {
  const m = typeof src === 'string' && src.match(CLOUDINARY_UPLOAD);
  if (!m) return src;
  return `${m[1]}f_auto,q_auto${width ? `,w_${width},c_limit` : ''}/${m[2]}`;
}

/** srcset for a full-width image, or undefined when the source has no sizes. */
export function srcSetFor(src, widths = [800, 1600, 2400]) {
  if (typeof src !== 'string') return undefined;
  if (CLOUDINARY_UPLOAD.test(src)) return widths.map((w) => `${img(src, w)} ${w}w`).join(', ');
  if (LOCAL_HERO.test(src)) return widths.map((w) => `/images/hero-${w}.webp ${w}w`).join(', ');
  return undefined;
}

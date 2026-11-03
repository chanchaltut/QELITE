// Admin API client. Requests go to /api on the same domain (forwarded to the
// API server by vercel.json), so the session cookie is first-party.

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, body = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export async function api(path, { method = 'GET', body, timeout = 60000 } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      credentials: 'include',
      headers: { 'X-Requested-With': 'qe-admin', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout),
    });
  } catch {
    throw new ApiError('Can’t reach the server. Check your internet connection and try again (the server may take up to a minute to wake up).', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/auth/login') onUnauthorized();
  if (!res.ok || data.ok === false) throw new ApiError(data.error || `Request failed (${res.status}).`, res.status, data);
  return data;
}

export const downloadUrl = (path) => `${BASE}/api${path}`;

/** Uploads a file straight to Cloudinary and records it in the media library. Returns the URL. */
export async function uploadFile(file, { pdf = false } = {}) {
  const max = 10 * 1024 * 1024;
  if (file.size > max) throw new ApiError('Files must be under 10 MB. Compress the image (e.g. squoosh.app) and try again.', 413);
  if (!pdf && !file.type.startsWith('image/')) throw new ApiError('Please choose an image file (JPG, PNG, WebP or SVG).', 400);
  if (pdf && file.type !== 'application/pdf' && !file.type.startsWith('image/')) throw new ApiError('Please choose a PDF or an image.', 400);

  const resourceType = pdf && file.type === 'application/pdf' ? 'raw' : 'image';
  const sig = await api('/admin/media/sign', { method: 'POST', body: { resourceType } });
  const form = new FormData();
  Object.entries(sig.fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);

  let res;
  try {
    res = await fetch(sig.url, { method: 'POST', body: form });
  } catch {
    throw new ApiError('Upload failed — check your connection and try again.', 0);
  }
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(out?.error?.message || 'Upload failed.', res.status);

  await api('/admin/media', {
    method: 'POST',
    body: {
      url: out.secure_url, publicId: out.public_id, resourceType, filename: file.name,
      bytes: out.bytes, width: out.width, height: out.height,
    },
  });
  return out.secure_url;
}

export const formatDateTime = (v) =>
  v ? new Date(v).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

/** Uploads a certificate PDF straight to the API (stored in the database, never on a public CDN). */
export async function uploadCertificatePdf(id, file) {
  const max = 10 * 1024 * 1024;
  if (file.size > max) throw new ApiError('PDFs must be under 10 MB. Re-export the certificate at a lower image quality and try again.', 413);
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) throw new ApiError('Please choose a PDF file.', 400);
  let res;
  try {
    res = await fetch(`${BASE}/api/admin/certificates/${id}/file`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'X-Requested-With': 'qe-admin', 'Content-Type': 'application/pdf', 'X-File-Name': encodeURIComponent(file.name).slice(0, 200) },
      body: file,
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new ApiError('Upload failed. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) onUnauthorized();
  if (!res.ok || data.ok === false) throw new ApiError(data.error || `Upload failed (${res.status}).`, res.status, data);
  return data;
}

export const formatDate = (iso) =>
  iso ? new Date(`${String(iso).slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '—';

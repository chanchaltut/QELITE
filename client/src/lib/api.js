// Calls from the public website to the API: form submissions and certificate
// lookups. On Vercel, /api/* is forwarded to the API server (see vercel.json), so
// no URL needs configuring. VITE_API_URL is only needed if the API is called
// directly on another domain.

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function submitForm(collection, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`${API_URL}/api/public/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, page: window.location.pathname }),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    // Only a confirmed save counts — never report success the visitor can't rely on
    return { ok: res.ok && data.ok === true, data };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Looks up one certificate by its exact number.
 * Resolves to { state: 'found', certificate } | { state: 'not-found' } |
 * { state: 'error', message } (network, rate limit, server asleep).
 */
export async function verifyCertificate(number, { signal } = {}) {
  try {
    const res = await fetch(`${API_URL}/api/public/certificates?number=${encodeURIComponent(number)}`, {
      headers: { Accept: 'application/json' },
      signal: signal || AbortSignal.timeout(70000),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok && data.found) return { state: 'found', certificate: data.certificate };
    if (res.ok && data.ok && !data.found) return { state: 'not-found' };
    return { state: 'error', message: data.error || 'The register could not be reached. Please try again in a minute.' };
  } catch (err) {
    if (err?.name === 'AbortError' && signal?.aborted) return { state: 'aborted' };
    return { state: 'error', message: 'The register could not be reached. Check your connection and try again.' };
  }
}

/** Address of the certificate copy (PDF) for a valid certificate. */
export const certificateFileUrl = (number, download = false) =>
  `${API_URL}/api/public/certificates/file?number=${encodeURIComponent(number)}${download ? '&download=1' : ''}`;

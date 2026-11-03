// ═══════════════════════════════════════════════════════════
//  Certificate register — rules shared by the API and the admin panel.
//
//  Certificates are stored in their own MongoDB collection (never in the
//  website build). The public site can only look one up by its exact
//  number; see server/src/routes/public.js.
// ═══════════════════════════════════════════════════════════

/** Status stored on a certificate. "Expired" is never stored: it is worked out from the expiry date. */
export const CERT_STATUSES = ['valid', 'suspended', 'withdrawn'];

export const STATUS_INFO = {
  valid: {
    label: 'Valid',
    headline: 'This certificate is valid',
    text: 'The certificate is current and the organisation remains certified, subject to satisfactory surveillance audits.',
  },
  suspended: {
    label: 'Suspended',
    headline: 'This certificate is suspended',
    text: 'Certification is temporarily suspended. The organisation must not claim certification until the suspension is lifted.',
  },
  withdrawn: {
    label: 'Withdrawn',
    headline: 'This certificate has been withdrawn',
    text: 'Certification has been withdrawn and the certificate is no longer valid.',
  },
  expired: {
    label: 'Expired',
    headline: 'This certificate has expired',
    text: 'The certification cycle has ended without re-certification. The certificate is no longer valid.',
  },
};

/** Lookup key: upper case, letters and digits only, so "qms/26-0001", "QMS 26 0001" and "QMS26-0001" all match. */
export const lookupKey = (number) => String(number ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Tidy display form of a number typed by an editor. */
export const cleanNumber = (number) => String(number ?? '').trim().replace(/\s+/g, ' ').toUpperCase();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const isIsoDate = (v) => typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

/** Adds whole years to a YYYY-MM-DD date and subtracts one day (30 Oct 2026 + 1 → 29 Oct 2027). */
export function cycleDate(isoDate, years) {
  if (!isIsoDate(isoDate)) return '';
  const d = new Date(`${isoDate}T00:00:00Z`);
  const target = new Date(Date.UTC(d.getUTCFullYear() + years, d.getUTCMonth(), d.getUTCDate()));
  // 29 Feb + 1 year rolls into March; step back to the last day of February instead
  if (target.getUTCMonth() !== d.getUTCMonth()) target.setUTCDate(0);
  target.setUTCDate(target.getUTCDate() - 1);
  return target.toISOString().slice(0, 10);
}

/** Today's date (YYYY-MM-DD) in India, where certificates are issued. */
export const todayIST = (now = Date.now()) => new Date(now + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/** Status a visitor should see: a valid certificate past its expiry date reads "expired". */
export function effectiveStatus(cert, today = todayIST()) {
  if (!cert) return null;
  if (cert.status === 'valid' && isIsoDate(cert.expiryDate) && cert.expiryDate < today) return 'expired';
  return CERT_STATUSES.includes(cert.status) ? cert.status : 'withdrawn';
}

// ─── Editable fields (admin form + server validation) ───────
export const CERT_FIELDS = {
  number: { label: 'Certificate number', required: true, max: 60 },
  title: { label: 'Certificate title', required: true, max: 80 },
  organisation: { label: 'Organisation', required: true, max: 200 },
  address: { label: 'Address', max: 400 },
  standard: { label: 'Standard', required: true, max: 60 },
  standardTitle: { label: 'Standard name', max: 120 },
  scope: { label: 'Scope of certification', required: true, max: 1500 },
  issueDate: { label: 'Date of initial registration', required: true, date: true },
  surveillance1: { label: 'First surveillance audit on or before', date: true },
  surveillance2: { label: 'Second surveillance audit on or before', date: true },
  expiryDate: { label: 'Re-certification due (expiry)', required: true, date: true },
  status: { label: 'Status', required: true, options: CERT_STATUSES },
  remarks: { label: 'Internal notes', max: 2000 },
};

/** Keeps only known fields, trimmed. */
export function pickCertificate(input) {
  const out = {};
  Object.entries(CERT_FIELDS).forEach(([key, def]) => {
    const raw = input?.[key];
    if (raw === undefined || raw === null) {
      out[key] = '';
      return;
    }
    let value = String(raw).trim();
    if (key === 'number') value = cleanNumber(value);
    if (def.date) value = value.slice(0, 10);
    out[key] = value;
  });
  return out;
}

/** Returns [{ path, message }]; empty when valid. */
export function validateCertificate(cert) {
  const errors = [];
  Object.entries(CERT_FIELDS).forEach(([key, def]) => {
    const value = cert[key];
    if (!value) {
      if (def.required) errors.push({ path: key, message: `${def.label} is required` });
      return;
    }
    if (def.max && value.length > def.max) errors.push({ path: key, message: `${def.label} is too long (max ${def.max} characters)` });
    if (def.date && !isIsoDate(value)) errors.push({ path: key, message: `${def.label} must be a valid date` });
    if (def.options && !def.options.includes(value)) errors.push({ path: key, message: `${def.label} has an unknown value` });
  });
  if (cert.number && lookupKey(cert.number).length < 4) errors.push({ path: 'number', message: 'Certificate number must contain at least 4 letters or digits' });
  if (isIsoDate(cert.issueDate) && isIsoDate(cert.expiryDate) && cert.expiryDate <= cert.issueDate) {
    errors.push({ path: 'expiryDate', message: 'Expiry must be after the date of initial registration' });
  }
  return errors;
}

/** The fields a visitor may see after a successful lookup. */
export const PUBLIC_CERT_FIELDS = [
  'number', 'title', 'organisation', 'address', 'standard', 'standardTitle', 'scope',
  'issueDate', 'surveillance1', 'surveillance2', 'expiryDate',
];

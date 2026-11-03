import React, { useEffect, useState } from 'react';
import { STATUS_INFO } from '../../../../shared/certificates.js';
import { SITE } from '../../data/site';
import { CERTIFICATE } from '../../data/certification';
import { certificateFileUrl } from '../../lib/api';
import { CertificateDocument, CertificateFrame, longDate, useCertificateFonts } from './CertificateDocument';

const TONES = {
  valid: { card: 'bg-brand-700 text-white', badge: 'bg-seal text-ink-900', icon: 'ri-shield-check-fill', ring: 'ring-seal/40' },
  suspended: { card: 'bg-[#8A5A00] text-white', badge: 'bg-[#FFD98A] text-ink-900', icon: 'ri-pause-circle-fill', ring: 'ring-[#FFD98A]/40' },
  withdrawn: { card: 'bg-[#9B1C1C] text-white', badge: 'bg-rose text-ink-900', icon: 'ri-close-circle-fill', ring: 'ring-rose/40' },
  expired: { card: 'bg-ink-800 text-white', badge: 'bg-paper-2 text-ink-900', icon: 'ri-time-fill', ring: 'ring-white/30' },
};

const checkedAtText = (iso) =>
  new Date(iso || Date.now()).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });

// ─── Loading ──────────────────────────────────────────────────
export function VerificationLoading({ number }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative overflow-hidden rounded-panel border border-ink-900/15 bg-white p-8 sm:p-10" role="status" aria-live="polite">
      <div className="absolute inset-x-8 top-8 h-px animate-scan bg-gradient-to-r from-transparent via-brand-500 to-transparent [--scan-distance:180px]" aria-hidden="true" />
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-paper text-xl text-ink-900">
          <i className="ri-loader-4-line animate-spin" />
        </span>
        <div>
          <p className="font-serif text-[1.75rem] leading-tight text-ink-900">Checking the register…</p>
          <p className="code mt-1 text-sm text-muted">{number}</p>
        </div>
      </div>
      <div className="mt-8 space-y-3" aria-hidden="true">
        {[72, 92, 56, 84].map((w) => (
          <div key={w} className="h-3 animate-pulse rounded-full bg-paper-2" style={{ width: `${w}%` }} />
        ))}
      </div>
      {slow && <p className="mt-6 text-sm text-ink-800">Still working. The register may take up to a minute to respond after a quiet period.</p>}
    </div>
  );
}

// ─── Not found / error ────────────────────────────────────────
export function VerificationNotFound({ number }) {
  return (
    <div className="rounded-panel border border-ink-900 bg-white p-7 sm:p-10" role="status" aria-live="polite">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-rose text-2xl text-[#9B1C1C]">
          <i className="ri-error-warning-line" />
        </span>
        <div className="min-w-0">
          <p className="font-serif text-[2rem] leading-[1.05] text-ink-900">No certificate found</p>
          <p className="mt-2 text-[1.0625rem] text-ink-800">
            There is no QELITE certificate with the number <span className="code break-all rounded bg-paper px-1.5 py-0.5 font-medium text-ink-900">{number}</span>.
          </p>
          <ul className="mt-5 space-y-2 text-[0.9375rem] text-ink-800">
            <li className="flex gap-2.5"><i className="ri-arrow-right-s-line mt-0.5 text-brand-600" /> Check each character. The letter O and the digit 0, or I and 1, are easy to confuse.</li>
            <li className="flex gap-2.5"><i className="ri-arrow-right-s-line mt-0.5 text-brand-600" /> Spaces, slashes and hyphens don’t matter. Letters and digits must match.</li>
            <li className="flex gap-2.5"><i className="ri-arrow-right-s-line mt-0.5 text-brand-600" /> If the number is right, the certificate was not issued by QELITE. Do not rely on it.</li>
          </ul>
          <a href="#report" className="btn-dark mt-7">Report this certificate</a>
        </div>
      </div>
    </div>
  );
}

export function VerificationError({ message, onRetry }) {
  return (
    <div className="rounded-panel border border-ink-900/20 bg-white p-7 sm:p-10" role="alert">
      <p className="font-serif text-[1.75rem] leading-tight text-ink-900">We couldn’t complete the check</p>
      <p className="mt-2 text-ink-800">{message}</p>
      <button onClick={onRetry} className="btn-dark mt-6"><i className="ri-refresh-line" /> Try again</button>
    </div>
  );
}

// ─── Certification cycle bar ──────────────────────────────────
function CycleBar({ cert, now }) {
  const start = Date.parse(`${cert.issueDate}T00:00:00Z`);
  const end = Date.parse(`${cert.expiryDate}T00:00:00Z`);
  if (!start || !end || end <= start) return null;
  const pos = (iso) => Math.min(100, Math.max(0, ((Date.parse(`${iso}T00:00:00Z`) - start) / (end - start)) * 100));
  const today = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  const points = [
    { iso: cert.issueDate, label: 'Registered' },
    cert.surveillance1 && { iso: cert.surveillance1, label: '1st surveillance' },
    cert.surveillance2 && { iso: cert.surveillance2, label: '2nd surveillance' },
    { iso: cert.expiryDate, label: 'Re-certification due' },
  ].filter(Boolean);

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Certification cycle</p>
      <div className="relative mt-10 h-2 rounded-full bg-paper-2">
        <div className="absolute inset-y-0 left-0 rounded-full bg-brand-600" style={{ width: `${today}%` }} />
        {points.map((p) => (
          <span key={p.label} className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink-900" style={{ left: `${pos(p.iso)}%` }} />
        ))}
        {today > 0 && today < 100 && (
          <span className="absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-900 px-2 py-0.5 text-2xs font-semibold text-white" style={{ left: `${today}%` }}>
            Today
          </span>
        )}
      </div>
      <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {points.map((p) => (
          <li key={p.label}>
            <p className="text-xs text-muted">{p.label}</p>
            <p className="text-sm font-medium text-ink-900">{longDate(p.iso)}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Detail({ label, children, wide }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</dt>
      <dd className="mt-1.5 text-[1rem] leading-relaxed text-ink-900">{children}</dd>
    </div>
  );
}

// ─── Found ────────────────────────────────────────────────────
export function VerificationFound({ cert }) {
  useCertificateFonts();
  const status = STATUS_INFO[cert.status] ? cert.status : 'withdrawn';
  const info = STATUS_INFO[status];
  const tone = TONES[status];
  const [copied, setCopied] = useState(false);
  const shareUrl = `${SITE.url}/verify?cert=${encodeURIComponent(cert.number)}`;
  const now = Date.parse(cert.checkedAt) || Date.now();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Status */}
      <div className={`on-dark relative overflow-hidden rounded-panel p-7 sm:p-10 ${tone.card}`}>
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className={`grid h-20 w-20 shrink-0 animate-stamp place-items-center rounded-full bg-white/10 text-[2.75rem] ring-8 ${tone.ring}`} aria-hidden="true">
            <i className={tone.icon} />
          </span>
          <div className="min-w-0 flex-1">
            <span className={`tag !px-2.5 !py-1 !text-xs uppercase tracking-[0.14em] ${tone.badge}`}>{info.label}</span>
            <p className="mt-3 font-serif text-[2.25rem] leading-[1.02] text-white sm:text-[2.75rem]">{info.headline}</p>
            <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-white/80">{info.text}</p>
          </div>
        </div>
        <p className="relative mt-6 border-t border-white/15 pt-4 text-xs text-white/65">
          Checked against the QELITE register on {checkedAtText(cert.checkedAt)} IST. The register is the authoritative record.
        </p>
      </div>

      {/* Details */}
      <div className="rounded-panel border border-ink-900/15 bg-white p-7 sm:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">Certificate number</p>
            <p className="code mt-1 break-all text-[1.5rem] font-medium text-ink-900">{cert.number}</p>
          </div>
          <div className="no-print flex flex-wrap gap-2">
            <button onClick={copy} className="btn-outline btn-sm"><i className={copied ? 'ri-check-line' : 'ri-link'} /> {copied ? 'Link copied' : 'Copy link'}</button>
            <button onClick={() => window.print()} className="btn-outline btn-sm"><i className="ri-printer-line" /> Print</button>
          </div>
        </div>

        <dl className="mt-8 grid gap-x-10 gap-y-6 border-t border-line pt-8 sm:grid-cols-2">
          <Detail label="Certified organisation" wide>
            <span className="font-serif text-[1.75rem] leading-tight">{cert.organisation}</span>
            {cert.address && <span className="mt-1 block whitespace-pre-line text-[0.9375rem] text-ink-800">{cert.address}</span>}
          </Detail>
          <Detail label="Standard">
            <span className="code font-medium">{cert.standard}</span>
            {cert.standardTitle && <span className="block text-[0.9375rem] text-ink-800">{cert.standardTitle}</span>}
          </Detail>
          <Detail label="Certificate">{cert.title}</Detail>
          <Detail label="Scope of certification" wide>
            <span className="block text-[0.9375rem]">{cert.scope}</span>
          </Detail>
          <Detail label="Initial registration">{longDate(cert.issueDate)}</Detail>
          <Detail label={status === 'expired' ? 'Expired on' : 'Valid until'}>{longDate(cert.expiryDate)}</Detail>
        </dl>

        <CycleBar cert={cert} now={now} />
      </div>

      {/* Copy of the certificate — only for valid certificates */}
      {status === 'valid' && (
        <div className="no-print rounded-panel bg-texture p-5 sm:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Certificate copy</p>
              <p className="mt-3 font-serif text-[1.875rem] leading-tight text-ink-900">
                {cert.hasFile ? 'The certificate as issued' : 'Digital certificate'}
              </p>
            </div>
            {cert.hasFile && (
              <div className="flex flex-wrap gap-2">
                <a href={certificateFileUrl(cert.number)} target="_blank" rel="noopener noreferrer" className="btn-dark btn-sm"><i className="ri-external-link-line" /> Open PDF</a>
                <a href={certificateFileUrl(cert.number, true)} className="btn-light btn-sm"><i className="ri-download-2-line" /> Download</a>
              </div>
            )}
          </div>
          {cert.hasFile ? (
            <iframe
              title={`Certificate ${cert.number}`}
              src={`${certificateFileUrl(cert.number)}#view=FitH&toolbar=0`}
              className="hidden aspect-[210/297] w-full rounded-card border border-ink-900/15 bg-white md:block"
            />
          ) : (
            <CertificateFrame className="mx-auto max-w-[640px]">
              <CertificateDocument cert={cert} template={CERTIFICATE} siteUrl={SITE.url} />
            </CertificateFrame>
          )}
          {cert.hasFile && <p className="mt-3 text-center text-xs text-ink-800 md:hidden">Tap “Open PDF” to view the certificate.</p>}
        </div>
      )}
    </div>
  );
}

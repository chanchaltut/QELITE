// The QELITE certificate: an A4 portrait document (210 × 297 mm) drawn at
// 794 × 1123 px (96 dpi). The layout follows the client's reference certificates
// (ReferencePDFDesigns/) in QELITE's own branding:
//   logo → title → "This is to certify that" → organisation + address →
//   assessed by … → standard + name → scope → certificate no. → cycle dates →
//   validity note → signatory · seals · QR → verification line → small print.
//
// <CertificateFrame> scales it to fit any container on screen; when printed it
// fills one A4 page exactly (see the @page rule below).
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LogoMark } from '../ui/Logo';
import Guilloche from '../ui/Guilloche';
import QrCode from './QrCode';
import { isPlaceholder } from '../../lib/format';
import { img } from '../../lib/images';

export const PAGE_W = 794;
export const PAGE_H = 1123;

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Pinyon+Script&display=swap';

/** Loads the certificate typefaces once, only on pages that show a certificate. */
export function useCertificateFonts() {
  useEffect(() => {
    if (document.querySelector('link[data-certificate-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONTS_HREF;
    link.dataset.certificateFonts = 'true';
    document.head.appendChild(link);
  }, []);
}

const NAVY = '#0B1A2E';
const EMERALD = '#0A6B54';
const MINT = '#9DE5C8';
const serif = { fontFamily: '"EB Garamond", Garamond, "Times New Roman", serif' };
const script = { fontFamily: '"Pinyon Script", "EB Garamond", cursive' };
const mono = { fontFamily: '"Geist Mono", ui-monospace, monospace' };

const real = (v) => typeof v === 'string' && v.trim() !== '' && !isPlaceholder(v);

export const longDate = (iso) => {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
};

function DateRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3">
      <span style={serif} className="shrink-0 text-[17px] italic text-[#24344A]">{label}</span>
      <span className="mb-[5px] flex-1 border-b border-dotted border-[#0B1A2E]/35" aria-hidden="true" />
      <span style={serif} className="shrink-0 text-[17px] font-semibold" >{value}</span>
    </div>
  );
}

/**
 * @param cert      certificate record (number, title, organisation, address, standard, standardTitle, scope, dates…)
 * @param template  CERTIFICATE content (issuer, signatory, seals, notes…)
 * @param siteUrl   https://www.qelite.com — used for the QR code and verification line
 * @param watermark optional diagonal overlay, e.g. "SPECIMEN" or "SUSPENDED"
 */
export function CertificateDocument({ cert, template, siteUrl, watermark }) {
  const t = template || {};
  const issuer = t.issuer || 'QELITE Certification Services';
  const site = String(siteUrl || '').replace(/\/$/, '');
  const verifyHref = `${site}/verify?cert=${encodeURIComponent(cert.number || '')}`;
  const verifyLine = (t.verifyNote || '').replace('{site}', site.replace(/^https?:\/\//, ''));
  const seals = (t.seals || []).filter((s) => real(s.image));
  const address = (t.issuerAddress || []).filter(real);
  const sig = t.signatory || {};

  return (
    <article
      className="certificate-page relative overflow-hidden bg-[#FFFEFA] text-[#0B1A2E]"
      style={{ width: PAGE_W, height: PAGE_H }}
      aria-label={`${cert.title || 'Certificate'} ${cert.number || ''}`}
    >
      {/* Paper, frame and watermark */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #FFFFFF 0%, transparent 70%), radial-gradient(ellipse 90% 60% at 50% 100%, #F4EEDD 0%, transparent 70%)' }} />
      <div className="absolute inset-[18px] border-[1.5px]" style={{ borderColor: NAVY }} />
      <div className="absolute inset-[24px] border" style={{ borderColor: `${EMERALD}55` }} />
      <div className="absolute inset-[30px] border border-dashed" style={{ borderColor: `${NAVY}22` }} />
      {['left-[18px] top-[18px]', 'right-[18px] top-[18px] rotate-90', 'bottom-[18px] right-[18px] rotate-180', 'bottom-[18px] left-[18px] -rotate-90'].map((pos) => (
        <svg key={pos} viewBox="0 0 40 40" className={`absolute h-10 w-10 ${pos}`} aria-hidden="true">
          <path d="M0 0h40v3H3v37H0z" fill={NAVY} />
          <path d="M8 8h18v1.2H9.2V26H8z" fill={EMERALD} />
          <circle cx="8" cy="8" r="2.4" fill={MINT} stroke={NAVY} strokeWidth="0.8" />
        </svg>
      ))}
      <div className="absolute left-1/2 top-[52%] h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2" style={{ color: 'rgba(10, 107, 84, 0.085)' }}>
        <Guilloche className="h-full w-full" strokeWidth={0.5} />
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col px-[66px] pb-[44px] pt-[54px] text-center">
        <div className="flex flex-col items-center">
          <LogoMark className="h-[62px] w-[62px]" />
          <p className="mt-2.5 font-sans text-[22px] font-semibold leading-none tracking-[0.32em]" style={{ color: NAVY }}>QELITE</p>
          <p className="mt-1.5 font-sans text-[8.5px] font-medium uppercase tracking-[0.42em] text-[#4A586C]">Certification Services</p>
        </div>

        <h2 style={{ ...script, color: NAVY }} className="mt-5 text-[52px] leading-[1.05]">{cert.title || 'Certificate of Registration'}</h2>

        <p style={serif} className="mt-3 text-[16px] italic text-[#24344A]">This is to certify that</p>
        <p style={serif} className="mx-auto mt-2 max-w-[600px] text-[30px] font-bold uppercase leading-[1.1] tracking-[0.01em]">{cert.organisation}</p>
        {cert.address && <p style={serif} className="mx-auto mt-2 max-w-[560px] whitespace-pre-line text-[12.5px] font-semibold uppercase leading-snug tracking-[0.02em] text-[#24344A]">{cert.address}</p>}

        <p style={serif} className="mt-4 text-[16px] leading-snug text-[#24344A]">
          {(t.assessedLine || 'Has been assessed and certified by {issuer}').replace('{issuer}', issuer)}
          <br />
          as meeting the requirements of:
        </p>

        <p style={{ ...serif, color: NAVY }} className="mt-2 text-[44px] font-bold leading-none tracking-[-0.01em]">{cert.standard}</p>
        {cert.standardTitle && <p style={{ ...serif, color: EMERALD }} className="mt-2 text-[21px] font-semibold">({cert.standardTitle})</p>}

        <p style={serif} className="mt-4 text-[15px] italic text-[#24344A]">for the following scope of activities:</p>
        <p style={serif} className="mx-auto mt-1.5 max-w-[620px] text-[13.5px] font-bold uppercase leading-[1.35]">{cert.scope}</p>

        <div className="mt-5 flex justify-center">
          <p className="inline-flex items-center gap-3 rounded-full border px-5 py-1.5" style={{ borderColor: `${NAVY}33`, background: '#E1F6EE' }}>
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-[#4A586C]">Certificate No.</span>
            <span style={mono} className="text-[17px] font-medium tracking-[0.02em]">{cert.number}</span>
          </p>
        </div>

        <div className="mx-auto mt-5 w-full max-w-[560px] space-y-[9px] text-left">
          <DateRow label="Date of initial registration" value={longDate(cert.issueDate)} />
          <DateRow label="First surveillance audit on or before" value={longDate(cert.surveillance1)} />
          <DateRow label="Second surveillance audit on or before" value={longDate(cert.surveillance2)} />
          <DateRow label="Re-certification due" value={longDate(cert.expiryDate)} />
        </div>

        {t.propertyNote && <p style={serif} className="mx-auto mt-4 max-w-[560px] text-[14px] font-semibold leading-snug">{t.propertyNote}</p>}

        {/* Signatory · seals · QR */}
        <div className="mt-auto grid grid-cols-[1fr_auto_1fr] items-end gap-6 text-left">
          <div>
            <div className="flex h-[56px] items-end">
              {real(sig.signature) && <img src={img(sig.signature, 400)} alt="" className="max-h-[56px] w-auto max-w-[180px] object-contain" crossOrigin="anonymous" />}
            </div>
            <div className="mt-1 w-[190px] border-t" style={{ borderColor: NAVY }} />
            {real(sig.name) && <p style={serif} className="mt-1 text-[13px] font-semibold">{sig.name}</p>}
            <p style={serif} className="text-[12px] italic text-[#24344A]">{real(sig.designation) ? sig.designation : 'Authorised Signatory'}</p>
            <p className="mt-1 font-sans text-[9.5px] font-bold uppercase tracking-[0.12em]">{issuer}</p>
            {address.map((line) => (
              <p key={line} className="font-sans text-[9.5px] leading-[1.35] text-[#24344A]">{line}</p>
            ))}
          </div>

          <div className="flex flex-col items-center">
            {seals.length > 0 && (
              <div className="flex items-center gap-3">
                {seals.map((s) => (
                  <img key={s.image} src={img(s.image, 240)} alt={s.caption || ''} className="h-[78px] w-[78px] object-contain" crossOrigin="anonymous" />
                ))}
              </div>
            )}
            {real(t.accreditationCode) && <p className="mt-1.5 font-sans text-[9px] font-bold tracking-[0.08em]">{t.accreditationCode}</p>}
          </div>

          <div className="flex flex-col items-end">
            {t.showQr !== false && cert.number && (
              <>
                <div className="rounded-md border p-1.5" style={{ borderColor: `${NAVY}33` }}>
                  <QrCode value={verifyHref} className="h-[84px] w-[84px]" label="Scan to verify this certificate" />
                </div>
                <p className="mt-1 font-sans text-[8.5px] font-semibold uppercase tracking-[0.18em] text-[#4A586C]">Scan to verify</p>
              </>
            )}
          </div>
        </div>

        {verifyLine && (
          <p style={{ ...serif, color: EMERALD }} className="mt-3 text-[14px] font-semibold italic">{verifyLine}</p>
        )}
        {t.footer && <p className="mx-auto mt-1.5 max-w-[640px] font-sans text-[8.5px] leading-[1.45] text-[#4A586C]">{t.footer}</p>}
      </div>

      {watermark && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <p className="-rotate-[32deg] rounded-xl border-[6px] px-10 py-3 font-sans text-[86px] font-bold uppercase tracking-[0.12em] opacity-[0.16]" style={{ borderColor: '#B42318', color: '#B42318' }}>
            {watermark}
          </p>
        </div>
      )}
    </article>
  );
}

/** Scales the A4 certificate to the width of its container (screen only; print is full size). */
export function CertificateFrame({ children, className = '' }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => setScale(Math.min(1, el.clientWidth / PAGE_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={`certificate-frame w-full ${className}`}>
      <div className="certificate-frame-inner mx-auto overflow-hidden shadow-paper" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
        <div className="certificate-frame-scale" style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: PAGE_W, height: PAGE_H }}>
          {children}
        </div>
      </div>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { background: #fff !important; }
          .certificate-frame-inner { width: 210mm !important; height: 297mm !important; box-shadow: none !important; margin: 0 !important; }
          .certificate-frame-scale { transform: scale(${(210 / 25.4 * 96) / PAGE_W}) !important; }
          .certificate-page { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}

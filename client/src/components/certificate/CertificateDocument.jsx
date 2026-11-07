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
import CertificateBackground from './CertificateBackground';
import CertificateSeal from './CertificateSeal';
import QrCode from './QrCode';
import { SITE } from '../../data/site';
import { isPlaceholder } from '../../lib/format';
import { img } from '../../lib/images';

export const PAGE_W = 794;
export const PAGE_H = 1123;
const MIN_TEXT_ZOOM = 0.7;
const PAGE_BOTTOM_MARGIN = 46;

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
const serif = { fontFamily: '"EB Garamond", Garamond, "Times New Roman", serif' };
const script = { fontFamily: '"Pinyon Script", "EB Garamond", cursive' };

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
      <span style={serif} className="shrink-0 text-[16.5px] italic text-[#24344A]">{label}</span>
      <span className="mb-[5px] flex-1 border-b border-dotted border-[#0B1A2E]/35" aria-hidden="true" />
      <span style={serif} className="shrink-0 text-[16.5px] font-semibold">{value}</span>
    </div>
  );
}

/**
 * @param cert      certificate record (number, title, organisation, address, standard, standardTitle, scope, dates…)
 * @param template  CERTIFICATE content (issuer, signatory, seals, notes…)
 * @param siteUrl   https://www.qelite.in — used for the QR code and verification line
 * @param watermark optional diagonal overlay, e.g. "SPECIMEN" or "SUSPENDED"
 * @param qrHref    optional QR target, instead of this certificate's verification page
 * @param notice    optional line in the small print, e.g. for a specimen
 */
export function CertificateDocument({ cert, template, siteUrl, watermark, qrHref, notice }) {
  const t = template || {};
  const issuer = t.issuer || 'QELITE Certification Services';
  const site = String(siteUrl || '').replace(/\/$/, '');
  const host = site.replace(/^https?:\/\//, '');
  const verifyHref = qrHref || `${site}/verify?cert=${encodeURIComponent(cert.number || '')}`;
  const verifyLine = (t.verifyNote || '').replace('{site}', host);
  const seals = (t.seals || []).filter((s) => real(s.image));
  const address = (t.issuerAddress || []).filter(real);
  const sig = t.signatory || {};
  const sealId = `seal-${String(cert.number || 'certificate').replace(/[^A-Za-z0-9]/g, '')}`;
  const contentRef = useRef(null);
  const bodyRef = useRef(null);

  // Long names and scopes must never push the signature block off the page, so the
  // text block between the logo and the signatory shrinks just enough to fit.
  useLayoutEffect(() => {
    const content = contentRef.current;
    const body = bodyRef.current;
    if (!content || !body) return undefined;
    let active = true;
    const fit = () => {
      if (!active) return;
      let zoom = 1;
      body.style.zoom = zoom;
      for (let i = 0; i < 5; i += 1) {
        const last = content.lastElementChild;
        const overflow = last.offsetTop + last.offsetHeight - (content.clientHeight - PAGE_BOTTOM_MARGIN);
        if (overflow <= 0) break;
        zoom = Math.max(MIN_TEXT_ZOOM, zoom * (1 - (overflow + 4) / body.offsetHeight));
        body.style.zoom = zoom;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    return () => { active = false; };
  }, [cert.organisation, cert.address, cert.scope, cert.standard, cert.standardTitle, t.propertyNote, notice]);

  return (
    <article
      className="certificate-page relative overflow-hidden bg-white text-[#0B1A2E]"
      style={{ width: PAGE_W, height: PAGE_H }}
      aria-label={`${cert.title || 'Certificate'} ${cert.number || ''}`}
    >
      <CertificateBackground />

      {/* Content */}
      <div ref={contentRef} className="relative flex h-full flex-col px-[70px] pb-[46px] pt-[56px] text-center">
        <img src="/qeliteLogoNavy.svg" alt={issuer} className="mx-auto h-[78px] w-auto" />

        <div ref={bodyRef}>
        <h2 style={{ ...script, color: NAVY }} className="mt-4 text-[56px] leading-[1.1]">{cert.title || 'Certificate of Registration'}</h2>

        <p style={serif} className="mt-3 text-[16.5px] italic text-[#24344A]">This is to certify that</p>
        <p style={serif} className="mx-auto mt-1.5 max-w-[620px] text-[31px] font-bold uppercase leading-[1.1]">{cert.organisation}</p>
        {cert.address && <p style={serif} className="mx-auto mt-1.5 max-w-[560px] whitespace-pre-line text-[12.5px] font-semibold uppercase leading-snug tracking-[0.02em] text-[#24344A]">{cert.address}</p>}

        <p style={serif} className="mt-4 text-[16.5px] leading-snug text-[#24344A]">
          {(t.assessedLine || 'Has been assessed and certified by {issuer}').replace('{issuer}', issuer)}
          <br />
          as meeting the requirements of:
        </p>

        <p style={{ ...serif, color: NAVY }} className="mt-3 text-[48px] font-bold leading-none">{cert.standard}</p>
        {cert.standardTitle && <p style={{ ...serif, color: EMERALD }} className="mt-2 text-[21px] font-semibold leading-tight">({cert.standardTitle})</p>}

        <p style={serif} className="mt-4 text-[15.5px] italic text-[#24344A]">for the following scope of activities:</p>
        <p style={serif} className="mx-auto mt-1.5 max-w-[610px] text-balance text-[13.5px] font-bold uppercase leading-[1.35]">{cert.scope}</p>

        <p style={serif} className="mt-5 text-[17px] font-semibold">
          <span className="text-[13px] uppercase tracking-[0.14em] text-[#24344A]">Certificate No.</span>
          <span className="mx-2.5 text-[#0A6B54]">::</span>
          <span className="font-bold tracking-[0.03em]">{cert.number}</span>
        </p>

        <div className="mx-auto mt-4 w-full max-w-[540px] space-y-[8px] text-left">
          <DateRow label="Date of initial registration" value={longDate(cert.issueDate)} />
          <DateRow label="First surveillance audit on or before" value={longDate(cert.surveillance1)} />
          <DateRow label="Second surveillance audit on or before" value={longDate(cert.surveillance2)} />
          <DateRow label="Re-certification due" value={longDate(cert.expiryDate)} />
        </div>

        {t.propertyNote && <p style={serif} className="mx-auto mt-4 max-w-[560px] text-balance text-[13.5px] font-semibold leading-snug">{t.propertyNote}</p>}
        </div>

        {/* Signatory · seals · QR */}
        <div className="mt-auto grid pt-2 grid-cols-[1fr_auto_1fr] items-end gap-5 text-left">
          <div>
            <div className="flex h-[52px] items-end">
              {real(sig.signature) && <img src={img(sig.signature, 400)} alt="" className="max-h-[52px] w-auto max-w-[180px] object-contain" crossOrigin="anonymous" />}
            </div>
            <div className="mt-1 w-[190px] border-t" style={{ borderColor: NAVY }} />
            {real(sig.name) && <p style={serif} className="mt-1 text-[13px] font-semibold">{sig.name}</p>}
            <p style={serif} className="text-[12.5px] italic text-[#24344A]">{real(sig.designation) ? sig.designation : 'Authorised Signatory'}</p>
            <p className="mt-1 font-sans text-[9.5px] font-bold uppercase tracking-[0.1em]">{issuer}</p>
            {address.map((line) => (
              <p key={line} className="font-sans text-[9.5px] leading-[1.35] text-[#24344A]">{line}</p>
            ))}
            <p className="font-sans text-[9.5px] leading-[1.35] text-[#24344A]">{[host, SITE.email].filter(real).join('  ·  ')}</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <CertificateSeal standard={cert.standard} id={sealId} className="h-[112px] w-[112px]" />
              {seals.map((s) => (
                <img key={s.image} src={img(s.image, 240)} alt={s.caption || ''} className="h-[88px] w-[88px] object-contain" crossOrigin="anonymous" />
              ))}
            </div>
            {real(t.accreditationCode) && <p className="mt-1.5 font-sans text-[9px] font-bold tracking-[0.08em]">{t.accreditationCode}</p>}
          </div>

          <div className="flex flex-col items-end">
            {t.showQr !== false && cert.number && (
              <>
                <div className="border bg-white p-1" style={{ borderColor: `${NAVY}55` }}>
                  <QrCode value={verifyHref} className="h-[84px] w-[84px]" label="Scan to verify this certificate" />
                </div>
                <p className="mt-1 font-sans text-[8.5px] font-semibold uppercase tracking-[0.16em] text-[#4A586C]">Scan to verify</p>
              </>
            )}
          </div>
        </div>

        {verifyLine && (
          <p style={{ ...serif, color: EMERALD }} className="mt-2.5 text-[14px] font-semibold italic">{verifyLine}</p>
        )}
        {t.footer && <p className="mx-auto mt-1 max-w-[620px] font-sans text-[8.25px] leading-[1.4] text-[#4A586C]">{t.footer}</p>}
        {notice && <p className="mx-auto mt-1 max-w-[620px] font-sans text-[8.25px] font-semibold leading-[1.4] text-[#A32A1E]">{notice}</p>}
      </div>

      {watermark && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <p style={{ ...serif, color: '#A32A1E' }} className="-rotate-[38deg] whitespace-nowrap text-[128px] font-semibold uppercase tracking-[0.16em] opacity-[0.11]">
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

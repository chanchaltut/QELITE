// The QELITE certification portfolio: a cover, an index of the certifications on
// offer, one specimen certificate per standard and a closing page. The specimens use
// the same <CertificateDocument> as real certificates, so the two always match.
//
// Specimens are clearly marked and name no real organisation. Do not put real
// certificate data here.
import React from 'react';
import { CertificateDocument, PAGE_W, PAGE_H } from '../components/certificate/CertificateDocument';
import QrCode from '../components/certificate/QrCode';
import Guilloche from '../components/ui/Guilloche';
import { CERTIFICATE } from '../data/certification';
import { SITE, filled, fullAddress, hasPhone } from '../data/site';
import { STANDARDS } from '../data/standards';
import { cycleDate } from '../../../shared/certificates.js';

const NAVY = '#0B1A2E';
const EMERALD = '#0A6B54';
const serif = { fontFamily: '"EB Garamond", Garamond, "Times New Roman", serif' };

const ISSUE_DATE = '2026-11-01';
const YEAR = '2026';

// Certificate title, number prefix and an illustrative scope for each specimen.
const SPECIMENS = {
  'iso-9001': { prefix: 'QMS', scope: 'Design, manufacture and supply of precision engineered components and assemblies for industrial applications.' },
  'iso-14001': { prefix: 'EMS', scope: 'Manufacture and supply of polymer packaging products, including the associated waste, emissions and resource management activities.' },
  'iso-45001': { prefix: 'OHS', scope: 'Installation, testing, commissioning and maintenance of electrical and mechanical systems at client sites.' },
  'iso-13485': { prefix: 'MDQ', scope: 'Manufacture, supply and servicing of non-active, non-sterile medical devices.' },
  'iso-22000': { prefix: 'FSM', scope: 'Processing, packaging and distribution of ready-to-eat packaged food products.' },
  'iso-27001': { prefix: 'ISM', scope: 'Provision of software development, cloud hosting and managed IT services, in accordance with the Statement of Applicability.' },
  haccp: { prefix: 'HAC', title: 'Certificate of Compliance', scope: 'Production and packaging of bakery and confectionery products.' },
  'iso-50001': { prefix: 'ENM', scope: 'Energy management of manufacturing operations and supporting utilities at the certified site.' },
  'iso-22301': { prefix: 'BCM', scope: 'Business continuity management for the provision of data centre and IT outsourcing services.' },
  'iso-37001': { prefix: 'ABM', scope: 'Anti-bribery management for EPC contracting and infrastructure project services.' },
  'iso-21001': { prefix: 'EOM', scope: 'Design and delivery of vocational training and professional education programmes.' },
  'iso-20000-1': { prefix: 'ITS', scope: 'Provision of managed IT support, service desk and infrastructure services.' },
  gmp: { prefix: 'GMP', title: 'Certificate of Compliance', scope: 'Manufacture and packaging of cosmetic and personal-care products.' },
};

const SPECIMEN_NOTICE = 'Specimen for illustration only. This is not a certificate, and it does not certify any organisation.';

const PROCESS = [
  { title: 'Application and quote', desc: 'Tell us your scope, sites and headcount. We confirm the audit days and send a written quote.' },
  { title: 'Stage 1 audit', desc: 'A readiness review of your documentation, scope and planning. Any gaps are flagged before the main audit.' },
  { title: 'Stage 2 audit', desc: 'An assessment of whether your system is implemented and effective, on site or remotely where allowed.' },
  { title: 'Certification decision', desc: 'An independent reviewer checks the audit file. Your certificate is issued and added to the online register.' },
  { title: 'Surveillance audits', desc: 'Shorter audits in years one and two confirm that your system continues to work.' },
  { title: 'Re-certification', desc: 'A full re-assessment before expiry renews your certificate for another three-year cycle.' },
];

const CERT_PAGE_OFFSET = 3; // cover and index come first

function Sheet({ id, children, className = '', style }) {
  return (
    <section id={id} className={`sheet ${className}`} style={style}>
      {children}
    </section>
  );
}

function PageFrame({ children, folio }) {
  return (
    <div className="relative flex h-full flex-col px-[66px] pb-[44px] pt-[52px]" style={{ color: NAVY }}>
      <img src="/qeliteMarkWatermark.svg" alt="" className="absolute -right-[90px] top-[300px] w-[560px]" style={{ opacity: 0.045 }} />
      <header className="relative flex items-center justify-between border-b pb-4" style={{ borderColor: NAVY }}>
        <img src="/qeliteLogoNavy.svg" alt="QELITE" className="h-[38px] w-auto" />
        <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-[#4A586C]">Certification Portfolio</p>
      </header>
      <div className="relative flex flex-1 flex-col">{children}</div>
      <footer className="relative mt-5 flex items-center justify-between border-t pt-3 font-sans text-[9px] text-[#4A586C]" style={{ borderColor: `${NAVY}40` }}>
        <span>{SITE.legalName}</span>
        <span>{folio}</span>
      </footer>
    </div>
  );
}

function Cover() {
  return (
    <Sheet id="cover" className="relative overflow-hidden" style={{ background: NAVY, color: '#fff' }}>
      <div className="absolute -right-[330px] -top-[250px] h-[820px] w-[820px]" style={{ color: 'rgba(157, 229, 200, 0.13)' }}>
        <Guilloche className="h-full w-full" strokeWidth={0.5} />
      </div>
      <div className="absolute inset-[22px] border" style={{ borderColor: 'rgba(255,255,255,0.28)' }} />
      <div className="relative flex h-full flex-col px-[74px] pb-[76px] pt-[84px]">
        <img src="/qeliteLogo.svg" alt="QELITE" className="h-[92px] w-auto self-start" />
        <div className="mt-auto">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9DE5C8]">{SITE.tagline}</p>
          <h1 style={{ ...serif, color: '#fff' }} className="mt-5 text-[76px] font-medium leading-[1.02]">Certification<br />Portfolio</h1>
          <div className="mt-8 h-px w-[120px] bg-[#9DE5C8]" />
          <p style={serif} className="mt-7 max-w-[500px] text-[21px] leading-snug text-white/85">
            The standards we certify to, and the certificate your organisation receives for each of them.
          </p>
        </div>
        <div className="mt-[92px] flex items-end justify-between font-sans text-[11px] text-white/70">
          <p>
            <span className="block font-semibold text-white">{SITE.legalName}</span>
            <span className="mt-1 block">www.{SITE.domain}  ·  {SITE.email}</span>
          </p>
          <p>{YEAR}</p>
        </div>
      </div>
    </Sheet>
  );
}

function Index() {
  return (
    <Sheet id="index" className="relative overflow-hidden bg-white">
      <PageFrame folio="2">
        <h2 style={serif} className="mt-9 text-[38px] font-medium leading-none">Certifications we offer</h2>
        <p style={serif} className="mt-4 max-w-[620px] text-[16.5px] leading-snug text-[#24344A]">{SITE.description}</p>

        <table className="mt-7 w-full border-collapse text-left">
          <thead>
            <tr className="border-b font-sans text-[9px] font-semibold uppercase tracking-[0.14em] text-[#4A586C]" style={{ borderColor: NAVY }}>
              <th className="py-2 pr-3 font-semibold">Standard</th>
              <th className="py-2 pr-3 font-semibold">Certification</th>
              <th className="py-2 pr-3 font-semibold">Sector</th>
              <th className="py-2 text-right font-semibold">Page</th>
            </tr>
          </thead>
          <tbody>
            {STANDARDS.map((s, i) => (
              <tr key={s.slug} className="border-b" style={{ borderColor: `${NAVY}1F` }}>
                <td className="whitespace-nowrap py-[11px] pr-3 align-baseline">
                  <a href={`#${s.slug}`} style={serif} className="text-[15.5px] font-bold">{s.code}</a>
                </td>
                <td style={serif} className="py-[11px] pr-3 align-baseline text-[15px] leading-tight">{s.title}</td>
                <td className="whitespace-nowrap py-[11px] pr-3 align-baseline font-sans text-[10.5px] text-[#4A586C]">{s.family}</td>
                <td style={serif} className="py-[11px] text-right align-baseline text-[15px]">
                  <a href={`#${s.slug}`}>{i + CERT_PAGE_OFFSET}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-auto pt-6 font-sans text-[10px] leading-relaxed text-[#4A586C]">
          The certificates on the following pages are specimens that show the format of each certificate. The organisation, scope, number and dates are illustrative, and each is marked as a specimen. A certificate is issued only after a successful audit.
        </p>
      </PageFrame>
    </Sheet>
  );
}

function Specimen({ standard }) {
  const extra = SPECIMENS[standard.slug] || { prefix: 'CRT', scope: 'The certified scope of activities appears here.' };
  const site = SITE.url.replace(/\/$/, '');
  const cert = {
    number: `${extra.prefix}/26Q00000`,
    title: extra.title || 'Certificate of Registration',
    organisation: 'Your Organisation Name',
    address: 'Registered address of the organisation\nCity, State – PIN Code, India',
    standard: standard.code,
    standardTitle: standard.title,
    scope: extra.scope,
    issueDate: ISSUE_DATE,
    surveillance1: cycleDate(ISSUE_DATE, 1),
    surveillance2: cycleDate(ISSUE_DATE, 2),
    expiryDate: cycleDate(ISSUE_DATE, 3),
  };
  return (
    <Sheet id={standard.slug} className="overflow-hidden">
      {/* Heading for the PDF bookmarks; not visible on the page */}
      <h2 className="sr-only">{standard.code} specimen certificate</h2>
      <CertificateDocument cert={cert} template={CERTIFICATE} siteUrl={site} watermark="Specimen" qrHref={`${site}/verify`} notice={SPECIMEN_NOTICE} />
    </Sheet>
  );
}

function Closing({ page }) {
  const site = SITE.url.replace(/\/$/, '');
  const address = fullAddress();
  return (
    <Sheet id="next-steps" className="relative overflow-hidden bg-white">
      <PageFrame folio={String(page)}>
        <h2 style={serif} className="mt-9 text-[38px] font-medium leading-none">How certification works</h2>
        <ol className="mt-7">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="grid grid-cols-[46px_1fr] border-b py-[13px]" style={{ borderColor: `${NAVY}1F` }}>
              <span style={{ ...serif, color: EMERALD }} className="text-[24px] font-medium leading-none">{i + 1}</span>
              <div>
                <h3 style={serif} className="text-[18px] font-semibold leading-tight">{step.title}</h3>
                <p style={serif} className="mt-1 text-[15px] leading-snug text-[#24344A]">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid grid-cols-[1fr_auto] items-center gap-8 border p-6" style={{ borderColor: NAVY }}>
          <div>
            <h2 style={serif} className="text-[24px] font-medium leading-tight">Every certificate can be checked online</h2>
            <p style={serif} className="mt-2 text-[15px] leading-snug text-[#24344A]">
              Each QELITE certificate carries a QR code and a unique number. Anyone can confirm its current status on our online register at {SITE.domain}/verify.
            </p>
          </div>
          <QrCode value={`${site}/verify`} className="h-[92px] w-[92px]" label="Scan to open the QELITE certificate register" />
        </div>

        <div className="mt-auto pt-8">
          <h2 style={serif} className="text-[24px] font-medium leading-tight">Talk to us</h2>
          <p style={serif} className="mt-2 text-[16px] leading-snug text-[#24344A]">
            Tell us the standard, scope, sites and headcount, and we will send you a written quote.
          </p>
          <dl className="mt-4 space-y-1 font-sans text-[11px]">
            <div className="flex gap-3"><dt className="w-[64px] text-[#4A586C]">Email</dt><dd className="font-semibold"><a href={`mailto:${SITE.email}`}>{SITE.email}</a></dd></div>
            <div className="flex gap-3"><dt className="w-[64px] text-[#4A586C]">Website</dt><dd className="font-semibold"><a href={site}>{site.replace(/^https?:\/\//, '')}</a></dd></div>
            {hasPhone() && <div className="flex gap-3"><dt className="w-[64px] text-[#4A586C]">Phone</dt><dd className="font-semibold">{SITE.phone.display}</dd></div>}
            {filled(SITE.address?.street) && <div className="flex gap-3"><dt className="w-[64px] text-[#4A586C]">Office</dt><dd className="font-semibold">{address}</dd></div>}
          </dl>
        </div>
      </PageFrame>
    </Sheet>
  );
}

export default function Portfolio() {
  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .sheet {
          width: ${PAGE_W}px; height: ${PAGE_H}px; position: relative; overflow: hidden;
          break-after: page; break-inside: avoid;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .sheet:last-child { break-after: auto; }
        @media print { #portfolio { zoom: ${(210 / 25.4 * 96 / PAGE_W).toFixed(5)}; } }
      `}</style>
      <Cover />
      <Index />
      {STANDARDS.map((s) => <Specimen key={s.slug} standard={s} />)}
      <Closing page={STANDARDS.length + CERT_PAGE_OFFSET} />
    </>
  );
}

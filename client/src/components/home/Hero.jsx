import React from 'react';
import { Link } from 'react-router-dom';
import { HERO } from '../../data/content';
import Guilloche from '../ui/Guilloche';
import Ph, { ready } from '../ui/Ph';
import VerifyForm from '../certificate/VerifyForm';

// A specimen certificate card: shows what a QELITE certificate looks like and
// that it can be verified. Drawn in HTML with the site's own fonts (no request).
function SpecimenCertificate() {
  return (
    <div className="relative mx-auto w-full max-w-[25rem] lg:max-w-none" aria-hidden="true">
      {/* Back sheet */}
      <div className="absolute inset-0 translate-x-5 translate-y-4 rotate-[5deg] rounded-[0.5rem] bg-parchment/25 ring-1 ring-white/10" />
      {/* Certificate */}
      <div className="relative -rotate-[2.5deg] overflow-hidden rounded-[0.5rem] bg-[#FFFEFA] px-7 pb-7 pt-8 text-center text-ink-900 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)] transition-transform duration-700 hover:rotate-0 sm:px-10">
        <div className="pointer-events-none absolute inset-2.5 border border-ink-900/80" />
        <div className="pointer-events-none absolute inset-[0.9rem] border border-brand-600/30" />
        <Guilloche className="pointer-events-none absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 text-brand-600/[0.09]" strokeWidth={0.6} />

        <div className="relative">
          <img src="/qeliteLogoNavy.svg" alt="QELITE" width="138" height="36" className="mx-auto h-9 w-auto" />
          <p className="mt-4 font-serif text-[2rem] italic leading-none text-ink-900 sm:text-[2.375rem]">Certificate of Registration</p>
          <p className="mt-4 font-serif text-sm italic text-ink-800">This is to certify that</p>
          <p className="mt-1.5 text-[1.0625rem] font-semibold uppercase tracking-[0.06em]">Your Organisation</p>
          <div className="mx-auto mt-2 h-1.5 w-40 rounded-full bg-ink-900/10" />
          <p className="mt-4 text-[0.6875rem] text-ink-700">has been assessed and certified as meeting the requirements of</p>
          <p className="mt-1.5 font-serif text-[2.125rem] leading-none text-ink-900">ISO 9001:2015</p>
          <p className="mt-1 text-xs font-semibold text-brand-700">Quality Management System</p>
          <div className="mx-auto mt-4 space-y-1.5">
            <div className="mx-auto h-1.5 w-[85%] rounded-full bg-ink-900/10" />
            <div className="mx-auto h-1.5 w-[70%] rounded-full bg-ink-900/10" />
          </div>
          <p className="code mx-auto mt-5 inline-flex rounded-full bg-seal-light px-3 py-1 text-[0.75rem] font-medium ring-1 ring-ink-900/15">QMS/26Q00001</p>
          <div className="mt-6 flex items-end justify-between text-left">
            <div>
              <p className="font-serif text-xl italic leading-none text-ink-800">A. Signatory</p>
              <div className="mt-1 w-28 border-t border-ink-900" />
              <p className="mt-1 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-ink-700">Authorised signatory</p>
            </div>
            {/* Stylised QR */}
            <div className="grid h-14 w-14 grid-cols-5 grid-rows-5 gap-[2px] rounded border border-ink-900/20 bg-white p-1">
              {[1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1].map((on, i) => (
                <span key={i} className={on ? 'bg-ink-900' : ''} />
              ))}
            </div>
          </div>
        </div>
        <p className="absolute right-4 top-4 rotate-[8deg] rounded border border-ink-900/25 px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.2em] text-ink-700">Specimen</p>
      </div>

      {/* Verified stamp */}
      <div className="absolute -left-3 top-28 animate-stamp [animation-delay:600ms] sm:-left-10 sm:bottom-16 sm:top-auto">
        <div className="flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 text-ink-900 shadow-lift ring-1 ring-ink-900/10">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-xl text-white"><i className="ri-shield-check-fill" /></span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Valid</span>
            <span className="block text-2xs text-muted">Checked just now</span>
          </span>
        </div>
      </div>
      <div className="absolute -right-2 top-10 hidden animate-rise [animation-delay:900ms] sm:block lg:-right-8">
        <div className="flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-xs font-medium text-white ring-1 ring-white/15">
          <i className="ri-qr-scan-2-line text-base text-seal" /> Scan to verify
        </div>
      </div>
    </div>
  );
}

// Everything in the hero is bundled with the page; nothing waits on a network request.
export default function Hero() {
  const proof = ready(HERO.proof || [], 'value');
  return (
    <section className="on-dark relative isolate overflow-hidden bg-ink-grain text-white">
      <div className="pointer-events-none absolute -right-[18rem] top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 text-seal/[0.08]">
        <Guilloche className="h-full w-full animate-spin-slow" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950/60 to-transparent" />

      <div className="container-site grid gap-16 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
        <div className="animate-rise">
          {HERO.eyebrow && <p className="eyebrow eyebrow-light">{HERO.eyebrow}</p>}
          <h1 className="h-display mt-6 text-[3.25rem] leading-[0.95] !text-white sm:text-[4.75rem] lg:text-[5.75rem]">
            {HERO.title} {HERO.titleAccent && <em className="italic text-seal">{HERO.titleAccent}</em>}
          </h1>
          {HERO.description && <p className="mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-white/80 sm:text-xl">{HERO.description}</p>}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={HERO.primaryCta.href} className="btn-primary !px-8 !py-4 !text-base">
              {HERO.primaryCta.label} <i className="ri-arrow-right-line" />
            </Link>
            {HERO.secondaryCta?.label && HERO.secondaryCta?.href && (
              <Link to={HERO.secondaryCta.href} className="btn-outline-light !px-8 !py-4 !text-base">
                {HERO.secondaryCta.label}
              </Link>
            )}
          </div>

          <div className="mt-12 max-w-xl rounded-card border border-white/15 bg-white/[0.05] p-5 backdrop-blur-sm sm:p-6">
            <p className="mb-4 text-[0.9375rem] font-medium text-white">Have a QELITE certificate to check?</p>
            <VerifyForm variant="dark" />
          </div>

          {proof.length > 0 && (
            <dl className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/15">
              {proof.map((p) => (
                <div key={p.label} className="flex flex-col-reverse px-3 first:pl-0 last:pr-0 sm:px-6">
                  <dt className="mt-2 text-xs leading-snug text-white/65 sm:text-[0.8125rem]"><Ph>{p.label}</Ph></dt>
                  <dd className="font-serif text-[2.25rem] leading-none text-seal sm:text-[2.875rem]"><Ph>{p.value}</Ph></dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="animate-rise px-4 [animation-delay:150ms] sm:px-10 lg:px-0">
          <SpecimenCertificate />
        </div>
      </div>
    </section>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo, { breadcrumbLd, faqLd } from '../lib/seo';
import { SITE } from '../data/site';
import { VERIFICATION_FAQS } from '../data/content';
import { STATUS_INFO } from '../../../shared/certificates.js';
import { verifyCertificate, submitForm } from '../lib/api';
import { PageHero, SectionHeading } from '../components/ui';
import { FAQBlock } from '../components/Blocks';
import VerifyForm, { NUMBER_EXAMPLE } from '../components/certificate/VerifyForm';
import { VerificationLoading, VerificationFound, VerificationNotFound, VerificationError } from '../components/certificate/VerificationResult';

const STATUS_STYLE = {
  valid: { dot: 'bg-brand-600', icon: 'ri-shield-check-fill text-brand-600' },
  suspended: { dot: 'bg-[#C98A00]', icon: 'ri-pause-circle-fill text-[#C98A00]' },
  withdrawn: { dot: 'bg-[#B42318]', icon: 'ri-close-circle-fill text-[#B42318]' },
  expired: { dot: 'bg-ink-700', icon: 'ri-time-fill text-ink-700' },
};

// Where to find the number and the QR code on a certificate
function WhereToLook() {
  return (
    <div className="grid items-center gap-10 rounded-panel border border-line bg-white p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative mx-auto w-full max-w-[18rem]" aria-hidden="true">
        <div className="relative aspect-[210/297] rounded-md bg-parchment p-5 shadow-paper ring-1 ring-ink-900/10">
          <div className="absolute inset-2 border border-ink-900/50" />
          <div className="mx-auto h-6 w-6 rounded-full bg-ink-900" />
          <div className="mx-auto mt-3 h-2.5 w-3/4 rounded-full bg-ink-900/25" />
          <div className="mx-auto mt-4 h-2 w-1/2 rounded-full bg-ink-900/15" />
          <div className="mx-auto mt-2 h-3 w-2/3 rounded-full bg-ink-900/30" />
          <div className="mx-auto mt-4 h-4 w-1/2 rounded-full bg-ink-900/35" />
          <div className="mx-auto mt-3 space-y-1.5">
            <div className="mx-auto h-1.5 w-5/6 rounded-full bg-ink-900/15" />
            <div className="mx-auto h-1.5 w-4/6 rounded-full bg-ink-900/15" />
          </div>
          <div className="relative mx-auto mt-4 flex h-6 w-3/4 items-center justify-center rounded-full bg-seal ring-2 ring-brand-600">
            <span className="code text-[0.5625rem] font-semibold text-ink-900">{NUMBER_EXAMPLE}</span>
            <span className="absolute -right-3 -top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">1</span>
          </div>
          <div className="mx-auto mt-4 space-y-1.5">
            {[1, 2, 3].map((r) => <div key={r} className="mx-auto h-1.5 w-5/6 rounded-full bg-ink-900/10" />)}
          </div>
          <div className="absolute bottom-5 right-5 h-12 w-12 rounded-sm bg-[repeating-conic-gradient(#0B1A2E_0_25%,#fff_0_50%)] bg-[length:8px_8px] ring-2 ring-brand-600 ring-offset-2">
            <span className="absolute -left-3 -top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-2xs font-bold text-white">2</span>
          </div>
        </div>
      </div>
      <div>
        <p className="eyebrow">Where to look</p>
        <h2 className="h-display mt-4 text-[2.25rem] leading-[1.02] sm:text-[2.75rem]">Two ways to check <em className="italic text-brand-700">any certificate.</em></h2>
        <ol className="mt-8 space-y-6">
          <li className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">1</span>
            <div>
              <p className="font-semibold text-ink-900">Type the certificate number</p>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-800">Printed after “Certificate No.” below the scope, for example <span className="code rounded bg-paper px-1.5 py-0.5 text-ink-900">{NUMBER_EXAMPLE}</span>. Spaces, slashes and hyphens are ignored.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">2</span>
            <div>
              <p className="font-semibold text-ink-900">Or scan the QR code</p>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-800">Use your phone’s camera. It opens this page with the number filled in. Always check that the page address starts with <span className="code text-ink-900">{SITE.url.replace(/^https?:\/\//, '')}</span>.</p>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}

const EMPTY_REPORT = { name: '', email: '', phone: '', number: '', organisation: '', message: '' };

function ReportForm({ number }) {
  const [form, setForm] = useState({ ...EMPTY_REPORT, number: number || '' });
  const [status, setStatus] = useState('idle');
  useEffect(() => {
    if (number) setForm((f) => ({ ...f, number }));
  }, [number]);
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const res = await submitForm('reports', form);
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setForm(EMPTY_REPORT);
  };

  return (
    <section id="report" className="scroll-mt-28 bg-white py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <SectionHeading
          eyebrow="Report a concern"
          title="Seen a certificate"
          accent="that doesn’t check out?"
          intro="If a certificate carrying the QELITE name is not in the register, shows details that differ from the register, or is being used while suspended or withdrawn, tell us. Reports are handled confidentially."
        />
        <div className="rounded-panel border border-ink-900 bg-white p-6 sm:p-10">
          {status === 'done' ? (
            <div className="rounded-card bg-mint p-8 text-center">
              <i className="ri-checkbox-circle-line text-5xl text-brand-700" />
              <p className="mt-3 font-serif text-[1.875rem] leading-tight text-ink-900">Thank you. We’ve received your report.</p>
              <p className="mt-2 text-ink-800">We will look into it and contact you if we need more information.</p>
              <button onClick={() => setStatus('idle')} className="btn-outline mt-6">Send another</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Certificate number *</span>
                <input name="number" required value={form.number} onChange={onChange} className="input code" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Organisation named on it</span>
                <input name="organisation" value={form.organisation} onChange={onChange} className="input" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Your name *</span>
                <input name="name" required value={form.name} onChange={onChange} className="input" autoComplete="name" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-ink-900">Email *</span>
                <input name="email" type="email" required value={form.email} onChange={onChange} className="input" autoComplete="email" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-ink-900">What did you notice? *</span>
                <textarea name="message" required rows={4} value={form.message} onChange={onChange} className="input resize-none" placeholder="Where you saw the certificate, and what doesn’t match" />
              </label>
              <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-ink-800">We never share the identity of the person who made a report.</p>
                <button type="submit" disabled={status === 'sending'} className="btn-dark !px-7 !py-3.5">
                  {status === 'sending' ? 'Sending…' : 'Send report'} <i className="ri-send-plane-line" />
                </button>
              </div>
              {status === 'error' && (
                <p className="rounded-card bg-rose/50 p-4 text-sm text-ink-900 sm:col-span-2">
                  We couldn’t send your report just now. Please email it to <a href={`mailto:${SITE.email}`} className="text-link">{SITE.email}</a>.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Verify() {
  const [params] = useSearchParams();
  // Read the number after the first render, so the prerendered page and the browser agree
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const number = mounted ? (params.get('cert') || '').trim().slice(0, 60) : '';

  const [result, setResult] = useState(null); // null | { state, certificate?, message? }
  const [attempt, setAttempt] = useState(0);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!number) {
      setResult(null);
      return undefined;
    }
    const controller = new AbortController();
    setResult({ state: 'loading' });
    verifyCertificate(number, { signal: controller.signal }).then((r) => {
      if (r.state !== 'aborted') setResult(r);
    });
    return () => controller.abort();
  }, [number, attempt]);

  // Bring the result into view when a number is searched
  useEffect(() => {
    if (number && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [number]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Verify a certificate', path: '/verify' }];

  return (
    <>
      <Seo
        title="Verify a Certificate — Online Certificate Register"
        description={`Check whether a ${SITE.name} certificate is valid, suspended, withdrawn or expired. Enter the certificate number or scan the QR code on the certificate.`}
        path="/verify"
        jsonLd={[breadcrumbLd(crumbs), faqLd(VERIFICATION_FAQS)]}
      />
      <PageHero
        tone="dark"
        crumbs={crumbs}
        eyebrow="Online certificate register"
        title="Verify a"
        accent="certificate."
        intro="Enter the certificate number exactly as printed. You’ll see its live status, the certified organisation, the standard, the scope and the certification dates."
      >
        <div className="mt-9 max-w-2xl">
          <VerifyForm variant="dark" initial={number} autoFocus={false} />
          <p className="mt-3 text-[0.8125rem] text-white/60">Free and instant. Each check is against the live register, not a cached list.</p>
        </div>
      </PageHero>

      <section ref={resultRef} className="scroll-mt-24 bg-paper py-14 sm:py-20" aria-label="Verification result">
        <div className="container-site max-w-5xl">
          {!result && <WhereToLook />}
          {result?.state === 'loading' && <VerificationLoading number={number} />}
          {result?.state === 'found' && <VerificationFound cert={result.certificate} />}
          {result?.state === 'not-found' && <VerificationNotFound number={number} />}
          {result?.state === 'error' && <VerificationError message={result.message} onRetry={retry} />}
        </div>
      </section>

      <section id="statuses" className="scroll-mt-28 border-y border-line bg-white py-20 sm:py-24">
        <div className="container-site">
          <SectionHeading eyebrow="Reading the result" title="What each status" accent="means." />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(STATUS_INFO).map(([key, s]) => (
              <li key={key} className="rounded-card border border-line bg-paper p-6">
                <i className={`${STATUS_STYLE[key].icon} text-3xl`} aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold text-ink-900">{s.label}</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-800">{s.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <ReportForm number={result?.state === 'not-found' ? number : ''} />

      <div className="border-t border-line">
        <FAQBlock items={VERIFICATION_FAQS} eyebrow="Verification FAQ" title="About the" accent="register." link="/faqs#verification" />
      </div>
    </>
  );
}

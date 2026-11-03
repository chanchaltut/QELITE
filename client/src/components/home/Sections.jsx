import React from 'react';
import { Link } from 'react-router-dom';
import { STANDARDS, FEATURED_STANDARDS } from '../../data/standards';
import { WHY_US, JOURNEY, INDUSTRIES, TESTIMONIALS } from '../../data/content';
import { STATUS_INFO } from '../../../../shared/certificates.js';
import { SectionHeading, useReveal } from '../ui';
import Guilloche from '../ui/Guilloche';
import VerifyForm from '../certificate/VerifyForm';

const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
const inWords = (n) => NUMBER_WORDS[n] || String(n);

// ─── Moving strip of standards ────────────────────────────────
export function StandardsStrip() {
  const loop = [...STANDARDS, ...STANDARDS];
  return (
    <section className="border-b border-line bg-white" aria-label="Standards we certify">
      <div className="mask-fade-x relative overflow-hidden py-6">
        <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
          {loop.map((s, i) => (
            <Link
              key={`${s.slug}-${i}`}
              to={`/certifications/${s.slug}`}
              tabIndex={i >= STANDARDS.length ? -1 : 0}
              aria-hidden={i >= STANDARDS.length ? 'true' : undefined}
              className="group flex shrink-0 items-center gap-3 text-ink-900"
            >
              <i className={`${s.icon} text-lg text-brand-600`} aria-hidden="true" />
              <span className="code whitespace-nowrap text-[0.9375rem] font-medium group-hover:underline">{s.code}</span>
              <span className="whitespace-nowrap text-[0.8125rem] text-muted">{s.title}</span>
              <span className="ml-6 h-1 w-1 rounded-full bg-ink-900/25" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Certification programmes (bento) ─────────────────────────
const SPAN_SM = { 1: 'sm:col-span-1', 2: 'sm:col-span-2' };
const SPAN_LG = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4' };
export function Programmes() {
  const ref = useReveal();
  const featured = (FEATURED_STANDARDS.length ? FEATURED_STANDARDS : STANDARDS).slice(0, 6);
  if (!featured.length) return null;
  const [lead, ...rest] = featured;

  return (
    <section ref={ref} className="bg-white py-20 sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Certification programmes"
            title={`${inWords(STANDARDS.length)} standards.`}
            accent="One rigorous process."
            intro="Quality, environment, safety, food, information security, medical devices and more, all audited to the same standard of evidence and decided independently."
          />
          <Link to="/certifications" className="btn-outline shrink-0 self-start lg:self-auto">All standards</Link>
        </div>

        <div className="reveal mt-12 grid gap-3 sm:mt-16 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <Link
            to={`/certifications/${lead.slug}`}
            className="on-dark group relative isolate flex min-h-[26rem] flex-col overflow-hidden rounded-panel bg-ink-grain p-7 text-white sm:col-span-2 sm:p-10 lg:row-span-2"
          >
            <div className="pointer-events-none absolute -bottom-40 -right-40 -z-10 h-[30rem] w-[30rem] text-seal/[0.12] transition-transform duration-[1.5s] group-hover:rotate-45">
              <Guilloche className="h-full w-full" />
            </div>
            <span className="text-sm font-semibold text-seal">Most requested</span>
            <p className="code mt-8 text-[2.75rem] font-medium leading-none tracking-[-0.03em] sm:mt-12 sm:text-[3.75rem]">{lead.code}</p>
            <h3 className="mt-4 font-serif text-[2rem] leading-[1.05] !text-white sm:text-[2.5rem]">{lead.title}</h3>
            <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-white/75">{lead.shortDesc}</p>
            <span className="btn-primary mt-auto self-start">Explore {lead.code.split(':')[0]}</span>
          </Link>

          {rest.map((s) => (
            <Link key={s.slug} to={`/certifications/${s.slug}`} className="group relative flex flex-col rounded-card border border-line bg-paper p-6 transition-colors hover:border-ink-900 hover:bg-white sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-xl text-brand-700 ring-1 ring-line transition-colors group-hover:bg-seal group-hover:text-ink-900 group-hover:ring-ink-900" aria-hidden="true">
                  <i className={s.icon} />
                </span>
                <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted">{s.family}</span>
              </div>
              <p className="code mt-8 text-[1.375rem] font-medium leading-none tracking-[-0.02em] text-ink-900">{s.code}</p>
              <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.1] group-hover:underline">{s.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-800">{s.shortDesc}</p>
            </Link>
          ))}

          {/* Fills whatever is left of the last row: 2 columns on tablets, 4 on desktop */}
          <Link to="/certifications" className={`group flex items-center justify-between gap-6 rounded-card bg-texture p-6 sm:p-7 ${SPAN_SM[rest.length % 2 === 1 ? 1 : 2]} ${SPAN_LG[4 - (Math.max(0, rest.length - 4) % 4)]}`}>
            <span className="font-serif text-[1.625rem] leading-tight text-ink-900 sm:text-[1.875rem]">
              See all <em className="italic text-brand-700">{STANDARDS.length} standards</em>
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink-900 text-xl text-ink-900 transition-colors group-hover:bg-ink-900 group-hover:text-white">
              <i className="ri-arrow-right-line" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Verification explainer ───────────────────────────────────
const STATUS_DOTS = { valid: 'bg-brand-600', suspended: 'bg-[#C98A00]', withdrawn: 'bg-[#B42318]', expired: 'bg-ink-700' };

export function Verification() {
  const ref = useReveal();
  const steps = [
    { icon: 'ri-file-search-line', title: 'Find the number', text: 'It is printed on the certificate after “Certificate No.”, below the scope.' },
    { icon: 'ri-keyboard-line', title: 'Enter it, or scan the QR', text: 'Type it below or scan the QR code. Spaces and slashes don’t matter.' },
    { icon: 'ri-shield-check-line', title: 'See the live status', text: 'The status comes straight from our register, with the organisation, scope and dates.' },
  ];
  return (
    <section ref={ref} id="verification" className="relative overflow-hidden bg-texture py-20 sm:py-28">
      <div className="container-site grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Certificate verification"
            title="Every certificate."
            accent="One source of truth."
            intro="A certificate is only as good as the ability to check it. Every certificate QELITE issues is in a live register, so customers, auditors and tender committees can confirm it in seconds, without phoning anyone."
          />
          <ol className="mt-10 space-y-6">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink-900 bg-white text-xl text-ink-900">
                  <i className={s.icon} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted">Step {i + 1}</p>
                  <p className="mt-0.5 text-[1.0625rem] font-semibold text-ink-900">{s.title}</p>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-800">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="reveal">
          <div className="rounded-panel border border-ink-900 bg-white p-6 shadow-lift sm:p-9">
            <p className="font-serif text-[2rem] leading-tight text-ink-900">Verify a certificate</p>
            <p className="mt-1 text-sm text-ink-800">Free, instant and available around the clock.</p>
            <VerifyForm variant="light" className="mt-6" />
            <div className="mt-8 border-t border-line pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">What you might see</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(STATUS_INFO).map(([key, s]) => (
                  <li key={key} className="flex gap-3 rounded-card bg-paper p-4">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOTS[key]}`} aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold text-ink-900">{s.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-800">{s.text.split('.')[0]}.</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Certification journey (dark) ─────────────────────────────
export function Journey() {
  const ref = useReveal();
  if (!JOURNEY.length) return null;
  return (
    <section ref={ref} className="on-dark relative isolate overflow-hidden bg-ink-grain py-20 text-white sm:py-28">
      <div className="container-site">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            light
            eyebrow="How certification works"
            title="From application to certificate,"
            accent="and every year after."
            intro="A certificate runs for three years. Here is what happens, and when, so you can plan audits around your business rather than the other way round."
          />
          <Link to="/contact" className="btn-primary shrink-0 self-start lg:self-auto">Plan my certification</Link>
        </div>

        <ol className="reveal relative mt-14 grid gap-px overflow-hidden rounded-panel bg-white/10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {JOURNEY.map((step, i) => (
            <li key={step.title} className="relative bg-ink-900 p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="font-serif text-[3.25rem] italic leading-none text-seal">{String(i + 1).padStart(2, '0')}</span>
                {step.when && <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/80">{step.when}</span>}
              </div>
              <h3 className="mt-8 text-[1.25rem] font-semibold !text-white">{step.title}</h3>
              {step.desc && <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-white/70">{step.desc}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ─── Why QELITE ───────────────────────────────────────────────
export function WhyUs() {
  const ref = useReveal();
  if (!WHY_US.length) return null;
  return (
    <section ref={ref} className="bg-white py-20 sm:py-28">
      <div className="container-site grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Why QELITE"
            title="Rigorous where it matters."
            accent="Easy where it can be."
            intro="Certification should test your system, not your patience. These are the commitments behind every audit we run."
          />
          <Link to="/accreditation" className="text-link mt-8 inline-block text-[0.9375rem]">Read our impartiality and complaints policies</Link>
        </div>
        <ul className="reveal grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2">
          {WHY_US.map((w) => (
            <li key={w.title} className="group bg-white p-7 transition-colors hover:bg-seal-light sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-paper text-[1.375rem] text-brand-700 ring-1 ring-line transition-colors group-hover:bg-white" aria-hidden="true">
                <i className={w.icon || 'ri-check-line'} />
              </span>
              <h3 className="mt-6 font-serif text-[1.625rem] leading-[1.1]">{w.title}</h3>
              {w.desc && <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-800">{w.desc}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Industries ───────────────────────────────────────────────
export function Industries() {
  const ref = useReveal();
  if (!INDUSTRIES.length) return null;
  return (
    <section ref={ref} className="border-y border-line bg-paper py-20 sm:py-24">
      <div className="container-site">
        <SectionHeading align="center" eyebrow="Industries" title="Audit teams who" accent="speak your sector." />
        <ul className="reveal mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-2.5 sm:gap-3">
          {INDUSTRIES.map((ind) => (
            <li key={ind.name} className="flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-2.5 text-[0.9375rem] text-ink-900 transition-colors hover:border-ink-900 sm:px-5 sm:py-3">
              <i className={`${ind.icon || 'ri-building-line'} text-lg text-brand-600`} aria-hidden="true" />
              {ind.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Testimonials (hidden until real ones are added) ──────────
export function Testimonials() {
  const ref = useReveal();
  if (!TESTIMONIALS.length) return null;
  return (
    <section ref={ref} className="bg-white py-20 sm:py-28">
      <div className="container-site">
        <SectionHeading eyebrow="Clients" title="In their" accent="own words." />
        <ul className="reveal mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name + t.quote.slice(0, 20)} className="flex flex-col rounded-panel bg-texture p-7 sm:p-8">
              <i className="ri-double-quotes-l text-4xl text-brand-600" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 font-serif text-[1.375rem] leading-snug text-ink-900">{t.quote}</blockquote>
              <p className="mt-6 text-sm font-semibold text-ink-900">{t.name}</p>
              <p className="text-xs text-muted">{[t.role, t.city].filter(Boolean).join(' · ')}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

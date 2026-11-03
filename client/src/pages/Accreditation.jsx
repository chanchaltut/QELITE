import React from 'react';
import { Link } from 'react-router-dom';
import Seo, { breadcrumbLd } from '../lib/seo';
import { SITE } from '../data/site';
import { ACCREDITATION } from '../data/certification';
import { PageHero } from '../components/ui';
import Ph, { shown } from '../components/ui/Ph';
import { img } from '../lib/images';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function Accreditation() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Accreditation & policies', path: '/accreditation' }];
  const bodies = (ACCREDITATION.bodies || []).filter((b) => b.name && shown(b.name));
  const policies = (ACCREDITATION.policies || []).filter((p) => p.heading && p.body);

  return (
    <>
      <Seo
        title="Accreditation, Impartiality & Certification Policies"
        description={`${SITE.name} accreditation details, impartiality commitment, complaints and appeals process, suspension and withdrawal rules, and use of certificates and marks.`}
        path="/accreditation"
        jsonLd={breadcrumbLd(crumbs)}
      />
      <PageHero crumbs={crumbs} eyebrow="Accreditation & policies" title="How we stay" accent="accountable." intro={ACCREDITATION.intro} />

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site">
          <div className="flex items-baseline justify-between gap-4 border-b border-ink-900 pb-3">
            <h2 className="font-serif text-[2.25rem] leading-none text-ink-900">Accreditation</h2>
          </div>
          {bodies.length > 0 ? (
            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {bodies.map((b) => (
                <li key={b.name} className="flex gap-6 rounded-panel border border-line bg-paper p-6 sm:p-8">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-card bg-white ring-1 ring-line">
                    {shown(b.logo) && b.logo ? <img src={img(b.logo, 200)} alt={`${b.name} mark`} className="h-full w-full object-contain p-2" /> : <i className="ri-shield-star-line text-3xl text-brand-700" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif text-[1.625rem] leading-tight text-ink-900"><Ph>{b.name}</Ph></p>
                    {shown(b.code) && b.code && <p className="code mt-1 text-sm text-ink-800">No. <Ph>{b.code}</Ph></p>}
                    {shown(b.scope) && b.scope && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-800"><Ph>{b.scope}</Ph></p>}
                    {shown(b.validUntil) && b.validUntil && <p className="mt-2 text-xs text-muted">Valid until <Ph>{b.validUntil}</Ph></p>}
                    {shown(b.url) && b.url && (
                      <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-link mt-4 inline-flex items-center gap-1 text-sm">
                        Check on the accreditor’s website <i className="ri-external-link-line" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 rounded-panel border border-dashed border-ink-900/30 bg-paper p-8 text-center sm:p-12">
              <i className="ri-shield-star-line text-4xl text-brand-700" />
              <p className="mx-auto mt-4 max-w-xl font-serif text-[1.625rem] leading-snug text-ink-900">Accreditation details will be published here.</p>
              <p className="mx-auto mt-2 max-w-xl text-[0.9375rem] text-ink-800">
                For questions about QELITE’s accreditation in the meantime, write to <a href={`mailto:${SITE.email}`} className="text-link">{SITE.email}</a>.
              </p>
            </div>
          )}
        </div>
      </section>

      {policies.length > 0 && (
        <section className="border-t border-line bg-texture py-16 sm:py-24">
          <div className="container-site grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
            <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="Policies">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Policies</p>
              <ul className="mt-4 space-y-1">
                {policies.map((p) => (
                  <li key={p.heading}>
                    <a href={`#${slugify(p.heading)}`} className="block rounded-lg px-3 py-2 text-[0.9375rem] text-ink-900 hover:bg-white">{p.heading}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <ol className="space-y-5">
              {policies.map((p, i) => (
                <li key={p.heading} id={slugify(p.heading)} className="scroll-mt-28 rounded-panel bg-white p-7 sm:p-10">
                  <p className="code text-sm text-brand-700">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-2 font-serif text-[2rem] leading-tight text-ink-900">{p.heading}</h2>
                  <p className="mt-4 whitespace-pre-line text-[1.0625rem] leading-relaxed text-ink-800">{p.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="bg-white py-16 sm:py-20">
        <div className="container-site grid gap-4 md:grid-cols-2">
          <Link to="/contact?topic=complaint" className="group flex items-center justify-between gap-6 rounded-panel border border-ink-900 p-7 sm:p-9">
            <span>
              <span className="block text-sm font-semibold text-muted">Complaints &amp; appeals</span>
              <span className="mt-2 block font-serif text-[1.75rem] leading-tight text-ink-900">Raise a complaint or an appeal</span>
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink-900 text-xl transition-colors group-hover:bg-ink-900 group-hover:text-white"><i className="ri-arrow-right-line" /></span>
          </Link>
          <Link to="/verify#report" className="group flex items-center justify-between gap-6 rounded-panel bg-ink-900 p-7 text-white sm:p-9">
            <span>
              <span className="block text-sm font-semibold text-seal">Certificate misuse</span>
              <span className="mt-2 block font-serif text-[1.75rem] leading-tight text-white">Report a suspicious certificate</span>
            </span>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/40 text-xl transition-colors group-hover:bg-seal group-hover:text-ink-900"><i className="ri-arrow-right-line" /></span>
          </Link>
        </div>
      </section>
    </>
  );
}

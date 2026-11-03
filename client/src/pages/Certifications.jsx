import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo, { breadcrumbLd } from '../lib/seo';
import { SITE } from '../data/site';
import { STANDARDS, STANDARD_FAMILIES_IN_USE } from '../data/standards';
import { PageHero, useReveal } from '../components/ui';
import { CTABand } from '../components/Blocks';

export default function Certifications() {
  const ref = useReveal();
  const [params, setParams] = useSearchParams();
  // Filter is applied after the first render so the prerendered page matches
  const [family, setFamily] = useState('All');
  useEffect(() => {
    const f = params.get('family');
    setFamily(f && STANDARD_FAMILIES_IN_USE.includes(f) ? f : 'All');
  }, [params]);

  const choose = (f) => setParams(f === 'All' ? {} : { family: f }, { replace: true, preventScrollReset: true });
  const families = family === 'All' ? STANDARD_FAMILIES_IN_USE : [family];
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Certifications', path: '/certifications' }];

  return (
    <>
      <Seo
        title="Certification Programmes — ISO & Industry Standards"
        description={`${SITE.name} certifies to ${STANDARDS.slice(0, 6).map((s) => s.code.split(':')[0]).join(', ')} and more. Fixed fees for the full three-year cycle, and every certificate verifiable online.`}
        path="/certifications"
        jsonLd={[
          breadcrumbLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: STANDARDS.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: `${s.code} ${s.title}`, url: `${SITE.url}/certifications/${s.slug}` })),
          },
        ]}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow="Certification programmes"
        title="Standards we"
        accent="certify to."
        intro="Each programme follows the same evidence-based audit process: a two-stage initial audit, an independent certification decision, annual surveillance, and re-certification in year three."
        aside={
          <div className="rounded-panel border border-ink-900 bg-white p-6 sm:p-7">
            <p className="text-sm font-semibold text-ink-900">Need more than one?</p>
            <p className="mt-2 font-serif text-[1.625rem] leading-tight text-ink-900">Combine standards in one integrated audit and save audit days.</p>
            <Link to="/contact" className="btn-dark btn-sm mt-5">Ask for an integrated quote</Link>
          </div>
        }
      />

      <section ref={ref} className="bg-white py-14 sm:py-20">
        <div className="container-site">
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter by family">
            {['All', ...STANDARD_FAMILIES_IN_USE].map((f) => (
              <button key={f} role="tab" aria-selected={family === f} onClick={() => choose(f)} className={`chip shrink-0 ${family === f ? 'chip-active' : ''}`}>
                {f}
                {f !== 'All' && <span className={`text-2xs ${family === f ? 'text-white/60' : 'text-muted'}`}>{STANDARDS.filter((s) => s.family === f).length}</span>}
              </button>
            ))}
          </div>

          <div className="mt-12 space-y-16">
            {families.map((f) => (
              <div key={f}>
                <div className="flex items-baseline justify-between gap-4 border-b border-ink-900 pb-3">
                  <h2 className="font-serif text-[2rem] leading-none text-ink-900">{f}</h2>
                  <span className="label">{STANDARDS.filter((s) => s.family === f).length} programme{STANDARDS.filter((s) => s.family === f).length === 1 ? '' : 's'}</span>
                </div>
                <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {STANDARDS.filter((s) => s.family === f).map((s) => (
                    <li key={s.slug}>
                      <Link to={`/certifications/${s.slug}`} className="group flex h-full flex-col rounded-card border border-line bg-paper p-6 transition-colors hover:border-ink-900 hover:bg-white sm:p-7">
                        <div className="flex items-start justify-between gap-4">
                          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-xl text-brand-700 ring-1 ring-line transition-colors group-hover:bg-seal group-hover:text-ink-900 group-hover:ring-ink-900" aria-hidden="true">
                            <i className={s.icon || 'ri-medal-line'} />
                          </span>
                          <i className="ri-arrow-right-up-line text-xl text-ink-900/40 transition-colors group-hover:text-ink-900" aria-hidden="true" />
                        </div>
                        <p className="code mt-7 text-[1.375rem] font-medium leading-none tracking-[-0.02em] text-ink-900">{s.code}</p>
                        <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.1] group-hover:underline">{s.title}</h3>
                        <p className="mt-3 text-sm leading-relaxed text-ink-800">{s.shortDesc}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="reveal mt-16 flex flex-col items-start justify-between gap-6 rounded-panel bg-texture p-7 sm:flex-row sm:items-center sm:p-10">
            <div>
              <p className="font-serif text-[1.875rem] leading-tight text-ink-900">Don’t see your standard?</p>
              <p className="mt-1 text-[0.9375rem] text-ink-800">Tell us what your customer or tender asks for and we’ll confirm whether we can certify it.</p>
            </div>
            <Link to="/contact" className="btn-dark shrink-0">Ask us</Link>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}

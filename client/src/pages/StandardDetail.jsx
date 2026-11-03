import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo, { breadcrumbLd, faqLd } from '../lib/seo';
import { SITE } from '../data/site';
import { STANDARDS, standardBySlug } from '../data/standards';
import { JOURNEY } from '../data/content';
import { Breadcrumbs, CheckList, Accordion, useReveal } from '../components/ui';
import Guilloche from '../components/ui/Guilloche';
import { CTABand } from '../components/Blocks';
import NotFound from './NotFound';

function Block({ title, accent, children, id }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-10">
      <h2 className="h-display text-[2rem] leading-[1.05] sm:text-[2.5rem]">
        {title} {accent && <em className="italic text-brand-700">{accent}</em>}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function StandardDetail() {
  const { slug } = useParams();
  const ref = useReveal();
  const s = standardBySlug(slug);
  if (!s) return <NotFound />;

  const path = `/certifications/${s.slug}`;
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Certifications', path: '/certifications' }, { name: s.code, path }];
  const related = STANDARDS.filter((o) => o.slug !== s.slug && o.family === s.family)
    .concat(STANDARDS.filter((o) => o.slug !== s.slug && o.family !== s.family && o.featured))
    .slice(0, 3);
  const faqs = (s.faqs || []).filter((f) => f.q && f.a);

  return (
    <>
      <Seo
        title={`${s.code} Certification — ${s.title}`}
        description={`${s.code} ${s.title} certification by ${SITE.name}. ${s.shortDesc}`}
        path={path}
        jsonLd={[
          breadcrumbLd(crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: `${s.code} certification`,
            serviceType: `${s.title} certification`,
            description: s.overview,
            provider: { '@id': `${SITE.url}/#organization` },
            url: `${SITE.url}${path}`,
          },
          faqs.length ? faqLd(faqs) : null,
        ]}
      />

      <section className="on-dark relative isolate overflow-hidden bg-ink-grain text-white">
        <div className="pointer-events-none absolute -right-48 -top-48 -z-10 h-[52rem] w-[52rem] text-seal/[0.1]">
          <Guilloche className="h-full w-full" />
        </div>
        <div className="container-site pb-16 pt-6 sm:pb-24 sm:pt-8">
          <Breadcrumbs items={crumbs} light />
          <div className="mt-12 max-w-4xl sm:mt-16">
            <p className="eyebrow eyebrow-light">{s.family}</p>
            <h1 className="mt-6">
              <span className="code block text-[2.75rem] font-medium leading-none tracking-[-0.03em] text-seal sm:text-[4.5rem] lg:text-[5.5rem]">{s.code}</span>
              <span className="h-display mt-4 block text-[2.5rem] leading-[1] !text-white sm:text-[3.5rem] lg:text-[4.25rem]">{s.title} <em className="italic text-white/70">certification</em></span>
            </h1>
            <p className="mt-7 max-w-2xl text-[1.0625rem] leading-relaxed text-white/80 sm:text-xl">{s.shortDesc}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to={`/contact?standard=${encodeURIComponent(s.code)}`} className="btn-primary !px-8 !py-4 !text-base">Get a quote for {s.code.split(':')[0]}</Link>
              <a href="#audit" className="btn-outline-light !px-8 !py-4 !text-base">What the audit covers</a>
            </div>
          </div>
        </div>
      </section>

      <section ref={ref} className="bg-white py-16 sm:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-[1fr_340px] lg:gap-16">
          <div className="min-w-0 space-y-14">
            <div>
              <p className="eyebrow">Overview</p>
              <p className="mt-5 font-serif text-[1.625rem] leading-[1.35] text-ink-900 sm:text-[1.875rem]">{s.overview}</p>
            </div>

            {(s.whoFor?.length > 0 || s.benefits?.length > 0) && (
              <div className="grid gap-10 border-t border-line pt-10 sm:grid-cols-2">
                {s.whoFor?.length > 0 && (
                  <div>
                    <h2 className="font-serif text-[1.875rem] leading-tight">Who it’s <em className="italic text-brand-700">for</em></h2>
                    <CheckList items={s.whoFor} className="mt-5" />
                  </div>
                )}
                {s.benefits?.length > 0 && (
                  <div>
                    <h2 className="font-serif text-[1.875rem] leading-tight">What it <em className="italic text-brand-700">gives you</em></h2>
                    <CheckList items={s.benefits} className="mt-5" />
                  </div>
                )}
              </div>
            )}

            {s.focus?.length > 0 && (
              <Block id="audit" title="What the audit" accent="looks at.">
                <ol className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                  {s.focus.map((f, i) => (
                    <li key={f} className="flex gap-4 bg-white p-5">
                      <span className="code shrink-0 text-sm font-medium text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[0.9375rem] leading-relaxed text-ink-900">{f}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {JOURNEY.length > 0 && (
              <Block title="Your certification" accent="cycle.">
                <ol className="relative space-y-0 border-l border-ink-900/20 pl-8">
                  {JOURNEY.map((j) => (
                    <li key={j.title} className="relative pb-7 last:pb-0">
                      <span className="absolute -left-[2.3rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-600 ring-1 ring-brand-600" aria-hidden="true" />
                      {j.when && <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{j.when}</p>}
                      <p className="mt-0.5 text-[1.0625rem] font-semibold text-ink-900">{j.title}</p>
                      {j.desc && <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-800">{j.desc}</p>}
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {faqs.length > 0 && (
              <Block title={`${s.code.split(':')[0]}`} accent="questions.">
                <Accordion items={faqs} />
              </Block>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="on-dark rounded-panel bg-ink-900 p-7 text-white">
              <p className="text-sm font-semibold text-seal">Fixed-fee quote</p>
              <p className="mt-3 font-serif text-[1.75rem] leading-[1.1] text-white">One price for the full three-year cycle.</p>
              <p className="mt-3 text-sm leading-relaxed text-white/70">Tell us your headcount, sites and scope. We’ll confirm audit days and fees in writing.</p>
              <Link to={`/contact?standard=${encodeURIComponent(s.code)}`} className="btn-primary mt-6 w-full">Request a quote</Link>
            </div>
            <Link to="/verify" className="group flex items-center gap-4 rounded-panel border border-line bg-paper p-5 transition-colors hover:border-ink-900">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-xl text-brand-700 ring-1 ring-line"><i className="ri-shield-check-line" /></span>
              <span>
                <span className="block text-[0.9375rem] font-semibold text-ink-900 group-hover:underline">Verify a certificate</span>
                <span className="block text-xs text-muted">Check any {s.code.split(':')[0]} certificate we’ve issued</span>
              </span>
            </Link>
            {related.length > 0 && (
              <div className="rounded-panel border border-line p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Often combined with</p>
                <ul className="mt-3 divide-y divide-line">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link to={`/certifications/${r.slug}`} className="group flex items-center justify-between gap-3 py-3">
                        <span className="min-w-0">
                          <span className="code block text-sm font-medium text-ink-900 group-hover:underline">{r.code}</span>
                          <span className="block truncate text-xs text-muted">{r.title}</span>
                        </span>
                        <i className="ri-arrow-right-line text-ink-900/50 group-hover:text-ink-900" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      <CTABand title={`Ready for ${s.code.split(':')[0]}`} accent="certification?" />
    </>
  );
}

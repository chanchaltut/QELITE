import React from 'react';
import { Link } from 'react-router-dom';
import Seo, { breadcrumbLd } from '../lib/seo';
import { SITE } from '../data/site';
import { ABOUT, LEADERSHIP, WHY_US } from '../data/content';
import { PageHero, SectionHeading, useReveal } from '../components/ui';
import Guilloche from '../components/ui/Guilloche';
import { CTABand } from '../components/Blocks';
import { img } from '../lib/images';

export default function About() {
  const ref = useReveal();
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }];
  const story = (ABOUT.story || []).filter(Boolean);

  return (
    <>
      <Seo
        title="About QELITE — Management System Certification"
        description={`${SITE.legalName}: impartial, competent audits and certificates anyone can verify. Learn how we work and what we stand for.`}
        path="/about"
        jsonLd={breadcrumbLd(crumbs)}
      />
      <PageHero crumbs={crumbs} eyebrow="About QELITE" title={ABOUT.heading} />

      <section ref={ref} className="bg-white py-16 sm:py-24">
        <div className="container-site grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="prose-article max-w-2xl">
            {story.map((p, i) => (
              <p key={i} className={i === 0 ? 'font-serif !text-[1.75rem] !leading-[1.35] text-ink-900' : ''}>{p}</p>
            ))}
          </div>
          {ABOUT.mission && (
            <div className="reveal lg:pt-2">
              <div className="on-dark relative isolate overflow-hidden rounded-panel bg-ink-grain p-8 text-white sm:p-10">
                <div className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-[24rem] w-[24rem] text-seal/[0.14]">
                  <Guilloche className="h-full w-full" />
                </div>
                <p className="text-sm font-semibold text-seal">Our mission</p>
                <p className="mt-5 font-serif text-[2rem] leading-[1.15] text-white">{ABOUT.mission}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {ABOUT.values?.length > 0 && (
        <section className="border-y border-line bg-texture py-20 sm:py-24">
          <div className="container-site">
            <SectionHeading eyebrow="What we stand for" title="Four principles," accent="no exceptions." />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ABOUT.values.map((v) => (
                <li key={v.title} className="rounded-panel bg-white p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-seal-light text-[1.375rem] text-brand-700" aria-hidden="true"><i className={v.icon || 'ri-check-line'} /></span>
                  <h3 className="mt-6 font-serif text-[1.75rem] leading-tight">{v.title}</h3>
                  {v.desc && <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-800">{v.desc}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {LEADERSHIP.length > 0 && (
        <section className="bg-white py-20 sm:py-24">
          <div className="container-site">
            <SectionHeading eyebrow="Leadership" title="The people" accent="behind the decisions." />
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {LEADERSHIP.map((p) => (
                <li key={p.name}>
                  <div className="media aspect-[4/5]">
                    {p.image ? <img src={img(p.image, 700)} alt={p.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-5xl text-ink-900/20"><i className="ri-user-3-line" /></div>}
                  </div>
                  <p className="mt-5 font-serif text-[1.75rem] leading-tight text-ink-900">{p.name}</p>
                  {p.role && <p className="text-sm font-medium text-brand-700">{p.role}</p>}
                  {p.bio && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-800">{p.bio}</p>}
                  {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="text-link mt-3 inline-flex items-center gap-1 text-sm"><i className="ri-linkedin-box-fill" /> LinkedIn</a>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {WHY_US.length > 0 && (
        <section className="bg-white py-20 sm:py-24">
          <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHeading eyebrow="How we work" title="What you can" accent="count on." />
            <ul className="divide-y divide-line border-y border-line">
              {WHY_US.map((w) => (
                <li key={w.title} className="flex gap-5 py-6">
                  <i className={`${w.icon || 'ri-check-line'} mt-1 text-2xl text-brand-600`} aria-hidden="true" />
                  <div>
                    <p className="text-[1.0625rem] font-semibold text-ink-900">{w.title}</p>
                    {w.desc && <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-800">{w.desc}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="container-site mt-12">
            <Link to="/accreditation" className="text-link text-[0.9375rem]">Read our accreditation and certification policies</Link>
          </div>
        </section>
      )}

      <CTABand />
    </>
  );
}

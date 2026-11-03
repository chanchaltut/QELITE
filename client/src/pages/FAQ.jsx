import React from 'react';
import { Link } from 'react-router-dom';
import Seo, { breadcrumbLd, faqLd } from '../lib/seo';
import { SITE } from '../data/site';
import { GENERAL_FAQS, VERIFICATION_FAQS } from '../data/content';
import { STANDARDS } from '../data/standards';
import { PageHero, Accordion } from '../components/ui';

export default function FAQ() {
  const crumbs = [{ name: 'Home', path: '/' }, { name: 'FAQs', path: '/faqs' }];
  const groups = [
    { id: 'general', title: 'Certification', items: GENERAL_FAQS },
    { id: 'verification', title: 'Verification', items: VERIFICATION_FAQS },
    ...STANDARDS.filter((s) => s.faqs?.length).map((s) => ({ id: s.slug, title: s.code, items: s.faqs.filter((f) => f.q && f.a) })),
  ].filter((g) => g.items.length);

  return (
    <>
      <Seo
        title="Frequently Asked Questions — Certification & Verification"
        description={`Answers about ISO certification with ${SITE.name}: process, timelines, fees, validity, transfers and how to verify a certificate.`}
        path="/faqs"
        jsonLd={[breadcrumbLd(crumbs), faqLd(groups.flatMap((g) => g.items))]}
      />
      <PageHero crumbs={crumbs} eyebrow="FAQs" title="Questions," accent="answered." intro="Straight answers on certification, audits, fees and the certificate register." />

      <section className="bg-white py-16 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-20">
          <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="FAQ topics">
            <ul className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:px-0">
              {groups.map((g) => (
                <li key={g.id} className="shrink-0">
                  <a href={`#${g.id}`} className="chip lg:flex lg:w-full lg:justify-between lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-3 lg:py-2 lg:text-[0.9375rem] lg:hover:bg-paper">
                    <span className={g.id === g.title.toLowerCase() ? '' : 'code'}>{g.title}</span>
                    <span className="hidden text-xs text-muted lg:inline">{g.items.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-16">
            {groups.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-28">
                <h2 className="mb-6 font-serif text-[2.25rem] leading-none text-ink-900">{g.title}</h2>
                <Accordion items={g.items} defaultOpen={-1} />
              </div>
            ))}
            <div className="rounded-panel bg-texture p-8 sm:p-10">
              <p className="font-serif text-[1.875rem] leading-tight text-ink-900">Still have a question?</p>
              <p className="mt-2 text-ink-800">Write to us and a certification coordinator will reply within one working day.</p>
              <Link to="/contact" className="btn-dark mt-6">Contact us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

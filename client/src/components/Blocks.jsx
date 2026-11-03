import React from 'react';
import { Link } from 'react-router-dom';
import { SITE, hasPhone } from '../data/site';
import { GENERAL_FAQS } from '../data/content';
import { SectionHeading, Accordion } from './ui';
import Guilloche from './ui/Guilloche';

export function FAQBlock({ items = GENERAL_FAQS, eyebrow = 'FAQ', title = 'Questions,', accent = 'answered.', intro, link = '/faqs' }) {
  if (!items.length) return null;
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            accent={accent}
            intro={intro || 'Can’t find what you’re looking for? Write to us and a certification coordinator will reply within one working day.'}
          />
          <div className="mt-9 flex flex-wrap items-center gap-6">
            <Link to="/contact" className="btn-outline">Ask a question</Link>
            {link && <Link to={link} className="text-link text-[0.9375rem]">View all FAQs</Link>}
          </div>
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}

export function CTABand({
  title = 'Ready to be',
  accent = 'certified properly?',
  text = 'Tell us the standard, your sites and your headcount. You’ll get a fixed quote for the full three-year cycle, usually within one working day.',
}) {
  return (
    <section className="relative isolate overflow-hidden bg-seal">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 text-ink-900/[0.07]">
        <Guilloche className="h-full w-full" />
      </div>
      <div className="container-site py-20 text-center sm:py-28">
        <h2 className="h-display mx-auto max-w-4xl text-[2.75rem] leading-[0.98] sm:text-[4.25rem] lg:text-[5.25rem]">
          {title} <em className="italic">{accent}</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-900 sm:text-lg">{text}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/contact" className="btn-dark !px-7 !py-3.5">Request a quote <i className="ri-arrow-right-line" /></Link>
          <Link to="/verify" className="btn-light !px-7 !py-3.5"><i className="ri-shield-check-line" /> Verify a certificate</Link>
          {hasPhone() && <a href={`tel:${SITE.phone.tel}`} className="btn-light !px-7 !py-3.5"><i className="ri-phone-line" /> {SITE.phone.display}</a>}
        </div>
      </div>
    </section>
  );
}

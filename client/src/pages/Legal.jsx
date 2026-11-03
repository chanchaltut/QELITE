import React from 'react';
import Seo from '../lib/seo';
import { SITE, fullAddress } from '../data/site';
import { LEGAL_UPDATED, PRIVACY, TERMS } from '../data/legal';
import { PageHero } from '../components/ui';

function LegalPage({ title, path, sections, description }) {
  const address = fullAddress();
  return (
    <>
      <Seo title={title} description={description} path={path} noindex />
      <PageHero crumbs={[{ name: 'Home', path: '/' }, { name: title, path }]} eyebrow={`Last updated ${LEGAL_UPDATED}`} title={title} />
      <section className="bg-white py-14 sm:py-20">
        <div className="container-site max-w-3xl">
          <ol className="space-y-10">
            {sections.map(({ heading: h, body }, i) => (
              <li key={`${i}-${h}`}>
                <h2 className="font-serif text-[1.875rem] leading-tight text-ink-900"><span className="mr-2 italic text-brand-700">{i + 1}.</span>{h}</h2>
                <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink-800">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 rounded-card bg-paper p-7 text-sm leading-relaxed text-ink-800">
            <p className="font-semibold text-ink-900">{SITE.legalName}</p>
            {address && <p>{address}</p>}
            <p>{SITE.email}</p>
          </div>
        </div>
      </section>
    </>
  );
}

export const PrivacyPolicy = () => (
  <LegalPage title="Privacy Policy" path="/privacy-policy" sections={PRIVACY} description={`How ${SITE.name} collects, uses and protects personal information, including the certificate register.`} />
);

export const TermsConditions = () => (
  <LegalPage title="Terms of Use" path="/terms-conditions" sections={TERMS} description={`Terms governing the use of the ${SITE.name} website and certificate register.`} />
);

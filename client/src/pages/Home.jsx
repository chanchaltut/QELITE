import React from 'react';
import Seo, { faqLd } from '../lib/seo';
import { SITE } from '../data/site';
import { GENERAL_FAQS, HOME_SECTIONS } from '../data/content';
import SafeSection from '../components/SafeSection';
import Hero from '../components/home/Hero';
import { StandardsStrip, Programmes, Verification, Journey, WhyUs, Industries, Testimonials } from '../components/home/Sections';
import { FAQBlock, CTABand } from '../components/Blocks';

// Order of the home page; each can be switched off in admin → "Home page"
const SECTIONS = [
  ['standardsStrip', StandardsStrip],
  ['standards', Programmes],
  ['verification', Verification],
  ['journey', Journey],
  ['whyUs', WhyUs],
  ['industries', Industries],
  ['testimonials', Testimonials],
  ['faq', FAQBlock],
  ['cta', CTABand],
];

export default function Home() {
  return (
    <>
      <Seo
        title="ISO Certification & Online Certificate Verification"
        description={`${SITE.name} certifies management systems to ISO 9001, ISO 14001, ISO 45001, ISO 13485, ISO 22000, ISO/IEC 27001 and more. Verify any QELITE certificate online in seconds.`}
        path="/"
        jsonLd={faqLd(GENERAL_FAQS)}
      />
      <SafeSection>
        <Hero />
      </SafeSection>
      {SECTIONS.map((entry) => {
        const [key, Section] = entry;
        if (HOME_SECTIONS[key] === false) return null;
        return (
          <SafeSection key={key}>
            <Section />
          </SafeSection>
        );
      })}
    </>
  );
}

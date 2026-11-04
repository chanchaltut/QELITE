import React from 'react';
import { Link } from 'react-router-dom';
import { SITE, fullAddress, filled, hasPhone, hasWhatsapp, waLink } from '../../data/site';
import { STANDARDS, FEATURED_STANDARDS } from '../../data/standards';
import Logo from '../ui/Logo';
import Guilloche from '../ui/Guilloche';
import VerifyForm from '../certificate/VerifyForm';
import { useNow } from '../../lib/clock';

const SOCIALS = [
  { key: 'linkedin', icon: 'ri-linkedin-fill', label: 'LinkedIn' },
  { key: 'x', icon: 'ri-twitter-x-line', label: 'X' },
  { key: 'facebook', icon: 'ri-facebook-fill', label: 'Facebook' },
  { key: 'instagram', icon: 'ri-instagram-line', label: 'Instagram' },
  { key: 'youtube', icon: 'ri-youtube-line', label: 'YouTube' },
];

function Col({ title, children }) {
  return (
    <div>
      <h3 className="text-2xs font-semibold uppercase tracking-[0.16em] text-white/50">{title}</h3>
      <ul className="mt-5 space-y-3 text-[0.9375rem]">{children}</ul>
    </div>
  );
}

const FLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-white/80 underline-offset-[3px] transition-colors hover:text-white hover:underline">{children}</Link>
  </li>
);

export default function Footer() {
  const now = useNow();
  const list = (FEATURED_STANDARDS.length ? FEATURED_STANDARDS : STANDARDS).slice(0, 7);
  const a = SITE.address || {};
  return (
    <footer className="on-dark relative isolate overflow-hidden bg-ink-950 text-white">
      <Guilloche className="pointer-events-none absolute -left-60 top-10 -z-10 h-[40rem] w-[40rem] text-white/[0.04]" />

      {/* Verification band */}
      <div className="border-b border-white/10">
        <div className="container-site grid gap-8 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow eyebrow-light">Certificate register</p>
            <p className="mt-4 font-serif text-[2.25rem] leading-[1.02] text-white sm:text-[2.875rem]">
              Received a QELITE certificate? <em className="italic text-seal">Check it before you rely on it.</em>
            </p>
          </div>
          <VerifyForm variant="dark" />
        </div>
      </div>

      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-12 py-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 lg:col-span-1">
          <Logo tone="light" />
          <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-white/70">{SITE.description}</p>
          <ul className="mt-6 space-y-3 text-[0.9375rem] text-white/80">
            {filled(a.street) && (
              <li className="flex gap-3">
                <i className="ri-map-pin-line mt-0.5 text-seal" />
                {filled(a.mapUrl) ? (
                  <a href={a.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">{fullAddress()}</a>
                ) : (
                  <span>{fullAddress()}</span>
                )}
              </li>
            )}
            {hasPhone() && (
              <li className="flex gap-3">
                <i className="ri-phone-line mt-0.5 text-seal" />
                <a href={`tel:${SITE.phone.tel}`} className="hover:text-white hover:underline">{SITE.phone.display}</a>
              </li>
            )}
            {hasWhatsapp() && (
              <li className="flex gap-3">
                <i className="ri-whatsapp-line mt-0.5 text-seal" />
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">{filled(SITE.whatsappDisplay) ? SITE.whatsappDisplay : 'WhatsApp'}</a>
              </li>
            )}
            <li className="flex gap-3">
              <i className="ri-mail-line mt-0.5 text-seal" />
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-white hover:underline">{SITE.email}</a>
            </li>
            {filled(SITE.hours) && (
              <li className="flex gap-3">
                <i className="ri-time-line mt-0.5 text-seal" />
                <span>{SITE.hours}</span>
              </li>
            )}
          </ul>
          <div className="mt-7 flex gap-2">
            {SOCIALS.filter((s) => filled(SITE.social?.[s.key]) && SITE.social[s.key] !== '#').map((s) => (
              <a
                key={s.key}
                href={SITE.social[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-seal hover:bg-seal hover:text-ink-900"
              >
                <i className={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <Col title="Certifications">
          {list.map((s) => (
            <FLink key={s.slug} to={`/certifications/${s.slug}`}>{s.code}</FLink>
          ))}
          <FLink to="/certifications">All standards</FLink>
        </Col>

        <Col title="Verification">
          <FLink to="/verify">Verify a certificate</FLink>
          <FLink to="/verify#statuses">What each status means</FLink>
          <FLink to="/verify#report">Report a suspicious certificate</FLink>
          <FLink to="/faqs#verification">Verification FAQs</FLink>
        </Col>

        <Col title="Company">
          <FLink to="/about">About QELITE</FLink>
          <FLink to="/accreditation">Accreditation &amp; policies</FLink>
          <FLink to="/faqs">FAQs</FLink>
          <FLink to="/contact">Contact &amp; quotes</FLink>
          <FLink to="/privacy-policy">Privacy policy</FLink>
          <FLink to="/terms-conditions">Terms of use</FLink>
        </Col>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site space-y-4 py-7 text-xs text-white/60">
          {SITE.footerDisclaimer && <p className="max-w-4xl leading-relaxed">{SITE.footerDisclaimer}</p>}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date(now).getFullYear()} {SITE.legalName}. All rights reserved.</p>
            <p>
              <a href="/admin" rel="nofollow" className="underline underline-offset-2 hover:text-white">
                Team login
              </a>
              <span className="mx-2">·</span>
              Designed &amp; developed by{' '}
              <a href="https://codehyphen.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline underline-offset-2 hover:text-seal">
                Code Hyphen
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden">
        <img src="/qeliteLogo.svg" alt="" className="mask-fade-b mx-auto -mb-[6%] w-[92%] max-w-[1200px] opacity-[0.05]" />
      </div>
    </footer>
  );
}

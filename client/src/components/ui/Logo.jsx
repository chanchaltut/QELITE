import React, { useState } from 'react';
import { SITE } from '../../data/site';
import { img } from '../../lib/images';

/**
 * QELITE seal mark: a perforated seal ring around a "Q" whose tail is a check mark.
 * Interim artwork until the custom logo arrives (upload it in admin → Site settings → Logo).
 */
export function LogoMark({ className = 'h-10 w-10', tone = 'dark' }) {
  const light = tone === 'light';
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="23" fill={light ? '#FFFFFF' : '#0B1A2E'} />
      <circle cx="24" cy="24" r="19.25" fill="none" stroke="#9DE5C8" strokeWidth="0.9" strokeDasharray="1.1 1.9" opacity="0.85" />
      <circle cx="22.6" cy="22.6" r="9.2" fill="none" stroke={light ? '#0B1A2E' : '#FFFFFF'} strokeWidth="3.1" />
      <path d="M25.9 27.4 L29.4 31 L36.2 22.6" fill="none" stroke="#9DE5C8" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Wordmark: QELITE in wide caps with a small descriptor. */
function Wordmark({ light, compact }) {
  return (
    <span className="flex flex-col leading-none">
      <span className={`font-sans text-[1.3rem] font-semibold tracking-[0.2em] ${light ? 'text-white' : 'text-ink-900'}`}>QELITE</span>
      {!compact && (
        <span className={`mt-1 font-sans text-[0.5625rem] font-medium uppercase tracking-[0.34em] ${light ? 'text-white/60' : 'text-ink-700'}`}>
          Certification
        </span>
      )}
    </span>
  );
}

/**
 * Brand logo: the logo uploaded in the admin panel (SITE.logo), else the built-in mark + wordmark.
 * If an uploaded image can't load, the built-in logo is shown instead.
 */
export default function Logo({ tone = 'dark', compact = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const light = tone === 'light';

  if (SITE.logo && !failed) {
    return (
      <img
        src={img(SITE.logo, 600)}
        alt={SITE.name}
        height="48"
        className={`w-auto ${compact ? 'h-8' : 'h-9 sm:h-10'} ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label={SITE.name}>
      <LogoMark className={compact ? 'h-9 w-9' : 'h-10 w-10'} tone={light ? 'light' : 'dark'} />
      <Wordmark light={light} compact={compact} />
    </span>
  );
}

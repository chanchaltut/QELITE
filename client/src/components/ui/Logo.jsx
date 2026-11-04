import React, { useState } from 'react';
import { SITE } from '../../data/site';
import { img } from '../../lib/images';

// Brand artwork in /public. The white versions are for dark backgrounds,
// the navy versions for light ones.
const LOGO = { light: '/qeliteLogo.svg', dark: '/qeliteLogoNavy.svg' };
const MARK = { light: '/qeliteMark.svg', dark: '/qeliteMarkNavy.svg' };
const LOGO_RATIO = 1588 / 415;

/** The QELITE "Q" mark on its own. tone="light" is for dark backgrounds. */
export function LogoMark({ className = 'h-10 w-10', tone = 'dark' }) {
  return <img src={MARK[tone] || MARK.dark} alt="" aria-hidden="true" className={`object-contain ${className}`} />;
}

/**
 * Full logo: the logo uploaded in the admin panel (SITE.logo), else the QELITE logo.
 * If an uploaded image can't load, the QELITE logo is shown instead.
 */
export default function Logo({ tone = 'dark', compact = false, className = '' }) {
  const [failed, setFailed] = useState(false);
  const size = compact ? 'h-9' : 'h-10 sm:h-11';

  if (SITE.logo && !failed) {
    return (
      <img
        src={img(SITE.logo, 600)}
        alt={SITE.name}
        height="48"
        className={`w-auto ${size} ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <img
      src={LOGO[tone] || LOGO.dark}
      alt={SITE.name}
      width={Math.round(44 * LOGO_RATIO)}
      height="44"
      className={`w-auto ${size} ${className}`}
    />
  );
}

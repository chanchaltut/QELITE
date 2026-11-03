import React, { useEffect, useState } from 'react';
import { SITE, hasPhone, hasWhatsapp, waLink } from '../../data/site';

// Back-to-top, call and WhatsApp. Call and WhatsApp appear only once their numbers are filled in.
export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 600);
      setScrolled(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`no-print fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2.5 transition-all duration-300 sm:bottom-6 sm:right-6 ${
        scrolled ? '' : 'max-sm:pointer-events-none max-sm:translate-y-6 max-sm:opacity-0'
      }`}
    >
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`grid h-11 w-11 place-items-center rounded-full border border-ink-900 bg-white text-ink-900 transition-all hover:bg-seal ${
          showTop ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
        aria-label="Back to top"
      >
        <i className="ri-arrow-up-line" />
      </button>
      {hasPhone() && (
        <a
          href={`tel:${SITE.phone.tel}`}
          className="grid h-11 w-11 place-items-center rounded-full bg-seal text-ink-900 shadow-lift ring-1 ring-ink-900 transition-colors hover:bg-seal-deep sm:h-12 sm:w-12"
          aria-label={`Call ${SITE.phone.display}`}
        >
          <i className="ri-phone-fill text-lg" />
        </a>
      )}
      {hasWhatsapp() && (
        <a
          href={waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-12 w-12 place-items-center rounded-full bg-whatsapp text-white shadow-lift transition-[filter] hover:brightness-95 sm:h-[52px] sm:w-[52px]"
          aria-label="Chat on WhatsApp"
        >
          <i className="ri-whatsapp-line text-2xl" />
        </a>
      )}
    </div>
  );
}

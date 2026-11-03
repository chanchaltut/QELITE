import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { pageOverride } from '../../data/pages';
import Guilloche from './Guilloche';

// ─── Scroll reveal ────────────────────────────────────────────
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const els = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  return ref;
}

// ─── Section heading ──────────────────────────────────────────
export function SectionHeading({ eyebrow, title, accent, intro, align = 'left', light = false, className = '' }) {
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && <p className={`eyebrow ${light ? 'eyebrow-light' : ''}`}>{eyebrow}</p>}
      <h2 className={`h-display mt-5 text-[2.5rem] leading-[1] sm:text-[3.25rem] lg:text-[4rem] ${light ? '!text-white' : ''}`}>
        {title}{accent && <> <em className={`italic ${light ? 'text-seal' : 'text-brand-700'}`}>{accent}</em></>}
      </h2>
      {intro && <p className={`mt-6 text-[1.0625rem] leading-relaxed sm:text-lg ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'} ${light ? 'text-white/75' : 'text-ink-800'}`}>{intro}</p>}
    </div>
  );
}

// ─── Inner page hero ──────────────────────────────────────────
// Full-bleed block. tone: 'porcelain' (textured, default) or 'dark' (navy).
export function PageHero({ crumbs = [], children, aside, tone = 'porcelain', ...text }) {
  // Admin → "Pages & SEO" can replace the heading block; blank fields keep the page's own text
  const page = pageOverride(crumbs[crumbs.length - 1]?.path);
  const eyebrow = page?.eyebrow || text.eyebrow;
  const title = page?.heading || text.title;
  const accent = page?.heading ? page.accent : text.accent;
  const intro = page?.intro || text.intro;
  const dark = tone === 'dark';
  return (
    <section className={`relative isolate overflow-hidden ${dark ? 'on-dark bg-ink-grain text-white' : 'bg-texture'}`}>
      <Guilloche
        className={`pointer-events-none absolute -right-40 -top-40 -z-10 h-[46rem] w-[46rem] ${dark ? 'text-seal/[0.12]' : 'text-ink-900/[0.07]'}`}
      />
      <div className="container-site relative pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-24">
        {crumbs.length > 0 && <Breadcrumbs items={crumbs} light={dark} />}
        <div className={`mt-10 grid gap-10 sm:mt-14 ${aside ? 'lg:grid-cols-[1fr_400px] lg:items-end lg:gap-16' : ''}`}>
          <div className="max-w-4xl">
            {eyebrow && <p className={`eyebrow ${dark ? 'eyebrow-light' : ''}`}>{eyebrow}</p>}
            <h1 className={`h-display mt-5 text-[3rem] leading-[0.98] sm:text-[4.25rem] lg:text-[5.25rem] ${dark ? '!text-white' : ''}`}>
              {title}{accent && <> <em className={`italic ${dark ? 'text-seal' : 'text-brand-700'}`}>{accent}</em></>}
            </h1>
            {intro && <p className={`mt-6 max-w-2xl text-[1.0625rem] leading-relaxed sm:text-xl ${dark ? 'text-white/80' : 'text-ink-800'}`}>{intro}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

export function Breadcrumbs({ items, light = false }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-1.5 text-[0.8125rem] ${light ? 'text-white/70' : 'text-ink-800'}`}>
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1.5">
            {i > 0 && <span className={light ? 'text-white/35' : 'text-ink-900/35'} aria-hidden="true">/</span>}
            {i < items.length - 1 ? (
              <Link to={it.path} className={`underline underline-offset-[3px] ${light ? 'decoration-white/30 hover:decoration-white' : 'decoration-ink-900/30 hover:decoration-ink-900'}`}>{it.name}</Link>
            ) : (
              <span className={`font-medium ${light ? 'text-white' : 'text-ink-900'}`} aria-current="page">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Accordion list (FAQs) ────────────────────────────────────
export function Accordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-ink-900">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className="border-b border-ink-900/15">
            <button
              type="button"
              className="group flex w-full items-start justify-between gap-6 py-6 text-left"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
            >
              <span className="font-serif text-[1.375rem] leading-snug tracking-[-0.01em] text-ink-900 sm:text-[1.625rem]">{it.q}</span>
              <span
                className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-900 text-lg transition-colors ${isOpen ? 'bg-ink-900 text-white' : 'text-ink-900 group-hover:bg-seal'}`}
                aria-hidden="true"
              >
                <i className={isOpen ? 'ri-subtract-line' : 'ri-add-line'} />
              </span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] pb-6' : 'grid-rows-[0fr]'}`}>
              <p className="overflow-hidden text-[1.0625rem] leading-relaxed text-ink-800 sm:pr-16">{it.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Check list ───────────────────────────────────────────────
export function CheckList({ items, light = false, className = '' }) {
  return (
    <ul className={`space-y-3 ${className}`}>
      {items.map((t) => (
        <li key={t} className={`flex gap-3 text-[0.9375rem] leading-relaxed ${light ? 'text-white/85' : 'text-ink-800'}`}>
          <span className={`mt-[0.2rem] grid h-[1.125rem] w-[1.125rem] shrink-0 place-items-center rounded-full ${light ? 'bg-seal text-ink-900' : 'bg-brand-600 text-white'}`} aria-hidden="true">
            <i className="ri-check-line text-[0.75rem]" />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

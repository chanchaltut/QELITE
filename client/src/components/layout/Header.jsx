import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE, NAV, hasPhone, hasWhatsapp, waLink } from '../../data/site';
import { STANDARDS, STANDARD_FAMILIES_IN_USE } from '../../data/standards';
import Logo from '../ui/Logo';
import SearchDialog from './SearchDialog';
import VerifyForm from '../certificate/VerifyForm';
import { useNow } from '../../lib/clock';

// ─── Announcement bar (admin → Site settings) ────────────────
const inWindow = ({ startsAt, endsAt }, now) => {
  const d = new Date(now);
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return (!startsAt || startsAt.slice(0, 10) <= today) && (!endsAt || endsAt.slice(0, 10) >= today);
};

function AnnouncementBar() {
  const a = SITE.announcement;
  const now = useNow();
  if (!a?.enabled || !a.text || !inWindow(a, now)) return null;
  const external = /^https?:\/\//.test(a.href || '');
  const linkClass = 'ml-2 font-semibold underline underline-offset-2 hover:no-underline';
  return (
    <div className="no-print bg-seal text-ink-900">
      <p className="container-site py-2 text-center text-[0.8125rem] font-medium">
        <i className="ri-megaphone-line mr-2" aria-hidden="true" />
        {a.text}
        {a.href && a.linkLabel && (external ? (
          <a href={a.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{a.linkLabel}</a>
        ) : (
          <Link to={a.href} className={linkClass}>{a.linkLabel}</Link>
        ))}
      </p>
    </div>
  );
}

// ─── Utility bar ──────────────────────────────────────────────
function TopBar() {
  return (
    <div className="no-print on-dark bg-ink-950 text-white">
      <div className="container-site flex h-10 items-center justify-between gap-4 text-[0.8125rem]">
        <p className="flex min-w-0 items-center gap-2 text-white/75">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-seal opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-seal" />
          </span>
          <span className="truncate">
            <span className="hidden sm:inline">Online certificate register — </span>
            <Link to="/verify" className="font-medium text-white underline decoration-white/30 underline-offset-[3px] hover:decoration-seal">verify any QELITE certificate</Link>
          </span>
        </p>
        <div className="hidden shrink-0 items-center gap-5 text-white/75 md:flex">
          {hasPhone() && (
            <a href={`tel:${SITE.phone.tel}`} className="flex items-center gap-1.5 hover:text-white hover:underline">
              <i className="ri-phone-line" /> {SITE.phone.display}
            </a>
          )}
          <a href={`mailto:${SITE.email}`} className="flex items-center gap-1.5 hover:text-white hover:underline">
            <i className="ri-mail-line" /> {SITE.email}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Mega-menu: certifications ────────────────────────────────
function CertificationsPanel() {
  return (
    <div className="grid grid-cols-[1fr_360px] gap-10">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-ink-900">Certification programmes</p>
          <Link to="/certifications" className="text-link text-sm">All standards</Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-x-8 gap-y-6">
          {STANDARD_FAMILIES_IN_USE.slice(0, 9).map((family) => (
            <div key={family}>
              <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted">{family}</p>
              <ul className="mt-2 space-y-0.5">
                {STANDARDS.filter((s) => s.family === family).map((s) => (
                  <li key={s.slug}>
                    <Link to={`/certifications/${s.slug}`} className="group -mx-2 flex items-baseline gap-2 rounded-md px-2 py-1.5 hover:bg-paper">
                      <span className="code shrink-0 text-[0.8125rem] font-medium text-ink-900 group-hover:underline">{s.code}</span>
                      <span className="truncate text-xs text-muted">{s.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="on-dark relative flex flex-col overflow-hidden rounded-card bg-ink-grain p-6 text-white">
        <p className="text-sm font-semibold text-seal">Verify a certificate</p>
        <p className="mt-2 font-serif text-[1.75rem] leading-[1.05] text-white">Check any QELITE certificate in seconds.</p>
        <VerifyForm variant="compact" className="mt-6" />
        <p className="mt-auto pt-5 text-xs text-white/55">Enter the number exactly as printed, or scan the QR code on the certificate.</p>
      </div>
    </div>
  );
}

const PANELS = { certifications: CertificationsPanel };

// ─── Mobile drawer ────────────────────────────────────────────
function MobileDrawer({ open, onClose, onSearch }) {
  const [section, setSection] = useState(null);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const groups = {
    certifications: [{ name: 'All standards', href: '/certifications' }, ...STANDARDS.map((s) => ({ name: s.code, meta: s.title, href: `/certifications/${s.slug}` }))],
  };

  return (
    <div className={`fixed inset-0 z-[110] overflow-hidden lg:hidden ${open ? '' : 'pointer-events-none invisible'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink-950/50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside
        className={`absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between border-b border-line p-4">
          <Logo compact />
          <div className="flex items-center gap-2">
            <button onClick={onSearch} className="grid h-10 w-10 place-items-center rounded-full border border-ink-900" aria-label="Search">
              <i className="ri-search-line" />
            </button>
            <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-ink-900" aria-label="Close menu">
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-2">
          {NAV.map((item) =>
            item.menu && groups[item.menu] ? (
              <div key={item.name} className="border-b border-line">
                <button className="flex w-full items-center justify-between py-4 text-left font-serif text-[1.75rem] leading-tight text-ink-900" onClick={() => setSection(section === item.menu ? null : item.menu)} aria-expanded={section === item.menu}>
                  {item.name}
                  <i className={`ri-arrow-down-s-line text-xl transition-transform ${section === item.menu ? 'rotate-180' : ''}`} />
                </button>
                {section === item.menu && (
                  <ul className="pb-4">
                    {groups[item.menu].map((g) => (
                      <li key={g.href}>
                        <Link to={g.href} onClick={onClose} className="flex items-baseline gap-2 rounded-lg px-2 py-2.5 text-[0.9375rem] text-ink-900 hover:bg-paper">
                          <span className={g.meta ? 'code shrink-0 text-sm font-medium' : 'font-medium'}>{g.name}</span>
                          {g.meta && <span className="truncate text-xs text-muted">{g.meta}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link key={item.name} to={item.href} onClick={onClose} className="block border-b border-line py-4 font-serif text-[1.75rem] leading-tight text-ink-900">
                {item.name}
              </Link>
            )
          )}
        </nav>
        <div className="space-y-3 border-t border-line p-5">
          <Link to="/contact" onClick={onClose} className="btn-primary w-full">Request a quote</Link>
          {(hasPhone() || hasWhatsapp()) && (
            <div className="grid grid-cols-2 gap-3">
              {hasPhone() && <a href={`tel:${SITE.phone.tel}`} className="btn-outline"><i className="ri-phone-line" /> Call</a>}
              {hasWhatsapp() && <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp"><i className="ri-whatsapp-line" /> WhatsApp</a>}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────
export default function Header() {
  const [menu, setMenu] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenu(null);
    setDrawer(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === 'Escape') setMenu(null);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const Panel = menu ? PANELS[menu] : null;
  const isSection = (item) => (item.href === '/' ? location.pathname === '/' : location.pathname.startsWith(item.href));

  return (
    <>
      <AnnouncementBar />
      <TopBar />
      <header
        className={`sticky top-0 z-[100] border-b bg-white/95 backdrop-blur transition-shadow duration-300 ${scrolled || menu ? 'border-line shadow-soft' : 'border-line'}`}
        onMouseLeave={() => setMenu(null)}
      >
        <div className="container-site flex h-[72px] items-center justify-between gap-4">
          <Link to="/" aria-label={`${SITE.name} — home`} className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center lg:flex" aria-label="Main">
            <ul className="flex items-center gap-0.5">
              {NAV.map((item) => (
                <li key={item.name} onMouseEnter={() => setMenu(PANELS[item.menu] ? item.menu : null)}>
                  {item.menu && PANELS[item.menu] ? (
                    <button
                      className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-[0.9375rem] font-medium text-ink-900 transition-colors hover:bg-paper xl:px-4 ${
                        menu === item.menu || isSection(item) ? 'bg-paper' : ''
                      }`}
                      onClick={() => setMenu(menu === item.menu ? null : item.menu)}
                      aria-expanded={menu === item.menu}
                    >
                      {item.name}
                      <i className={`ri-arrow-down-s-line transition-transform ${menu === item.menu ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-[0.9375rem] font-medium text-ink-900 transition-colors hover:bg-paper xl:px-4 ${isActive ? 'bg-paper' : ''}`
                      }
                    >
                      {item.href === '/verify' && <i className="ri-shield-check-line text-brand-600" aria-hidden="true" />}
                      {item.name}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearch(true)}
              className="grid h-10 w-10 place-items-center rounded-full text-lg text-ink-900 transition-colors hover:bg-paper"
              aria-label="Search the site (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <i className="ri-search-line" />
            </button>
            <Link to="/contact" className="btn-dark btn-sm hidden sm:inline-flex lg:hidden xl:inline-flex">
              Request a quote
            </Link>
            <button onClick={() => setDrawer(true)} className="grid h-10 w-10 place-items-center rounded-full border border-ink-900 text-ink-900 lg:hidden" aria-label="Open menu">
              <i className="ri-menu-line text-lg" />
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <div className={`absolute inset-x-0 top-full hidden lg:block ${Panel ? '' : 'pointer-events-none'}`}>
          <div className={`border-b border-line bg-white shadow-lift transition-all duration-200 ${Panel ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
            <div className="container-site py-8">{Panel && <Panel />}</div>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} onSearch={() => { setDrawer(false); setSearch(true); }} />
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}

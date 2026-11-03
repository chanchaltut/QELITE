// Website management panel (/admin). Loaded as a separate chunk; visitors never download it.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api, setUnauthorizedHandler } from './api';
import Dashboard from './pages/Dashboard';
import ContentEditor from './pages/ContentEditor';
import Inbox from './pages/Inbox';
import MediaLibrary from './pages/MediaLibrary';
import History from './pages/History';
import Users from './pages/Users';
import Account from './pages/Account';
import Certificates from './pages/Certificates';
import CertificateForm from './pages/CertificateForm';
import CertificatePrint from './pages/CertificatePrint';
import { LogoMark } from '../components/ui/Logo';

// ─── Shared admin state ──────────────────────────────────────
const AdminContext = createContext(null);
export const useAdmin = () => useContext(AdminContext);

function Login({ onSignedIn }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ busy: false, error: '' });
  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true, error: '' });
    try {
      const { user } = await api('/auth/login', { method: 'POST', body: form });
      onSignedIn(user);
    } catch (err) {
      setStatus({ busy: false, error: err.message });
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-texture px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-panel border border-ink-900 bg-white p-7 sm:p-9">
        <LogoMark className="h-12 w-12" />
        <p className="eyebrow mt-6">QELITE · Website management</p>
        <h1 className="h-display mt-2 text-[2.5rem] leading-tight">Sign in</h1>
        <label className="mt-7 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-900">Email</span>
          <input type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-900">Password</span>
          <input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" />
        </label>
        {status.error && <p className="mt-4 rounded-lg bg-rose/50 p-3 text-sm text-ink-900">{status.error}</p>}
        <button type="submit" disabled={status.busy} className="btn-dark mt-6 w-full">{status.busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="text-link mt-6 inline-block text-sm">← Back to the website</Link>
      </form>
    </div>
  );
}

// ─── Publish ─────────────────────────────────────────────────
// After publishing, the site rebuilds on Vercel; we poll the live site's
// content-version.json until it reports the new version.
function usePublishWatcher() {
  const [watch, setWatch] = useState(null); // { id, startedAt, deploy, state: 'building' | 'live' | 'slow' }
  useEffect(() => {
    if (!watch || watch.state !== 'building') return undefined;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/content-version.json?t=${Date.now()}`, { cache: 'no-store' });
        const v = await res.json();
        if (v.id === watch.id) setWatch((w) => ({ ...w, state: 'live' }));
        else if (Date.now() - watch.startedAt > 8 * 60 * 1000) setWatch((w) => ({ ...w, state: 'slow' }));
      } catch {
        /* keep polling */
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [watch]);
  return [watch, setWatch];
}

function PublishPanel({ onClose }) {
  const { sections, refreshSections, setPublishWatch } = useAdmin();
  const changed = sections.filter((s) => s.hasChanges);
  const [note, setNote] = useState('');
  const [state, setState] = useState({ busy: false, error: '', errors: [] });

  const publish = async () => {
    setState({ busy: true, error: '', errors: [] });
    try {
      const { publish: p } = await api('/admin/publish', { method: 'POST', body: { note } });
      await refreshSections();
      setPublishWatch({ id: p.snapshotId, startedAt: Date.now(), deploy: p.deploy, state: p.deploy.status === 'triggered' ? 'building' : p.deploy.status });
      onClose();
    } catch (err) {
      setState({ busy: false, error: err.message, errors: err.body?.errors || [] });
    }
  };

  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-ink-950/60 p-4" role="dialog" aria-modal="true" aria-label="Publish changes">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-panel bg-white p-6 sm:p-8">
        <h2 className="font-serif text-[1.75rem] leading-tight text-ink-900">Publish to the website</h2>
        {changed.length ? (
          <>
            <p className="mt-2 text-sm text-ink-800">These sections have saved changes that are not live yet:</p>
            <ul className="mt-3 space-y-1.5">
              {changed.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-sm text-ink-900"><i className={`${s.icon} text-brand-600`} /> {s.title}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-800">Everything saved is already published. You can publish again to rebuild the site.</p>
        )}
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink-900">What changed? (optional)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="e.g. Updated the ISO 9001 page" className="input" />
        </label>
        {state.error && (
          <div className="mt-4 rounded-lg bg-rose/50 p-3 text-sm text-ink-900">
            <p className="font-semibold">{state.error}</p>
            {state.errors.slice(0, 8).map((e, i) => (
              <p key={i} className="mt-1"><Link to={`/admin/content/${e.key}`} onClick={onClose} className="underline">{e.title}</Link>: {e.message}</p>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted">The website rebuilds automatically and updates in about 1–2 minutes. If anything goes wrong, the current site stays live. Certificates don’t need publishing: they are live on the Verify page as soon as they are saved.</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={publish} disabled={state.busy} className="btn-primary">{state.busy ? 'Publishing…' : 'Publish now'}</button>
        </div>
      </div>
    </div>
  );
}

function PublishStatus() {
  const { publishWatch: w, setPublishWatch } = useAdmin();
  if (!w) return null;
  const tone = { building: 'bg-mist', live: 'bg-mint', slow: 'bg-seal-light', skipped: 'bg-seal-light', failed: 'bg-rose' }[w.state];
  const text = {
    building: 'Published. The website is rebuilding — this takes about 1–2 minutes…',
    live: 'Your changes are live on the website.',
    slow: 'The rebuild is taking longer than usual. Check the website in a few minutes; if it hasn’t changed, publish again.',
    skipped: 'Your changes are saved and published, but the website can’t update itself yet (automatic rebuild isn’t switched on). Please let your web developer know.',
    failed: `Your changes are saved, but the website couldn’t start updating (${w.deploy?.message || 'unknown error'}). Use “Rebuild website” under “Publish history”, or publish again in a minute.`,
  }[w.state];
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 text-sm text-ink-900 sm:px-6 ${tone}`}>
      <i className={w.state === 'building' ? 'ri-loader-4-line animate-spin' : w.state === 'live' ? 'ri-checkbox-circle-line' : 'ri-information-line'} />
      <p className="flex-1">{text}</p>
      {w.state === 'live' && <a href="/" target="_blank" rel="noopener noreferrer" className="font-semibold underline">View site</a>}
      <button onClick={() => setPublishWatch(null)} aria-label="Dismiss" className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/60"><i className="ri-close-line" /></button>
    </div>
  );
}

// ─── Layout ──────────────────────────────────────────────────
const SECTION_ORDER = ['Certification', 'Website', 'Company', 'Inbox'];
const SECTION_LABELS = { Certification: 'Certification pages' };

function Sidebar({ onNavigate }) {
  const { sections, user, signOut, guard } = useAdmin();
  const groups = SECTION_ORDER.map((name) => [name, sections.filter((s) => s.section === name)]);
  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-[0.875rem] transition-colors ${isActive ? 'bg-white/15 font-semibold text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'}`;
  const go = (e) => {
    if (!guard()) e.preventDefault();
    else onNavigate?.();
  };
  return (
    <nav className="flex h-full flex-col overflow-y-auto bg-ink-900 px-3 py-5 text-white" aria-label="Admin">
      <Link to="/admin" onClick={go} className="flex items-center gap-2.5 px-3">
        <LogoMark className="h-9 w-9" tone="light" />
        <span>
          <span className="block text-[1.0625rem] font-semibold leading-none tracking-[0.2em] text-white">QELITE</span>
          <span className="mt-1 block text-2xs text-white/50">Website management</span>
        </span>
      </Link>
      <div className="mt-6 space-y-1">
        <NavLink end to="/admin" className={link} onClick={go}><i className="ri-dashboard-line" /> Dashboard</NavLink>
        <NavLink to="/admin/inbox" className={link} onClick={go}><i className="ri-inbox-line" /> Inbox</NavLink>
      </div>
      <div className="mt-6">
        <p className="px-3 text-2xs font-semibold uppercase tracking-wider text-white/45">Certificate register</p>
        <div className="mt-1.5 space-y-0.5">
          <NavLink end to="/admin/certificates" className={link} onClick={go}><i className="ri-shield-check-line" /> All certificates</NavLink>
          <NavLink to="/admin/certificates/new" className={link} onClick={go}><i className="ri-add-circle-line" /> Add certificate</NavLink>
        </div>
      </div>
      {groups.map(([name, items]) => items.length > 0 && (
        <div key={name} className="mt-6">
          <p className="px-3 text-2xs font-semibold uppercase tracking-wider text-white/45">{SECTION_LABELS[name] || name}</p>
          <div className="mt-1.5 space-y-0.5">
            {items.map((s) => (
              <NavLink key={s.key} to={`/admin/content/${s.key}`} className={link} onClick={go}>
                <i className={s.icon} /> <span className="flex-1">{s.title}</span>
                {s.hasChanges && <span className="h-2 w-2 rounded-full bg-seal" title="Unpublished changes" />}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-6">
        <p className="px-3 text-2xs font-semibold uppercase tracking-wider text-white/45">Tools</p>
        <div className="mt-1.5 space-y-0.5">
          <NavLink to="/admin/media" className={link} onClick={go}><i className="ri-image-line" /> Media library</NavLink>
          <NavLink to="/admin/history" className={link} onClick={go}><i className="ri-history-line" /> Publish history</NavLink>
          {user.role === 'owner' && <NavLink to="/admin/users" className={link} onClick={go}><i className="ri-team-line" /> Users</NavLink>}
          <NavLink to="/admin/account" className={link} onClick={go}><i className="ri-user-settings-line" /> My account</NavLink>
        </div>
      </div>
      <div className="mt-auto space-y-1 pt-8">
        <a href="/" target="_blank" rel="noopener noreferrer" className={link({})}><i className="ri-external-link-line" /> View website</a>
        <button onClick={signOut} className={`${link({})} w-full`}><i className="ri-logout-box-line" /> Sign out</button>
        <p className="px-3 pt-2 text-xs text-white/45">Signed in as {user.email}</p>
      </div>
    </nav>
  );
}

function Shell() {
  const { sections } = useAdmin();
  const [menu, setMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const changed = sections.filter((s) => s.hasChanges).length;
  const { pathname } = useLocation();
  useEffect(() => setMenu(false), [pathname]);

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[17rem_1fr]">
      <Helmet>
        <title>Admin | QELITE</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <aside className="sticky top-0 hidden h-screen lg:block"><Sidebar /></aside>
      {menu && (
        <div className="fixed inset-0 z-[250] lg:hidden">
          <button className="absolute inset-0 bg-ink-950/50" aria-label="Close menu" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 w-72"><Sidebar onNavigate={() => setMenu(false)} /></aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-[200] border-b border-line bg-white">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button onClick={() => setMenu(true)} className="grid h-9 w-9 place-items-center rounded-full border border-ink-900 lg:hidden" aria-label="Open menu"><i className="ri-menu-line" /></button>
            <p className="flex-1 truncate text-sm text-muted">
              {changed ? <><span className="font-semibold text-ink-900">{changed}</span> section{changed === 1 ? '' : 's'} with unpublished changes</> : 'Everything is published'}
            </p>
            <button onClick={() => setPublishing(true)} className={changed ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>
              <i className="ri-upload-cloud-2-line" /> Publish
            </button>
          </div>
          <PublishStatus />
        </header>
        <main className={`mx-auto px-4 py-6 sm:px-6 sm:py-8 ${pathname.startsWith('/admin/certificates/') ? 'max-w-7xl' : 'max-w-5xl'}`}>
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/content/:key" element={<ContentEditor />} />
            <Route path="/admin/certificates" element={<Certificates />} />
            <Route path="/admin/certificates/new" element={<CertificateForm />} />
            <Route path="/admin/certificates/:id" element={<CertificateForm />} />
            <Route path="/admin/inbox" element={<Inbox />} />
            <Route path="/admin/media" element={<MediaLibrary />} />
            <Route path="/admin/history" element={<History />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/account" element={<Account />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
      {publishing && <PublishPanel onClose={() => setPublishing(false)} />}
    </div>
  );
}

export default function AdminApp() {
  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [sections, setSections] = useState([]);
  const [publishWatch, setPublishWatch] = usePublishWatcher();
  const dirty = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    api('/auth/me').then((r) => setUser(r.user)).catch(() => setUser(null));
  }, []);

  const refreshSections = useCallback(async () => {
    try {
      const r = await api('/admin/content');
      setSections(r.items);
    } catch {
      /* shown on the page that needs it */
    }
  }, []);

  useEffect(() => {
    if (user) refreshSections();
  }, [user, refreshSections]);

  // Warn before leaving a form with unsaved changes
  useEffect(() => {
    const onUnload = (e) => {
      if (!dirty.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  const value = useMemo(
    () => ({
      user,
      sections,
      refreshSections,
      publishWatch,
      setPublishWatch,
      setDirty: (v) => {
        dirty.current = v;
      },
      guard: () => {
        if (!dirty.current) return true;
        const leave = window.confirm('You have unsaved changes. Leave without saving?');
        if (leave) dirty.current = false;
        return leave;
      },
      signOut: async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => {});
        setUser(null);
        navigate('/admin');
      },
    }),
    [user, sections, refreshSections, publishWatch, setPublishWatch, navigate]
  );

  if (user === undefined) {
    return <div className="grid min-h-screen place-items-center bg-paper"><div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-900 border-t-seal" /></div>;
  }
  if (!user) return <Login onSignedIn={setUser} />;
  return (
    <AdminContext.Provider value={value}>
      <Routes>
        <Route path="/admin/certificates/:id/print" element={<CertificatePrint />} />
        <Route path="*" element={<Shell />} />
      </Routes>
    </AdminContext.Provider>
  );
}


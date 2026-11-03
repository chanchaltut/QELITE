import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatDate, formatDateTime } from '../api';
import { useAdmin } from '../AdminApp';
import { PageTitle, Notice, Loading, Card } from '../ui';
import { openPreview } from './ContentEditor';
import { StatusBadge } from './Certificates';

const TYPE_ICONS = { quotes: 'ri-file-list-3-line', enquiries: 'ri-chat-3-line', reports: 'ri-alarm-warning-line' };
const TYPE_LABELS = { quotes: 'Quote requests', enquiries: 'Enquiries', reports: 'Certificate reports' };

const QUICK = [
  ['/admin/certificates/new', 'Add a certificate', 'ri-add-circle-line'],
  ['/admin/content/certificate', 'Certificate design & signatory', 'ri-award-line'],
  ['/admin/content/standards', 'Edit standards', 'ri-medal-line'],
  ['/admin/content/home', 'Edit the home page', 'ri-home-4-line'],
  ['/admin/content/settings', 'Contact details & announcement bar', 'ri-megaphone-line'],
];

// The next audit date that hasn't passed yet
const dueLabel = (c, today) =>
  [['1st surveillance', c.surveillance1], ['2nd surveillance', c.surveillance2], ['Re-certification', c.expiryDate]].find(([, d]) => d && d >= today) ||
  ['Re-certification', c.expiryDate];

export default function Dashboard() {
  const { user } = useAdmin();
  const [data, setData] = useState(null);
  const [certs, setCerts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/admin/dashboard'), api('/admin/certificates/summary')])
      .then(([d, c]) => {
        setData(d);
        setCerts(c);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data || !certs) return <Loading />;
  const { integrations: on } = data;
  const today = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  const tiles = [
    ['Valid', certs.counts.valid, 'valid', 'ri-shield-check-line'],
    ['Audit due (60 days)', certs.due.length, 'due', 'ri-calendar-event-line'],
    ['Suspended', certs.counts.suspended, 'suspended', 'ri-pause-circle-line'],
    ['Expired', certs.counts.expired, 'expired', 'ri-time-line'],
  ];

  return (
    <>
      <PageTitle title={`Hello, ${user.name.split(' ')[0]}`} description="Manage the certificate register and everything on the website from here.">
        <button onClick={() => openPreview('/')} className="btn-outline btn-sm"><i className="ri-eye-line" /> Preview site</button>
        <Link to="/admin/certificates/new" className="btn-dark btn-sm"><i className="ri-add-line" /> Add certificate</Link>
      </PageTitle>

      {(!on.deploy || !on.email) && (
        <Notice tone="warning" className="mb-6">
          <p className="font-semibold">Setup to finish:</p>
          <ul className="mt-1 list-disc pl-5">
            {!on.deploy && <li>Automatic website rebuild after publishing (VERCEL_DEPLOY_HOOK_URL). Certificates are not affected — they are live as soon as they are saved.</li>}
            {!on.email && <li>Email alerts for new quote requests (RESEND_API_KEY). Submissions are still saved in the Inbox.</li>}
            {!on.uploads && <li>Image uploads for the website (CLOUDINARY_URL). Certificate PDFs do not need it.</li>}
          </ul>
        </Notice>
      )}

      <div className="on-dark rounded-panel bg-ink-900 p-6 text-white sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-seal">Certificate register</p>
            <p className="mt-2 font-serif text-[2.75rem] leading-none text-white">{certs.counts.total} <span className="text-[1.5rem] text-white/60">certificate{certs.counts.total === 1 ? '' : 's'}</span></p>
            <p className="mt-2 text-sm text-white/65">Checked {certs.lookups} time{certs.lookups === 1 ? '' : 's'} on the website.</p>
          </div>
          <Link to="/admin/certificates" className="btn-primary btn-sm">Open register</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {tiles.map(([label, n, filter, icon]) => (
            <Link key={filter} to={`/admin/certificates?status=${filter}`} className="rounded-card bg-white/[0.06] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/10">
              <i className={`${icon} text-lg text-seal`} />
              <p className="mt-2 font-serif text-[2rem] leading-none text-white">{n}</p>
              <p className="mt-1 text-xs text-white/70">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Audits due in the next 60 days</h2>
            <Link to="/admin/certificates?status=due" className="text-link text-sm">All</Link>
          </div>
          {certs.due.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing due in the next 60 days.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {certs.due.map((c) => {
                const [what, when] = dueLabel(c, today);
                return (
                  <li key={c.id}>
                    <Link to={`/admin/certificates/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-paper">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink-900">{c.organisation}</p>
                        <p className="code truncate text-xs text-muted">{c.number} · {c.standard}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-semibold text-ink-900">{formatDate(when)}</p>
                        <p className="text-2xs text-muted">{what}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-ink-900">Recently checked on the website</h2>
          {certs.recentChecks.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No certificate has been looked up yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {certs.recentChecks.map((c) => (
                <li key={c.id}>
                  <Link to={`/admin/certificates/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-paper">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{c.organisation}</p>
                      <p className="truncate text-xs text-muted">{formatDateTime(c.lastVerifiedAt)} · {c.verifyCount}× in total</p>
                    </div>
                    <StatusBadge status={c.effectiveStatus} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {Object.entries(data.submissions).map(([type, c]) => (
          <Link key={type} to={`/admin/inbox?type=${type}`} className="rounded-panel border border-line bg-white p-5 transition-colors hover:border-ink-900">
            <i className={`${TYPE_ICONS[type] || 'ri-inbox-line'} text-xl text-brand-600`} />
            <p className="mt-3 font-serif text-[2.25rem] leading-none text-ink-900">{c.total}</p>
            <p className="mt-1 text-sm text-ink-800">{TYPE_LABELS[type] || type}</p>
            {c.new > 0 && <p className="mt-2 inline-block rounded-full bg-seal px-2 py-0.5 text-2xs font-semibold text-ink-900">{c.new} new</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink-900">Latest from the website</h2>
            <Link to="/admin/inbox" className="text-link text-sm">Open inbox</Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing yet. Quote requests, enquiries and certificate reports appear here as soon as they are submitted.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {data.recent.map((s) => (
                <li key={s._id} className="flex items-start gap-3 py-3">
                  <i className={`${TYPE_ICONS[s.type] || 'ri-inbox-line'} mt-0.5 text-brand-600`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-900">{s.data.company || s.data.name || s.data.email || s.data.phone}</p>
                    <p className="truncate text-xs text-ink-800">{s.data.topic || s.data.number || s.data.message || TYPE_LABELS[s.type]}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted">{formatDateTime(s.createdAt)}</p>
                    {s.status === 'new' && <span className="tag bg-seal text-ink-900">New</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="font-semibold text-ink-900">Website status</h2>
            {data.unpublished.length > 0 ? (
              <p className="mt-2 text-sm text-ink-800">
                Saved but not published: {data.unpublished.map((u) => u.title).join(', ')}. Press <strong>Publish</strong> at the top to put them live.
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-800">Everything saved is live.</p>
            )}
            <p className="mt-3 text-xs text-muted">
              Last published: {data.lastPublish ? `${formatDateTime(data.lastPublish.createdAt)} by ${data.lastPublish.publishedBy || '—'}` : 'never (the website shows its original content)'}
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold text-ink-900">Quick links</h2>
            <ul className="mt-3 space-y-1">
              {QUICK.map(([to, label, icon]) => (
                <li key={to}>
                  <Link to={to} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-ink-900 hover:bg-paper">
                    <i className={`${icon} text-brand-600`} /> {label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

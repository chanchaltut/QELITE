// Form submissions from the website: quote requests, enquiries and certificate reports.
import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, downloadUrl, formatDateTime } from '../api';
import { PageTitle, Notice, Loading } from '../ui';

const TYPES = [
  ['quotes', 'Quote requests'],
  ['enquiries', 'Enquiries & complaints'],
  ['reports', 'Certificate reports'],
];
const STATUSES = [
  ['new', 'New', 'bg-seal'],
  ['in-progress', 'In progress', 'bg-mist'],
  ['done', 'Done', 'bg-mint'],
  ['spam', 'Spam', 'bg-paper-2'],
];
const LABELS = {
  topic: 'Topic', name: 'Name', company: 'Organisation', email: 'Email', phone: 'Phone', standards: 'Standards',
  employees: 'Employees', sites: 'Sites', message: 'Message', number: 'Certificate number', organisation: 'Organisation on certificate',
};
const digits = (p) => String(p || '').replace(/[^\d+]/g, '');
const waNumber = (p) => {
  const d = digits(p).replace(/^\+/, '');
  return d.length === 10 ? `91${d}` : d;
};

function Item({ item, onChange, onDelete }) {
  const [notes, setNotes] = useState(item.notes || '');
  const [open, setOpen] = useState(item.status === 'new');
  const d = item.data || {};
  const status = STATUSES.find((s) => s[0] === item.status) || STATUSES[0];

  const patch = async (body) => {
    try {
      const r = await api(`/admin/submissions/${item._id}`, { method: 'PATCH', body });
      onChange(r.item);
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <li className="rounded-card border border-line bg-white">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={open}>
        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-2xs font-semibold text-ink-900 ${status[2]}`}>{status[1]}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink-900">{[d.name || d.email || d.phone || 'Unnamed', d.company].filter(Boolean).join(' — ')}</span>
          <span className="block truncate text-sm text-ink-800">{[d.topic, Array.isArray(d.standards) ? d.standards.join(', ') : d.number, d.message].filter(Boolean).join(' · ') || d.email}</span>
        </span>
        <span className="shrink-0 text-xs text-muted">{formatDateTime(item.createdAt)}</span>
      </button>
      {open && (
        <div className="border-t border-line p-4">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {Object.entries(d).map(([k, v]) => (
              <div key={k} className={k === 'message' ? 'sm:col-span-2' : ''}>
                <dt className="text-xs text-muted">{LABELS[k] || k}</dt>
                <dd className="whitespace-pre-wrap break-words text-sm text-ink-900">{Array.isArray(v) ? v.join(', ') : v}</dd>
              </div>
            ))}
            {item.page && (
              <div>
                <dt className="text-xs text-muted">Sent from</dt>
                <dd className="text-sm text-ink-900">{item.page}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {d.phone && <a href={`tel:${digits(d.phone)}`} className="btn-outline btn-sm"><i className="ri-phone-line" /> Call</a>}
            {d.phone && <a href={`https://wa.me/${waNumber(d.phone)}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-sm"><i className="ri-whatsapp-line" /> WhatsApp</a>}
            {d.email && <a href={`mailto:${d.email}`} className="btn-outline btn-sm"><i className="ri-mail-line" /> Email</a>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr]">
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-900">Status</span>
              <select value={item.status} onChange={(e) => patch({ status: e.target.value })} className="input">
                {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs font-semibold text-ink-900">Internal notes</span>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== item.notes && patch({ notes })} className="input" placeholder="Only visible in the admin panel" />
            </label>
          </div>
          <button
            onClick={() => window.confirm('Delete this entry permanently?') && onDelete(item._id)}
            className="mt-4 text-xs font-semibold text-red-700 underline"
          >
            Delete
          </button>
        </div>
      )}
    </li>
  );
}

export default function Inbox() {
  const [params, setParams] = useSearchParams();
  const type = params.get('type') || 'quotes';
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const query = new URLSearchParams({ type, ...(status ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) }).toString();

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await api(`/admin/submissions?${query}&page=${page}`));
    } catch (err) {
      setError(err.message);
    }
  }, [query, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const replace = (item) => setData((d) => ({ ...d, items: d.items.map((i) => (i._id === item._id ? item : i)) }));
  const remove = async (id) => {
    try {
      await api(`/admin/submissions/${id}`, { method: 'DELETE' });
      setData((d) => ({ ...d, items: d.items.filter((i) => i._id !== id), total: d.total - 1 }));
    } catch (err) {
      window.alert(err.message);
    }
  };

  return (
    <>
      <PageTitle title="Inbox" description="Everything visitors submit on the website. New entries are also emailed to the addresses in Form settings.">
        <a href={downloadUrl(`/admin/submissions/export.csv?${query}`)} className="btn-outline btn-sm"><i className="ri-download-2-line" /> Export to Excel (CSV)</a>
      </PageTitle>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-white p-1 scrollbar-none" role="tablist">
        {TYPES.map(([v, l]) => (
          <button
            key={v}
            role="tab"
            aria-selected={type === v}
            onClick={() => { setParams({ type: v }); setPage(1); }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${type === v ? 'bg-ink-900 text-white' : 'text-ink-900 hover:bg-paper'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email, phone…" className="input sm:max-w-xs" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input sm:max-w-[12rem]">
          <option value="">All statuses</option>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {error && <Notice tone="error" className="mb-4">{error}</Notice>}
      {!data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <Notice>Nothing here yet.</Notice>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">{data.total} entr{data.total === 1 ? 'y' : 'ies'}</p>
          <ul className="space-y-2">
            {data.items.map((item) => <Item key={item._id} item={item} onChange={replace} onDelete={remove} />)}
          </ul>
          {data.pages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline btn-sm">Previous</button>
              <span className="text-sm text-ink-800">Page {page} of {data.pages}</span>
              <button disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)} className="btn-outline btn-sm">Next</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

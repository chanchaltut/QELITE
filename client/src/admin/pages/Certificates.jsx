// Certificate register: every certificate QELITE has issued.
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, downloadUrl, formatDate, formatDateTime } from '../api';
import { PageTitle, Notice, Loading } from '../ui';
import { STATUS_INFO } from '../../../../shared/certificates.js';

const FILTERS = [
  ['', 'All'],
  ['valid', 'Valid'],
  ['due', 'Audit due (60 days)'],
  ['expired', 'Expired'],
  ['suspended', 'Suspended'],
  ['withdrawn', 'Withdrawn'],
];

export const STATUS_BADGE = {
  valid: 'bg-mint text-brand-800',
  suspended: 'bg-[#FFE7B3] text-[#6B4500]',
  withdrawn: 'bg-rose text-[#7A1414]',
  expired: 'bg-paper-2 text-ink-800',
};

export function StatusBadge({ status }) {
  return <span className={`tag shrink-0 !px-2.5 !py-1 ${STATUS_BADGE[status] || STATUS_BADGE.expired}`}>{STATUS_INFO[status]?.label || status}</span>;
}

export default function Certificates() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const query = new URLSearchParams({ ...(status ? { status } : {}), ...(q.trim() ? { q: q.trim() } : {}) }).toString();

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await api(`/admin/certificates?${query}&page=${page}`));
    } catch (err) {
      setError(err.message);
    }
  }, [query, page]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <PageTitle title="Certificate register" description="Every certificate in this list can be looked up on the website’s Verify page by its exact number. Nothing here is published in the website build.">
        <a href={downloadUrl(`/admin/certificates/export.csv?${query}`)} className="btn-outline btn-sm"><i className="ri-download-2-line" /> Export (CSV)</a>
        <Link to="/admin/certificates/new" className="btn-dark btn-sm"><i className="ri-add-line" /> Add certificate</Link>
      </PageTitle>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-full bg-white p-1 scrollbar-none" role="tablist">
        {FILTERS.map(([v, l]) => (
          <button
            key={v || 'all'}
            role="tab"
            aria-selected={status === v}
            onClick={() => { setParams(v ? { status: v } : {}); setPage(1); }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${status === v ? 'bg-ink-900 text-white' : 'text-ink-900 hover:bg-paper'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search number, organisation or standard…" className="input sm:max-w-md" />
      </div>

      {error && <Notice tone="error" className="mb-4">{error}</Notice>}
      {!data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <Notice>
          {q || status ? 'No certificates match.' : <>No certificates yet. <Link to="/admin/certificates/new" className="font-semibold underline">Add the first one</Link>.</>}
        </Notice>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted">{data.total} certificate{data.total === 1 ? '' : 's'}</p>
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
            {data.items.map((c) => (
              <li key={c.id}>
                <Link to={`/admin/certificates/${c.id}`} className="grid gap-2 px-4 py-4 transition-colors hover:bg-paper sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_auto] sm:items-center sm:gap-6 sm:px-5">
                  <span className="min-w-0">
                    <span className="code block truncate text-[0.9375rem] font-medium text-ink-900">{c.number}</span>
                    <span className="block truncate text-xs text-muted">{c.standard}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.9375rem] font-semibold text-ink-900">{c.organisation}</span>
                    <span className="block truncate text-xs text-muted">
                      Expires {formatDate(c.expiryDate)}
                      {c.verifyCount > 0 && <> · checked {c.verifyCount}× (last {formatDateTime(c.lastVerifiedAt)})</>}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 sm:justify-end">
                    {c.file ? <i className="ri-file-pdf-2-line text-lg text-brand-700" title="PDF uploaded" /> : <i className="ri-file-forbid-line text-lg text-ink-900/25" title="No PDF uploaded" />}
                    <StatusBadge status={c.effectiveStatus} />
                  </span>
                </Link>
              </li>
            ))}
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

// Publish history with one-click rollback.
import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../api';
import { useAdmin } from '../AdminApp';
import { PageTitle, Notice, Loading } from '../ui';

const DEPLOY = {
  triggered: ['Rebuild started', 'bg-mint'],
  skipped: ['Rebuild not set up', 'bg-seal-light'],
  failed: ['Rebuild failed', 'bg-rose'],
};

export default function History() {
  const { refreshSections, setPublishWatch } = useAdmin();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = () => api('/admin/publishes').then((r) => setItems(r.items)).catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  const restore = async (p) => {
    if (!window.confirm(`Put the website back to how it was on ${formatDateTime(p.createdAt)}?\n\nThis also replaces any saved-but-unpublished changes. You can undo it by restoring a newer version.`)) return;
    setBusy(p._id);
    try {
      const r = await api(`/admin/publishes/${p._id}/restore`, { method: 'POST' });
      setPublishWatch({ id: r.publish.snapshotId, startedAt: Date.now(), deploy: r.publish.deploy, state: r.publish.deploy.status === 'triggered' ? 'building' : r.publish.deploy.status });
      await Promise.all([load(), refreshSections()]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const redeploy = async () => {
    setBusy('redeploy');
    try {
      const r = await api('/admin/redeploy', { method: 'POST' });
      window.alert(r.deploy.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <PageTitle title="Publish history" description="Every publish is kept. If something went wrong, restore an earlier version and the website goes back to it.">
        <button onClick={redeploy} disabled={busy === 'redeploy'} className="btn-outline btn-sm"><i className="ri-refresh-line" /> Rebuild website</button>
      </PageTitle>
      {error && <Notice tone="error" className="mb-4">{error}</Notice>}
      {!items ? (
        <Loading />
      ) : items.length === 0 ? (
        <Notice>Nothing has been published from the admin panel yet. The website shows its original content.</Notice>
      ) : (
        <ul className="space-y-2">
          {items.map((p, i) => {
            const [label, tone] = DEPLOY[p.deploy?.status] || DEPLOY.skipped;
            return (
              <li key={p._id} className="flex flex-col gap-3 rounded-card border border-line bg-white p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">
                    {formatDateTime(p.createdAt)} {i === 0 && <span className="tag ml-1 bg-ink-900 text-white">Current</span>}
                  </p>
                  <p className="text-sm text-ink-800">{p.note || 'No description'} · {p.publishedBy || '—'}</p>
                  <p className="mt-1 text-2xs text-muted">Version {p.snapshotId} · <span className={`rounded-full px-1.5 py-0.5 text-ink-900 ${tone}`}>{label}</span></p>
                </div>
                {i > 0 && (
                  <button onClick={() => restore(p)} disabled={Boolean(busy)} className="btn-outline btn-sm shrink-0">
                    {busy === p._id ? 'Restoring…' : 'Restore this version'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

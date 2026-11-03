import React, { useEffect, useRef, useState } from 'react';
import { api, uploadFile, formatDateTime } from '../api';
import { PageTitle, Notice, Loading } from '../ui';

const size = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.round((b || 0) / 1e3)} KB`);

export default function MediaLibrary() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const input = useRef(null);

  const load = () => api('/admin/media').then(setData).catch((err) => setError(err.message));
  useEffect(() => {
    load();
  }, []);

  const upload = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    setBusy(true);
    setError('');
    try {
      for (const file of files) await uploadFile(file, { pdf: true });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.filename || 'this file'}?`)) return;
    try {
      await api(`/admin/media/${item._id}`, { method: 'DELETE' });
      setData((d) => ({ ...d, items: d.items.filter((i) => i._id !== item._id) }));
    } catch (err) {
      setError(err.message);
    }
  };

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <>
      <PageTitle title="Media library" description="Every image and PDF uploaded from the admin panel. Uploads in forms appear here automatically.">
        <button onClick={() => input.current?.click()} disabled={busy || data?.enabled === false} className="btn-dark btn-sm">
          <i className={busy ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'} /> {busy ? 'Uploading…' : 'Upload files'}
        </button>
        <input ref={input} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={upload} />
      </PageTitle>
      {data?.enabled === false && <Notice tone="warning" className="mb-4">Uploads are not set up yet (CLOUDINARY_URL on the server).</Notice>}
      {error && <Notice tone="error" className="mb-4">{error}</Notice>}
      {!data ? (
        <Loading />
      ) : data.items.length === 0 ? (
        <Notice>No uploads yet.</Notice>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.items.map((m) => (
            <li key={m._id} className="overflow-hidden rounded-card border border-line bg-white">
              <div className="grid aspect-[4/3] place-items-center bg-paper">
                {m.resourceType === 'image' ? (
                  <img src={m.url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_400/')} alt="" loading="lazy" className="h-full w-full object-contain" />
                ) : (
                  <i className="ri-file-pdf-2-line text-4xl text-ink-900" />
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-semibold text-ink-900" title={m.filename}>{m.filename || 'File'}</p>
                <p className="text-2xs text-muted">{size(m.bytes)} · {formatDateTime(m.createdAt)}</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => copy(m.url)} className="text-xs font-semibold text-ink-900 underline">{copied === m.url ? 'Copied!' : 'Copy link'}</button>
                  <button onClick={() => remove(m)} className="ml-auto text-xs font-semibold text-red-700 underline">Delete</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

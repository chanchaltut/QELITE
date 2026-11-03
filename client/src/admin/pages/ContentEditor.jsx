// Edits one content section (Site settings, Home page, Services, …).
// Save stores a draft; Publish (top bar) puts all saved drafts live.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CONTENT } from '../../../../shared/schema.js';
import { api, formatDateTime } from '../api';
import { Fields, ErrorsContext } from '../fields';
import { useAdmin } from '../AdminApp';
import { PageTitle, Notice, Loading } from '../ui';
import { resetCertificateTemplate } from '../useCertificateTemplate';

const PREVIEW_KEY = 'qe-preview';

export async function openPreview(path = '/') {
  // Open the tab first (synchronously) so pop-up blockers allow it
  const tab = window.open('about:blank', '_blank');
  try {
    const { snapshot } = await api('/admin/preview');
    localStorage.setItem(PREVIEW_KEY, JSON.stringify(snapshot));
    if (tab) tab.location.href = `${path}?preview=1`;
    else window.location.href = `${path}?preview=1`;
  } catch (err) {
    tab?.close();
    window.alert(err.message);
  }
}

// Where "Preview" lands for each section
const PREVIEW_PATH = {
  standards: '/certifications', certificate: '/verify', accreditation: '/accreditation', about: '/about',
  faqs: '/faqs', legal: '/privacy-policy',
};

export default function ContentEditor() {
  const { key } = useParams();
  const def = CONTENT[key];
  const { refreshSections, setDirty } = useAdmin();
  const [doc, setDoc] = useState(null);
  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, saving: false, error: '', message: '', conflict: false });
  const [errors, setErrors] = useState([]);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: '', conflict: false }));
    setErrors([]);
    try {
      const r = await api(`/admin/content/${key}`);
      setDoc(r);
      setData(JSON.parse(JSON.stringify(r.draft)));
      setState((s) => ({ ...s, loading: false }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [key]);

  useEffect(() => {
    setState({ loading: true, saving: false, error: '', message: '', conflict: false });
    load();
  }, [load]);

  const dirty = useMemo(() => Boolean(doc && data) && JSON.stringify(data) !== JSON.stringify(doc.draft), [doc, data]);
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);

  const errorMap = useMemo(() => Object.fromEntries(errors.map((e) => [e.path, e.message])), [errors]);

  const save = async () => {
    setState((s) => ({ ...s, saving: true, error: '', message: '' }));
    setErrors([]);
    try {
      const r = await api(`/admin/content/${key}`, { method: 'PUT', body: { data, version: doc.version } });
      setDoc(r);
      setData(JSON.parse(JSON.stringify(r.draft)));
      if (key === 'certificate' || key === 'settings') resetCertificateTemplate();
      setState((s) => ({
        ...s,
        saving: false,
        message: def.private ? 'Saved. This takes effect immediately.' : 'Saved. Use “Publish” (top right) when you’re ready to put it on the website.',
      }));
      refreshSections();
      return true;
    } catch (err) {
      setErrors(err.body?.errors || []);
      setState((s) => ({ ...s, saving: false, error: err.message, conflict: err.status === 409 }));
      // Bring the first problem into view
      setTimeout(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
      return false;
    }
  };

  const discard = async () => {
    if (!window.confirm('Throw away all saved changes in this section that are not published yet?')) return;
    try {
      const r = await api(`/admin/content/${key}/discard`, { method: 'POST' });
      setDoc(r);
      setData(JSON.parse(JSON.stringify(r.draft)));
      setErrors([]);
      setState((s) => ({ ...s, error: '', message: 'Changes discarded — this section matches the live website again.' }));
      refreshSections();
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  };

  const undoEdits = () => {
    if (!window.confirm('Undo your edits since the last save?')) return;
    setData(JSON.parse(JSON.stringify(doc.draft)));
    setErrors([]);
  };

  const preview = async () => {
    if (dirty && !(await save())) return;
    openPreview(PREVIEW_PATH[key] || '/');
  };

  if (!def) return <Notice tone="error">Unknown section.</Notice>;
  if (state.loading && !doc) return <Loading />;
  if (!doc) {
    return (
      <>
        <PageTitle title={def.title} />
        <Notice tone="error">{state.error} <button onClick={load} className="ml-2 font-semibold underline">Try again</button></Notice>
      </>
    );
  }

  return (
    <ErrorsContext.Provider value={errorMap}>
      <PageTitle title={def.title} description={def.description} />

      <div className="sticky top-14 z-[100] -mx-4 mb-6 border-b border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={save} disabled={!dirty || state.saving} className="btn-dark btn-sm">
            <i className={state.saving ? 'ri-loader-4-line animate-spin' : 'ri-save-3-line'} /> {state.saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </button>
          {dirty && <button onClick={undoEdits} className="btn-outline btn-sm">Undo edits</button>}
          {!def.private && <button onClick={preview} className="btn-outline btn-sm"><i className="ri-eye-line" /> Preview</button>}
          {!def.private && doc.hasChanges && !dirty && (
            <button onClick={discard} className="btn-outline btn-sm"><i className="ri-arrow-go-back-line" /> Discard unpublished changes</button>
          )}
          <p className="ml-auto text-xs text-muted">
            {dirty ? <span className="font-semibold text-ink-900">Unsaved changes</span> : doc.hasChanges ? 'Saved · not published yet' : 'Live on the website'}
            {doc.updatedBy && <span className="hidden sm:inline"> · last saved {formatDateTime(doc.updatedAt)} by {doc.updatedBy}</span>}
          </p>
        </div>
        {state.error && (
          <Notice tone="error" className="mt-3">
            {state.error}
            {state.conflict && <button onClick={load} className="ml-2 font-semibold underline">Reload</button>}
            {errors.length > 0 && <span className="ml-1">({errors.length} field{errors.length === 1 ? '' : 's'} highlighted in red)</span>}
          </Notice>
        )}
        {state.message && !state.error && <Notice tone="success" className="mt-3">{state.message}</Notice>}
      </div>

      <p className="mb-5 text-xs text-muted">
        Tip: text inside [square brackets] is treated as “not filled in yet” and is hidden on the website.
      </p>

      <Fields fields={def.fields} value={data} onChange={setData} />

      <div className="mt-8 flex justify-end">
        <button onClick={save} disabled={!dirty || state.saving} className="btn-dark">{state.saving ? 'Saving…' : 'Save changes'}</button>
      </div>
    </ErrorsContext.Provider>
  );
}

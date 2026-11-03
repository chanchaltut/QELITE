// Add or edit one certificate, upload its PDF, and preview / print it.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, downloadUrl, formatDateTime, uploadCertificatePdf } from '../api';
import { useAdmin } from '../AdminApp';
import { PageTitle, Notice, Loading, Card } from '../ui';
import { STANDARDS_ALL } from '../../data/standards';
import { CERT_FIELDS, STATUS_INFO, cycleDate, effectiveStatus, lookupKey } from '../../../../shared/certificates.js';
import { CertificateDocument, CertificateFrame, useCertificateFonts } from '../../components/certificate/CertificateDocument';
import { useCertificateTemplate } from '../useCertificateTemplate';
import { StatusBadge } from './Certificates';

const BLANK = {
  number: '', title: '', organisation: '', address: '', standard: '', standardTitle: '', scope: '',
  issueDate: '', surveillance1: '', surveillance2: '', expiryDate: '', status: 'valid', remarks: '',
};

const STATUS_HELP = {
  valid: 'Shown as Valid until the re-certification date, then automatically as Expired.',
  suspended: 'Shown as Suspended. No certificate copy is shown on the website.',
  withdrawn: 'Shown as Withdrawn. No certificate copy is shown on the website.',
};

function Label({ name, children, hint, errors }) {
  const def = CERT_FIELDS[name];
  const error = errors[name];
  return (
    <label className="block" data-error={error ? 'true' : undefined}>
      <span className="mb-1.5 block text-sm font-semibold text-ink-900">
        {def?.label || name}
        {def?.required && <span className="text-red-700"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-700"><i className="ri-error-warning-line" /> {error}</span>}
    </label>
  );
}

export default function CertificateForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user, setDirty } = useAdmin();
  const { template, siteUrl } = useCertificateTemplate();
  useCertificateFonts();

  const [saved, setSaved] = useState(null); // the record as stored
  const [form, setForm] = useState(BLANK);
  const [state, setState] = useState({ loading: !isNew, saving: false, error: '', message: '' });
  const [errors, setErrors] = useState({});
  const [autoDates, setAutoDates] = useState(isNew);
  const [upload, setUpload] = useState({ busy: false, error: '' });
  const fileRef = useRef(null);

  const titles = (template.titles || []).filter(Boolean);
  const standardOptions = STANDARDS_ALL.filter((s) => s.code);

  useEffect(() => {
    if (isNew) {
      setSaved(null);
      setForm({ ...BLANK, title: titles[0] || 'Certificate of Registration' });
      setState({ loading: false, saving: false, error: '', message: '' });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: '' }));
    api(`/admin/certificates/${id}`)
      .then((r) => {
        setSaved(r.item);
        setForm(Object.fromEntries(Object.keys(BLANK).map((k) => [k, r.item[k] || ''])));
        setAutoDates(false);
        setState({ loading: false, saving: false, error: '', message: '' });
      })
      .catch((err) => setState({ loading: false, saving: false, error: err.message, message: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const dirty = useMemo(() => {
    if (isNew) return Object.entries(form).some(([k, v]) => v && v !== BLANK[k] && k !== 'title');
    return saved ? Object.keys(BLANK).some((k) => (form[k] || '') !== (saved[k] || '')) : false;
  }, [form, saved, isNew]);
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'issueDate' && autoDates && value) {
        next.surveillance1 = cycleDate(value, 1);
        next.surveillance2 = cycleDate(value, 2);
        next.expiryDate = cycleDate(value, 3);
      }
      return next;
    });
    if (['surveillance1', 'surveillance2', 'expiryDate'].includes(key)) setAutoDates(false);
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const pickStandard = (e) => {
    const s = standardOptions.find((o) => o.code === e.target.value);
    setForm((f) => ({ ...f, standard: s ? s.code : f.standard, standardTitle: s ? s.title : f.standardTitle }));
  };

  const recalc = () => {
    if (!form.issueDate) return;
    setForm((f) => ({ ...f, surveillance1: cycleDate(f.issueDate, 1), surveillance2: cycleDate(f.issueDate, 2), expiryDate: cycleDate(f.issueDate, 3) }));
  };

  const save = async (e) => {
    e?.preventDefault();
    setState((s) => ({ ...s, saving: true, error: '', message: '' }));
    setErrors({});
    try {
      const r = isNew
        ? await api('/admin/certificates', { method: 'POST', body: form })
        : await api(`/admin/certificates/${id}`, { method: 'PUT', body: { ...form, rev: saved.rev } });
      setSaved(r.item);
      setForm(Object.fromEntries(Object.keys(BLANK).map((k) => [k, r.item[k] || ''])));
      setState({ loading: false, saving: false, error: '', message: isNew ? 'Certificate added to the register. You can now upload its PDF.' : 'Saved. The change is live on the Verify page immediately.' });
      setDirty(false);
      if (isNew) navigate(`/admin/certificates/${r.item.id}`, { replace: true });
    } catch (err) {
      setErrors(Object.fromEntries((err.body?.errors || []).map((x) => [x.path, x.message])));
      setState((s) => ({ ...s, saving: false, error: err.message }));
      setTimeout(() => document.querySelector('[data-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !saved) return;
    setUpload({ busy: true, error: '' });
    try {
      const r = await uploadCertificatePdf(saved.id, file);
      setSaved(r.item);
      setUpload({ busy: false, error: '' });
    } catch (err) {
      setUpload({ busy: false, error: err.message });
    }
  };

  const removeFile = async () => {
    if (!window.confirm('Remove the uploaded PDF? The website will show the digital certificate instead.')) return;
    try {
      const r = await api(`/admin/certificates/${saved.id}/file`, { method: 'DELETE' });
      setSaved(r.item);
    } catch (err) {
      setUpload({ busy: false, error: err.message });
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete certificate ${saved.number} permanently?\n\nIt will no longer be found on the Verify page. To stop a certificate being valid, set its status to Withdrawn instead — that keeps an honest public record.`)) return;
    try {
      await api(`/admin/certificates/${saved.id}`, { method: 'DELETE' });
      setDirty(false);
      navigate('/admin/certificates', { replace: true });
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    }
  };

  if (state.loading) return <Loading />;
  if (!isNew && !saved) return <Notice tone="error">{state.error || 'Certificate not found.'} <Link to="/admin/certificates" className="ml-2 font-semibold underline">Back to the register</Link></Notice>;

  const shownStatus = saved ? effectiveStatus({ ...saved, ...form }) : 'valid';
  const preview = { ...form, number: form.number || 'QMS/00X00000', organisation: form.organisation || 'Organisation name', standard: form.standard || 'ISO 0000:0000', scope: form.scope || 'Scope of activities' };
  const keyPreview = lookupKey(form.number);

  return (
    <>
      <PageTitle title={isNew ? 'Add a certificate' : saved.number} description={isNew ? 'Enter the details exactly as printed on the certificate.' : saved.organisation}>
        <Link to="/admin/certificates" className="btn-outline btn-sm"><i className="ri-arrow-left-line" /> Register</Link>
        {!isNew && (
          <>
            <a href={`/verify?cert=${encodeURIComponent(saved.number)}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm"><i className="ri-external-link-line" /> View on website</a>
            <Link to={`/admin/certificates/${saved.id}/print`} className="btn-dark btn-sm"><i className="ri-printer-line" /> Print / save as PDF</Link>
          </>
        )}
      </PageTitle>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={save} className="space-y-6" noValidate>
          {!isNew && (
            <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 !py-4">
              <span className="flex items-center gap-2 text-sm text-ink-800">On the website: <StatusBadge status={shownStatus} /></span>
              <span className="text-xs text-muted">Checked {saved.verifyCount}×{saved.lastVerifiedAt ? `, last ${formatDateTime(saved.lastVerifiedAt)}` : ''}</span>
              <span className="text-xs text-muted">Last saved {formatDateTime(saved.updatedAt)}{saved.updatedBy ? ` by ${saved.updatedBy}` : ''}</span>
            </Card>
          )}

          <Card>
            <h2 className="font-semibold text-ink-900">Certificate</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Label name="number" errors={errors} hint={keyPreview ? <>Visitors can type it with or without spaces, slashes and hyphens (matched as <span className="code">{keyPreview}</span>).</> : 'Exactly as printed, e.g. QMS/26Q00001.'}>
                <input value={form.number} onChange={set('number')} className="input code uppercase" autoComplete="off" spellCheck={false} />
              </Label>
              <Label name="title" errors={errors}>
                <input value={form.title} onChange={set('title')} list="cert-titles" className="input" />
                <datalist id="cert-titles">{titles.map((t) => <option key={t} value={t} />)}</datalist>
              </Label>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-ink-900">Certified organisation</h2>
            <div className="mt-5 grid gap-5">
              <Label name="organisation" errors={errors}>
                <input value={form.organisation} onChange={set('organisation')} className="input" />
              </Label>
              <Label name="address" errors={errors} hint="Printed under the name. Line breaks are kept.">
                <textarea rows={2} value={form.address} onChange={set('address')} className="input" />
              </Label>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-ink-900">Standard and scope</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-ink-900">Pick a standard</span>
                <select value={standardOptions.some((s) => s.code === form.standard) ? form.standard : ''} onChange={pickStandard} className="input max-w-md">
                  <option value="">— Choose, or type below —</option>
                  {standardOptions.map((s) => <option key={s.slug} value={s.code}>{s.code} — {s.title}</option>)}
                </select>
              </label>
              <Label name="standard" errors={errors} hint="e.g. ISO 9001:2015">
                <input value={form.standard} onChange={set('standard')} className="input code" />
              </Label>
              <Label name="standardTitle" errors={errors} hint="Shown in brackets, e.g. Quality Management System">
                <input value={form.standardTitle} onChange={set('standardTitle')} className="input" />
              </Label>
              <div className="sm:col-span-2">
                <Label name="scope" errors={errors} hint="The activities covered, as printed on the certificate.">
                  <textarea rows={4} value={form.scope} onChange={set('scope')} className="input" />
                </Label>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-ink-900">Certification cycle</h2>
              <button type="button" onClick={recalc} disabled={!form.issueDate} className="btn-outline btn-sm"><i className="ri-calculator-line" /> Calculate from registration date</button>
            </div>
            <p className="mt-1 text-xs text-muted">Surveillance in years 1 and 2 and re-certification in year 3, each due the day before the anniversary.{autoDates ? ' Filled in automatically when you enter the registration date.' : ''}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {['issueDate', 'surveillance1', 'surveillance2', 'expiryDate'].map((k) => (
                <Label key={k} name={k} errors={errors}>
                  <input type="date" value={form[k]} onChange={set(k)} className="input max-w-xs" />
                </Label>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold text-ink-900">Status</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup">
              {['valid', 'suspended', 'withdrawn'].map((s) => (
                <button
                  type="button"
                  key={s}
                  role="radio"
                  aria-checked={form.status === s}
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`rounded-card border p-4 text-left transition-colors ${form.status === s ? 'border-ink-900 bg-paper' : 'border-line hover:border-ink-900/40'}`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <span className={`grid h-4 w-4 place-items-center rounded-full border ${form.status === s ? 'border-ink-900' : 'border-ink-900/30'}`}>{form.status === s && <span className="h-2 w-2 rounded-full bg-ink-900" />}</span>
                    {STATUS_INFO[s].label}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-ink-800">{STATUS_HELP[s]}</span>
                </button>
              ))}
            </div>
            <div className="mt-5">
              <Label name="remarks" errors={errors} hint="Only visible in the admin panel, e.g. the reason for a suspension.">
                <textarea rows={2} value={form.remarks} onChange={set('remarks')} className="input" />
              </Label>
            </div>
          </Card>

          {state.error && <Notice tone="error">{state.error}</Notice>}
          {state.message && !state.error && <Notice tone="success">{state.message}</Notice>}

          <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-2 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <button type="submit" disabled={state.saving || (!dirty && !isNew)} className="btn-dark">
              <i className={state.saving ? 'ri-loader-4-line animate-spin' : 'ri-save-3-line'} /> {state.saving ? 'Saving…' : isNew ? 'Add to register' : dirty ? 'Save changes' : 'Saved'}
            </button>
            {!isNew && user.role === 'owner' && (
              <button type="button" onClick={remove} className="ml-auto text-xs font-semibold text-red-700 underline">Delete certificate</button>
            )}
          </div>
        </form>

        <div className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <h2 className="font-semibold text-ink-900">Certificate PDF</h2>
            {isNew ? (
              <p className="mt-2 text-sm text-ink-800">Add the certificate first, then upload its PDF here.</p>
            ) : (
              <>
                <p className="mt-2 text-sm text-ink-800">
                  {saved.file
                    ? 'Visitors see this PDF when the certificate is valid.'
                    : 'No PDF yet. Visitors see the digital certificate shown below instead. Upload the signed certificate if you have one.'}
                </p>
                {saved.file && (
                  <div className="mt-4 flex items-center gap-3 rounded-card bg-paper p-3">
                    <i className="ri-file-pdf-2-line text-2xl text-brand-700" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{saved.file.name}</p>
                      <p className="text-xs text-muted">{Math.round(saved.file.size / 1024)} KB · {formatDateTime(saved.file.uploadedAt)}</p>
                    </div>
                    <a href={downloadUrl(`/admin/certificates/${saved.id}/file`)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">Open</a>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={upload.busy} className="btn-dark btn-sm">
                    <i className={upload.busy ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'} /> {upload.busy ? 'Uploading…' : saved.file ? 'Replace PDF' : 'Upload PDF'}
                  </button>
                  {saved.file && <button type="button" onClick={removeFile} className="btn-outline btn-sm">Remove</button>}
                </div>
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onFile} />
                {upload.error && <p className="mt-2 text-xs font-semibold text-red-700">{upload.error}</p>}
                <p className="mt-3 text-xs text-muted">Stored privately in the database (max 10 MB). It is only served through the Verify page while the certificate is valid.</p>
              </>
            )}
          </Card>

          <Card className="!p-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-ink-900">Live preview</h2>
              <Link to="/admin/content/certificate" className="text-xs text-ink-800 underline">Edit design</Link>
            </div>
            <CertificateFrame>
              <CertificateDocument cert={preview} template={template} siteUrl={siteUrl} watermark={shownStatus !== 'valid' ? STATUS_INFO[shownStatus]?.label : !form.number ? 'Preview' : ''} />
            </CertificateFrame>
          </Card>
        </div>
      </div>
    </>
  );
}

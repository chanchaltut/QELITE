// Form controls generated from shared/schema.js. Every content screen in the
// admin panel is built from these few components.
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { emptyValue } from '../../../shared/schema.js';
import { uploadFile } from './api';

// path → message, filled from server validation
export const ErrorsContext = createContext({});

const optionPair = (o) => (Array.isArray(o) ? o : [o, o]);
const uid = () => Math.random().toString(36).slice(2);

function Label({ field, path, children }) {
  const errors = useContext(ErrorsContext);
  const error = errors[path];
  return (
    <div data-error={error ? 'true' : undefined}>
      <p className="mb-1.5 text-sm font-semibold text-ink-900">
        {field.label}
        {field.required && <span className="text-red-700"> *</span>}
      </p>
      {children}
      {field.help && <p className="mt-1.5 text-xs leading-relaxed text-muted">{field.help}</p>}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-700"><i className="ri-error-warning-line" /> {error}</p>}
    </div>
  );
}
function TextInput({ field, value, onChange, multiline }) {
  const v = value ?? '';
  const length = String(v).length;
  const common = {
    value: v,
    onChange: (e) => onChange(e.target.value),
    maxLength: field.max ? field.max + 200 : undefined,
    className: `input ${field.max && length > field.max ? '!border-red-700' : ''}`,
    placeholder: field.placeholder,
  };
  return (
    <>
      {multiline ? <textarea rows={field.rows || Math.min(12, Math.max(3, Math.ceil(length / 90)))} {...common} /> : <input type="text" {...common} />}
      {field.max && length > field.max * 0.8 && (
        <p className={`mt-1 text-right text-2xs ${length > field.max ? 'font-semibold text-red-700' : 'text-muted'}`}>{length} / {field.max}</p>
      )}
    </>
  );
}

function Toggle({ field, value, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(value)}
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 text-left"
    >
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-ink-900/25'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${value ? 'left-[1.375rem]' : 'left-0.5'}`} />
      </span>
      <span className="text-sm font-semibold text-ink-900">{field.label}</span>
    </button>
  );
}

function MediaInput({ value, onChange, pdf }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isImage = value && !/\.pdf($|\?)/i.test(value) && !value.includes('/raw/upload/');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadFile(file, { pdf }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div className="grid h-24 w-full shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-paper sm:w-36">
        {value && isImage ? (
          <img src={value} alt="" className="h-full w-full object-contain" onError={(e) => { e.currentTarget.style.opacity = 0.2; }} />
        ) : value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-center text-xs text-ink-900 underline"><i className="ri-file-pdf-2-line block text-3xl" />Open file</a>
        ) : (
          <i className={`${pdf ? 'ri-file-line' : 'ri-image-line'} text-3xl text-muted`} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value.trim())} placeholder="Upload, or paste a link (https://…)" className="input" />
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-dark btn-sm">
            <i className={busy ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'} /> {busy ? 'Uploading…' : 'Upload'}
          </button>
          {value && <button type="button" onClick={() => onChange('')} className="btn-outline btn-sm">Remove</button>}
        </div>
        <input ref={inputRef} type="file" accept={pdf ? 'application/pdf,image/*' : 'image/*'} className="hidden" onChange={pick} />
        {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
      </div>
    </div>
  );
}

// Article text: one box, paragraphs separated by an empty line
function ParagraphsInput({ value, onChange }) {
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join('\n\n') : ''));
  const last = useRef(value);
  useEffect(() => {
    // Value replaced from outside (discard / reload) — refresh the box
    if (value !== last.current) setText(Array.isArray(value) ? value.join('\n\n') : '');
  }, [value]);
  const change = (t) => {
    setText(t);
    const next = t.split(/\n[ \t]*\n/).map((p) => p.trim()).filter(Boolean);
    last.current = next;
    onChange(next);
  };
  return <textarea rows={Math.min(30, Math.max(8, text.split('\n').length + 2))} value={text} onChange={(e) => change(e.target.value)} className="input font-[inherit] leading-relaxed" />;
}

function StringsInput({ field, value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  const set = (next) => onChange(next);
  const Input = field.multiline ? 'textarea' : 'input';
  return (
    <div className="space-y-2">
      {items.map((s, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input value={s} onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))} className="input" rows={field.multiline ? 3 : undefined} />
          <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
            <IconButton icon="ri-arrow-up-line" label="Move up" disabled={i === 0} onClick={() => set(move(items, i, -1))} />
            <IconButton icon="ri-arrow-down-line" label="Move down" disabled={i === items.length - 1} onClick={() => set(move(items, i, 1))} />
            <IconButton icon="ri-delete-bin-line" label="Remove" onClick={() => set(items.filter((_, j) => j !== i))} danger />
          </div>
        </div>
      ))}
      <button type="button" onClick={() => set([...items, ''])} className="btn-outline btn-sm"><i className="ri-add-line" /> Add</button>
    </div>
  );
}

const move = (arr, i, dir) => {
  const next = [...arr];
  const j = i + dir;
  if (j < 0 || j >= next.length) return next;
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function IconButton({ icon, label, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-full border text-base transition-colors disabled:opacity-30 ${danger ? 'border-red-700/40 text-red-700 hover:bg-red-50' : 'border-ink-900/25 text-ink-900 hover:bg-paper'}`}
    >
      <i className={icon} />
    </button>
  );
}

function itemTitle(field, item, i) {
  const key = field.itemLabel;
  let label = key ? item?.[key] : '';
  if (key && field.fields[key]?.type === 'select') {
    const match = field.fields[key].options.map(optionPair).find(([v]) => v === label);
    label = match ? match[1] : label;
  }
  if (Array.isArray(label)) label = label[0];
  return String(label || '').trim() || `New item ${i + 1}`;
}

function ListInput({ field, value, onChange, path }) {
  const items = Array.isArray(value) ? value : [];
  const errors = useContext(ErrorsContext);
  const keys = useRef([]);
  if (keys.current.length !== items.length) keys.current = items.map((_, i) => keys.current[i] || uid());
  const [open, setOpen] = useState(() => new Set());
  const [q, setQ] = useState('');

  const errorCount = (i) => Object.keys(errors).filter((p) => p.startsWith(`${path}.${i}.`)).length;
  const update = (next, nextKeys) => {
    keys.current = nextKeys;
    onChange(next);
  };
  const toggle = (k) => setOpen((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const add = () => {
    const blank = emptyValue({ type: 'group', fields: field.fields });
    const k = uid();
    if (field.newestFirst) update([blank, ...items], [k, ...keys.current]);
    else update([...items, blank], [...keys.current, k]);
    setOpen((s) => new Set(s).add(k));
  };
  const remove = (i) => {
    if (!window.confirm(`Delete “${itemTitle(field, items[i], i)}”? You can still discard unsaved changes afterwards.`)) return;
    update(items.filter((_, j) => j !== i), keys.current.filter((_, j) => j !== i));
  };
  const duplicate = (i) => {
    const copy = JSON.parse(JSON.stringify(items[i]));
    Object.entries(field.fields).forEach(([k, f]) => {
      if (f.unique && typeof copy[k] === 'string') copy[k] = `${copy[k]}-copy`;
    });
    const k = uid();
    update([...items.slice(0, i + 1), copy, ...items.slice(i + 1)], [...keys.current.slice(0, i + 1), k, ...keys.current.slice(i + 1)]);
    setOpen((s) => new Set(s).add(k));
  };
  const shift = (i, dir) => update(move(items, i, dir), move(keys.current, i, dir));

  const atMax = field.max && items.length >= field.max;
  const query = q.trim().toLowerCase();

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={add} disabled={atMax} className="btn-dark btn-sm"><i className="ri-add-line" /> {field.addLabel || 'Add item'}</button>
        <span className="text-xs text-muted">{items.length} item{items.length === 1 ? '' : 's'}</span>
        {items.length > 8 && (
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="input !h-9 !w-48 !py-1 text-sm sm:ml-auto" />
        )}
      </div>
      <ol className="space-y-2">
        {items.map((item, i) => {
          const k = keys.current[i];
          const title = itemTitle(field, item, i);
          if (query && !JSON.stringify(item).toLowerCase().includes(query)) return null;
          const errs = errorCount(i);
          const isOpen = open.has(k) || errs > 0;
          return (
            <li key={k} className={`rounded-card border bg-white ${errs ? 'border-red-700' : 'border-line'}`}>
              <div className="flex items-center gap-2 p-2 pl-4">
                <button type="button" onClick={() => toggle(k)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left" aria-expanded={isOpen}>
                  <i className={`ri-arrow-right-s-line text-lg text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  <span className="truncate text-[0.9375rem] font-medium text-ink-900">{title}</span>
                  {errs > 0 && <span className="tag shrink-0 bg-red-700 text-white">{errs} to fix</span>}
                </button>
                <div className="flex shrink-0 gap-1">
                  <IconButton icon="ri-arrow-up-line" label="Move up" disabled={i === 0} onClick={() => shift(i, -1)} />
                  <IconButton icon="ri-arrow-down-line" label="Move down" disabled={i === items.length - 1} onClick={() => shift(i, 1)} />
                  <span className="hidden sm:contents">
                    <IconButton icon="ri-file-copy-line" label="Duplicate" disabled={atMax} onClick={() => duplicate(i)} />
                  </span>
                  <IconButton icon="ri-delete-bin-line" label="Delete" onClick={() => remove(i)} danger />
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-line p-4 sm:p-5">
                  <Fields fields={field.fields} value={item} path={`${path}.${i}`} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Field({ field, value, onChange, path }) {
  switch (field.type) {
    case 'toggle':
      return (
        <div>
          <Toggle field={field} value={value} onChange={onChange} />
          {field.help && <p className="mt-1.5 pl-14 text-xs text-muted">{field.help}</p>}
        </div>
      );
    case 'group':
      return (
        <fieldset className="rounded-card border border-line bg-paper/60 p-4 sm:p-5">
          <legend className="px-1 text-sm font-semibold text-ink-900">{field.label}</legend>
          <Fields fields={field.fields} value={value || {}} onChange={onChange} path={path} />
        </fieldset>
      );
    case 'list':
      return (
        <Label field={field} path={path}>
          <ListInput field={field} value={value} onChange={onChange} path={path} />
        </Label>
      );
    default:
      return (
        <Label field={field} path={path}>
          <Control field={field} value={value} onChange={onChange} />
        </Label>
      );
  }
}

function Control({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return <TextInput field={field} value={value} onChange={onChange} multiline />;
    case 'number':
      return (
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="input max-w-xs"
        />
      );
    case 'date':
      return <input type="date" value={typeof value === 'string' ? value.slice(0, 10) : ''} onChange={(e) => onChange(e.target.value)} className="input max-w-xs" />;
    case 'select':
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="input max-w-md">
          {!field.required && <option value="">—</option>}
          {field.options.map(optionPair).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    case 'image':
      return <MediaInput value={value} onChange={onChange} />;
    case 'file':
      return <MediaInput value={value} onChange={onChange} pdf />;
    case 'strings':
      return <StringsInput field={field} value={value} onChange={onChange} />;
    case 'paragraphs':
      return <ParagraphsInput value={value} onChange={onChange} />;
    case 'icon':
      return (
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-paper text-xl text-ink-900"><i className={value || 'ri-question-line'} /></span>
          <TextInput field={field} value={value} onChange={onChange} />
        </div>
      );
    default:
      return <TextInput field={field} value={value} onChange={onChange} />;
  }
}

export function Fields({ fields, value, onChange, path = '' }) {
  const obj = value || {};
  return (
    <div className="space-y-5">
      {Object.entries(fields).map(([k, field]) => (
        <Field
          key={k}
          field={field}
          value={obj[k]}
          path={path ? `${path}.${k}` : k}
          onChange={(v) => onChange({ ...obj, [k]: v })}
        />
      ))}
    </div>
  );
}

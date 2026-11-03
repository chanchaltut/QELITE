// Admin accounts (owner only).
import React, { useEffect, useState } from 'react';
import { api, formatDateTime } from '../api';
import { useAdmin } from '../AdminApp';
import { PageTitle, Notice, Loading, Card } from '../ui';

const BLANK = { name: '', email: '', role: 'editor', password: '' };

export default function Users() {
  const { user: me } = useAdmin();
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [msg, setMsg] = useState({ tone: '', text: '' });

  const load = () => api('/admin/users').then((r) => setItems(r.items)).catch((err) => setMsg({ tone: 'error', text: err.message }));
  useEffect(() => {
    load();
  }, []);

  if (me.role !== 'owner') return <Notice tone="warning">Only the owner account can manage users.</Notice>;

  const add = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/users', { method: 'POST', body: form });
      setForm(BLANK);
      setMsg({ tone: 'success', text: `Account created. Share the email and password with ${form.name} privately.` });
      load();
    } catch (err) {
      setMsg({ tone: 'error', text: err.message });
    }
  };

  const update = async (u, body, done) => {
    try {
      await api(`/admin/users/${u.id}`, { method: 'PATCH', body });
      setMsg({ tone: 'success', text: done });
      load();
    } catch (err) {
      setMsg({ tone: 'error', text: err.message });
    }
  };

  const resetPassword = (u) => {
    const password = window.prompt(`New password for ${u.name} (at least 10 characters):`);
    if (password) update(u, { password }, `Password changed for ${u.name}. They have been signed out everywhere.`);
  };

  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.name}'s access?`)) return;
    try {
      await api(`/admin/users/${u.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setMsg({ tone: 'error', text: err.message });
    }
  };

  return (
    <>
      <PageTitle title="Users" description="Owners can do everything, including managing users. Editors can edit, publish and use the inbox." />
      {msg.text && <Notice tone={msg.tone} className="mb-4">{msg.text}</Notice>}
      {!items ? (
        <Loading />
      ) : (
        <ul className="space-y-2">
          {items.map((u) => (
            <li key={u.id} className="flex flex-col gap-3 rounded-card border border-line bg-white p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{u.name} {u.id === me.id && <span className="text-xs font-normal text-muted">(you)</span>}</p>
                <p className="text-sm text-ink-800">{u.email}</p>
                <p className="text-2xs text-muted">Last sign-in: {formatDateTime(u.lastLoginAt)}</p>
              </div>
              <select value={u.role} onChange={(e) => update(u, { role: e.target.value }, 'Role updated.')} className="input !w-auto">
                <option value="owner">Owner</option>
                <option value="editor">Editor</option>
              </select>
              <button onClick={() => resetPassword(u)} className="btn-outline btn-sm">Set password</button>
              {u.id !== me.id && <button onClick={() => remove(u)} className="btn-outline btn-sm !text-red-700">Remove</button>}
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-8">
        <h2 className="font-semibold text-ink-900">Add a user</h2>
        <form onSubmit={add} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label><span className="mb-1 block text-sm font-semibold">Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></label>
          <label><span className="mb-1 block text-sm font-semibold">Email</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></label>
          <label><span className="mb-1 block text-sm font-semibold">Role</span>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input">
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Temporary password</span><input required minLength={10} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" /></label>
          <div className="sm:col-span-2"><button type="submit" className="btn-dark">Create account</button></div>
        </form>
      </Card>
    </>
  );
}

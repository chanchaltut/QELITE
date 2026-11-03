import React, { useState } from 'react';
import { api } from '../api';
import { useAdmin } from '../AdminApp';
import { PageTitle, Notice, Card } from '../ui';

export default function Account() {
  const { user } = useAdmin();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState({ tone: '', text: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) return setMsg({ tone: 'error', text: 'The new passwords don’t match.' });
    try {
      await api('/auth/password', { method: 'POST', body: { current: form.current, next: form.next } });
      setForm({ current: '', next: '', confirm: '' });
      setMsg({ tone: 'success', text: 'Password changed. Other devices have been signed out.' });
    } catch (err) {
      setMsg({ tone: 'error', text: err.message });
    }
  };

  return (
    <>
      <PageTitle title="My account" description={`${user.name} · ${user.email} · ${user.role === 'owner' ? 'Owner' : 'Editor'}`} />
      <Card className="max-w-lg">
        <h2 className="font-semibold text-ink-900">Change password</h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          {[
            ['current', 'Current password', 'current-password'],
            ['next', 'New password (10+ characters)', 'new-password'],
            ['confirm', 'Repeat new password', 'new-password'],
          ].map(([k, label, ac]) => (
            <label key={k} className="block">
              <span className="mb-1 block text-sm font-semibold text-ink-900">{label}</span>
              <input type="password" required minLength={k === 'current' ? 1 : 10} autoComplete={ac} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className="input" />
            </label>
          ))}
          {msg.text && <Notice tone={msg.tone}>{msg.text}</Notice>}
          <button type="submit" className="btn-dark">Change password</button>
        </form>
      </Card>
    </>
  );
}

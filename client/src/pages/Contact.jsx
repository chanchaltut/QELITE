import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo, { breadcrumbLd } from '../lib/seo';
import { SITE, filled, fullAddress, hasPhone, hasWhatsapp, waLink } from '../data/site';
import { STANDARDS } from '../data/standards';
import { submitForm } from '../lib/api';
import { PageHero } from '../components/ui';

const TOPICS = [
  ['quote', 'Request a quote'],
  ['general', 'General enquiry'],
  ['transfer', 'Transfer an existing certificate'],
  ['complaint', 'Complaint'],
  ['appeal', 'Appeal a certification decision'],
];
const EMPLOYEE_BANDS = ['1–10', '11–25', '26–65', '66–125', '126–300', '301–1,000', 'More than 1,000'];
const EMPTY = { topic: 'quote', name: '', company: '', email: '', phone: '', standards: [], employees: '', sites: '', message: '' };

function Field({ label, required, children, wide }) {
  return (
    <label className={`block ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="mb-2 block text-sm font-semibold text-ink-900">{label}{required && ' *'}</span>
      {children}
    </label>
  );
}

export default function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');

  // Prefill from links such as /contact?standard=ISO%209001:2015 or ?topic=complaint (after the first render)
  useEffect(() => {
    const topic = params.get('topic');
    const standard = params.get('standard');
    setForm((f) => ({
      ...f,
      topic: TOPICS.some(([v]) => v === topic) ? topic : f.topic,
      standards: standard && !f.standards.includes(standard) ? [...f.standards, standard] : f.standards,
    }));
  }, [params]);

  const isQuote = form.topic === 'quote' || form.topic === 'transfer';
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleStandard = (code) =>
    setForm((f) => ({ ...f, standards: f.standards.includes(code) ? f.standards.filter((c) => c !== code) : [...f.standards, code] }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const topicLabel = TOPICS.find(([v]) => v === form.topic)?.[1];
    const payload = isQuote
      ? { ...form, topic: topicLabel }
      : { topic: topicLabel, name: form.name, company: form.company, email: form.email, phone: form.phone, message: form.message };
    const res = await submitForm(isQuote ? 'quotes' : 'enquiries', payload);
    setStatus(res.ok ? 'done' : 'error');
    if (res.ok) setForm(EMPTY);
  };

  const crumbs = [{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }];
  const cards = [
    { icon: 'ri-mail-line', label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
    hasPhone() && { icon: 'ri-phone-line', label: 'Call', value: SITE.phone.display, href: `tel:${SITE.phone.tel}` },
    hasWhatsapp() && { icon: 'ri-whatsapp-line', label: 'WhatsApp', value: filled(SITE.whatsappDisplay) ? SITE.whatsappDisplay : 'Chat with us', href: waLink(), external: true },
  ].filter(Boolean);
  const address = fullAddress();

  return (
    <>
      <Seo
        title="Contact & Quotes — Request a Certification Quote"
        description={`Request a fixed-fee certification quote from ${SITE.name}, or contact us with a question, complaint or appeal. Email ${SITE.email}.`}
        path="/contact"
        jsonLd={[breadcrumbLd(crumbs), { '@context': 'https://schema.org', '@type': 'ContactPage', name: `Contact ${SITE.name}`, url: `${SITE.url}/contact` }]}
      />
      <PageHero
        crumbs={crumbs}
        eyebrow="Contact & quotes"
        title="Tell us what you"
        accent="need certified."
        intro="Share your standard, headcount and sites. A certification coordinator will reply within one working day with audit days and a fixed fee for the full three-year cycle."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[360px_1fr] lg:gap-10">
          <div className="space-y-3">
            {cards.map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex items-center gap-4 rounded-card bg-paper p-5 transition-colors hover:bg-seal-light"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink-900 bg-white text-xl text-ink-900 transition-colors group-hover:bg-ink-900 group-hover:text-white">
                  <i className={c.icon} />
                </span>
                <span className="min-w-0">
                  <span className="label block">{c.label}</span>
                  <span className="block break-words text-[1.0625rem] font-medium text-ink-900 group-hover:underline">{c.value}</span>
                </span>
              </a>
            ))}

            <div className="on-dark rounded-card bg-ink-900 p-7 text-white">
              <p className="text-sm font-semibold text-seal">{SITE.legalName}</p>
              {address ? <p className="mt-3 font-serif text-[1.375rem] leading-snug text-white">{address}</p> : <p className="mt-3 text-sm text-white/70">Audits are carried out on site across India and remotely where the standard allows.</p>}
              {filled(SITE.hours) && <p className="mt-4 flex items-center gap-2 text-sm text-white/70"><i className="ri-time-line text-seal" /> {SITE.hours}</p>}
              {filled(SITE.address?.mapUrl) && (
                <a href={SITE.address.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm mt-6">
                  <i className="ri-direction-line" /> Get directions
                </a>
              )}
            </div>

            {filled(SITE.address?.mapEmbedUrl) && (
              <div className="aspect-[4/3] overflow-hidden rounded-card bg-paper">
                <iframe title="Office location" src={SITE.address.mapEmbedUrl} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>

          <div className="rounded-panel border border-ink-900 bg-white p-6 sm:p-12">
            <h2 className="h-display text-[2.25rem] leading-[1.05] sm:text-[2.875rem]">
              {isQuote ? <>Request a <em className="italic text-brand-700">quote</em></> : <>Send us a <em className="italic text-brand-700">message</em></>}
            </h2>
            <p className="mt-3 text-sm text-ink-800">Fields marked * are required.</p>

            {status === 'done' ? (
              <div className="mt-8 rounded-card bg-mint p-8 text-center">
                <i className="ri-checkbox-circle-line text-5xl text-brand-700" />
                <p className="mt-3 font-serif text-[1.875rem] leading-tight text-ink-900">Thank you. We’ve received your message.</p>
                <p className="mt-2 text-ink-800">A certification coordinator will reply within one working day.</p>
                <button onClick={() => setStatus('idle')} className="btn-outline mt-6">Send another</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-ink-900">What can we help with?</span>
                  <div className="flex flex-wrap gap-2" role="radiogroup">
                    {TOPICS.map(([v, l]) => (
                      <button type="button" key={v} role="radio" aria-checked={form.topic === v} onClick={() => setForm({ ...form, topic: v })} className={`chip ${form.topic === v ? 'chip-active' : ''}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Full name" required>
                  <input name="name" required value={form.name} onChange={onChange} className="input" autoComplete="name" />
                </Field>
                <Field label="Organisation" required={isQuote}>
                  <input name="company" required={isQuote} value={form.company} onChange={onChange} className="input" autoComplete="organization" />
                </Field>
                <Field label="Email" required>
                  <input name="email" type="email" required value={form.email} onChange={onChange} className="input" autoComplete="email" />
                </Field>
                <Field label="Phone" required={isQuote}>
                  <input name="phone" type="tel" required={isQuote} value={form.phone} onChange={onChange} className="input" autoComplete="tel" />
                </Field>

                {isQuote && (
                  <>
                    <div className="sm:col-span-2">
                      <span className="mb-2 block text-sm font-semibold text-ink-900">Standard(s)</span>
                      <div className="flex flex-wrap gap-2">
                        {STANDARDS.map((s) => (
                          <button type="button" key={s.slug} onClick={() => toggleStandard(s.code)} aria-pressed={form.standards.includes(s.code)} className={`chip code ${form.standards.includes(s.code) ? 'chip-active' : ''}`}>
                            {form.standards.includes(s.code) && <i className="ri-check-line" />}
                            {s.code}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Field label="Number of employees">
                      <select name="employees" value={form.employees} onChange={onChange} className="input">
                        <option value="">Select</option>
                        {EMPLOYEE_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                    <Field label="Number of sites">
                      <input name="sites" type="number" min="1" max="999" value={form.sites} onChange={onChange} className="input" placeholder="1" />
                    </Field>
                  </>
                )}

                <Field label={isQuote ? 'Scope of activities and anything else we should know' : 'Your message'} required={!isQuote} wide>
                  <textarea name="message" required={!isQuote} rows={5} value={form.message} onChange={onChange} className="input resize-none" />
                </Field>

                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-ink-800">By submitting, you agree to our privacy policy.</p>
                  <button type="submit" disabled={status === 'sending'} className="btn-primary !px-7 !py-3.5">
                    {status === 'sending' ? 'Sending…' : isQuote ? 'Request quote' : 'Send message'} <i className="ri-send-plane-line" />
                  </button>
                </div>
                {status === 'error' && (
                  <div className="rounded-card bg-rose/50 p-4 text-sm text-ink-900 sm:col-span-2">
                    <p>We couldn’t send this just now. Your message is still here. Please try again, or email <a href={`mailto:${SITE.email}`} className="text-link">{SITE.email}</a>.</p>
                    {hasWhatsapp() && (
                      <a href={waLink(`Hello ${SITE.name}, I'm ${form.name}${form.company ? ` from ${form.company}` : ''}. ${form.standards.length ? `Standards: ${form.standards.join(', ')}. ` : ''}${form.message}`)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp btn-sm mt-3">
                        <i className="ri-whatsapp-line" /> Send on WhatsApp
                      </a>
                    )}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

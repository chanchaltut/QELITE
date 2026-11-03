import React, { useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const NUMBER_EXAMPLE = 'QMS/26Q00001';

/**
 * Certificate-number search. Submitting always goes to /verify?cert=…, so a result
 * can be bookmarked, shared or opened from the QR code printed on a certificate.
 *
 * variant: 'dark'    on navy (hero, menu)
 *          'light'   on white / porcelain
 *          'compact' small, for the header menu
 */
export default function VerifyForm({ variant = 'light', initial = '', autoFocus = false, onSubmitted, className = '' }) {
  const id = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => setValue(initial), [initial]);

  const submit = (e) => {
    e.preventDefault();
    const number = value.trim();
    if (number.replace(/[^a-z0-9]/gi, '').length < 4) {
      setError('Enter the full certificate number as printed on the certificate.');
      return;
    }
    setError('');
    onSubmitted?.(number);
    navigate(`/verify?cert=${encodeURIComponent(number)}`);
  };

  const dark = variant === 'dark';
  const compact = variant === 'compact';

  return (
    <form onSubmit={submit} className={className} role="search" aria-label="Verify a certificate">
      <label htmlFor={id} className={compact ? 'sr-only' : `mb-2.5 flex items-center gap-2 text-[0.8125rem] font-medium ${dark ? 'text-white/80' : 'text-ink-800'}`}>
        {!compact && <i className={`ri-qr-scan-2-line text-base ${dark ? 'text-seal' : 'text-brand-600'}`} aria-hidden="true" />}
        Certificate number
      </label>
      <div
        className={`flex items-center gap-2 rounded-full p-1.5 transition-shadow focus-within:ring-2 ${
          dark
            ? 'bg-white focus-within:ring-seal'
            : compact
              ? 'bg-white/10 ring-1 ring-white/20 focus-within:ring-seal'
              : 'border border-ink-900 bg-white focus-within:ring-brand-500'
        }`}
      >
        <i className={`ri-search-line pl-3 text-lg ${compact ? 'text-white/70' : 'text-ink-900'}`} aria-hidden="true" />
        <input
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          inputMode="text"
          placeholder={`e.g. ${NUMBER_EXAMPLE}`}
          maxLength={60}
          className={`code min-w-0 flex-1 bg-transparent outline-none ${compact ? 'h-9 text-sm text-white placeholder:text-white/45' : 'h-11 text-[1rem] text-ink-900 placeholder:text-muted sm:h-12'}`}
          aria-describedby={error ? `${id}-err` : undefined}
          aria-invalid={Boolean(error)}
        />
        <button type="submit" className={compact ? 'btn-primary btn-sm' : dark ? 'btn-dark !py-3 sm:!px-7' : 'btn-dark !py-3 sm:!px-7'}>
          Verify
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} className={`mt-2 text-[0.8125rem] ${dark || compact ? 'text-rose' : 'text-red-700'}`}>
          {error}
        </p>
      )}
    </form>
  );
}

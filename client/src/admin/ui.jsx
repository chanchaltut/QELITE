// Small building blocks shared by admin pages.
import React from 'react';

export function PageTitle({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-[2rem] leading-tight tracking-[-0.02em] text-ink-900 sm:text-[2.5rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.9375rem] text-ink-800">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const TONES = {
  info: 'bg-mist',
  success: 'bg-mint',
  warning: 'bg-seal-light',
  error: 'bg-rose/60',
};

export function Notice({ tone = 'info', children, className = '' }) {
  return <div className={`rounded-card px-4 py-3 text-sm text-ink-900 ${TONES[tone]} ${className}`}>{children}</div>;
}

export function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-ink-900 border-t-seal" />
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-panel border border-line bg-white p-5 sm:p-6 ${className}`}>{children}</div>;
}

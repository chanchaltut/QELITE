import React, { useEffect, useRef } from 'react';

/**
 * Centered dialog with backdrop. Closes on Escape, backdrop click or the
 * close button, locks page scroll while open and returns focus afterwards.
 */
export default function Modal({ open, onClose, label, children, className = 'max-w-3xl' }) {
  const panelRef = useRef(null);
  // Keep the latest onClose without re-running the open/close effect (which moves focus)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    // Focus the dialog itself (not a field) so phones don't open the keyboard over it
    panelRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full animate-rise overflow-y-auto rounded-t-panel border border-ink-900 bg-white outline-none sm:rounded-panel ${className}`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-ink-900 bg-white text-lg text-ink-900 transition-colors hover:bg-seal"
          aria-label="Close"
        >
          <i className="ri-close-line" />
        </button>
        {children}
      </div>
    </div>
  );
}

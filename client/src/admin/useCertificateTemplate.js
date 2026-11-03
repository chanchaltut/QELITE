// The certificate design as currently saved in the admin panel (draft), so
// previews and prints reflect edits before they are published. Falls back to
// the design built into the site.
import { useEffect, useState } from 'react';
import { api } from './api';
import { CERTIFICATE } from '../data/certification';
import { SITE } from '../data/site';

let cached = null;

export function useCertificateTemplate() {
  const [state, setState] = useState(cached || { template: CERTIFICATE, siteUrl: SITE.url });
  useEffect(() => {
    if (cached) return;
    Promise.all([api('/admin/content/certificate'), api('/admin/content/settings')])
      .then(([tpl, settings]) => {
        cached = { template: { ...CERTIFICATE, ...tpl.draft }, siteUrl: settings.draft?.url || SITE.url };
        setState(cached);
      })
      .catch(() => {
        /* keep the built-in design */
      });
  }, []);
  return state;
}

/** Forget the cached design (after "Certificate design" is saved). */
export const resetCertificateTemplate = () => {
  cached = null;
};

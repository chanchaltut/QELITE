import React from 'react';
import { isPreview, exitPreview } from '../../lib/content';

/** Shown while an editor previews unpublished changes from the admin panel. */
export default function PreviewBar() {
  if (!isPreview) return null;
  return (
    <div className="no-print sticky top-0 z-[200] bg-brand-800 text-white">
      <div className="container-site flex items-center gap-3 py-2 text-[0.8125rem]">
        <i className="ri-eye-line text-base" aria-hidden="true" />
        <p className="flex-1 font-medium">Preview — you are seeing unpublished changes. Visitors still see the published site.</p>
        <button onClick={exitPreview} className="rounded-full bg-white px-3 py-1 font-semibold text-ink-900 hover:bg-seal">Exit preview</button>
      </div>
    </div>
  );
}

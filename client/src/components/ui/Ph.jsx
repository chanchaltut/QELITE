import React from 'react';
import { SITE } from '../../data/site';
import { isPlaceholder } from '../../lib/format';

/**
 * Renders text that may still be a [placeholder].
 * Demo mode highlights placeholders for content review. On the live site a
 * placeholder renders nothing, and inline blanks such as "No. [__]/2026" read "XX".
 * Wrap optional content in `shown(value) && …` so its label disappears too.
 */
export default function Ph({ children, as = 'span', className = '' }) {
  const Tag = as;
  if (SITE.demoMode && isPlaceholder(children)) {
    return (
      <Tag className={`ph ${className}`} title="Placeholder — to be provided">
        {children}
      </Tag>
    );
  }
  if (isPlaceholder(children)) return null;
  const text = typeof children === 'string' && !SITE.demoMode ? children.replaceAll('[__]', 'XX') : children;
  return className ? <Tag className={className}>{text}</Tag> : <>{text}</>;
}

/** False for a placeholder on the live site, so optional content can be skipped (kept in demo mode for review). */
export const shown = (value) => SITE.demoMode || !isPlaceholder(value);

/** Drops list items whose `key` is still a placeholder. */
export const ready = (items, key) => items.filter((it) => shown(it[key]));

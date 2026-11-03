import React from 'react';

// Rosette of rotated ellipses, like the security engraving on certificates and banknotes.
// Deterministic (no randomness), so prerendered HTML and the browser render match.
const OUTER = Array.from({ length: 36 }, (_, i) => i * 5);
const INNER = Array.from({ length: 24 }, (_, i) => i * 7.5);

export default function Guilloche({ className = '', strokeWidth = 0.6 }) {
  return (
    <svg viewBox="-230 -230 460 460" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
        <circle r="226" />
        <circle r="219" strokeDasharray="2 4" />
        {OUTER.map((a) => (
          <ellipse key={`o${a}`} rx="210" ry="84" transform={`rotate(${a})`} />
        ))}
        {INNER.map((a) => (
          <ellipse key={`i${a}`} rx="118" ry="46" transform={`rotate(${a})`} />
        ))}
        <circle r="44" />
        <circle r="38" strokeDasharray="1.5 3" />
      </g>
    </svg>
  );
}

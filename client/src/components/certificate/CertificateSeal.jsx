import React from 'react';

// QELITE's own round seal, printed on every certificate. It carries only QELITE's
// name and the certified standard. It is not an accreditation mark, and it must not
// be replaced by an ISO or accreditation-body logo unless QELITE is licensed to use one.
const SCALLOPS = 60;

function scallopPath(r, depth) {
  let d = '';
  for (let i = 0; i <= SCALLOPS * 2; i += 1) {
    const a = (i / (SCALLOPS * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? r : r - depth;
    d += `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * radius).toFixed(2)} ${(Math.sin(a) * radius).toFixed(2)}`;
  }
  return `${d}Z`;
}

/** "ISO/IEC 27001:2022" → "ISO/IEC 27001"; "HACCP" stays as it is. */
const shortCode = (standard) => String(standard || '').replace(/:\d{4}$/, '').trim();

export default function CertificateSeal({ standard, id = 'seal', className = 'h-[104px] w-[104px]', color = '#0A6B54' }) {
  const code = shortCode(standard);
  return (
    <svg viewBox="-60 -60 120 120" className={className} role="img" aria-label={`QELITE certification seal${code ? `, ${code}` : ''}`}>
      <defs>
        <path id={`${id}-top`} d="M-41.5 0A41.5 41.5 0 0 1 41.5 0" />
        <path id={`${id}-bottom`} d="M-46.5 0A46.5 46.5 0 0 0 46.5 0" />
      </defs>
      <path d={scallopPath(59, 2.4)} fill="none" stroke={color} strokeWidth="0.8" />
      <circle r="54" fill="none" stroke={color} strokeWidth="1.3" />
      <circle r="51.6" fill="none" stroke={color} strokeWidth="0.35" />
      <circle r="37" fill="none" stroke={color} strokeWidth="0.9" />
      <circle r="35" fill="none" stroke={color} strokeWidth="0.3" strokeDasharray="0.9 1.3" />
      <g fill={color} fontFamily="Geist, Helvetica, Arial, sans-serif" fontWeight="600">
        <text fontSize="7.2" letterSpacing="1.3" textAnchor="middle">
          <textPath href={`#${id}-top`} startOffset="50%">QELITE CERTIFICATION</textPath>
        </text>
        <text fontSize="7.2" letterSpacing="1.9" textAnchor="middle">
          <textPath href={`#${id}-bottom`} startOffset="50%">CERTIFIED</textPath>
        </text>
      </g>
      <circle cx="-43.5" cy="13" r="1.2" fill={color} />
      <circle cx="43.5" cy="13" r="1.2" fill={color} />
      <image href="/qeliteMarkWatermark.svg" x="-19" y="-27" width="38" height="31" preserveAspectRatio="xMidYMid meet" />
      <text
        y="16.5"
        fill={color}
        fontFamily="Geist, Helvetica, Arial, sans-serif"
        fontWeight="700"
        fontSize={code.length > 11 ? 6.5 : 8.6}
        textAnchor="middle"
      >
        {code}
      </text>
    </svg>
  );
}

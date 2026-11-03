import React, { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** QR code drawn as one SVG path (crisp at any size, prints sharply). */
export default function QrCode({ value, className = '', color = '#0B1A2E', label }) {
  const { size, path } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let d = '';
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      }
    }
    return { size: n, path: d };
  }, [value]);

  return (
    <svg viewBox={`-2 -2 ${size + 4} ${size + 4}`} className={className} role="img" aria-label={label || `QR code: ${value}`} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={size + 4} height={size + 4} fill="#fff" />
      <path d={path} fill={color} />
    </svg>
  );
}

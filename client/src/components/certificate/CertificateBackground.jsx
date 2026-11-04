import React from 'react';
import Guilloche from '../ui/Guilloche';

// The printed "security paper" behind a certificate: fine engraved line work,
// a microprinted border and the QELITE mark as a watermark. Everything is vector
// and deterministic, so it stays sharp in print and identical on every certificate.

const W = 794;
const H = 1123;
const EMERALD = '#0A6B54';
const NAVY = '#0B1A2E';

/** A family of fine lines that fan out from a corner, like banknote engraving. */
function engravedFan({ ox, oy, reach, startAngle, sweep, lines = 34 }) {
  const paths = [];
  for (let i = 0; i < lines; i += 1) {
    const t = i / (lines - 1);
    const radius = reach * (0.42 + 0.58 * t);
    let d = '';
    for (let s = 0; s <= 70; s += 1) {
      const a = startAngle + (sweep * s) / 70;
      const wave = Math.sin((s / 70) * Math.PI * 7 + t * 5) * (5 + 14 * t) * Math.sin((s / 70) * Math.PI);
      const r = radius + wave;
      d += `${s === 0 ? 'M' : 'L'}${(ox + Math.cos(a) * r).toFixed(1)} ${(oy + Math.sin(a) * r).toFixed(1)}`;
    }
    paths.push(d);
  }
  return paths.join('');
}

const FAN_TOP = engravedFan({ ox: W, oy: 0, reach: 340, startAngle: Math.PI / 2, sweep: Math.PI / 2 });
const FAN_BOTTOM = engravedFan({ ox: 0, oy: H, reach: 340, startAngle: -Math.PI / 2, sweep: Math.PI / 2 });

const MICRO = 'QELITE CERTIFICATION SERVICES  ·  '.repeat(14);

function MicroLine({ x, y, length, rotate = 0 }) {
  return (
    <text
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      textLength={length}
      lengthAdjust="spacing"
      fontFamily="Geist, Helvetica, Arial, sans-serif"
      fontSize="3.3"
      fontWeight="500"
      fill={NAVY}
    >
      {MICRO}
    </text>
  );
}

function CornerMark({ x, y, rotate }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M0 0H44V1.6H1.6V44H0Z" fill={NAVY} />
      <path d="M6 6H28V6.7H6.7V28H6Z" fill={EMERALD} />
    </g>
  );
}

export default function CertificateBackground() {
  const inset = 22;
  const microInset = 27;
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-white" />

      {/* Central rosette and the QELITE mark as a low-opacity watermark */}
      <div className="absolute left-1/2 top-[50.5%] h-[690px] w-[690px] -translate-x-1/2 -translate-y-1/2" style={{ color: 'rgba(10, 107, 84, 0.07)' }}>
        <Guilloche className="h-full w-full" strokeWidth={0.45} />
      </div>
      <img
        src="/qeliteMarkWatermark.svg"
        alt=""
        className="absolute left-1/2 top-[50.5%] w-[440px] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: 0.075 }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
        <defs>
          <clipPath id="certificate-inner">
            <rect x={inset + 9} y={inset + 9} width={W - (inset + 9) * 2} height={H - (inset + 9) * 2} />
          </clipPath>
        </defs>

        {/* Engraved corner line work, kept inside the frame */}
        <g fill="none" stroke={EMERALD} strokeWidth="0.3" opacity="0.26" clipPath="url(#certificate-inner)">
          <path d={FAN_TOP} />
          <path d={FAN_BOTTOM} />
        </g>

        {/* Frame */}
        <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} fill="none" stroke={NAVY} strokeWidth="1.5" />
        <g opacity="0.72">
          <MicroLine x={microInset} y={microInset + 2} length={W - microInset * 2} />
          <MicroLine x={microInset} y={H - microInset + 1} length={W - microInset * 2} />
          <MicroLine x={microInset - 1} y={microInset + 5} length={H - microInset * 2 - 8} rotate={90} />
          <MicroLine x={W - microInset + 1} y={H - microInset - 3} length={H - microInset * 2 - 8} rotate={-90} />
        </g>
        <rect x={inset + 9} y={inset + 9} width={W - (inset + 9) * 2} height={H - (inset + 9) * 2} fill="none" stroke={EMERALD} strokeWidth="0.6" />

        <CornerMark x={inset + 9} y={inset + 9} rotate={0} />
        <CornerMark x={W - inset - 9} y={inset + 9} rotate={90} />
        <CornerMark x={W - inset - 9} y={H - inset - 9} rotate={180} />
        <CornerMark x={inset + 9} y={H - inset - 9} rotate={-90} />
      </svg>
    </div>
  );
}

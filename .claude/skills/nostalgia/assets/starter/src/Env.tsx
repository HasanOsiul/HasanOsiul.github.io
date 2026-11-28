import React from 'react';
import {C, rng, wind} from './theme';
import {Mango} from './Boy';

/* ---------- SKY ---------- */
export const Sky: React.FC<{t: number; sunY?: number}> = ({t, sunY = 1130}) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.skyTop} />
        <stop offset="0.3" stopColor={C.skyMid} />
        <stop offset="0.5" stopColor={C.skyLow} />
        <stop offset="0.6" stopColor={C.skyHorizon} />
        <stop offset="1" stopColor={C.skyHorizon} />
      </linearGradient>
      <radialGradient id="sunglow">
        <stop offset="0" stopColor="#fff6d6" stopOpacity="1" />
        <stop offset="0.2" stopColor="#ffd98a" stopOpacity="0.8" />
        <stop offset="0.55" stopColor="#ff9a5c" stopOpacity="0.25" />
        <stop offset="1" stopColor="#ff9a5c" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x={-2000} y={-2000} width={5080} height={5000} fill="url(#sky)" />
    {/* stars barely appearing at the top */}
    {rng(3)() &&
      Array.from({length: 26}).map((_, i) => {
        const r = rng(100 + i);
        return <circle key={i} cx={r() * 1080} cy={r() * 380} r={1.2 + r() * 1.4} fill="#fff" opacity={(0.25 + 0.3 * Math.sin(t * 2 + i)) * 0.8} />;
      })}
    <circle cx={950} cy={sunY} r={560} fill="url(#sunglow)" />
    <circle cx={950} cy={sunY} r={64} fill={C.sun} />
    {/* long painted clouds, drifting */}
    {[
      [140, 560, 300, 26, 0.55],
      [700, 640, 360, 20, 0.5],
      [380, 760, 420, 24, 0.6],
      [900, 860, 300, 16, 0.55],
      [200, 930, 260, 12, 0.5],
    ].map(([x, y, w, h, o], i) => {
      const dx = ((t * (6 + i * 2)) % 2000) * 0.5;
      return (
        <g key={i} transform={`translate(${x - w / 2 + dx - 60} ${y})`} opacity={o}>
          <ellipse cx={w / 2} cy={h * 0.5} rx={w / 2} ry={h} fill="#b5607a" />
          <ellipse cx={w / 2 - 10} cy={0} rx={w / 2 - 20} ry={h * 0.8} fill="#f7a57d" />
          <ellipse cx={w / 2 + 30} cy={-h * 0.2} rx={w / 3} ry={h * 0.5} fill="#ffd0a0" opacity={0.7} />
        </g>
      );
    })}
  </g>
);

/* ---------- DISTANT LAND ---------- */
const Palm: React.FC<{x: number; y: number; h: number; t: number; color: string; i: number}> = ({x, y, h, t, color, i}) => {
  const w = wind(t, i) * 3;
  return (
    <g transform={`translate(${x} ${y})`} fill={color} stroke="none">
      <path d={`M -4 0 Q ${8} ${-h * 0.5} ${4 + w} ${-h} L ${10 + w} ${-h} Q ${16} ${-h * 0.5} 4 0 Z`} />
      {[-150, -120, -60, -30, -95, 200].map((a, k) => {
        const rad = ((a + w * 2) * Math.PI) / 180;
        const L = 46;
        const ex = Math.cos(rad) * L;
        const ey = Math.sin(rad) * L * 0.6 + 14;
        return <path key={k} d={`M ${7 + w} ${-h} Q ${7 + w + ex * 0.5} ${-h + ey * 0.2 - 16} ${7 + w + ex} ${-h + ey} Q ${7 + w + ex * 0.5} ${-h + ey * 0.1 - 6} ${7 + w} ${-h} Z`} />;
      })}
    </g>
  );
};

export const FarLand: React.FC<{t: number}> = ({t}) => {
  const r = rng(11);
  let d1 = 'M -400 1190 ';
  for (let x = -400; x <= 1500; x += 40) d1 += `L ${x} ${1120 - r() * 40 - (Math.sin(x / 90) + 1) * 14} `;
  d1 += 'L 1500 1300 L -400 1300 Z';
  const r2 = rng(12);
  let d2 = 'M -400 1200 ';
  for (let x = -400; x <= 1500; x += 55) d2 += `Q ${x + 27} ${1120 - r2() * 50} ${x + 55} ${1160 - r2() * 20} `;
  d2 += 'L 1500 1300 L -400 1300 Z';
  return (
    <g>
      <path d={d1} fill={C.far} opacity={0.75} />
      {[60, 150, 470, 990, 1040].map((x, i) => (
        <Palm key={i} x={x} y={1130} h={130 + (i % 2) * 40} t={t} color={C.far} i={i} />
      ))}
      <path d={d2} fill={C.far2} opacity={0.9} />
      {[20, 940].map((x, i) => (
        <Palm key={i} x={x} y={1170} h={190} t={t} color={C.far2} i={i + 5} />
      ))}
      {/* low mist */}
      <rect x={-400} y={1130} width={1900} height={70} fill="#ffc690" opacity={0.25} />
    </g>
  );
};

/* ---------- HOUSE / YARD ---------- */
export const House: React.FC = () => (
  <g>
    {/* mud wall */}
    <path d="M -120 1010 L 300 1010 L 300 1280 L -120 1280 Z" fill={C.mud} stroke={C.line} strokeWidth={5} />
    <path d="M 220 1010 L 300 1010 L 300 1280 L 220 1280 Z" fill={C.mudShade} opacity={0.5} />
    {/* plinth */}
    <path d="M -130 1270 L 312 1270 L 320 1300 L -130 1300 Z" fill={C.mudShade} stroke={C.line} strokeWidth={5} />
    {/* wooden door */}
    <rect x={60} y={1100} width={86} height={172} fill="#5a3826" stroke={C.line} strokeWidth={5} />
    <line x1={103} y1={1100} x2={103} y2={1272} stroke={C.line} strokeWidth={3} />
    <rect x={60} y={1100} width={86} height={172} fill="#000" opacity={0.25} />
    {/* window with bars */}
    <rect x={-60} y={1110} width={70} height={64} fill="#2a1a14" stroke={C.line} strokeWidth={5} />
    {[-44, -28, -12, 4].map((x) => (
      <line key={x} x1={x} y1={1112} x2={x} y2={1172} stroke="#7a5a40" strokeWidth={4} />
    ))}
    <rect x={-56} y={1114} width={62} height={56} fill="#ffb25a" opacity={0.25} />
    {/* tin roof */}
    <path d="M -150 1020 L 330 1020 L 270 920 L -100 920 Z" fill={C.tin} stroke={C.line} strokeWidth={5} strokeLinejoin="round" />
    {Array.from({length: 16}).map((_, i) => (
      <line key={i} x1={-130 + i * 30} y1={1018} x2={-92 + i * 23.5} y2={922} stroke="#6e4639" strokeWidth={3} />
    ))}
    <path d="M -150 1020 L 330 1020" stroke="#d68a60" strokeWidth={4} />
    <path d="M -100 920 L 270 920 L 330 1020" stroke="#f0a070" strokeWidth={3} fill="none" opacity={0.7} />
    {/* clay pot */}
    <g transform="translate(200 1262)">
      <ellipse cx={0} cy={0} rx={30} ry={34} fill="#b35a32" stroke={C.line} strokeWidth={4} />
      <rect x={-12} y={-44} width={24} height={14} fill="#a04e2a" stroke={C.line} strokeWidth={4} />
      <ellipse cx={10} cy={-8} rx={8} ry={14} fill="#e98a5a" opacity={0.6} />
    </g>
  </g>
);

export const HayStack: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -80 0 Q -90 -90 -30 -120 L 0 -170 L 30 -120 Q 90 -90 80 0 Z" fill="#c9954a" stroke={C.line} strokeWidth={5} />
    <path d="M -60 -30 Q 0 -50 60 -30 M -50 -70 Q 0 -90 50 -70" stroke="#a87634" strokeWidth={4} fill="none" />
    <line x1={0} y1={-170} x2={0} y2={-200} stroke={C.line} strokeWidth={6} />
    <path d="M 20 -120 Q 80 -90 80 0 L 40 0 Z" fill="#ffcf80" opacity={0.35} />
  </g>
);

export const Ground: React.FC = () => {
  const r = rng(21);
  return (
    <g>
      <defs>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2a56a" />
          <stop offset="0.35" stopColor={C.ground} />
          <stop offset="1" stopColor={C.groundDark} />
        </linearGradient>
      </defs>
      <rect x={-1000} y={1178} width={3080} height={2000} fill="url(#ground)" />
      {/* swept-earth strokes of the uthan */}
      {Array.from({length: 46}).map((_, i) => {
        const x = r() * 1300 - 100;
        const y = 1220 + r() * 680;
        const w = 30 + r() * 80;
        return <path key={i} d={`M ${x} ${y} q ${w / 2} ${-4} ${w} 0`} stroke="#9b6238" strokeWidth={3} opacity={0.35} fill="none" />;
      })}
      {/* bamboo fence in the back */}
      <g opacity={0.9}>
        {Array.from({length: 18}).map((_, i) => (
          <line key={i} x1={330 + i * 22} y1={1186} x2={330 + i * 22} y2={1120 + (i % 3) * 6} stroke="#8a6440" strokeWidth={7} strokeLinecap="round" />
        ))}
        <line x1={320} y1={1140} x2={730} y2={1140} stroke="#6e4c30" strokeWidth={6} />
        <line x1={320} y1={1162} x2={730} y2={1162} stroke="#6e4c30" strokeWidth={6} />
      </g>
    </g>
  );
};

/* ---------- MANGO TREE ---------- */
type Cl = [number, number, number];
export const CANOPY: Cl[] = [
  [640, 880, 190],
  [460, 960, 150],
  [830, 940, 170],
  [560, 1060, 140],
  [760, 1070, 130],
  [920, 1040, 110],
  [370, 1050, 100],
  [690, 760, 140],
];
type Leaf = {x: number; y: number; a: number; s: number; c: string; cl: number};
const LEAVES: Leaf[] = (() => {
  const r = rng(5);
  const out: Leaf[] = [];
  CANOPY.forEach(([cx, cy, rad], cl) => {
    const n = Math.round(rad * 0.55);
    for (let i = 0; i < n; i++) {
      const ang = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * rad;
      const x = cx + Math.cos(ang) * d;
      const y = cy + Math.sin(ang) * d * 0.85;
      const lit = (x - cx) / rad + (cy - y) / rad; // upper-right is lit
      const v = lit + (r() - 0.5) * 0.8;
      const c = v > 0.9 ? C.leafRim : v > 0.2 ? C.leafLight : v > -0.5 ? C.leafMid : C.leafDark;
      out.push({x, y, a: r() * 180, s: 0.8 + r() * 0.6, c, cl});
    }
  });
  return out.sort((a, b) => (a.c === C.leafDark ? -1 : 0) - (b.c === C.leafDark ? -1 : 0));
})();

export const MANGOES: [number, number][] = [
  [520, 1150],
  [690, 1160],
  [860, 1120],
  [430, 1080],
  [960, 1110],
  [610, 1000],
];

export const Canopy: React.FC<{t: number; hideMango?: number}> = ({t, hideMango = -1}) => (
  <g>
    {CANOPY.map(([x, y, r], i) => (
      <ellipse key={i} cx={x} cy={y} rx={r * 0.95} ry={r * 0.8} fill={C.leafDark} />
    ))}
    {MANGOES.map(([x, y], i) => {
      if (i === hideMango) return null;
      const sw = Math.sin(t * 1.6 + i) * 4;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${sw}) translate(0 26) scale(0.3)`}>
          <Mango id={`cm${i}`} />
        </g>
      );
    })}
    {LEAVES.map((l, i) => {
      const [cx, cy] = CANOPY[l.cl];
      const w = wind(t, l.cl);
      const dx = (w * 6 + Math.sin(t * 3 + i * 0.37) * 2) * ((cy + 200 - l.y) / 300);
      const rot = l.a + Math.sin(t * 2.3 + i) * 6 - w * 5;
      return (
        <g key={i} transform={`translate(${l.x + dx} ${l.y}) rotate(${rot}) scale(${l.s})`}>
          <path d="M -24 0 Q 0 -10 24 0 Q 0 10 -24 0 Z" fill={l.c} stroke={C.line} strokeWidth={1.6} strokeOpacity={0.6} />
        </g>
      );
    })}
  </g>
);

export const Trunk: React.FC<{t: number}> = ({t}) => {
  const sway = Math.sin(t * 1.2) * 1.5;
  return (
    <g>
      {/* sitting branch going right */}
      <path d={`M 640 1270 C 720 1230 820 1190 ${960 + sway} 1160`} stroke={C.line} strokeWidth={44} fill="none" strokeLinecap="round" />
      <path d={`M 640 1270 C 720 1230 820 1190 ${960 + sway} 1160`} stroke={C.bark} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M 660 1250 C 730 1222 820 1186 ${940 + sway} 1158`} stroke={C.barkLight} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
      {/* main trunk */}
      <path d="M 560 1590 C 600 1480 590 1380 610 1260 L 600 1100 L 680 1100 L 676 1260 C 690 1380 700 1480 720 1590 Z" fill={C.bark} stroke={C.line} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 665 1580 C 660 1480 660 1380 662 1270" stroke={C.barkLight} strokeWidth={10} fill="none" opacity={0.6} strokeLinecap="round" />
      <path d="M 590 1500 q 12 -30 4 -60 M 630 1420 q 8 -20 2 -50 M 610 1330 q 10 -24 4 -44" stroke={C.barkDark} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* upward branches */}
      {[
        'M 612 1150 C 560 1060 480 1010 430 980',
        'M 640 1120 C 650 1000 670 900 690 800',
        'M 668 1140 C 740 1060 800 1010 860 960',
      ].map((d, i) => (
        <g key={i}>
          <path d={d} stroke={C.line} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d={d} stroke={C.bark} strokeWidth={26} fill="none" strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};

export const TreeShadow: React.FC = () => (
  <g opacity={0.28}>
    <ellipse cx={330} cy={1610} rx={380} ry={46} fill="#4a2618" />
    <ellipse cx={600} cy={1592} rx={110} ry={18} fill="#4a2618" />
  </g>
);

/* ---------- BIRDS ---------- */
export const Birds: React.FC<{t: number; start?: number}> = ({t, start = 0}) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const tt = t - start - i * 0.25;
      const x = 1200 - tt * 90 - i * 30;
      const y = 520 + i * 22 + Math.sin(tt * 1.2 + i) * 10 - tt * 8;
      const flap = Math.sin(tt * 9 + i) * 8;
      return <path key={i} d={`M ${x - 16} ${y - flap} Q ${x - 7} ${y - 6} ${x} ${y} Q ${x + 7} ${y - 6} ${x + 16} ${y - flap}`} stroke="#3b2238" strokeWidth={3.5} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

/* ---------- FLOATING DUST IN GOLDEN LIGHT ---------- */
export const Dust: React.FC<{t: number; n?: number; seed?: number; scale?: number}> = ({t, n = 40, seed = 9, scale = 1}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const bx = r() * 1080;
        const by = r() * 1920;
        const sp = 8 + r() * 18;
        const x = (bx - t * sp * 1.5 + 2160) % 1080;
        const y = by + Math.sin(t * 0.8 + i) * 30 - t * sp * 0.4;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.5 + i * 2.1));
        return <circle key={i} cx={x} cy={((y % 1920) + 1920) % 1920} r={(1.5 + r() * 3) * scale} fill="#ffe7a8" opacity={0.55 * tw} />;
      })}
    </g>
  );
};

/* ---------- POST: grade, rays, grain, vignette, line boil ---------- */
export const Post: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="grade" x1="1" y1="0.3" x2="0" y2="1">
        <stop offset="0" stopColor="#ffb36b" stopOpacity="0.32" />
        <stop offset="0.6" stopColor="#ff7a6b" stopOpacity="0.08" />
        <stop offset="1" stopColor="#4a2d6b" stopOpacity="0.32" />
      </linearGradient>
      <radialGradient id="vig" cx="0.5" cy="0.48" r="0.75">
        <stop offset="0.55" stopColor="#1a0d14" stopOpacity="0" />
        <stop offset="1" stopColor="#1a0d14" stopOpacity="0.6" />
      </radialGradient>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 7} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <linearGradient id="ray" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffe2a0" stopOpacity="0" />
        <stop offset="0.5" stopColor="#ffe2a0" stopOpacity="0.16" />
        <stop offset="1" stopColor="#ffe2a0" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#grade)" style={{mixBlendMode: 'soft-light'}} />
    <g style={{mixBlendMode: 'screen'}} opacity={0.75 + 0.25 * Math.sin(frame / 40)}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-200 + i * 260} y={-400} width={110 + i * 30} height={2800} fill="url(#ray)" transform={`rotate(${28 + i * 3} 900 600)`} />
      ))}
    </g>
    <rect width={1080} height={1920} filter="url(#grain)" opacity={0.13} style={{mixBlendMode: 'overlay'}} />
    <rect width={1080} height={1920} fill="url(#vig)" />
  </svg>
);

export const BoilDefs: React.FC<{frame: number}> = ({frame}) => (
  <defs>
    <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed={Math.floor(frame / 4) % 5} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);

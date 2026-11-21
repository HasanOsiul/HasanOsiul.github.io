import React from 'react';
import {random} from 'remotion';
import {noise, theme} from './theme';

/* ================================================================ ghost face close-up */
export const GhostFaceBig: React.FC<{m: number; mouth: number; t: number; pupils?: number}> = ({m, mouth, t, pupils = 1}) => {
  const jx = noise(t * 2, 'gfx') * 6;
  const faceH = 760 * (1 + 0.12 * m);
  const eyeRx = 70 + 46 * m;
  const eyeRy = 50 + 52 * m;
  const pj = noise(t * 9, 'pj') * 4 * pupils;
  const mh = 30 + 300 * mouth + 60 * m;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="gfShade" cx="0.45" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#d6ddd2" />
          <stop offset="0.55" stopColor="#9aa59a" />
          <stop offset="1" stopColor="#2c332e" />
        </radialGradient>
        <radialGradient id="eyeSock">
          <stop offset="0.55" stopColor="#1a0b0b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#1a0b0b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mouthIn" cx="0.5" cy="0.4">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#2a0405" />
        </radialGradient>
        <radialGradient id="rim" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="#030405" />
      <g transform={`translate(${540 + jx},${790}) rotate(${-6 + 4 * m + noise(t * 1.5, 'gfr') * 2})`}>
        {/* hair mass */}
        <path d={`M-420,-560 Q-560,0 -470,${700} L470,${720} Q560,0 410,-560 Q0,-760 -420,-560 Z`} fill="#050404" />
        {/* face */}
        <path
          d={`M0,${-faceH / 2} C 300,${-faceH / 2} 330,-60 290,${120 + 40 * m} C 250,${faceH / 2 - 60} 120,${faceH / 2 + 20 * m} ${10 + 20 * m},${faceH / 2 + 30 * m} C -120,${faceH / 2} -260,${faceH / 2 - 80} -300,100 C -330,-80 -290,${-faceH / 2} 0,${-faceH / 2} Z`}
          fill="url(#gfShade)"
        />
        {/* veins & bruises */}
        <path d="M-210,-150 q-30,60 -10,120 q15,40 -20,90 M220,-100 q40,50 10,120 q-20,40 15,80 M-60,-330 q30,40 0,80" stroke="#4d5f6a" strokeWidth={4} fill="none" opacity={0.45 + 0.4 * m} />
        <ellipse cx={-200} cy={180} rx={80} ry={50} fill="#4a3a48" opacity={0.25 + 0.2 * m} />
        {/* forehead wound */}
        <path d="M-120,-330 l40,40 l-10,30 l35,25 l-5,45 M-80,-290 l-50,15" stroke={theme.color.blood} strokeWidth={7} fill="none" opacity={0.9} />
        <path d="M-95,-270 q-5,120 -20,220" stroke={theme.color.blood} strokeWidth={5} fill="none" opacity={0.6} />
        {/* eye sockets */}
        {[
          [-140, -70 - 8 * m],
          [140, -60 + 10 * m],
        ].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={eyeRx + 60} ry={eyeRy + 55} fill="url(#eyeSock)" />
            <ellipse cx={x} cy={y} rx={eyeRx} ry={eyeRy} fill="#e8e4d6" />
            {/* red veins */}
            {[0, 1, 2, 3, 4].map((k) => {
              const a = (k / 5) * Math.PI * 2 + i;
              return (
                <path
                  key={k}
                  d={`M${x + Math.cos(a) * eyeRx * 0.95},${y + Math.sin(a) * eyeRy * 0.95} q${-Math.cos(a) * 12},${-Math.sin(a) * 18} ${-Math.cos(a) * eyeRx * 0.45},${-Math.sin(a) * eyeRy * 0.4}`}
                  stroke="#a0161b"
                  strokeWidth={2.5}
                  fill="none"
                  opacity={0.7}
                />
              );
            })}
            <circle cx={x + pj + (i ? -6 : 6)} cy={y + 4} r={11 - 3 * m} fill="#000" />
            <ellipse cx={x} cy={y} rx={eyeRx} ry={eyeRy} fill="none" stroke="#120505" strokeWidth={6} />
          </g>
        ))}
        {/* nose shadow */}
        <path d="M-10,0 q-25,90 -30,130 q25,15 55,5" stroke="#3a443d" strokeWidth={6} fill="none" opacity={0.6} />
        {/* mouth */}
        <g transform={`translate(${10 + 20 * m},${250 + 30 * m}) rotate(${-5 - 5 * m})`}>
          <ellipse cx={0} cy={mh / 2 - 20} rx={70 + 40 * m + 20 * mouth} ry={mh / 2} fill="url(#mouthIn)" stroke="#2b0607" strokeWidth={6} />
          {mouth > 0.25 &&
            [-40, -12, 16, 42].map((x, k) => (
              <rect key={k} x={x - 10} y={-18} width={20} height={14 + (k % 2) * 6} fill="#8b8d7d" opacity={0.7} rx={3} />
            ))}
          <path d={`M${-60 - 30 * m},-10 q-20,${80 + 60 * m} 0,${160 + 120 * m}`} stroke={theme.color.blood} strokeWidth={5} fill="none" opacity={0.5 + 0.4 * mouth} />
        </g>
        {/* hair strands over face */}
        {Array.from({length: 9}).map((_, i) => {
          const x0 = -260 + i * 65 + random(`hx${i}`) * 30;
          const sw = noise(t * 0.8 + i, `hsw${i}`) * 20;
          return (
            <path
              key={i}
              d={`M${x0},${-faceH / 2 - 40} Q${x0 + sw + (i % 2 ? 40 : -40)},${-100} ${x0 + sw * 1.5 + (i - 4) * 18},${faceH / 2 + 120}`}
              stroke="#050404"
              strokeWidth={i % 3 === 0 ? 16 : 7}
              fill="none"
              strokeLinecap="round"
              opacity={i === 4 || i === 3 ? 0 : 0.95}
            />
          );
        })}
        <path d="M-330,-420 Q-120,-520 0,-430 Q140,-520 330,-420 Q200,-380 120,-300 Q0,-400 -140,-300 Q-220,-380 -330,-420 Z" fill="#050404" />
      </g>
      <rect width={1080} height={1920} fill="url(#rim)" />
    </svg>
  );
};

/* ================================================================ girl face close-up */
export const GirlFace: React.FC<{fear: number; t: number; mouth?: number; blink?: number; look?: number; lightL?: number}> = ({
  fear,
  t,
  mouth = 0.2,
  blink = 0,
  look = 0,
  lightL = 1,
}) => {
  const tr = fear * 3;
  const jx = noise(t * 7, 'gfj') * tr;
  const jy = noise(t * 7, 'gfjy') * tr;
  const pupilR = 34 - fear * 18;
  const lidOpen = (1 - blink) * (1 + fear * 0.25);
  const mo = mouth + noise(t * 10, 'mtr') * 0.06 * fear;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="gskin" cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#f0ddd0" />
          <stop offset="0.6" stopColor="#c9ad9e" />
          <stop offset="1" stopColor="#4c3f3c" />
        </radialGradient>
        <radialGradient id="iris" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#6b4a35" />
          <stop offset="1" stopColor="#1a100b" />
        </radialGradient>
        <linearGradient id="sideLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity={0.25 * lightL} />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <g transform={`translate(${540 + jx},${980 + jy})`}>
        {/* hair back */}
        <path d="M-380,-420 Q-470,100 -400,520 L400,520 Q470,100 380,-420 Q0,-640 -380,-420 Z" fill="#0a0a0d" />
        {/* neck + uniform */}
        <rect x={-95} y={300} width={190} height={260} fill="#b39888" />
        <path d="M-520,980 L-460,560 Q-200,470 0,520 Q200,470 460,560 L520,980 Z" fill="#121a2a" />
        <path d="M-150,500 L0,640 L150,500 L110,470 L0,560 L-110,470 Z" fill="#e8e6e0" />
        <path d="M-60,560 L0,600 L60,560 L80,660 L0,620 L-80,660 Z" fill="#8b1a22" />
        {/* face */}
        <path d="M0,-400 C250,-400 330,-200 320,0 C310,220 170,380 0,400 C-170,380 -310,220 -320,0 C-330,-200 -250,-400 0,-400 Z" fill="url(#gskin)" />
        {/* eyes */}
        {[-135, 135].map((x, i) => {
          const ex = x + look * 18;
          return (
            <g key={i}>
              <ellipse cx={x} cy={-20} rx={92} ry={68 * lidOpen} fill="#f4f1ec" />
              <clipPath id={`eye${i}`}>
                <ellipse cx={x} cy={-20} rx={92} ry={68 * lidOpen} />
              </clipPath>
              <g clipPath={`url(#eye${i})`}>
                <circle cx={ex + noise(t * 12, `pj${i}`) * fear * 5} cy={-16} r={56 - fear * 14} fill="url(#iris)" />
                <circle cx={ex + noise(t * 12, `pj${i}`) * fear * 5} cy={-16} r={pupilR * 0.6} fill="#050302" />
                <circle cx={ex - 18} cy={-40} r={12} fill="#fff" opacity={0.9} />
                <circle cx={ex + 16} cy={0} r={6} fill="#fff" opacity={0.7} />
              </g>
              <path d={`M${x - 100},${-20 - 50 * lidOpen} Q${x},${-20 - 95 * lidOpen} ${x + 100},${-20 - 50 * lidOpen}`} stroke="#0b0806" strokeWidth={12} fill="none" strokeLinecap="round" />
              {/* worried brow */}
              <path
                d={i === 0 ? `M${x - 90},${-150 + fear * 10} Q${x},${-190 - fear * 20} ${x + 80},${-185 - fear * 45}` : `M${x + 90},${-150 + fear * 10} Q${x},${-190 - fear * 20} ${x - 80},${-185 - fear * 45}`}
                stroke="#1a1210"
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {/* nose + mouth */}
        <path d="M-6,70 q-14,50 6,62" stroke="#8a6c5e" strokeWidth={6} fill="none" />
        <ellipse cx={0} cy={235} rx={48 + mo * 14} ry={10 + mo * 60} fill="#3a1414" />
        <ellipse cx={0} cy={235 + mo * 30} rx={26 + mo * 8} ry={4 + mo * 22} fill="#7a2a2a" opacity={0.6} />
        {/* blush of fear / sweat / tears */}
        <ellipse cx={-210} cy={110} rx={60} ry={24} fill="#c35a5a" opacity={0.15} />
        <ellipse cx={210} cy={110} rx={60} ry={24} fill="#c35a5a" opacity={0.15} />
        {fear > 0.35 && <path d={`M250,-230 q-22,40 0,60 q22,-20 0,-60 Z`} fill="#cfe8ff" opacity={0.75} transform={`translate(0,${(t * 30) % 60})`} />}
        {fear > 0.7 && <path d={`M-150,50 q-8,${60 + ((t * 40) % 80)} 0,${120 + ((t * 40) % 80)}`} stroke="#bfe0ff" strokeWidth={8} fill="none" opacity={0.7} />}
        {/* bangs */}
        <path d="M-360,-260 Q-300,-460 0,-470 Q300,-460 360,-260 L300,-140 L250,-230 L180,-130 L120,-240 L40,-120 L-30,-235 L-110,-120 L-170,-235 L-240,-130 L-300,-220 Z" fill="#0a0a0d" />
        <path d="M-380,-260 Q-400,0 -330,300 L-290,300 Q-330,0 -310,-220 Z" fill="#0a0a0d" />
        <path d="M380,-260 Q400,0 330,300 L290,300 Q330,0 310,-220 Z" fill="#0a0a0d" />
        <rect x={-560} y={-700} width={1120} height={1700} fill="url(#sideLight)" />
      </g>
    </svg>
  );
};

/* ================================================================ trembling pointing hand (POV) */
export const PointingHand: React.FC<{t: number; tremble: number; extend: number}> = ({t, tremble, extend}) => {
  const jx = noise(t * 14, 'hx') * tremble * 10;
  const jy = noise(t * 14, 'hy') * tremble * 10;
  const ang = 15 + (1 - extend) * 30;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${230 + jx + (1 - extend) * -150},${1850 + jy + (1 - extend) * 500}) rotate(${ang}) scale(1.5)`}>
        {/* sleeve */}
        <rect x={-110} y={-130} width={220} height={900} rx={90} fill="#121a2a" />
        <rect x={-120} y={-160} width={240} height={80} rx={30} fill="#0d1320" />
        {/* hand */}
        <g transform="translate(0,-300)">
          <ellipse cx={0} cy={120} rx={105} ry={130} fill="#d7bfae" />
          {/* curled fingers */}
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={40 + i * 6} cy={50 + i * 55} rx={70} ry={30} fill="#c9ae9b" stroke="#a88c7b" strokeWidth={4} />
          ))}
          {/* thumb */}
          <ellipse cx={-80} cy={80} rx={34} ry={80} fill="#cdb3a1" transform="rotate(-25,-80,80)" />
          {/* index finger extended */}
          <rect x={-30} y={-280} width={56} height={330} rx={28} fill="#d9c2b2" />
          <ellipse cx={-2} cy={-262} rx={20} ry={18} fill="#ecd9cd" />
          <line x1={-26} y1={-120} x2={22} y2={-120} stroke="#b29482" strokeWidth={3} />
          <line x1={-26} y1={-30} x2={22} y2={-30} stroke="#b29482" strokeWidth={3} />
        </g>
      </g>
    </svg>
  );
};

/* ================================================================ crowd ring (POV lying on the road) */
export const CrowdRing: React.FC<{t: number; focus: number}> = ({t, focus}) => {
  const people = [
    {a: -100, s: 1.15, c: '#1a1c22', face: true, woman: true},
    {a: -40, s: 1.0, c: '#20232a', face: true},
    {a: 20, s: 1.1, c: '#16181d', face: false},
    {a: 80, s: 0.95, c: '#22252c', face: true},
    {a: 150, s: 1.05, c: '#1b1d23', face: false},
    {a: 215, s: 1.1, c: '#1f2229', face: true},
  ];
  const rot = t * 3;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <radialGradient id="skyGlow" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.9" />
          <stop offset="0.15" stopColor="#c58c4a" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#13202a" stopOpacity="1" />
          <stop offset="1" stopColor="#05080b" stopOpacity="1" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#skyGlow)" />
      {/* wires across the sky */}
      <path d="M-100,500 Q540,700 1200,420" stroke="#050607" strokeWidth={7} fill="none" />
      <path d="M-100,620 Q540,800 1200,560" stroke="#050607" strokeWidth={5} fill="none" />
      <g transform={`rotate(${rot}, 540, 900)`}>
        {people.map((p, i) => {
          const r = 520;
          const x = 540 + Math.cos((p.a * Math.PI) / 180) * r;
          const y = 900 + Math.sin((p.a * Math.PI) / 180) * r * 1.05;
          const lean = Math.sin(t * 0.8 + i) * 3;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${p.a - 90 + lean}) scale(${p.s * 1.25})`}>
              {/* shoulders */}
              <ellipse cx={0} cy={180} rx={330} ry={170} fill={p.c} />
              {/* head (seen from below) */}
              <ellipse cx={0} cy={-20} rx={150} ry={175} fill={p.woman ? '#2a2422' : '#1c1a1a'} />
              {p.face && (
                <g opacity={0.55}>
                  <ellipse cx={0} cy={10} rx={110} ry={130} fill="#8d7a6e" />
                  <ellipse cx={-38} cy={-10} rx={14} ry={8} fill="#1a1414" />
                  <ellipse cx={38} cy={-10} rx={14} ry={8} fill="#1a1414" />
                  <path d="M-30,70 Q0,58 30,70" stroke="#3a2a2a" strokeWidth={6} fill="none" />
                  <path d="M-55,-45 L-20,-38 M55,-45 L20,-38" stroke="#2a1a1a" strokeWidth={6} />
                </g>
              )}
              {p.woman && <path d="M-160,-40 Q-170,140 -120,200 M160,-40 Q170,140 120,200" stroke="#120f0e" strokeWidth={40} fill="none" />}
            </g>
          );
        })}
      </g>
      <rect width={1080} height={1920} fill="#000" opacity={0.35 * (1 - focus)} />
    </svg>
  );
};

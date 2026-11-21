import React from 'react';
import {random} from 'remotion';
import {ei, noise, theme} from './theme';

/* Flashback art: silhouettes in warm sepia rooms. Nothing graphic is shown. */

const Mother: React.FC<{kneel?: number; sob?: number; t: number; tint?: string}> = ({kneel = 1, sob = 0, t, tint = '#1a120c'}) => {
  const shake = sob * Math.sin(t * 22) * 6;
  return (
    <g transform={`translate(0,${shake * 0.5})`}>
      {/* kneeling body */}
      <path d={`M-120,0 Q-160,-180 -90,-${360 + (1 - kneel) * 200} L90,-${360 + (1 - kneel) * 200} Q150,-180 140,0 Z`} fill={tint} />
      <path d={`M-70,-${360 + (1 - kneel) * 200} Q0,-${420 + (1 - kneel) * 200} 70,-${360 + (1 - kneel) * 200} L60,-${300 + (1 - kneel) * 200} L-60,-${300 + (1 - kneel) * 200} Z`} fill={tint} />
      {/* head with long hair */}
      <g transform={`translate(${shake},${-470 - (1 - kneel) * 200 + sob * 40}) rotate(${sob * 18})`}>
        <ellipse cx={0} cy={0} rx={62} ry={74} fill={tint} />
        <path d="M-60,-10 Q-80,120 -50,190 L50,190 Q80,120 60,-10 Z" fill={tint} />
      </g>
    </g>
  );
};

const Child: React.FC<{t: number; bob?: number; tint?: string}> = ({t, bob = 1, tint = '#1a120c'}) => {
  const b = Math.abs(Math.sin(t * 4)) * 10 * bob;
  return (
    <g transform={`translate(0,${-b})`}>
      <path d="M-55,0 L-45,-150 Q0,-175 45,-150 L55,0 Z" fill={tint} />
      <circle cx={0} cy={-205} r={52} fill={tint} />
      <circle cx={-52} cy={-235} r={18} fill={tint} />
      <circle cx={52} cy={-235} r={18} fill={tint} />
    </g>
  );
};

const Man: React.FC<{tint?: string; step: number}> = ({tint = '#120c08', step}) => (
  <g>
    <rect x={-95} y={-760} width={190} height={420} rx={50} fill={tint} />
    <circle cx={0} cy={-830} r={70} fill={tint} />
    <rect x={-80} y={-380} width={70} height={380} fill={tint} transform={`rotate(${Math.sin(step) * 10}, -45, -380)`} />
    <rect x={10} y={-380} width={70} height={380} fill={tint} transform={`rotate(${-Math.sin(step) * 10}, 45, -380)`} />
    <rect x={70} y={-740} width={50} height={330} rx={25} fill={tint} transform="rotate(-25, 95, -740)" />
  </g>
);

const RoomBG: React.FC<{light: number; t: number}> = ({light, t}) => (
  <g>
    <rect width={1080} height={1920} fill="#6a4a2c" />
    {/* window */}
    <rect x={560} y={420} width={420} height={620} fill={`rgb(${40 + light * 140},${35 + light * 110},${30 + light * 60})`} />
    <line x1={770} y1={420} x2={770} y2={1040} stroke="#1a110a" strokeWidth={14} />
    <line x1={560} y1={730} x2={980} y2={730} stroke="#1a110a" strokeWidth={14} />
    <rect x={540} y={400} width={460} height={660} fill="none" stroke="#1a110a" strokeWidth={30} />
    {/* lamp glow */}
    <circle cx={260} cy={520} r={520} fill="url(#warm)" opacity={0.7 + 0.05 * Math.sin(t * 3)} />
    <rect x={0} y={1380} width={1080} height={540} fill="#3d2a18" />
    <line x1={0} y1={1380} x2={1080} y2={1380} stroke="#3a2818" strokeWidth={6} />
    {/* hanging mobile */}
    <line x1={300} y1={0} x2={300} y2={360} stroke="#3a2a1a" strokeWidth={4} />
    <g transform={`rotate(${Math.sin(t * 0.9) * 8}, 300, 360)`}>
      <line x1={200} y1={360} x2={400} y2={360} stroke="#3a2a1a" strokeWidth={4} />
      <circle cx={200} cy={410} r={22} fill="#5a3d24" />
      <path d="M400,385 l15,30 l-30,0 Z" fill="#5a3d24" />
    </g>
  </g>
);

export const BackRoom: React.FC<{t: number}> = ({t}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <defs>
      <radialGradient id="warm">
        <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.6" />
        <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="#3d2a18" />
    <g transform="translate(0,-250)">
    <RoomBG light={0.55} t={t} />
    <g transform="translate(400,1500)">
      <Mother t={t} />
    </g>
    <g transform="translate(640,1500)">
      <Child t={t} />
    </g>
    {/* holding hands */}
    <path d={`M470,1180 Q560,${1240 - Math.abs(Math.sin(t * 4)) * 10} 610,${1330 - Math.abs(Math.sin(t * 4)) * 10}`} stroke="#1a120c" strokeWidth={30} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

/** father leads child out; door closes at tClose; mother collapses */
export const BackDoor: React.FC<{t: number; tClose: number}> = ({t, tClose}) => {
  const walk = ei(t, [0, tClose], [0, 1], theme.ease.slow);
  const door = ei(t, [tClose - 0.25, tClose], [1, 0], theme.ease.in);
  const sob = t > tClose + 1.2 ? 1 : 0;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="doorLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffdca0" />
          <stop offset="1" stopColor="#a8783e" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="#35251a" />
      <g transform="translate(0,-230)">
      <rect width={1080} height={1920} fill="#5a3f25" />
      {/* doorway */}
      <rect x={560} y={560} width={360} height={880} fill="url(#doorLight)" opacity={0.35 + 0.65 * door} />
      <rect x={560} y={560} width={360 * (1 - door)} height={880} fill="#3a2614" />
      <rect x={545} y={545} width={390} height={900} fill="none" stroke="#120c07" strokeWidth={30} />
      <rect x={0} y={1440} width={1080} height={480} fill="#35251a" />
      {/* father + child walking into the light */}
      {door > 0.02 && (
        <g opacity={door}>
          <g transform={`translate(${700 + walk * 110},${1440 - walk * 40}) scale(${1 - walk * 0.35})`}>
            <Man step={t * 5} />
          </g>
          <g transform={`translate(${590 + walk * 130},${1440 - walk * 30}) scale(${0.9 - walk * 0.3})`}>
            <Child t={t} bob={0.6} />
          </g>
        </g>
      )}
      {/* mother reaching / collapsing */}
      <g transform={`translate(260,1560) scale(1.25)`}>
        <Mother t={t} kneel={1} sob={sob} />
      </g>
      {t < tClose + 1 && (
        <path d={`M330,${1000} Q${450 + walk * 40},${960} ${520 + walk * 30},${1010}`} stroke="#1a120c" strokeWidth={34} fill="none" strokeLinecap="round" />
      )}
      </g>
    </svg>
  );
};

/** day after day at the window: time-lapse light cycle + rain */
export const BackWindow: React.FC<{t: number; dur: number}> = ({t, dur}) => {
  const cyc = (Math.sin((t / dur) * Math.PI * 2 * 3) + 1) / 2;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <rect width={1080} height={1920} fill="#4a3420" />
      <rect x={140} y={300} width={800} height={1000} fill={`rgb(${30 + cyc * 160},${28 + cyc * 120},${30 + cyc * 70})`} />
      {/* rain streaks on glass */}
      {Array.from({length: 40}).map((_, i) => {
        const x = 150 + random(`rx${i}`) * 780;
        const y0 = 300 + ((t * (300 + random(`rs${i}`) * 300) + random(`ry${i}`) * 1000) % 1000);
        return <line key={i} x1={x} y1={y0} x2={x - 6} y2={Math.min(1300, y0 + 70)} stroke="#d8c9b0" strokeWidth={2} opacity={0.35} />;
      })}
      <line x1={540} y1={300} x2={540} y2={1300} stroke="#0f0a06" strokeWidth={22} />
      <rect x={120} y={280} width={840} height={1040} fill="none" stroke="#0f0a06" strokeWidth={40} />
      {/* mother silhouette seated, still */}
      <g transform="translate(540,1620) scale(1.5)">
        <Mother t={t} kneel={1} sob={0.15} tint="#0d0805" />
      </g>
      {/* photo in her hands */}
      <rect x={470} y={1200} width={90} height={110} fill="#d8c3a0" opacity={0.85} transform="rotate(-8, 515, 1255)" />
      <circle cx={515} cy={1245} r={22} fill="#4a3826" transform="rotate(-8, 515, 1255)" />
    </svg>
  );
};

/** tall apartment tower in rain; camera tilts up (tilt in px) */
export const BackTower: React.FC<{t: number; tilt: number; figure: number}> = ({t, tilt, figure}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
    <rect width={1080} height={1920} fill="#0a0907" />
    <g transform={`translate(0,${tilt})`}>
      <rect x={0} y={-3000} width={1080} height={5200} fill="#0f0d0a" />
      {/* tower */}
      <rect x={250} y={-2700} width={580} height={4600} fill="#1c1813" />
      {Array.from({length: 46}).map((_, r) =>
        Array.from({length: 5}).map((__, c) => {
          const lit = random(`tw${r}-${c}`) < 0.18;
          return <rect key={`${r}-${c}`} x={285 + c * 110} y={-2620 + r * 98} width={70} height={52} fill={lit ? '#c99a5a' : '#0d0b09'} opacity={lit ? 0.7 : 1} />;
        }),
      )}
      <text x={540} y={-2560} fill="#5a4c3a" fontSize={64} textAnchor="middle" fontFamily={theme.font.koDisplay}>
        101동
      </text>
      {/* rooftop figure (tiny, pinkish) */}
      <g transform="translate(700,-2700)" opacity={figure}>
        <rect x={-10} y={-70} width={20} height={50} fill="#8a5f66" />
        <circle cx={0} cy={-84} r={12} fill="#120c0a" />
        <path d="M-12,-80 Q-16,-40 -8,-30 L8,-30 Q16,-40 12,-80 Z" fill="#120c0a" />
        <rect x={-9} y={-22} width={7} height={22} fill="#8a5f66" />
        <rect x={2} y={-22} width={7} height={22} fill="#8a5f66" />
      </g>
      <rect x={0} y={1900} width={1080} height={400} fill="#0b0a08" />
    </g>
    {/* rain */}
    {Array.from({length: 90}).map((_, i) => {
      const x = random(`trx${i}`) * 1200 - 60;
      const y = ((t * 2400 + random(`try${i}`) * 1920) % 2100) - 100;
      return <line key={i} x1={x} y1={y} x2={x - 18} y2={y + 90} stroke="#cdbfa8" strokeWidth={2} opacity={0.3} />;
    })}
    <rect width={1080} height={1920} fill="#000" opacity={0.15 + 0.1 * noise(t * 2, 'tw')} />
  </svg>
);

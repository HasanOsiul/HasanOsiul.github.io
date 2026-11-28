import React from 'react';
import {C, wind} from './theme';

export type Expr = {
  eyeOpen: number; // 0..1.3
  eyeMode: 'open' | 'happy' | 'squeeze';
  look: [number, number]; // -1..1
  sparkle: number; // 0..1
  brow: number; // -1 sad/sour .. 1 raised
  mouth: 'small' | 'soft' | 'o' | 'smile' | 'grin' | 'bite' | 'chew' | 'pucker' | 'effort';
  mouthOpen: number;
  blush: number;
  puff: number; // cheek puff while chewing
};

export const baseExpr: Expr = {
  eyeOpen: 1,
  eyeMode: 'open',
  look: [0, 0],
  sparkle: 0,
  brow: 0,
  mouth: 'small',
  mouthOpen: 0.5,
  blush: 0.3,
  puff: 0,
};

const LW = 5;

/* ---------------- HAIR ---------------- */
const Tuft: React.FC<{x: number; y: number; rot: number; len: number; w: number; bend: number}> = ({x, y, rot, len, w, bend}) => {
  const tipX = bend * len * 0.55;
  const d = `M ${-w} 0 Q ${-w * 0.7 + tipX * 0.3} ${-len * 0.55} ${tipX} ${-len} Q ${w * 0.5 + tipX * 0.45} ${-len * 0.45} ${w} 0 Z`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={d} fill={C.hair} stroke={C.line} strokeWidth={LW * 0.8} strokeLinejoin="round" />
    </g>
  );
};

const Lumps: React.FC<{l: [number, number, number][]}> = ({l}) => (
  <g>
    {l.map(([x, y, r], i) => (
      <circle key={`o${i}`} cx={x} cy={y} r={r} fill={C.hair} stroke={C.line} strokeWidth={LW * 2} />
    ))}
    {l.map(([x, y, r], i) => (
      <circle key={`f${i}`} cx={x} cy={y} r={r} fill={C.hair} />
    ))}
  </g>
);

const Hair: React.FC<{t: number; turn: number; front: boolean}> = ({t, turn, front}) => {
  const ox = turn * 12;
  if (!front) {
    const l: [number, number, number][] = [];
    const n = 9;
    for (let i = 0; i < n; i++) {
      const a = ((-195 + (i / (n - 1)) * 210) * Math.PI) / 180;
      const w = wind(t, i);
      const lift = Math.max(0, -Math.sin(a)); // top lumps move more
      l.push([Math.cos(a) * 88 + ox - w * 7 * lift, Math.sin(a) * 78 - 34 - w * 2 * lift, 30 + (i % 2) * 6]);
    }
    l.push([ox, -50, 80]);
    // loose strands blowing on top
    const strands = [-40, 0, 36].map((x, i) => {
      const w = wind(t + 0.3, i + 40);
      return <Tuft key={i} x={x + ox} y={-124} rot={-20 - w * 22} len={30 + i * 6} w={13} bend={-0.6 - w * 0.4} />;
    });
    return (
      <g>
        {strands}
        <Lumps l={l} />
      </g>
    );
  }
  // fringe: bumpy cap over forehead whose lumps sway in the wind
  const l: [number, number, number][] = [];
  [-78, -46, -14, 18, 50, 80].forEach((x, i) => {
    const w = wind(t + 0.1, i + 20);
    l.push([x * 0.95 + turn * 16 - w * 4, -82 + Math.abs(x) * 0.25 + Math.sin(t * 3 + i) * 1.5, 20 + (i % 2) * 4]);
  });
  l.push([turn * 14, -104, 62]);
  l.push([-64 + turn * 10, -84, 34]);
  l.push([66 + turn * 10, -84, 34]);
  const w0 = wind(t, 50);
  return (
    <g>
      <Lumps l={l} />
      {/* swoosh highlights */}
      <path d={`M ${-46 + ox} -116 Q ${-6 + ox - w0 * 4} -134 ${36 + ox} -120`} stroke={C.hairHi} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M ${-72 + ox} -92 q 14 -10 26 -6 M ${32 + ox} -94 q 14 -8 26 0`} stroke={C.hairHi} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};

/* ---------------- EYES ---------------- */
const Eye: React.FC<{x: number; e: Expr; side: -1 | 1}> = ({x, e, side}) => {
  if (e.eyeMode === 'happy') {
    return <path d={`M ${x - 24} 4 Q ${x} -24 ${x + 24} 4`} stroke={C.line} strokeWidth={7} fill="none" strokeLinecap="round" />;
  }
  if (e.eyeMode === 'squeeze') {
    const s = side; // > for left eye, < for right eye
    return (
      <path
        d={`M ${x - 18 * s} -14 L ${x + 14 * s} -2 L ${x - 18 * s} 10`}
        stroke={C.line}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  const ry = 38 * Math.max(0.06, e.eyeOpen);
  const rx = 33 * (0.92 + 0.08 * Math.min(1.3, e.eyeOpen));
  const pr = 8 + e.sparkle * 4;
  const px = x + e.look[0] * 13;
  const py = -6 + e.look[1] * 14 * Math.min(1, e.eyeOpen);
  return (
    <g>
      <ellipse cx={x} cy={-6} rx={rx} ry={ry} fill={C.eyeWhite} stroke={C.line} strokeWidth={LW} />
      {e.eyeOpen > 0.25 && (
        <g>
          <ellipse cx={px} cy={py} rx={pr} ry={pr * 1.15} fill={C.pupil} />
          <circle cx={px - pr * 0.35} cy={py - pr * 0.45} r={2.6 + e.sparkle * 1.6} fill="#fff" />
          {e.sparkle > 0.05 && <circle cx={px + pr * 0.4} cy={py + pr * 0.35} r={1.6 * e.sparkle} fill="#fff" />}
        </g>
      )}
    </g>
  );
};

/* ---------------- MOUTH ---------------- */
const Mouth: React.FC<{e: Expr; t: number}> = ({e, t}) => {
  const o = e.mouthOpen;
  switch (e.mouth) {
    case 'o':
      return (
        <g>
          <ellipse cx={0} cy={0} rx={11 + o * 4} ry={6 + o * 13} fill={C.mouth} stroke={C.line} strokeWidth={LW * 0.9} />
          <ellipse cx={0} cy={4 + o * 7} rx={7} ry={3 + o * 3} fill={C.tongue} />
        </g>
      );
    case 'soft':
      return <path d={`M -18 -2 Q 0 ${9 + o * 4} 18 -2`} stroke={C.line} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    case 'smile':
      return <path d={`M -26 -6 Q 0 ${16 + o * 10} 26 -6`} stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />;
    case 'grin':
      return (
        <g>
          <path d={`M -32 -8 Q 0 -12 32 -8 Q 26 ${22 + o * 18} 0 ${26 + o * 18} Q -26 ${22 + o * 18} -32 -8 Z`} fill={C.mouth} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
          <path d={`M -26 -6 Q 0 -9 26 -6 L 24 2 Q 0 0 -24 2 Z`} fill={C.teeth} />
          <ellipse cx={0} cy={14 + o * 14} rx={14} ry={6 + o * 3} fill={C.tongue} />
        </g>
      );
    case 'bite': {
      const h = 6 + o * 30;
      return (
        <g>
          <ellipse cx={0} cy={h * 0.3} rx={22 + o * 10} ry={h} fill={C.mouth} stroke={C.line} strokeWidth={LW} />
          <path d={`M ${-16 - o * 6} ${-h * 0.62} Q 0 ${-h * 0.45} ${16 + o * 6} ${-h * 0.62} L ${14 + o * 6} ${-h * 0.42} Q 0 ${-h * 0.3} ${-14 - o * 6} ${-h * 0.42} Z`} fill={C.teeth} />
          <path d={`M ${-12 - o * 5} ${h * 1.12} Q 0 ${h * 1.0} ${12 + o * 5} ${h * 1.12} L ${10 + o * 4} ${h * 0.96} Q 0 ${h * 0.88} ${-10 - o * 4} ${h * 0.96} Z`} fill={C.teeth} />
        </g>
      );
    }
    case 'chew': {
      const c = Math.sin(t * 7);
      return <path d={`M -16 ${c * 2} q 8 ${-5 - c * 3} 16 0 q 8 ${5 + c * 3} 16 0`} transform={`translate(${-2 + c * 3} 0)`} stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />;
    }
    case 'pucker':
      return (
        <g>
          <path d="M -14 0 q 5 -7 9 0 q 5 7 9 0 q 5 -7 9 0" transform="translate(-4 0)" stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
      );
    case 'effort':
      return (
        <g>
          <path d="M -18 -2 Q 0 6 18 -4" stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 4 1 Q 12 14 18 2" fill={C.tongue} stroke={C.line} strokeWidth={4} />
        </g>
      );
    default:
      return <path d={`M -11 0 Q 0 ${4 + o * 4} 11 0`} stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />;
  }
};

/* ---------------- HEAD ---------------- */
export const Head: React.FC<{e: Expr; t: number; turn?: number; tilt?: number; id: string}> = ({e, t, turn = 0, tilt = 0, id}) => {
  const fx = turn * 22; // feature shift for 3/4 turn
  const browY = -50 - e.brow * 10 + (e.eyeMode === 'squeeze' ? 10 : 0);
  const browTilt = e.brow < 0 ? -e.brow * 16 : 0;
  return (
    <g transform={`rotate(${tilt})`}>
      <defs>
        <filter id={`blur-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <clipPath id={`face-${id}`}>
          <path d="M -101 -10 C -101 -75 -55 -102 0 -102 C 55 -102 101 -75 101 -10 C 101 55 62 104 0 104 C -62 104 -101 55 -101 -10 Z" />
        </clipPath>
      </defs>
      <Hair t={t} turn={turn} front={false} />
      {/* ears */}
      <g>
        <ellipse cx={-100 + turn * 12} cy={8} rx={20} ry={25} fill={C.skin} stroke={C.line} strokeWidth={LW} />
        <path d={`M ${-104 + turn * 12} 0 q 8 6 0 16`} stroke={C.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={100 + turn * 12} cy={8} rx={20} ry={25} fill={C.skin} stroke={C.line} strokeWidth={LW} />
        <path d={`M ${104 + turn * 12} 0 q -8 6 0 16`} stroke={C.skinShade} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      {/* face */}
      <path d="M -101 -10 C -101 -75 -55 -102 0 -102 C 55 -102 101 -75 101 -10 C 101 55 62 104 0 104 C -62 104 -101 55 -101 -10 Z" fill={C.skin} stroke={C.line} strokeWidth={LW} />
      <g clipPath={`url(#face-${id})`}>
        {/* warm rim light from the sun (right) and shade on left */}
        <ellipse cx={-120} cy={40} rx={70} ry={130} fill={C.skinShade} opacity={0.45} filter={`url(#blur-${id})`} />
        <ellipse cx={110} cy={-10} rx={34} ry={110} fill="#ffb36b" opacity={0.55} filter={`url(#blur-${id})`} />
        {/* blush */}
        <ellipse cx={-60 + fx} cy={34} rx={28 + e.puff * 6} ry={17 + e.puff * 5} fill={C.blush} opacity={0.18 + 0.5 * e.blush} filter={`url(#blur-${id})`} />
        <ellipse cx={62 + fx} cy={34} rx={28 + e.puff * 10} ry={17 + e.puff * 8} fill={C.blush} opacity={0.18 + 0.5 * e.blush} filter={`url(#blur-${id})`} />
        {false &&
          [-1, 1].map((s) => (
            <g key={s} opacity={(e.blush - 0.6) * 2.2} stroke="#d8333a" strokeWidth={3} strokeLinecap="round">
              <line x1={s * 60 + fx - 12} y1={40} x2={s * 60 + fx - 4} y2={28} />
              <line x1={s * 60 + fx} y1={40} x2={s * 60 + fx + 8} y2={28} />
              <line x1={s * 60 + fx + 12} y1={40} x2={s * 60 + fx + 20} y2={28} />
            </g>
          ))}
      </g>
      {/* cheek puff outline while chewing */}
      {e.puff > 0.05 && (
        <path d={`M 96 ${10} Q ${104 + e.puff * 12} 40 84 66`} stroke={C.line} strokeWidth={LW} fill={C.skin} opacity={Math.min(1, e.puff * 1.5)} />
      )}
      <Eye x={-40 + fx} e={e} side={-1} />
      <Eye x={40 + fx} e={e} side={1} />
      {/* nose */}
      <path d={`M ${-3 + fx * 1.2} 24 Q ${3 + fx * 1.2} 33 ${9 + fx * 1.2} 25`} stroke={C.line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <g transform={`translate(${fx * 1.1} 58)`}>
        <Mouth e={e} t={t} />
      </g>
      <Hair t={t} turn={turn} front />
      {/* brows */}
      <g stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round">
        <path d={`M ${-54 + fx} ${browY + browTilt * 0.1} Q ${-40 + fx} ${browY - 9} ${-24 + fx} ${browY - browTilt}`} />
        <path d={`M ${24 + fx} ${browY - browTilt} Q ${40 + fx} ${browY - 9} ${54 + fx} ${browY + browTilt * 0.1}`} />
      </g>
    </g>
  );
};

/* ---------------- LIMBS ---------------- */
export const ik = (sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, bend: 1 | -1) => {
  const dx = tx - sx;
  const dy = ty - sy;
  let d = Math.hypot(dx, dy);
  d = Math.min(d, l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const cosB = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const b = Math.acos(Math.max(-1, Math.min(1, cosB)));
  const ang = a + b * bend;
  return [sx + Math.cos(ang) * l1, sy + Math.sin(ang) * l1] as [number, number];
};

export const Limb: React.FC<{pts: [number, number][]; w: number; color: string}> = ({pts, w, color}) => {
  const p = pts.map((q) => q.join(',')).join(' ');
  return (
    <g>
      <polyline points={p} stroke={C.line} strokeWidth={w + LW * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={p} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

/* ---------------- MANGO ---------------- */
export const MANGO_PATH = 'M0,-70 C 45,-72 62,-20 55,25 C 48,70 10,85 -15,75 C -50,62 -58,10 -45,-30 C -35,-60 -20,-70 0,-70Z';
const BITES: [number, number, number][][] = [
  [
    [-6, -76, 22],
    [-32, -62, 20],
  ],
  [
    [44, -52, 24],
    [22, -70, 22],
    [58, -26, 20],
  ],
  [
    [62, 4, 22],
    [56, 30, 22],
    [40, 52, 20],
  ],
];
export const Mango: React.FC<{id: string; bites?: number; salt?: number; leaf?: boolean}> = ({id, bites = 0, salt = 0, leaf = false}) => {
  const bs = BITES.slice(0, Math.floor(bites)).flat();
  const s = rngStatic(7);
  return (
    <g>
      <defs>
        <radialGradient id={`mg-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={C.mangoLight} />
          <stop offset="0.55" stopColor={C.mango} />
          <stop offset="1" stopColor={C.mangoDark} />
        </radialGradient>
        <mask id={`mk-${id}`}>
          <rect x={-120} y={-120} width={240} height={240} fill="#fff" />
          {bs.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r + 7} fill="#000" />
          ))}
        </mask>
        <clipPath id={`mc-${id}`}>
          <path d={MANGO_PATH} />
        </clipPath>
        <mask id={`mf-${id}`}>
          <rect x={-120} y={-120} width={240} height={240} fill="#fff" />
          {bs.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#000" />
          ))}
        </mask>
      </defs>
      {/* stem */}
      <path d="M 0 -70 Q 4 -86 12 -96" stroke={C.barkDark} strokeWidth={6} fill="none" strokeLinecap="round" />
      {leaf && <path d="M 10 -92 Q 50 -120 90 -96 Q 50 -80 10 -92 Z" fill={C.leafMid} stroke={C.line} strokeWidth={3.5} />}
      {/* flesh visible at bite edges */}
      <g mask={`url(#mf-${id})`} clipPath={`url(#mc-${id})`}>
        <path d={MANGO_PATH} fill={C.flesh} stroke={C.line} strokeWidth={LW * 2} />
        {salt > 0 &&
          bs.map(([x, y, r], i) =>
            Array.from({length: 10}).map((_, k) => {
              const a = s[(i * 10 + k) % s.length] * Math.PI * 2;
              const rr = r + 3 + s[(i * 10 + k + 3) % s.length] * 5;
              return (
                <circle
                  key={`${i}-${k}`}
                  cx={x + Math.cos(a) * rr}
                  cy={y + Math.sin(a) * rr}
                  r={1.8 + (k % 3)}
                  fill={['#6e3f24', '#9c6a44', '#c9a27a'][k % 3]}
                  opacity={Math.min(1, salt * 1.5 - (k % 4) * 0.12)}
                />
              );
            }),
          )}
      </g>
      <g mask={`url(#mk-${id})`}>
        <path d={MANGO_PATH} fill={`url(#mg-${id})`} stroke={C.line} strokeWidth={LW} />
        <path d="M -30 -40 Q -40 0 -28 40" stroke="#fff" strokeOpacity={0.35} strokeWidth={9} fill="none" strokeLinecap="round" />
        {s.slice(0, 14).map((v, i) => (
          <circle key={i} cx={-40 + v * 80} cy={-50 + s[(i + 5) % s.length] * 110} r={1.6} fill="#d8e88a" opacity={0.7} />
        ))}
      </g>
      {/* outline of the bite edges */}
      {bs.map(([x, y, r], i) => (
        <g key={i} mask={`url(#mk-${id})`} />
      ))}
    </g>
  );
};
function rngStatic(seed: number) {
  const out: number[] = [];
  let a = seed;
  for (let i = 0; i < 64; i++) {
    a = (a * 9301 + 49297) % 233280;
    out.push(a / 233280);
  }
  return out;
}

/* ---------------- HAND (close-up) ---------------- */
// palm-facing-viewer hand, fingers curl 0..1, wraps an object at origin
export const Hand: React.FC<{curl: number; back?: boolean; noArm?: boolean}> = ({curl, noArm}) => {
  // fist seen from the side: forearm from below, fingers wrap horizontally over the held object
  const open = 1 - curl;
  return (
    <g>
      {!noArm && <path d="M -30 40 C -34 120 -30 200 -26 300 L 30 300 C 34 200 40 120 36 40 Z" fill={C.skin} stroke={C.line} strokeWidth={LW} />}
      {!noArm && <path d="M 18 70 C 22 140 22 210 20 290" stroke={C.skinShade} strokeWidth={8} fill="none" opacity={0.5} strokeLinecap="round" />}
      <ellipse cx={0} cy={36} rx={46} ry={40} fill={C.skin} stroke={C.line} strokeWidth={LW} />
      {[0, 1, 2, 3].map((i) => {
        const y = -14 + i * 18;
        const len = [48, 52, 48, 40][i];
        const x1 = -40;
        const x2 = x1 + len * (0.5 + 0.5 * curl) + open * 10;
        const yy = y - open * (30 + i * 4);
        return (
          <g key={i}>
            <line x1={x1} y1={y + 8} x2={x2} y2={yy} stroke={C.line} strokeWidth={18 + LW * 2} strokeLinecap="round" />
            <line x1={x1} y1={y + 8} x2={x2} y2={yy} stroke={i % 2 ? C.skin : C.skinLight} strokeWidth={18} strokeLinecap="round" />
          </g>
        );
      })}
      <line x1={36} y1={40} x2={44 - curl * 10} y2={-12 - open * 10} stroke={C.line} strokeWidth={20 + LW * 2} strokeLinecap="round" />
      <line x1={36} y1={40} x2={44 - curl * 10} y2={-12 - open * 10} stroke={C.skin} strokeWidth={20} strokeLinecap="round" />
    </g>
  );
};

/* ---------------- FULL BODY ---------------- */
export type Pose = {
  lHand: [number, number];
  rHand: [number, number];
  lFoot: [number, number];
  rFoot: [number, number];
  hip?: number; // hip y (default 290)
  sitting?: boolean;
};

export const standPose: Pose = {
  lHand: [-78, 268],
  rHand: [78, 268],
  lFoot: [-31, 468],
  rFoot: [31, 468],
};

export const Boy: React.FC<{
  pose: Pose;
  e: Expr;
  t: number;
  id: string;
  turn?: number;
  tilt?: number;
  layer?: 'all' | 'back' | 'front';
  rItem?: React.ReactNode;
  lItem?: React.ReactNode;
  headOffset?: [number, number];
}> = ({pose, e, t, id, turn = 0, tilt = 0, layer = 'all', rItem, lItem, headOffset = [0, 0]}) => {
  const hipY = pose.hip ?? 290;
  const lHip: [number, number] = [-28, hipY];
  const rHip: [number, number] = [28, hipY];
  const lKnee = ik(lHip[0], lHip[1], pose.lFoot[0], pose.lFoot[1], 92, 90, pose.sitting ? -1 : 1);
  const rKnee = ik(rHip[0], rHip[1], pose.rFoot[0], pose.rFoot[1], 92, 90, pose.sitting ? 1 : -1);
  const lSh: [number, number] = [-60, 118];
  const rSh: [number, number] = [60, 118];
  const lEl = ik(lSh[0], lSh[1], pose.lHand[0], pose.lHand[1], 82, 78, 1);
  const rEl = ik(rSh[0], rSh[1], pose.rHand[0], pose.rHand[1], 82, 78, -1);
  const sleeve = (sh: [number, number], el: [number, number]): [number, number][] => [sh, [sh[0] + (el[0] - sh[0]) * 0.55, sh[1] + (el[1] - sh[1]) * 0.55]];

  const back = (
    <g>
      {/* legs */}
      {[
        [lHip, lKnee, pose.lFoot],
        [rHip, rKnee, pose.rFoot],
      ].map(([h, k, f], i) => (
        <g key={i}>
          <Limb pts={[h as [number, number], k as [number, number], f as [number, number]]} w={30} color={C.skin} />
          <ellipse cx={(f as number[])[0] + (i ? 8 : -8)} cy={(f as number[])[1] + 6} rx={24} ry={12} fill={C.skin} stroke={C.line} strokeWidth={LW} />
        </g>
      ))}
      {/* shorts */}
      <path
        d={`M -60 ${hipY - 62} L 60 ${hipY - 62} L ${rHip[0] + (rKnee[0] - rHip[0]) * 0.45 + 26} ${rHip[1] + (rKnee[1] - rHip[1]) * 0.45 + 4} L ${rHip[0] + (rKnee[0] - rHip[0]) * 0.45 - 22} ${rHip[1] + (rKnee[1] - rHip[1]) * 0.45 + 10} L 0 ${hipY + 4} L ${lHip[0] + (lKnee[0] - lHip[0]) * 0.45 + 22} ${lHip[1] + (lKnee[1] - lHip[1]) * 0.45 + 10} L ${lHip[0] + (lKnee[0] - lHip[0]) * 0.45 - 26} ${lHip[1] + (lKnee[1] - lHip[1]) * 0.45 + 4} Z`}
        fill={C.shorts}
        stroke={C.line}
        strokeWidth={LW}
        strokeLinejoin="round"
      />
      {/* torso / shirt */}
      <path d={`M -62 112 Q 0 96 62 112 L 66 ${hipY - 40} Q 0 ${hipY - 26} -66 ${hipY - 40} Z`} fill={C.shirt} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
      {[-36, -12, 12, 36].map((x) => (
        <line key={x} x1={x} y1={108} x2={x * 1.06} y2={hipY - 32} stroke={C.shirtStripe} strokeWidth={5} opacity={0.55} />
      ))}
      <path d={`M -66 ${hipY - 40} Q 0 ${hipY - 26} 66 ${hipY - 40} L 64 ${hipY - 56} Q 0 ${hipY - 44} -64 ${hipY - 56} Z`} fill={C.shirtShade} opacity={0.6} />
      {/* collar */}
      <path d="M -26 104 L 0 132 L 26 104" fill={C.shirtStripe} stroke={C.line} strokeWidth={LW * 0.8} strokeLinejoin="round" />
      <path d="M 0 132 L 0 200" stroke={C.line} strokeWidth={3} />
      <circle cx={2} cy={152} r={3.5} fill={C.line} />
      <circle cx={2} cy={180} r={3.5} fill={C.line} />
      {/* neck */}
      <rect x={-16} y={88} width={32} height={22} fill={C.skinShade} stroke={C.line} strokeWidth={LW * 0.8} />
    </g>
  );

  const arms = (
    <g>
      {[
        [lSh, lEl, pose.lHand, lItem],
        [rSh, rEl, pose.rHand, rItem],
      ].map(([s, el, h, item], i) => (
        <g key={i}>
          <Limb pts={[s as [number, number], el as [number, number], h as [number, number]]} w={26} color={C.skin} />
          <Limb pts={sleeve(s as [number, number], el as [number, number])} w={40} color={C.shirt} />
          {item ? <g transform={`translate(${(h as number[])[0]} ${(h as number[])[1]})`}>{item as React.ReactNode}</g> : null}
          <circle cx={(h as number[])[0]} cy={(h as number[])[1]} r={17} fill={C.skin} stroke={C.line} strokeWidth={LW} />
        </g>
      ))}
    </g>
  );

  const head = (
    <g transform={`translate(${headOffset[0]} ${headOffset[1]})`}>
      <Head e={e} t={t} turn={turn} tilt={tilt} id={id} />
    </g>
  );

  if (layer === 'back') return back;
  if (layer === 'front')
    return (
      <g>
        {arms}
        {head}
      </g>
    );
  return (
    <g>
      {back}
      {head}
      {arms}
    </g>
  );
};

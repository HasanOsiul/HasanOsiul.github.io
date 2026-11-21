import React from 'react';
import {random} from 'remotion';
import {flicker, theme} from './theme';
import {CharDefs} from './characters';

/**
 * A true 2.5D projected Seoul back-alley (Bongcheon-dong style villas,
 * utility poles with tangled wires, sodium street lamps, Hangul signs).
 * World units: X/Y are pixels at depth 1; Z is depth. Camera can dolly (z),
 * truck (x), crane (h) and tilt (vpY) -> real parallax for every layer.
 */
export type Cam = {z: number; x: number; h: number; vpY: number};
export type Actor = {X: number; Z: number; node: (s: number) => React.ReactNode; shadow?: number};

type Item = {d: number; el: React.ReactNode};

const LEFT_X = -1100;
const RIGHT_WALL = 1100;
const RIGHT_BLD = 1750;
const POLE_X = 980;
const LAMP_STEP = 6;

type Block = {z0: number; z1: number; h: number; tone: number; sign?: string; signColor?: string};

const SIGNS: [string, string][] = [
  ['봉천동', '#ff3b3b'],
  ['편의점', '#4fe0ff'],
  ['세탁소', '#ffd23b'],
  ['약국', '#5bff8a'],
  ['PC방', '#ff5bd1'],
  ['노래방', '#ff3b3b'],
  ['부동산', '#4fe0ff'],
];

const makeBlocks = (side: string): Block[] => {
  const out: Block[] = [];
  let z = -2;
  let i = 0;
  while (z < 700) {
    const len = 2.5 + random(`${side}len${i}`) * 4;
    const gap = random(`${side}gap${i}`) < 0.3 ? 0.7 : 0.05;
    const hasSign = side === 'L' && random(`${side}sign${i}`) < 0.55;
    const s = SIGNS[i % SIGNS.length];
    out.push({
      z0: z,
      z1: z + len,
      h: (side === 'L' ? 3600 : 3200) + random(`${side}h${i}`) * 5200,
      tone: random(`${side}t${i}`),
      sign: hasSign ? s[0] : undefined,
      signColor: s[1],
    });
    z += len + gap;
    i++;
  }
  return out;
};
const LB = makeBlocks('L');
const RB = makeBlocks('R');

export const Street: React.FC<{
  cam: Cam;
  frame: number;
  actors?: Actor[];
  fog?: number;
  flickRate?: number;
  bursts?: number[];
  lampLevel?: (i: number, f: number) => number; // override multiplier
  dark?: number;
}> = ({cam, frame, actors = [], fog = 0.5, flickRate = 0.08, bursts, lampLevel, dark = 0}) => {
  const P = (X: number, Y: number, Z: number) => {
    const dz = Math.max(Z - cam.z, 0.12);
    return {x: 540 + (X - cam.x) / dz, y: cam.vpY + (cam.h - Y) / dz, s: 1 / dz, dz};
  };
  const pts = (arr: [number, number, number][]) =>
    arr
      .map(([X, Y, Z]) => {
        const p = P(X, Y, Z);
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');
  const near = cam.z + 0.12;
  const items: Item[] = [];

  // ---------- left villas
  LB.forEach((b, bi) => {
    if (b.z1 < near || b.z0 - cam.z > 110) return;
    const z0 = Math.max(b.z0, near);
    const shade = 14 + b.tone * 16;
    const col = `rgb(${shade + 4},${shade + 8},${shade + 12})`;
    const d = (z0 + b.z1) / 2 - cam.z;
    const els: React.ReactNode[] = [];
    els.push(
      <polygon key="f" points={pts([[LEFT_X, 0, z0], [LEFT_X, b.h, z0], [LEFT_X, b.h, b.z1], [LEFT_X, 0, b.z1]])} fill={col} />,
    );
    // front face (visible through gaps)
    if (b.z0 > near) {
      els.push(
        <polygon key="ff" points={pts([[LEFT_X, 0, b.z0], [LEFT_X, b.h, b.z0], [LEFT_X - 2600, b.h, b.z0], [LEFT_X - 2600, 0, b.z0]])} fill={`rgb(${shade - 4},${shade},${shade + 4})`} />,
      );
    }
    // windows
    for (let fl = 0; 1900 + fl * 1700 + 900 < b.h; fl++) {
      const y0 = 1900 + fl * 1700;
      for (let wz = b.z0 + 0.4; wz + 0.7 < b.z1 - 0.2; wz += 1.25) {
        if (wz < near) continue;
        const r = random(`w${bi}-${fl}-${Math.round(wz * 10)}`);
        const lit = r < 0.32;
        const warm = r < 0.22;
        const blink = lit && random(`wb${bi}${fl}${Math.round(wz * 10)}`) < 0.06 ? (Math.sin(frame / 7 + wz) > 0.6 ? 0.2 : 1) : 1;
        els.push(
          <polygon
            key={`w${fl}-${wz}`}
            points={pts([[LEFT_X, y0, wz], [LEFT_X, y0 + 900, wz], [LEFT_X, y0 + 900, wz + 0.7], [LEFT_X, y0, wz + 0.7]])}
            fill={lit ? (warm ? '#d9a35a' : '#7fb1c9') : '#0a0f14'}
            opacity={lit ? 0.75 * blink : 0.9}
          />,
        );
      }
    }
    // gas meters / pipes on wall
    els.push(
      <polyline key="pipe" points={pts([[LEFT_X + 5, 0, z0 + 0.3], [LEFT_X + 5, b.h * 0.8, z0 + 0.3]])} stroke="#0d1216" strokeWidth={Math.max(1, 40 * P(0, 0, z0 + 0.3).s)} />,
    );
    items.push({d, el: <g key={`lb${bi}`}>{els}</g>});

    // neon sign (perpendicular, faces camera)
    if (b.sign) {
      const zs = b.z0 + 0.5;
      if (zs > near + 0.2) {
        const p = P(LEFT_X + 230, 2600, zs);
        const on = flicker(frame, `sign${bi}`, 0.1);
        const wpx = 420 * p.s;
        const hpx = 800 * p.s * 1.4;
        items.push({
          d: zs - cam.z - 0.01,
          el: (
            <g key={`sg${bi}`} opacity={0.35 + 0.65 * on}>
              <rect x={p.x - wpx / 2} y={p.y - hpx / 2} width={wpx} height={hpx} fill="#07090c" stroke={b.signColor} strokeWidth={Math.max(1, 14 * p.s)} rx={8 * p.s} />
              <text
                x={p.x}
                y={p.y}
                fill={b.signColor}
                fontFamily={theme.font.koDisplay}
                fontSize={Math.max(4, 150 * p.s)}
                textAnchor="middle"
                dominantBaseline="middle"
                writingMode="tb"
                style={{filter: on > 0.5 ? `drop-shadow(0 0 ${6 * p.s * 10}px ${b.signColor})` : undefined}}
              >
                {b.sign}
              </text>
            </g>
          ),
        });
      }
    }
  });

  // ---------- right wall + buildings behind
  RB.forEach((b, bi) => {
    if (b.z1 < near || b.z0 - cam.z > 110) return;
    const z0 = Math.max(b.z0, near);
    const shade = 12 + b.tone * 14;
    const els: React.ReactNode[] = [];
    els.push(
      <polygon key="bf" points={pts([[RIGHT_BLD, 1200, z0], [RIGHT_BLD, b.h, z0], [RIGHT_BLD, b.h, b.z1], [RIGHT_BLD, 1200, b.z1]])} fill={`rgb(${shade},${shade + 5},${shade + 10})`} />,
    );
    for (let fl = 0; 1900 + fl * 1700 + 900 < b.h; fl++) {
      const y0 = 1900 + fl * 1700;
      for (let wz = b.z0 + 0.5; wz + 0.7 < b.z1; wz += 1.5) {
        if (wz < near) continue;
        const r = random(`rw${bi}-${fl}-${Math.round(wz * 10)}`);
        els.push(
          <polygon
            key={`w${fl}-${wz}`}
            points={pts([[RIGHT_BLD, y0, wz], [RIGHT_BLD, y0 + 900, wz], [RIGHT_BLD, y0 + 900, wz + 0.7], [RIGHT_BLD, y0, wz + 0.7]])}
            fill={r < 0.25 ? '#c4935a' : '#090d11'}
            opacity={r < 0.25 ? 0.6 : 0.9}
          />,
        );
      }
    }
    // wall
    els.push(
      <polygon key="wall" points={pts([[RIGHT_WALL, 0, z0], [RIGHT_WALL, 1250, z0], [RIGHT_WALL, 1250, b.z1], [RIGHT_WALL, 0, b.z1]])} fill={`rgb(${22 + b.tone * 10},${20 + b.tone * 8},${20 + b.tone * 6})`} />,
    );
    els.push(
      <polyline key="wtop" points={pts([[RIGHT_WALL, 1250, z0], [RIGHT_WALL, 1250, b.z1]])} stroke="#3a3f44" strokeWidth={Math.max(1, 30 * P(0, 0, z0).s)} />,
    );
    // gate
    if (random(`gate${bi}`) < 0.5) {
      const gz = b.z0 + 1;
      if (gz > near)
        els.push(
          <polygon key="gate" points={pts([[RIGHT_WALL - 2, 0, gz], [RIGHT_WALL - 2, 1150, gz], [RIGHT_WALL - 2, 1150, gz + 0.8], [RIGHT_WALL - 2, 0, gz + 0.8]])} fill="#2a1512" />,
        );
    }
    items.push({d: (z0 + b.z1) / 2 - cam.z + 0.02, el: <g key={`rb${bi}`}>{els}</g>});
  });

  // ---------- utility poles, wires & lamps
  const firstPole = Math.floor((cam.z - 1) / LAMP_STEP);
  const lampGlows: React.ReactNode[] = [];
  for (let k = firstPole; k < firstPole + 20; k++) {
    const z = k * LAMP_STEP + 3;
    if (z < near + 0.05) continue;
    if (z - cam.z > 100) break;
    let L = flicker(frame, `lamp${k}`, flickRate, bursts);
    if (lampLevel) L *= lampLevel(k, frame);
    const base = P(POLE_X, 0, z);
    const top = P(POLE_X, 5600, z);
    const head = P(POLE_X - 380, 4500, z);
    const arm0 = P(POLE_X, 4600, z);
    const pw = Math.max(1.2, 55 * base.s);
    const glowR = 900 * base.s;
    const pool = P(POLE_X - 450, 0, z);
    const zN = z + LAMP_STEP;
    const topN = P(POLE_X, 5600, zN);
    const sagY = P(POLE_X, 5150, z + LAMP_STEP / 2);
    const wireL = P(LEFT_X, 5000, z + 2);
    const sagL = P(0, 4500, z + 1);
    items.push({
      d: z - cam.z,
      el: (
        <g key={`pole${k}`}>
          {/* light pool on ground */}
          <ellipse cx={pool.x} cy={pool.y} rx={1400 * base.s} ry={260 * base.s} fill="url(#pool)" opacity={0.85 * L} style={{mixBlendMode: 'screen'}} />
          {/* light cone */}
          <polygon
            points={`${head.x},${head.y} ${pool.x - 1200 * base.s},${pool.y} ${pool.x + 1200 * base.s},${pool.y}`}
            fill="url(#cone)"
            opacity={0.45 * L}
            style={{mixBlendMode: 'screen'}}
          />
          <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke="#0b0e10" strokeWidth={pw} />
          <line x1={top.x - 220 * base.s} y1={top.y + 40 * base.s} x2={top.x + 220 * base.s} y2={top.y + 40 * base.s} stroke="#0b0e10" strokeWidth={pw * 0.6} />
          {/* transformer */}
          <rect x={top.x - 60 * base.s} y={top.y + 200 * base.s} width={120 * base.s} height={260 * base.s} fill="#15191c" />
          <path d={`M${arm0.x},${arm0.y} Q${(arm0.x + head.x) / 2},${arm0.y - 60 * base.s} ${head.x},${head.y}`} stroke="#0b0e10" strokeWidth={pw * 0.5} fill="none" />
          <ellipse cx={head.x} cy={head.y} rx={90 * base.s} ry={30 * base.s} fill={L > 0.5 ? '#fff2d6' : '#3a3530'} />
          {/* wires */}
          <path d={`M${top.x},${top.y} Q${sagY.x},${sagY.y} ${topN.x},${topN.y}`} stroke="#050607" strokeWidth={Math.max(0.8, 10 * base.s)} fill="none" />
          <path d={`M${top.x},${top.y + 40 * base.s} Q${sagY.x},${sagY.y + 80 * base.s} ${topN.x},${topN.y + 40 * topN.s}`} stroke="#050607" strokeWidth={Math.max(0.8, 8 * base.s)} fill="none" />
          <path d={`M${top.x},${top.y + 40 * base.s} Q${sagL.x},${sagL.y} ${wireL.x},${wireL.y}`} stroke="#050607" strokeWidth={Math.max(0.6, 7 * base.s)} fill="none" />
        </g>
      ),
    });
    lampGlows.push(
      <circle key={`g${k}`} cx={head.x} cy={head.y} r={glowR} fill="url(#glow)" opacity={L} style={{mixBlendMode: 'screen'}} />,
    );
  }

  // ---------- actors
  actors.forEach((a, i) => {
    const p = P(a.X, 0, a.Z);
    if (a.Z - cam.z < 0.15) return;
    items.push({
      d: a.Z - cam.z - 0.001,
      el: (
        <g key={`actor${i}`}>
          <ellipse cx={p.x} cy={p.y} rx={260 * p.s} ry={45 * p.s} fill="#000" opacity={a.shadow ?? 0.55} />
          <g transform={`translate(${p.x},${p.y}) scale(${p.s})`}>{a.node(p.s)}</g>
        </g>
      ),
    });
  });

  items.sort((a, b) => b.d - a.d);

  const hor = P(0, 0, cam.z + 200);
  const skyline = [] as React.ReactNode[];
  for (let i = 0; i < 16; i++) {
    const xw = -2600 + i * 360 + random(`sk${i}`) * 100;
    const hh = 14000 + random(`skh${i}`) * 26000;
    const p0 = P(xw * 40, 0, cam.z + 150);
    const p1 = P(xw * 40, hh, cam.z + 150);
    const w = 250 + random(`skw${i}`) * 120;
    skyline.push(
      <g key={`sky${i}`}>
        <rect x={p0.x - w / 2} y={p1.y} width={w} height={p0.y - p1.y} fill="#0b141b" />
        {Array.from({length: 7}).map((_, r) => (
          <rect key={r} x={p0.x - w / 2 + 20} y={p1.y + 30 + r * 28} width={w - 40} height={3} fill={random(`skl${i}${r}`) < 0.4 ? '#c99a5a' : '#111a21'} opacity={0.5} />
        ))}
        <text x={p0.x} y={p1.y + 22} fill="#2c3a44" fontSize={18} textAnchor="middle" fontFamily={theme.font.koDisplay}>
          {101 + i}동
        </text>
      </g>,
    );
  }

  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.color.sky1} />
          <stop offset="1" stopColor={theme.color.sky2} />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141a1e" />
          <stop offset="1" stopColor="#07090b" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#ffe3b0" stopOpacity="0.95" />
          <stop offset="0.12" stopColor="#ffc97a" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#c98a3a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pool">
          <stop offset="0" stopColor="#ffcf8a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe0a8" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe0a8" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.color.fog} stopOpacity="0" />
          <stop offset="0.5" stopColor={theme.color.fog} stopOpacity="0.55" />
          <stop offset="1" stopColor={theme.color.fog} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="fogpuff">
          <stop offset="0" stopColor={theme.color.fog} stopOpacity="0.35" />
          <stop offset="1" stopColor={theme.color.fog} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon">
          <stop offset="0" stopColor="#e8eef0" stopOpacity="0.9" />
          <stop offset="0.08" stopColor="#c9d6db" stopOpacity="0.6" />
          <stop offset="0.4" stopColor="#6f8790" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <CharDefs />
      <rect width={1080} height={1920} fill="url(#sky)" />
      <circle cx={760 - cam.x * 0.002} cy={hor.y - 1300} r={420} fill="url(#moon)" />
      {skyline}
      <rect x={0} y={hor.y} width={1080} height={1920} fill="url(#road)" />
      {/* curb lines */}
      <polyline points={pts([[-950, 0, near], [-950, 0, cam.z + 120]])} stroke="#2a3136" strokeWidth={6} fill="none" />
      <polyline points={pts([[900, 0, near], [900, 0, cam.z + 120]])} stroke="#2a3136" strokeWidth={6} fill="none" />
      <polyline points={pts([[-860, 0, near], [-860, 0, cam.z + 120]])} stroke="#5b4a1a" strokeWidth={4} strokeDasharray="30 20" fill="none" opacity={0.6} />
      {/* distance fog behind everything near the horizon */}
      <rect x={0} y={hor.y - 700} width={1080} height={1400} fill="url(#fog)" opacity={fog * 0.9} />
      {items.map((it) => it.el)}
      {lampGlows}
      {/* rolling fog bands */}
      {[0, 1, 2, 3].map((i) => {
        const yy = hor.y + 40 + i * 130 + Math.sin(frame / 90 + i) * 30;
        const xx = ((frame * (0.6 + i * 0.25) + i * 400) % 2400) - 1200;
        return (
          <ellipse key={`fb${i}`} cx={xx + 540} cy={yy} rx={1000} ry={200 + i * 60} fill="url(#fogpuff)" opacity={fog * 0.5} />
        );
      })}
      {dark > 0 && <rect width={1080} height={1920} fill="#000" opacity={dark} />}
    </svg>
  );
};

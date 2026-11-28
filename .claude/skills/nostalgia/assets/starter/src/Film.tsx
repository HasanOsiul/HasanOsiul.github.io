import React from 'react';
import {AbsoluteFill, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, EASE, iv, rng, wind} from './theme';
import {Boy, Expr, Hand, Head, Limb, Mango, Pose, baseExpr, ik, standPose} from './Boy';
import {BoilDefs, Birds, Canopy, Dust, FarLand, Ground, HayStack, House, Post, Sky, TreeShadow, Trunk} from './Env';
import TL from './timeline.json';

const serif = 'SrcSerif';
const bangla = 'TiroBn';
if (typeof document !== 'undefined') {
  const h = delayRender('fonts');
  const fs = [new FontFace(serif, `url(${staticFile('serif.ttf')})`), new FontFace(bangla, `url(${staticFile('bangla.ttf')})`)];
  Promise.all(fs.map((x) => x.load())).then((l) => {
    l.forEach((x) => document.fonts.add(x));
    continueRender(h);
  });
}

/* ---------- timeline: scenes authored in "logical" frames, played back slower ---------- */
const SLOW = TL.slow; // 0.8 → everything runs at 80% speed, softly slow-mo
const XF = TL.xf;
type SceneName = 'wide' | 'amazed' | 'pov' | 'pluck' | 'sit' | 'salt' | 'eat' | 'end';
export const SC: Record<SceneName, {start: number; dur: number}> = {} as never;
let acc = 0;
for (const [name, logical] of TL.scenes as [SceneName, number][]) {
  const dur = Math.round(logical / SLOW);
  SC[name] = {start: acc, dur};
  acc += dur;
}
export const TOTAL = acc;

const useScene = (name: SceneName) => {
  const rf = useCurrentFrame();
  const {fps} = useVideoConfig();
  return {f: rf * SLOW, t: ((SC[name].start + rf) * SLOW) / fps, rf};
};

/* ---------- props ---------- */
const FoldedPaper: React.FC = () => (
  <g transform="rotate(-12)">
    <rect x={-16} y={-12} width={32} height={24} rx={3} fill="#efe6cf" stroke={C.line} strokeWidth={4} />
    <line x1={-10} y1={-3} x2={10} y2={-3} stroke="#9a8f7a" strokeWidth={2.5} />
    <line x1={-10} y1={4} x2={6} y2={4} stroke="#9a8f7a" strokeWidth={2.5} />
  </g>
);

// small opened newspaper square with a mound of brown salt (with a little chili)
const SaltPaper: React.FC<{dent?: number; t: number}> = ({dent = 0, t}) => {
  const r = rng(41);
  const grains = Array.from({length: 380}).map(() => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r());
    return {x: Math.cos(a) * d * 96, y: Math.sin(a) * d * 44 - (1 - d) * 30, s: 1.2 + r() * 2.6, c: ['#6e3f24', '#8a5634', '#a8744c', '#c79a6e', '#5a2e1c', '#b5452e'][Math.floor(r() * 6)]};
  });
  return (
    <g>
      <path d="M -150 -100 L 140 -118 L 162 96 L -138 116 Z" fill="#eee3c8" stroke={C.line} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -150 -100 L 162 96 M 140 -118 L -138 116" stroke="#d6c7a4" strokeWidth={3} opacity={0.8} />
      {[-70, -50, -30, 50, 70].map((y, i) => (
        <line key={i} x1={-120 + (i % 2) * 20} y1={y} x2={-40 + (i % 3) * 20} y2={y - 4} stroke="#a89c84" strokeWidth={3} opacity={0.6} />
      ))}
      {[-80, -60, 60, 80].map((y, i) => (
        <line key={`r${i}`} x1={60} y1={y} x2={130 - (i % 2) * 20} y2={y - 3} stroke="#a89c84" strokeWidth={3} opacity={0.6} />
      ))}
      <ellipse cx={0} cy={6} rx={96} ry={40} fill="#7a4a2c" opacity={0.25} />
      <path d={`M -92 10 Q -60 ${-34 + dent * 18} 0 ${-40 + dent * 26} Q 60 ${-34 + dent * 18} 92 10 Q 0 34 -92 10 Z`} fill="#93603c" stroke={C.line} strokeWidth={3} strokeOpacity={0.5} />
      <path d="M -40 -20 Q 0 -34 40 -22" stroke="#c99a6c" strokeWidth={8} fill="none" opacity={0.5} strokeLinecap="round" />
      {grains.map((g, i) => (
        <circle key={i} cx={g.x} cy={g.y + dent * 10 * (1 - Math.abs(g.x) / 90)} r={g.s} fill={g.c} />
      ))}
      {grains.slice(0, 14).map((g, i) => (
        <circle key={`gl${i}`} cx={g.x} cy={g.y} r={1.6} fill="#fff4d6" opacity={Math.max(0, Math.sin(t * 2.5 + i * 1.7))} />
      ))}
    </g>
  );
};

// open palm seen from above (palm up), wrist coming from the bottom
const OpenPalm: React.FC = () => (
  <g>
    <path d="M -70 120 C -60 220 -50 320 -40 420 L 70 420 C 70 320 80 220 90 120 Z" fill={C.skin} stroke={C.line} strokeWidth={5} />
    {[-80, -30, 22, 70].map((x, i) => (
      <g key={i}>
        <line x1={x * 0.8} y1={-20} x2={x * 1.15} y2={-150 + Math.abs(i - 1.5) * 18} stroke={C.line} strokeWidth={46} strokeLinecap="round" />
        <line x1={x * 0.8} y1={-20} x2={x * 1.15} y2={-150 + Math.abs(i - 1.5) * 18} stroke={C.skin} strokeWidth={36} strokeLinecap="round" />
      </g>
    ))}
    <ellipse cx={0} cy={40} rx={120} ry={110} fill={C.skin} stroke={C.line} strokeWidth={5} />
    <line x1={100} y1={60} x2={175} y2={-20} stroke={C.line} strokeWidth={48} strokeLinecap="round" />
    <line x1={100} y1={60} x2={175} y2={-20} stroke={C.skin} strokeWidth={38} strokeLinecap="round" />
    <path d="M -60 70 Q 0 100 70 60 M -40 20 Q 10 40 60 10" stroke={C.skinShade} strokeWidth={4} fill="none" opacity={0.7} />
  </g>
);

/* ---------- WORLD (yard at golden hour) ---------- */
type BoyState = {x: number; y: number; s: number; pose: Pose; e: Expr; turn?: number; tilt?: number; rItem?: React.ReactNode; lItem?: React.ReactNode};

const World: React.FC<{t: number; frame: number; cam: [number, number, number]; boy: BoyState; sunY?: number; hideMango?: number; birdsAt?: number}> = ({t, frame, cam, boy, sunY, hideMango, birdsAt}) => {
  const [cx, cy, sc] = cam;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <BoilDefs frame={frame} />
      <g transform={`translate(540 960) scale(${sc}) translate(${-cx} ${-cy})`}>
        <Sky t={t} sunY={sunY} />
        {birdsAt !== undefined && <Birds t={t} start={birdsAt} />}
        <FarLand t={t} />
        <Ground />
        <g filter="url(#boil)">
          <House />
          <HayStack x={1010} y={1190} s={0.6} />
        </g>
        <TreeShadow />
        <g filter="url(#boil)">
          <Trunk t={t} />
          <Canopy t={t} hideMango={hideMango} />
        </g>
        <g transform={`translate(${boy.x} ${boy.y}) scale(${boy.s})`} filter="url(#boil)">
          <Boy pose={boy.pose} e={boy.e} t={t} id="w" turn={boy.turn} tilt={boy.tilt} rItem={boy.rItem} lItem={boy.lItem} />
        </g>
        <Dust t={t} n={50} />
      </g>
    </svg>
  );
};

/* ---------- 1. wide: standing in the uthan, looking up ---------- */
const SceneWide: React.FC = () => {
  const {f, t} = useScene('wide');
  const sc = iv(f, [0, 145], [1.0, 1.1]);
  const look = iv(f, [25, 70], [0, 1]);
  const e: Expr = {
    ...baseExpr,
    look: [0.55 * look, -0.9 * look],
    eyeOpen: iv(f, [70, 100], [1, 1.1]),
    brow: iv(f, [70, 100], [0, 0.5]),
    mouth: 'small',
    blush: 0.35,
  };
  const breathe = Math.sin(t * 2) * 2;
  return (
    <World
      t={t}
      frame={f}
      cam={[560, 1200 - (sc - 1) * 300, sc]}
      birdsAt={0.5}
      boy={{
        x: 380,
        y: 1358 + breathe * 0.3,
        s: 0.5,
        pose: {...standPose, lHand: [-75, 272 + breathe], rHand: [77, 272 + breathe], lFoot: [-31, 468], rFoot: [31, 468]},
        e,
        tilt: iv(f, [25, 70], [0, 9]),
        lItem: <FoldedPaper />,
      }}
    />
  );
};

/* ---------- 2. close-up: quietly amazed ---------- */
const SceneAmazed: React.FC = () => {
  const {f, t} = useScene('amazed');
  const wow = iv(f, [20, 40], [0, 1], EASE.out);
  const blink = f > 80 && f < 90 ? iv(f, [80, 84, 90], [1, 0.08, 1]) : 1;
  const smile = iv(f, [92, 108], [0, 1]);
  const e: Expr = {
    ...baseExpr,
    eyeOpen: (1 + wow * 0.18) * blink,
    look: [0.25, -0.85],
    sparkle: wow,
    brow: wow * 0.8,
    mouth: smile > 0.5 ? 'soft' : wow > 0.15 ? 'o' : 'small',
    mouthOpen: smile > 0.5 ? 0.2 : 0.1 + wow * 0.3,
    blush: 0.35 + wow * 0.25 + smile * 0.15,
  };
  const push = iv(f, [0, 130], [1, 1.07]);
  return (
    <svg width={1080} height={1920}>
      <BoilDefs frame={f} />
      <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}>
        <g transform="translate(-180 -120) scale(1.35)">
          <Sky t={t} sunY={1180} />
        </g>
        <g transform="translate(-640 -780) scale(1.9)" filter="url(#boil)">
          <Canopy t={t} />
        </g>
        <g opacity={wow * (0.5 + 0.3 * Math.sin(t * 4))} transform={`translate(${-640 + 610 * 1.9} ${-780 + 1030 * 1.9})`}>
          <path d="M 0 -30 L 6 -6 L 30 0 L 6 6 L 0 30 L -6 6 L -30 0 L -6 -6 Z" fill="#fff8d8" />
        </g>
        <g transform={`translate(540 ${1300 + Math.sin(t * 2) * 4}) scale(3.1)`} filter="url(#boil)">
          <Boy pose={{...standPose, lHand: [-66, 276], rHand: [68, 276]}} e={e} t={t} id="a" tilt={-4 + Math.sin(t * 1.1) * 1.5} />
        </g>
        <Dust t={t} n={36} seed={4} scale={1.6} />
      </g>
    </svg>
  );
};

/* ---------- 3. POV: his own hands climbing the small mango tree ---------- */
const PovHand: React.FC<{x: number; y: number; ax: number; side: -1 | 1; grip: number}> = ({x, y, ax, side, grip}) => {
  const wx = x;
  const wy = y + 120;
  return (
    <g>
      <line x1={ax} y1={2100} x2={wx} y2={wy} stroke={C.line} strokeWidth={164} strokeLinecap="round" />
      <line x1={ax} y1={2100} x2={wx} y2={wy} stroke={C.skin} strokeWidth={150} strokeLinecap="round" />
      <line x1={ax + side * 30} y1={2100} x2={wx + side * 26} y2={wy + 40} stroke={C.skinShade} strokeWidth={22} strokeLinecap="round" opacity={0.5} />
      <g transform={`translate(${x} ${y}) scale(${side * 1.7} 1.7)`}>
        {[-42, -14, 14, 40].map((fy, i) => (
          <g key={i}>
            <line x1={10} y1={fy + 10} x2={60 + grip * 20 - Math.abs(i - 1.5) * 8} y2={fy - 24 + grip * 14} stroke={C.line} strokeWidth={36} strokeLinecap="round" />
            <line x1={10} y1={fy + 10} x2={60 + grip * 20 - Math.abs(i - 1.5) * 8} y2={fy - 24 + grip * 14} stroke={i % 2 ? C.skin : C.skinLight} strokeWidth={26} strokeLinecap="round" />
          </g>
        ))}
        <ellipse cx={-6} cy={20} rx={58} ry={74} fill={C.skin} stroke={C.line} strokeWidth={6} />
        <path d="M -30 -20 q 8 -6 16 0 M -32 10 q 8 -6 16 0" stroke={C.skinShade} strokeWidth={4} fill="none" />
        <line x1={-40} y1={40} x2={-70} y2={-10} stroke={C.line} strokeWidth={40} strokeLinecap="round" />
        <line x1={-40} y1={40} x2={-70} y2={-10} stroke={C.skin} strokeWidth={30} strokeLinecap="round" />
      </g>
    </g>
  );
};

const ScenePov: React.FC = () => {
  const {f, t} = useScene('pov');
  const CY = 42;
  const n = 2;
  const ci = Math.min(n, Math.floor(f / CY));
  const ph = ci >= n ? 1 : (f % CY) / CY;
  const pullK = ci >= n ? 0 : EASE.inOut(Math.max(0, (ph - 0.42) / 0.58));
  const p = ci + pullK;
  const STEP = 240;
  const camShift = p * STEP;
  const hw = (y: number) => 120 + Math.max(0, (y - 300) / 1620) * 260;
  const grabY = (k: number) => 700 - k * STEP;
  const handState = (isL: boolean) => {
    let last = isL ? 1250 : 980;
    for (let k = 0; k < ci; k++) if ((k % 2 === 0) === isL) last = grabY(k);
    const mine = ci < n && (ci % 2 === 0) === isL;
    const reaching = mine && ph < 0.42;
    let wy = last;
    let lift = 0;
    if (mine) {
      const k = EASE.inOut(Math.min(1, ph / 0.42));
      wy = last + (grabY(ci) - last) * k;
      lift = Math.sin(k * Math.PI) * 40;
    }
    const sy = wy + camShift;
    const sx = 540 + (isL ? -1 : 1) * (hw(sy) - 70 + lift);
    return {sx, sy, grip: reaching ? 0.2 : 1};
  };
  const L = handState(true);
  const R = handState(false);
  const sway = Math.sin(t * 1.4) * 0.8 + (ci < n ? Math.sin(ph * Math.PI) * 1.2 * (ci % 2 ? 1 : -1) : 0);
  const canopyY = -2560 + camShift * 0.5;
  const r = rng(61);
  const bark = Array.from({length: 40}).map(() => ({y: r() * 2600 - 900, x: r() * 2 - 1, w: 0.25 + r() * 0.4, k: r()}));
  const by = 420 + camShift * 0.3;
  return (
    <svg width={1080} height={1920}>
      <BoilDefs frame={f} />
      <defs>
        <radialGradient id="povvig" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0.6" stopColor="#1a0d14" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0d14" stopOpacity={0.45 + Math.sin(t * 2) * 0.05} />
        </radialGradient>
      </defs>
      <g transform={`rotate(${sway} 540 1100)`}>
        <g transform="translate(-300 -500) scale(1.5)">
          <Sky t={t} sunY={1000} />
        </g>
        <g filter="url(#boil)">
          <path d={`M ${540 - hw(1950)} 1950 C ${540 - hw(1200)} 1200 ${540 - hw(500) - 10} 600 ${540 - hw(300)} 250 L ${540 + hw(300)} 250 C ${540 + hw(500) + 10} 600 ${540 + hw(1200)} 1200 ${540 + hw(1950)} 1950 Z`} fill={C.bark} stroke={C.line} strokeWidth={8} />
          <path d={`M ${540 + hw(1950) - 70} 1950 C ${540 + hw(1200) - 60} 1200 ${540 + hw(500) - 40} 600 ${540 + hw(300) - 30} 250`} stroke={C.barkLight} strokeWidth={34} fill="none" opacity={0.55} />
          <path d={`M ${540 - hw(1950) + 50} 1950 C ${540 - hw(1200) + 40} 1200 ${540 - hw(500) + 30} 600 ${540 - hw(300) + 20} 250`} stroke={C.barkDark} strokeWidth={40} fill="none" opacity={0.45} />
          {bark.map((b, i) => {
            const y = ((((b.y + camShift + 900) % 2600) + 2600) % 2600) - 600;
            if (y < 260) return null;
            const w = hw(y);
            const x = 540 + b.x * w * 0.7;
            return <path key={i} d={`M ${x - w * b.w * 0.5} ${y} q ${w * b.w * 0.5} ${-10 - b.k * 10} ${w * b.w} 0`} stroke={b.k > 0.7 ? C.barkLight : C.barkDark} strokeWidth={5 + b.k * 4} fill="none" strokeLinecap="round" opacity={0.8} />;
          })}
          <path d={`M ${540 + hw(by) - 10} ${by} C 820 ${by - 40} 980 ${by - 90} 1200 ${by - 120}`} stroke={C.line} strokeWidth={70} fill="none" strokeLinecap="round" />
          <path d={`M ${540 + hw(by) - 10} ${by} C 820 ${by - 40} 980 ${by - 90} 1200 ${by - 120}`} stroke={C.bark} strokeWidth={56} fill="none" strokeLinecap="round" />
        </g>
        <g transform={`translate(-1280 ${canopyY}) scale(2.6)`} filter="url(#boil)">
          <Canopy t={t} />
        </g>
        <g filter="url(#boil)">
          <PovHand x={L.sx} y={L.sy} ax={250} side={1} grip={L.grip} />
          <PovHand x={R.sx} y={R.sy} ax={830} side={-1} grip={R.grip} />
        </g>
        <Dust t={t} n={30} seed={21} scale={2} />
      </g>
      <rect width={1080} height={1920} fill="url(#povvig)" />
    </svg>
  );
};

/* ---------- 4. close-up pluck ---------- */
const ScenePluck: React.FC = () => {
  const {f, t} = useScene('pluck');
  const SNAP = 52;
  const handY = iv(f, [0, 34], [2300, 1330], EASE.out) + iv(f, [SNAP - 4, SNAP + 14], [0, 160], EASE.out);
  const curl = iv(f, [34, 44], [0, 0.75]);
  const pre = iv(f, [44, SNAP], [0, 1], EASE.in);
  const after = f > SNAP ? f - SNAP : 0;
  const spring = f > SNAP ? Math.sin(after * 0.45) * Math.exp(-after * 0.07) * 6 : -pre * 2;
  const mangoY = f <= SNAP ? 1180 + pre * 16 : handY - 150;
  const r = rng(77);
  return (
    <svg width={1080} height={1920}>
      <BoilDefs frame={f} />
      <defs>
        <filter id="bokeh">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g transform="translate(-260 -400) scale(1.5)">
        <Sky t={t} sunY={1060} />
      </g>
      <g filter="url(#bokeh)" opacity={0.95} transform="translate(-900 -1050) scale(2.6)">
        <Canopy t={t} />
      </g>
      <g transform={`rotate(${spring} -100 700)`} filter="url(#boil)">
        <path d="M -100 700 C 200 760 420 880 1200 980" stroke={C.line} strokeWidth={70} fill="none" strokeLinecap="round" />
        <path d="M -100 700 C 200 760 420 880 1200 980" stroke={C.bark} strokeWidth={58} fill="none" strokeLinecap="round" />
        <path d="M -100 690 C 200 748 420 866 1200 966" stroke={C.barkLight} strokeWidth={8} fill="none" opacity={0.6} />
        {Array.from({length: 26}).map((_, i) => {
          const x = r() * 1200 - 50;
          const yy = 700 + (x + 100) * 0.22 + (r() - 0.5) * 80;
          const a = (r() - 0.5) * 140 + 90;
          const w = wind(t, i);
          const col = [C.leafDark, C.leafMid, C.leafLight, C.leafRim][Math.floor(r() * 4)];
          return (
            <g key={i} transform={`translate(${x} ${yy}) rotate(${a + w * 8 + Math.sin(t * 3 + i) * 5}) scale(${2.4 + r()})`}>
              <path d="M 0 0 Q 18 -8 60 0 Q 18 8 0 0 Z" fill={col} stroke={C.line} strokeWidth={2} />
              <line x1={2} y1={0} x2={56} y2={0} stroke={C.line} strokeWidth={1} opacity={0.4} />
            </g>
          );
        })}
        {f <= SNAP && <path d={`M 560 830 Q 566 980 560 ${mangoY - 170}`} stroke={C.barkDark} strokeWidth={9} fill="none" strokeLinecap="round" />}
      </g>
      <g transform={`translate(560 ${mangoY}) rotate(${f > SNAP ? -8 : Math.sin(t * 2) * 3}) scale(2.3)`} filter="url(#boil)">
        <Mango id="pk" leaf={f > SNAP} />
      </g>
      <g transform={`translate(560 ${handY}) scale(2.3)`} filter="url(#boil)">
        <Hand curl={curl} />
      </g>
      {f > SNAP &&
        [0, 1, 2].map((i) => {
          const a = f - SNAP;
          return (
            <g key={i} transform={`translate(${600 + i * 70 + Math.sin(a * 0.12 + i) * 40} ${820 + a * (4 + i)}) rotate(${a * (3 + i)}) scale(2)`} opacity={iv(a, [0, 36], [1, 0])}>
              <path d="M 0 0 Q 18 -8 40 0 Q 18 8 0 0 Z" fill={C.leafLight} stroke={C.line} strokeWidth={2} />
            </g>
          );
        })}
      <Dust t={t} n={30} seed={8} scale={2} />
    </svg>
  );
};

/* ---------- 5. sitting on the branch: first bite, opens the little paper ---------- */
const SceneSit: React.FC = () => {
  const {f, t} = useScene('sit');
  const BITE = 32;
  const up = iv(f, [12, BITE - 2], [0, 1], EASE.inOut) * (1 - iv(f, [BITE + 4, BITE + 18], [0, 1], EASE.inOut));
  const rHand: [number, number] = [30 - up * 6, 210 - up * 120];
  const paperIn = iv(f, [50, 72], [0, 1], EASE.inOut);
  const lHand: [number, number] = [-80 + paperIn * 60, 280 - paperIn * 40];
  const swing = (i: number) => Math.sin(t * 2.2 + i * Math.PI) * 22;
  const chewing = f > BITE + 2 && f < 70;
  const e: Expr = {
    ...baseExpr,
    look: paperIn > 0.4 ? [-0.3, 0.85] : [0.35, 0.8],
    mouth: f > BITE - 8 && f <= BITE + 2 ? 'bite' : chewing ? 'chew' : 'soft',
    mouthOpen: f <= BITE ? iv(f, [BITE - 8, BITE - 2], [0, 0.7]) : 0.2,
    eyeOpen: chewing ? 0.8 : 1,
    blush: 0.5,
    brow: 0.2,
    puff: chewing ? 0.35 + 0.2 * Math.sin(t * 7) : 0,
  };
  const sc = iv(f, [0, 110], [2.5, 2.7]);
  return (
    <World
      t={t}
      frame={f}
      cam={[830, 1110, sc]}
      hideMango={2}
      boy={{
        x: 820,
        y: 1060,
        s: 0.5,
        tilt: Math.sin(t * 1.2) * 2,
        pose: {lHand, rHand, lFoot: [-34 + swing(0) * 0.3, 455], rFoot: [34 + swing(1) * 0.3, 455]},
        e,
        rItem: (
          <g transform="translate(0 -28) rotate(-25) scale(0.48)">
            <Mango id="s5" bites={f > BITE ? 1 : 0} />
          </g>
        ),
        lItem:
          paperIn > 0.5 ? (
            <g transform="translate(6 -14) scale(0.24)">
              <SaltPaper t={t} />
            </g>
          ) : (
            <FoldedPaper />
          ),
      }}
    />
  );
};

/* ---------- 6. slow zoom into the brown salt on the paper, mango dips ---------- */
const SceneSalt: React.FC = () => {
  const {f, t} = useScene('salt');
  const zoom = iv(f, [0, 130], [1.0, 1.45], EASE.soft);
  const DIP = 82;
  const mIn = iv(f, [56, DIP], [0, 1], EASE.inOut);
  const mOut = iv(f, [DIP + 8, DIP + 34], [0, 1], EASE.inOut);
  const mx = 980 - mIn * 380 + mOut * 120;
  const my = 420 + mIn * 560 - mOut * 220;
  const dent = iv(f, [DIP - 4, DIP + 4], [0, 1]);
  return (
    <svg width={1080} height={1920}>
      <BoilDefs frame={f} />
      <defs>
        <filter id="bk3">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <radialGradient id="warmspot" cx="0.6" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#ffd28a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffd28a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(540 1040) scale(${zoom}) translate(-540 -1040)`}>
        <g filter="url(#bk3)">
          <g transform="translate(-200 -300) scale(1.4)">
            <Sky t={t} sunY={900} />
          </g>
          <g transform="translate(-900 -1300) scale(2.6)">
            <Canopy t={t} />
          </g>
          <ellipse cx={540} cy={1700} rx={760} ry={420} fill={C.shorts} />
          <ellipse cx={300} cy={1750} rx={260} ry={300} fill={C.shortsShade} opacity={0.6} />
        </g>
        <g transform="translate(560 1260) rotate(-8)" filter="url(#boil)">
          <g transform="scale(1.35)">
            <OpenPalm />
          </g>
          <g transform="translate(-10 -20) rotate(6) scale(1.1)">
            <SaltPaper dent={dent} t={t} />
          </g>
        </g>
        {mIn > 0 && (
          <g transform={`translate(${mx} ${my}) rotate(${150 - mOut * 40}) scale(2.4)`} filter="url(#boil)">
            <Mango id="dip" bites={1} salt={f > DIP ? 1 : 0} />
          </g>
        )}
        <rect width={1080} height={1920} fill="url(#warmspot)" style={{mixBlendMode: 'screen'}} />
        <Dust t={t} n={26} seed={31} scale={2.2} />
      </g>
    </svg>
  );
};

/* ---------- 7. close-up: the bite, eyes close, the taste of that evening ---------- */
export const EAT_BITE = 40; // logical frame of the bite → song chorus lands here
const SceneEat: React.FC = () => {
  const {f, t} = useScene('eat');
  const B = EAT_BITE;
  const m = iv(f, [B - 18, B - 2], [0, 1], EASE.inOut) * (1 - iv(f, [B + 4, B + 22], [0, 1], EASE.inOut));
  const bites = f > B ? 2 : 1;
  const close = iv(f, [B + 2, B + 30], [1, 0.05], EASE.soft);
  const reopen = iv(f, [165, 195], [0, 1], EASE.soft);
  const chewing = f > B + 6 && f < 150;
  let e: Expr = {...baseExpr, look: [0.4, 0.85], mouth: 'soft', mouthOpen: 0.1, blush: 0.45, brow: 0.2};
  if (f > B - 12 && f <= B + 1) {
    e = {...e, mouth: 'bite', mouthOpen: iv(f, [B - 12, B - 3], [0.1, 0.75]), eyeOpen: 0.9};
  } else if (f > B + 1) {
    const eyesClosed = close < 0.2 && reopen < 0.15;
    e = {
      ...e,
      eyeMode: eyesClosed ? 'happy' : 'open',
      eyeOpen: reopen > 0 ? 0.2 + reopen * 0.75 : close,
      look: reopen > 0 ? [0.3, -0.75] : [0.3, 0.5],
      sparkle: reopen * 0.8,
      mouth: chewing ? 'chew' : 'soft',
      mouthOpen: 0.3,
      brow: 0.2 + iv(f, [B, B + 30], [0, 0.45]),
      blush: 0.45 + iv(f, [B, B + 50], [0, 0.45]),
      puff: chewing ? 0.3 + 0.2 * Math.sin(t * 7) : 0,
    };
  }
  const tiltBack = iv(f, [B, B + 50], [0, -5], EASE.soft) + iv(f, [165, 200], [0, 2]);
  const sway = Math.sin(t * 1.1) * 1.6;
  const push = iv(f, [0, 230], [1.0, 1.1]);
  const glow = iv(f, [B, B + 60], [0.15, 0.5]);
  const mx = 760 - m * 150;
  const my = 1640 - m * 300 + iv(f, [B + 22, B + 60], [0, 120]);
  return (
    <svg width={1080} height={1920}>
      <BoilDefs frame={f} />
      <defs>
        <filter id="bk2">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id="sunflare" cx="0.85" cy="0.35" r="0.6">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb070" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(540 960) scale(${push}) translate(-540 -960)`}>
        <g transform="translate(-260 -60) scale(1.4)">
          <Sky t={t} sunY={1000} />
        </g>
        <g filter="url(#bk2)" transform="translate(-700 -900) scale(2.2)">
          <Canopy t={t} />
        </g>
        <g transform="translate(540 1080) scale(3.0)" filter="url(#boil)">
          <Boy pose={{...standPose, lHand: [-66, 276], rHand: [68, 276]}} e={e} t={t} id="e" tilt={tiltBack + sway} layer="back" />
          {/* his other arm resting at his side */}
          <Limb pts={[[-60, 118], ik(-60, 118, -70, 290, 82, 78, 1), [-70, 290]]} w={26} color={C.skin} />
          <Limb pts={[[-60, 118], [-63, 160]]} w={40} color={C.shirt} />
          <Head e={e} t={t} tilt={tiltBack + sway} id="e2" />
          {/* his own arm bringing the mango up: shoulder → elbow → fist */}
          {(() => {
            const ang = -38 + m * 12; // mango tilt
            const mxL = 78 - m * 46;
            const myL = 205 - m * 105 + iv(f, [B + 22, B + 60], [0, 30]);
            const rad = (ang * Math.PI) / 180;
            const fx = mxL - Math.sin(rad) * 40;
            const fy = myL + Math.cos(rad) * 40;
            const sh: [number, number] = [60, 118];
            const el = ik(sh[0], sh[1], fx, fy + 24, 82, 78, -1);
            return (
              <g>
                <Limb pts={[sh, el, [fx, fy + 24]]} w={26} color={C.skin} />
                <Limb pts={[sh, [sh[0] + (el[0] - sh[0]) * 0.55, sh[1] + (el[1] - sh[1]) * 0.55]]} w={40} color={C.shirt} />
                <g transform={`translate(${mxL} ${myL}) rotate(${ang}) scale(0.62)`}>
                  <Mango id="m6" bites={bites} salt={1} />
                </g>
                <g transform={`translate(${fx} ${fy}) rotate(${ang}) scale(0.58)`}>
                  <Hand curl={0.75} noArm />
                </g>
              </g>
            );
          })()}
        </g>
        <rect width={1080} height={1920} fill="url(#sunflare)" opacity={glow} style={{mixBlendMode: 'screen'}} />
        <Dust t={t} n={34} seed={12} scale={1.8} />
      </g>
    </svg>
  );
};

/* ---------- 8. pull back into the sunset ---------- */
const SceneEnd: React.FC = () => {
  const {f, t} = useScene('end');
  const k = iv(f, [0, 120], [0, 1], EASE.soft);
  const cx = 830 + (560 - 830) * k;
  const cy = 1110 + (1150 - 1110) * k;
  const sc = 2.4 + (1.02 - 2.4) * k;
  const swing = (i: number) => Math.sin(t * 2 + i * Math.PI) * 24;
  const e: Expr = {...baseExpr, eyeMode: 'happy', mouth: 'soft', blush: 0.7, brow: 0.4};
  const title = iv(f, [55, 85], [0, 1], EASE.out);
  return (
    <AbsoluteFill>
      <World
        t={t}
        frame={f}
        cam={[cx, cy, sc]}
        hideMango={2}
        sunY={1130 + k * 40}
        birdsAt={(SC.end.start * SLOW) / 30 + 0.4}
        boy={{
          x: 820,
          y: 1060,
          s: 0.5,
          tilt: Math.sin(t * 1.1) * 3 - 4,
          pose: {lHand: [-40, 250], rHand: [30, 150], lFoot: [-34 + swing(0) * 0.4, 455], rFoot: [34 + swing(1) * 0.4, 455]},
          e,
          rItem: (
            <g transform="translate(0 -28) rotate(-25) scale(0.48)">
              <Mango id="s7" bites={2} salt={1} />
            </g>
          ),
          lItem: (
            <g transform="translate(6 -14) scale(0.24)">
              <SaltPaper t={t} />
            </g>
          ),
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 420,
          width: '100%',
          textAlign: 'center',
          fontFamily: bangla,
          color: '#fff4dc',
          fontSize: 62,
          lineHeight: 1.45,
          opacity: title,
          transform: `translateY(${(1 - title) * 20}px)`,
          textShadow: '0 4px 24px rgba(80,30,40,0.55)',
        }}
      >
        কাঁচা আম, লবণ
        <br />
        আর এক টুকরো বিকেল
        <div style={{fontSize: 34, marginTop: 14, opacity: 0.85, fontFamily: serif, letterSpacing: 6}}>— ২০১৫ —</div>
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC = () => {
  const f = useCurrentFrame();
  const a = iv(f, [10, 34], [0, 1], EASE.out) * (1 - iv(f, [SC.end.start + 40, SC.end.start + 60], [0, 1]));
  return (
    <div style={{position: 'absolute', top: 250, width: '100%', display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * 12}px)`}}>
      <div style={{background: '#0b0908', color: '#fbf6ec', fontFamily: serif, fontSize: 44, lineHeight: 1.3, padding: '12px 22px', textAlign: 'center'}}>pov: it's 2015 and you...</div>
    </div>
  );
};

const Fade: React.FC<{children: React.ReactNode; dur: number; first?: boolean; last?: boolean}> = ({children, dur, first, last}) => {
  const f = useCurrentFrame();
  const inA = first ? iv(f, [0, 14], [0, 1]) : iv(f, [0, XF], [0, 1]);
  const outA = last ? iv(f, [dur - 24, dur], [1, 0]) : 1;
  return <AbsoluteFill style={{opacity: inA * outA}}>{children}</AbsoluteFill>;
};

const COMPS: Record<SceneName, React.FC> = {wide: SceneWide, amazed: SceneAmazed, pov: ScenePov, pluck: ScenePluck, sit: SceneSit, salt: SceneSalt, eat: SceneEat, end: SceneEnd};

export const MangoFilm: React.FC<{caption: boolean}> = ({caption}) => {
  const names = (TL.scenes as [SceneName, number][]).map(([n]) => n);
  return (
    <AbsoluteFill style={{background: '#1a0d14'}}>
      {names.map((n, i) => {
        const last = i === names.length - 1;
        const dur = SC[n].dur + (last ? 0 : XF);
        const Comp = COMPS[n];
        return (
          <Sequence key={n} from={SC[n].start} durationInFrames={dur}>
            <Fade dur={dur} first={i === 0} last={last}>
              <Comp />
            </Fade>
          </Sequence>
        );
      })}
      <Post frame={useCurrentFrame()} />
      {caption && <Caption />}
    </AbsoluteFill>
  );
};

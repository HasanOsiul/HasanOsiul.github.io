import {Easing, interpolate, random} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const theme = {
  color: {
    night: '#050a10',
    sky1: '#02060b',
    sky2: '#0c1c26',
    fog: '#7f97a3',
    lamp: '#ffd9a0',
    lampCold: '#cfe9ff',
    pink: '#c48a93',
    pinkDirty: '#a7737b',
    skin: '#c9cfc6',
    skinDead: '#a9b3a8',
    blood: '#5a0b0d',
    red: '#d1121b',
    sub: '#f4f1ea',
    tag: '#ff4d4d',
    sepia: '#7a5a36',
  },
  font: {
    bn: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
    ko: "'Noto Serif KR', serif",
    koDisplay: "'Black Han Sans', 'Noto Serif KR', sans-serif",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.65, 0, 0.35, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
    slow: Easing.bezier(0.45, 0, 0.55, 1),
  },
};

const C = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** eased interpolate (never linear) */
export const ei = (
  f: number,
  input: number[],
  output: number[],
  easing: (t: number) => number = theme.ease.inOut,
) => interpolate(f, input, output, {...C, easing});

/** smooth value noise in [-1,1] */
export const noise = (t: number, seed: string | number) => {
  const i = Math.floor(t);
  const fr = t - i;
  const a = random(`${seed}-${i}`) * 2 - 1;
  const b = random(`${seed}-${i + 1}`) * 2 - 1;
  const s = fr * fr * (3 - 2 * fr);
  return a + (b - a) * s;
};

/** streetlight flicker: mostly on, deterministic bursts. returns 0..1 */
export const flicker = (frame: number, seed: string | number, rate = 0.12, burst?: number[]) => {
  let inBurst = false;
  if (burst) {
    for (const b of burst) if (frame >= b && frame < b + 14) inBurst = true;
  }
  const block = Math.floor(frame / 24);
  if (random(`fb-${seed}-${block}`) < rate) inBurst = true;
  if (!inBurst) return 1 - 0.04 * random(`fn-${seed}-${frame}`);
  const r = random(`fl-${seed}-${Math.floor(frame / 2)}`);
  return r < 0.45 ? 0.08 + r * 0.3 : 1;
};

/** seconds -> frames */
export const sf = (s: number) => Math.round(s * FPS);

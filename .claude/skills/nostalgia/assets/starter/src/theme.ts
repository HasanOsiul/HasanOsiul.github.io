import {Easing, interpolate} from 'remotion';

export const C = {
  line: '#2a1912',
  skin: '#c9784a',
  skinShade: '#a65a34',
  skinLight: '#e0955f',
  blush: '#ff4a4a',
  hair: '#1d1310',
  hairHi: '#3a2820',
  eyeWhite: '#fffaf0',
  pupil: '#140c0a',
  shirt: '#7fa8c4',
  shirtShade: '#5d86a6',
  shirtStripe: '#e9e2cf',
  shorts: '#5b5d3c',
  shortsShade: '#45472d',
  mouth: '#5a1716',
  tongue: '#e0605a',
  teeth: '#fffaf0',
  mango: '#6fa83a',
  mangoLight: '#b7d35a',
  mangoDark: '#4b7f2a',
  flesh: '#eef0b0',
  bark: '#5e3b27',
  barkDark: '#3f2618',
  barkLight: '#8a5a3a',
  leafDark: '#24452a',
  leafMid: '#3d6b31',
  leafLight: '#6b9440',
  leafRim: '#d9b64e',
  skyTop: '#363a74',
  skyMid: '#8d5b8e',
  skyLow: '#e88c69',
  skyHorizon: '#ffd497',
  sun: '#fff3c8',
  ground: '#d29660',
  groundDark: '#8a5232',
  mud: '#c78a58',
  mudShade: '#9a6440',
  tin: '#8c6152',
  far: '#6d4b6f',
  far2: '#4d3653',
};

export const EASE = {
  soft: Easing.bezier(0.45, 0, 0.25, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
};

export const iv = (
  f: number,
  input: number[],
  output: number[],
  ease: (t: number) => number = EASE.soft,
) =>
  interpolate(f, input, output, {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// smooth layered wind signal, t in seconds
export const wind = (t: number, i = 0) =>
  Math.sin(t * 2.1 + i * 0.7) * 0.55 +
  Math.sin(t * 3.9 + i * 1.3) * 0.22 +
  (Math.sin(t * 0.55) + 1) * 0.35;

import React from 'react';
import {AbsoluteFill, Img, random, staticFile, useCurrentFrame} from 'remotion';
import {ei, noise, theme} from './theme';

/** film grain (8 pre-rendered noise plates, cycled) */
export const Grain: React.FC<{amount?: number}> = ({amount = 0.16}) => {
  const f = useCurrentFrame();
  const i = Math.floor(random(`gr${f}`) * 8);
  const ox = Math.floor(random(`gx${f}`) * 40);
  return (
    <AbsoluteFill style={{mixBlendMode: 'overlay', opacity: amount, pointerEvents: 'none'}}>
      <Img src={staticFile(`grain/g${i}.png`)} style={{width: 1160, height: 2000, marginLeft: -ox, marginTop: -ox, imageRendering: 'pixelated'}} />
    </AbsoluteFill>
  );
};

/** dust + scratches for flashback film look */
export const Dust: React.FC<{amount?: number}> = ({amount = 0.5}) => {
  const f = useCurrentFrame();
  const i = Math.floor(f / 2) % 4;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: amount}}>
      <Img src={staticFile(`grain/d${i}.png`)} style={{width: 1080, height: 1920}} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.85}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,${strength * 0.6}) 75%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** cinematic grade: cold teal shadows, crushed blacks */
export const Grade: React.FC<{mode?: 'night' | 'sepia' | 'red' | 'cold'}> = ({mode = 'night'}) => {
  const map = {
    night: ['#0f3b45', 0.35, '#1a0f1f', 0.18],
    cold: ['#0b2f4d', 0.45, '#000', 0.25],
    sepia: ['#7a5228', 0.55, '#2a1a0a', 0.2],
    red: ['#6b0b10', 0.45, '#000', 0.2],
  } as const;
  const [c1, o1, c2, o2] = map[mode];
  return (
    <>
      <AbsoluteFill style={{background: c1, mixBlendMode: mode === 'sepia' ? 'color' : 'soft-light', opacity: o1}} />
      <AbsoluteFill style={{background: c2, mixBlendMode: 'multiply', opacity: o2}} />
    </>
  );
};

export const Flash: React.FC<{at: number[]; color?: string; len?: number}> = ({at, color = '#fff', len = 4}) => {
  const f = useCurrentFrame();
  let o = 0;
  for (const a of at) if (f >= a && f < a + len) o = Math.max(o, 1 - (f - a) / len);
  return o > 0 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};

/** screen shake transform string */
export const shake = (f: number, amp: number, seed = 'sh') =>
  amp > 0.01 ? `translate(${noise(f * 0.9, seed) * amp}px, ${noise(f * 0.9, seed + 'y') * amp}px) rotate(${noise(f * 0.5, seed + 'r') * amp * 0.03}deg)` : '';

/** SVG filters used across scenes (chromatic aberration, motion blur) */
export const FxDefs: React.FC<{ca: number; blurX: number}> = ({ca, blurX}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="ca" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={ca} dy={0} result="r2" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx={-ca} dy={ca * 0.3} result="b2" />
        <feBlend in="r2" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b2" mode="screen" />
      </filter>
      <filter id="mblur" x="-10%" y="0" width="120%" height="100%">
        <feGaussianBlur stdDeviation={`${blurX} 0`} />
      </filter>
    </defs>
  </svg>
);

/**
 * Post stack wrapper: applies shake, chromatic aberration, motion blur and
 * glitch slices to whatever scene is passed in as children (a render fn so
 * the glitch can duplicate it).
 */
export const Post: React.FC<{
  render: () => React.ReactNode;
  shakeAmp?: number;
  ca?: number;
  blurX?: number;
  blur?: number;
  glitch?: number;
  zoom?: number;
  seed?: string;
  origin?: string;
  tx?: number;
}> = ({render, shakeAmp = 0, ca = 0, blurX = 0, blur = 0, glitch = 0, zoom = 1, seed = 'p', origin = '50% 50%', tx = 0}) => {
  const f = useCurrentFrame();
  const filters: string[] = [];
  if (ca > 0.5) filters.push('url(#ca)');
  if (blurX > 0.5) filters.push('url(#mblur)');
  if (blur > 0.3) filters.push(`blur(${blur}px)`);
  const tf = `translateX(${tx}px) ${shake(f, shakeAmp, seed)} scale(${zoom})`;
  const slices: React.ReactNode[] = [];
  if (glitch > 0.05) {
    const n = 3 + Math.floor(random(`gn${f}`) * 4);
    for (let i = 0; i < n; i++) {
      const y = random(`gy${f}-${i}`) * 1920;
      const h = 20 + random(`gh${f}-${i}`) * 160 * glitch;
      const dx = (random(`gd${f}-${i}`) - 0.5) * 220 * glitch;
      slices.push(
        <AbsoluteFill key={i} style={{clipPath: `inset(${y}px 0 ${Math.max(0, 1920 - y - h)}px 0)`, transform: `translateX(${dx}px)`, filter: i % 2 ? 'hue-rotate(140deg) saturate(3)' : 'invert(0.15)'}}>
          {render()}
        </AbsoluteFill>,
      );
    }
  }
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <FxDefs ca={ca} blurX={blurX} />
      <AbsoluteFill style={{transform: tf, transformOrigin: origin, filter: filters.join(' ') || undefined}}>
        {render()}
        {slices}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** dark overlay driven by a lamp flicker value */
export const Darken: React.FC<{v: number}> = ({v}) => (v > 0.01 ? <AbsoluteFill style={{background: '#000', opacity: v}} /> : null);

/** kinetic chapter card */
export const ChapterCard: React.FC<{num: string; title: string; dur: number}> = ({num, title, dur}) => {
  const f = useCurrentFrame();
  const words = title.split(' ');
  const out = ei(f, [dur - 12, dur], [1, 0], theme.ease.in);
  const lineW = ei(f, [4, 30], [0, 520], theme.ease.out);
  const flick = random(`cf${Math.floor(f / 2)}`) < 0.08 ? 0.3 : 1;
  return (
    <AbsoluteFill style={{background: '#020304', alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(80,20,24,0.35), rgba(0,0,0,0) 70%)'}} />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, transform: `translateY(${-60 + noise(f / 20, 'cc') * 4}px)`}}>
        <div
          style={{
            fontFamily: theme.font.bn,
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: 0,
            color: '#b8a9a0',
            opacity: ei(f, [0, 14], [0, 1]) * flick,
            transform: `translateY(${ei(f, [0, 18], [20, 0], theme.ease.out)}px)`,
          }}
        >
          {num}
        </div>
        <div style={{height: 4, width: lineW, background: theme.color.red, boxShadow: `0 0 18px ${theme.color.red}`}} />
        <div style={{display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 920}}>
          {words.map((w, i) => {
            const d = 10 + i * 5;
            return (
              <span
                key={i}
                style={{
                  fontFamily: theme.font.bn,
                  fontWeight: 700,
                  fontSize: 110,
                  lineHeight: 1.25,
                  color: '#f2ece4',
                  textShadow: `0 0 30px rgba(209,18,27,0.55), 4px 4px 0 #000`,
                  opacity: ei(f, [d, d + 14], [0, 1]),
                  filter: `blur(${ei(f, [d, d + 16], [14, 0], theme.ease.out)}px)`,
                  transform: `translateY(${ei(f, [d, d + 20], [40, 0], theme.ease.out)}px) scale(${ei(f, [d, d + 20], [1.25, 1], theme.ease.out)})`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

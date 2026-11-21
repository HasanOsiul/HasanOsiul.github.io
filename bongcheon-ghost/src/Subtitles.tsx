import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import TL from './timeline.json';
import {ei, noise, sf, theme} from './theme';

type Sub = {t: number; e: number; text: string; tag?: string; ko?: string; kind?: string};

/**
 * Big animated Bengali subtitles + Korean dialogue lines + human-reaction tags.
 * Words reveal with stagger (opacity + rise + blur); exits are fast.
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const subs = TL.subs as Sub[];
  const cur = subs.find((s) => frame >= sf(s.t) && frame < sf(s.e));
  if (!cur) return null;
  const f = frame - sf(cur.t);
  const dur = sf(cur.e) - sf(cur.t);
  const kind = cur.kind ?? 'narr';
  const out = ei(f, [dur - 6, dur], [1, 0], theme.ease.in);
  const words = cur.text.split(' ');
  const isGhost = kind === 'ghost';
  const isScream = kind === 'scream';
  const shakeAmp = isScream ? 14 : isGhost ? 2.5 : 0;
  const sx = noise(frame * 1.1, 'subx') * shakeAmp;
  const sy = noise(frame * 1.1, 'suby') * shakeAmp;
  const bnColor = kind === 'girl' ? '#d9ecff' : kind === 'other' ? '#ffe9c7' : isGhost || isScream ? '#ffd9d9' : theme.color.sub;
  const bnSize = isScream ? 84 : 68;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* readability band */}
      <AbsoluteFill
        style={{
          top: 1150,
          height: 560,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0) 100%)',
          opacity: out * ei(f, [0, 8], [0, 1]),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: isGhost ? 1330 : isScream ? 1130 : 1260,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          opacity: out,
          transform: `translate(${sx}px, ${sy}px)`,
        }}
      >
        {cur.tag && (
          <div
            style={{
              fontFamily: theme.font.bn,
              fontWeight: 600,
              fontSize: 40,
              color: theme.color.tag,
              letterSpacing: 0,
              textShadow: '0 0 14px rgba(255,40,40,0.6), 2px 2px 0 #000',
              opacity: ei(f, [0, 8], [0, 1]) * (0.75 + 0.25 * Math.sin(frame / 4)),
              transform: `translateY(${ei(f, [0, 12], [-14, 0], theme.ease.out)}px)`,
            }}
          >
            ( {cur.tag} )
          </div>
        )}
        {cur.ko && (
          <div style={{display: 'flex', gap: isScream ? 4 : 2, flexWrap: 'wrap', justifyContent: 'center'}}>
            {Array.from(cur.ko).map((ch, i) => {
              const d = i * (isScream ? 1 : 3);
              const jit = isGhost ? noise(frame * 0.7 + i * 3, 'kj') * 3 : 0;
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: isScream ? theme.font.koDisplay : theme.font.ko,
                    fontWeight: 900,
                    fontSize: isScream ? 86 : kind === 'ghost' ? 96 : 70,
                    color: isGhost || isScream ? '#e01822' : kind === 'girl' ? '#cfe6ff' : '#ffe2b8',
                    whiteSpace: 'pre',
                    textShadow: isGhost || isScream ? '0 0 24px rgba(224,24,34,0.8), -4px 0 0 rgba(0,255,255,0.35), 4px 0 0 rgba(255,0,60,0.5), 3px 3px 0 #000' : '3px 3px 0 #000',
                    opacity: ei(f, [d, d + 6], [0, 1]),
                    transform: `translateY(${ei(f, [d, d + 10], [isScream ? -60 : 24, 0], theme.ease.out) + jit}px) scale(${ei(f, [d, d + 8], [isScream ? 1.8 : 1.3, 1], theme.ease.out)}) rotate(${jit * 1.5}deg)`,
                    display: 'inline-block',
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        )}
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 18, rowGap: 0}}>
          {words.map((w, i) => {
            const d = (cur.ko ? 8 : 0) + i * 3;
            return (
              <span
                key={i}
                style={{
                  fontFamily: theme.font.bn,
                  fontWeight: 700,
                  fontSize: bnSize,
                  lineHeight: 1.45,
                  color: bnColor,
                  WebkitTextStroke: '2px rgba(0,0,0,0.85)',
                  paintOrder: 'stroke fill',
                  textShadow: '0 4px 18px rgba(0,0,0,0.9), 3px 3px 0 #000',
                  display: 'inline-block',
                  opacity: ei(f, [d, d + 7], [0, 1]),
                  filter: `blur(${ei(f, [d, d + 8], [8, 0], theme.ease.out)}px)`,
                  transform: `translateY(${ei(f, [d, d + 12], [26, 0], theme.ease.out)}px) scale(${ei(f, [d, d + 12], [1.12, 1], theme.ease.out)})`,
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

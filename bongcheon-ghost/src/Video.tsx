import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Sequence} from 'remotion';
import '@fontsource/hind-siliguri/500.css';
import '@fontsource/hind-siliguri/600.css';
import '@fontsource/hind-siliguri/700.css';
import '@fontsource/noto-serif-kr/700.css';
import '@fontsource/noto-serif-kr/900.css';
import '@fontsource/black-han-sans/400.css';
import TL from './timeline.json';
import {sf} from './theme';
import {Grain, Vignette} from './fx';
import {Subtitles} from './Subtitles';
import * as S from './scenes';

const KO_TEXT =
  '봉천동 귀신 서울 관악구 편의점 세탁소 약국 PC방 노래방 부동산 0123456789동 ' +
  TL.subs.map((s: {ko?: string}) => s.ko ?? '').join(' ');
const BN_TEXT = TL.subs.map((s: {text: string; tag?: string}) => s.text + (s.tag ?? '')).join(' ') + ' বংচন-দং ভূত অধ্যায় তাহলে তুমি কী উত্তর দেবে নোট';

const SCENES: Record<string, React.FC<any>> = {
  title: S.TitleScene,
  card: S.CardScene,
  street: S.StreetScene,
  walk: S.WalkScene,
  ghostAhead: S.GhostAheadScene,
  ghostClose: S.GhostCloseScene,
  girlFace: S.GirlFaceScene,
  stop: S.StopScene,
  headTurn: S.HeadTurnScene,
  faceReveal: S.FaceRevealScene,
  point: S.PointScene,
  walkAway: S.WalkAwayScene,
  scream: S.ScreamScene,
  chase: S.ChaseScene,
  black: S.BlackScene,
  wake: S.WakeScene,
  backstory: S.BackstoryScene,
  ending: S.EndingScene,
  endcard: S.EndCardScene,
};

export const Video: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("700 68px 'Hind Siliguri'", BN_TEXT),
      document.fonts.load("600 40px 'Hind Siliguri'", BN_TEXT),
      document.fonts.load("500 44px 'Hind Siliguri'", BN_TEXT),
      document.fonts.load("900 96px 'Noto Serif KR'", KO_TEXT),
      document.fonts.load("700 52px 'Noto Serif KR'", KO_TEXT),
      document.fonts.load("400 100px 'Black Han Sans'", KO_TEXT),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TL.scenes.map((s: any, i: number) => {
        const C = SCENES[s.id];
        const from = sf(s.start);
        const dur = sf(s.end) - from;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} name={`${s.id}${s.title ? ' · ' + s.title : ''}`}>
            <C dur={dur} num={s.num} title={s.title} />
          </Sequence>
        );
      })}
      <Vignette strength={0.9} />
      <Grain amount={0.2} />
      <Subtitles />
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {Actor, Cam, Street} from './street';
import {Ghost, GhostPose, ghostRun, ghostStand, ghostWalk, GirlBack} from './characters';
import {CrowdRing, GhostFaceBig, GirlFace, PointingHand} from './faces';
import {BackDoor, BackRoom, BackTower, BackWindow} from './backstory';
import {ChapterCard, Darken, Dust, Flash, Grade, Post} from './fx';
import {ei, flicker, noise, theme} from './theme';

const useLocal = () => {
  const f = useCurrentFrame();
  return {f, t: f / 30};
};

/* ---------------------------------------------------------- actor helpers */
const girl = (X: number, Z: number, phase: number, walk: number, t: number, extra: {look?: number; blur?: boolean; tremble?: number} = {}): Actor => ({
  X,
  Z,
  node: () => (
    <g filter={extra.blur ? 'url(#dof)' : undefined}>
      <GirlBack phase={phase} walk={walk} t={t} look={extra.look} tremble={extra.tremble} />
    </g>
  ),
});
const ghost = (X: number, Z: number, pose: GhostPose, t: number, opacity = 1, glow = 0.4): Actor => ({
  X,
  Z,
  shadow: 0.35 * opacity,
  node: () => (
    <g opacity={opacity}>
      <Ghost pose={pose} t={t} glow={glow} />
    </g>
  ),
});
const lampAt = (k: number) => k * 6 + 3;
/** screen position of a world point (mirror of Street projection) */
const proj = (cam: Cam, X: number, Y: number, Z: number) => {
  const dz = Math.max(Z - cam.z, 0.12);
  return {x: 540 + (X - cam.x) / dz, y: cam.vpY + (cam.h - Y) / dz};
};
/** mouth opening for a voiced line (syllable-rate) */
const talk = (t: number, start: number, end: number, syl = 0.36) =>
  t >= start && t < end ? 0.35 + 0.6 * Math.abs(Math.sin((Math.PI * (t - start)) / syl)) : 0.15;

/* ================================================================ TITLE */
export const TitleScene: React.FC<{dur: number}> = ({dur}) => {
  const {f, t} = useLocal();
  const cam: Cam = {z: t * 0.18, x: noise(t * 0.3, 'tc') * 30, h: 1000, vpY: 820};
  const L2 = flicker(f, 'lamp2', 0.3);
  const render = () => (
    <AbsoluteFill>
      <Street
        cam={cam}
        frame={f}
        fog={1}
        dark={0.3}
        flickRate={0.3}
        lampLevel={(k) => (k === 2 ? 1 : 0.15)}
        actors={[ghost(-140, 15.7, ghostStand(t), t, L2 > 0.5 ? 0.85 : 0.12, 0.6)]}
      />
      <Grade mode="cold" />
      <Darken v={(1 - L2) * 0.35} />
    </AbsoluteFill>
  );
  const g = (f >= 45 && f < 52) || f > dur - 10 ? 0.7 : 0;
  const ko = '봉천동 귀신';
  const exit = ei(f, [dur - 10, dur], [1, 0], theme.ease.in);
  return (
    <AbsoluteFill>
      <Post render={render} glitch={g} ca={g ? 10 : 2} zoom={1.05 + t * 0.01} />
      <AbsoluteFill style={{alignItems: 'center', top: 520, opacity: exit}}>
        <div style={{display: 'flex', gap: 6}}>
          {Array.from(ko).map((ch, i) => {
            const d = 45 + i * 3;
            return (
              <span
                key={i}
                style={{
                  fontFamily: theme.font.koDisplay,
                  fontSize: 168,
                  color: theme.color.red,
                  whiteSpace: 'pre',
                  display: 'inline-block',
                  textShadow: '0 0 40px rgba(209,18,27,0.7), -6px 0 0 rgba(0,255,255,0.25), 6px 0 0 rgba(255,0,80,0.4), 6px 6px 0 #000',
                  opacity: ei(f, [d, d + 4], [0, 1]),
                  transform: `scale(${ei(f, [d, d + 8], [2.2, 1], theme.ease.out)}) translateY(${noise(f * 0.8 + i, 'tj') * 3}px)`,
                  filter: `blur(${ei(f, [d, d + 8], [16, 0], theme.ease.out)}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: theme.font.bn,
            fontWeight: 700,
            fontSize: 104,
            color: '#f1ebe3',
            textShadow: '4px 4px 0 #000, 0 0 30px rgba(0,0,0,0.8)',
            opacity: ei(f, [62, 76], [0, 1]),
            transform: `translateY(${ei(f, [62, 84], [40, 0], theme.ease.out)}px)`,
            letterSpacing: 2,
          }}
        >
          বংচন-দং ভূত
        </div>
        <div style={{height: 4, marginTop: 18, width: ei(f, [70, 100], [0, 560], theme.ease.out), background: theme.color.red, boxShadow: '0 0 16px #d1121b'}} />
        <div
          style={{
            marginTop: 26,
            fontFamily: theme.font.bn,
            fontWeight: 500,
            fontSize: 44,
            color: '#c9bdb2',
            letterSpacing: 0,
            opacity: ei(f, [88, 104], [0, 1]),
            transform: `translateY(${ei(f, [88, 110], [20, 0], theme.ease.out)}px)`,
          }}
        >
          কোরিয়ার বিখ্যাত শহুরে কিংবদন্তি
        </div>
      </AbsoluteFill>
      <Flash at={[45]} len={5} />
    </AbsoluteFill>
  );
};

/* ================================================================ CHAPTER CARD */
export const CardScene: React.FC<{dur: number; num: string; title: string}> = ({dur, num, title}) => <ChapterCard dur={dur} num={num} title={title} />;

/* ================================================================ 1. STREET (tilt down + time) */
export const StreetScene: React.FC<{dur: number}> = ({dur}) => {
  const {f, t} = useLocal();
  const cam: Cam = {
    z: ei(t, [0, 13.5], [0, 4.5], theme.ease.slow),
    x: -60 + noise(t * 0.25, 'sc') * 40,
    h: 1000,
    vpY: ei(t, [0, 6], [2900, 800], theme.ease.inOut),
  };
  const gz = cam.z + ei(t, [8.2, 13.5], [0.45, 2.3], theme.ease.out);
  const actors = t > 8.2 ? [girl(-60, gz, t * 0.95, 1, t)] : [];
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.7} flickRate={0.05} actors={actors} />
      <Grade mode="night" />
    </AbsoluteFill>
  );
  const clockIn = ei(f, [30, 42], [0, 1], theme.ease.out);
  const clockOut = ei(f, [128, 136], [1, 0], theme.ease.in);
  const locIn = ei(f, [140, 154], [0, 1], theme.ease.out) * ei(f, [250, 258], [1, 0], theme.ease.in);
  const blinkColon = Math.floor(f / 15) % 2 ? 1 : 0.2;
  return (
    <AbsoluteFill>
      <Post render={render} zoom={1 + t * 0.004} />
      <AbsoluteFill style={{alignItems: 'center', top: 300, opacity: clockIn * clockOut}}>
        <div
          style={{
            fontFamily: theme.font.koDisplay,
            fontSize: 150,
            color: '#ff3b3b',
            textShadow: '0 0 30px rgba(255,40,40,0.8), 4px 4px 0 #000',
            transform: `scale(${ei(f, [30, 44], [1.4, 1], theme.ease.out)})`,
            filter: `blur(${ei(f, [30, 40], [10, 0])}px)`,
            letterSpacing: 6,
          }}
        >
          23<span style={{opacity: blinkColon}}>:</span>20
        </div>
        <div style={{fontFamily: theme.font.bn, fontWeight: 600, fontSize: 46, color: '#e9dcd0', marginTop: 4, opacity: ei(f, [40, 52], [0, 1])}}>
          রাত ১১টা ২০ মিনিট
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{top: 300, left: 70, opacity: locIn}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${ei(f, [140, 160], [-40, 0], theme.ease.out)}px)`}}>
          <div style={{width: 8, height: 110, background: theme.color.red, boxShadow: '0 0 12px #d1121b'}} />
          <div>
            <div style={{fontFamily: theme.font.ko, fontWeight: 700, fontSize: 52, color: '#f3ece3'}}>서울 관악구 봉천동</div>
            <div style={{fontFamily: theme.font.bn, fontWeight: 600, fontSize: 40, color: '#bfb1a6'}}>সিউল · বংচন-দং</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================ 2. WALK */
export const WalkScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const dist = t < 10.5 ? 0.9 * t : 9.45 + 1.25 * (t - 10.5);
  const gz = 6 + dist;
  const phase = t < 10.5 ? t * 0.95 : 9.975 + (t - 10.5) * 1.3;
  let cam: Cam;
  let shakeAmp = 0;
  if (t < 7) cam = {z: gz - 1.9, x: -100 + noise(t * 0.4, 'wc') * 25, h: 1150, vpY: 800};
  else if (t < 10.5) cam = {z: gz - 1.35, x: 260, h: 380, vpY: 1050};
  else {
    cam = {z: gz - 1.5, x: -40 + noise(t, 'wc2') * 40, h: 1100, vpY: 820};
    shakeAmp = 7;
  }
  const bursts = [60, 225, 276];
  const k = Math.round((gz - 3) / 6);
  const L = flicker(f, `lamp${k}`, 0.05, bursts);
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.65} flickRate={0.05} bursts={bursts} actors={[girl(-70, gz, phase, 1, t)]} />
      <Grade mode="night" />
      <Darken v={(1 - L) * 0.45} />
    </AbsoluteFill>
  );
  return <Post render={render} shakeAmp={shakeAmp} ca={t > 10.5 ? 2 : 0} />;
};

/* ================================================================ 3. GHOST AHEAD */
export const GhostAheadScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const camZ = 20.3;
  const cam: Cam = {z: camZ, x: 120, h: 1150, vpY: 800};
  const gZ = 32.7 + t * 0.12;
  const gp = ghostWalk((Math.floor(t * 8) / 8) * 0.5, t);
  const head = proj(cam, 0, 900, gZ);
  const zoom = ei(t, [0, 0.3], [1, 1.12], theme.ease.out) * ei(t, [4.3, 9], [1, 2.5], theme.ease.inOut);
  const render = () => (
    <AbsoluteFill>
      <Street
        cam={cam}
        frame={f}
        fog={0.6}
        flickRate={0.04}
        bursts={[45]}
        lampLevel={(k) => (k === 5 ? 1.15 : 1)}
        actors={[girl(-340, camZ + 1.5, 0.25, ei(t, [0, 0.5], [1, 0]), t, {blur: t > 4.6, tremble: 1}), ghost(40, gZ, gp, t, 1, 0.5)]}
      />
      <Grade mode="night" />
    </AbsoluteFill>
  );
  return <Post render={render} zoom={zoom} origin={`${head.x}px ${head.y}px`} ca={1.5} shakeAmp={ei(t, [0, 0.4], [10, 1])} />;
};

/* ================================================================ 4. GHOST CLOSE (broken walk) */
export const GhostCloseScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const step = Math.floor(t * 8) / 8; // frame-by-frame stutter (8 fps)
  const gZ = 40 + step * 0.35;
  const cam: Cam = {z: gZ - 2.15 + t * 0.09, x: -280, h: 620, vpY: 720};
  const gp = ghostWalk(step * 0.55, t);
  const tw = (t > 2.1 && t < 2.2) || (t > 4.6 && t < 4.7) || (t > 6.2 && t < 6.3);
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.55} flickRate={0.08} bursts={[60]} actors={[ghost(0, gZ, tw ? {...gp, headTilt: gp.headTilt + 40, armL: [40, 30]} : gp, t, 1, 0.5)]} />
      <Grade mode="night" />
    </AbsoluteFill>
  );
  return <Post render={render} glitch={tw ? 0.5 : 0} ca={tw ? 9 : 2.5} zoom={1.02 + t * 0.012} shakeAmp={tw ? 14 : 1.5} />;
};

/* ================================================================ 5. GIRL FACE */
export const GirlFaceScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  let pulse = 0;
  for (let b = 0.2; b < 7; b += 0.6) if (t >= b) pulse = Math.max(pulse, Math.exp(-(t - b) * 9));
  const look = ei(t, [3.1, 3.4], [0, -1], theme.ease.out) * ei(t, [4.2, 4.5], [1, 0], theme.ease.out);
  const blink = t > 1.6 && t < 1.7 ? 1 : 0;
  const render = () => (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(12px)', transform: 'scale(1.2)'}}>
        <Street cam={{z: 20, x: 300, h: 1300, vpY: 900}} frame={f} fog={0.6} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${(1 + 0.018 * pulse) * ei(t, [0, 7], [1, 1.12], theme.ease.slow)})`}}>
        <GirlFace fear={ei(t, [0, 6], [0.55, 0.9])} t={t} mouth={0.25} blink={blink} look={look} />
      </AbsoluteFill>
      <Grade mode="night" />
    </AbsoluteFill>
  );
  return <Post render={render} ca={1.5 + pulse * 4} />;
};

/* ================================================================ 6. STOP */
export const StopScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const camZ = 50 + ei(t, [0, 3.4], [0, 2.4], theme.ease.out);
  const cam: Cam = {z: camZ, x: 120, h: 1150, vpY: 800};
  const gZ = 57.4;
  const gp = t < 0.6 ? ghostWalk(t * 0.5, t) : ghostStand(t);
  const head = proj(cam, 0, 950, gZ);
  const zoom = ei(t, [4.5, 8.5], [1, 1.7], theme.ease.inOut);
  const walk = t < 3.2 ? 1 : ei(t, [3.2, 3.5], [1, 0]);
  const render = () => (
    <AbsoluteFill>
      <Street
        cam={cam}
        frame={f}
        fog={0.6}
        flickRate={0.02}
        bursts={[45, 165]}
        actors={[girl(-340, camZ + 1.5, t * 0.8, walk, t, {blur: t > 4.6, tremble: 0.6}), ghost(20, gZ, gp, t, 1, 0.5)]}
      />
      <Grade mode="cold" />
      <Darken v={ei(t, [5, 6.5], [0, 0.22])} />
    </AbsoluteFill>
  );
  return <Post render={render} zoom={zoom} origin={`${head.x}px ${head.y}px`} ca={1.2} />;
};

/* ================================================================ 7. HEAD TURN */
export const HeadTurnScene: React.FC<{dur: number}> = ({dur}) => {
  const {f, t} = useLocal();
  const base = ei(t, [0.3, 7.3], [0, 1], theme.ease.slow);
  const q = base * 9;
  const i = Math.floor(q);
  const turn = Math.min(1, (i + Math.min(1, (q - i) * 4)) / 9);
  const gZ = 80.5;
  const cam: Cam = {z: gZ - 1.3 + ei(t, [0, 8], [0, 0.25], theme.ease.slow), x: 30 + noise(t * 0.3, 'htc') * 10, h: 1450, vpY: 620};
  const pose: GhostPose = {...ghostStand(t), headTurn: turn, headTilt: 30 + 28 * turn + (q - i < 0.2 ? 4 : 0), neck: 26 * turn};
  const end = t > 7.4;
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.5} flickRate={0.02} bursts={[30, 165]} actors={[ghost(0, gZ, pose, t, 1, 0.3)]} />
      <Grade mode="cold" />
    </AbsoluteFill>
  );
  return <Post render={render} ca={end ? 12 : 1.5 + turn * 2} glitch={f > dur - 6 ? 0.6 : 0} shakeAmp={q - i < 0.15 ? 5 : 0} zoom={ei(t, [0, 8], [1, 1.08])} />;
};

/* ================================================================ 8. FACE REVEAL */
export const FaceRevealScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const m = ei(t, [0, 0.45], [0.2, 1], theme.ease.out);
  const mouth = Math.max(talk(t, 4.4, 7.0, 0.38), talk(t, 8.6, 10.6, 0.4), ei(t, [0, 0.3], [0.8, 0.15]));
  const hits = (t < 0.25) || (t > 4.4 && t < 4.5) || (t > 8.6 && t < 8.7);
  const zoom = ei(t, [0, 0.25], [1.35, 1], theme.ease.out) * ei(t, [0.3, 8], [1, 1.12], theme.ease.slow) * ei(t, [8, 12], [1, 1.25], theme.ease.inOut);
  const render = () => (
    <AbsoluteFill>
      <GhostFaceBig m={m} mouth={mouth} t={t} />
      <Grade mode="cold" />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      <Post render={render} zoom={zoom} origin="50% 42%" ca={hits ? 14 : 2.5} glitch={hits ? 0.55 : 0} shakeAmp={ei(t, [0, 0.8], [40, 2])} />
      <Flash at={[0]} len={5} />
    </AbsoluteFill>
  );
};

/* ================================================================ 9. POINT */
export const PointScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const cam: Cam = {z: 99, x: -40 + noise(t * 2, 'pc') * (t < 6.5 ? 14 : 4), h: 1100, vpY: 820};
  const walking = t > 6.6;
  const gZ = walking ? 101.7 + (t - 6.6) * 0.75 : 101.7;
  const turn = t < 6.3 ? 1 : ei(t, [6.3, 6.45], [1, 0], theme.ease.out);
  const pose: GhostPose = walking ? ghostWalk((Math.floor(t * 8) / 8) * 0.55, t) : {...ghostStand(t), headTurn: turn, headTilt: 58 - (1 - turn) * 28, neck: 26 * turn};
  const extend = ei(t, [3.0, 3.9], [0, 1], theme.ease.out) * ei(t, [7.6, 8.6], [1, 0], theme.ease.inOut);
  const relief = ei(t, [9.3, 11.5], [0, 1], theme.ease.slow);
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.6} flickRate={0.03} actors={[ghost(60, gZ, pose, t, 1, 0.4)]} />
      <Grade mode="night" />
      <Darken v={0.18 * (1 - relief)} />
      {extend > 0.01 && <PointingHand t={t} tremble={t < 6.6 ? 1 : 0.4} extend={extend} />}
    </AbsoluteFill>
  );
  return <Post render={render} zoom={ei(t, [0, 6], [1.04, 1.12]) * ei(t, [9.3, 12], [1, 0.95], theme.ease.slow)} ca={1.5} shakeAmp={t < 6.6 ? 3 : 0} />;
};

/* ================================================================ 10. WALK AWAY (watched) */
export const WalkAwayScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const stopT = 8.4;
  const tt = Math.min(t, stopT);
  const gz = 140 + 0.55 * tt;
  const cam: Cam = {z: gz - ei(t, [0, stopT], [2.6, 1.35], theme.ease.inOut), x: noise(t * 0.5, 'wa') * 60, h: 1250 + noise(t * 0.6, 'wah') * 30, vpY: 820};
  const look = ei(t, [4.2, 4.6], [0, 0.5], theme.ease.out) * ei(t, [5.2, 5.6], [1, 0], theme.ease.out);
  const wh = [4.3, 5.4, 6.5, 7.4].some((w) => t > w && t < w + 0.1);
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.95} flickRate={0.04} bursts={[75, 165]} actors={[girl(-30, gz, tt * 0.72, t < stopT ? 0.75 : 0, t, {look, tremble: 0.5})]} />
      <Grade mode="cold" />
      <Darken v={0.12} />
    </AbsoluteFill>
  );
  return <Post render={render} glitch={wh ? 0.2 : 0} ca={wh ? 6 : 1.5} zoom={1.03} />;
};

/* ================================================================ 11. SCREAM */
export const ScreamScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const gz = 144.6;
  const cam: Cam = {z: gz - 1.35, x: 0, h: 1250, vpY: 820};
  const hit = t >= 1.2;
  if (t < 2.2) {
    const dark = t < 0.3 ? 0.15 : t < 1.2 ? 0.62 : 0.1;
    const render = () => (
      <AbsoluteFill>
        <Street cam={cam} frame={hit ? f : 9} fog={0.95} flickRate={hit ? 0.6 : 0} actors={[girl(-30, gz, 0.4, 0, t, {tremble: hit ? 2 : 0})]} />
        <Grade mode={hit ? 'red' : 'cold'} />
        <Darken v={dark} />
      </AbsoluteFill>
    );
    return (
      <AbsoluteFill>
        <Post render={render} shakeAmp={hit ? ei(t, [1.2, 2.2], [48, 14]) : 0} ca={hit ? ei(t, [1.2, 2.2], [16, 5]) : 0} glitch={hit && t < 1.45 ? 0.7 : 0} zoom={hit ? ei(t, [1.2, 1.4], [1.15, 1.05], theme.ease.out) : 1.03} />
        <Flash at={[36]} color="#a00" len={5} />
      </AbsoluteFill>
    );
  }
  const whip = ei(t, [4.6, 5.0], [0, -1250], theme.ease.in);
  const render = () => (
    <AbsoluteFill>
      <AbsoluteFill style={{filter: 'blur(14px)'}}>
        <Street cam={{z: 100, x: -200, h: 1200, vpY: 900}} frame={f} fog={0.8} flickRate={0.5} />
      </AbsoluteFill>
      <GirlFace fear={1} t={t} mouth={0.8} />
      <Grade mode="cold" />
    </AbsoluteFill>
  );
  return (
    <Post
      render={render}
      tx={whip}
      blurX={t > 4.6 ? 60 : 0}
      zoom={ei(t, [2.2, 2.55], [1, 1.32], theme.ease.out) * ei(t, [2.55, 4.6], [1, 1.08])}
      shakeAmp={10}
      ca={4}
      origin="50% 45%"
    />
  );
};

/* ================================================================ 12. CHASE */
export const ChaseScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const cam: Cam = {z: 200, x: noise(t * 3, 'chx') * 30, h: 1050, vpY: 820};
  const dZ = t < 1.4 ? ei(t, [0, 1.4], [12, 7], theme.ease.out) : t < 3.2 ? ei(t, [1.4, 3.2], [7, 6.2], theme.ease.slow) : ei(t, [3.2, 6.6], [6.2, 0.38], theme.ease.in);
  const gZ = 200 + dZ;
  const pose = ghostRun(Math.floor(f / 3));
  const fast = t < 1.4 || t > 3.2;
  const rush = ei(t, [6.1, 6.6], [0, 1], theme.ease.in);
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.7} flickRate={0.35} actors={t < 6.25 ? [ghost(noise(t * 2, 'gx') * 90, gZ, pose, t, 1, 0.6)] : []} />
      <Grade mode="cold" />
      {rush > 0 && (
        <AbsoluteFill style={{transform: `scale(${0.4 + rush * 1.5})`, opacity: Math.min(1, rush * 3)}}>
          <GhostFaceBig m={1} mouth={1} t={t} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
  const arrive = ei(t, [0, 0.3], [1250, 0], theme.ease.out);
  const blackout = t > 6.72;
  if (blackout) return <AbsoluteFill style={{background: '#000'}}><Flash at={[201]} len={6} /></AbsoluteFill>;
  return (
    <AbsoluteFill>
      <Post
        render={render}
        tx={arrive}
        blurX={t < 0.3 ? 60 : fast ? 6 : 0}
        shakeAmp={ei(t, [0, 6.6], [6, 34], theme.ease.in)}
        ca={ei(t, [0, 6.6], [3, 16], theme.ease.in)}
        glitch={t > 6.2 ? 0.6 : random(`cg${Math.floor(f / 4)}`) < 0.08 ? 0.3 : 0}
        zoom={1 + rush * 0.2}
      />
      <Flash at={[198]} len={4} />
    </AbsoluteFill>
  );
};

/* ================================================================ BLACK */
export const BlackScene: React.FC<{dur: number}> = () => {
  const {t} = useLocal();
  let p = 0;
  for (const b of [0.1, 1.4]) if (t >= b) p = Math.max(p, Math.exp(-(t - b) * 3));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(0,0,0,0) 30%, rgba(110,0,0,1) 100%)', opacity: p * 0.6}} />
    </AbsoluteFill>
  );
};

/* ================================================================ 13. WAKE */
export const WakeScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  if (t < 7.5) {
    const lid = t < 0.7 ? 1 : t < 1.0 ? ei(t, [0.7, 1.0], [1, 0.35]) : t < 1.5 ? 0.35 : t < 1.7 ? ei(t, [1.5, 1.7], [0.35, 1]) : t < 2.1 ? ei(t, [1.7, 2.1], [1, 0.1]) : t < 3.0 ? 0.1 : t < 3.15 ? ei(t, [3.0, 3.15], [0.1, 1]) : ei(t, [3.15, 3.5], [1, 0]);
    const render = () => (
      <AbsoluteFill>
        <AbsoluteFill style={{filter: `blur(${ei(t, [0.8, 4.5], [30, 0], theme.ease.out)}px)`, transform: `rotate(${noise(t * 0.4, 'wr') * 4}deg) scale(1.1)`}}>
          <CrowdRing t={t} focus={ei(t, [1, 4.5], [0, 1])} />
        </AbsoluteFill>
        <Grade mode="night" />
        <AbsoluteFill style={{background: '#000', height: 960 * lid, borderBottomLeftRadius: '50% 30%', borderBottomRightRadius: '50% 30%'}} />
        <AbsoluteFill style={{background: '#000', top: 1920 - 960 * lid, height: 960 * lid, borderTopLeftRadius: '50% 30%', borderTopRightRadius: '50% 30%'}} />
      </AbsoluteFill>
    );
    return <Post render={render} ca={ei(t, [0, 4], [8, 1])} />;
  }
  if (t < 11.5) {
    const lt = t - 7.5;
    const cam: Cam = {z: 300, x: ei(lt, [0, 4], [-700, 700], theme.ease.inOut), h: 700, vpY: 860};
    const render = () => (
      <AbsoluteFill>
        <Street cam={cam} frame={f} fog={0.7} flickRate={0.03} />
        <Grade mode="night" />
      </AbsoluteFill>
    );
    return <Post render={render} blurX={Math.abs(ei(lt, [0, 2, 4], [0, 10, 0]))} />;
  }
  const lt = t - 11.5;
  const cam: Cam = {z: 300 + lt * 0.5, x: 0, h: 1050, vpY: 800};
  const sub = lt > 3.1 && lt < 3.17;
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.8} flickRate={0.05} actors={sub ? [ghost(0, 316.2, {...ghostStand(t), headTurn: 1, front: true}, t, 0.9, 0.8)] : []} />
      <Grade mode="cold" />
    </AbsoluteFill>
  );
  return <Post render={render} glitch={sub ? 0.4 : 0} ca={sub ? 10 : 1.5} zoom={1 + lt * 0.02} />;
};

/* ================================================================ 14. BACKSTORY */
export const BackstoryScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  let content: React.ReactNode;
  let zoom = 1;
  let mode: 'sepia' | 'cold' = 'sepia';
  let blur = 0;
  let glitch = 0;
  if (t < 8) {
    content = <BackRoom t={t} />;
    zoom = ei(t, [0, 8], [1.0, 1.1], theme.ease.slow);
  } else if (t < 14.5) {
    content = <BackDoor t={t - 8} tClose={1.5} />;
    zoom = ei(t, [8, 14.5], [1.06, 1.0], theme.ease.slow);
  } else if (t < 18) {
    content = <BackWindow t={t - 14.5} dur={3.5} />;
    zoom = ei(t, [14.5, 18], [1.0, 1.12], theme.ease.slow);
  } else if (t < 22.5) {
    const lt = t - 18;
    const tilt = lt < 3.8 ? ei(lt, [0, 3.6], [0, 2850], theme.ease.inOut) : ei(lt, [3.8, 4.15], [2850, -300], theme.ease.in);
    blur = lt > 3.8 && lt < 4.2 ? 16 : 0;
    content = lt > 4.25 ? <AbsoluteFill style={{background: '#000'}} /> : <BackTower t={lt} tilt={tilt} figure={ei(lt, [2.4, 3.2], [0, 1])} />;
  } else {
    const lt = t - 22.5;
    mode = 'cold';
    const on = random(`bs${Math.floor(f / 3)}`) < 0.7;
    glitch = random(`bsg${Math.floor(f / 5)}`) < 0.12 ? 0.35 : 0;
    content = (
      <Street
        cam={{z: 400 + lt * 0.3, x: 0, h: 1000, vpY: 800}}
        frame={f}
        fog={1}
        flickRate={0.2}
        actors={[ghost(-60, 404.6, {...ghostWalk(lt * 0.3, t), headTilt: 40}, t, on ? 0.45 : 0.15, 1)]}
      />
    );
    zoom = 1.02 + lt * 0.01;
  }
  const isFlash = [0, 8, 14.5, 18, 22.5].map((s) => Math.round(s * 30));
  const render = () => (
    <AbsoluteFill>
      {content}
      <Grade mode={mode} />
      {mode === 'sepia' && <Dust amount={0.35} />}
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill>
      <Post render={render} zoom={zoom} blur={blur} glitch={glitch} ca={mode === 'cold' ? 3 : 0.8} />
      <Flash at={isFlash} color="#f3d2a0" len={7} />
    </AbsoluteFill>
  );
};

/* ================================================================ 15. ENDING */
export const EndingScene: React.FC<{dur: number}> = () => {
  const {f, t} = useLocal();
  const camZ = 500 + ei(t, [0, 13], [0, 1.2], theme.ease.slow);
  const cam: Cam = {z: camZ, x: 0, h: 950, vpY: 820};
  const bursts = [75, 165, 270, 330];
  const gDZ = t < 2.4 ? -1 : t < 5.5 ? 16 : t < 9.0 ? 10.5 : t < 11 ? 6.2 : t < 12 ? 2.8 : 1.5;
  const L = flicker(f, 'end', 0, bursts);
  const pose: GhostPose = {...ghostStand(t), front: true, headTurn: 1, headTilt: 35 + noise(t, 'eht') * 4, mouth: talk(t, 11.6, 13.0, 0.38), eyes: 1};
  const actors = gDZ > 0 && t < 13.1 ? [ghost(0, camZ + gDZ, pose, t, 1, 0.5)] : [];
  if (t >= 13.1 && t < 13.5) return <AbsoluteFill style={{background: '#000'}} />;
  if (t >= 13.5) {
    if (t > 14.2) return <AbsoluteFill style={{background: '#000'}} />;
    const render = () => (
      <AbsoluteFill>
        <GhostFaceBig m={1} mouth={1} t={t * 3} />
        <Grade mode="red" />
      </AbsoluteFill>
    );
    return (
      <AbsoluteFill>
        <Post render={render} zoom={ei(t, [13.5, 13.7], [2.2, 1.25], theme.ease.out)} shakeAmp={60} ca={22} glitch={0.6} />
        <Flash at={[405, 410]} len={3} />
      </AbsoluteFill>
    );
  }
  const render = () => (
    <AbsoluteFill>
      <Street cam={cam} frame={f} fog={0.75} flickRate={0} bursts={bursts} actors={actors} />
      <Grade mode="cold" />
      <Darken v={(1 - L) * 0.75} />
    </AbsoluteFill>
  );
  const close = t > 11;
  return <Post render={render} ca={close ? 5 : 1.5} shakeAmp={close ? 3 : 0} zoom={close ? ei(t, [11, 13], [1.0, 1.15], theme.ease.inOut) : 1} origin="50% 40%" />;
};

/* ================================================================ END CARD */
export const EndCardScene: React.FC<{dur: number}> = ({dur}) => {
  const {f} = useLocal();
  const words = 'তাহলে তুমি কী উত্তর দেবে?'.split(' ');
  const out = ei(f, [dur - 30, dur], [1, 0], theme.ease.inOut);
  return (
    <AbsoluteFill style={{background: '#020203', opacity: out, alignItems: 'center'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 40% at 50% 40%, rgba(90,10,14,0.35), rgba(0,0,0,0) 70%)'}} />
      <div style={{position: 'absolute', top: 560, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 22, width: 900}}>
        {words.map((w, i) => {
          const d = 8 + i * 6;
          return (
            <span
              key={i}
              style={{
                fontFamily: theme.font.bn,
                fontWeight: 700,
                fontSize: 96,
                color: '#f1ebe3',
                textShadow: '0 0 30px rgba(209,18,27,0.5), 4px 4px 0 #000',
                opacity: ei(f, [d, d + 10], [0, 1]),
                filter: `blur(${ei(f, [d, d + 12], [12, 0], theme.ease.out)}px)`,
                transform: `translateY(${ei(f, [d, d + 16], [30, 0], theme.ease.out)}px)`,
                display: 'inline-block',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{position: 'absolute', top: 960, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: ei(f, [80, 100], [0, 1])}}>
        <div style={{fontFamily: theme.font.koDisplay, fontSize: 90, color: theme.color.red, textShadow: '0 0 30px rgba(209,18,27,0.7)'}}>봉천동 귀신</div>
        <div style={{fontFamily: theme.font.bn, fontWeight: 600, fontSize: 52, color: '#cfc3b8'}}>বংচন-দং ভূত</div>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1300,
          width: 860,
          textAlign: 'center',
          fontFamily: theme.font.bn,
          fontWeight: 400,
          fontSize: 32,
          lineHeight: 1.5,
          color: '#8f857d',
          opacity: ei(f, [120, 140], [0, 1]),
        }}
      >
        নোট: এটি একটি হরর কিংবদন্তি ও কল্পকাহিনিভিত্তিক কমিকের পুনর্কথন। ভূতের অস্তিত্ব বা বর্ণিত অতিপ্রাকৃত ঘটনাগুলোর সত্যতা প্রমাণিত নয়।
      </div>
    </AbsoluteFill>
  );
};

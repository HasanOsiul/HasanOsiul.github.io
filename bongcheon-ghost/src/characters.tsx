import React from 'react';
import {theme, noise} from './theme';

/* ------------------------------------------------------------------ rig helpers */
const R = Math.PI / 180;
type Pt = [number, number];
/** two-bone limb from (x,y); angles in degrees from straight-down, + = toward +x */
export const limb = (x: number, y: number, a1: number, l1: number, a2: number, l2: number): Pt[] => {
  const x1 = x + Math.sin(-a1 * R) * l1;
  const y1 = y + Math.cos(a1 * R) * l1;
  const x2 = x1 + Math.sin(-(a1 + a2) * R) * l2;
  const y2 = y1 + Math.cos((a1 + a2) * R) * l2;
  return [
    [x, y],
    [x1, y1],
    [x2, y2],
  ];
};
const poly = (p: Pt[]) => p.map((q) => q.join(',')).join(' ');

/* ------------------------------------------------------------------ the girl (back view) */
export const GirlBack: React.FC<{phase: number; walk: number; tremble?: number; t?: number; look?: number}> = ({
  phase,
  walk,
  tremble = 0,
  t = 0,
  look = 0,
}) => {
  const s = Math.sin(phase * Math.PI * 2);
  const liftL = Math.max(0, s) * walk;
  const liftR = Math.max(0, -s) * walk;
  const bob = -Math.abs(s) * 14 * walk;
  const tx = tremble * noise(t * 1.3, 'gtr') * 6;
  const armSwing = s * 9 * walk;
  return (
    <g transform={`translate(${tx},${bob})`}>
      {/* legs (black tights) */}
      {[
        [-52, liftL],
        [52, liftR],
      ].map(([x, l], i) => (
        <g key={i} transform={`translate(0,${-l * 55})`}>
          <rect x={x - 28} y={-440} width={56} height={420 - l * 30} fill="#0c0c10" rx={20} />
          <ellipse cx={x} cy={-16 - l * 30} rx={44} ry={24} fill="#050505" />
        </g>
      ))}
      {/* skirt with pleats */}
      <path d="M-118,-610 L118,-610 L170,-410 L-170,-410 Z" fill="#1f2a3d" />
      {[-120, -70, -20, 30, 80, 130].map((x) => (
        <line key={x} x1={x * 0.7} y1={-605} x2={x} y2={-412} stroke="#141c2b" strokeWidth={6} />
      ))}
      <line x1={-165} y1={-470} x2={165} y2={-470} stroke="#3d2430" strokeWidth={5} opacity={0.6} />
      {/* arms */}
      <g transform={`rotate(${armSwing}, -150, -860)`}>
        <rect x={-190} y={-875} width={62} height={330} rx={28} fill="#151d2e" />
        <ellipse cx={-160} cy={-530} rx={26} ry={34} fill="#cdb7a6" />
      </g>
      <g transform={`rotate(${-armSwing}, 150, -860)`}>
        <rect x={128} y={-875} width={62} height={330} rx={28} fill="#151d2e" />
        <ellipse cx={160} cy={-530} rx={26} ry={34} fill="#cdb7a6" />
      </g>
      {/* blazer */}
      <path d="M-150,-890 Q0,-915 150,-890 L135,-585 Q0,-570 -135,-585 Z" fill="#121a2a" />
      <line x1={0} y1={-880} x2={0} y2={-590} stroke="#0a0f19" strokeWidth={5} />
      {/* backpack */}
      <rect x={-112} y={-865} width={224} height={260} rx={36} fill="#3a1f20" />
      <rect x={-88} y={-760} width={176} height={110} rx={20} fill="#2c1516" />
      <rect x={-20} y={-882} width={40} height={30} rx={8} fill="#2c1516" />
      {/* neck + head + bob hair */}
      <rect x={-30} y={-930} width={60} height={50} fill="#bfa898" />
      <g transform={`rotate(${look * 14}, 0, -940)`}>
        <ellipse cx={0} cy={-985} rx={92} ry={98} fill="#0a0a0c" />
        <path d="M-98,-990 Q-104,-880 -92,-862 L92,-862 Q104,-880 98,-990 Z" fill="#0a0a0c" />
        <path d="M-50,-1060 Q0,-1080 50,-1060" stroke="#2a2a33" strokeWidth={8} fill="none" opacity={0.7} />
        {look > 0.2 && <ellipse cx={look * 85} cy={-955} rx={18 * look} ry={40} fill="#cdb7a6" opacity={0.9} />}
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ the ghost: Mrs. Cho */
export type GhostPose = {
  tilt: number; // whole body lean
  armL: [number, number];
  armR: [number, number];
  legL: [number, number];
  legR: [number, number];
  headTilt: number;
  headTurn: number; // 0 = back of head, 1 = face
  neck: number; // neck stretch
  drop: number; // body drop
  front?: boolean; // body facing camera
  mouth?: number;
  eyes?: number;
};

export const ghostWalk = (p: number, t: number): GhostPose => {
  const s = Math.sin(p * Math.PI * 2);
  const c = Math.cos(p * Math.PI * 2);
  const twitch = noise(t * 3, 'gtw') > 0.85 ? 10 : 0;
  return {
    tilt: -11 + s * 4,
    armL: [6 + s * 10 + twitch, 8 - c * 6],
    armR: [-4 - s * 8, 18 + c * 5],
    legL: [4 + s * 9, 2],
    legR: [-14 - s * 8, 34 + Math.max(0, c) * 18],
    headTilt: 28 + s * 6 + twitch,
    headTurn: 0,
    neck: 0,
    drop: Math.abs(s) * 26,
  };
};

export const ghostStand = (t: number): GhostPose => ({
  tilt: -12 + noise(t * 0.5, 'gst') * 1.5,
  armL: [5 + noise(t * 0.7, 'al') * 3, 6],
  armR: [-3, 16 + noise(t * 0.6, 'ar') * 3],
  legL: [3, 2],
  legR: [-12, 32],
  headTilt: 30 + noise(t, 'ht') * 2,
  headTurn: 0,
  neck: 0,
  drop: 6,
});

/** frame-by-frame sprint poses (held 3 frames each) */
export const ghostRun = (k: number): GhostPose => {
  const poses: GhostPose[] = [
    {tilt: 14, armL: [130, -40], armR: [-60, 70], legL: [40, -10], legR: [-35, 70], headTilt: -40, headTurn: 1, neck: 30, drop: 0, front: true, mouth: 1, eyes: 1},
    {tilt: 8, armL: [70, 60], armR: [-150, 30], legL: [-20, 60], legR: [45, 10], headTilt: 35, headTurn: 1, neck: 40, drop: 30, front: true, mouth: 0.8, eyes: 1},
    {tilt: 18, armL: [160, 40], armR: [-110, -50], legL: [55, 40], legR: [-50, 20], headTilt: -55, headTurn: 1, neck: 20, drop: 10, front: true, mouth: 1, eyes: 1},
    {tilt: 4, armL: [40, 90], armR: [-80, 100], legL: [-40, 30], legR: [30, 80], headTilt: 60, headTurn: 1, neck: 45, drop: 35, front: true, mouth: 0.9, eyes: 1},
  ];
  return poses[((k % 4) + 4) % 4];
};

const PINK = theme.color.pink;
const PINK_D = theme.color.pinkDirty;
const SKIN = theme.color.skinDead;

export const GhostHead: React.FC<{turn: number; mouth?: number; eyes?: number; t?: number}> = ({turn, mouth = 0.3, eyes = 0.6, t = 0}) => {
  const backS = Math.max(0, Math.cos(turn * Math.PI));
  const faceS = Math.max(0, -Math.cos(turn * Math.PI));
  const sideS = Math.sin(turn * Math.PI);
  const pupil = noise(t * 6, 'pp') * 2;
  return (
    <g>
      {/* skull silhouette always (profile during turn) */}
      <ellipse cx={0} cy={0} rx={70 * (0.65 + 0.35 * Math.abs(Math.cos(turn * Math.PI)))} ry={92} fill="#0b0909" />
      {sideS > 0.4 && <ellipse cx={(turn < 0.5 ? 1 : -1) * 0 + 40 * (turn - 0.5) * 2} cy={10} rx={26 * sideS} ry={60} fill={SKIN} opacity={0.6 * sideS} />}
      {backS > 0.02 && (
        <g transform={`scale(${backS},1)`}>
          <ellipse cx={0} cy={0} rx={78} ry={95} fill="#070606" />
          <path d="M-60,-60 Q-10,-40 -20,40 M10,-80 Q40,-20 30,60 M-30,-85 Q-50,0 -55,70" stroke="#1d1a1a" strokeWidth={5} fill="none" />
        </g>
      )}
      {faceS > 0.02 && (
        <g transform={`scale(${faceS},1)`}>
          <ellipse cx={0} cy={8} rx={60} ry={82} fill={SKIN} />
          <ellipse cx={0} cy={8} rx={60} ry={82} fill="url(#faceShade)" />
          {/* eyes */}
          {[-24, 24].map((x, i) => (
            <g key={i}>
              <ellipse cx={x} cy={-6} rx={22 + eyes * 6} ry={18 + eyes * 10} fill="#160707" />
              <ellipse cx={x} cy={-6} rx={15 + eyes * 6} ry={12 + eyes * 9} fill="#e9e6da" />
              <circle cx={x + pupil} cy={-6 + i * 2} r={3.5} fill="#000" />
            </g>
          ))}
          {/* mouth */}
          <ellipse cx={4} cy={52} rx={14 + mouth * 6} ry={5 + mouth * 22} fill="#120303" transform={`rotate(-8, 4, 52)`} />
          <path d="M-40,-60 Q-30,-20 -36,10" stroke={theme.color.blood} strokeWidth={4} fill="none" opacity={0.8} />
          {/* hair curtains */}
          <path d="M-75,-60 Q-90,40 -62,120 L-42,110 Q-58,10 -44,-70 Z" fill="#070606" />
          <path d="M75,-60 Q92,40 66,130 L46,118 Q60,10 46,-70 Z" fill="#070606" />
          <path d="M-60,-90 Q0,-110 60,-90 Q40,-70 0,-72 Q-40,-70 -60,-90 Z" fill="#070606" />
          <path d="M-10,-80 Q-18,0 -6,70 M14,-78 Q30,-10 20,60" stroke="#070606" strokeWidth={4} fill="none" />
        </g>
      )}
    </g>
  );
};

export const Ghost: React.FC<{pose: GhostPose; t?: number; glow?: number}> = ({pose, t = 0, glow = 0}) => {
  const shL: Pt = [-128, -895];
  const shR: Pt = [122, -862];
  const hipL: Pt = [-62, -540];
  const hipR: Pt = [62, -540];
  const aL = limb(shL[0], shL[1], pose.armL[0], 270, pose.armL[1], 280);
  const aR = limb(shR[0], shR[1], pose.armR[0], 270, pose.armR[1], 280);
  const lL = limb(hipL[0], hipL[1], pose.legL[0], 270, pose.legL[1], 275);
  const lR = limb(hipR[0], hipR[1], pose.legR[0], 270, pose.legR[1], 275);
  const neckTop: Pt = [-6, -930 - pose.neck];
  const hand = (p: Pt[], k: string) => {
    const [x1, y1] = p[1];
    const [x2, y2] = p[2];
    const ang = Math.atan2(y2 - y1, x2 - x1);
    return (
      <g key={k}>
        {[-0.35, -0.12, 0.1, 0.3].map((o, i) => (
          <line
            key={i}
            x1={x2}
            y1={y2}
            x2={x2 + Math.cos(ang + o) * (120 + i * 8)}
            y2={y2 + Math.sin(ang + o) * (120 + i * 8)}
            stroke={SKIN}
            strokeWidth={13}
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  };
  const sleeve = (p: Pt[], k: string) => {
    // sleeve covers upper arm + 70% forearm, then grey skin
    const ex = p[1][0] + (p[2][0] - p[1][0]) * 0.7;
    const ey = p[1][1] + (p[2][1] - p[1][1]) * 0.7;
    return (
      <g key={k}>
        <polyline points={poly([p[1], p[2]])} stroke={SKIN} strokeWidth={46} strokeLinecap="round" fill="none" />
        <polyline points={poly([p[0], p[1], [ex, ey]])} stroke={PINK} strokeWidth={78} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {hand(p, k + 'h')}
      </g>
    );
  };
  const leg = (p: Pt[], k: string) => (
    <g key={k}>
      <polyline points={poly(p)} stroke={PINK_D} strokeWidth={100} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx={p[2][0]} cy={p[2][1] + 6} rx={46} ry={20} fill={SKIN} transform={`rotate(${k === 'lr' ? 35 : -10}, ${p[2][0]}, ${p[2][1]})`} />
    </g>
  );
  return (
    <g transform={`translate(0,${pose.drop}) rotate(${pose.tilt}, 0, -40)`}>
      {glow > 0 && <ellipse cx={0} cy={-560} rx={420} ry={700} fill="url(#ghostAura)" opacity={glow} />}
      {/* long hair behind (front-facing body) */}
      {pose.front && <path d="M-100,-1010 Q-150,-700 -120,-560 L120,-560 Q150,-700 100,-1010 Z" fill="#060505" />}
      {leg(lL, 'll')}
      {leg(lR, 'lr')}
      {/* torso: dirty pink pajama */}
      <path d="M-140,-910 Q0,-935 132,-880 L150,-515 Q0,-490 -152,-515 Z" fill={PINK} />
      <path d="M-140,-910 Q0,-935 132,-880 L150,-515 Q0,-490 -152,-515 Z" fill="url(#pjShade)" />
      <ellipse cx={-40} cy={-690} rx={55} ry={34} fill="#5b3a30" opacity={0.35} />
      <ellipse cx={70} cy={-600} rx={30} ry={46} fill="#4a2a26" opacity={0.35} />
      <ellipse cx={-90} cy={-820} rx={20} ry={30} fill="#3a1a18" opacity={0.3} />
      {pose.front ? (
        <g>
          <path d="M-50,-905 L0,-840 L50,-895" stroke={PINK_D} strokeWidth={10} fill="none" />
          {[-800, -720, -640, -560].map((y) => (
            <circle key={y} cx={2} cy={y} r={9} fill="#f3d9dd" />
          ))}
        </g>
      ) : (
        <path d="M-120,-900 Q0,-925 112,-872" stroke={PINK_D} strokeWidth={12} fill="none" />
      )}
      {sleeve(aL, 'al')}
      {sleeve(aR, 'ar')}
      {/* neck (stretches when twisted) */}
      <polyline points={poly([[0, -900], neckTop])} stroke={SKIN} strokeWidth={42} strokeLinecap="round" />
      {pose.neck > 5 &&
        [0, 1, 2].map((i) => (
          <line key={i} x1={-18} y1={-905 - i * 12 - pose.neck * 0.3} x2={18} y2={-915 - i * 12 - pose.neck * 0.3} stroke="#6d7a6e" strokeWidth={3} />
        ))}
      {/* head */}
      <g transform={`translate(${neckTop[0]},${neckTop[1] - 70}) rotate(${pose.headTilt})`}>
        <GhostHead turn={pose.headTurn} mouth={pose.mouth} eyes={pose.eyes} t={t} />
      </g>
      {/* long hair over the back (only when body faces away) */}
      {!pose.front && (
        <g transform={`translate(${neckTop[0]},${neckTop[1] - 70}) rotate(${pose.headTilt * 0.6})`}>
          {pose.headTurn < 0.5 && <path d="M-80,-20 Q-110,180 -70,330 L70,330 Q110,180 80,-20 Z" fill="#060505" opacity={1 - pose.headTurn * 1.6} />}
          {[-60, -30, 0, 30, 60].map((x, i) => (
            <path
              key={i}
              d={`M${x},20 Q${x + noise(t + i, 'hs') * 30},200 ${x * 1.2 + noise(t * 0.7 + i, 'hs2') * 20},${360 + i * 18}`}
              stroke="#060505"
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
    </g>
  );
};

/** shared gradient defs used by characters (put once per svg) */
export const CharDefs: React.FC = () => (
  <defs>
    <filter id="dof" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <radialGradient id="faceShade" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
      <stop offset="0.7" stopColor="#000" stopOpacity="0.15" />
      <stop offset="1" stopColor="#000" stopOpacity="0.55" />
    </radialGradient>
    <linearGradient id="pjShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
      <stop offset="1" stopColor="#000" stopOpacity="0.45" />
    </linearGradient>
    <radialGradient id="ghostAura">
      <stop offset="0" stopColor="#d9a0a8" stopOpacity="0.35" />
      <stop offset="1" stopColor="#d9a0a8" stopOpacity="0" />
    </radialGradient>
  </defs>
);

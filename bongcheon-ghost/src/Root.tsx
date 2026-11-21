import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import TL from './timeline.json';

export const Root: React.FC = () => (
  <Composition id="BongcheonGhost" component={Video} durationInFrames={Math.round(TL.duration * 30)} fps={30} width={1080} height={1920} />
);

import React from 'react';
import {Composition} from 'remotion';
import {MangoFilm, TOTAL} from './Film';
export const Root: React.FC = () => (
  <>
    <Composition id="MangoFilm" component={MangoFilm} durationInFrames={TOTAL} fps={30} width={1080} height={1920} defaultProps={{caption: true}} />
  </>
);

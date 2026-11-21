import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const secs = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: 'BongcheonGhost', browserExecutable});
for (const s of secs) {
  const frame = Math.round(s * 30);
  await renderStill({serveUrl, composition: comp, frame, output: `out/stills/s_${String(s).replace('.', '_')}.png`, browserExecutable, scale: 0.5, chromiumOptions: {gl: 'swangle'}});
  console.log('ok', s);
}

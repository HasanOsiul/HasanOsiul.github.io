# 👻 বংচন-দং ভূত (봉천동 귀신) — Bongcheon-dong Ghost

A ~3.5 minute vertical (1080×1920, 30 fps) 2.5D horror animation of the
Korean urban legend, with big animated Bengali subtitles, Korean dialogue
lines and on-screen human-reaction tags. No voice-over.

Final video: [`bongcheon-ghost.mp4`](./bongcheon-ghost.mp4)

## How it is made
- **Visuals** — [Remotion](https://remotion.dev) (React → video). Everything is
  drawn procedurally in SVG: a true 3D-projected Seoul back-alley (parallax,
  dolly, crane/tilt, pan), rigged characters (puppet-pin limbs, head-rotation
  rig, frame-by-frame sprint), face-morph close-ups, flashback silhouettes.
- **FX** — flickering street lamps, atmospheric fog, cinematic grade, grain,
  vignette, chromatic aberration, glitch slices, motion blur, whip pans, speed
  ramp, screen shake, flash frames, match cut, rack focus.
- **Sound** — `audio/make_soundtrack.py` synthesizes the whole mix: night
  ambience, drones, braams, risers, heartbeat, footsteps, bone cracks, gasps,
  breathing, whimpers, sobs, crowd murmur, a formant-synth ghost voice
  (syllable-matched to the Korean lines), scream, music box, shared reverb and
  "sudden silence" automation.

## Rebuild
```bash
npm install
python3 audio/make_soundtrack.py          # -> public/soundtrack.wav
npx remotion render src/index.ts BongcheonGhost out/video_silent.mp4 --crf 20
ffmpeg -i out/video_silent.mp4 -i public/soundtrack.wav -c:v copy -c:a aac -b:a 256k -shortest bongcheon-ghost.mp4
```
Timeline (scenes + subtitles) lives in `src/timeline.json`.

> নোট: এটি একটি হরর কিংবদন্তি ও কল্পকাহিনিভিত্তিক পুনর্কথন। বর্ণিত অতিপ্রাকৃত ঘটনাগুলোর সত্যতা প্রমাণিত নয়।

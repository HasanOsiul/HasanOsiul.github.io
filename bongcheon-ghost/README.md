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

## Voice-over (Meta MMS-TTS, generated locally)
`voice/lines.json` holds all 46 lines with timing and role. `voice/synth_mms.py`
renders them on CPU with Meta's open models `facebook/mms-tts-ben` (Bengali)
and `facebook/mms-tts-kor` (Korean) into `voice/raw/<id>.wav`.
`voice/mix_voice.py` turns the base voices into characters and blends them:

| Role | Shaping |
|---|---|
| narrator | −5 semitones (deep), warm EQ, close room |
| schoolgirl | +4 semitones, fear tremolo, small room |
| helping woman | +1.5 semitones, muffled → clear (girl waking up) |
| Mrs. Cho (Korean) | +2 st with −4 st double, whisper layer, ring-mod, reverse swell, big reverb — layered over the synthesized ghost voice |

Lines are fitted to their slot (up to 1.5× tempo) and the music/SFX bed ducks
under every voice. Output: `public/soundtrack_vo.wav`.

```bash
pip install torch transformers uroman
HF_HUB_DISABLE_XET=1 python3 voice/synth_mms.py
python3 voice/mix_voice.py
ffmpeg -i out/video_silent.mp4 -i public/soundtrack_vo.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v 3100k -maxrate 4500k -bufsize 9000k -c:a aac -b:a 192k -shortest -movflags +faststart bongcheon-ghost.mp4
```

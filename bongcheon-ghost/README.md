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

## Adding the voice-over (TTSForFree)
`voice/lines.json` holds all 46 lines (≈1,500 characters) with their timing,
role and the chosen voice per role:

| Role | Voice | Treatment in `voice/mix_voice.py` |
|---|---|---|
| narr — Bengali narrator | Enceladus Gemini (breathy, low male) | warm, close, light room |
| girl — the schoolgirl | Leda Gemini (youthful female) | fear tremolo, small room |
| ghost — Mrs. Cho (Korean) | Gacrux Gemini (mature female) | −3 st, −9 st double, whisper layer, ring-mod, reverse swell, big reverb |
| other — helping woman | Vindemiatrix Gemini (gentle female) | muffled → clear (girl waking up) |

Steps:
1. Generate one MP3 per line with its role's voice (TTSForFree
   `text_to_speech`), save as `voice/raw/<id>.mp3`
   (host `cdn.ttsforfree.com` must be allowed in the environment network).
2. `python3 voice/mix_voice.py` → `public/soundtrack_vo.wav` (lines are fitted to
   their subtitle windows; the music/SFX bed ducks under the voices).
3. `ffmpeg -i out/video_silent.mp4 -i public/soundtrack_vo.wav -map 0:v -map 1:a -c:v libx264 -preset slow -b:v 3100k -maxrate 4500k -bufsize 9000k -c:a aac -b:a 192k -shortest -movflags +faststart bongcheon-ghost-vo.mp4`
   (re-render `out/video_silent.mp4` first if this is a fresh container).

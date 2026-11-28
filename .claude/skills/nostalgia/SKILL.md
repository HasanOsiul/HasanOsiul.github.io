---
name: nostalgia
description: Make emotional, nostalgic 2D cartoon animations (YouTube Shorts / Reels, 9:16) in the warm hand-drawn style of "forgotten little joys of life" (a childhood memory like a Bangladeshi village kid eating green mango with salt at golden hour). Covers character design (big round eyes, blush, wind-blown fluffy hair), anatomy that looks right, slow-mo pacing, minimal soft sound, and lining up a song the user adds later. Use this whenever the user says "Nostalgia" or "nostalgia skill", or asks for a nostalgic / childhood-memory / "POV it's 20XX and you" animation, a cartoon kid character for a future video, or a calm emotional Short, even if they don't name the skill.
---

# Nostalgia: emotional childhood-memory animations

These videos make a viewer *feel* a memory. **It is not a funny reel.** Every choice should lean
quiet, warm, slow and tender, never comedic. The user will usually add an emotional song
afterwards, so the animation must leave room for it.

The stack is Remotion with fully hand-built SVG, and no stock art. A working starter project with
the reusable boy character, the village set, post effects, a slow-mo timeline and a sound
generator is in `assets/starter/`. Start from it; don't rebuild from scratch.

Read `references/lessons.md` before you design anything. It lists every mistake the user had to
correct last time. Read `references/rig.md` when you change the character or add poses.

## Workflow

1. **Study the reference video, if one is given.** Build a contact sheet
   (`ffmpeg -i ref.mp4 -vf "fps=1/2.5,scale=180:-1,tile=6x4" -frames:v 1 sheet.png`), view it, then
   pull 1–2 full-resolution frames to study faces. Note the eye style, outline weight, palette,
   caption style and pacing. You can't hear audio, so say so and ask the user to judge the sound.
2. **Write a shot list first** and keep it emotional: wide establishing shot → close-up wonder →
   action (use POV for awkward full-body moves) → slow detail insert → the emotional peak (the
   eyes close) → pull back into the sunset with a short Bangla or English line.
3. **Copy the starter** (`cp -r assets/starter <project>`, then `npm i`). Edit `src/timeline.json`
   (scene lengths in *logical* frames, played at `slow: 0.8`), then edit the scene components in
   `src/Film.tsx`.
4. **Render stills and look at them** (`scripts/still.sh <frames…>`, which tiles them into
   `out/sheet.png`). For anatomy, render at full scale and crop-zoom on the character. Check
   elbows, knees, hands and what each hand is attached to. Fix, re-render, look again.
5. **Sound:** copy `assets/starter/sfx/` into the project root, then run `python3 scripts/sfx.py`
   from the project root. It reads the timeline and writes `out/sfx.wav` and `out/cue.json` (the
   music cue time). Edit the event list for the new story.
6. **Render:** `npx remotion render src/index.ts MangoFilm out/v.mp4 --codec h264 --crf 18
   --browser-executable=<headless_shell> --concurrency=50%`, then mux in the sound with ffmpeg.
   Make one version with the caption (the user wants to keep the caption) and offer a clean one.
7. **Song handoff:** you cannot add a copyrighted song (and you have no copy). Give the user
   `scripts/add_song.sh`, with `CUE` set from `out/cue.json`, and state the exact second of the
   emotional beat. **Whenever scene lengths change, the cue moves, so update it.**

## Look (match the reference style)

- **Face:** big round white eyes with *small* black pupils and one or two highlight dots; soft
  blurred red blush; small curved nose; thick dark-brown outline (`#2a1912`); warm brown skin.
- **Hair:** fluffy and lumpy, never spiky. Make it a union of circles (stroke pass, then fill
  pass), with a few loose strands that move in the wind *all the time*. Draw the brows *on top of*
  the fringe so expressions read.
- **World:** golden-hour dusk (violet sky → peach → gold horizon), low sun glow, painted cloud
  streaks, layered purple palm silhouettes, hand-drawn line "boil" (displacement filter re-seeded
  every 4 frames), floating dust motes, god rays, film grain, vignette, warm soft-light grade.
- **Bangladeshi village kit** (in `Env.tsx`): mud house with a tin roof and barred window, clay
  kolshi, haystack, bamboo fence, swept-earth উঠান, small mango tree with hanging green mangoes.
- **Caption:** black box, white serif, lowercase, e.g. "pov: it's 2015 and you...". Keep it at
  the top, inside the safe area.

## Emotion: what to do and what to avoid

| Do | Don't |
|---|---|
| eyes widen gently, sparkle, small parted "o" | huge gasp, comic shock |
| slow eye-close with the head tilting back, soft smile, slow chewing | sour pucker, shiver lines, hearts, tongue-out effort face |
| soft blush rising | hatched "///" anime blush |
| holds and lingering push-ins | snappy, bouncy timing |

## Pacing

Play everything at about 80% speed (`slow: 0.8`) and use 16-frame cross-dissolves. Give the
emotional peak 3–4 seconds of quiet chewing or looking at the sky. 40–45 seconds total is
typical. Keep action beats like the climb short (two reach-pulls, about 4s); the user found
longer ones dragged.

## Sound

There's no music; the user adds the song. Keep effects few and soft: bites (crunch), slow chews,
one twig snap, a gritty salt dip, a very low wind bed, a soft amazed "ohh" with a faint shimmer,
and a tender "mmmh" after the main bite. **No climbing or rustle filler.**
Free CC0 human-vocal clips are hard to get without a login. If the ElevenLabs connector is
available, generate short `sfx` clips of a child's soft voice (one generation makes about four
takes at roughly 17 credits each; tell the user the cost), pick takes by their energy envelope,
trim them with fades, and ask the user to audition them. The starter's `sfx/` folder already has
an "mmmh" and an "ohh".

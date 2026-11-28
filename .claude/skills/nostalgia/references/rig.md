# Character rig and starter project map (`assets/starter/src`)

## Files
- `theme.ts`: palette `C` (skin, hair, blush, bark, leaves, sky…), easings `EASE`, clamped
  interpolation `iv(f, in, out, ease)`, seeded `rng`, layered `wind(t, i)` signal (drives hair,
  leaves and palms).
- `Boy.tsx`: the character.
  - `Head({e, t, turn, tilt, id})`: face, ears, blush, eyes, nose, mouth, fluffy hair
    (back and front), brows drawn over the fringe. Head radius is about 100 units.
  - `Expr`: `eyeOpen` (0–1.3), `eyeMode` (`open` | `happy` closed-arc | `squeeze`), `look [x,y]`
    for pupil direction, `sparkle`, `brow` (-1..1), `mouth` (`small` | `soft` | `o` | `smile` |
    `grin` | `bite` | `chew` | `pucker` | `effort`), `mouthOpen`, `blush`, `puff` (cheek while
    chewing). For nostalgia, mostly use `soft`, `o`, `bite`, `chew`, `happy`.
  - `Boy({pose, e, t, layer, rItem, lItem})`: full body in head-centred units. Shoulders at
    (±60, 118), hips at (±28, 290), arm segments 82 and 78, leg segments 92 and 90; standing feet
    reach about y = 468. `layer="back"` draws only the legs and torso (use it for close-ups where
    you draw the arms yourself). `rItem`/`lItem` render a prop at that hand.
  - `ik(sx,sy,tx,ty,l1,l2,bend)`: elbow or knee position. **Elbows outward:** left arm +1,
    right arm -1.
  - `Limb`: outlined limb polyline. `Hand({curl, noArm})` is a side-view fist (`noArm` drops its
    built-in forearm). `Mango({bites, salt})` uses bite masks, a flesh rim and brown salt specks.
- `Env.tsx`: `Sky`, `FarLand` (palms), `House`, `HayStack`, `Ground`, `Trunk`, `Canopy`
  (seeded leaves and mangoes, wind-swayed), `TreeShadow`, `Birds`, `Dust`, `Post` (grade, god
  rays, grain, vignette), `BoilDefs` (hand-drawn line wobble; apply with `filter="url(#boil)"`).
- `Film.tsx`: the scenes. `useScene(name)` returns slowed `f` (logical frame) and `t` (seconds),
  so all choreography is written in logical frames. It includes `World` (a camera over the yard),
  POV climbing hands (`PovHand`), `SaltPaper`, `OpenPalm`, `FoldedPaper`, the self-feeding arm in
  the eating close-up, the end title card and the `Caption`.
- `timeline.json`: `{slow, xf, scenes:[[name, logicalFrames]…]}`. Both the video and `sfx.py`
  read it.

## Reusing the character for a new story
- Change the outfit colours in `C.shirt`/`C.shorts`. For a girl, add long hair lumps plus a
  braid as more `Lumps` and `Tuft`s.
- New pose: pass `lHand`/`rHand`/`lFoot`/`rFoot` targets. Check the elbows and knees on a
  zoomed still.
- In close-ups, draw arms in the character's coordinate space (inside the same transform as the
  head) so hands are always attached.
- Emotional peak recipe: the bite or action at frame B, then `eyeOpen` easing 1→0 over about 28
  frames, then switch to `eyeMode: 'happy'`, `tilt` -5, blush +0.45, slow `chew`, a warm
  sun-flare overlay rising, and later reopening the eyes to look at the sky with sparkle.

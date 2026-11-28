# Lessons from the "green mango, 2015" Short: mistakes not to repeat

Each item below is something the user had to point out. Check for every one of them before you
deliver a video.

## Tone
1. **"THIS IS NOT A FUNNY REEL."** The first cut had cartoon gags: floating hearts, shiver lines
   on a sour face, a tongue-out effort face, big toothy grins and hatched blush. They read as
   comedy. Replace them with slow eye-closes, soft smiles, a gentle head tilt and warm light.
2. A sour pucker on green mango is realistic but reads as comedy. Show *bliss and memory*
   instead.
3. Pacing felt rushed. The user asked for "very little bit slow mo", so add a global 0.8 time
   scale and longer dissolves. Slow everything (hair wind, chewing), not just the camera.

## Anatomy (the most repeated complaint)
4. **Elbows must point outward, like `< >`, never `> <`.** In 2-bone IK the bend sign decides
   which way the elbow goes. With y pointing down and the left arm on the viewer's left
   (shoulder at -x), the left arm needs `bend = +1` and the right arm `bend = -1`. Verify on a
   full-scale, cropped still, because it's hard to see in a contact sheet.
5. **Knees:** standing legs bent slightly inward and looked knock-kneed. Put the feet almost
   directly below the hips, at nearly full leg length, so the legs are straight.
6. **No "ghost hands."** In the eating close-up, a fist holding the mango floated in from the
   frame edge with no arm. The user said "it seems like a ghost is feeding a kid who has no
   hands." The hand that feeds must be drawn shoulder → elbow (IK) → fist, crossing the chest,
   in the character's own coordinate space. The other arm should hang at his side.
7. Arms hanging straight down with the hands pulled in toward the hips look stiff. Let the hands
   rest beside the thighs, slightly out, holding a small prop if possible (the folded salt
   paper).
8. Spiky Bart-style hair looked wrong. The reference has fluffy, round, lumpy hair. Brows hidden
   under the fringe killed the emotion, so draw the brows after the hair.
9. Early hand drawings looked like a cup or glove. Draw a fist from the side (four stacked
   finger capsules wrapped over the object, with the thumb on top), and draw an open palm
   (palm up) as a palm ellipse with spread fingers and a thumb.

## Staging
10. Third-person tree climbing (the boy hugging the trunk) looked awkward. Switch to **POV**: the
    viewer's own two hands reach up the bark in alternating moves, the bark scrolls down, the
    canopy and mangoes come closer, and the camera sways gently. No climbing sound effects.
11. Props must be culturally specific. The salt is **brown** (bit lobon with chili flecks) on a
    **small square of newspaper** that he brought: folded in his hand in the first shot, opened
    on his lap, then shown in a **slow-motion zoom** on his palm while the bitten mango dips in.
12. Don't let a prop cover the hand holding it. Keep the paper smaller than the palm so the
    fingers and thumb show around it.

## Sound and music
13. Few, soft sound effects only. The user removed climbing and rustling sounds. They wanted a
    soft "amazed" sound and a soft tasty "ummmh".
14. Web searches for free CC0 "mmm" or "wow" clips only found sites that need a login or a paid
    licence. ElevenLabs sound-effect generation worked; one of eight takes was blocked by its
    filter, which is normal.
15. You can't hear audio. Pick takes by their RMS envelope and say plainly that the user should
    audition them.
16. The user's song (for example *Night Changes*) is copyrighted, and you don't have it. Never
    claim to add it. Provide `add_song.sh`: it puts the chosen lyric ("We're only getting older,
    baby") exactly on the bite and eye-close, plays the song at 50% before that cue and 100%
    after (0.6s ramp), and fades out at the end. Test it with a stand-in sine tone and measure
    the gain curve.
17. **Re-sync the cue every time the timeline changes.** Shortening the climb moved the cue from
    31.9s to 29.8s.

## Technical gotchas
18. `@remotion/google-fonts` failed in headless Chrome with `NetworkError`. Download the TTFs
    with curl into `public/` and load them with `FontFace` plus `delayRender`.
19. Use Playwright's headless shell as the Remotion browser
    (`/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`).
20. Clip salt specks to the mango shape, or they float outside the silhouette.
21. Python's `round()` uses banker's rounding. Match JS `Math.round` with `floor(x+0.5)` when
    deriving frame timings from the same timeline file.
22. Always look at rendered frames before saying something is done: a contact sheet for the
    whole video, plus full-scale crops for faces and hands.

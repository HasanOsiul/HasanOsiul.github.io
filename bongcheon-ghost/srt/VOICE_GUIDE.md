# বংচন-দং ভূত — Voice Guide

Three SRT files, all on the video's exact timeline (00:00 = start of video):

| File | What it is | Use it for |
|---|---|---|
| `bongcheon-ghost_subtitles.srt` | Clean on-screen subtitles: Bengali text, the Korean line above it for dialogue, and the reaction cue in brackets, e.g. `(বুক ধড়ফড়)` | YouTube / Facebook captions, video editors |
| `bongcheon-ghost_voice.srt` | Voice script: `[Speaker] [delivery direction] text` | Expressive TTS (Gemini, ElevenLabs v3, OpenAI, Fish Audio) or a human voice actor |
| `bongcheon-ghost_voice_plain.srt` | Same as above **without** the delivery direction: `[Speaker] text` | TTS tools that read every word aloud (they would otherwise speak the direction too) |

Format of each voice cue:

```
19
00:01:23,800 --> 00:01:27,600
[Ghost] [hollow, slow, mournful, sing-song and wrong; distant then close] 내 아기 어디 있어?
```

- First bracket = **who speaks** (map it to a voice in your tool).
- Second bracket = **how to say it** (emotion, pace, volume). Written in English
  because that is what voice models follow best. **It must not be read aloud.**
- The rest = **the words to speak**. Bengali for Narrator, Girl and Woman;
  **Korean** for the Ghost (the Bengali meaning is in the subtitle SRT).

## The four characters

| Speaker | Cues | Who | Voice to pick | Language |
|---|---|---|---|---|
| **Narrator** | 40 | Storyteller, never seen | Adult male (or deep female), low, breathy, calm; slow storytelling pace. Think "late-night horror radio". | Bengali |
| **Girl** | 2 | The high-school student (~17) | Young female, light and higher, thin. Always scared: whispering, trembling, stuttering. | Bengali |
| **Ghost** | 4 | Mrs. Cho in the pink pajamas | Adult woman (30s–40s), mother's voice. Slow, hollow, sing-song; the scream must be raw and shrieking. | **Korean** |
| **Woman** | 1 | Kind passer-by who finds the girl | Adult female, warm, worried, a bit loud as if calling to someone. | Bengali |

### Where each character speaks
- **Girl** — cue 12 (53.3 s) *"মহিলাটি কি অসুস্থ? কোনো দুর্ঘটনা?"* (whispered thought) and cue 23 (95.5 s) *"ও… ওইদিকে…"* (stuttering, pointing).
- **Ghost** — cue 20 (83.8 s) *내 아기 어디 있어?* · cue 21 (88.0 s) *내 아기 봤어?* · cue 28 (117.2 s) *거기 내 아기 없잖아!!!* (scream) · cue 46 (194.5 s) *내 아기 어디 있어?* (whisper in your ear, right before the jump scare).
- **Woman** — cue 33 (138.5 s) *"তুমি ঠিক আছ? কী হয়েছিল তোমার?"*
- **Narrator** — everything else, plus the final question at 198.3 s *"তাহলে তুমি কী উত্তর দেবে?"* (voice SRT only — it appears on the end card, not as a subtitle).

## Emotional arc (how the narrator's voice should travel)

| Time | Chapter | Narrator feeling |
|---|---|---|
| 0:11–0:37 | 1 · Empty street | Calm, hushed, slowly more uneasy |
| 0:37–1:00 | 1 · The woman | Gasp → creeping dread → nervous |
| 1:04–1:32 | 2 · Her face | Very quiet, stretched pauses, then horror |
| 1:32–1:44 | 2 · Pointing | Breathless → relief (exhale) |
| 1:48–2:08 | 3 · The scream | Paranoid whisper → panic → choking → fade to nothing |
| 2:15–2:30 | 4 · Waking up | Dazed, confused, then firmly certain |
| 2:34–3:00 | 5 · The truth | Somber storytelling, grief; the death line **grave and quiet, not dramatized** |
| 3:04–3:22 | Final | Mournful → warning → intimate whisper to the listener |

## What to do with the voices (post-processing)

Raw TTS sounds too clean for horror. Treatment that matches this video's sound design:

| Speaker | Pitch | Effects | Level |
|---|---|---|---|
| Narrator | −2 to −5 semitones if the voice is light | Low-cut 70 Hz, light warmth, *small* room reverb (10–15 % wet) | Loudest; music ducks −6 to −8 dB under it |
| Girl | +2 to +4 semitones if the voice sounds adult | Gentle tremolo (≈7 Hz, 10 %) for trembling, small room reverb | Slightly quieter than narrator — she is whispering |
| Ghost | Keep main voice, **add a copy −6 to −9 semitones** underneath at ~50 % | High-passed whisper double, slight distortion, ring-mod/tremolo (≈30 Hz) for a "wrong" texture, **big reverb (3–4 s)**, and a *reverse-reverb swell* that rises into the first word. The scream: more distortion, louder. | Loud and close on 내 아기 lines; scream peaks highest |
| Woman | as is | Starts **muffled (low-pass ~700 Hz) and opens up over 1.5 s** — the girl is regaining consciousness | Medium |

Timing tips:
- Start each line at its cue time; it may run slightly past the cue end, but **must finish before the next cue starts**.
- Do **not** put voice in the silent moments — 1:08–1:12, 1:56–1:57 and 3:16.6–3:17 are intentionally dead silent before the scares.
- Duck the music/SFX under every voice line (sidechain compression) so words stay clear without killing the atmosphere.

## Using it with a voice tool
- **TTSForFree `srt_to_speech`**: upload `bongcheon-ghost_voice_plain.srt`, map `speaker_voices` = Narrator / Girl / Ghost / Woman → your chosen voices. It auto-fits speed to each cue.
- **ElevenLabs v3 / Gemini TTS**: use `bongcheon-ghost_voice.srt`; put the second bracket as the style/emotion instruction (ElevenLabs reads `[whispering]`-style tags inline).
- **Human voice actor**: give them `bongcheon-ghost_voice.srt` and this guide.

After generating, mix the voice track with `public/soundtrack.wav` (or run `voice/mix_voice.py`) and mux onto the video.

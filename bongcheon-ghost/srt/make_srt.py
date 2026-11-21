"""Build subtitle + voice-direction SRT files from src/timeline.json."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "..", "src", "timeline.json")))

# per-cue speaker + delivery direction (index = order in timeline subs)
DIR = [
 ("Narrator", "hushed, slow, ominous"),
 ("Narrator", "quiet, setting the scene, slight pause after"),
 ("Narrator", "soft, a little uneasy"),
 ("Narrator", "gentle, tired"),
 ("Narrator", "whispering, eerie; let the silence hang after"),
 ("Narrator", "uneasy, slower"),
 ("Narrator", "tense, slightly faster, breathy"),
 ("Narrator", "sudden sharp gasp first, then frozen whisper"),
 ("Narrator", "low, unsettled"),
 ("Narrator", "hesitant, creeping dread"),
 ("Narrator", "slow and disturbed, a short pause between each phrase"),
 ("Girl", "whispering to herself, scared, trembling, fast heartbeat"),
 ("Narrator", "hushed, nervous"),
 ("Narrator", "abrupt, tense"),
 ("Narrator", "very quiet, almost silent"),
 ("Narrator", "long pause before, barely a whisper, drawn out"),
 ("Narrator", "slow, chilling, stretched; faint bone-crack feeling"),
 ("Narrator", "shocked whisper, rising in fear"),
 ("Narrator", "horrified; small gasp before speaking"),
 ("Ghost", "hollow, slow, mournful, sing-song and wrong; distant then close"),
 ("Ghost", "pleading, then menacing; whispery, head tilted"),
 ("Narrator", "breathless, faint, about to collapse"),
 ("Girl", "terrified stutter, shaking, barely audible"),
 ("Narrator", "low, relieved but still wary"),
 ("Narrator", "long relieved exhale first, then soft"),
 ("Narrator", "whispering, tiptoe pacing"),
 ("Narrator", "paranoid whisper, slow, as if someone is behind you"),
 ("Ghost", "furious shrieking scream, raging, distorted, very loud"),
 ("Narrator", "panicked, fast, short breaths"),
 ("Narrator", "breathless, choking, desperate; voice fails at the end"),
 ("Narrator", "slow fade, sinking, almost silent"),
 ("Narrator", "soft, dazed; deep gasp of waking first"),
 ("Woman", "worried, kind, gentle concern; slightly loud as if calling to her"),
 ("Narrator", "confused, quiet"),
 ("Narrator", "firm whisper, certain"),
 ("Narrator", "storytelling, somber, slower"),
 ("Narrator", "tender, sad"),
 ("Narrator", "heavy, sorrowful pause after"),
 ("Narrator", "grief, voice slightly cracking"),
 ("Narrator", "melancholic, slow"),
 ("Narrator", "grave and quiet, respectful, no dramatization"),
 ("Narrator", "eerie, hushed, haunting"),
 ("Narrator", "mournful"),
 ("Narrator", "warning tone, darker"),
 ("Narrator", "intimate, slow, addressing the listener directly, near-whisper"),
 ("Ghost", "right next to the listener's ear, whispering, then distorting"),
]
EXTRA = [(198.3, 201.8, "Narrator", "quiet, direct question to the listener, chilling", "তাহলে তুমি কী উত্তর দেবে?")]
assert len(DIR) == len(TL["subs"])

def ts(s):
    ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"

sub, voice, guide = [], [], []
for i, (s, (spk, mood)) in enumerate(zip(TL["subs"], DIR)):
    text = s["text"]
    lines = []
    if s.get("tag"): lines.append(f"({s['tag']})")
    if s.get("ko"): lines.append(s["ko"])
    lines.append(text)
    sub.append((s["t"], s["e"], "\n".join(lines)))
    spoken = s["ko"] if spk == "Ghost" else text.strip("“”")
    voice.append((s["t"], s["e"], f"[{spk}] [{mood}] {spoken}"))
for t, e, spk, mood, txt in EXTRA:
    voice.append((t, e, f"[{spk}] [{mood}] {txt}"))

def write(name, cues):
    with open(os.path.join(HERE, name), "w", encoding="utf-8") as f:
        for n, (t, e, txt) in enumerate(cues, 1):
            f.write(f"{n}\n{ts(t)} --> {ts(e)}\n{txt}\n\n")
write("bongcheon-ghost_subtitles.srt", sub)
write("bongcheon-ghost_voice.srt", voice)
# plain-text voice script (no tags) for TTS tools that read only text + speaker
write("bongcheon-ghost_voice_plain.srt", [(t, e, txt.split("] ", 2)[0] + "] " + txt.split("] ", 2)[2]) for t, e, txt in voice])
print(len(sub), len(voice))

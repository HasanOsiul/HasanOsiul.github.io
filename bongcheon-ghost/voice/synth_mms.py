"""Generate every voice-over line locally with Meta's open MMS-TTS models.

  Bengali: facebook/mms-tts-ben     Korean: facebook/mms-tts-kor
One base voice per language; characters are shaped per role (speaking rate,
pitch shift applied later in mix_voice.py). Output: voice/raw/<id>.wav
"""
import json
import os
import re

import numpy as np
import torch
from scipy.io import wavfile
from transformers import AutoTokenizer, VitsModel

HERE = os.path.dirname(os.path.abspath(__file__))
cfg = json.load(open(os.path.join(HERE, "lines.json")))
os.makedirs(os.path.join(HERE, "raw"), exist_ok=True)

# speaking rate per role (lower = slower, more dread)
RATE = {"narr": 1.0, "girl": 1.02, "other": 0.95, "ghost": 0.72}
NOISE = {"narr": 0.55, "girl": 0.75, "other": 0.6, "ghost": 0.8}

BN_DIGITS = {"১১টা ২০ মিনিট": "এগারোটা বিশ মিনিট"}


def clean(text, lang):
    for k, v in BN_DIGITS.items():
        text = text.replace(k, v)
    text = text.replace("…", ", ").replace("“", "").replace("”", "")
    text = re.sub(r"!+", "!", text)
    text = re.sub(r"\s+", " ", text).strip(" ,")
    return text


models = {}
for lang in ("ben", "kor"):
    name = f"facebook/mms-tts-{lang}"
    models[lang] = (VitsModel.from_pretrained(name).eval(), AutoTokenizer.from_pretrained(name))

for ln in cfg["lines"]:
    lang = "kor" if ln["role"] == "ghost" else "ben"
    model, tok = models[lang]
    text = clean(ln["text"], lang)
    if lang == "ben":
        # sentence-final pause helps MMS intonation
        text = text if text.endswith(("।", "?", "!")) else text + "।"
    model.speaking_rate = RATE[ln["role"]]
    model.noise_scale = NOISE[ln["role"]]
    torch.manual_seed(hash(ln["id"]) % 1000)
    inputs = tok(text, return_tensors="pt")
    with torch.no_grad():
        wav = model(**inputs).waveform[0].numpy()
    wav = wav / (np.abs(wav).max() + 1e-9) * 0.9
    sr = model.config.sampling_rate
    wavfile.write(os.path.join(HERE, "raw", ln["id"] + ".wav"), sr, (wav * 32767).astype(np.int16))
    print(ln["id"], ln["role"], f"{len(wav) / sr:.2f}s", f"(window {ln['e'] - ln['t']:.1f}s)", text, flush=True)

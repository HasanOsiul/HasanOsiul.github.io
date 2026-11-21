"""Blend the generated voice-over lines into the horror soundtrack.

Expects one MP3 per line at voice/raw/<id>.mp3 (ids from voice/lines.json),
generated with the voice assigned to each role. Then:
  - each line is time-fitted to its subtitle window (atempo, max 1.3x)
  - role treatment: narrator = warm + close; girl = trembling + small room;
    ghost = pitched down, whisper double, reverse swell, big reverb;
    other = muffled-then-clear (the girl is regaining consciousness)
  - the music/SFX bed ducks smoothly under every voice (sidechain)
Writes public/soundtrack_vo.wav.
"""
import json
import os
import subprocess
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
cfg = json.load(open(os.path.join(HERE, "lines.json")))
sr, bed = wavfile.read(os.path.join(ROOT, "public", "soundtrack.wav"))
bed = bed.astype(np.float64) / 32768
N = len(bed)
rng = np.random.default_rng(11)


def decode(path, tempo=1.0, semis=0.0):
    af = []
    if semis or tempo != 1.0:
        af.append(f"rubberband=pitch={2 ** (semis / 12):.5f}:tempo={tempo:.4f}:pitchq=quality:window=standard")
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR)]
    if af:
        cmd += ["-af", ",".join(af)]
    cmd += ["-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(np.float64)
    # trim leading/trailing silence
    a = np.abs(x)
    idx = np.where(a > 0.01)[0]
    return x[max(0, idx[0] - 600): idx[-1] + 2400] if len(idx) else x


def filt(x, kind, f, order=2):
    nyq = SR / 2
    if kind == "bp":
        sos = signal.butter(order, [f[0] / nyq, f[1] / nyq], "bandpass", output="sos")
    else:
        sos = signal.butter(order, f / nyq, kind, output="sos")
    return signal.sosfilt(sos, x)


def ir(d, decay):
    n = int(d * SR)
    t = np.arange(n) / SR
    out = []
    for _ in range(2):
        y = filt(rng.standard_normal(n) * np.exp(-t * decay), "low", 3500)
        out.append(y / np.sqrt(np.sum(y ** 2)))
    return out


IR_SMALL = ir(0.9, 6)
IR_BIG = ir(3.5, 1.8)


def verb(x, irs, wet):
    L = signal.oaconvolve(x, irs[0])[: len(x) + len(irs[0])]
    R = signal.oaconvolve(x, irs[1])[: len(x) + len(irs[1])]
    dry = np.pad(x, (0, len(L) - len(x)))
    return np.stack([dry + wet * L, dry + wet * R], 1)


def norm(x, peak=0.9):
    return x / (np.abs(x).max() + 1e-9) * peak


# per-role pitch shift (semitones) shaping one base voice into characters
SEMIS = json.loads(os.environ.get("VO_SEMIS", '{"narr": -4.0, "girl": 2.5, "other": 0.5, "ghost": -3.0}'))

vo = np.zeros((N, 2))
for ln in cfg["lines"]:
    path = os.path.join(HERE, "raw", ln["id"] + ".wav")
    if not os.path.exists(path):
        path = path[:-4] + ".mp3"
    if not os.path.exists(path):
        print("missing", path, file=sys.stderr)
        continue
    role = ln["role"]
    window = ln["e"] - ln["t"] - 0.15
    semis = SEMIS[role]
    x = decode(path, 1.0, semis)
    if len(x) / SR > window:
        x = decode(path, min(1.3, len(x) / SR / window), semis)
    n = len(x)
    tt = np.arange(n) / SR
    if role == "narr":
        x = filt(x, "high", 70) + 0.25 * filt(x, "low", 250)       # warm, close
        y = verb(norm(x), IR_SMALL, 0.12) * 0.80
    elif role == "girl":
        x = x * (1 + 0.12 * np.sin(2 * np.pi * 7.5 * tt))           # fear tremolo
        y = verb(norm(x), IR_SMALL, 0.25) * 0.78
    elif role == "other":
        lp = filt(x, "low", 700)
        k = np.clip(tt / 1.5, 0, 1)                                   # muffled -> clear
        y = verb(norm(lp * (1 - k) + x * k), IR_SMALL, 0.2) * 0.72
    else:  # ghost
        whisper = filt(x, "high", 2500) * 2.0
        low = decode(path, 1.0, semis - 6.0)[:n]
        low = np.pad(low, (0, n - len(low)))
        g = norm(x) + 0.5 * norm(low) + 0.35 * norm(whisper)
        g *= 1 + 0.25 * np.sin(2 * np.pi * 31 * tt)                   # unsettling ring-mod
        g = np.tanh(g * 1.5)
        y = verb(norm(g), IR_BIG, 0.55)
        swell = verb(norm(g[::-1][: int(0.7 * SR)]), IR_BIG, 1.0)[::-1] * 0.25
        y = np.concatenate([swell * np.linspace(0, 1, len(swell))[:, None] ** 2, y])
        y = y * (1.0 if "!!!" not in ln["text"] else 1.15)
        ln = dict(ln, t=ln["t"] - len(swell) / SR)
    i = int(ln["t"] * SR)
    j = min(N, i + len(y))
    vo[i:j] += y[: j - i]

# sidechain ducking of the bed under the voice
env = np.abs(vo).max(1)
env = filt(env, "low", 6)
env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
duck = 1 - 0.6 * env  # up to ~ -8 dB
mix = bed * duck[:, None] + vo * 0.95
mix = np.tanh(mix * 1.1) / np.tanh(1.1) * 0.95
wavfile.write(os.path.join(ROOT, "public", "soundtrack_vo.wav"), SR, (mix * 32767).astype(np.int16))
print("wrote public/soundtrack_vo.wav")

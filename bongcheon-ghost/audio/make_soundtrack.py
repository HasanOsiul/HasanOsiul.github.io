"""Procedural horror sound design for "Bongcheon-dong Ghost".

Every sound is synthesized (no samples): night ambience, drones, braams, risers,
heartbeat, footsteps, bone cracks, human reactions (gasps, breathing, whimpers,
sobs, crowd murmur), a formant-synth ghost voice, a scream and a music box.
All events sit on the same timeline as src/timeline.json. Sounds go through a
shared reverb send and a master bus with "sudden silence" automation so the
mix feels like one continuous space rather than separate clips.
"""
import json
import os
import sys

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, "..", "src", "timeline.json")))
DUR = TL["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(7)

dry = np.zeros((N, 2))
send = np.zeros((N, 2))   # reverb send (large space)


# ---------------------------------------------------------------- helpers
def secs(d):
    return int(d * SR)


def tt(d):
    return np.arange(secs(d)) / SR


def white(d):
    return rng.standard_normal(secs(d))


def pink(d):
    n = secs(d)
    x = np.fft.rfft(rng.standard_normal(n))
    f = np.arange(len(x)) + 1.0
    x /= np.sqrt(f)
    y = np.fft.irfft(x, n)
    return y / (np.abs(y).max() + 1e-9)


def filt(x, kind, f, order=2):
    nyq = SR / 2
    if kind == "bp":
        lo, hi = max(f[0], 10) / nyq, min(f[1], nyq - 100) / nyq
        sos = signal.butter(order, [lo, hi], "bandpass", output="sos")
    else:
        sos = signal.butter(order, min(f, nyq - 100) / nyq, kind, output="sos")
    return signal.sosfilt(sos, x)


def env_ar(n, a, r, curve=2.0):
    """attack/release envelope over n samples (a, r as fractions or seconds)"""
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    na, nr = min(na, n), min(nr, n)
    if na:
        e[:na] = np.linspace(0, 1, na) ** curve
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr) ** curve
    return e


def bell(n, p=2.0):
    x = np.linspace(0, np.pi, n)
    return np.sin(x) ** p


def place(sig, t, gain=1.0, pan=0.0, rev=0.25, bus=None):
    """mix mono/stereo sig at time t (s). pan -1..1 (constant power)."""
    if sig.ndim == 1:
        a = (pan + 1) * np.pi / 4
        sig = np.stack([sig * np.cos(a), sig * np.sin(a)], 1)
    i = secs(t)
    if i >= N:
        return
    j = min(N, i + len(sig))
    seg = sig[: j - i] * gain
    (bus if bus is not None else dry)[i:j] += seg
    send[i:j] += seg * rev


def curve(points, n=N):
    """piecewise linear automation from [(t, v), ...]"""
    ts = np.array([p[0] for p in points]) * SR
    vs = np.array([p[1] for p in points])
    return np.interp(np.arange(n), ts, vs)


def norm(x):
    return x / (np.abs(x).max() + 1e-9)


# ---------------------------------------------------------------- voices
FORMANTS = {
    "a": (800, 1200, 2500), "ae": (600, 1750, 2600), "e": (500, 1900, 2600),
    "i": (300, 2300, 3000), "eo": (580, 950, 2500), "o": (450, 800, 2500),
    "u": (350, 700, 2400), "h": (900, 1700, 3200),
}


def formant(x, vowel, bw=(90, 120, 180), gains=(1.0, 0.6, 0.3)):
    out = np.zeros_like(x)
    for f, b, g in zip(FORMANTS[vowel], bw, gains):
        out += g * filt(x, "bp", (f - b, f + b), 2)
    return out


def glottal(f0_curve, breath=0.15, jitter=0.01):
    """band-limited pulse train following an f0 curve (array per sample)"""
    f = f0_curve * (1 + jitter * filt(rng.standard_normal(len(f0_curve)), "low", 30))
    ph = np.cumsum(f / SR)
    saw = 2 * (ph % 1) - 1
    src = filt(saw, "low", 4000) + breath * rng.standard_normal(len(f))
    return src


def voice(sylls, f0=180, speed=1.0, breath=0.15, vib=5.0, vib_depth=0.02,
          glide=0.0, rough=0.0):
    """sylls: list of (vowel, dur, consonant) -> mono voiced phrase"""
    parts = []
    for k, (v, d, c) in enumerate(sylls):
        d = d / speed
        n = secs(d)
        t = np.arange(n) / SR
        fc = f0 * (1 + glide * (t / d)) * (1 + vib_depth * np.sin(2 * np.pi * vib * t))
        fc *= 1 + 0.06 * np.sin(k * 1.7)  # intonation
        src = glottal(fc, breath)
        if rough:
            src *= 1 + rough * np.sign(np.sin(2 * np.pi * fc * 0.5 * t))
        s = formant(src, v)
        e = env_ar(n, 0.03, min(0.09, d * 0.4), 1.3)
        s *= e
        if c in ("g", "d", "k", "t", "b"):
            burst = filt(white(0.03), "bp", (1500, 5000)) * env_ar(secs(0.03), 0.002, 0.02)
            s[: len(burst)] += burst * 0.4
        elif c in ("n", "m"):
            hum = filt(glottal(fc[: secs(0.07)], 0.02), "low", 400) * env_ar(secs(0.07), 0.01, 0.03)
            s[: len(hum)] = s[: len(hum)] * 0.3 + hum * 0.9
        elif c == "s":
            hs = filt(white(0.09), "bp", (4000, 9000)) * bell(secs(0.09))
            s[: len(hs)] += hs * 0.5
        parts.append(s)
    # overlap-add
    total = sum(len(p) for p in parts)
    out = np.zeros(total + SR)
    pos = 0
    for p in parts:
        out[pos:pos + len(p)] += p
        pos += int(len(p) * 0.88)
    return norm(out[: pos + secs(0.2)])


def whisper(sylls, speed=1.0):
    parts = []
    for v, d, c in sylls:
        n = secs(d / speed)
        s = formant(rng.standard_normal(n), v, bw=(200, 260, 400), gains=(0.6, 1.0, 0.8))
        s = filt(s, "high", 900)
        parts.append(s * env_ar(n, 0.03, 0.06))
    return norm(np.concatenate(parts))


def ghost_voice(sylls, f0=150):
    a = voice(sylls, f0=f0, speed=0.82, breath=0.35, vib=3.2, vib_depth=0.05, rough=0.25)
    b = voice(sylls, f0=f0 * 0.5, speed=0.82, breath=0.1, vib=2.1, vib_depth=0.04)
    w = whisper(sylls, speed=0.82)
    n = min(len(a), len(b), len(w))
    mix = a[:n] * 0.7 + b[:n] * 0.6 + w[:n] * 0.55
    mix *= 1 + 0.35 * np.sin(2 * np.pi * 37 * np.arange(n) / SR)   # ring-mod shimmer
    mix = np.tanh(mix * 1.8)
    # reverse-reverb pre swell
    tail = np.convolve(mix[::-1][: secs(0.8)], np.exp(-np.linspace(0, 6, secs(0.6))) * rng.standard_normal(secs(0.6)), "full")[: secs(0.8)]
    pre = norm(tail[::-1]) * 0.35 * np.linspace(0, 1, len(tail)) ** 2
    out = np.concatenate([pre, mix])
    return norm(out)


def gasp(d=0.45, pitch=1.0):
    n = secs(d)
    nz = formant(rng.standard_normal(n), "h", bw=(300, 400, 600), gains=(0.6, 1, 0.8))
    e = np.concatenate([np.linspace(0, 1, secs(0.06)) ** 1.5, np.ones(n - secs(0.06))])
    e *= np.exp(-np.linspace(0, 2.5, n))
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(700, 1050, n) * pitch) / SR) * 0.08
    tone = formant(tone, "a") * 3
    return norm((nz + tone) * e)


def breath_cycle(rate=1.5, d=4.0, shaky=0.3, intensity=1.0):
    out = np.zeros(secs(d) + SR)
    pos = 0.0
    k = 0
    while pos < d:
        period = 1 / rate * (1 + rng.uniform(-0.15, 0.15))
        inh = period * 0.45
        n = secs(inh)
        s = filt(rng.standard_normal(n), "bp", (1200, 4200)) * bell(n, 1.5)
        if shaky:
            s *= 1 + shaky * np.sin(2 * np.pi * rng.uniform(9, 14) * np.arange(n) / SR)
        out[secs(pos):secs(pos) + n] += s * 0.8 * intensity
        n2 = secs(period * 0.5)
        s2 = filt(rng.standard_normal(n2), "bp", (400, 2200)) * bell(n2, 1.2)
        if shaky:
            s2 *= 1 + shaky * np.sign(np.sin(2 * np.pi * rng.uniform(6, 10) * np.arange(n2) / SR)) * 0.5
        st = secs(pos + inh)
        out[st:st + n2] += s2 * 0.6 * intensity
        pos += period
        k += 1
    return norm(out[: secs(d)])


def whimper(d=0.4, f0=420):
    n = secs(d)
    f = f0 * np.linspace(1.08, 0.82, n) * (1 + 0.04 * np.sin(2 * np.pi * 9 * np.arange(n) / SR))
    s = formant(glottal(f, 0.6), "o") * env_ar(n, 0.04, 0.15)
    return norm(s)


def sob(d=3.0):
    out = np.zeros(secs(d))
    pos = 0.0
    while pos < d - 0.6:
        seg = whimper(rng.uniform(0.25, 0.5), rng.uniform(320, 420)) * rng.uniform(0.5, 1)
        i = secs(pos)
        out[i:i + len(seg)] += seg[: len(out) - i]
        pos += len(seg) / SR + rng.uniform(0.05, 0.15)
        if rng.random() < 0.35:
            g = gasp(0.25) * 0.5
            i = secs(pos)
            out[i:i + len(g)] += g[: len(out) - i]
            pos += 0.3
    return norm(out)


def scream(d=2.6, f0=520, monster=True):
    n = secs(d)
    t = np.arange(n) / SR
    f = f0 * np.interp(t, [0, 0.25 * d, 0.7 * d, d], [0.8, 1.6, 1.4, 0.9])
    f *= 1 + 0.035 * np.sin(2 * np.pi * 7 * t) + 0.02 * filt(rng.standard_normal(n), "low", 20) * 5
    src = glottal(f, 0.5, 0.03)
    s = formant(src, "a") * 1.2 + formant(src, "ae") * 0.6
    if monster:
        low = formant(glottal(f * 0.5, 0.4, 0.04), "a")
        s = s + low * 0.9
    s = np.tanh(norm(s) * 3.5)
    s += filt(rng.standard_normal(n), "bp", (2000, 7000)) * 0.25
    return norm(s * env_ar(n, 0.04, 0.6, 1.2))


# ---------------------------------------------------------------- sfx
def impact(d=2.5, f_hi=110, f_lo=28):
    n = secs(d)
    t = np.arange(n) / SR
    f = f_lo + (f_hi - f_lo) * np.exp(-t * 4)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    crack = filt(rng.standard_normal(n), "low", 2500) * np.exp(-t * 18)
    return norm(np.tanh(body * 1.6 + crack * 0.7))


def braam(d=3.5, root=49):
    n = secs(d)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m, g in ((1, 1), (1.5, 0.6), (2, 0.5), (1.06, 0.7), (3, 0.25)):
        ph = np.cumsum(root * m * (1 + 0.003 * rng.standard_normal()) * np.ones(n)) / SR
        s += g * (2 * (ph % 1) - 1)
    cutoff = np.interp(t, [0, 0.15, 0.6 * d, d], [150, 1800, 500, 120])
    out = np.zeros(n)
    blk = 2048
    zi = None
    for i in range(0, n, blk):
        sos = signal.butter(2, cutoff[i] / (SR / 2), "low", output="sos")
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        out[i:i + blk], zi = signal.sosfilt(sos, s[i:i + blk], zi=zi)
    return norm(np.tanh(out * 2) * env_ar(n, 0.05, d * 0.5, 1.5))


def whoosh(d=0.8, f1=300, f2=3000, rev=False):
    n = secs(d)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    blk = 1024
    for i in range(0, n, blk):
        fc = f1 + (f2 - f1) * (i / n)
        out[i:i + blk] = filt(x[max(0, i - 2048):i + blk], "bp", (fc * 0.6, fc * 1.4))[-len(x[i:i + blk]):]
    out *= bell(n, 1.6)
    return norm(out[::-1] if rev else out)


def riser(d=6.0):
    n = secs(d)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for base in (110, 116.5, 164.8, 220, 233):
        f = base * 2 ** (t / d * 1.5)
        s += np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 + 0.5 * np.sin(2 * np.pi * (3 + 9 * t / d) * t))
    nz = filt(rng.standard_normal(n), "high", 2500)
    s = s / 5 + nz * 0.25
    return norm(s * (t / d) ** 2.2)


def reverse_swell(d=2.0):
    n = secs(d)
    x = filt(rng.standard_normal(n), "high", 1500)
    tone = np.sin(2 * np.pi * 220 * np.arange(n) / SR) * 0.2 + np.sin(2 * np.pi * 233 * np.arange(n) / SR) * 0.2
    return norm((x + tone) * np.linspace(0, 1, n) ** 3)


def glitch(d=0.5):
    n = secs(d)
    out = np.zeros(n)
    i = 0
    while i < n:
        L = secs(rng.uniform(0.01, 0.05))
        kind = rng.integers(3)
        tt_ = np.arange(L) / SR
        if kind == 0:
            seg = np.sign(np.sin(2 * np.pi * rng.uniform(80, 1600) * tt_))
        elif kind == 1:
            seg = rng.standard_normal(L)
        else:
            seg = np.zeros(L)
        seg = np.round(seg * 4) / 4  # crush
        out[i:i + L] = seg[: n - i] * rng.uniform(0.3, 1)
        i += L
    return out * 0.8


def bone_cracks(d=6.0, density=4.0):
    out = np.zeros(secs(d) + SR)
    k = 0
    t = 0.0
    while t < d:
        cl = rng.integers(2, 6)
        for _ in range(cl):
            n = secs(rng.uniform(0.006, 0.02))
            c = filt(rng.standard_normal(n), "bp", (rng.uniform(700, 1500), rng.uniform(2500, 5000))) * np.exp(-np.linspace(0, 8, n))
            ring = signal.lfilter([1], [1, -1.6 * np.cos(2 * np.pi * rng.uniform(300, 900) / SR), 0.81], c)
            i = secs(t)
            out[i:i + n] += (c + ring * 0.3) * rng.uniform(0.4, 1)
            t += rng.uniform(0.012, 0.05)
        t += rng.exponential(1 / density)
    # low creak
    n = secs(d)
    tc = np.arange(n) / SR
    f = 38 + 14 * np.sin(2 * np.pi * 0.3 * tc) + 8 * filt(rng.standard_normal(n), "low", 3) * 10
    ph = np.cumsum(f) / SR
    creak = filt(2 * (ph % 1) - 1, "bp", (300, 1400)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * tc))
    out[:n] += norm(creak) * 0.25
    return norm(out[: secs(d)])


def footstep(kind="girl"):
    if kind == "girl":
        n = secs(0.12)
        x = filt(rng.standard_normal(n), "bp", (300, 3500)) * np.exp(-np.linspace(0, 14, n))
        th = np.sin(2 * np.pi * 110 * np.arange(n) / SR) * np.exp(-np.linspace(0, 20, n)) * 0.7
        click = np.zeros(n)
        c = secs(0.004)
        click[secs(0.035):secs(0.035) + c] = rng.standard_normal(c) * 0.5
        return norm(x + th + filt(click, "high", 2000))
    if kind == "drag":
        n = secs(rng.uniform(0.45, 0.8))
        x = filt(rng.standard_normal(n), "bp", (250, 1600))
        x *= np.abs(filt(rng.standard_normal(n), "low", 25)) * 6
        x *= env_ar(n, 0.08, 0.25)
        th = np.sin(2 * np.pi * 70 * np.arange(n) / SR) * np.exp(-np.linspace(0, 25, n))
        return norm(x + th)
    # running heavy thud
    n = secs(0.18)
    th = np.sin(2 * np.pi * np.cumsum(np.linspace(140, 50, n)) / SR) * np.exp(-np.linspace(0, 10, n))
    x = filt(rng.standard_normal(n), "low", 1800) * np.exp(-np.linspace(0, 20, n))
    return norm(th + x * 0.6)


def heartbeat():
    n = secs(0.55)
    t = np.arange(n) / SR
    def thump(f, d):
        m = secs(d)
        tt_ = np.arange(m) / SR
        return np.sin(2 * np.pi * np.cumsum(np.linspace(f, f * 0.6, m)) / SR) * np.exp(-tt_ * 25)
    out = np.zeros(n)
    a = thump(62, 0.14)
    b = thump(52, 0.12) * 0.7
    out[: len(a)] += a
    out[secs(0.24):secs(0.24) + len(b)] += b
    return norm(filt(out, "low", 180))


def music_box_note(freq, d=1.6, detune=0.0):
    n = secs(d)
    t = np.arange(n) / SR
    f = freq * 2 ** (detune / 1200)
    s = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
         + 0.15 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 10))
    click = np.zeros(n)
    click[:120] = rng.standard_normal(120) * 0.2
    return (s * np.exp(-t * 2.6) + click) * env_ar(n, 0.002, 0.2)


def car_pass(d=5.0):
    n = secs(d)
    t = np.arange(n) / SR
    eng = np.sin(2 * np.pi * np.cumsum(np.interp(t, [0, d], [92, 74])) / SR)
    tyre = filt(rng.standard_normal(n), "bp", (200, 1200))
    s = (eng * 0.3 + tyre) * bell(n, 2)
    L = s * np.linspace(1, 0.2, n)
    R = s * np.linspace(0.2, 1, n)
    return np.stack([L, R], 1) / (np.abs(s).max() + 1e-9)


def door_slam():
    n = secs(1.2)
    t = np.arange(n) / SR
    wood = signal.lfilter([1], [1, -1.97 * np.cos(2 * np.pi * 180 / SR), 0.97],
                          rng.standard_normal(n) * np.exp(-t * 60))
    return norm(norm(wood) + impact(1.2, 90, 40) * 0.8)


def murmur(d=10.0, voices=9):
    out = np.zeros(secs(d) + SR * 2)
    vowels = list(FORMANTS.keys())[:-1]
    for _ in range(voices):
        pos = rng.uniform(0, 1.5)
        f0 = rng.uniform(110, 240)
        while pos < d:
            k = rng.integers(3, 8)
            syl = [(vowels[rng.integers(len(vowels))], rng.uniform(0.12, 0.22), "nd"[rng.integers(2)]) for _ in range(k)]
            v = voice(syl, f0=f0, breath=0.3, vib_depth=0.01) * rng.uniform(0.3, 1)
            i = secs(pos)
            out[i:i + len(v)] += v[: len(out) - i]
            pos += len(v) / SR + rng.uniform(0.3, 1.8)
    return norm(out[: secs(d)])


# ---------------------------------------------------------------- beds (continuous)
print("beds...", file=sys.stderr)
t_all = np.arange(N) / SR

# city hum + wind (stereo decorrelated)
hum = np.stack([filt(pink(DUR), "low", 260), filt(pink(DUR), "low", 260)], 1)
wind = np.stack([filt(pink(DUR), "bp", (250, 900)), filt(pink(DUR), "bp", (300, 1000))], 1)
wind *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t_all) * np.sin(2 * np.pi * 0.023 * t_all + 1))[:, None]
street_amb = curve([(0, 0), (3, 0.5), (7, 0.5), (10.5, 0.8), (60, 0.8), (68.5, 0.25), (72, 0.3), (80, 0.6),
                    (116, 0.6), (116.1, 0.05), (117.2, 0.4), (128, 0.5), (128.2, 0), (134.5, 0), (139, 0.7),
                    (150, 0.6), (153.5, 0.15), (180, 0.15), (183.5, 0.8), (196.5, 0.8), (196.6, 0), (198, 0.2), (206, 0)])
dry += hum * 0.16 * street_amb[:, None] + wind * 0.11 * street_amb[:, None]
send += wind * 0.03 * street_amb[:, None]

# streetlight electrical buzz (follows street scenes)
ph = np.cumsum(np.full(N, 120.0)) / SR
buzz = filt(2 * (ph % 1) - 1, "bp", (100, 1800)) * 0.5
buzz_lvl = curve([(0, 0), (10.5, 0), (12, 0.5), (37, 0.5), (46, 0.7), (60, 0.7), (63.5, 0.6), (92, 0.6), (104, 0.6),
                  (107.5, 0.5), (116, 0.5), (116.1, 0), (183.5, 0), (185, 0.7), (196.5, 0.8), (196.6, 0), (206, 0)])
flick = np.ones(N)
for ft in (26, 31.5, 33.2, 48, 65, 69, 73, 77.5, 110, 113, 186, 189, 192.5, 195.5):
    i = secs(ft)
    for _ in range(rng.integers(3, 7)):
        L = secs(rng.uniform(0.03, 0.12))
        flick[i:i + L] = rng.uniform(0, 2.5)
        i += L + secs(rng.uniform(0.02, 0.1))
dry += (buzz * buzz_lvl * flick * 0.035)[:, None] * np.array([0.9, 1.0])

# horror drone (minor-second cluster) with intensity automation
drone = np.zeros(N)
for f, g in ((41.2, 1), (43.65, 0.8), (61.7, 0.5), (82.4, 0.35), (87.3, 0.3), (164.8, 0.12), (174.6, 0.1)):
    drone += g * np.sin(2 * np.pi * f * t_all + rng.uniform(0, 6)) * (1 + 0.3 * np.sin(2 * np.pi * rng.uniform(0.05, 0.2) * t_all))
drone += 0.4 * filt(pink(DUR), "bp", (60, 220)) * 4
drone = norm(drone)
d_lvl = curve([(0, 0), (3, 0.55), (7, 0.6), (10.5, 0.3), (24, 0.3), (37, 0.45), (46, 0.7), (53, 0.85), (60, 0.8),
               (63.5, 0.6), (68.5, 0.15), (72, 0.3), (80, 1.0), (92, 0.8), (101, 0.4), (104, 0.4), (107.5, 0.35),
               (115.9, 0.7), (116, 0), (117.2, 1.0), (128, 1.0), (128.2, 0), (134.5, 0), (146, 0.4), (150, 0.6),
               (153.5, 0.15), (171.5, 0.3), (175.7, 0.9), (175.8, 0), (176.5, 0.6), (180, 0.5), (183.5, 0.4),
               (196.5, 1.0), (196.6, 0), (198.2, 0.5), (204, 0.4), (206, 0)])
dsig = np.stack([drone, np.roll(drone, 1200)], 1) * d_lvl[:, None] * 0.22
dry += dsig
send += dsig * 0.4

# high eerie string (tension layer)
hs = np.zeros(N)
for f in (1318.5, 1396.9):
    hs += np.sin(2 * np.pi * f * t_all * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * t_all)))
h_lvl = curve([(0, 0), (50, 0), (53, 0.3), (60, 0.35), (63.5, 0), (72, 0), (76, 0.25), (80, 0), (92, 0.2), (98, 0),
               (111, 0), (115.9, 0.4), (116, 0), (186, 0), (196.5, 0.5), (196.6, 0)])
dry += (hs * h_lvl * 0.02)[:, None]
send += (hs * h_lvl * 0.03)[:, None]

# ---------------------------------------------------------------- events
print("events...", file=sys.stderr)

# Title
place(reverse_swell(1.4), 0.1, 0.35, 0, 0.6)
place(impact(3), 1.5, 0.9, 0, 0.5)
place(glitch(0.45), 1.5, 0.25, 0, 0.1)
place(whisper([("ae", .2, "n"), ("a", .18, ""), ("i", .2, "g"), ("eo", .3, "")]) [::-1], 3.2, 0.12, -0.6, 0.9)
place(reverse_swell(2.0), 5.0, 0.3, 0, 0.6)

# Chapter cards: whoosh + low hit + glitch tick
for s in TL["scenes"]:
    if s["id"] == "card":
        place(whoosh(0.9, 200, 2500), s["start"] - 0.35, 0.35, 0, 0.4)
        place(impact(2.5, 80, 30), s["start"] + 0.15, 0.55, 0, 0.6)
        place(glitch(0.25), s["start"] + 0.15, 0.12, 0, 0.1)
        place(whoosh(0.6, 2500, 300), s["end"] - 0.5, 0.2, 0, 0.3)

# street: distant car + clock ticks
place(car_pass(6), 12.5, 0.18, 0, 0.3)
for k in range(4):
    n = secs(0.02)
    tick = filt(rng.standard_normal(n), "bp", (2000, 6000)) * np.exp(-np.linspace(0, 10, n))
    place(tick, 11.6 + k, 0.12, 0.2, 0.2)
place(car_pass(7), 29.0, 0.1, 0, 0.4)

# girl footsteps
def steps(t0, t1, rate, gain, pan=0.0, kind="girl", rev=0.15, jitter=0.03):
    t = t0
    k = 0
    while t < t1:
        place(footstep(kind), t, gain * rng.uniform(0.75, 1.0), pan + (0.08 if k % 2 else -0.08), rev)
        t += 1 / rate + rng.uniform(-jitter, jitter)
        k += 1

steps(19.2, 34.5, 1.9, 0.30)
steps(34.5, 37.3, 2.6, 0.34)
place(breath_cycle(2.2, 3.0, 0.15, 0.8), 34.4, 0.22, 0, 0.1)

# ghost ahead
place(braam(4.0, 49), 37.2, 0.55, 0, 0.5)
place(gasp(0.5), 37.55, 0.55, 0, 0.15)
for k, t0 in enumerate(np.arange(38.0, 60.0, 0.86)):
    g = np.interp(t0, [38, 52, 60], [0.12, 0.25, 0.12])
    place(heartbeat(), t0 - (0.18 if t0 > 52 else 0) * (k % 2), g, 0, 0.05)
# ghost dragging steps (irregular)
t = 39.0
while t < 59.5:
    g = np.interp(t, [39, 46, 53, 60], [0.10, 0.28, 0.16, 0.12])
    pan = np.interp(t, [39, 46, 53], [0.1, -0.1, 0.0])
    place(footstep("drag"), t, g, pan, 0.45)
    if rng.random() < 0.5:
        place(bone_cracks(0.4, 6), t + 0.2, g * 0.5, pan, 0.4)
    t += rng.uniform(0.7, 1.25)
place(whisper([("i", .15, "n"), ("ae", .2, ""), ("a", .2, "g"), ("i", .25, "")]) * 1, 49.5, 0.07, 0.7, 0.9)
place(whisper([("eo", .2, "d"), ("i", .2, ""), ("i", .2, "s"), ("eo", .3, "")])[::-1], 51.2, 0.07, -0.7, 0.9)

# girl face: heartbeat faster + trembling breath
for t0 in np.arange(53.2, 60, 0.6):
    place(heartbeat(), t0, 0.32, 0, 0.05)
place(breath_cycle(1.8, 6.5, 0.5, 1.0), 53.2, 0.22, 0, 0.1)
place(whimper(0.3, 460), 55.0, 0.12, 0, 0.2)

# stop
place(footstep("drag"), 64.1, 0.3, 0, 0.5)
place(braam(3.5, 46), 64.1, 0.35, 0, 0.5)
steps(64.5, 66.9, 1.6, 0.22)
for t0 in np.arange(67.2, 72, 1.0):
    place(heartbeat(), t0, 0.16, 0, 0.0)
place(gasp(0.35, 0.9), 70.2, 0.25, 0, 0.1)

# head turn: bone cracks + riser + groan
place(bone_cracks(7.5, 3.5), 72.3, 0.55, 0.05, 0.35)
place(riser(8.0), 72.0, 0.35, 0, 0.5)
groan = voice([("eo", 1.4, ""), ("o", 1.6, ""), ("eo", 1.2, "")], f0=78, breath=0.5, vib=2, vib_depth=0.05, rough=0.4)
place(groan, 74.0, 0.22, 0.1, 0.6)

# FACE REVEAL hit
place(impact(3.5, 140, 25), 80.0, 1.0, 0, 0.5)
place(scream(1.2, 700, True), 80.0, 0.35, 0, 0.7)
place(glitch(0.6), 80.0, 0.35, 0, 0.1)
place(gasp(0.6, 1.1), 80.35, 0.6, 0, 0.15)
for t0 in np.arange(81.2, 92, 0.52):
    place(heartbeat(), t0, 0.3, 0, 0.0)
# ghost voice lines (Korean syllable-matched)
gv1 = ghost_voice([("ae", .32, "n"), ("a", .26, ""), ("i", .3, "g"), ("eo", .3, ""), ("i", .3, "d"), ("i", .3, "s"), ("eo", .65, "s")], 160)
place(gv1, 83.6, 0.75, 0.05, 0.6)
gv2 = ghost_voice([("ae", .32, "n"), ("a", .26, ""), ("i", .32, "g"), ("a", .32, "b"), ("eo", .7, "s")], 150)
place(gv2, 87.8, 0.75, 0.05, 0.6)
place(whisper([("a", .2, ""), ("i", .2, "g"), ("a", .3, "")]), 90.5, 0.12, -0.8, 1.0)

# point
place(breath_cycle(2.4, 6.0, 0.6, 1.0), 92.2, 0.25, 0, 0.1)
place(whimper(0.45, 430), 95.7, 0.45, 0, 0.25)
place(whimper(0.6, 400), 96.6, 0.45, 0, 0.25)
t = 98.8
while t < 103.5:
    g = np.interp(t, [98.8, 103.5], [0.25, 0.05])
    place(filt(footstep("drag"), "low", 1200), t, g, np.interp(t, [98.8, 103.5], [0.2, 0.9]), 0.6)
    t += rng.uniform(0.8, 1.1)
exh = filt(rng.standard_normal(secs(1.6)), "bp", (350, 1800)) * env_ar(secs(1.6), 0.15, 1.2, 1.5)
place(norm(exh), 101.4, 0.35, 0, 0.2)

# walk away
steps(108.0, 115.9, 1.45, 0.20, rev=0.25)
for t0 in np.arange(108.5, 116, 0.75):
    place(heartbeat(), t0, 0.12, 0, 0.0)
for k, (t0, pan) in enumerate(((111.8, -0.9), (112.9, 0.8), (114.0, -0.5), (114.9, 0.6))):
    w = whisper([("ae", .2, "n"), ("a", .2, ""), ("i", .25, "g")])
    place(w if k % 2 else w[::-1], t0, 0.11, pan, 1.0)
place(riser(4.5), 111.4, 0.25, 0, 0.5)

# SCREAM (after sudden silence 116-117.2)
place(scream(3.0, 560, True), 117.2, 1.0, 0, 0.9)
place(impact(4, 160, 24), 117.2, 1.0, 0, 0.5)
place(glitch(0.8), 117.2, 0.3, 0, 0.1)
place(gasp(0.5, 1.2), 118.0, 0.4, 0, 0.1)
place(whoosh(0.6, 400, 4000), 120.55, 0.6, 0, 0.2)

# chase
t = 121.0
rate = 2.2
while t < 127.4:
    place(footstep("run"), t, np.interp(t, [121, 127.4], [0.35, 0.9]), rng.uniform(-0.15, 0.15), 0.3)
    if rng.random() < 0.5:
        place(bone_cracks(0.25, 10), t + 0.05, 0.4, 0, 0.3)
    t += 1 / rate * rng.uniform(0.6, 1.3)
    rate = np.interp(t, [121, 127.4], [2.2, 6.5])
place(breath_cycle(3.5, 6.0, 0.7, 1.0), 121.2, 0.35, 0, 0.1)
place(gasp(0.3, 1.3), 124.6, 0.4, 0, 0.1)
place(gasp(0.25, 1.4), 125.3, 0.35, 0, 0.1)
place(riser(4.0), 123.6, 0.55, 0, 0.5)
place(scream(1.2, 820, True), 126.9, 0.7, 0, 0.8)
place(impact(3, 180, 22), 127.6, 1.0, 0, 0.6)
place(glitch(0.4), 127.6, 0.4, 0, 0)
# tinnitus + slow heartbeat in black
n = secs(4.5)
tin = np.sin(2 * np.pi * 6200 * np.arange(n) / SR) * np.exp(-np.linspace(0, 3, n))
place(tin, 128.2, 0.06, 0, 0.0)
for t0 in (128.6, 129.9, 131.4, 133.1):
    place(filt(heartbeat(), "low", 100), t0, 0.35, 0, 0.0)

# wake: crowd murmur muffled then opening, deep gasp
mur = murmur(15.5, 9)
mur_m = filt(mur, "low", 450)
op = np.interp(np.arange(len(mur)) / SR, [0, 1.0, 4.5], [0, 0, 1])
crowd = mur_m * (1 - op) * 1.4 + mur * op
crowd = crowd * env_ar(len(crowd), 0.8, 2.0, 1)
cL = crowd
cR = np.roll(crowd, 900)
place(np.stack([cL, cR], 1), 134.5, 0.22, 0, 0.35)
place(gasp(0.9, 0.95), 135.3, 0.6, 0, 0.2)
place(breath_cycle(1.3, 4.0, 0.3, 0.7), 136.3, 0.2, 0, 0.1)
place(voice([("a", .25, "g"), ("ae", .25, "n"), ("a", .2, "ch"), ("a", .35, "")], f0=230, breath=0.25), 138.6, 0.22, 0.25, 0.3)
place(braam(4, 44), 146.0, 0.35, 0, 0.6)

# backstory: music box lullaby (A minor), detuning as story darkens
A4 = 440.0
mel = [(0, .5), (3, .5), (7, .5), (12, 1.0), (10, .5), (7, .5), (8, .5), (7, 1.0),
       (5, .5), (3, .5), (2, .5), (3, 1.0), (0, .5), (2, .5), (3, .5), (-2, 1.0),
       (0, .5), (3, .5), (7, .5), (12, 1.0), (10, .5), (8, .5), (7, 1.5), (3, .5), (2, .5), (0, 2.0)]
t = 153.7
k = 0
while t < 175.5:
    semi, d = mel[k % len(mel)]
    k += 1
    darkness = np.interp(t, [153.7, 161.5, 171.5, 175.5], [0, 8, 30, 60])
    f = A4 * 2 ** ((semi - 12) / 12)
    note = music_box_note(f, 2.0, rng.uniform(-darkness, darkness))
    place(note, t, 0.22, np.sin(k) * 0.3, 0.7)
    t += d * np.interp(t, [153.7, 170, 175.5], [0.62, 0.72, 0.95])
place(door_slam(), 163.0, 0.8, -0.2, 0.7)
place(sob(3.6), 164.6, 0.35, 0, 0.5)
rain = np.stack([filt(white(22), "high", 2500), filt(white(22), "high", 2500)], 1)
rain *= env_ar(len(rain), 2.0, 0.05, 1)[:, None]
for _ in range(400):
    i = rng.integers(0, len(rain) - 500)
    rain[i:i + 300] += (filt(rng.standard_normal(300), "bp", (1500, 5000)) * np.exp(-np.linspace(0, 8, 300)))[:, None] * rng.uniform(0.5, 2)
rain_lvl = np.interp(np.arange(len(rain)) / SR, [0, 7, 11.5, 11.7, 22], [0.3, 0.6, 1.0, 0, 0])
place(rain * rain_lvl[:, None] * 0.6, 164.0, 0.12, 0, 0.2)
place(whoosh(1.2, 3000, 150), 174.6, 0.5, 0, 0.6)   # descent
place(filt(impact(2.0, 70, 30), "low", 200), 175.85, 0.4, 0, 0.8)  # far, muffled
for t0, pan in ((176.5, -0.8), (177.4, 0.7), (178.3, -0.3), (179.0, 0.4)):
    place(whisper([("ae", .2, "n"), ("a", .22, ""), ("i", .25, "g"), ("a", .3, "")])[::-1], t0, 0.12, pan, 1.0)
rev_box = np.concatenate([music_box_note(A4 * 2 ** (s / 12), 1.2) for s in (0, -2, -5, -9)])[::-1]
place(rev_box, 176.3, 0.15, 0, 0.8)

# ending
place(car_pass(6), 184.0, 0.08, 0, 0.4)
t = 187.6
while t < 196.3:
    g = np.interp(t, [187.6, 196.3], [0.08, 0.38])
    place(footstep("drag"), t, g, 0, 0.5)
    t += rng.uniform(0.7, 1.0)
for t0 in np.arange(188.0, 196.5, np.interp(0, [0, 1], [0.7, 0.7])):
    place(heartbeat(), t0, np.interp(t0, [188, 196.5], [0.1, 0.35]), 0, 0.0)
place(riser(6.0), 190.5, 0.35, 0, 0.5)
gv3 = ghost_voice([("ae", .32, "n"), ("a", .26, ""), ("i", .3, "g"), ("eo", .3, ""), ("i", .3, "d"), ("i", .3, "s"), ("eo", .55, "s")], 140)
place(gv3, 194.3, 0.8, 0, 0.7)
# JUMP SCARE (after silence at 196.6-197.0)
place(scream(1.6, 650, True), 197.0, 1.0, 0, 0.8)
place(impact(4.5, 200, 22), 197.0, 1.0, 0, 0.6)
place(glitch(0.7), 197.0, 0.45, 0, 0)
# end card: last music box notes
for k, (semi, t0) in enumerate(((12, 199.0), (10, 199.7), (7, 200.4), (3, 201.6), (0, 202.8))):
    place(music_box_note(A4 * 2 ** ((semi - 12) / 12), 2.5, k * 8), t0, 0.2, 0, 0.8)

# ---------------------------------------------------------------- reverb + master
print("reverb...", file=sys.stderr)
def ir(d, decay, lp_end):
    n = secs(d)
    t = np.arange(n) / SR
    chans = []
    for _ in range(2):
        x = rng.standard_normal(n) * np.exp(-t * decay)
        lo = filt(x, "low", lp_end)
        mixc = np.linspace(0, 1, n) ** 0.5
        y = x * (1 - mixc) + lo * mixc
        y[: secs(0.012)] *= np.linspace(0, 1, secs(0.012))
        chans.append(y / np.sqrt(np.sum(y ** 2)))
    return chans

irL, irR = ir(3.2, 2.0, 1800)
wetL = signal.oaconvolve(send[:, 0], irL)[:N]
wetR = signal.oaconvolve(send[:, 1], irR)[:N]
wet = np.stack([wetL, wetR], 1)
mix = dry + wet * 1.1

# master automation: sudden silence moments (kills reverb tails too)
master = curve([(0, 1), (116.0, 1), (116.05, 0.03), (117.15, 0.03), (117.2, 1), (128.0, 1), (128.15, 0.25),
                (131, 1), (175.75, 1), (175.8, 0.15), (176.3, 1), (196.55, 1), (196.6, 0.02), (196.98, 0.02),
                (197.0, 1), (197.9, 1), (198.1, 0.35), (199, 1), (204, 1), (206, 0)])
mix *= master[:, None]

# gentle glue compression (RMS-based) + soft clip
rms = np.sqrt(filt(np.mean(mix ** 2, 1), "low", 4) .clip(1e-9))
thr = np.percentile(rms, 92)
gain = np.where(rms > thr, (thr / rms) ** 0.45, 1.0)
mix *= gain[:, None]
mix = mix / (np.abs(mix).max() + 1e-9) * 1.25
mix = np.tanh(mix) / np.tanh(1.25)
mix *= 0.93
fade = np.ones(N)
fade[: secs(0.05)] = np.linspace(0, 1, secs(0.05))
mix *= fade[:, None]
out = os.path.join(HERE, "..", "public", "soundtrack.wav")
os.makedirs(os.path.dirname(out), exist_ok=True)
wavfile.write(out, SR, (mix * 32767).astype(np.int16))
print("wrote", out, mix.shape, file=sys.stderr)

"""Trilha-GUIA + efeitos-GUIA + mix do animatic.

Síntese procedural (numpy) que reproduz a ESTRUTURA musical do pacote (p. 18–19):
80 BPM (1 tempo = 0,75 s), seções, intensidades, pontos de sincronia, double-time
no Ato 4, cortes e hits do Ato 5, acorde final até 01:59. Serve apenas para validar
ritmo no animatic — não é a trilha final (encomendar composição / biblioteca com
licença corporativa, conforme p. 20).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
import soundfile as sf
import pyloudnorm as pyln

sys.path.insert(0, str(Path(__file__).parent))
from shots import VO, SFX

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
DUR = 120.0
N = int(SR * DUR)
BEAT = 0.75
rng = np.random.default_rng(7)


def t_arr(d):
    return np.arange(int(d * SR)) / SR


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[0]:
        return
    sig = sig[: buf.shape[0] - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(sig), 0] += sig * gain * l * 1.414
    buf[i:i + len(sig), 1] += sig * gain * r * 1.414


def env_adsr(n, a=0.01, d=0.2, s=0.6, r=0.3):
    e = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n); e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na); e[na:na + nd] = np.linspace(1, s, nd)
    if nr < n:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, cutoff):
    """Passa-baixa simples de 1 polo (vetorizado via ffmpeg seria pesado; ok aqui)."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def lp_fast(x, cutoff):
    from scipy.signal import lfilter  # noqa
    a = np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([1 - a], [1, -a], x)


def bp_noise(d, lo, hi):
    from scipy.signal import butter, sosfilt
    sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, rng.standard_normal(int(d * SR)))


def hz(note):  # midi -> Hz
    return 440.0 * 2 ** ((note - 69) / 12)


def piano(note, d=2.5, vel=1.0):
    t = t_arr(d); f = hz(note)
    s = sum((0.6 ** k) * np.sin(2 * np.pi * f * (k + 1) * t * (1 + 0.0004 * k)) for k in range(6))
    return s * np.exp(-t * (2.2 + note / 60)) * vel * 0.25


def pluck(note, d=0.5, vel=1.0, bright=6.0):
    t = t_arr(d); f = hz(note)
    s = sum((1 / (k + 1)) * np.sin(2 * np.pi * f * (k + 1) * t) for k in range(4))
    return s * np.exp(-t * bright) * vel * 0.3


def brass(note, d, vel=1.0, att=0.08):
    t = t_arr(d); f = hz(note)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = sum(((0.85 ** k) / (k + 1) ** 0.4) * np.sin(ph * (k + 1)) for k in range(8))
    return s * env_adsr(len(t), att, 0.15, 0.75, min(0.25, d / 3)) * vel * 0.10


def strings(note, d, vel=1.0):
    t = t_arr(d); out = np.zeros_like(t)
    for det in (-0.12, 0.0, 0.11):
        f = hz(note + det)
        out += sum((0.5 ** k) * np.sin(2 * np.pi * f * (k + 1) * t + rng.uniform(0, 6)) for k in range(5))
    return out * env_adsr(len(t), min(0.6, d / 3), 0.2, 0.9, min(0.8, d / 3)) * vel * 0.035


def sax(note, d, vel=1.0):
    s = brass(note, d, vel, att=0.12)
    return lp_fast(s, 1800) * 1.6


def kick(vel=1.0):
    t = t_arr(0.35); f = 90 * np.exp(-t * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * vel * 0.8


def snare(vel=1.0):
    t = t_arr(0.22)
    return (bp_noise(0.22, 900, 6000) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.4) * np.exp(-t * 18) * vel * 0.5


def hat(vel=1.0, d=0.06):
    return bp_noise(d, 6000, 15000) * np.exp(-t_arr(d) * 60) * vel * 0.25


def brush(vel=1.0):
    d = 0.35
    return bp_noise(d, 2000, 9000) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) * vel * 0.10


def crash(vel=1.0, d=2.5):
    return bp_noise(d, 3000, 16000) * np.exp(-t_arr(d) * 1.6) * vel * 0.35


def boom(vel=1.0, d=2.5):
    t = t_arr(d); f = 70 * np.exp(-t * 3) + 32
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
            + bp_noise(d, 30, 200) * np.exp(-t * 6) * 0.3) * vel


def riser(d):
    t = t_arr(d); x = t / d
    from scipy.signal import butter, sosfilt
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t); seg = int(SR * 0.05)
    for i in range(0, len(t), seg):
        c = 400 + 7000 * x[i] ** 2
        sos = butter(2, [c * 0.7, min(c * 1.4, 20000)], btype="band", fs=SR, output="sos")
        out[i:i + seg] = sosfilt(sos, n[i:i + seg])
    return out * x ** 1.5 * 0.5


# --------------------------------------------------------------------------- music
CHORDS = {  # voicings em Ré menor, jazz anos 20
    "Dm9": [50, 57, 60, 64, 65], "Bbmaj7": [46, 57, 58, 62, 65], "Gm9": [43, 58, 62, 65, 69],
    "A7b9": [45, 55, 61, 64, 70], "Fmaj7": [41, 57, 60, 64, 65], "D": [38, 57, 62, 66, 69],
}
PROG = ["Dm9", "Bbmaj7", "Gm9", "A7b9"]


def chord_at(t, bars_per_chord=2):
    bar = int(t / (BEAT * 4))
    return CHORDS[PROG[(bar // bars_per_chord) % 4]]


def music():
    L = np.zeros((N, 2))
    beats = np.arange(0, DUR, BEAT)
    # Intro misteriosa 00:03–00:24 — piano solo médio, sax com surdina, contrabaixo pizz a partir de 00:12
    for b in beats[(beats >= 3) & (beats < 24)]:
        k = int(round(b / BEAT))
        ch = chord_at(b)
        if k % 4 == 0:
            for n in ch[1:]:
                add(L, piano(n, 3.0, 0.7), b + rng.uniform(0, 0.02), pan=rng.uniform(-.3, .3))
        if b >= 12 and k % 2 == 0:
            add(L, pluck(ch[0] - 12 + 12, 0.7, 1.3, 5), b, 0.9)
    for st, n, d in [(6.0, 69, 1.4), (7.5, 67, 0.7), (8.25, 65, 2.0), (13.5, 64, 1.0), (15.0, 65, 0.7),
                     (15.75, 69, 2.2), (19.5, 72, 1.5), (21.0, 70, 0.75), (21.75, 69, 2.2)]:
        add(L, sax(n, d, 0.9), st, 0.9, pan=0.25)
    # Preparação 00:24–00:44 — escovinhas, clarinete, acento de piano a cada corte (2 tempos); respiro em 00:33
    for b in beats[(beats >= 24) & (beats < 44)]:
        k = int(round(b / BEAT)); ch = chord_at(b)
        if 32.9 < b < 33.8:
            continue  # respiro para o leque
        add(L, brush(1.0), b, 1.0, pan=-0.2)
        if k % 2 == 0 and b < 33:
            for n in ch[1:]:
                add(L, piano(n + 12 * (n < 55), 1.5, 0.9), b)
        if k % 2 == 0:
            add(L, pluck(ch[0], 0.6, 1.4, 5), b, 1.0)
        if b >= 34 and k % 4 == 0:
            for n in ch[1:]:
                add(L, piano(n, 2.8, 0.6), b)
    for st, n, d in [(24.0, 74, 1.5), (25.5, 72, 1.5), (27.0, 70, 1.5), (28.5, 69, 1.5), (30.0, 67, 1.5),
                     (31.5, 69, 1.5), (34.5, 74, 2.25), (37.5, 77, 1.5), (39.0, 76, 1.5), (40.5, 74, 3.0)]:
        add(L, lp_fast(brass(n, d, 0.7, 0.06), 2500) * 1.4, st, 0.7, pan=0.3)  # "clarinete"
    # Viagem e chegada 00:44–01:08 — metais em crescendo, cordas; riser 00:51; tutti 01:02
    for b in beats[(beats >= 44) & (beats < 68)]:
        k = int(round(b / BEAT)); ch = chord_at(b)
        inten = 0.55 + 0.45 * (b - 44) / 24
        if k % 4 == 0:
            for n in ch[1:]:
                add(L, strings(n, 3.1, inten), b, pan=rng.uniform(-.5, .5))
        if k % 2 == 0:
            add(L, pluck(ch[0], 0.7, 1.5 * inten, 5), b)
        add(L, brush(inten * 1.2), b)
        if b >= 53 and k % 4 == 0:
            for n in ch[1:4]:
                add(L, brass(n + 12, 2.9, inten), b, pan=rng.uniform(-.4, .4))
    add(L, riser(2.0), 51.0, 1.0)
    add(L, crash(1.0, 3.0), 53.0, 0.7)
    for n in CHORDS["D"] + [74, 78, 81]:  # tutti na revelação do salão (01:02)
        add(L, brass(n, 3.0, 1.2), 62.0, pan=rng.uniform(-.6, .6))
        add(L, strings(n, 5.5, 1.3), 62.0)
    add(L, crash(1.0), 62.0); add(L, kick(1.2), 62.0)
    # Festa 01:08–01:24 — big band double-time
    for b in np.arange(68, 84, BEAT / 2):
        k = int(round(b / (BEAT / 2))); ch = chord_at(b, 1)
        add(L, hat(0.8 if k % 2 else 0.5), b, pan=0.3)
        if k % 2 == 0:
            add(L, kick(0.9), b)
            add(L, pluck(ch[(k // 2) % 3] - 12 * (ch[0] > 45), 0.35, 1.6, 9), b)  # walking bass
        else:
            add(L, snare(0.8), b, pan=-0.1)
            for n in ch[1:4]:
                add(L, pluck(n + 12, 0.25, 0.6, 14), b, 0.6, pan=0.5)  # banjo
        if k % 8 == 0:
            for n in ch[1:]:
                add(L, brass(n + 12, 0.45, 1.0, 0.02), b + BEAT / 2, pan=rng.uniform(-.5, .5))  # stabs
    for st, n in [(68, 74), (69.5, 77), (71, 76), (72.5, 74), (74, 72), (75.5, 74), (77, 77), (78.5, 81),
                  (80, 79), (81.5, 77), (83, 74)]:
        add(L, brass(n, 1.3, 1.1), st, pan=0.2)  # trompete
    # Premiação 01:24–01:36 — piano e cordas; metais voltam 01:29 e crescem até 01:36
    for b in beats[(beats >= 84) & (beats < 96)]:
        k = int(round(b / BEAT)); ch = chord_at(b)
        if k % 4 == 0:
            for n in ch[1:]:
                add(L, piano(n, 3.0, 0.8), b)
                add(L, strings(n, 3.1, 0.8 + 0.4 * (b > 89)), b)
        if b >= 89:
            inten = 0.6 + 0.6 * (b - 89) / 7
            add(L, brush(inten * 1.3), b)
            if k % 2 == 0:
                add(L, pluck(ch[0], 0.6, 1.5, 5), b)
                for n in ch[1:4]:
                    add(L, brass(n + 12, 1.4, inten), b)
    add(L, crash(0.9), 89.0)
    # Suspense 01:36–01:46: cauda até o corte total em 01:38; booms 01:38 e 01:42; drone de cordas
    add(L, strings(38, 10.0, 2.0) + strings(50, 10.0, 1.2), 98.0)
    # Explosão 01:46–01:47,5 — acorde de banda com prato; corte seco em 01:47,5
    for n in CHORDS["D"] + [74, 78, 81, 86]:
        add(L, brass(n, 1.6, 1.4, 0.01), 106.0, pan=rng.uniform(-.7, .7))
        add(L, strings(n, 1.6, 1.4), 106.0)
    add(L, crash(1.3, 1.5), 106.0); add(L, kick(1.5), 106.0); add(L, boom(0.6, 1.5), 106.0)
    # Cartelas 01:47,5–01:52: um hit grave por cartela
    for at in (107.5, 109.1, 110.5):
        add(L, boom(0.9, 1.4), at)
    # Assinatura 01:52–02:00 — tema em metais e orquestra, acorde até 01:59
    theme = [(112.0, 74, 0.75), (112.75, 77, 0.75), (113.5, 81, 1.5), (115.0, 79, 0.75), (115.75, 77, 0.75),
             (116.5, 74, 2.5)]
    for st, n, d in theme:
        add(L, brass(n, d, 1.0), st, pan=0.1)
    for st, ch in [(112.0, "Bbmaj7"), (113.5, "Gm9"), (115.0, "A7b9"), (116.5, "D")]:
        dd = 1.5 if st < 116 else 3.2
        for n in CHORDS[ch]:
            add(L, strings(n, dd, 1.1), st); add(L, brass(n, dd, 0.5), st)
    add(L, crash(0.6, 3.0), 116.5)
    # Fades estruturais
    def gain_seg(t0, t1, g0, g1):
        i0, i1 = int(t0 * SR), int(t1 * SR)
        L[i0:i1] *= np.linspace(g0, g1, i1 - i0)[:, None]
    gain_seg(96.0, 98.0, 1.0, 0.0)   # festa some com o burburinho; "corte total" em 01:38
    i = int(98.0 * SR); L[int(97.98 * SR):i] = 0
    L[int(107.5 * SR):int(107.52 * SR)] *= np.linspace(1, 0, int(0.02 * SR))[:, None]
    gain_seg(117.5, 119.0, 1.0, 0.6); gain_seg(119.0, 120.0, 0.6, 0.0)
    return L


# --------------------------------------------------------------------------- sfx
def projector(d, slow=False):
    t = t_arr(d)
    rate = 24 * (1 - 0.85 * (t / d) ** 1.5) if slow else np.full_like(t, 24.0)
    ph = np.cumsum(rate) / SR
    click = (np.mod(ph, 1.0) < 0.12).astype(float)
    hum = np.sin(2 * np.pi * 60 * t) * 0.05 + bp_noise(d, 200, 3000) * 0.08
    s = lp_fast(click, 2500) * 0.6 + hum
    if slow:
        s *= np.clip((d - t) / 0.15, 0, 1)
    else:
        s *= np.clip(t / 0.3, 0, 1)
    return s * 0.5


def sfx_lib(name, d):
    t = t_arr(d)
    if name == "projector_on":
        return projector(d)
    if name == "projector_stop":
        return projector(d, slow=True)
    if name in ("city_1920", "party_murmur", "murmur_out"):
        s = bp_noise(d, 250, 2500) * 0.18 + bp_noise(d, 80, 300) * 0.1
        if name == "city_1920":  # buzinas antigas
            for at in (2.0, 6.5):
                tt = t_arr(0.4); s[int(at * SR):int(at * SR) + len(tt)] += np.sign(np.sin(2 * np.pi * 330 * tt)) * 0.06 * np.sin(np.pi * tt / 0.4)
        if name == "murmur_out":
            s *= np.linspace(1, 0, len(s)) ** 2
        return s * env_adsr(len(t), 0.4, 0.1, 1, 0.5)
    if name in ("car_pass", "engine_wet"):
        f = 38 + 6 * np.sin(2 * np.pi * 0.7 * t)
        s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.08 + bp_noise(d, 100, 800) * 0.12
        if name == "engine_wet":
            s += bp_noise(d, 2000, 8000) * 0.05  # pneus no molhado
        return lp_fast(s, 900) * np.sin(np.pi * t / d) * 1.5
    if name == "footsteps":
        s = np.zeros_like(t)
        for k in range(int(d / 0.5)):
            e = bp_noise(0.08, 300, 3000) * np.exp(-t_arr(0.08) * 50)
            i = int((k * 0.5 + 0.1) * SR); s[i:i + len(e)] += e * 0.5
        return s
    if name == "bell":
        return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 3) for f in (880, 1320 * 1.01, 2210)) * 0.12
    if name in ("wax_crack", "watch_click", "glass_marble", "clink"):
        f = {"wax_crack": (1500, 7000), "watch_click": (3000, 12000), "glass_marble": (800, 5000), "clink": (3000, 9000)}[name]
        s = bp_noise(d, *f) * np.exp(-t * 40)
        if name == "clink":
            s += np.sin(2 * np.pi * 3520 * t) * np.exp(-t * 12) * 0.3
        return s * 0.8
    if name == "paper_slide":
        return bp_noise(d, 1500, 8000) * np.sin(np.pi * t / d) * 0.25
    if name == "fan_whoosh":
        return riser(d)[::-1] * 0.6 + bp_noise(d, 200, 1500) * np.sin(np.pi * t / d) * 0.2
    if name == "ratchet4":
        s = np.zeros_like(t)
        for k in range(4):
            e = bp_noise(0.04, 2000, 9000) * np.exp(-t_arr(0.04) * 90)
            i = int((0.2 + k * 0.45) * SR); s[i:i + len(e)] += e * 0.9
        return s
    if name == "car_door":
        return (boom(0.6, d) + bp_noise(d, 100, 1200) * np.exp(-t * 30) * 0.5)
    if name == "riser":
        return riser(d) * 0.7
    if name == "shutter_flash":
        s = np.sin(2 * np.pi * (2000 + 3000 * t / d) * t) * 0.02 * (t < d * 0.8)
        e = bp_noise(0.05, 2000, 10000) * np.exp(-t_arr(0.05) * 80)
        i = int(d * 0.85 * SR); s[i:i + len(e)] += e
        return s
    if name == "shaker_ice":
        return bp_noise(d, 2500, 10000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 6 * t))) * 0.25
    if name == "envelope":
        return bp_noise(d, 1000, 6000) * np.sin(np.pi * t / d) * 0.3
    if name in ("applause", "crowd_explode", "surprise_laugh"):
        s = np.zeros_like(t)
        dens = {"applause": 900, "crowd_explode": 1600, "surprise_laugh": 300}[name]
        idx = rng.integers(0, len(t) - 600, int(dens * d))
        click = bp_noise(0.012, 800, 6000) * np.exp(-t_arr(0.012) * 300)
        for i in idx:
            s[i:i + len(click)] += click * rng.uniform(0.2, 1)
        s += bp_noise(d, 300, 2000) * (0.2 if name != "applause" else 0.05)
        return s * env_adsr(len(t), 0.1, 0.1, 1, 0.4) * 0.35
    if name == "spot_click_boom":
        e = bp_noise(0.05, 1500, 8000) * np.exp(-t_arr(0.05) * 60)
        return np.concatenate([e, np.zeros(max(0, len(t) - len(e)))])[:len(t)] + 0
    if name == "velvet":
        return bp_noise(d, 400, 3000) * np.sin(np.pi * t / d) * 0.15
    return np.zeros_like(t)


def sfx_track():
    S = np.zeros((N, 2))
    for t0, t1, name in SFX:
        d = t1 - t0
        if name == "spot_click_boom":
            d = 0.1
        s = sfx_lib(name, d)
        pan = 0.0
        if name == "car_pass":  # pan esquerda → direita
            n = len(s); p = np.linspace(-1, 1, n)
            S[int(t0 * SR):int(t0 * SR) + n, 0] += s * np.cos((p + 1) * np.pi / 4) * 1.414
            S[int(t0 * SR):int(t0 * SR) + n, 1] += s * np.sin((p + 1) * np.pi / 4) * 1.414
            continue
        add(S, s, t0, 1.0, pan)
    for at in (98.0, 102.0):  # booms graves isolados (01:38 e 01:42)
        add(S, boom(1.0, 3.0), at)
    return S


# --------------------------------------------------------------------------- VO
def vo_track():
    V = np.zeros((N, 2)); spans = []
    starts = [v[1] for v in VO] + [DUR]
    for i, (vid, t0, _t1, *_r) in enumerate(VO):
        x, sr = sf.read(ROOT / "audio" / "vo" / f"{vid}.wav")
        allowed = min(starts[i + 1] - 0.15, DUR) - t0
        dur = len(x) / sr
        if dur > allowed:  # comprime levemente (máx. 10%) só se colidir com a fala seguinte / fim
            fac = min(dur / allowed, 1.10)
            x = np.interp(np.arange(0, len(x), fac), np.arange(len(x)), x)
        if vid == "vo08":  # voz do apresentador no microfone, com reverberação de salão
            ir_t = t_arr(1.8); ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2); ir[0] = 6
            from scipy.signal import fftconvolve
            x = fftconvolve(x, ir)[: len(x) + int(1.2 * SR)]
            x = x / np.max(np.abs(x)) * 0.5
        add(V, x, t0, 1.0)
        spans.append((t0, t0 + len(x) / SR))
    return V, spans


def main():
    M = music(); S = sfx_track(); V, spans = vo_track()
    # ducking: música -7 dB sob a voz (01:27–01:31: -6 dB extra por instrução do roteiro, já embutido)
    duck = np.ones(N)
    for a, b in spans:
        i0, i1 = int((a - 0.25) * SR), int((b + 0.3) * SR)
        duck[i0:i1] = np.minimum(duck[i0:i1], 10 ** (-7 / 20))
    from scipy.ndimage import uniform_filter1d
    duck = uniform_filter1d(duck, int(0.2 * SR))
    M *= duck[:, None]
    meter = pyln.Meter(SR)
    def norm(x, lufs):
        l = meter.integrated_loudness(x)
        return x * 10 ** ((lufs - l) / 20) if np.isfinite(l) else x
    M = norm(M, -20); S = norm(S, -27); V = norm(V, -15)
    mix = M + S + V
    mix = norm(mix, -14.0)
    peak = np.max(np.abs(mix))
    lim = 10 ** (-1.2 / 20)
    if peak > lim:  # limitador suave (soft-clip) para teto de -1 dBTP aprox.
        mix = np.tanh(mix / lim) * lim
    out = ROOT / "audio"
    for name, x in [("trilha_guia", M), ("sfx_guia", S), ("narracao_provisoria", V), ("mix_animatic", mix)]:
        sf.write(out / f"{name}.wav", x.astype(np.float32), SR, subtype="PCM_24")
    print("LUFS mix:", round(meter.integrated_loudness(mix), 2), "peak dBFS:", round(20 * np.log10(np.max(np.abs(mix))), 2))


if __name__ == "__main__":
    main()

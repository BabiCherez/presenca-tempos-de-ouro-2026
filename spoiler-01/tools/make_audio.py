"""Desenho de som do Spoiler 01 (30 s) e mix final a -14 LUFS.

Música: "Chicago" — Moulin Rouge Orchestra (1922), gravação 78 rpm em domínio público
(Internet Archive / Great 78 Project). Compositor Fred Fisher (†1942): obra em domínio público no Brasil.
A música soa "atrás das paredes" (abafada) até a cartela final, quando abre limpa por um instante.

Saídas: audio/stems/{musica,sfx,vo}.wav e audio/mix_spoiler01.wav (48 kHz, estéreo)
"""
import subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
DUR = 30.0
N = int(SR * DUR)
FPS = 24
rng = np.random.default_rng(512)

# Eventos sincronizados com a imagem (em quadros do vídeo, 24 fps)
KNOCKS = [216 + 14, 216 + 26, 216 + 38]          # três batidas
SHADOW = (360 + 8, 360 + 44)                      # passos da sombra
ENVELOPE = (360 + 46, 360 + 86)                   # envelope deslizando
FLAP = (480 + 40, 480 + 100)                      # brilho dourado
FLICKER = (72 + 70, 72 + 96)                      # arandela piscando no corredor
END = 600                                         # cartela final
VO = {"vo1": 3.6, "vo2": 20.6, "vo3": 26.3}       # início de cada fala (s)


def t(n):
    return np.arange(int(n * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=4):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def place(buf, sig, at_s, gain=1.0):
    i = int(at_s * SR)
    if sig.ndim == 1:
        sig = np.stack([sig, sig], 1)
    sig = sig[: max(0, N - i)]
    buf[i:i + len(sig)] += sig * gain


def env_fade(n, fin, fout):
    e = np.ones(n)
    a, b = int(fin * SR), int(fout * SR)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if b:
        e[-b:] *= np.linspace(1, 0, b)
    return e


def room_ir(dur=1.2, decay=4.0):
    tt = t(dur)
    ir = rng.standard_normal(len(tt)) * np.exp(-tt * decay)
    ir = lp(ir, 3500)
    ir[0] = 4
    return ir / np.abs(ir).sum() * 6


# ------------------------------------------------------------------ música
def load_music():
    raw = ROOT / "audio" / "src" / "chicago_1922.flac"
    out = ROOT / "audio" / "src" / "chicago_48k.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-ar", str(SR), "-ac", "2", str(out)], check=True)
    x, _ = sf.read(out)
    return x


def music_track():
    x = load_music()
    M = np.zeros((N, 2))
    # trecho abafado (0–9 s): começa em 34 s da gravação
    a = x[int(34 * SR): int(34 * SR) + int(9.3 * SR)].copy()
    muff = np.stack([lp(a[:, c], 520) for c in range(2)], 1)
    ir = room_ir(1.6, 3.0)
    muff = np.stack([fftconvolve(muff[:, c], ir)[: len(muff)] for c in range(2)], 1)
    vol = np.interp(np.arange(len(muff)) / SR, [0, 3, 8.8, 9.3], [0.9, 1.3, 1.8, 0.0])
    place(M, muff * vol[:, None], 0.0)
    # retorno muito distante sob o envelope (20–25 s)
    b = x[int(52 * SR): int(52 * SR) + int(5.2 * SR)].copy()
    far = np.stack([lp(b[:, c], 380) for c in range(2)], 1) * env_fade(len(b), 1.5, 0.8)[:, None]
    place(M, far * 0.9, 20.0)
    # cartela final: a música "abre", limpa, e some
    c = x[int(60 * SR): int(60 * SR) + int(4.6 * SR)].copy()
    c = np.stack([bp(c[:, k], 120, 7000) for k in range(2)], 1) * env_fade(len(c), 0.04, 2.2)[:, None]
    place(M, c * 0.3, END / FPS)
    return M


# ------------------------------------------------------------------ efeitos
def knock_sfx():
    d = 0.35
    tt = t(d)
    body = np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 28) + np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 40) * 0.6
    click = bp(rng.standard_normal(len(tt)), 800, 4500) * np.exp(-tt * 140) * 0.5
    s = body + click
    return fftconvolve(s, room_ir(0.6, 9))[: len(tt) + int(0.3 * SR)] * 0.9


def sfx_track():
    S = np.zeros((N, 2))
    # tom de ambiente (quarto silencioso, hotel antigo)
    amb = lp(rng.standard_normal(N), 180) * 0.02 + np.sin(2 * np.pi * 50 * t(DUR)) * 0.004
    S += np.stack([amb, amb], 1)
    # relógio no quarto (0–3 s e 12–15 s)
    tick = bp(rng.standard_normal(int(0.03 * SR)), 2500, 8000) * np.exp(-t(0.03) * 200)
    for st, en in [(0.2, 3.0), (12.1, 15.0)]:
        k = st
        while k < en:
            place(S, tick, k, 0.25)
            k += 1.0
    # arandela falhando (zumbido elétrico)
    a, b = FLICKER[0] / FPS, FLICKER[1] / FPS
    buzz = np.sign(np.sin(2 * np.pi * 120 * t(b - a))) * 0.02 + bp(rng.standard_normal(int((b - a) * SR)), 2000, 6000) * 0.03
    buzz *= (rng.random(len(buzz)) > 0.3)
    place(S, lp(buzz, 4000), a, 0.8)
    # três batidas
    for f in KNOCKS:
        place(S, knock_sfx(), f / FPS, 1.0)
    # olho mágico: grave suspenso
    tt = t(3.2)
    drone = (np.sin(2 * np.pi * 41 * tt) + 0.5 * np.sin(2 * np.pi * 61.5 * tt)) * np.sin(np.pi * tt / 3.2) * 0.08
    place(S, drone, 12.0)
    # passos abafados da sombra
    a, b = SHADOW[0] / FPS, SHADOW[1] / FPS
    k = a
    while k < b:
        step = lp(rng.standard_normal(int(0.12 * SR)), 300) * np.exp(-t(0.12) * 35) * 0.5
        place(S, step, k, 0.6)
        k += 0.42
    # envelope deslizando no assoalho
    a, b = ENVELOPE[0] / FPS, ENVELOPE[1] / FPS
    n = int((b - a) * SR)
    slide = bp(rng.standard_normal(n), 1500, 7000) * np.interp(np.arange(n) / n, [0, 0.1, 0.7, 1], [0, 1, 0.6, 0]) * 0.18
    place(S, slide, a)
    # brilho dourado (shimmer)
    a, b = FLAP[0] / FPS, FLAP[1] / FPS
    tt = t(b - a + 1)
    sh = sum(np.sin(2 * np.pi * f * tt + rng.random() * 6) for f in (1760, 2217, 2637, 3520)) * 0.012
    sh *= np.interp(tt, [0, (b - a) * 0.8, b - a + 1], [0, 1, 0]) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt))
    place(S, sh, a)
    # corte para a cartela: impacto grave
    tt = t(2.5)
    hit = np.sin(2 * np.pi * np.cumsum(55 * np.exp(-tt * 2) + 35) / SR) * np.exp(-tt * 2.2) * 0.5
    place(S, hit, END / FPS)
    # eco de uma última batida no fim
    place(S, knock_sfx() * 0.35, 28.6)
    return S


# ------------------------------------------------------------------ narração
def vo_track():
    V = np.zeros((N, 2))
    for k, at in VO.items():
        x, _ = sf.read(ROOT / "audio" / "vo" / f"{k}.wav")
        # timbre de rádio antigo, sutil: corta graves/agudos extremos e satura levemente
        x = bp(x, 110, 6500)
        x = np.tanh(x * 1.6) / 1.6
        x = x + fftconvolve(x, room_ir(0.5, 12))[: len(x)] * 0.15
        place(V, x, at)
    return V


def main():
    M, S, V = music_track(), sfx_track(), vo_track()
    meter = pyln.Meter(SR)

    def norm(x, target):
        l = meter.integrated_loudness(x)
        return x * 10 ** ((target - l) / 20) if np.isfinite(l) else x

    M, S, V = norm(M, -24), norm(S, -25), norm(V, -17)
    # ducking da música sob a voz
    duck = np.ones(N)
    for k, at in VO.items():
        a = int((at - 0.2) * SR)
        duck[a:a + int(3 * SR)] = 0.5
    M *= duck[:, None]
    mix = M + S + V
    l = meter.integrated_loudness(mix)
    g = 10 ** ((-14 - l) / 20)
    mix, M, S, V = mix * g, M * g, S * g, V * g
    lim = 10 ** (-1.2 / 20)
    mix = np.tanh(mix / lim) * lim
    out = ROOT / "audio" / "stems"
    out.mkdir(parents=True, exist_ok=True)
    for name, x in [("musica", M), ("sfx", S), ("vo", V)]:
        sf.write(out / f"{name}.wav", x.astype(np.float32), SR, subtype="PCM_24")
    sf.write(ROOT / "audio" / "mix_spoiler01.wav", mix.astype(np.float32), SR, subtype="PCM_24")
    print("LUFS", round(meter.integrated_loudness(mix), 1), "pico dBFS", round(20 * np.log10(np.abs(mix).max()), 1))


if __name__ == "__main__":
    main()

"""Áudio provisório da prova do olho mágico (4 s): música abafada + 2 batidas + papel."""
import sys
from pathlib import Path
import numpy as np
import soundfile as sf
sys.path.insert(0, str(Path(__file__).parent))
import make_audio as A

DUR = 4.5
N = int(A.SR * DUR)
x = A.load_music()
seg = x[int(36 * A.SR): int(36 * A.SR) + N].copy()
muff = np.stack([A.lp(seg[:, c], 480) for c in range(2)], 1) * 0.6
S = np.zeros((N, 2))
def put(sig, at, g=1.0):
    i = int(at * A.SR)
    if sig.ndim == 1:
        sig = np.stack([sig, sig], 1)
    sig = sig[: N - i]
    S[i:i + len(sig)] += sig * g
put(A.knock_sfx(), 13 / 24, 1.0)
put(A.knock_sfx(), 25 / 24, 0.75)
n = int(0.9 * A.SR)
put(A.bp(A.rng.standard_normal(n), 2000, 8000) * np.sin(np.pi * np.arange(n) / n) * 0.08, 30 / 24)
mix = muff + S * 1.4
mix *= 10 ** (-1.5 / 20) / np.abs(mix).max()
out = Path(__file__).resolve().parent.parent / "public" / "audio" / "prova_olho_magico.wav"
sf.write(out, mix.astype(np.float32), A.SR, subtype="PCM_24")
print("ok", out)

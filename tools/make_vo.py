"""Narração PROVISÓRIA (guia de animatic) via TTS pt-BR.

Não é a narração final: a voz final deve ser gravada (ou gerada em ferramenta com
licença comercial), 3 tomadas por fala, conforme p. 17 do pacote.
"""
import asyncio, subprocess, sys, json
from pathlib import Path
import edge_tts, ssl, os
import edge_tts.communicate as _c

# Respeita o CA do proxy do ambiente, se houver
if os.environ.get("SSL_CERT_FILE") or os.path.exists("/root/.ccr/ca-bundle.crt"):
    _c._SSL_CTX = ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt"))

sys.path.insert(0, str(Path(__file__).parent))
from shots import VO

OUT = Path(__file__).resolve().parent.parent / "audio" / "vo"
OUT.mkdir(parents=True, exist_ok=True)

SETTINGS = {
    "narrador": dict(voice="pt-BR-AntonioNeural", rate="-14%", pitch="-10Hz"),
    "apresentador": dict(voice="pt-BR-AntonioNeural", rate="-20%", pitch="-2Hz"),
}

# Ato 6: precisa caber em 8 s (ver inconsistência #1)
RATE_OVERRIDE = {"vo09a": {"rate": "-6%"}, "vo09b": {"rate": "+4%"}}


async def main():
    report = {}
    for vid, t0, t1, _, tts_text, who in VO:
        mp3 = OUT / f"{vid}.mp3"
        opts = dict(SETTINGS[who], **RATE_OVERRIDE.get(vid, {}))
        await edge_tts.Communicate(tts_text, **opts).save(str(mp3))
        wav = OUT / f"{vid}.wav"
        # remove silêncio de borda, mono 48 kHz
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        "-ar", "48000", "-ac", "1", str(wav)], check=True)
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
                    "format=duration", "-of", "csv=p=0", str(wav)]).decode())
        report[vid] = {"slot": round(t1 - t0, 2), "tts": round(dur, 2), "fits": dur <= (t1 - t0) + 0.15}
        mp3.unlink()
    print(json.dumps(report, indent=1))
    (OUT / "durations.json").write_text(json.dumps(report, indent=1))

asyncio.run(main())

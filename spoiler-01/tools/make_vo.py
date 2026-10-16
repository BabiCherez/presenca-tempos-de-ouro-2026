"""Narração PROVISÓRIA (voz sintética pt-BR) do Spoiler 01."""
import asyncio, os, ssl, subprocess
from pathlib import Path
import edge_tts
import edge_tts.communicate as _c

if os.path.exists("/root/.ccr/ca-bundle.crt"):
    _c._SSL_CTX = ssl.create_default_context(cafile="/root/.ccr/ca-bundle.crt")

OUT = Path(__file__).resolve().parent.parent / "audio" / "vo"
OUT.mkdir(parents=True, exist_ok=True)
LINES = {
    "vo1": "Tem coisas... que não chegam por e-mail.",
    "vo2": "Elas batem à porta.",
    "vo3": "Em breve.",
}

async def main():
    for k, t in LINES.items():
        mp3 = OUT / f"{k}.mp3"
        await edge_tts.Communicate(t, voice="pt-BR-AntonioNeural", rate="-18%", pitch="-12Hz").save(str(mp3))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        "-ar", "48000", "-ac", "1", str(OUT / f"{k}.wav")], check=True)
        mp3.unlink()
        d = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT / f"{k}.wav")]).decode().strip()
        print(k, d)

asyncio.run(main())

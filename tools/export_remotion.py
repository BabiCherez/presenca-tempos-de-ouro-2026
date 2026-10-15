"""Gera a linha do tempo do projeto Remotion a partir de tools/shots.py.

Escreve:
  remotion/src/Trailer.tsx      — 44 planos (um nó JSX editável por plano), transições, voz, trilha e efeitos
  remotion/src/data/shots.ts    — dados para o HUD do animatic

Atenção: regenerar sobrescreve edições feitas no Studio em Trailer.tsx.
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from shots import SHOTS, VO, CARDS, ACTS

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "remotion" / "src"
FPS = 24
PAN_V = {"1.2", "3.7", "3.8", "5.1"}  # viram pan lento no 9:16 (p. 22)


def f(t):
    return int(round(t * FPS))


def main():
    L = []
    w = L.append
    w('// GERADO por tools/export_remotion.py a partir de tools/shots.py — edições no Studio são sobrescritas ao regenerar.')
    w('import { Audio } from "@remotion/media";')
    w('import { TransitionSeries } from "@remotion/transitions";')
    w('import type React from "react";')
    w('import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";')
    w('import { Hud } from "./Hud";')
    w('import { LightOverlay } from "./LightOverlay";')
    w('import { Shot } from "./Shot";')
    w('import { Signature } from "./Signature";')
    w('import { TitleCard } from "./TitleCard";')
    w('import { BLACK } from "./theme";')
    w('')
    w('type TrailerProps = {')
    w('  readonly showHud: boolean;')
    w('  readonly logo: string;')
    w('};')
    w('')
    w('export const Trailer: React.FC<TrailerProps> = ({ showHud, logo }) => {')
    w('  const { fps } = useVideoConfig();')
    w('  return (')
    w('    <AbsoluteFill style={{ backgroundColor: BLACK }}>')
    w('      <TransitionSeries name="Planos">')
    for s in SHOTS:
        sid, t0, t1 = s[0], s[1], s[2]
        act = ACTS[int(sid.split(".")[0])][0]
        dur = f(t1) - f(t0)
        w(f'        <TransitionSeries.Sequence name="{sid} · {s[4][:48].replace(chr(34), "")}" durationInFrames={{{dur}}} premountFor={{fps}}>')
        if sid == "5.6":
            for i, (c0, c1, txt) in enumerate(CARDS):
                a, b = f(c0) - f(t0), f(c1) - f(t0)
                w(f'          <TitleCard name="Cartela {i + 1}" from={{{a}}} durationInFrames={{{b - a}}} premountFor={{fps}}>')
                w(f'            {txt}')
                w('          </TitleCard>')
        elif sid == "6.1":
            w('          <Signature name="Assinatura" premountFor={fps} logo={logo} dateLine="11 DE DEZEMBRO · 19H" placeLine="ESPAÇO WOOD — SÃO PAULO" />')
        elif sid == "6.2":
            w('          <AbsoluteFill style={{ backgroundColor: BLACK }} />')
        else:
            past = "true" if t0 < 53.0 else "false"  # troca de look no flare do 3.3 (inconsistência #4)
            pan = "true" if sid in PAN_V else "false"
            w(f'          <Shot name="Clipe {sid}" premountFor={{fps}} clip="clips/TDO_{sid}.mp4" past={{{past}}} verticalPan={{{pan}}} />')
        w('        </TransitionSeries.Sequence>')
    w('      </TransitionSeries>')
    w('')
    w('      {/* Transições motivadas (p. 21) */}')
    overlays = [
        ("1.1→1.2 fade-in com flicker", f(3.0), 12, "flicker-in"),
        ("2.7→2.8 leque cobre a lente", f(37.0) - 4, 4, "fan"),
        ("3.3→3.4 flare para branco", f(53.0) - 4, 8, "flare"),
        ("3.6→3.7 estouro de luz", f(62.0) - 6, 6, "burst"),
        ("4.2→4.3 flash fotográfico", f(73.0) - 2, 2, "flash"),
        ("5.4→5.5 luz explode", f(106.0) - 6, 6, "burst"),
    ]
    for name, a, d, mode in overlays:
        w(f'      <LightOverlay name="{name}" from={{{a}}} durationInFrames={{{d}}} premountFor={{fps}} mode="{mode}" />')
    w('')
    w('      {/* Trilha e efeitos (guias — trocar pelos arquivos licenciados) */}')
    w('      <Audio name="Trilha" src={staticFile("audio/trilha.wav")} premountFor={fps} />')
    w('      <Audio name="Efeitos" src={staticFile("audio/sfx.wav")} premountFor={fps} />')
    w('')
    w('      {/* Narração — uma faixa por fala (trocar pelas tomadas gravadas) */}')
    for vid, t0, t1, txt, _tts, who in VO:
        label = txt.replace('"', "'")[:40]
        w(f'      <Audio name="{vid} · {label}" src={{staticFile("audio/vo/{vid}.wav")}} from={{{f(t0)}}} premountFor={{fps}} />')
    w('')
    w('      {showHud ? <Hud /> : null}')
    w('    </AbsoluteFill>')
    w('  );')
    w('};')
    (SRC / "Trailer.tsx").write_text("\n".join(L) + "\n", encoding="utf-8")

    data = {
        "acts": {k: v[0] for k, v in ACTS.items()},
        "shots": [dict(id=s[0], t0=s[1], t1=s[2], frame=s[3], action=s[4], camera=s[5], ref=s[6]) for s in SHOTS],
        "vo": [dict(id=v[0], t0=v[1], t1=v[2], text=v[3]) for v in VO],
    }
    (SRC / "data").mkdir(exist_ok=True)
    (SRC / "data" / "shots.ts").write_text(
        "// GERADO por tools/export_remotion.py\nexport const DATA = " + json.dumps(data, ensure_ascii=False, indent=1) + " as const;\n",
        encoding="utf-8")
    print("ok", sum(f(s[2]) - f(s[1]) for s in SHOTS), "quadros")


if __name__ == "__main__":
    main()

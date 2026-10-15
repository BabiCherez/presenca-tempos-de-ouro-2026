#!/usr/bin/env bash
# Copia stems de áudio e fontes para o projeto Remotion e regenera a linha do tempo.
# Uso: bash tools/sync_remotion.sh [--clips]   (--clips também refaz os clipes provisórios do animatic)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p remotion/public/audio/vo remotion/public/fonts remotion/public/clips
cp audio/stems/trilha.wav audio/stems/sfx.wav remotion/public/audio/
cp audio/stems/vo/*.wav remotion/public/audio/vo/
cp assets/fonts/* remotion/public/fonts/
if [[ "${1:-}" == "--clips" ]]; then
  python3 tools/render_animatic.py --clips remotion/public/clips
fi
python3 tools/export_remotion.py

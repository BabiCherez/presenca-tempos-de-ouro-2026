# Presença | Tempos de Ouro 2026 — produção do trailer

Pasta de produção do trailer de 120 s (6 atos, 44 planos), criada a partir do *Pacote de Produção* de 15/10/2026.

## Estado atual: **ANIMATIC v1** (não é o vídeo final)

| Arquivo | O que é |
|---|---|
| `build/TDO_animatic_v1_16x9.mp4` | Animatic 1280×720, 24 fps, 120 s. Mostra os 44 planos esquemáticos com duração, enquadramento, movimento de câmera, luz, look de cada época e transições motivadas exatas, além de narração provisória, trilha-guia e efeitos-guia. |
| `build/keyframes/TDO_<plano>_board.jpg` | Um board por plano, para revisão quadro a quadro. |
| `audio/narracao_provisoria.wav`, `audio/vo/*.wav` | Voz sintética pt-BR (guia), uma fala por arquivo. |
| `audio/trilha_guia.wav` | Estrutura musical sintetizada a 80 BPM, com seções, intensidades e pontos de sincronia da p. 18. |
| `audio/sfx_guia.wav` | Os 26 efeitos sincronizados da p. 19–20, em versão guia. |
| `audio/mix_animatic.wav` | Mix com ducking da música sob a voz, a –14,7 LUFS. |
| `docs/prompts_por_plano.md` / `.csv` | Os 41 prompts de IA, com âncoras já substituídas, sufixo de estilo e negative. |

Definições:

- **Prévia**: qualquer quadro isolado ou teste.
- **Animatic**: os boards e o áudio-guia, montados no tempo exato do roteiro. É o que existe hoje.
- **Vídeo final**: clipes gerados a partir de frames-chave aprovados, com as artes oficiais aplicadas na pós, cor, narração gravada, trilha licenciada, mix e exportação nas três versões da p. 21.

## Como regenerar

```bash
pip install edge-tts pyloudnorm soundfile scipy numpy pillow
python3 tools/make_vo.py            # narração provisória
python3 tools/make_audio.py         # trilha-guia, efeitos e mix
python3 tools/render_animatic.py --stills   # um board por plano
python3 tools/render_animatic.py            # vídeo 16:9 (use --vertical para 9:16)
ffmpeg -i build/animatic_v1_16x9_video.mp4 -i audio/mix_animatic.wav -c:v copy -c:a aac -b:a 256k -shortest build/TDO_animatic_v1_16x9.mp4
python3 tools/build_prompts.py      # prompts por plano
```

`tools/shots.py` é a fonte única de tempos, ações, narração, cartelas e efeitos.

## Projeto Remotion (montagem editável)

A pasta `remotion/` traz o projeto de montagem e finalização. Ele tem a linha do tempo dos 44 planos, a cor de cada época, as transições, as cartelas, a assinatura em estilo final e uma faixa de áudio para cada fala. As versões 16:9, 9:16 e animatic saem da mesma fonte. Veja `remotion/README.md`.

Para atualizar depois de mudar `tools/shots.py` ou o áudio, rode `bash tools/sync_remotion.sh` (adicione `--clips` para refazer os clipes provisórios).

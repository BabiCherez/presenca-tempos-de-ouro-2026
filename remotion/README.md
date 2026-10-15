# Projeto Remotion — Presença | Tempos de Ouro 2026

Este é o projeto editável de montagem e finalização do trailer: 120 s, 24 fps, 2.880 quadros.

## Composições

| ID | Formato | Uso |
|---|---|---|
| `Trailer-16x9` | 1920×1080 | Versão final horizontal. Com `--scale=2`, sai o master 4K. |
| `Trailer-9x16` | 1080×1920 | Versão vertical para Instagram, WhatsApp e Stories. |
| `Animatic-16x9` | 1920×1080 | Igual à horizontal, com HUD de plano, tempo, ação e narração, para revisão. |
| `Cenas/Assinatura`, `Assinatura-9x16`, `Cartela` | — | Cenas abertas na própria linha do tempo (composições conectadas). |

## Estrutura

- `src/Trailer.tsx` — linha do tempo. É **gerado** por `tools/export_remotion.py` a partir de `tools/shots.py`.
  - 44 planos, cada um num `TransitionSeries.Sequence` próprio, editáveis no Studio.
  - 6 transições motivadas (`LightOverlay`).
  - Trilha, efeitos e uma faixa de áudio por fala de narração.
- `src/Shot.tsx` — um plano: o clipe com a cor da época. Atos 1 e 2 (até o flare do 3.3) usam o look passado; o restante usa o look presente. Inclui grão e vinheta. No 9:16, os planos 1.2, 3.7, 3.8 e 5.1 viram pan lento.
- `src/TitleCard.tsx` — cartelas do Ato 5, com revelação em linha de 12 quadros.
- `src/Signature.tsx` — assinatura do 6.1: moldura Art Déco desenhada, leques, partículas e textos.
- `src/LightOverlay.tsx`:
  - flare 3.3→3.4;
  - estouros 3.6→3.7 e 5.4→5.5;
  - flash 4.2→4.3;
  - leque 2.7→2.8;
  - fade-in com flicker 1.1→1.2.
- `src/Hud.tsx` — camada do animatic. Nunca entra na versão final.

## Material provisório × final

| Hoje (provisório) | Substituir por |
|---|---|
| `public/clips/TDO_<plano>.mp4`: boards animados do animatic | Clipe gerado e aprovado (`TDO_<plano>_v<n>.mp4`). Basta trocar a prop `clip` do plano. |
| `public/audio/vo/*.wav`: voz sintética pt-BR | Tomadas gravadas ou geradas com licença comercial, uma por fala. |
| `public/audio/trilha.wav` e `sfx.wav`: guias sintetizados | Trilha encomendada ou licenciada e efeitos de biblioteca licenciada. |
| Marca tipográfica “PRESENÇA” | Logotipo oficial: coloque o arquivo em `public/` e passe o caminho na prop `logo`. |

As artes oficiais com tracking (convite, cronograma, copo e as demais) entram como camada por cima de cada plano, depois de chegarem os arquivos do designer.

## Comandos

```bash
npm i
bash ../tools/sync_remotion.sh     # copia áudio e fontes e regenera Trailer.tsx
npm run dev                        # Remotion Studio
npx remotion render Trailer-16x9 out/TDO_web_16x9.mp4 --crf=18                        # web 1080p (comprimir para 20 Mbps se preciso)
npx remotion render Trailer-16x9 out/TDO_master_4k.mov --scale=2 --codec=prores --prores-profile=hq   # master 4K ProRes 422 HQ
npx remotion render Trailer-9x16 out/TDO_vertical_9x16.mp4 --crf=18                   # vertical 1080×1920
```

Depois do render, normalize o áudio em –14 LUFS / –1 dBTP. Exemplo:

```bash
ffmpeg -i out/TDO_web_16x9.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy -c:a aac -b:a 320k out/TDO_web_16x9_final.mp4
```

## Licença

O Remotion é gratuito apenas para pessoas físicas e empresas com até 3 funcionários. O uso pelo Grupo Presença pode exigir uma Company License: https://www.remotion.pro/license

# Spoiler 01 — "Alguém bateu à sua porta"

Chamada de 30 s, horizontal (1920×1080, 24 fps), para intranet e TVs. Primeira peça da campanha **Presença: Tempos de Ouro** (festa em 05/12/2026, 19h, Espaço Wood).

## Ideia
Um quarto de hotel no escuro. Três batidas na porta. Pelo olho mágico, o corredor está vazio. Um envelope desliza por baixo da porta: **"Convite"**. O vídeo termina antes de qualquer revelação: **EM BREVE · 29.10**.

**Pista escondida:** o quarto é o **512**, ou seja, 05/12.

| Tempo | Plano | Som |
|---|---|---|
| 0–3 s | Breu; a fresta sob a porta acende | Relógio, jazz abafado |
| 3–9 s | Corredor Art Déco até a porta 512 | *"Tem coisas… que não chegam por e-mail."* |
| 9–11 s | Dentro do quarto: três batidas | Música para; toc, toc, toc |
| 11–17 s | **Olho mágico (olho de peixe):** o mensageiro bate com o punho na lente, se aproxima para espiar, ergue o **Convite** diante da lente e se abaixa | Batidas, respiração, papel, tecido |
| 17–21 s | Rente ao chão: o envelope desliza por baixo da porta; a sombra vai embora | Papel no assoalho, passos |
| 21–25,5 s | Convite Gatsby em foil dourado, com lacre de cera | *"Elas batem à porta."* |
| 25,5–30 s | EM BREVE · 29.10 | Impacto; a música "abre"; *"Em breve."* |

**Convite (v2):** azul-marinho com foil dourado metálico. Tem moldura em degraus, raios de sol, cartucho central, faixas com losangos, leques nos cantos, "Nº 0512" (outra pista da data), "Convite" em cursiva, "PESSOAL E INTRANSFERÍVEL" e lacre de cera dourado em relevo. O código está em `src/invite.ts`.

**Mensageiro:** uniforme azul-marinho com botões e dragonas douradas, quepe e luvas brancas. O rosto fica sempre na sombra. O código está em `src/Bellhop.tsx`.

## Itens provisórios
- **Data da cartela (29.10)**: confirmar. Para mudar, edite `END_DATE` em `src/theme.ts`.
- **Narração**: voz sintética pt-BR (Microsoft Edge TTS), só para aprovação. Para a versão final, gravar ou usar uma voz com licença comercial.

## Música
"Chicago" — Moulin Rouge Orchestra (1922), gravação 78 rpm do Great 78 Project / Internet Archive: https://archive.org/details/78_chicago_moulin-rouge-orchestra-fred-fisher_gbia0039641b
- A gravação é de 1922 e está em domínio público.
- O compositor, Fred Fisher, morreu em 1942. A obra está em domínio público no Brasil (70 anos após a morte do autor).

## Como usar
```bash
npm i
npm run dev                                     # Remotion Studio
python3 tools/make_vo.py && python3 tools/make_audio.py && cp audio/stems/*.wav public/audio/   # refaz o áudio
npx remotion render Spoiler01 out/spoiler01.mp4 --gl=swangle
ffmpeg -i out/spoiler01.mp4 -af loudnorm=I=-14:TP=-1 -c:v copy -c:a aac -b:a 320k out/Spoiler01_final.mp4
```

## Estrutura
- `src/Hotel.tsx`: cenário 3D procedural (corredor, porta 512, quarto, envelope). Não usa imagens externas.
- `src/textures.ts`: texturas desenhadas em código (mármore xadrez, papel de parede de leques, envelope).
- `src/Shots.tsx`: os 6 planos, com câmera e luz animadas quadro a quadro.
- `src/Overlays.tsx`: grão de filme, vinheta e cartela final.
- `src/theme.ts`: paleta, fontes e textos editáveis (número do quarto, "Convite", "EM BREVE", data).

O Remotion é gratuito apenas para pessoas físicas e empresas com até 3 funcionários. Para uso empresarial, veja https://www.remotion.pro/license

# Spoiler 01 — v3 (12–15 s): cenas com aparência de filmagem por IA e montagem no Remotion

Status: **proposta, aguardando aprovação.** Nenhuma cena foi gerada.

## Divisão de trabalho
| Camada | Quem produz | Onde |
|---|---|---|
| Planos com pessoa e cenário real (corredor, mensageiro, convite sob a porta) | Gerador de vídeo por IA, a partir de imagem inicial (image-to-video) | **Fora deste ambiente** (ver "Limitações") |
| Imagens de referência (ficha do mensageiro, corredor, convite neutro) | Gerador de imagem | Fora deste ambiente, ou via Figma AI, se você autorizar o uso dos créditos do Figma |
| Arte do convite, número 512, cartela SAVE THE DATE, logo oficial, cor, grão, lente olho mágico, música, efeitos, montagem | Remotion | Aqui |

**Regra para os textos:** a IA nunca escreve texto. O convite é gerado **sem texto** (cartão azul-marinho com borda dourada lisa), e "Convite", "512" e a cartela entram na montagem a partir das artes oficiais.

## Linha do tempo proposta: 14,5 s a 24 fps (348 quadros)
| # | Tempo | Duração | Plano | Origem |
|---|---|---|---|---|
| 1 | 0,0–2,5 s | 2,5 s | Corredor Art Déco simétrico; câmera avança devagar até a porta 512 | IA (gerar 5 s, usar 2,5 s) + número "512" aplicado na montagem |
| 2 | 2,5–6,5 s | 4,0 s | Olho mágico: o mensageiro bate duas vezes com o punho de luva branca e ergue o convite diante da lente | IA (gerar 5 s), com a lente olho de peixe aplicada no Remotion |
| 3 | 6,5–9,0 s | 2,5 s | Dentro do quarto, câmera baixa: o convite desliza por baixo da porta e para no feixe de luz | IA (gerar 5 s) |
| 4 | 9,0–11,0 s | 2,0 s | Detalhe do convite: "Convite" em foil dourado, lacre | Remotion: arte oficial sobre papel real (ver nota) |
| 5 | 11,0–14,5 s | 3,5 s | SAVE THE DATE · 05.12.2026, com logo oficial | Remotion (logo vetorial extraído do `.ai`) |

Tempo de leitura: a cartela tem 3 palavras, uma data e o logo. Com 3,5 s, ela fica 2,5 s parada e totalmente visível, depois de 1 s de entrada.

Nota sobre o plano 4: sai do Remotion porque é o único lugar onde o texto aparece grande. Para combinar com os planos gerados, o fundo é o último quadro do plano 3 (o mesmo piso e a mesma luz), com a arte aplicada em perspectiva.

## Continuidade entre planos
1. **Ficha do mensageiro:** uma imagem gerada uma vez, com o mesmo homem, uniforme e luvas, de frente, de perfil e de costas. Ela é a referência de personagem em todos os planos.
2. **Imagem inicial de cada plano:** cada vídeo parte de uma imagem aprovada (image-to-video), nunca só de texto.
3. **Descrição fixa:** os trechos abaixo são copiados palavra por palavra em todos os prompts.
4. **Mesma luz e paleta:** luz âmbar de arandelas, sombras azul-marinho, piso xadrez, porta laqueada escura com batente dourado.
5. **O convite** é sempre o mesmo objeto liso; a arte entra na montagem.
6. **Cor final** é igualada no Remotion com a mesma correção para todos os planos.

### Descrições fixas (em inglês: os geradores respondem melhor)
- **BELLHOP:** `a 1920s grand hotel bellhop, man in his 30s, slim, navy-blue wool double-breasted bellhop jacket with two rows of polished brass buttons, gold braid trim on cuffs and collar, high stand-up collar, white cotton gloves, navy pillbox cap with a gold band`
- **CORRIDOR:** `symmetrical Art Deco hotel corridor, black-and-white checkered marble floor, navy wallpaper with fine gold fan motifs, dark wood wainscoting with a thin gold rail, warm amber shell-shaped brass wall sconces, dark lacquered door at the end with a gold frame and a brass room-number plate`
- **CARD:** `a thick navy-blue card with a thin metallic gold border and a gold wax seal, blank, no text`
- **STYLE:** `shot on 35mm film, cinematic, shallow depth of field, soft film grain, warm amber practical lighting, deep navy shadows, natural motion, photorealistic, 16:9`
- **NEGATIVE:** `text, letters, words, numbers, logo, watermark, extra fingers, deformed hands, warped face, morphing, flicker, cartoon, CGI look, plastic skin`

## Prompts por plano

**Referência A — Ficha do mensageiro (imagem):** `Character reference sheet on a neutral dark grey background, the same man shown full body front, three-quarter and back views, plus a close-up of the gloved hands making a fist and holding a card. [BELLHOP]. [STYLE]`

**Referência B — Corredor (imagem, também início do plano 1):** `[CORRIDOR], centered one-point perspective, camera at eye level in the middle of the corridor, no people. [STYLE]`

**Plano 1 (vídeo, a partir da Ref. B):** `Slow steady dolly forward along the corridor toward the dark door at the end; one sconce flickers once. No people. [STYLE]`

**Plano 2 — imagem inicial:** `View from inside a hotel room through the door peephole: in the corridor, [BELLHOP] stands very close to the door; his face is out of frame above, only his chest, arm and white-gloved fist are visible. [CORRIDOR] blurred behind him. [STYLE]`
**Plano 2 — vídeo:** `The bellhop knocks twice on the door with his gloved knuckles, toward the camera, with natural wrist motion; then he raises [CARD] with one gloved hand and holds it still in front of the peephole. The face stays out of frame. Locked-off camera. [STYLE]`

**Plano 3 — imagem inicial:** `Low angle from inside a dark hotel room near the floor, looking at the bottom of a closed dark lacquered door; a thin line of warm light under the door; dark wooden floorboards. [STYLE]`
**Plano 3 — vídeo:** `[CARD] slides in under the door gap, pushed by white-gloved fingertips that withdraw, and comes to rest on the floor inside a warm beam of light from the gap. Locked-off camera. [STYLE]`

Para cada plano, gerar 2 a 4 variações e escolher pela checklist abaixo.

## Checklist de aprovação de cada plano gerado
- [ ] Mão com 5 dedos, sem deformar durante o movimento.
- [ ] Uniforme e luva iguais aos da ficha.
- [ ] Nenhum texto ou letra inventada pela IA (o que aparecer é apagado ou coberto).
- [ ] Movimento contínuo, sem "morphing" entre poses.
- [ ] Luz e paleta coerentes com os outros planos.

## Limitações reais (16/10/2026)
- **Neste ambiente não consigo gerar vídeo.** O Higgsfield CLI está instalado, mas o login não foi concluído e a conta tem 10 créditos, o que não cobre um vídeo. Comprar créditos não está autorizado.
- **Imagem:** a ferramenta de imagem do Figma está disponível aqui, mas gasta créditos de IA do plano Figma da conta, por isso preciso da sua autorização. Ela não gera vídeo.
- **Etapa externa:** você ou alguém da equipe gera os planos 1–3 num gerador de vídeo com image-to-video e me envia os arquivos MP4. As cotas gratuitas de Kling, Hailuo/MiniMax, Higgsfield e outros mudam com frequência e precisam ser conferidas na hora. Cada plano precisa de algumas tentativas.
- Mesmo com boas referências, a IA pode mudar detalhes do uniforme entre os planos. A ficha e a imagem inicial reduzem, mas não eliminam, essa variação.

# Spoiler 01 v3 — Pacote de produção externa (imagens e clipes por IA)

Linha do tempo aprovada: 14,5 s a 24 fps. Os planos 1–3 são gerados fora, o plano 4 (detalhe do convite) é integrado depois de chegar o plano 3, e o plano 5 (SAVE THE DATE) já está pronto no Remotion.

## Regras para todas as gerações
- **Proporção 16:9.** Use a maior resolução disponível (1080p ou mais) e a taxa de quadros nativa da ferramenta. A conversão para 24 fps é feita aqui.
- **A IA não escreve nada.** Sem letras, números, logo ou marca d'água. O "512", a palavra "Convite" e a arte do convite entram na montagem.
- **Sem lente olho de peixe, sem vinheta circular e sem desfoque de movimento exagerado.** A lente é aplicada aqui.
- **Câmera travada** (*locked-off*) nos planos 2 e 3. No plano 1, só um avanço lento e reto.
- **Exportação limpa:** sem música, sem legenda, sem upscale com nitidez artificial. Envie o MP4 original.
- **Nomes dos arquivos:** `P1_v1.mp4`, `P1_v2.mp4`, `P2_v1.mp4`… e `RefA.png`, `RefB.png`…

---

## 1. Imagens de referência (geração de imagem)

### Ref A — Ficha do mensageiro (referência de personagem para todos os planos)
```
Photorealistic character reference sheet on a plain dark charcoal studio background, soft even key light. The same man shown three times side by side: full body front view, full body three-quarter view, full body back view; plus, on the right, two close-ups of his hands: one gloved hand closed in a relaxed fist, one gloved hand holding a blank navy card by its top edge. The man is a 1920s grand hotel bellhop in his early 30s, slim and upright, clean-shaven, short dark hair under the cap. Uniform: tailored navy-blue wool double-breasted bellhop jacket, waist length, two vertical rows of four polished brass buttons, high stand-up collar edged with thin gold braid, gold braid bands on both cuffs, matching navy trousers with a thin gold side stripe, black polished shoes, navy pillbox cap with a gold band worn slightly tilted, white cotton gloves with three stitched lines on the back of the hand. Natural fabric folds and drape, realistic hands with five fingers, accurate anatomy. Shot on 35mm film, natural skin texture, no text, no logo, no watermark.
```

### Ref B — Corredor (imagem inicial do plano 1)
```
Photorealistic wide shot of a symmetrical Art Deco grand hotel corridor at night, one-point perspective, camera at eye level (1.6 m) in the center of the corridor. Black and white checkered marble floor with a soft sheen, walls covered in deep navy wallpaper with a fine gold fan pattern, dark walnut wainscoting with a thin brass rail, warm amber brass shell-shaped wall sconces evenly spaced on both sides, dark ceiling with a thin gold cornice. At the far end, a single dark lacquered wooden door with a slim gold frame, a small blank brass number plate and a brass peephole. Warm amber practical light, deep navy shadows, light haze, elegant and mysterious, Great Gatsby era luxury. Shot on 35mm film, 28mm lens, shallow depth of field, fine film grain. No people, no text, no numbers, no logo.
```

### Ref C — Visão pelo olho mágico (imagem inicial do plano 2), sem distorção
```
Photorealistic view from inside a hotel room looking straight out into the Art Deco corridor, as if from the door peephole, but with a normal rectilinear lens (no fisheye, no circular vignette): camera at 1.55 m height, perpendicular to the door, locked off. In the corridor, about 50 cm from the camera, stands the bellhop: navy-blue wool double-breasted jacket with two rows of polished brass buttons, gold braid on collar and cuffs, white cotton gloves. His chest, shoulders and right arm fill the lower two-thirds of the frame; his head and face are above the top edge of the frame and not visible. His right white-gloved hand is raised in a loose fist at chest height, ready to knock. Behind him: black and white checkered marble floor, navy wallpaper with gold fan pattern, warm amber brass wall sconces, soft depth of field. Warm overhead amber light from the corridor ceiling just in front of him, deep navy shadows. Shot on 35mm film, 24mm lens, fine grain. No text, no numbers, no logo.
```

### Ref D — Interior do quarto rente ao chão (imagem inicial do plano 3)
```
Photorealistic low-angle shot from inside a dark elegant hotel room, camera 12 cm above the floor, 1.2 m from a closed door, locked off. The bottom part of a dark lacquered wooden door with a slim gold frame fills the upper half of the frame. A visible gap of about 1.5 cm under the door glows with warm amber light from the corridor and casts a thin beam across the floor. Floor: dark polished wooden floorboards with visible grain. Nothing on the floor yet. Deep navy shadows, warm amber light, quiet and mysterious. Shot on 35mm film, 35mm lens, shallow depth of field, fine grain. No text, no logo.
```

### Ref E — Objeto: o convite (referência do objeto, sem texto)
```
Photorealistic product reference of a single luxury invitation card on a dark navy velvet surface, top view and a 45-degree view side by side. The card is 15 x 21 cm, thick cotton paper 0.8 mm, deep navy blue with a matte finish, a thin metallic gold foil border inset 8 mm from the edge, gilded gold edges, and a small flat gold wax seal near the bottom center, low relief, no more than 3 mm thick. The card face is completely blank: no text, no letters, no logo, no pattern. Soft warm light showing the paper texture and the foil sheen. Shot on 35mm film.
```

---

## 2. Prompts de image-to-video

### Plano 1 — Corredor (usar Ref B como imagem inicial)
**Necessário:** 2,5 s. **Gerar:** 5 s, para ter margem de 2,5 s e descartar o início e o fim, que costumam deformar.
```
Slow, perfectly steady dolly forward along the center of the Art Deco hotel corridor toward the dark door at the far end, constant speed, no shake, no rotation. One brass wall sconce flickers briefly once. Light haze drifts slowly in the amber light. No people appear. Keep the architecture, wallpaper pattern and checkered floor stable and undistorted. Photorealistic, shot on 35mm film, fine grain.
```
**Evitar:** `people, text, numbers, warping walls, melting pattern, camera shake, fisheye, cartoon, CGI look`

### Plano 2 — Mensageiro pelo olho mágico (usar Ref C como imagem inicial; Ref A e Ref E como referências de personagem e objeto, se a ferramenta aceitar)
**Necessário:** 4,0 s. **Gerar:** pelo menos 5 s; se a ferramenta permitir, 6–8 s.
```
Locked-off camera. The bellhop in the navy double-breasted uniform with brass buttons and white cotton gloves knocks twice on the door with the knuckles of his right gloved fist, moving toward the camera: a natural wrist motion, a small pull back between knocks, the second knock slightly softer. Then he lowers the right hand and, with his left gloved hand, raises a blank navy invitation card with a thin gold border and holds it flat and steady facing the camera at about 40 cm, the thumb on the front of the card and the fingers behind it. His face stays above the top edge of the frame the whole time. The jacket fabric moves naturally with his arms; gloves have realistic fingers. Warm amber corridor light, deep navy shadows. Photorealistic, natural continuous motion, shot on 35mm film, rectilinear lens, no fisheye.
```
**Evitar:** `face visible, extra fingers, fused fingers, deformed hands, morphing hands, text on card, letters, logo, card bending, card changing shape, fisheye, circular vignette, jittery motion`

### Plano 3 — Convite passando sob a porta (usar Ref D como imagem inicial; Ref E como referência do objeto)
**Necessário:** 2,5 s. **Gerar:** 5 s.
```
Locked-off low camera near the floor. A blank navy invitation card with a thin gold border and a small flat gold seal slides in through the 1.5 cm gap under the closed door, pushed by white-gloved fingertips that appear only briefly at the gap and withdraw. The card stays flat and rigid, slides smoothly across the dark wooden floor, slows down naturally and comes to rest inside the warm beam of light from the gap, casting a soft contact shadow. The door stays closed. Photorealistic, realistic physics, shot on 35mm film, fine grain.
```
**Evitar:** `text, letters, logo on the card, card bending, card passing through the door, seal thicker than the gap, door opening, warped floor, flicker`

**Física:** a fresta tem cerca de 1,5 cm. O cartão (0,8 mm) somado ao lacre plano (até 3 mm) tem no máximo cerca de 4 mm, então passa com folga. Reprove qualquer geração em que o lacre pareça mais alto que a fresta ou em que o cartão atravesse a madeira.

---

## 3. Que referência usar em cada geração

| Geração | Imagem inicial | Referências extras (se a ferramenta aceitar) |
|---|---|---|
| Ref C | — (gerada a partir do texto) | Ref A (personagem), Ref B (corredor) |
| Ref D | — | Ref B (mesma porta e paleta) |
| Plano 1 | **Ref B** | — |
| Plano 2 | **Ref C** | Ref A, Ref E |
| Plano 3 | **Ref D** | Ref E (convite), Ref A (luva) |

**Ordem de produção:**
1. Ref A, Ref B e Ref E.
2. Aprovar as três.
3. Ref C e Ref D, gerando com essas referências.
4. Aprovar as duas.
5. Gerar os vídeos.

## 4. Duração necessária e margem

| Plano | Usado na montagem | Gerar | Margem |
|---|---|---|---|
| 1 Corredor | 2,5 s | 5 s | 2,5 s |
| 2 Olho mágico | 4,0 s | 5 s (ideal 6–8 s) | 1–4 s |
| 3 Sob a porta | 2,5 s | 5 s | 2,5 s |

Gere de 2 a 4 variações por plano.

## 5. Critérios para escolher uma geração

**Reprovação imediata:**
- mão com dedos a mais, faltando, fundidos ou dobrando para o lado errado;
- rosto aparecendo no plano 2;
- texto, letras, números ou logo inventados pela IA;
- *morphing*: objeto, luva ou uniforme mudando de forma entre quadros;
- o convite dobrando, mudando de tamanho, atravessando a porta, ou o lacre maior que a fresta;
- tremor de câmera nos planos travados, ou parede e piso "derretendo".

**Para escolher entre as aprovadas:**
1. A batida tem peso (aceleração, contato e recuo) e não é um deslize contínuo.
2. O tecido da manga e da luva dobra e acompanha o braço.
3. A luz vem de uma fonte coerente e as sombras ficam no lugar.
4. Uniforme, luva, porta e piso batem com a Ref A e a Ref B.
5. O convite fica parado, plano e bem iluminado por pelo menos 1,5 s (necessário para aplicar a arte).
6. Na reprodução normal e a 50%, não há salto, pausa ou "congelamento".

## 6. Notas técnicas

**Perspectiva do plano 2.** Gerar com lente retilínea grande-angular (24–28 mm equivalente), câmera a 1,55 m, perpendicular à porta, travada, com o mensageiro a 40–60 cm. Sem olho de peixe e sem vinheta: a distorção é aplicada uma única vez no Remotion. Como a lente amplia o centro e corta as bordas no círculo, a ação precisa acontecer no quadrado central do quadro.

**Arte oficial no convite em movimento:**
1. **Rastreamento:** os 4 cantos do cartão liso são rastreados quadro a quadro (rastreamento planar por pontos e homografia, com correção manual onde precisar).
2. **Projeção:** a arte oficial é deformada em perspectiva para esses 4 cantos em cada quadro.
3. **Luz do clipe:** a sombra e o reflexo do cartão original são reaplicados sobre a arte (multiplicar a luminância e somar os brilhos), para a arte herdar a luz da cena.
4. **Oclusão:** é recortada uma máscara dos dedos e do polegar sobre o cartão (luva branca contra o cartão azul-marinho, separação por cor), e eles voltam por cima da arte. A borda inferior da porta mascara o cartão enquanto ele passa pela fresta.
5. **Movimento e textura:** desfoque de movimento proporcional à velocidade dos cantos, e grão igual ao do clipe.

**Limitações:**
- O rastreamento só é confiável com o cartão plano, nítido e com os 4 cantos visíveis (ou deduzíveis).
- Se o cartão dobrar, girar de lado ou ficar muito borrado, a arte aparece só nos trechos estáveis. Por isso o critério 5 exige 1,5 s de cartão parado.
- Esse trabalho é feito aqui (OpenCV e ffmpeg) depois que os clipes chegarem.

**Textos e logo.** O "512" da placa no plano 1 é rastreado do mesmo jeito. A cartela final usa o logotipo extraído do arquivo oficial `IDENTIDADE_VISUAL.ai`.

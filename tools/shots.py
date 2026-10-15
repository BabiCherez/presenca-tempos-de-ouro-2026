"""Fonte única do roteiro técnico — transcrito do Pacote de Produção (PDF, 15/10/2026).

Tempos em segundos. `move` descreve o movimento de câmera para o animatic:
  static | push | pull | tilt_down | crane_down | crane_up | track_l | track_r |
  orbit | pan | zoom | handheld | drone_down
`exit` é a transição de saída do plano (Transições motivadas, p. 21).
"""

ACTS = {
    1: ("O convite", 0.0, 24.0, "past"),
    2: ("Os preparativos", 24.0, 44.0, "past"),
    3: ("A chegada", 44.0, 68.0, "present"),
    4: ("Experiências que valem ouro", 68.0, 96.0, "present"),
    5: ("A grande surpresa", 96.0, 112.0, "present"),
    6: ("Assinatura", 112.0, 120.0, "present"),
}

# (id, ini, fim, enquadramento/lente, ação (pt-BR), câmera, ref, saída, move, luz)
SHOTS = [
    ("1.1", 0.0, 3.0, "Tela preta", "Som de projetor; a luz do projetor pisca três vezes", "Fixa", "—", "fade_flicker", "static", "black"),
    ("1.2", 3.0, 9.0, "Grande plano geral, 24 mm", "Cidade Art Déco ao entardecer, bondes, letreiros acendendo", "Drone desce entre prédios até a altura da rua", "—", "cut", "drone_down", "dusk"),
    ("1.3", 9.0, 12.0, "Plano geral baixo, 35 mm", "Pedestres de fedora e vestidos de franja; carro preto cruza o primeiro plano", "Fixa, altura de 60 cm", "—", "wipe_car", "static", "dusk"),
    ("1.4", 12.0, 15.0, "Plano médio, 35 mm", "P2 caminha, tira o envelope da bolsa", "Tracking lateral no ritmo dele", "ENV", "cut", "track_r", "dusk"),
    ("1.5", 15.0, 17.0, "Macro, 100 mm", "Envelope nas mãos de P2; foco vai do selo de cera para a inscrição", "Slider lento + rack focus", "ENV", "cut", "track_l", "dusk"),
    ("1.6", 17.0, 19.0, "Plano médio, 50 mm", "P2 toca a campainha; a porta abre e P1 (look 1) recebe o envelope", "Fixa, leve push-in", "ENV", "cut", "push", "interior"),
    ("1.7", 19.0, 21.0, "Detalhe, 85 mm", "Na penteadeira, P1 rompe o lacre; a cera estala", "Top shot descendo", "ENV", "cut", "crane_down", "interior"),
    ("1.8", 21.0, 24.0, "Over-shoulder para detalhe, 50 mm", "P1 retira o convite; a câmera fecha no texto; no espelho, ela sorri", "Dolly-in + rack focus para o reflexo", "CONV", "cut_beat", "push", "interior"),
    ("2.1", 24.0, 25.5, "Detalhe, 50 mm", "Mãos de P1 tiram o vestido preto e dourado do cabide", "Tilt para baixo", "—", "cut_beat", "tilt_down", "vanity"),
    ("2.2", 25.5, 27.0, "Close, 85 mm", "Colar de pérolas fechado na nuca de P1", "Fixa", "—", "cut_beat", "static", "vanity"),
    ("2.3", 27.0, 28.5, "Close pelo espelho, 85 mm", "P1 passa batom vermelho", "Fixa", "—", "cut_beat", "static", "vanity"),
    ("2.4", 28.5, 30.0, "Detalhe, 100 mm", "P4 fecha a abotoadura dourada", "Push-in curto", "—", "cut_beat", "push", "vanity"),
    ("2.5", 30.0, 31.5, "Macro, 100 mm", "Relógio de bolso dourado se fecha com clique", "Fixa", "—", "cut_click", "static", "vanity"),
    ("2.6", 31.5, 33.0, "Chão, 35 mm", "Sapatos de salto caminham no mármore preto e branco", "Tracking rente ao chão", "—", "cut", "track_r", "vanity"),
    ("2.7", 33.0, 37.0, "Plano médio para close, 50 mm", "P1 (look 2) ergue o leque com o verso champagne, gira e revela a frente com o logo; abana na direção da lente", "Órbita de 45° em volta dela", "LEQ", "wipe_fan", "orbit", "vanity"),
    ("2.8", 37.0, 41.0, "Macro, 100 mm", "Mão enluvada gira o cronograma; a janela para em “19h às 20h”", "Slider lateral + rack focus", "CRON", "cut", "track_l", "vanity"),
    ("2.9", 41.0, 44.0, "Plano geral pela janela, 35 mm", "P1 guarda o convite na clutch; lá fora, P3 segura a porta de um carro clássico preto", "Dolly-out através da janela", "—", "cut", "pull", "night_past"),
    ("3.1", 44.0, 47.0, "Plano médio, 35 mm", "P1 entra no carro; P3 fecha a porta", "Fixa, câmera na altura da maçaneta", "—", "cut_door", "static", "night"),
    ("3.2", 47.0, 51.0, "Plano conjunto, 35 mm", "Carro percorre avenida com postes dourados; luzes passam no rosto de P1 pela janela", "Travelling lateral paralelo ao carro", "—", "cut", "track_r", "night"),
    ("3.3", 51.0, 53.0, "Plano geral, 24 mm", "Carro faz a curva; o farol aponta para a lente", "Fixa", "—", "flare_white", "static", "night"),
    ("3.4", 53.0, 57.0, "Plano geral, 24 mm", "Carro estaciona no tapete vermelho do Espaço Wood; recepcionista abre a porta e P1 desce", "Grua descendo até a altura dos olhos", "LOC-A", "cut", "crane_down", "facade"),
    ("3.5", 57.0, 59.0, "Plano médio, 35 mm", "P1 passa entre os postes dourados; saxofonista toca, recepcionistas acenam", "Steadicam recuando à frente dela", "LOC-A", "cut", "pull", "facade"),
    ("3.6", 59.0, 62.0, "Costas de P1, 35 mm", "Portas de vidro se abrem e a luz dourada a envolve", "Push-in seguindo-a", "LOC-A", "light_burst", "push", "facade"),
    ("3.7", 62.0, 65.0, "Grande plano geral, 24 mm", "Salão principal: lustres de cristal, pista com gobos, telão, convidados", "Grua subindo e avançando", "LOC-D", "cut", "crane_up", "ballroom"),
    ("3.8", 65.0, 68.0, "Plano geral alto, 24 mm", "Os dois pavimentos, mesas com plumas brancas, convidados no mezanino", "Pan lento ao longo do guarda-corpo", "LOC-B · LOC-E · LOC-C", "cut", "pan", "ballroom"),
    ("4.1", 68.0, 71.0, "Plano geral, 35 mm", "P1 caminha no tapete azul até o painel instagramável", "Dolly recuando à frente dela", "INSTA", "cut", "pull", "party"),
    ("4.2", 71.0, 73.0, "Plano médio por trás do fotógrafo, 50 mm", "P1 e P4 posam e riem; o flash dispara", "Fixa", "INSTA", "flash", "static", "party"),
    ("4.3", 73.0, 76.0, "Detalhe, 100 mm", "P7 pousa o copo no balcão de mármore; foco revela o logo", "Slider + rack focus", "COPO", "cut", "track_l", "bar"),
    ("4.4", 76.0, 79.0, "Detalhe, 100 mm", "Mão coloca a miniatura e o charuto de chocolate no copo", "Órbita de 90°", "KIT", "cut", "orbit", "bar"),
    ("4.5", 79.0, 82.0, "Plano médio para detalhe, 50 mm", "P7 agita a coqueteleira, gelo cai em câmera lenta; tilt até o menu", "Tilt para baixo + push-in", "MENU", "cut", "tilt_down", "bar"),
    ("4.6", 82.0, 84.0, "Plano médio, 50 mm", "P7 entrega uma taça coupe a P1, que agradece com o olhar", "Fixa", "LOC-C", "cut", "static", "bar"),
    ("4.7", 84.0, 86.0, "Plano geral para detalhe, 85 mm", "Luzes baixam; spot no palco; P5 abre um envelope dourado", "Zoom lento", "LOC-D", "cut", "zoom", "stage"),
    ("4.8", 86.0, 89.0, "Macro, 100 mm", "Troféu revelado, reflexos âmbar no aço, bobinas giram levemente", "Órbita de 60°", "TROF", "cut", "orbit", "stage"),
    ("4.9", 89.0, 92.0, "Plano médio, 50 mm", "P5 entrega o troféu a um homenageado de costas; plateia aplaude, confete dourado", "Fixa, contraluz", "TROF", "cut", "static", "stage"),
    ("4.10", 92.0, 94.0, "Plano médio, 50 mm", "P5 vira o voucher para a plateia", "Push-in", "VOUCH", "cut", "push", "stage"),
    ("4.11", 94.0, 96.0, "Close, 85 mm", "Convidada (não P1) leva as mãos à boca; amigos a abraçam", "Câmera na mão, sutil", "—", "cut_silence", "handheld", "stage"),
    ("5.1", 96.0, 98.0, "Grande plano geral, 24 mm", "Salão cheio; as luzes apagam de trás para frente", "Fixa", "LOC-D", "cut", "static", "blackout"),
    ("5.2", 98.0, 100.0, "Plano geral, 35 mm", "Batida grave; spot acende a cortina de veludo; silhuetas se movem atrás", "Fixa", "—", "cut", "static", "spot"),
    ("5.3", 100.0, 104.0, "Detalhes, 50 mm", "Microfone vintage em primeiro plano; guitarra, bateria em contraluz, saxofone refletindo o spot", "Travelling lateral lento", "—", "cut", "track_r", "spot"),
    ("5.4", 104.0, 106.0, "Detalhe, 85 mm", "Contagem; a fresta da cortina começa a abrir", "Push-in na fresta", "—", "light_burst", "push", "spot"),
    ("5.5", 106.0, 107.5, "Plano geral em contraluz, 24 mm", "Silhueta do vocalista com microfone, banda ao fundo, plateia (com P1) pula", "Fixa, flare", "LOC-E", "cut_black", "static", "explosion"),
    ("5.6", 107.5, 112.0, "Cartelas em preto", "Três frases (tipografia animada)", "Tipografia animada", "—", "cut", "static", "cards"),
    ("6.1", 112.0, 119.0, "Composição gráfica centralizada", "Moldura Art Déco se desenha em linhas douradas; partículas; PRESENÇA / TEMPOS DE OURO / 2026; 11 DE DEZEMBRO · 19H / ESPAÇO WOOD — SÃO PAULO", "—", "Logo original", "fade", "static", "signature"),
    ("6.2", 119.0, 120.0, "Preto", "Projetor desacelera e para", "—", "—", "end", "static", "black"),
]

# Narração (Narração, p. 16–17). Texto para TTS com pausas convertidas em pontuação.
VO = [
    ("vo01", 4.0, 8.0, "Há momentos / que passam pelo TEMPO... //", "Há momentos... que passam pelo tempo...", "narrador"),
    ("vo02", 9.5, 12.0, "E há momentos / que se tornam ETERNOS.", "E há momentos... que se tornam eternos.", "narrador"),
    ("vo03", 20.5, 24.0, "Este ano, / a história nos reserva / um convite ESPECIAL.", "Este ano, a história nos reserva, um convite especial.", "narrador"),
    ("vo04", 36.5, 41.0, "Cada detalhe foi pensado / para transformar uma noite / em uma experiência INESQUECÍVEL.", "Cada detalhe foi pensado, para transformar uma noite, em uma experiência inesquecível.", "narrador"),
    ("vo05", 61.0, 63.5, "Uma noite em que o PASSADO / encontra o PRESENTE... //", "Uma noite em que o passado... encontra o presente...", "narrador"),
    ("vo06", 64.5, 67.0, "E cada conquista / merece ser CELEBRADA.", "E cada conquista, merece ser celebrada.", "narrador"),
    ("vo07", 87.0, 91.0, "Porque grandes histórias / são construídas / por pessoas EXTRAORDINÁRIAS.", "Porque grandes histórias, são construídas, por pessoas extraordinárias.", "narrador"),
    ("vo08", 104.0, 106.0, "Três... / dois... / um...", "Três... dois... um...", "apresentador"),
    # PROPOSTA (inconsistência #1): no PDF, 09a = 01:53–01:55 e 09b = 01:55,5–01:59 (3,5 s para 14 palavras,
    # ~240 ppm, contra os 120 ppm pedidos). Animatic usa 09a 01:52,3 e 09b 01:54,8, com a palavra
    # "VIVIDAS" pousando no preto do 6.2, junto do projetor parando.
    ("vo09a", 112.3, 114.6, "Presença. / Tempos de Ouro.", "Presença... Tempos de Ouro.", "narrador"),
    ("vo09b", 114.8, 120.0, "Algumas noites não foram feitas para serem contadas. / Foram feitas para serem VIVIDAS.", "Algumas noites não foram feitas para serem contadas. Foram feitas para serem vividas.", "narrador"),
]

CARDS = [
    (107.5, 109.1, "E QUANDO VOCÊ ACHAR QUE A NOITE NÃO PODE FICAR MELHOR…"),
    (109.1, 110.5, "O MELHOR AINDA ESTARÁ POR VIR."),
    (110.5, 112.0, "UMA ATRAÇÃO SURPRESA ESPERA POR VOCÊ."),
]

# Efeitos sonoros sincronizados (p. 19–20)
SFX = [
    (0.0, 3.0, "projector_on"), (3.0, 12.0, "city_1920"), (10.0, 11.5, "car_pass"),
    (12.0, 15.0, "footsteps"), (18.0, 18.6, "bell"), (20.0, 20.2, "wax_crack"),
    (22.0, 22.6, "paper_slide"), (31.0, 31.1, "watch_click"), (35.0, 35.8, "fan_whoosh"),
    (38.0, 40.0, "ratchet4"), (46.0, 46.3, "car_door"), (47.0, 53.0, "engine_wet"),
    (51.0, 53.0, "riser"), (60.0, 62.0, "party_murmur"), (71.0, 73.0, "shutter_flash"),
    (74.0, 74.2, "glass_marble"), (77.0, 77.2, "clink"), (79.0, 81.0, "shaker_ice"),
    (85.0, 85.6, "envelope"), (89.0, 92.0, "applause"), (94.0, 95.5, "surprise_laugh"),
    (96.0, 98.0, "murmur_out"), (98.0, 98.4, "spot_click_boom"), (104.0, 106.0, "velvet"),
    (106.0, 107.5, "crowd_explode"), (119.0, 120.0, "projector_stop"),
]

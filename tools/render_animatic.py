"""Animatic v1 — valida ritmo, enquadramento, movimento e som antes da geração de vídeo.

Cada plano é um quadro esquemático (silhuetas + objetos-guia + luz do ato) que executa o
movimento de câmera do roteiro na duração exata, com as transições motivadas da p. 21 e o
look passado/presente. As cartelas (5.6) e a assinatura (6.1) já saem em estilo final,
com o logotipo em PLACEHOLDER até chegar o arquivo vetorial oficial.

Uso: python3 tools/render_animatic.py [--vertical] [--from S] [--to S]
"""
import argparse, math, subprocess, sys
from functools import lru_cache
from multiprocessing import Pool
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

sys.path.insert(0, str(Path(__file__).parent))
from shots import SHOTS, ACTS, CARDS, VO

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "assets" / "fonts"
FPS = 24
NAVY, GOLD, CHAMP, BLACK, AMBER = (11, 26, 79), (201, 161, 59), (241, 233, 214), (10, 10, 12), (232, 163, 61)
CREAM = (236, 224, 196)

ap = argparse.ArgumentParser()
ap.add_argument("--vertical", action="store_true")
ap.add_argument("--from", dest="t_from", type=float, default=0.0)
ap.add_argument("--to", dest="t_to", type=float, default=120.0)
ap.add_argument("--stills", action="store_true", help="exporta um quadro-chave por plano (contact sheet)")
ap.add_argument("--hud", type=int, default=1)
ap.add_argument("--clips", type=str, default="", help="exporta um clipe provisório por plano (sem HUD, sem cor, sem transição) nesta pasta")
ARGS = ap.parse_args() if __name__ == "__main__" else ap.parse_args([])

W, H = (720, 1280) if ARGS.vertical else (1280, 720)
SW, SH = 1280, 720            # a cena é sempre composta em 16:9 (como os clipes gerados)
SC = 1.35                     # margem de cena para movimentos
BW, BH = int(SW * SC), int(SH * SC)


@lru_cache(None)
def font(name, size):
    return ImageFont.truetype(str(FONTS / name), size)


def ease(u):
    return u * u * (3 - 2 * u)


def lerp(a, b, u):
    return a + (b - a) * u


def mix(c1, c2, u):
    return tuple(int(lerp(a, b, u)) for a, b in zip(c1, c2))


# --------------------------------------------------------------------------- composição por plano
# Elementos: (tipo, x, y_base, escala, rótulo, profundidade). Coordenadas normalizadas na cena larga.
# profundidade: 0 = fundo (move junto com a câmera), 1 = primeiro plano (parallax máximo).
F, O = "fig", "obj"
COMP = {
    "1.2": [("city", 0, 0, 1, "", 0)],
    "1.3": [("street", 0, 0, 1, "", 0), (F, .3, .78, .30, "pedestre", .3), (F, .62, .78, .28, "pedestre", .3), ("car", .5, .95, 1.4, "carro preto", 1)],
    "1.4": [("street", 0, 0, 1, "", 0), (F, .5, 1.0, .75, "P2 · carteiro", .7), (O, .6, .62, .12, "ENV", 1)],
    "1.5": [(O, .5, .80, .62, "ENV", .5)],
    "1.6": [("door", 0, 0, 1, "", 0), (F, .32, 1.0, .82, "P2", .6), (F, .68, 1.0, .82, "P1 · look 1 (robe)", .6), (O, .5, .66, .1, "ENV", .9)],
    "1.7": [("vanity", 0, 0, 1, "", 0), (O, .5, .78, .5, "ENV", .6)],
    "1.8": [("vanity", 0, 0, 1, "", 0), (F, .22, 1.15, 1.3, "P1 (costas)", .9), (O, .55, .80, .42, "CONV", .5), ("mirror", .78, .2, .3, "reflexo P1", 0)],
    "2.1": [(O, .5, .95, .8, "vestido preto/dourado", .5)],
    "2.2": [(F, .5, 1.2, 1.25, "P1 (nuca)", .5), (O, .5, .62, .2, "pérolas", .7)],
    "2.3": [("mirror", .5, .1, .85, "P1 · batom", 0)],
    "2.4": [(O, .5, .78, .5, "abotoadura · P4", .5)],
    "2.5": [(O, .5, .78, .5, "relógio de bolso", .5)],
    "2.6": [("floor", 0, 0, 1, "", 0), (O, .45, .9, .35, "sapatos", .8)],
    "2.7": [("vanity", 0, 0, 1, "", 0), (F, .5, 1.05, .95, "P1 · look 2", .5), (O, .62, .55, .32, "LEQ", .9)],
    "2.8": [(O, .5, .82, .6, "CRON", .5)],
    "2.9": [("window", 0, 0, 1, "", 0), (F, .3, .92, .5, "P1", .8), ("car", .7, .82, .6, "carro clássico", .2), (F, .58, .82, .32, "P3", .2)],
    "3.1": [("night", 0, 0, 1, "", 0), ("car", .5, 1.0, 1.3, "", .3), (F, .38, 1.0, .75, "P1", .6), (F, .7, 1.0, .75, "P3", .6)],
    "3.2": [("night", 0, 0, 1, "", 0), ("car", .5, .9, 1.25, "carro + P1 na janela", .8)],
    "3.3": [("night", 0, 0, 1, "", 0), ("car", .5, .8, .7, "", .5), ("headlights", .5, .62, 1, "", .5)],
    "3.4": [("facade", 0, 0, 1, "LOC-A", 0), ("car", .42, .9, .55, "", .5), (F, .62, .9, .3, "P1", .5)],
    "3.5": [("facade", 0, 0, 1, "LOC-A", 0), (F, .5, 1.0, .7, "P1", .8), (F, .15, .9, .4, "sax", .4), (F, .82, .9, .4, "recepc.", .4)],
    "3.6": [("doors", 0, 0, 1, "", 0), (F, .5, 1.05, .8, "P1 (costas)", .8)],
    "3.7": [("hall", 0, 0, 1, "LOC-D", 0)],
    "3.8": [("mezz", 0, 0, 1, "LOC-B · E · C", 0)],
    "4.1": [("insta", 0, 0, 1, "INSTA", 0), (F, .5, .98, .6, "P1", .7)],
    "4.2": [("insta", 0, 0, 1, "INSTA", 0), (F, .42, .9, .55, "P1", .3), (F, .58, .9, .58, "P4", .3), (F, .12, 1.2, 1.2, "fotógrafo", 1)],
    "4.3": [("bar", 0, 0, 1, "", 0), (O, .5, .82, .5, "COPO", .5)],
    "4.4": [("bar", 0, 0, 1, "", 0), (O, .5, .82, .55, "KIT", .5)],
    "4.5": [("bar", 0, 0, 1, "", 0), (F, .5, .55, .7, "P7 · coqueteleira", .3), (O, .5, 1.25, .5, "MENU", .6)],
    "4.6": [("bar", 0, 0, 1, "", 0), (F, .32, 1.0, .8, "P7", .5), (F, .68, 1.0, .8, "P1", .5), (O, .5, .66, .1, "coupe", .8)],
    "4.7": [("stage", 0, 0, 1, "LOC-D", 0), (F, .5, .78, .35, "P5", .3)],
    "4.8": [("stage_dark", 0, 0, 1, "", 0), (O, .5, .82, .6, "TROF", .5)],
    "4.9": [("stage", 0, 0, 1, "", 0), (F, .38, .95, .6, "P5", .4), (F, .62, .98, .62, "homenageado (costas)", .6), ("confetti", 0, 0, 1, "", 1)],
    "4.10": [("stage", 0, 0, 1, "", 0), (F, .3, .95, .62, "P5", .4), (O, .62, .78, .42, "VOUCH", .5)],
    "4.11": [("stage", 0, 0, 1, "", 0), (F, .5, 1.2, 1.2, "convidada (não P1)", .5), (F, .14, 1.2, 1.0, "amiga", .8)],
    "5.1": [("hall", 0, 0, 1, "LOC-D", 0)],
    "5.2": [("curtain", 0, 0, 1, "", 0)],
    "5.3": [("curtain", 0, 0, 1, "", 0), (O, .3, .9, .55, "microfone", 1), (O, .6, .75, .3, "guitarra", .4), (O, .82, .72, .28, "bateria", .3)],
    "5.4": [("curtain_seam", 0, 0, 1, "", 0)],
    "5.5": [("burst", 0, 0, 1, "", 0), (F, .2, 1.15, .45, "", .9), (F, .45, 1.2, .5, "plateia (com P1)", .9), (F, .8, 1.15, .45, "", .9), (F, .5, .78, .5, "vocalista (silhueta)", .3), (F, .28, .75, .38, "", .2), (F, .72, .75, .38, "", .2),
            ("crowd", 0, 0, 1, "plateia (com P1)", 1)],
}

LIGHT = {  # (topo, base, cor da fonte principal)
    "black": (BLACK, BLACK, AMBER), "dusk": ((32, 46, 96), (196, 120, 60), AMBER),
    "interior": ((24, 16, 12), (70, 44, 24), AMBER), "vanity": ((18, 12, 10), (60, 38, 22), AMBER),
    "night_past": ((10, 16, 40), (30, 26, 30), AMBER), "night": ((6, 10, 30), (22, 18, 20), GOLD),
    "facade": ((8, 8, 14), (40, 26, 16), AMBER), "ballroom": ((8, 8, 16), (34, 24, 14), AMBER),
    "party": ((10, 12, 30), (30, 22, 14), AMBER), "bar": ((8, 8, 10), (26, 20, 14), GOLD),
    "stage": ((6, 6, 12), (24, 18, 10), GOLD), "blackout": ((8, 8, 16), (34, 24, 14), AMBER),
    "spot": (BLACK, BLACK, GOLD), "explosion": ((40, 30, 10), (10, 8, 6), (255, 230, 170)),
    "cards": (BLACK, BLACK, GOLD), "signature": (BLACK, BLACK, GOLD),
}


def vgrad(w, h, top, bot, power=1.0):
    y = np.linspace(0, 1, h)[:, None] ** power
    a = np.array(top)[None, None, :] * (1 - y[..., None]) + np.array(bot)[None, None, :] * y[..., None]
    return np.broadcast_to(a, (h, w, 3)).astype(np.float32)


def radial(w, h, cx, cy, r, color, strength=1.0):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = np.sqrt(((xx - cx * w) / (r * w)) ** 2 + ((yy - cy * h) / (r * w)) ** 2)
    m = np.clip(1 - d, 0, 1) ** 2 * strength
    return m[..., None] * np.array(color, np.float32)[None, None, :]


# ----------------------------------------------------------------- desenhos-guia (silhuetas e objetos)
def draw_fig(d, x, yb, s, color, edge, label, hair=False):
    """Silhueta humana estilizada; s = altura relativa ao quadro."""
    h = s * BH; cx = x * BW; base = yb * BH
    head = h * 0.13
    top = base - h
    d.ellipse([cx - head * .8, top, cx + head * .8, top + head * 2], fill=color, outline=edge, width=3)
    sh = h * 0.24
    d.polygon([(cx - sh, top + head * 2.6), (cx + sh, top + head * 2.6), (cx + sh * .8, base), (cx - sh * .8, base)],
              fill=color, outline=edge, width=3)
    d.rounded_rectangle([cx - sh * .5, top + head * 2.0, cx + sh * .5, top + head * 2.8], 6, fill=color)
    if label:
        f = font("JosefinSans-400.woff", 22)
        d.text((cx, top - 12), label, font=f, fill=CHAMP, anchor="md")


def draw_obj(d, img, x, yb, s, code):
    cx, by = x * BW, yb * BH; size = s * BH
    cy = by - size / 2
    f = font("JosefinSans-600.woff", max(16, int(size * 0.09)))
    small = font("JosefinSans-400.woff", 22)
    if code == "ENV":
        w2, h2 = size * .8, size * .5
        d.rectangle([cx - w2, cy - h2, cx + w2, cy + h2], fill=NAVY, outline=GOLD, width=4)
        d.line([cx - w2, cy - h2, cx, cy + h2 * .2, cx + w2, cy - h2], fill=GOLD, width=2)
        r = size * .14; d.ellipse([cx - r, cy - r * .3, cx + r, cy + r * 1.7], fill=(176, 132, 40), outline=(120, 86, 20), width=3)
        d.text((cx, cy + r * .7), "P", font=font("PoiretOne.woff", int(r * 1.4)), fill=(90, 60, 10), anchor="mm")
        for k in range(3):
            d.rectangle([cx + w2 - (k + 1) * size * .17, cy - h2 + 8, cx + w2 - k * size * .17 - 8, cy - h2 + size * .18], outline=CREAM, width=2)
    elif code == "CONV":
        w2, h2 = size * .45, size * .65
        d.rectangle([cx - w2, cy - h2, cx + w2, cy + h2], fill=NAVY, outline=CREAM, width=6)
        for k in range(5):
            a0 = 200 + k * 28
            d.pieslice([cx - w2 * .7, cy - h2 * .95, cx + w2 * .7, cy - h2 * .1], a0, a0 + 24, outline=GOLD, width=2)
        d.text((cx, cy + h2 * .2), "CONV\n[arte original na pós]", font=small, fill=GOLD, anchor="mm", align="center")
        return
    elif code == "LEQ":
        r = size * .55
        d.pieslice([cx - r, cy - r * .6, cx + r, cy + r * 1.4], 200, 340, fill=NAVY, outline=GOLD, width=4)
        for k in range(9):
            a = math.radians(200 + k * 17.5)
            d.ellipse([cx + r * math.cos(a) - 12, cy + r * .4 + r * math.sin(a) - 12, cx + r * math.cos(a) + 12, cy + r * .4 + r * math.sin(a) + 12], fill=CREAM)
        d.line([cx, cy + r * .4, cx, cy + r * 1.1], fill=GOLD, width=10)
        for dx in (-14, 14):
            d.line([cx + dx, cy + r * 1.1, cx + dx * 1.4, cy + r * 1.5], fill=GOLD, width=5)
        d.text((cx, cy - r * .1), "LEQ · rígido", font=small, fill=GOLD, anchor="mm")
        return
    elif code == "CRON":
        r = size * .48
        for k in range(36):
            a = math.radians(k * 10)
            d.ellipse([cx + r * 1.03 * math.cos(a) - r * .1, cy + r * 1.03 * math.sin(a) - r * .1, cx + r * 1.03 * math.cos(a) + r * .1, cy + r * 1.03 * math.sin(a) + r * .1], fill=CREAM)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=NAVY, outline=GOLD, width=4)
        d.pieslice([cx - r * .85, cy - r * .85, cx + r * .85, cy + r * .85], 240, 300, fill=CREAM)
        d.text((cx, cy - r * .55), "19h às 20h", font=font("JosefinSans-600.woff", int(r * .1)), fill=NAVY, anchor="mm")
        d.text((cx, cy + r * .2), "CRON", font=f, fill=GOLD, anchor="mm")
        return
    elif code in ("COPO", "coupe"):
        w2, h2 = size * .32, size * .5
        d.polygon([(cx - w2, cy - h2), (cx + w2, cy - h2), (cx + w2 * .8, cy + h2), (cx - w2 * .8, cy + h2)], outline=CHAMP, width=3)
        d.line([cx - w2, cy - h2, cx + w2, cy - h2], fill=GOLD, width=6)
        d.text((cx, cy), "logo\njateado", font=small, fill=CHAMP, anchor="mm", align="center")
    elif code == "KIT":
        draw_obj(d, img, x - .07, yb, s * .9, "COPO")
        d.rounded_rectangle([cx + size * .1, cy - size * .55, cx + size * .25, cy + size * .2], 8, outline=AMBER, width=3)
        d.line([cx - size * .05, cy - size * .6, cx + size * .25, cy - size * .1], fill=GOLD, width=int(size * .06))
        d.text((cx + size * .35, cy - size * .6), "miniatura + charuto\nde chocolate (anel logo)", font=small, fill=CHAMP)
        return
    elif code == "MENU":
        d.rectangle([cx - size * .35, cy - size * .5, cx + size * .35, cy + size * .5], fill=NAVY, outline=GOLD, width=5)
        d.text((cx, cy), "MENU\n[arte original]", font=small, fill=GOLD, anchor="mm", align="center")
        return
    elif code == "TROF":
        for ox in (-.22, .22):
            r = size * .2; d.ellipse([cx + ox * size - r, cy - size * .45 - r, cx + ox * size + r, cy - size * .45 + r], outline=(200, 205, 212), width=6)
        d.rectangle([cx - size * .35, cy - size * .25, cx + size * .35, cy + size * .2], fill=(150, 155, 162), outline=(220, 224, 230), width=3)
        d.rectangle([cx - size * .45, cy + size * .2, cx + size * .45, cy + size * .45], fill=(92, 58, 34))
        d.rectangle([cx - size * .2, cy + size * .26, cx + size * .2, cy + size * .4], fill=BLACK)
        d.text((cx, cy - size * .02), "aço escovado", font=small, fill=BLACK, anchor="mm")
        d.text((cx, cy + size * .33), "NOME SOBRENOME", font=font("JosefinSans-400.woff", 14), fill=CHAMP, anchor="mm")
        return
    elif code == "VOUCH":
        w2, h2 = size * .9, size * .45
        d.rectangle([cx - w2, cy - h2, cx + w2, cy + h2], fill=NAVY, outline=GOLD, width=5)
        d.rectangle([cx - w2, cy - h2 * .25, cx + w2, cy + h2 * .25], fill=GOLD)
        for sx in (-1, 1):
            d.rectangle([cx + sx * w2 * .82 - w2 * .12, cy - h2, cx + sx * w2 * .82 + w2 * .12, cy + h2], fill=CREAM)
        d.text((cx, cy), "VOUCHER · NOME DO GANHADOR", font=small, fill=NAVY, anchor="mm")
        return
    else:  # objeto genérico de macro
        r = size * .38
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(30, 22, 14), outline=GOLD, width=3)
        d.text((cx, cy), code, font=small, fill=CHAMP, anchor="mm")
        return
    d.text((cx, cy + size * .62), code, font=f, fill=GOLD, anchor="mm")


def draw_set(img, d, kind, label, key, t, x=0.0, yb=0.0, sc=1.0):
    """Cenários-guia simplificados (arquitetura / luz)."""
    if kind == "city":
        for k in range(14):
            x0 = k * BW / 13 - 40; hh = BH * (0.45 + 0.4 * abs(math.sin(k * 1.7)))
            d.rectangle([x0, BH - hh, x0 + BW / 15, BH], fill=(14, 14, 22), outline=(60, 50, 40))
            d.polygon([(x0, BH - hh), (x0 + BW / 30, BH - hh - 60), (x0 + BW / 15, BH - hh)], fill=(14, 14, 22))
            for j in range(int(hh / 50)):
                if (k * 7 + j * 3) % 5 < 2:
                    d.rectangle([x0 + 20, BH - hh + 30 + j * 50, x0 + 36, BH - hh + 50 + j * 50], fill=AMBER)
        d.text((BW * .5, BH * .93), "bondes · letreiros acendendo", font=font("JosefinSans-400.woff", 24), fill=CHAMP, anchor="mm")
    elif kind in ("street", "night"):
        d.rectangle([0, BH * .78, BW, BH], fill=(20, 18, 18))
        for k in range(8):
            x0 = BW * (k / 7)
            d.line([x0, BH * .78, x0, BH * .35], fill=(40, 34, 28), width=6)
            d.ellipse([x0 - 14, BH * .33, x0 + 14, BH * .37], fill=GOLD if kind == "night" else AMBER)
    elif kind == "door":
        d.rectangle([BW * .33, BH * .08, BW * .67, BH], fill=(40, 24, 14), outline=GOLD, width=3)
        d.rectangle([BW * .38, BH * .12, BW * .62, BH], fill=(150, 100, 50))
    elif kind == "vanity":
        d.rectangle([0, BH * .72, BW, BH], fill=(48, 28, 16))
        d.ellipse([BW * .6, BH * .05, BW * .95, BH * .7], outline=GOLD, width=5)
        d.ellipse([BW * .1, BH * .45, BW * .2, BH * .6], fill=AMBER)
    elif kind == "mirror":
        mx, my, ms = x * BW, yb * BH, sc * BH
        d.ellipse([mx - ms * .45, my, mx + ms * .45, my + ms], fill=(40, 28, 20), outline=GOLD, width=6)
        hx, hy = mx, my + ms * .45
        d.ellipse([hx - ms * .16, hy - ms * .22, hx + ms * .16, hy + ms * .2], fill=(70, 50, 36), outline=(176, 140, 70), width=3)
        d.ellipse([hx - ms * .05, hy + ms * .08, hx + ms * .05, hy + ms * .12], fill=(150, 20, 30))
        d.text((mx, my + ms * .9), label, font=font("JosefinSans-400.woff", 22), fill=CHAMP, anchor="mm")
    elif kind == "floor":
        sq = 90
        for i in range(-2, BW // sq + 3):
            for j in range(0, 8):
                if (i + j) % 2 == 0:
                    y0 = BH * .55 + j * j * 6
                    d.polygon([(i * sq - j * 20, y0), (i * sq + sq - j * 20, y0), (i * sq + sq - j * 26, y0 + 12 + j * 9), (i * sq - j * 26, y0 + 12 + j * 9)], fill=(205, 200, 190))
    elif kind == "window":
        d.rectangle([BW * .05, BH * .05, BW * .95, BH * .95], outline=(70, 50, 30), width=40)
        d.line([BW * .5, BH * .05, BW * .5, BH * .95], fill=(70, 50, 30), width=20)
    elif kind == "facade":
        d.rectangle([0, 0, BW, BH * .8], fill=(70, 62, 52))
        for k in range(12):
            d.line([0, k * BH * .07, BW, k * BH * .07], fill=(85, 76, 64), width=2)
        d.rectangle([BW * .35, BH * .3, BW * .65, BH * .8], fill=(30, 22, 14), outline=GOLD, width=3)
        d.text((BW * .5, BH * .22), "Espaço Wood  [foto LOC-A]", font=font("JosefinSans-600.woff", 34), fill=CHAMP, anchor="mm")
        d.polygon([(BW * .44, BH * .8), (BW * .56, BH * .8), (BW * .75, BH), (BW * .25, BH)], fill=(140, 20, 24))
        for sx in (.36, .42, .58, .64):
            d.line([BW * sx, BH * .82, BW * sx, BH * .92], fill=GOLD, width=6)
    elif kind == "doors":
        for sx in (.2, .5):
            d.rectangle([BW * sx, BH * .1, BW * (sx + .3), BH], outline=(180, 170, 150), width=4)
    elif kind in ("hall", "stage"):
        d.rectangle([BW * .3, BH * .25, BW * .7, BH * .55], fill=(20, 20, 30), outline=(90, 80, 60), width=4)
        d.text((BW * .5, BH * .4), "telão “Espaço Wood”", font=font("JosefinSans-400.woff", 28), fill=CHAMP, anchor="mm")
        for k in range(5):
            cx = BW * (.12 + k * .19)
            for j in range(3):
                r = 50 - j * 14
                d.ellipse([cx - r, BH * .08 + j * 20, cx + r, BH * .1 + j * 20 + 12], outline=CHAMP, width=2)
        for k in range(26):
            x = (k * 97) % BW; y = BH * (.7 + .25 * ((k * 37) % 10) / 10)
            draw_fig(d, x / BW, y / BH, .14, (8, 8, 10), (60, 50, 30), "")
    elif kind == "stage_dark":
        pass
    elif kind == "mezz":
        d.rectangle([0, BH * .45, BW, BH * .5], fill=(90, 100, 108))
        for k in range(7):
            d.rectangle([k * BW / 6 - 15, 0, k * BW / 6 + 15, BH], fill=(132, 126, 118))
        for k in range(9):
            x = BW * (k + .5) / 9
            d.ellipse([x - 60, BH * .7, x + 60, BH * .78], fill=(14, 14, 14))
            d.ellipse([x - 16, BH * .58, x + 16, BH * .7], fill=(240, 240, 235))
    elif kind == "insta":
        d.rectangle([BW * .22, BH * .05, BW * .78, BH * .78], fill=NAVY, outline=GOLD, width=6)
        for k in range(4):
            cx = BW * (.3 + k * .133)
            d.pieslice([cx - 70, BH * .12, cx + 70, BH * .4], 180, 360, fill=None, outline=GOLD, width=4)
        d.text((BW * .5, BH * .55), "Espaço instagramável\n[mockup INSTA + arte na pós]", font=font("JosefinSans-400.woff", 26), fill=GOLD, anchor="mm", align="center")
        d.polygon([(BW * .45, BH * .78), (BW * .55, BH * .78), (BW * .7, BH), (BW * .3, BH)], fill=NAVY, outline=GOLD)
    elif kind == "bar":
        d.rectangle([0, BH * .72, BW, BH], fill=(16, 16, 18))
        d.line([0, BH * .72, BW, BH * .72], fill=(120, 110, 100), width=3)
    elif kind in ("curtain", "curtain_seam"):
        n = 18 if kind == "curtain" else 6
        for k in range(n):
            x0 = BW * k / n
            d.rectangle([x0, 0, x0 + BW / n, BH], fill=(26 + 10 * (k % 2), 8, 12))
        if kind == "curtain_seam":
            gap = 6 + 120 * ease(min(1, max(0, t)))
            d.rectangle([BW / 2 - gap, 0, BW / 2 + gap, BH], fill=(255, 220, 150))
    elif kind == "car":
        pass
    elif kind == "headlights":
        pass


def car(d, x, yb, s, label):
    w2 = s * BW * .32; h = s * BH * .32; cx = x * BW; by = yb * BH
    d.rounded_rectangle([cx - w2, by - h * .55, cx + w2, by], 20, fill=(6, 6, 8), outline=(110, 100, 80), width=3)
    d.rounded_rectangle([cx - w2 * .5, by - h, cx + w2 * .35, by - h * .5], 14, fill=(6, 6, 8), outline=(110, 100, 80), width=3)
    for wx in (-.65, .65):
        r = h * .22
        d.ellipse([cx + wx * w2 - r, by - r, cx + wx * w2 + r, by + r], fill=(20, 20, 20), outline=(140, 130, 110), width=3)
    if label:
        d.text((cx, by - h - 16), label, font=font("JosefinSans-400.woff", 22), fill=CHAMP, anchor="md")


@lru_cache(maxsize=64)
def base_scene(sid):
    """Cena estática do plano em resolução de cena larga (BW×BH)."""
    s = SHOT_BY_ID[sid]
    key = s[9]
    top, bot, src = LIGHT[key]
    a = vgrad(BW, BH, top, bot, 1.3)
    if key in ("vanity", "interior", "facade", "bar"):
        a += radial(BW, BH, .2, .45, .6, AMBER, .35)
    if key == "dusk":
        a += radial(BW, BH, .5, .95, .9, AMBER, .5)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    for kind, x, yb, sc, label, depth in COMP.get(sid, []):
        if kind not in (F, O, "car"):
            draw_set(img, d, kind, label, key, 0, x, yb, sc)
    return img


SHOT_BY_ID = {s[0]: s for s in SHOTS}


def camera(move, u, t):
    """Retorna (zoom, dx, dy, rot) da câmera: deslocamento em fração da cena larga."""
    e = ease(u)
    z, dx, dy = 1.0, 0.0, 0.0
    if move == "push": z = lerp(1.0, 1.14, e)
    elif move == "pull": z = lerp(1.14, 1.0, e)
    elif move == "zoom": z = lerp(1.0, 1.28, u)
    elif move == "tilt_down": dy = lerp(-.09, .09, e)
    elif move == "crane_down": dy = lerp(-.12, 0.0, e); z = lerp(1.0, 1.05, e)
    elif move == "crane_up": dy = lerp(.1, -.06, e); z = lerp(1.0, 1.1, e)
    elif move == "drone_down": dy = lerp(-.12, .1, e); z = lerp(1.0, 1.12, e)
    elif move == "track_r": dx = lerp(-.1, .1, u)
    elif move == "track_l": dx = lerp(.1, -.1, u)
    elif move == "pan": dx = lerp(-.11, .11, e)
    elif move == "orbit": dx = lerp(-.12, .12, e); z = lerp(1.0, 1.06, e)
    elif move == "handheld":
        dx = .006 * math.sin(t * 7.1) + .004 * math.sin(t * 13.3); dy = .005 * math.sin(t * 5.3 + 1)
    return z, dx, dy


def render_scene(sid, u, t):
    s = SHOT_BY_ID[sid]; move = s[8]; key = s[9]
    z, dx, dy = camera(move, u, t)
    img = base_scene(sid).copy()
    d = ImageDraw.Draw(img)
    # elementos com parallax: primeiro plano se desloca mais que o fundo
    for kind, x, yb, sc, label, depth in COMP.get(sid, []):
        if kind not in (F, O, "car"):
            continue
        px = x - dx * depth * 0.9 + (lerp(-.08, .08, ease(u)) * depth if move == "orbit" else 0)
        if sid == "1.3" and kind == "car":  # carro cruza o primeiro plano (wipe)
            px = lerp(-0.6, 1.6, u ** 1.4)
        if sid in ("3.2",) and kind == "car":
            px = x
        if kind == F:
            draw_fig(d, px, yb, sc, (16, 13, 12), (176, 140, 70), label)
        elif kind == O:
            sc2 = sc * (1 + (0.25 * ease(u) if sid == "2.7" else 0))
            draw_obj(d, img, px, yb, sc2, label)
        else:
            car(d, px, yb, sc, label)
    # recorte de câmera
    cw, ch = BW / SC / z, BH / SC / z
    cx, cy = BW / 2 + dx * BW, BH / 2 + dy * BH
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    frame = img.transform((SW, SH), Image.EXTENT, box, Image.BILINEAR)
    return frame


# ------------------------------------------------------------------- luz animada por plano
def light_fx(frame, sid, u, t):
    s = SHOT_BY_ID[sid]; key = s[9]
    a = np.asarray(frame).astype(np.float32)
    if sid == "1.1":
        flick = [(0.6, 0.75), (1.2, 1.32), (1.9, 2.1)]
        on = any(a0 <= t - s[1] <= a1 for a0, a1 in flick)
        a = a * 0 + (radial(SW, SH, .5, .5, .5, (255, 236, 200), 0.35) if on else 0)
        a += np.random.default_rng(int(t * 24)).uniform(0, 14, (SH, SW, 1)) * on
    if key in ("ballroom", "party", "stage") or sid in ("3.7", "3.8"):  # moving heads âmbar
        yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)
        for k in range(4):
            ang = math.sin(t * .9 + k * 1.7) * .5
            ox = SW * (.15 + k * .23)
            dist = np.abs((xx - ox) * math.cos(ang) - (yy) * math.sin(ang))
            beam = np.clip(1 - dist / (40 + yy * .08), 0, 1) * (yy / SH) * .35
            a += beam[..., None] * np.array(AMBER, np.float32)
    if key == "night" and sid == "3.2":  # luzes dos postes passando no rosto/janela
        ph = (t * 1.6) % 1
        a += radial(SW, SH, 1.2 - ph * 1.4, .45, .25, GOLD, .9)
    if sid == "3.3":
        k = ease(max(0, (u - .45) / .55))
        a += radial(SW, SH, .5, .55, .2 + k * 1.6, (255, 230, 170), .6 + 3 * k)
    if sid == "3.6":
        k = max(0, (u - .4) / .6)
        a += radial(SW, SH, .5, .45, .3 + k, (255, 214, 140), .3 + 2.5 * k * k)
    if key in ("spot",) or sid in ("4.7", "4.8", "4.9", "4.10"):
        a *= 0.6
        a += radial(SW, SH, .5, .5, .45, GOLD, .55)
    if sid == "5.1":  # luzes apagam em ondas de trás para frente
        k = ease(u)
        yy = np.linspace(0, 1, SH)[:, None, None]
        a *= np.clip(1.0 - (k * 1.6 - (1 - yy) * 0.6), 0.04, 1)
    if sid == "5.2":
        on = 1.0 if u > 0.04 else 0.0
        a = a * 0.25 + radial(SW, SH, .5, .4, .55, GOLD, .7 * on)
    if sid == "5.5":
        dark = (np.abs(a - np.array([16, 13, 12], np.float32)).max(-1, keepdims=True) < 2) | (a.mean(-1, keepdims=True) < 4)
        a = a * 0.5 + radial(SW, SH, .5, .35, 1.2, (255, 230, 170), 1.4)
        a = np.where(dark, 8.0, a)
        # silhuetas: tudo que é escuro permanece escuro (contraluz)
    if sid == "4.9":
        rng = np.random.default_rng(int(t * 24))
        for _ in range(160):
            x, y = rng.uniform(0, SW), (rng.uniform(0, SH) + t * 120) % SH
            a[int(y):int(y) + 4, int(x):int(x) + 3] = GOLD
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# ------------------------------------------------------------------------ look / grade
GRAIN = [np.random.default_rng(i).normal(0, 1, (SH // 2, SW // 2)).astype(np.float32) for i in range(12)]


def grade(frame, past, fi):
    a = np.asarray(frame).astype(np.float32) / 255.0
    g = GRAIN[fi % len(GRAIN)].repeat(2, 0).repeat(2, 1)[..., None]
    if past:
        lum = a @ np.array([.299, .587, .114], np.float32)
        lum = lum[..., None]
        a = lum + (a - lum) * 0.8                                  # saturação 80%
        sep = np.array([1.06, 0.98, 0.84], np.float32)
        mid = 4 * lum * (1 - lum)
        a = a * (1 - .35 * mid) + a * sep * .35 * mid              # sépia leve nos médios
        a = 0.06 + a * 0.9                                         # contraste suave
        hi = np.clip(lum - .65, 0, 1)                              # halation
        hal = Image.fromarray((hi[..., 0] * 255).astype(np.uint8)).resize((SW // 8, SH // 8)).filter(ImageFilter.GaussianBlur(6)).resize((SW, SH))
        a += (np.asarray(hal, np.float32) / 255.0)[..., None] * np.array([.5, .18, .06], np.float32)
        a += g * 0.045                                             # grão 35 mm visível
    else:
        a = np.clip((a - .03) * 1.08, 0, 1) ** 1.05                # pretos profundos
        a[..., 2] += (1 - a.mean(-1)) * 0.025                      # azul nas sombras
        a += g * 0.02                                              # grão mais fino
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


# ------------------------------------------------------------------ cartelas e assinatura
def card_frame(t):
    img = Image.new("RGB", (W, H), BLACK); d = ImageDraw.Draw(img)
    vert = W < H
    size = int(46 * (1.3 if vert else 1))
    f = font("JosefinSans-300.woff", size)
    for t0, t1, txt in CARDS:
        if t0 <= t < t1:
            # revelação em linha de 12 quadros (p. 21)
            k = min(1, (t - t0) * FPS / 12)
            maxw = W * (0.78 if vert else 0.7)
            words, lines, cur = txt.split(), [], ""
            for w_ in words:
                if d.textlength(cur + " " + w_, font=f) > maxw and cur:
                    lines.append(cur); cur = w_
                else:
                    cur = (cur + " " + w_).strip()
            lines.append(cur)
            lh = size * 1.45
            cy = H / 2 - (len(lines) - 1) * lh / 2
            if vert:
                cy = max(cy, 250 + size)
            for i, ln in enumerate(lines):
                d.text((W / 2, cy + i * lh), ln, font=f, fill=GOLD, anchor="mm")
            # máscara de revelação: linha dourada que varre da esquerda para a direita
            mask = Image.new("L", (W, H), 0)
            ImageDraw.Draw(mask).rectangle([0, 0, int(W * k), H], fill=255)
            img = Image.composite(img, Image.new("RGB", (W, H), BLACK), mask)
            d = ImageDraw.Draw(img)
            if k < 1:
                x = int(W * k); d.line([x, cy - lh, x, cy + len(lines) * lh - lh * .3], fill=CHAMP, width=2)
    return img


def deco_frame_path(d, x0, y0, x1, y1, prog, col, w=3):
    """Moldura Art Déco desenhada progressivamente (prog 0→1)."""
    segs = []
    c = 40
    pts = [(x0 + c, y0), (x1 - c, y0), (x1, y0 + c), (x1, y1 - c), (x1 - c, y1), (x0 + c, y1), (x0, y1 - c), (x0, y0 + c), (x0 + c, y0)]
    for i in range(len(pts) - 1):
        segs.append((pts[i], pts[i + 1]))
    total = sum(math.dist(a, b) for a, b in segs); acc = 0; lim = total * prog
    for a, b in segs:
        L = math.dist(a, b)
        if acc + L <= lim:
            d.line([a, b], fill=col, width=w)
        elif acc < lim:
            k = (lim - acc) / L; d.line([a, (a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k)], fill=col, width=w)
        acc += L


def signature_frame(t):
    u = (t - 112.0) / 7.0
    img = Image.new("RGB", (W, H), BLACK)
    a = np.asarray(img).astype(np.float32) + radial(W, H, .5, .5, .7, NAVY, 1.2)
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(img)
    vert = W < H
    m = 70 if not vert else 60
    top = m if not vert else 260
    bot = H - m if not vert else H - 420
    p1 = ease(min(1, u / 0.35))
    deco_frame_path(d, m, top, W - m, bot, p1, GOLD, 3)
    deco_frame_path(d, m + 16, top + 16, W - m - 16, bot - 16, ease(min(1, max(0, (u - .1) / .35))), (150, 118, 40), 1)
    # leques nos cantos (motivo do convite)
    for (cx, cy, a0) in [(m + 16, top + 16, 0), (W - m - 16, top + 16, 90), (W - m - 16, bot - 16, 180), (m + 16, bot - 16, 270)]:
        if p1 > .9:
            for k in range(5):
                d.pieslice([cx - 60, cy - 60, cx + 60, cy + 60], a0 + k * 18, a0 + k * 18 + 14, outline=GOLD, width=1)
    s = 1.3 if vert else 1.0
    cy = (top + bot) / 2
    lines = [
        (0.30, "PRESENÇA", "PoiretOne.woff", int(96 * s), GOLD, -1.30),
        (0.38, "TEMPOS DE OURO", "PoiretOne.woff", int(54 * s), CHAMP, -0.15),
        (0.46, "2026", "JosefinSans-300.woff", int(40 * s), GOLD, 0.62),
        (0.58, "11 DE DEZEMBRO · 19H", "JosefinSans-400.woff", int(28 * s), CHAMP, 1.45),
        (0.62, "ESPAÇO WOOD — SÃO PAULO", "JosefinSans-400.woff", int(28 * s), CHAMP, 1.95),
    ]
    unit = 90 * s
    for t0, txt, fn, sz, col, off in lines:
        k = min(1, max(0, (u - t0) * 7.0 / (12 / FPS)))  # revelação em 12 quadros
        if k <= 0:
            continue
        f = font(fn, sz)
        layer = Image.new("RGB", (W, H), BLACK); ld = ImageDraw.Draw(layer)
        ld.text((W / 2, cy + off * unit), txt, font=f, fill=col, anchor="mm")
        tw = ld.textlength(txt, font=f)
        mask = Image.new("L", (W, H), 0)
        ImageDraw.Draw(mask).rectangle([W / 2 - tw / 2 - 4, 0, W / 2 - tw / 2 + (tw + 8) * k, H], fill=255)
        img = ImageChops.lighter(img, Image.composite(layer, Image.new("RGB", (W, H), BLACK), mask))
    d = ImageDraw.Draw(img)
    if u > .3:
        d.text((W / 2, cy - 1.95 * unit), "[logotipo oficial entra aqui — arquivo vetorial pendente]", font=font("JosefinSans-300.woff", 16), fill=(120, 110, 90), anchor="mm")
    # partículas de ouro
    rng = np.random.default_rng(3)
    P = rng.uniform(0, 1, (140, 4))
    for px, py, sp, ph in P:
        y = (py - u * sp * .3) % 1
        al = .5 + .5 * math.sin(t * 3 + ph * 6)
        r = 1 + sp * 2
        d.ellipse([px * W - r, y * H - r, px * W + r, y * H + r], fill=mix(BLACK, GOLD, al))
    # fade lento na saída (01:58,2–01:59)
    if t > 118.2:
        img = Image.blend(img, Image.new("RGB", (W, H), BLACK), min(1, (t - 118.2) / 0.8))
    return img


# -------------------------------------------------------------------------------- HUD
def hud(img, s, t):
    if not ARGS.hud:
        return img
    d = ImageDraw.Draw(img, "RGBA")
    sid, t0, t1, frm, act, cam, ref, ex, mv, key = s
    actn = int(sid.split(".")[0]); aname = ACTS[actn][0]
    small = font("JosefinSans-400.woff", 17); mid = font("JosefinSans-600.woff", 20)
    pad = 14
    d.rectangle([0, 0, W, 34], fill=(0, 0, 0, 150))
    d.text((pad, 17), f"ATO {actn} — {aname.upper()}", font=mid, fill=GOLD, anchor="lm")
    d.text((W - pad, 17), f"PLANO {sid}   {tc(t0)}–{tc(t1)}   ({t1 - t0:.1f} s)".replace(".", ",", 0), font=mid, fill=CHAMP, anchor="rm")
    lines = wrap(d, act, small, W - 2 * pad)
    bh = 30 + 22 * len(lines) + 24
    d.rectangle([0, H - bh, W, H], fill=(0, 0, 0, 160))
    y = H - bh + 10
    d.text((pad, y), f"{frm}  ·  Câmera: {cam}  ·  Ref.: {ref}  ·  Saída: {EXIT_PT.get(ex, ex)}", font=small, fill=GOLD); y += 24
    for ln in lines:
        d.text((pad, y), ln, font=small, fill=CHAMP); y += 22
    d.text((W - pad, H - 12), f"TC {tc(t)}   ANIMATIC v1 — não é o vídeo final", font=font("JosefinSans-300.woff", 15), fill=(200, 200, 200), anchor="rd")
    # narração ativa
    for vid, a0, a1, txt, _tts, who in VO:
        if a0 <= t <= a1 + 0.6:
            vf = font("JosefinSans-400.woff", 22)
            vl = wrap(d, f"VO: “{txt}”", vf, W * 0.8)
            for i, ln in enumerate(vl):
                d.text((W / 2, H - bh - 18 - (len(vl) - 1 - i) * 26), ln, font=vf, fill=(255, 255, 255), anchor="md", stroke_width=2, stroke_fill=(0, 0, 0))
    return img


EXIT_PT = {"cut": "corte", "cut_beat": "corte no beat", "fade_flicker": "fade-in c/ flicker", "wipe_car": "wipe pela lataria",
           "cut_click": "corte no clique", "wipe_fan": "wipe pelo leque", "cut_door": "corte na batida da porta",
           "flare_white": "flare → branco (troca de época)", "light_burst": "estouro de luz", "flash": "flash branco",
           "cut_silence": "corte seco p/ silêncio", "cut_black": "corte para preto", "fade": "fade lento", "end": "fim"}


def wrap(d, txt, f, maxw):
    out, cur = [], ""
    for w_ in txt.split():
        if d.textlength(cur + " " + w_, font=f) > maxw and cur:
            out.append(cur); cur = w_
        else:
            cur = (cur + " " + w_).strip()
    return out + [cur]


def tc(t):
    m, s = divmod(t, 60)
    fr = int(round((s - int(s)) * FPS))
    return f"{int(m):02d}:{int(s):02d}:{fr:02d}"


# ----------------------------------------------------------------------- transições
def transition_overlay(img, s, t):
    """Aplica as transições motivadas nos quadros finais/iniciais."""
    sid, t0, t1, *_ = s; ex = s[7]
    a = np.asarray(img).astype(np.float32)
    fr_left = (t1 - t) * FPS
    fr_in = (t - t0) * FPS
    if ex == "flare_white" and fr_left <= 4:            # 8 quadros de branco com dissolve (4 + 4)
        a = lerp(a, 255.0, 1 - fr_left / 4)
    if ex == "light_burst" and fr_left <= 6:            # exposição sobe em 6 quadros e corta no pico
        a = np.clip(a * (1 + (6 - fr_left) * .9) + (6 - fr_left) * 30, 0, 255)
    if ex == "flash" and fr_left <= 2:                   # 2 quadros brancos e corte seco
        a[:] = 255
    if ex == "wipe_fan" and fr_left <= 4:                # leque enche a tela por 4 quadros
        a = a * 0 + np.array(NAVY, np.float32); a[:, :, :] += 0
    prev = PREV.get(sid)
    if prev is not None and prev[7] == "flare_white" and fr_in < 4:
        a = lerp(255.0, a, fr_in / 4)
    if prev is not None and prev[7] == "light_burst" and fr_in < 3:
        a = lerp(255.0, a, fr_in / 3)
    if sid == "1.1" and False:
        pass
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


PREV = {SHOTS[i][0]: SHOTS[i - 1] for i in range(1, len(SHOTS))}


def shot_at(t):
    for s in SHOTS:
        if s[1] <= t < s[2]:
            return s
    return SHOTS[-1]


def vertical_from(frame16, sid, u):
    """Reenquadra o 16:9 no 9:16: pan lento nos planos de cidade/salão, centro nos demais."""
    sw, sh = frame16.size
    cw = int(sh * 9 / 16)
    if sid in ("1.2", "3.7", "3.8", "5.1"):
        x = int(lerp(0, sw - cw, ease(u)))
    else:
        x = (sw - cw) // 2
    return frame16.crop((x, 0, x + cw, sh)).resize((W, H), Image.BICUBIC)


def render_frame(fi):
    t = fi / FPS
    s = shot_at(t); sid = s[0]; u = (t - s[1]) / (s[2] - s[1])
    if sid == "5.6":
        img = card_frame(t)
    elif sid == "6.1":
        img = signature_frame(t)
    elif sid == "6.2":
        img = Image.new("RGB", (W, H), BLACK)
    else:
        f = render_scene(sid, u, t)
        f = light_fx(f, sid, u, t)
        past = s[1] < 53.0  # look passado até o flare do 3.3 (ver inconsistência #4)
        f = grade(f, past, fi)
        f = transition_overlay(f, s, t)
        img = vertical_from(f, sid, u) if W < H else f
        if sid == "1.1":
            img = f if W > H else vertical_from(f, sid, u)
    img = hud(img, s, t)
    return img.tobytes()


HANDLE = 0.5  # s de sobra no fim de cada clipe, como os clipes gerados por IA


def clip_frame(args):
    """Quadro cru (cena + luz) de um plano, para o Remotion aplicar cor e transições."""
    sid, k = args
    s = SHOT_BY_ID[sid]
    dur = s[2] - s[1]
    t = s[1] + k / FPS
    u = min(1.0, (k / FPS) / dur)
    f = light_fx(render_scene(sid, u, t), sid, u, t)
    return f.tobytes()


def export_clips(dest):
    dest = Path(dest); dest.mkdir(parents=True, exist_ok=True)
    with Pool(4) as p:
        for s in SHOTS:
            sid = s[0]
            if sid in ("5.6", "6.1", "6.2"):
                continue  # motion graphics feitos no Remotion
            n = int(round((s[2] - s[1] + HANDLE) * FPS))
            out = dest / f"TDO_{sid}.mp4"
            ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                                   "-s", f"{SW}x{SH}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "fast",
                                   "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(out)], stdin=subprocess.PIPE)
            for b in p.imap(clip_frame, [(sid, k) for k in range(n)], chunksize=6):
                ff.stdin.write(b)
            ff.stdin.close(); ff.wait()
            print("  clip", sid, n, "frames", flush=True)


def main():
    if ARGS.clips:
        export_clips(ARGS.clips)
        return
    out_dir = ROOT / "build"; out_dir.mkdir(exist_ok=True)
    if ARGS.stills:
        sheet_dir = ROOT / "build" / ("keyframes_v" if W < H else "keyframes")
        sheet_dir.mkdir(exist_ok=True)
        for s in SHOTS:
            t = s[1] + (s[2] - s[1]) * 0.55
            Image.frombytes("RGB", (W, H), render_frame(int(t * FPS))).save(sheet_dir / f"TDO_{s[0]}_board.jpg", quality=88)
        return
    f0, f1 = int(ARGS.t_from * FPS), int(ARGS.t_to * FPS)
    name = "animatic_v1_9x16" if W < H else "animatic_v1_16x9"
    vid = out_dir / f"{name}_video.mp4"
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                           "-pix_fmt", "yuv420p", str(vid)], stdin=subprocess.PIPE)
    with Pool(4) as p:
        for i, b in enumerate(p.imap(render_frame, range(f0, f1), chunksize=8)):
            ff.stdin.write(b)
            if i % 240 == 0:
                print(f"  {i / FPS:5.1f}s", flush=True)
    ff.stdin.close(); ff.wait()
    print("ok", vid)


if __name__ == "__main__":
    main()

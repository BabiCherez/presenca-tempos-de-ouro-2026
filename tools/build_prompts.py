"""Monta os prompts finais por plano (p. 10–16): substitui [P1]…[P7] pelos textos-âncora
sem alterar uma palavra e cola o sufixo de estilo do ato + negative.
Saídas: docs/prompts_por_plano.md e docs/prompts_por_plano.csv (para planilha / gerador).
"""
import csv, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from shots import SHOTS

ROOT = Path(__file__).resolve().parent.parent

ANCHOR = {
    "P1": "elegant Brazilian woman in her early 30s, warm olive skin, dark brown eyes, glossy black hair in a 1920s finger-wave bob ending at the jaw, defined brows, deep red lipstick, slim build, poised confident posture",
    "P2": "lean man in his 50s, grey mustache, flat cap, worn navy wool postman coat with brass buttons, aged brown leather satchel",
    "P3": "chauffeur in black uniform, black peaked cap, black leather gloves",
    "P4": "tall man in his 30s, short slicked-back dark hair, clean shave, black peak-lapel tuxedo, black bow tie, gold cufflinks",
    "P5": "charismatic man in his 40s, salt-and-pepper hair, black tuxedo with satin lapels, white pocket square",
    "P7": "young bartender, white shirt, black vest, gold sleeve garters, black bow tie",
}
STYLE_PAST = ("shot on 35mm film, 1920s period accuracy, Art Deco, warm amber practical lights, soft sepia midtones, "
              "visible fine film grain, gentle halation, shallow depth of field, natural human motion, cinematic 16:9, 24fps, photorealistic")
STYLE_PRESENT = ("cinematic luxury gala, deep navy blue and metallic gold palette, rich black shadows, amber moving-head beams, "
                 "light haze, fine film grain, shallow depth of field, natural human motion, 16:9, 24fps, photorealistic")
NEGATIVE = ("extra fingers, deformed hands, warped faces, morphing objects, flickering, distorted text, misspelled logo, "
            "random letters, modern cars in 1920s scenes, smartphones, plastic skin, cartoon, oversaturated, "
            "camera shake without motivation, cigarette smoke, lit cigar")

# (plano, duração de geração, frame inicial/final, prompt com marcadores) — transcrito do PDF
P = [
    ("1.1", 3, "sem frame inicial", "Pure black screen, faint flickering beam of an old film projector briefly lighting dust particles in the darkness. [STYLE_PAST]"),
    ("1.2", 7, "sem frame inicial", "Aerial drone shot descending slowly between Art Deco skyscrapers of a 1920s New York-style city at golden-hour dusk, streetlights and shop signs flickering on, trams and vintage black automobiles on cobblestone avenues below, crowds in fedoras and flapper dresses. The camera glides down to street level. [STYLE_PAST]"),
    ("1.3", 4, "sem frame inicial", "Low-angle wide street shot at dusk, 1920s pedestrians crossing: men in tailored suits, suspenders and fedora hats, women in fringe dresses, gloves and wavy bobs. A glossy black 1920s automobile passes close in the foreground, filling the frame. [STYLE_PAST]"),
    ("1.4", 4, "frame inicial: still do envelope ENV na bolsa", "[P2] walks along a lamplit 1920s sidewalk, reaches into his satchel and pulls out a navy blue envelope with thin gold edges and antique postage stamps. Lateral tracking shot matching his pace. [STYLE_PAST]"),
    ("1.5", 3, "frame inicial: still ENV em close", "Macro shot of weathered hands holding a luxurious navy blue envelope with a gold wax seal stamped with the letter P and vintage postage stamps. Slow slider move, focus racks from the wax seal to the gold lettering on the envelope. [STYLE_PAST]"),
    ("1.6", 3, "frame inicial: still da porta da mansão", "[P2] rings the brass bell of a grand historic mansion doorway at dusk. The heavy wooden door opens slowly, revealing [P1] in a champagne silk robe, backlit by warm interior light. She takes the navy envelope with a gentle smile. [STYLE_PAST]"),
    ("1.7", 3, "frame inicial: still ENV sobre penteadeira", "Top-down shot descending over an ornate wooden vanity lit by a gold table lamp. Elegant hands of [P1] break the gold wax seal of the navy envelope; the wax cracks cleanly. [STYLE_PAST]"),
    ("1.8", 4, "frame final: mockup CONV (sem a mão)", "Over-the-shoulder shot of [P1] at her vanity sliding a navy and gold Art Deco invitation card out of the envelope. Slow dolly-in toward the card held in her hand, then focus shifts to her reflection in the vintage mirror as she smiles subtly. [STYLE_PAST]"),
    ("2.1", 2, "sem frame inicial", "Close-up of a woman's hands lifting a long black evening gown with gold Art Deco fan embroidery off a velvet hanger, beads catching amber light. [STYLE_PAST]"),
    ("2.2", 2, "—", "Close-up of a long pearl necklace being fastened at the nape of [P1], soft amber backlight on her finger-wave hair. [STYLE_PAST]"),
    ("2.3", 2, "—", "Close-up in an antique oval mirror: [P1] applies deep red lipstick in one smooth stroke. [STYLE_PAST]"),
    ("2.4", 2, "—", "Macro shot of [P4] fastening a gold cufflink on a crisp white shirt cuff under a black tuxedo sleeve, short push-in. [STYLE_PAST]"),
    ("2.5", 2, "—", "Macro shot of an engraved gold pocket watch snapping shut in a man's palm. [STYLE_PAST]"),
    ("2.6", 2, "—", "Ground-level tracking shot of black satin high heels walking across a polished black and white marble floor. [STYLE_PAST]"),
    ("2.7", 5, "frame inicial: P1 look 2 segurando LEQ pelo verso", "[P1], now in her black and gold gown, pearls and gold feather headband, lifts a rigid flat hand fan shaped like a scalloped fan with two gold tassels. She turns it from the plain cream back to the navy front printed with a gold Art Deco logo, then waves it gently toward the camera until the fan fills the frame. The fan is a single rigid piece and never folds. 45-degree orbit around her. [STYLE_PAST]"),
    ("2.8", 5, "frame inicial: mockup CRON sobre a penteadeira", "Macro shot on a wooden vanity: a black-gloved hand slowly rotates a round navy blue program wheel with a scalloped cream border and gold ring; the fan-shaped window stops on the first time slot. Slow lateral slider, rack focus. [STYLE_PAST]"),
    ("2.9", 4, "—", "Interior wide shot through a tall mansion window at night: [P1] slips the invitation into a beaded clutch; outside, [P3] holds open the rear door of a glossy black 1920s automobile. Slow dolly-out through the window frame. [STYLE_PAST]"),
    ("3.1", 4, "—", "Night, mansion driveway lit by gold lanterns. [P1] gracefully steps into the black 1920s automobile; [P3] closes the door with a solid thud. Static camera at door-handle height. [STYLE_PRESENT]"),
    ("3.2", 5, "—", "Tracking shot parallel to a black 1920s automobile driving down a wet boulevard lined with golden street lamps, reflections sliding over the glossy bodywork; through the rear window, passing lights sweep across the face of [P1]. [STYLE_PRESENT]"),
    ("3.3", 3, "—", "Wide shot: the black automobile turns a corner at night and its headlights swing directly into the lens, creating a large golden anamorphic flare that blooms to white. [STYLE_PRESENT]"),
    ("3.4", 5, "frame inicial: foto LOC-A", "Night exterior of the venue exactly as in the reference: beige stone-tile facade with the Espaço wood sign, warm uplights, red carpet with gold stanchions. A black and cream vintage car pulls up at the red carpet; a doorman opens the door and [P1] steps out elegantly. Crane descending to eye level. [STYLE_PRESENT]"),
    ("3.5", 3, "frame inicial: foto LOC-A", "[P1] walks the red carpet between gold stanchions toward the entrance; the saxophonist in a tuxedo and fedora plays, and two hostesses in black and gold sequined flapper dresses with feather headbands and boas welcome her with a gesture. Steadicam leading backward. [STYLE_PRESENT]"),
    ("3.6", 3, "—", "From behind [P1]: tall glass doors swing open and warm golden light floods out around her silhouette; push-in following her. [STYLE_PRESENT]"),
    ("3.7", 4, "frame inicial: foto LOC-D", "Grand ballroom exactly as in the reference: tiered crystal chandeliers with white ostrich plumes, wooden dance floor covered in golden gobo patterns, Art Deco screen, mezzanine with black drapes and pearl garlands, elegant guests in 1920s attire mingling. Crane rising and pushing forward. [STYLE_PRESENT]"),
    ("3.8", 4, "frame inicial: foto LOC-B", "High wide shot along the glass mezzanine railing of a two-level venue with white brick columns and black Art Deco panels, round tables in black linen with white feather centerpieces and candles on both floors, guests toasting. Slow pan along the railing. [STYLE_PRESENT]"),
    ("4.1", 4, "frame inicial: mockup INSTA", "[P1] walks along a navy carpet with gold borders toward a towering navy and gold Art Deco photo backdrop with illuminated fan panels and polished marble floor. Dolly moving backward in front of her. [STYLE_PRESENT]"),
    ("4.2", 3, "frame inicial: mockup INSTA", "Over the shoulder of a photographer: [P1] and [P4] pose and laugh in front of the navy and gold backdrop; the camera flash fires and floods the frame white. [STYLE_PRESENT]"),
    ("4.3", 4, "frame inicial: mockup COPO sobre mármore", "[P7] sets down a stemless crystal glass with a thin gold rim and a frosted white engraved logo on a black marble bar top. Slider move, focus racks onto the engraving. [STYLE_PRESENT]"),
    ("4.4", 4, "frame inicial: mockup KIT (charuto trocado por chocolate)", "A hand places a 50ml whisky miniature bottle and a chocolate cigar wrapped in gold foil, partly unwrapped to show chocolate, into the gold-rimmed glass on a marble tray. 90-degree orbit, amber reflections. [STYLE_PRESENT]"),
    ("4.5", 4, "frame final: mockup MENU", "[P7] shakes a silver cocktail shaker, ice cubes falling in slow motion into a coupe; camera tilts down and pushes in to a navy and gold Art Deco drinks menu standing in a brass holder on the bar. [STYLE_PRESENT]"),
    ("4.6", 3, "—", "[P7] hands a golden cocktail in a coupe glass to [P1], who thanks him with a glance and a slight smile. [STYLE_PRESENT]"),
    ("4.7", 3, "—", "Ballroom lights dim, a single spotlight hits the stage; [P5] opens a gold envelope, close on his hands. Slow zoom. [STYLE_PRESENT]"),
    ("4.8", 4, "frame inicial: mockup TROF", "Macro orbit around a trophy shaped like a vintage film camera: brushed steel reels and body on a walnut wood base, amber light gliding over the metal, reels turning slightly. [STYLE_PRESENT]"),
    ("4.9", 4, "—", "[P5] hands the film-camera trophy to an honoree seen from behind; the audience applauds, gold confetti falls through stage light. Backlit. [STYLE_PRESENT]"),
    ("4.10", 3, "frame inicial: mockup VOUCH (nome trocado)", "[P5] turns a large navy and gold Art Deco prize board toward the audience under a spotlight. Push-in. [STYLE_PRESENT]"),
    ("4.11", 3, "—", "Close-up of a joyful guest in 1920s attire covering her mouth in surprise as friends hug her, slight handheld motion. [STYLE_PRESENT]"),
    ("5.1", 3, "frame inicial: foto LOC-D com convidados", "Wide shot of the packed ballroom; the lights switch off in waves from back to front until near darkness. [STYLE_PRESENT]"),
    ("5.2", 3, "—", "Dark stage, a hard golden spotlight snaps on over a black velvet curtain; shadowy silhouettes of musicians move behind it. Light haze. [STYLE_PRESENT]"),
    ("5.3", 5, "—", "Slow lateral tracking shot along a dark stage: a vintage chrome microphone in the foreground, an electric guitar on a stand, a backlit drum kit, a saxophone gleaming in the spotlight. No faces. [STYLE_PRESENT]"),
    ("5.4", 3, "—", "Close-up on the seam of a black velvet stage curtain as it begins to part, golden light leaking through. Push-in. [STYLE_PRESENT]"),
    ("5.5", 2, "—", "Explosion of golden stage light: pure backlit silhouette of a lead singer gripping a microphone, band silhouettes behind, crowd in 1920s attire jumping in the foreground. No identifiable faces. [STYLE_PRESENT]"),
]

# Ajustes PROPOSTOS (pendentes de aprovação) — não alteram o prompt-base, só acrescentam notas
NOTES = {
    "3.4": "INCONSISTÊNCIA #3: o prompt cita 'black and cream vintage car' e 'doorman'; o storyboard/2.9–3.3 usam carro preto e 'recepcionista abre a porta'. Proposta: usar o mesmo carro de 2.9–3.3 (ou repintá-lo como o da foto LOC-A em todos) e P3 ou recepcionista conforme decisão.",
    "4.11": "INCONSISTÊNCIA #2: a Bíblia lista P1 em 4.11, mas o roteiro diz 'Convidada (não P1)'. Prompt mantido como convidada (sem âncora P1).",
    "3.1": "Grade: ver inconsistência #4 (look passado até o flare do 3.3).",
    "3.2": "Grade: ver inconsistência #4.",
    "3.3": "Grade: ver inconsistência #4. A troca de look acontece dentro do flare (8 quadros de branco).",
}


def expand(txt):
    for k, v in ANCHOR.items():
        txt = txt.replace(f"[{k}]", v)
    return txt.replace("[STYLE_PAST]", STYLE_PAST).replace("[STYLE_PRESENT]", STYLE_PRESENT)


def main():
    shots = {s[0]: s for s in SHOTS}
    md = ["# Prompts por plano — Presença | Tempos de Ouro 2026", "",
          "Gerados a partir do Pacote de Produção (p. 10–16). Âncoras substituídas sem alteração; sufixo do ato e negative incluídos.",
          "Gere 3 a 4 variações por plano em modo imagem-para-vídeo, a partir do frame-chave aprovado; nomeie `TDO_<plano>_v<n>.mp4`.",
          "Planos 5.6, 6.1 e 6.2 não são gerados por IA (motion graphics no editor).", "",
          f"**NEGATIVE (todos os planos):** `{NEGATIVE}`", ""]
    rows = []
    for sid, dur, frame, raw in P:
        s = shots[sid]
        full = expand(raw)
        md += [f"## {sid} · corte {s[2] - s[1]:.1f} s · gerar {dur} s · {frame}",
               f"*{s[3]} — {s[5]} — ref. {s[6]}*", "", "```", full, "```"]
        if sid in NOTES:
            md += ["", f"> {NOTES[sid]}"]
        md.append("")
        rows.append([f"TDO_{sid}", sid, f"{s[1]:.2f}", f"{s[2]:.2f}", f"{s[2] - s[1]:.2f}", dur, frame, s[6], full, NEGATIVE, NOTES.get(sid, "")])
    (ROOT / "docs" / "prompts_por_plano.md").write_text("\n".join(md), encoding="utf-8")
    with open(ROOT / "docs" / "prompts_por_plano.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["arquivo", "plano", "inicio_s", "fim_s", "corte_s", "gerar_s", "frame", "ref", "prompt", "negative", "nota"])
        w.writerows(rows)
    print(len(rows), "prompts")


if __name__ == "__main__":
    main()

import { Video } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Fisheye } from "../Fisheye";
import { CHAMPAGNE, GOLD, SANS } from "../theme";
import { SaveTheDate } from "./SaveTheDate";

/*
 * Spoiler 01 — v3 (14,5 s, 24 fps, 348 quadros). ESTRUTURA DE MONTAGEM.
 * Planos 1–3: clipes gerados externamente (image-to-video) → public/clips_v3/.
 * Enquanto um clipe não existe, o plano mostra uma claquete "AGUARDANDO CLIPE" — isto NÃO é vídeo final.
 * Plano 4 (detalhe do convite) será integrado após receber o clipe do plano 3 (mesmo piso, luz e enquadramento).
 * Ver docs/spoiler-01/plano-v3-ia.md.
 */

// Preencha com o nome do arquivo em public/clips_v3/ quando o clipe aprovado chegar; null = ainda não recebido.
const CLIPS: Record<"plano1" | "plano2" | "plano3", { file: string | null; trimStartSec: number }> = {
  plano1: { file: null, trimStartSec: 0 },
  plano2: { file: null, trimStartSec: 0 },
  plano3: { file: null, trimStartSec: 0 },
};

const Slate: React.FC<{ title: string; detail: string }> = ({ title, detail }) => (
  <AbsoluteFill style={{ backgroundColor: "#111", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
    <div style={{ border: `2px dashed ${GOLD}`, padding: "40px 70px", textAlign: "center" }}>
      <div style={{ color: GOLD, fontSize: 30, letterSpacing: "0.3em", fontWeight: 600 }}>AGUARDANDO CLIPE</div>
      <div style={{ color: CHAMPAGNE, fontSize: 52, marginTop: 18 }}>{title}</div>
      <div style={{ color: "#aaa", fontSize: 26, marginTop: 14, maxWidth: 1100 }}>{detail}</div>
    </div>
  </AbsoluteFill>
);

const Clip: React.FC<{ id: keyof typeof CLIPS; title: string; detail: string }> = ({ id, title, detail }) => {
  const { fps } = useVideoConfig();
  const c = CLIPS[id];
  if (!c.file) return <Slate title={title} detail={detail} />;
  return (
    <Video
      src={staticFile(`clips_v3/${c.file}`)}
      trimBefore={Math.round(c.trimStartSec * fps)}
      muted
      objectFit="cover"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export const SpoilerV3: React.FC = () => {
  const { fps, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence name="1 · Corredor e porta 512" from={0} durationInFrames={2.5 * fps} premountFor={fps}>
        <Clip id="plano1" title="Plano 1 · Corredor e porta 512" detail="2,5 s · image-to-video a partir da Ref. B" />
      </Sequence>
      <Sequence name="2 · Olho mágico (lente aplicada aqui)" from={2.5 * fps} durationInFrames={4 * fps} premountFor={fps}>
        {CLIPS.plano2.file ? (
          <AbsoluteFill style={{ backgroundColor: "#000" }}>
            <Fisheye radius={height * 0.47} strength={0.4}>
              <Clip id="plano2" title="" detail="" />
            </Fisheye>
          </AbsoluteFill>
        ) : (
          <Clip id="plano2" title="Plano 2 · Mensageiro pelo olho mágico" detail="4,0 s · image-to-video a partir da Ref. C (gerado SEM distorção; a lente entra aqui)" />
        )}
      </Sequence>
      <Sequence name="3 · Convite sob a porta" from={6.5 * fps} durationInFrames={2.5 * fps} premountFor={fps}>
        <Clip id="plano3" title="Plano 3 · Convite passando sob a porta" detail="2,5 s · image-to-video a partir da Ref. D" />
      </Sequence>
      <Sequence name="4 · Detalhe do convite (integração depois do plano 3)" from={9 * fps} durationInFrames={2 * fps} premountFor={fps}>
        <Slate title="Plano 4 · Detalhe do convite" detail="2,0 s · será integrado sobre o clipe do plano 3, com a arte oficial rastreada" />
      </Sequence>
      <Sequence name="5 · SAVE THE DATE · 05.12.2026" from={11 * fps} durationInFrames={3.5 * fps} premountFor={fps}>
        <SaveTheDate />
      </Sequence>
    </AbsoluteFill>
  );
};

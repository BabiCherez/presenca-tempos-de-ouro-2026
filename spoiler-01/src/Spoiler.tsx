import type React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { EndCard, FilmLook } from "./Overlays";
import { ShotCorridor, ShotEnvelope, ShotKnock, ShotOpen, ShotPeephole, ShotUnderDoor } from "./Shots";

/**
 * Spoiler 01 — "Alguém bateu à sua porta" (30 s, 24 fps).
 * 0–3 s breu e fresta · 3–9 s corredor e porta 512 · 9–12 s três batidas · 12–15 s olho mágico vazio
 * 15–20 s envelope desliza por baixo da porta · 20–25 s "Convite" e brilho dourado · 25–30 s EM BREVE
 */
export const Spoiler: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Sequence name="1 · Breu e fresta de luz" from={0} durationInFrames={3 * fps} premountFor={fps}>
        <ShotOpen />
      </Sequence>
      <Sequence name="2 · Corredor até a porta 512" from={3 * fps} durationInFrames={6 * fps} premountFor={fps}>
        <ShotCorridor />
      </Sequence>
      <Sequence name="3 · Três batidas" from={9 * fps} durationInFrames={3 * fps} premountFor={fps}>
        <ShotKnock />
      </Sequence>
      <Sequence name="4 · Olho mágico" from={12 * fps} durationInFrames={3 * fps} premountFor={fps}>
        <ShotPeephole />
      </Sequence>
      <Sequence name="5 · Envelope sob a porta" from={15 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <ShotUnderDoor />
      </Sequence>
      <Sequence name="6 · Convite" from={20 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <ShotEnvelope />
      </Sequence>
      <Sequence name="7 · Em breve" from={25 * fps} durationInFrames={5 * fps} premountFor={fps}>
        <EndCard />
      </Sequence>
      <FilmLook />
      {/* Áudio em faixas separadas (ver tools/make_audio.py) */}
      <Audio name="Música · Chicago (1922, domínio público)" src={staticFile("audio/musica.wav")} premountFor={fps} />
      <Audio name="Efeitos" src={staticFile("audio/sfx.wav")} premountFor={fps} />
      <Audio name="Narração (provisória)" src={staticFile("audio/vo.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};

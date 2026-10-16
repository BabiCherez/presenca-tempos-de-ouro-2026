import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BellhopPose } from "./Bellhop";
import { Fisheye } from "./Fisheye";
import { CameraRig, DOOR_Z, Hotel, HotelState } from "./Hotel";
import { fontsReady } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const BASE: HotelState = {
  doorKick: 0,
  sconce: 1,
  shadowX: 9,
  envelope: 0,
  flap: 0,
  roomLight: 0,
  gapLight: 1,
  bellhop: null,
};

/** Segura o render até as fontes usadas nas texturas (Convite, 512) estarem carregadas. */
const useFonts = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("fontes"));
  useEffect(() => {
    fontsReady.then(() => document.fonts.ready).then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};

const Scene: React.FC<{
  s: Partial<HotelState>;
  cam: { position: [number, number, number]; target: [number, number, number]; fov: number; roll?: number };
  exposure?: number;
}> = ({ s, cam, exposure = 1 }) => {
  const { width, height } = useVideoConfig();
  const ready = useFonts();
  if (!ready) return null;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: exposure }}
      style={{ backgroundColor: "#000" }}
    >
      <CameraRig {...cam} />
      <Hotel s={{ ...BASE, ...s }} />
    </ThreeCanvas>
  );
};

/** Batida: impulso que decai (para porta e câmera) */
const knock = (f: number, at: number[]) =>
  at.reduce((acc, a) => (f >= a ? acc + Math.exp(-(f - a) / 2.2) * (f - a < 14 ? 1 : 0) : acc), 0);

// ---------------------------------------------------------------- 1. Abertura: breu e a fresta acende
export const ShotOpen: React.FC = () => {
  const f = useCurrentFrame();
  const flick = random(`o${Math.floor(f / 2)}`) > 0.55 ? 0.35 : 1;
  const gap = interpolate(f, [14, 56], [0, 1], clamp) * (f > 14 && f < 44 ? flick : 1);
  return (
    <Scene
      s={{ gapLight: gap, roomLight: 0.06 }}
      cam={{
        position: [0, 0.16, DOOR_Z - interpolate(f, [0, 72], [2.0, 1.75], clamp)],
        target: [0, 0.12, DOOR_Z],
        fov: 34,
      }}
    />
  );
};

// ---------------------------------------------------------------- 2. Corredor: dolly lento até a porta 512
export const ShotCorridor: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const z = interpolate(f, [0, durationInFrames], [-0.8, -12.5], { ...clamp, easing: Easing.bezier(0.3, 0, 0.6, 1) });
  const flick = f > 70 && f < 96 ? (random(`c${Math.floor(f / 2)}`) > 0.5 ? 0.15 : 1) : 1;
  return (
    <Scene
      s={{ sconce: flick }}
      cam={{ position: [0, 1.58, z], target: [0, 1.4, DOOR_Z], fov: 42 }}
      exposure={1.1}
    />
  );
};

// ---------------------------------------------------------------- 3. Dentro do quarto: três batidas
export const KNOCKS = [8, 18, 28];
export const ShotKnock: React.FC = () => {
  const f = useCurrentFrame();
  const k = knock(f, KNOCKS);
  const shake = k * 0.012;
  return (
    <Scene
      s={{ doorKick: -k * 0.006, roomLight: 0.75 }}
      cam={{
        position: [Math.sin(f * 2.1) * shake, 1.45 + Math.cos(f * 3.3) * shake, DOOR_Z - 2.9 + interpolate(f, [0, 48], [0, 0.6], clamp)],
        target: [0, 1.25, DOOR_Z],
        fov: 38,
      }}
    />
  );
};

// ---------------------------------------------------------------- 4. Olho mágico: o mensageiro bate, espia, mostra o convite e se abaixa
export const PEEP_KNOCKS = [22, 32];
const pose = (f: number): BellhopPose => {
  const k = PEEP_KNOCKS.reduce((acc, a) => (f >= a && f < a + 6 ? acc + Math.sin(((f - a) / 6) * Math.PI) : acc), 0);
  return {
    dist: interpolate(f, [0, 14, 20, 40, 52, 66, 80, 96, 118, 144], [0.9, 0.9, 0.76, 0.76, 0.62, 0.52, 0.52, 0.95, 0.9, 0.7], clamp) - k * 0.035,
    y: interpolate(f, [116, 140], [0, -1.15], { ...clamp, easing: Easing.bezier(0.5, 0, 0.7, 1) }),
    lean: interpolate(f, [44, 60, 80, 94, 116, 140], [0, 0.42, 0.42, 0, 0.05, 0.35], clamp),
    rArm: interpolate(f, [12, 20, 40, 50], [0.05, 1.82, 1.82, 0.05], clamp),
    rYaw: interpolate(f, [12, 20, 40, 50], [0, 1, 1, 0], clamp),
    lYaw: interpolate(f, [92, 106, 118, 136], [0, 1, 1, 0], clamp),
    lArm: interpolate(f, [92, 106, 118, 136], [0.08, 1.78, 1.78, 0.5], clamp),
    holding: true,
    head: interpolate(f, [0, 14, 52, 66, 80, 94], [0.18, 0.05, 0.05, -0.08, -0.08, 0.1], clamp),
    sway: Math.sin(f / 13) * 0.012,
  };
};
export const ShotPeephole: React.FC = () => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  const flick = f > 6 && f < 12 && random(`p${Math.floor(f / 2)}`) > 0.5 ? 0.3 : 1;
  const r = height * 0.47;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Fisheye radius={r} strength={0.42}>
        <Scene
          s={{ sconce: flick, envelope: -1, bellhop: pose(f) }}
          cam={{ position: [0, 1.55, DOOR_Z + 0.035], target: [0, 1.48, 0], fov: 96 }}
          exposure={1.3}
        />
      </Fisheye>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${r * 0.6}px, rgba(0,0,0,0.6) ${r * 0.92}px, #000 ${r}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          left: "50%",
          top: "50%",
          width: r * 2,
          height: r * 2,
          translate: `${-r}px ${-r}px`,
          borderRadius: "50%",
          boxShadow: "inset 0 0 70px rgba(120,160,255,0.16), inset 0 0 10px rgba(255,200,120,0.25)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 5. Rente ao chão: sombra na fresta, envelope desliza
export const ShotUnderDoor: React.FC = () => {
  const f = useCurrentFrame();
  const shadowX = interpolate(f, [0, 62, 86], [0.05, 0.05, 1.7], clamp);
  const env = interpolate(f, [8, 46], [0, 1], { ...clamp, easing: Easing.bezier(0.15, 0.6, 0.3, 1) });
  return (
    <Scene
      s={{ shadowX, envelope: env, roomLight: 0.2 }}
      cam={{
        position: [0.0, 0.11, DOOR_Z - interpolate(f, [0, 96], [1.45, 1.32], clamp)],
        target: [0, 0.05, DOOR_Z - 0.25],
        fov: 30,
      }}
    />
  );
};

// ---------------------------------------------------------------- 6. Detalhe do envelope: "Convite" e brilho dourado
export const ShotEnvelope: React.FC = () => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 108], [0, 1], { ...clamp, easing: Easing.bezier(0.25, 0, 0.35, 1) });
  const ez = DOOR_Z - 0.78;
  return (
    <Scene
      s={{ envelope: 1, flap: interpolate(f, [36, 92], [0, 1], clamp), roomLight: 0.32, gapLight: 1 }}
      cam={{
        position: [THREE.MathUtils.lerp(0.22, 0.06, t), THREE.MathUtils.lerp(0.62, 0.36, t), THREE.MathUtils.lerp(ez - 0.45, ez - 0.2, t)],
        target: [0.02, 0, ez],
        fov: 36,
        roll: 0.06,
      }}
      exposure={1.15}
    />
  );
};

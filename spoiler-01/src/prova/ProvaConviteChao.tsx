import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useVideoConfig } from "remotion";
import { Envelope } from "../Envelope";
import { FilmLook } from "../Overlays";
import { decoWallpaper, warmGlow } from "../textures";
import { fontsReady } from "../theme";
import { warmEnvScene, wallGrime, woodFloor } from "./materials";

/*
 * PROVA (rota A) — Quadro estático: o convite no chão do quarto, logo após passar por baixo da porta.
 * Porta no plano z = 0 (corredor em z > 0, quarto em z < 0).
 * Luz principal: corredor, rasante, entrando só pela fresta sob a porta.
 */

const GAP = 0.022;
const DOOR_W = 1.0;

const Cam: React.FC = () => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(0.25, 0.6, -1.0);
  camera.lookAt(-0.26, 0.02, -0.2);
  camera.fov = 34;
  camera.near = 0.02;
  camera.updateProjectionMatrix();
  return null;
};

const contactShadowTex = () => {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  const gr = g.createRadialGradient(128, 128, 40, 128, 128, 128);
  gr.addColorStop(0, "rgba(0,0,0,0.85)");
  gr.addColorStop(0.6, "rgba(0,0,0,0.45)");
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

const Scene: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const t = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(warmEnvScene(), 0.02).texture;
    pm.dispose();
    const floor = woodFloor([3, 3]);
    return {
      env,
      floor,
      wall: decoWallpaper([3, 2]),
      grime: wallGrime([1, 1]),
      contact: contactShadowTex(),
      glow: warmGlow(),
    };
  }, [gl]);
  const beamTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(-0.3, 0, -1.4);
    return o;
  }, []);
  const lampTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, -0.3);
    return o;
  }, []);
  return (
    <>
      <color attach="background" args={["#030305"]} />
      <hemisphereLight args={["#1b2550", "#0c0805", 0.22]} />
      {/* piso de tábuas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1.5]} receiveShadow>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial map={t.floor.map} bumpMap={t.floor.bump} bumpScale={1.2} roughness={0.5} metalness={0.05} />
      </mesh>
      {/* piso do corredor (visto pela fresta) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 1.5]}>
        <planeGeometry args={[6, 3]} />
        <meshStandardMaterial color="#d8c9a8" roughness={0.3} />
      </mesh>
      {/* porta laqueada escura com almofadas e friso dourado */}
      <group position={[0, GAP, 0]}>
        <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
          <boxGeometry args={[DOOR_W, 2.2, 0.05]} />
          <meshPhysicalMaterial color="#121019" roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.25} />
        </mesh>
        <mesh position={[0, 0.42, -0.0255]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.72, 0.62]} />
          <meshPhysicalMaterial color="#17141f" roughness={0.3} clearcoat={0.5} />
        </mesh>
        <lineSegments position={[0, 0.42, -0.026]}>
          <edgesGeometry args={[new THREE.PlaneGeometry(0.76, 0.66)]} />
          <lineBasicMaterial color="#b08a33" />
        </lineSegments>
        {/* soleira metálica */}
        <mesh position={[0, -0.006, -0.03]}>
          <boxGeometry args={[DOOR_W, 0.012, 0.015]} />
          <meshStandardMaterial color="#b8902f" metalness={1} roughness={0.3} envMap={t.env} />
        </mesh>
      </group>
      {/* parede do quarto ao redor da porta */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * (DOOR_W / 2 + 1), 1.2, -0.03]} rotation={[0, Math.PI, 0]} receiveShadow castShadow>
          <planeGeometry args={[2, 2.4]} />
          <meshStandardMaterial map={t.wall} roughness={0.85} aoMap={t.grime} />
        </mesh>
      ))}
      {/* rodapé */}
      {[-1, 1].map((k) => (
        <mesh key={`r${k}`} position={[k * (DOOR_W / 2 + 1), 0.06, -0.04]} castShadow>
          <boxGeometry args={[2, 0.12, 0.02]} />
          <meshStandardMaterial color="#1a120c" roughness={0.5} />
        </mesh>
      ))}
      {/* LUZ PRINCIPAL: corredor, rasante pela fresta */}
      <primitive object={beamTarget} />
      <spotLight
        position={[-0.28, 0.12, 1.6]}
        target={beamTarget}
        angle={0.5}
        penumbra={0.35}
        intensity={60}
        distance={6}
        decay={1.4}
        color="#ffc078"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
        shadow-radius={3}
      />
      {/* fresta luminosa */}
      <mesh position={[0, GAP / 2, 0.026]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[DOOR_W, GAP]} />
        <meshBasicMaterial color={new THREE.Color(1, 0.7, 0.36).multiplyScalar(1.4)} toneMapped={false} />
      </mesh>
      {/* abajur do quarto, fora de quadro (preenchimento suave, cria a sombra de contato) */}
      <primitive object={lampTarget} />
      <spotLight
        position={[1.3, 1.4, -1.6]}
        target={lampTarget}
        angle={0.6}
        penumbra={1}
        intensity={6}
        distance={5}
        decay={1.5}
        color="#ffcf9a"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-radius={8}
      />
      {/* CONVITE */}
      <group position={[-0.3, 0.0018, -0.2]} rotation={[0, 0.18, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.006, -0.0012, -0.004]}>
          <planeGeometry args={[0.36, 0.26]} />
          <meshBasicMaterial map={t.contact} transparent opacity={0.75} depthWrite={false} />
        </mesh>
        {/* leve curvatura do papel: inclinação mínima de uma borda */}
        <group rotation={[0.012, 0, 0.006]}>
          <Envelope envOverride={t.env} />
        </group>
      </group>
    </>
  );
};

export const ProvaConviteChao: React.FC = () => {
  const { width, height } = useVideoConfig();
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender("fontes-convite"));
  useEffect(() => {
    fontsReady.then(() => document.fonts.ready).then(() => {
      setReady(true);
      continueRender(h);
    });
  }, [h]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {ready ? (
        <ThreeCanvas
          width={width}
          height={height}
          shadows
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
        >
          <Cam />
          <Scene />
        </ThreeCanvas>
      ) : null}
      <FilmLook />
    </AbsoluteFill>
  );
};

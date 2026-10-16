import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { cottonKnit } from "./materials";

/**
 * Mão enluvada articulada (luva de algodão branca).
 * Sistema local: punho na origem; dedos apontam para -Z; dorso para +Y; palma para -Y.
 * side = 1 (mão direita: polegar em -X) / -1 (esquerda: polegar em +X). Espelhamento sem escala negativa.
 */
export type HandPose = {
  /** flexão dos dedos 0 (aberta) → 1 (punho fechado) */
  curl: number;
  /** flexão extra por dedo [indicador, médio, anelar, mínimo] (somada) */
  fingerBias?: [number, number, number, number];
  /** polegar: 0 aberto → 1 fechado sobre os dedos */
  thumb: number;
  /** abertura lateral dos dedos (rad) */
  spread?: number;
};

const FINGERS = [
  { x: -0.029, z: -0.088, len: [0.042, 0.026, 0.021], r: 0.0099 }, // indicador (lado do polegar)
  { x: -0.0095, z: -0.091, len: [0.046, 0.029, 0.022], r: 0.0103 }, // médio
  { x: 0.0105, z: -0.089, len: [0.043, 0.027, 0.021], r: 0.0098 }, // anelar
  { x: 0.0295, z: -0.083, len: [0.034, 0.021, 0.019], r: 0.0088 }, // mínimo
];

/** Falange: tronco de cone com tampas esféricas (sem estrangulamento nas juntas). */
const Segment: React.FC<{ len: number; r: number; r2?: number; mat: THREE.Material; tip?: boolean }> = ({ len, r, r2, mat, tip }) => {
  const re = r2 ?? r * 0.93;
  return (
    <group>
      <mesh position={[0, 0, -len / 2]} rotation={[Math.PI / 2, 0, 0]} material={mat} castShadow receiveShadow>
        <cylinderGeometry args={[re, r, len, 18, 1, true]} />
      </mesh>
      <mesh material={mat} castShadow>
        <sphereGeometry args={[r * 1.02, 18, 14]} />
      </mesh>
      {tip ? (
        <mesh position={[0, -re * 0.08, -len]} scale={[1, 0.86, 1.15]} material={mat} castShadow>
          <sphereGeometry args={[re, 18, 14]} />
        </mesh>
      ) : null}
    </group>
  );
};

export const GlovedHand: React.FC<{ pose: HandPose; side?: 1 | -1 }> = ({ pose, side = 1 }) => {
  const mat = useMemo(() => {
    const bump = cottonKnit([3, 3]);
    return new THREE.MeshPhysicalMaterial({
      color: "#ece5d6",
      roughness: 0.88,
      bumpMap: bump,
      bumpScale: 2.2,
      sheen: 0.6,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color("#fff6e6"),
    });
  }, []);
  const seamMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ddd5c4", roughness: 0.9 }), []);
  const palmGeo = useMemo(() => new RoundedBoxGeometry(0.08, 0.026, 0.088, 6, 0.0125), []);
  const c = pose.curl;
  const spread = pose.spread ?? 0.04;
  // ângulos de flexão (negativos dobram para a palma, -Y)
  const mcp = -1.5 * c;
  const pip = -1.75 * Math.min(1, c * 1.15);
  const dip = -0.95 * Math.min(1, c * 1.2);

  return (
    <group>
      {/* palma */}
      <mesh geometry={palmGeo} material={mat} position={[0, -0.002, -0.046]} castShadow receiveShadow />
      {/* volume orgânico do dorso e da palma (eminências) */}
      <mesh material={mat} position={[0, 0.002, -0.05]} scale={[0.047, 0.019, 0.055]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>
      <mesh material={mat} position={[-0.026 * side, -0.01, -0.03]} scale={[0.022, 0.016, 0.034]} castShadow>
        <sphereGeometry args={[1, 24, 18]} />
      </mesh>
      {/* nós dos dedos */}
      {FINGERS.map((f, i) => (
        <mesh key={`k${i}`} material={mat} position={[f.x * side, 0.004, f.z + 0.006]} castShadow>
          <sphereGeometry args={[f.r * 1.18, 16, 12]} />
        </mesh>
      ))}
      {/* costuras decorativas no dorso (luva de mordomo) */}
      {[-0.016, 0, 0.016].map((x) => (
        <mesh key={x} position={[x, 0.0205, -0.05]} rotation={[0.05, 0, 0]} material={seamMat}>
          <boxGeometry args={[0.0012, 0.0006, 0.04]} />
        </mesh>
      ))}
      {/* dedos */}
      {FINGERS.map((f, i) => {
        const bias = pose.fingerBias?.[i] ?? 0;
        const k = Math.min(1, 1 + bias / 1.5);
        return (
          <group key={i} position={[f.x * side, 0.001, f.z]} rotation={[mcp * k + bias * 0.2, (i - 1.5) * spread * side, 0]}>
            <Segment len={f.len[0]} r={f.r} r2={f.r * 0.92} mat={mat} />
            <group position={[0, 0, -f.len[0]]} rotation={[pip * k, 0, (i - 1.5) * 0.02 * side]}>
              <Segment len={f.len[1]} r={f.r * 0.93} r2={f.r * 0.86} mat={mat} />
              <group position={[0, 0, -f.len[1]]} rotation={[dip * k, 0, 0]}>
                <Segment len={f.len[2]} r={f.r * 0.86} r2={f.r * 0.78} mat={mat} tip />
              </group>
            </group>
          </group>
        );
      })}
      {/* polegar: base na lateral da palma, gira para dentro e por baixo dos dedos */}
      <group position={[-0.04 * side, -0.008, -0.022]} rotation={[-0.35 - 0.35 * pose.thumb, -(0.75 - 0.55 * pose.thumb) * side, (0.6 + 0.5 * pose.thumb) * side]}>
        <mesh position={[0, 0, -0.012]} rotation={[Math.PI / 2, 0, 0]} material={mat} castShadow>
          <capsuleGeometry args={[0.0135, 0.02, 6, 14]} />
        </mesh>
        <group position={[0, 0, -0.03]} rotation={[-0.5 * pose.thumb, 0, 0]}>
          <Segment len={0.032} r={0.0118} r2={0.0108} mat={mat} />
          <group position={[0, 0, -0.032]} rotation={[-0.9 * pose.thumb, 0, 0]}>
            <Segment len={0.026} r={0.0108} r2={0.0092} mat={mat} tip />
          </group>
        </group>
      </group>
      {/* punho da luva, levemente alargado */}
      <mesh position={[0, -0.001, 0.008]} rotation={[Math.PI / 2, 0, 0]} material={mat} castShadow>
        <cylinderGeometry args={[0.041, 0.035, 0.03, 28, 1, true]} />
      </mesh>
    </group>
  );
};

import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { Bellhop, BellhopPose } from "./Bellhop";
import { Envelope } from "./Envelope";
import {
  darkWood,
  decoWallpaper,
  marbleChecker,
  numberPlate,
  parquet,
  warmGlow,
} from "./textures";

// Cenário único e contínuo: corredor (z de 0 a -L) com a porta 512 no fim, e o quarto 512 atrás dela.
import { DOOR_Z, H, L, W } from "./dims";
export { DOOR_Z, H, L, W };
const DOOR_W = 1.05;
const DOOR_H = 2.25;
const GAP = 0.022; // fresta sob a porta

export type HotelState = {
  /** Deslocamento da porta (batidas), em metros */
  doorKick: number;
  /** Intensidade das arandelas (1 = normal), para o flicker */
  sconce: number;
  /** Posição X da sombra que passa no corredor, atrás da porta (fora = 9) */
  shadowX: number;
  /** Progresso do envelope deslizando (0 = no corredor, 1 = parado dentro do quarto) */
  envelope: number;
  /** Abertura da aba do envelope (0–1) */
  flap: number;
  /** Luz dentro do quarto (0 = breu) */
  roomLight: number;
  /** Luz que vaza pela fresta (0–1) */
  gapLight: number;
  /** Mensageiro no corredor (null = ausente) */
  bellhop?: BellhopPose | null;
};

export const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  roll?: number;
}> = ({ position, target, fov, roll = 0 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...position);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(...target);
  camera.fov = fov;
  camera.near = 0.01;
  camera.far = 80;
  camera.updateProjectionMatrix();
  return null;
};

const Sconce: React.FC<{ x: number; z: number; intensity: number; light: boolean; glow: THREE.Texture }> = ({
  x,
  z,
  intensity,
  light,
  glow,
}) => {
  const side = Math.sign(x);
  return (
    <group position={[x - side * 0.06, 2.05, z]}>
      {/* concha Art Déco */}
      <mesh rotation={[0, (-side * Math.PI) / 2, 0]}>
        <cylinderGeometry args={[0.13, 0.05, 0.32, 16, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#c9a13b" metalness={0.9} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-side * 0.05, 0.05, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color={new THREE.Color(1.0, 0.78, 0.45).multiplyScalar(1.4 * intensity)} toneMapped={false} />
      </mesh>
      <sprite position={[-side * 0.12, 0.08, 0]} scale={[1.1, 1.1, 1]}>
        <spriteMaterial map={glow} transparent opacity={0.55 * intensity} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {light ? <pointLight position={[-side * 0.3, 0, 0]} color="#ffb867" intensity={3.2 * intensity} distance={7} decay={1.6} /> : null}
    </group>
  );
};

export const Hotel: React.FC<{ s: HotelState }> = ({ s }) => {
  const tex = useMemo(
    () => ({
      floor: marbleChecker([W / 1.0, L / 1.0]),
      wall: decoWallpaper([L / 1.2, 1.6]),
      wallEnd: decoWallpaper([W / 1.2, 1.6]),
      wood: darkWood([L / 2, 1]),
      parquet: parquet([3, 3]),
      plate: numberPlate(),
      glow: warmGlow(),
      roomWall: decoWallpaper([4, 1.6]),
    }),
    [],
  );
  const zc = -L / 2;
  const sconceZ = [-2.5, -6.5, -10.5, -14.5, -18.5];
  const envZ = THREE.MathUtils.lerp(DOOR_Z + 0.25, DOOR_Z - 0.78, s.envelope);
  const envRot = THREE.MathUtils.lerp(0, -0.22, s.envelope);

  return (
    <>
      <fogExp2 attach="fog" args={["#05081a", 0.035]} />
      <ambientLight intensity={0.12} color="#5f78c8" />
      <hemisphereLight args={["#22356e", "#0a0a10", 0.25]} />

      {/* ---------------- CORREDOR ---------------- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial map={tex.floor} roughness={0.22} metalness={0.15} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, zc]}>
        <planeGeometry args={[W, L]} />
        <meshStandardMaterial color="#0b0b10" roughness={0.9} />
      </mesh>
      {/* sanca dourada no teto */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * (W / 2 - 0.15), H - 0.02, zc]}>
          <boxGeometry args={[0.03, 0.02, L]} />
          <meshStandardMaterial color="#c9a13b" metalness={1} roughness={0.3} emissive="#3a2a08" />
        </mesh>
      ))}
      {[-1, 1].map((k) => (
        <group key={k}>
          {/* papel de parede */}
          <mesh position={[k * (W / 2), H / 2 + 0.5, zc]} rotation={[0, (-k * Math.PI) / 2, 0]}>
            <planeGeometry args={[L, H - 1]} />
            <meshStandardMaterial map={tex.wall} roughness={0.75} metalness={0.2} />
          </mesh>
          {/* lambri */}
          <mesh position={[k * (W / 2 - 0.01), 0.5, zc]} rotation={[0, (-k * Math.PI) / 2, 0]}>
            <planeGeometry args={[L, 1]} />
            <meshStandardMaterial map={tex.wood} roughness={0.5} />
          </mesh>
          {/* friso dourado */}
          <mesh position={[k * (W / 2 - 0.02), 1.0, zc]}>
            <boxGeometry args={[0.02, 0.025, L]} />
            <meshStandardMaterial color="#c9a13b" metalness={1} roughness={0.25} />
          </mesh>
          {sconceZ.map((z, i) => (
            <Sconce key={z} x={k * (W / 2)} z={z} intensity={i === 2 ? s.sconce : 1} light={i % 2 === 0} glow={tex.glow} />
          ))}
        </group>
      ))}

      {/* parede do fundo com a porta 512 */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * (DOOR_W / 2 + (W / 2 - DOOR_W / 2) / 2 + 0.1), H / 2, DOOR_Z]}>
          <planeGeometry args={[W / 2 - DOOR_W / 2 - 0.2 + 0.2, H]} />
          <meshStandardMaterial map={tex.wallEnd} roughness={0.75} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2 + 0.06, DOOR_Z]}>
        <planeGeometry args={[DOOR_W + 0.4, H - DOOR_H]} />
        <meshStandardMaterial map={tex.wallEnd} roughness={0.75} />
      </mesh>
      {/* batente dourado */}
      {[
        [-(DOOR_W / 2 + 0.06), DOOR_H / 2 + 0.06, 0.08, DOOR_H + 0.12],
        [DOOR_W / 2 + 0.06, DOOR_H / 2 + 0.06, 0.08, DOOR_H + 0.12],
        [0, DOOR_H + 0.1, DOOR_W + 0.2, 0.08],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, DOOR_Z + 0.01]}>
          <boxGeometry args={[w, h, 0.14]} />
          <meshStandardMaterial color="#b8902f" metalness={1} roughness={0.28} />
        </mesh>
      ))}
      {/* luz sobre a porta */}
      <pointLight position={[0, H - 0.25, DOOR_Z + 0.9]} intensity={4} distance={4.5} decay={1.6} color="#ffc27a" />

      {/* PORTA (corredor ↔ quarto) */}
      <group position={[0, 0, DOOR_Z + s.doorKick]}>
        <mesh position={[0, GAP + DOOR_H / 2, 0]}>
          <boxGeometry args={[DOOR_W, DOOR_H, 0.06]} />
          <meshStandardMaterial color="#0d0d12" roughness={0.18} metalness={0.4} />
        </mesh>
        {/* almofadas da porta (ambos os lados) */}
        {[1, -1].map((side) =>
          [
            [0, 1.62, 0.7, 0.75],
            [0, 0.7, 0.7, 0.85],
          ].map(([x, y, w, h], i) => (
            <mesh key={`${side}-${i}`} position={[x, y, side * 0.032]} rotation={[0, side < 0 ? Math.PI : 0, 0]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial color="#14141b" roughness={0.25} metalness={0.5} />
            </mesh>
          )),
        )}
        {/* frisos dourados das almofadas */}
        {[1, -1].map((side) =>
          [
            [0, 1.62, 0.74, 0.79],
            [0, 0.7, 0.74, 0.89],
          ].map(([x, y, w, h], i) => (
            <lineSegments key={`l${side}-${i}`} position={[x, y, side * 0.034]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(w, h)]} />
              <lineBasicMaterial color="#c9a13b" />
            </lineSegments>
          )),
        )}
        {/* placa 512 (lado do corredor) */}
        <mesh position={[0, 1.95 + 0.12, 0.036]}>
          <planeGeometry args={[0.36, 0.18]} />
          <meshStandardMaterial map={tex.plate} metalness={0.5} roughness={0.3} emissive="#ffffff" emissiveMap={tex.plate} emissiveIntensity={0.25} />
        </mesh>
        {/* olho mágico e maçaneta */}
        {[1, -1].map((side) => (
          <group key={side}>
            <mesh position={[0, 1.55, side * 0.035]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.01, 20]} />
              <meshStandardMaterial color="#c9a13b" metalness={1} roughness={0.2} />
            </mesh>
            <mesh position={[0.4, 1.02, side * 0.05]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshStandardMaterial color="#c9a13b" metalness={1} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* fresta de luz sob a porta */}
      <mesh position={[0, GAP / 2, DOOR_Z]}>
        <planeGeometry args={[DOOR_W, GAP]} />
        <meshBasicMaterial color={new THREE.Color(1, 0.68, 0.32).multiplyScalar(0.8 * s.gapLight)} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      {/* sombra que passa no corredor, atrás da fresta */}
      <mesh position={[s.shadowX, GAP / 2, DOOR_Z + 0.01]}>
        <planeGeometry args={[0.35, GAP + 0.01]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
      {/* pool de luz que vaza para dentro do quarto */}
      <pointLight position={[0, 0.02, DOOR_Z - 0.12]} color="#ffb867" intensity={1.0 * s.gapLight} distance={1.4} decay={2} />

      {/* ---------------- QUARTO 512 ---------------- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, DOOR_Z - 3]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial map={tex.parquet} roughness={0.45} metalness={0.1} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={k} position={[k * (DOOR_W / 2 + 1.5), H / 2, DOOR_Z - 0.04]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[3, H]} />
          <meshStandardMaterial map={tex.roomWall} roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, DOOR_H + (H - DOOR_H) / 2 + 0.06, DOOR_Z - 0.04]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[DOOR_W + 0.4, H - DOOR_H]} />
        <meshStandardMaterial map={tex.roomWall} roughness={0.8} />
      </mesh>
      <pointLight position={[0.9, 2.0, DOOR_Z - 1.3]} color="#ffcf91" intensity={2.6 * s.roomLight} distance={5} decay={1.4} />
      <pointLight position={[-1.2, 1.2, DOOR_Z - 2.2]} color="#4a66c4" intensity={1.2 * s.roomLight} distance={5} decay={1.5} />

      {/* ENVELOPE (oculto enquanto está na mão do mensageiro: envelope < 0) */}
      {s.envelope >= 0 ? (
        <group position={[0.02, 0.004, envZ]} rotation={[0, envRot, 0]}>
          <Envelope glow={s.flap} glowTex={tex.glow} />
        </group>
      ) : null}
      {s.bellhop ? <Bellhop pose={s.bellhop} /> : null}
    </>
  );
};

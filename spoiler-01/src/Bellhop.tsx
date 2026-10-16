import React from "react";
import * as THREE from "three";
import { DOOR_Z } from "./dims";
import { Envelope, useGoldEnv } from "./Envelope";

/**
 * Mensageiro de hotel estilizado (anos 20), sem traços de rosto — o mistério se mantém.
 * Modelo voltado para -Z (de frente para a porta 512). Origem nos pés.
 */
export type BellhopPose = {
  /** distância da porta (m) */
  dist: number;
  /** deslocamento vertical (agachar = negativo) */
  y: number;
  /** inclinação do tronco em direção à porta (rad) */
  lean: number;
  /** braço direito: 0 = caído, ~1.57 = esticado para a porta (batida) */
  rArm: number;
  /** braço esquerdo: segura o envelope */
  lArm: number;
  /** giro dos braços para o centro (0–1) */
  rYaw: number;
  lYaw: number;
  /** envelope na mão esquerda */
  holding: boolean;
  /** cabeça: inclinação (rad) */
  head: number;
  /** balanço lateral sutil */
  sway: number;
};

const NAVY = "#152455";
const SKIN = "#3b2a22";
const GLOVE = "#e9e3d6";

const Arm: React.FC<{ x: number; angle: number; yaw: number; env: THREE.Texture; children?: React.ReactNode }> = ({ x, angle, yaw, env, children }) => (
  <group position={[x, 1.39, 0]} rotation={[0, yaw, 0]}>
  <group rotation={[angle, 0, Math.sign(x) * 0.06]}>
    <mesh position={[0, -0.27, 0]}>
      <capsuleGeometry args={[0.052, 0.4, 6, 12]} />
      <meshStandardMaterial color={NAVY} roughness={0.6} metalness={0.1} />
    </mesh>
    {/* punho dourado */}
    <mesh position={[0, -0.52, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.05, 0.012, 8, 20]} />
      <meshStandardMaterial color="#c9a13b" metalness={1} roughness={0.3} envMap={env} />
    </mesh>
    {/* luva (mão fechada) */}
    <mesh position={[0, -0.6, -0.005]} scale={[1, 0.95, 1.15]}>
      <sphereGeometry args={[0.058, 20, 16]} />
      <meshStandardMaterial color={GLOVE} roughness={0.75} emissive="#3d362a" />
    </mesh>
    {/* nós dos dedos (punho fechado) */}
    {[-0.033, -0.011, 0.011, 0.033].map((kx) => (
      <mesh key={kx} position={[kx, -0.645, -0.012]}>
        <sphereGeometry args={[0.02, 12, 10]} />
        <meshStandardMaterial color={GLOVE} roughness={0.75} emissive="#3d362a" />
      </mesh>
    ))}
    {children}
  </group>
  </group>
);

export const Bellhop: React.FC<{ pose: BellhopPose }> = ({ pose }) => {
  const env = useGoldEnv();
  const gold = <meshStandardMaterial color="#d4ad4a" metalness={1} roughness={0.25} envMap={env} envMapIntensity={1.3} />;
  return (
    <group position={[pose.sway, pose.y, DOOR_Z + pose.dist]}>
      {/* pernas */}
      {[-0.1, 0.1].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.43, 0]}>
            <capsuleGeometry args={[0.068, 0.72, 6, 12]} />
            <meshStandardMaterial color="#0b0b10" roughness={0.55} />
          </mesh>
          <mesh position={[x + Math.sign(x) * 0.066, 0.45, 0]}>
            <boxGeometry args={[0.006, 0.7, 0.02]} />
            {gold}
          </mesh>
          <mesh position={[x, 0.03, -0.04]}>
            <boxGeometry args={[0.1, 0.06, 0.24]} />
            <meshStandardMaterial color="#050506" roughness={0.2} metalness={0.3} />
          </mesh>
        </group>
      ))}
      {/* tronco (pivô no quadril) */}
      <group position={[0, 0.85, 0]} rotation={[-pose.lean, 0, 0]}>
        <group position={[0, -0.85, 0]}>
          <mesh position={[0, 1.16, 0]} scale={[1.18, 1, 0.78]}>
            <capsuleGeometry args={[0.19, 0.38, 8, 16]} />
            <meshStandardMaterial color={NAVY} roughness={0.55} metalness={0.12} />
          </mesh>
          {/* duas fileiras de botões dourados */}
          {[-0.075, 0.075].map((x) =>
            [0.98, 1.08, 1.18, 1.28].map((y) => (
              <mesh key={`${x}${y}`} position={[x, y, -0.158]}>
                <sphereGeometry args={[0.014, 10, 8]} />
                {gold}
              </mesh>
            )),
          )}
          {/* dragonas */}
          {[-0.24, 0.24].map((x) => (
            <mesh key={x} position={[x, 1.43, 0]}>
              <boxGeometry args={[0.1, 0.025, 0.13]} />
              {gold}
            </mesh>
          ))}
          {/* gola alta */}
          <mesh position={[0, 1.47, 0]}>
            <cylinderGeometry args={[0.075, 0.09, 0.08, 20]} />
            <meshStandardMaterial color={NAVY} roughness={0.5} />
          </mesh>
          {/* cabeça (sem traços — sempre na sombra) */}
          <group position={[0, 1.6, 0]} rotation={[-pose.head, 0, 0]}>
            <mesh scale={[0.95, 1.08, 1]}>
              <sphereGeometry args={[0.105, 24, 18]} />
              <meshStandardMaterial color={SKIN} roughness={0.8} />
            </mesh>
            {/* quepe pillbox com faixa dourada e jugular */}
            <group position={[0.012, 0.1, 0.005]} rotation={[0.12, 0, -0.14]}>
              <mesh>
                <cylinderGeometry args={[0.092, 0.095, 0.085, 28]} />
                <meshStandardMaterial color={NAVY} roughness={0.45} metalness={0.15} />
              </mesh>
              <mesh position={[0, -0.025, 0]}>
                <cylinderGeometry args={[0.097, 0.097, 0.018, 28]} />
                {gold}
              </mesh>
              <mesh position={[0, 0.043, 0]}>
                <cylinderGeometry args={[0.092, 0.092, 0.004, 28]} />
                <meshStandardMaterial color="#0e1838" roughness={0.4} />
              </mesh>
            </group>
            <mesh position={[0, -0.04, -0.01]} rotation={[0.3, 0, 0]}>
              <torusGeometry args={[0.1, 0.004, 6, 24, Math.PI]} />
              {gold}
            </mesh>
          </group>
          {/* braço direito: batidas */}
          <Arm x={0.245} angle={pose.rArm} yaw={0.47 * pose.rYaw} env={env} />
          {/* braço esquerdo: segura o convite */}
          <Arm x={-0.245} angle={pose.lArm} yaw={-0.42 * pose.lYaw} env={env}>
            {pose.holding ? (
              <group position={[0.02, -0.705, -0.02]} rotation={[Math.PI, 0, 0]}>
                <Envelope />
              </group>
            ) : null}
          </Arm>
        </group>
      </group>
    </group>
  );
};

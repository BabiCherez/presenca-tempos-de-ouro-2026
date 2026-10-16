import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { inviteMaps, sealBump, sealGeometry } from "./invite";

export const ENV_W = 0.3;
export const ENV_H = 0.2;

/** Mapa de reflexo quente para os metais (foil, lacre, botões). Estático. */
export const useGoldEnv = () => {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return tex;
  }, [gl]);
};

/**
 * Envelope-convite. Frente voltada para +Y (deitado). Para segurar na mão, gire o grupo.
 * glow: brilho dourado escapando pela borda (0–1).
 */
export const Envelope: React.FC<{ glow?: number; glowTex?: THREE.Texture }> = ({ glow = 0, glowTex }) => {
  const env = useGoldEnv();
  const maps = useMemo(() => inviteMaps(), []);
  const seal = useMemo(() => ({ geo: sealGeometry(), bump: sealBump() }), []);
  return (
    <group>
      {/* frente com foil dourado */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI]} position={[0, 0.0016, 0]}>
        <planeGeometry args={[ENV_W, ENV_H]} />
        <meshStandardMaterial
          map={maps.map}
          metalnessMap={maps.metalnessMap}
          metalness={1}
          roughnessMap={maps.roughnessMap}
          roughness={1}
          bumpMap={maps.bumpMap}
          bumpScale={0.6}
          envMap={env}
          envMapIntensity={0.42}
        />
      </mesh>
      {/* corpo com bordas douradas (gilded edges) */}
      <mesh>
        <boxGeometry args={[ENV_W + 0.002, 0.003, ENV_H + 0.002]} />
        <meshStandardMaterial color="#c9a13b" metalness={1} roughness={0.25} envMap={env} envMapIntensity={1.2} />
      </mesh>
      {/* lacre de cera dourado, sobre o losango inferior */}
      <mesh geometry={seal.geo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0018, -(ENV_H / 2 - 0.006)]} scale={0.8}>
        <meshStandardMaterial
          color="#b88a2a"
          metalness={0.75}
          roughness={0.32}
          bumpMap={seal.bump}
          bumpScale={3}
          envMap={env}
          envMapIntensity={1.1}
        />
      </mesh>
      {glowTex && glow > 0 ? (
        <>
          <sprite position={[0, 0.01, ENV_H / 2]} scale={[0.5 * glow, 0.1 * glow, 1]}>
            <spriteMaterial map={glowTex} color="#e89a2e" transparent opacity={0.42 * glow} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <pointLight position={[0, 0.04, ENV_H / 2 + 0.02]} color="#ffcf7a" intensity={0.4 * glow} distance={0.6} decay={2} />
        </>
      ) : null}
    </group>
  );
};

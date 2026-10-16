import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React from "react";
import * as THREE from "three";
import { useVideoConfig } from "remotion";
import { GlovedHand } from "./GlovedHand";

const Cam: React.FC = () => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(0.0, 0.06, -0.36);
  camera.lookAt(0, 0, -0.05);
  camera.fov = 40;
  camera.updateProjectionMatrix();
  return null;
};

/** Teste de anatomia da mão (não entra no vídeo). */
export const HandTest: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows style={{ backgroundColor: "#1a1a22" }}>
      <Cam />
      <ambientLight intensity={0.25} />
      <directionalLight position={[0.3, 1, -0.6]} intensity={2.2} castShadow />
      <pointLight position={[-0.4, 0.2, -0.3]} intensity={0.8} color="#ffb867" />
      <group position={[-0.17, 0, 0]} rotation={[0.25, 0.25, 0]}>
        <GlovedHand pose={{ curl: 1, thumb: 1 }} />
      </group>
      <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <GlovedHand pose={{ curl: 0.15, thumb: 0.1 }} />
      </group>
      <group position={[0.17, 0, 0]} rotation={[-1.2, 0, 0.2]}>
        <GlovedHand pose={{ curl: 0.55, thumb: 0.6, fingerBias: [0, 0.1, 0.3, 0.5] }} side={-1} />
      </group>
    </ThreeCanvas>
  );
};

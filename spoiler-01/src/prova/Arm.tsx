import React, { useMemo } from "react";
import * as THREE from "three";
import { GlovedHand, HandPose } from "./GlovedHand";
import { woolColor, woolTwill } from "./materials";

type V3 = [number, number, number];

/** IK de dois ossos: calcula o cotovelo entre ombro e punho, com vetor de polo. */
const solveElbow = (s: THREE.Vector3, w: THREE.Vector3, l1: number, l2: number, pole: THREE.Vector3) => {
  const d = Math.min(s.distanceTo(w), l1 + l2 - 1e-4);
  const dir = w.clone().sub(s).normalize();
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const mid = s.clone().add(dir.clone().multiplyScalar(a));
  const up = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  return mid.add(up.multiplyScalar(h));
};

const Limb: React.FC<{ from: THREE.Vector3; to: THREE.Vector3; r0: number; r1: number; mat: THREE.Material }> = ({
  from,
  to,
  r0,
  r1,
  mat,
}) => {
  const len = from.distanceTo(to);
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return (
    <mesh position={mid} quaternion={q} material={mat} castShadow receiveShadow>
      <cylinderGeometry args={[r1, r0, len, 24, 1, false]} />
    </mesh>
  );
};

export type ArmPose = {
  wrist: V3;
  /** orientação da mão (Euler XYZ, rad) */
  handRot: V3;
  hand: HandPose;
};

/**
 * Braço de mensageiro: manga de lã azul-marinho com galões dourados no punho,
 * punho de camisa branca e mão enluvada na ponta.
 */
export const Arm: React.FC<{
  shoulder: V3;
  pose: ArmPose;
  side: 1 | -1;
  pole: V3;
  env: THREE.Texture;
  children?: React.ReactNode;
}> = ({ shoulder, pose, side, pole, env, children }) => {
  const mats = useMemo(() => {
    const wool = new THREE.MeshPhysicalMaterial({
      map: woolColor([2, 2]),
      bumpMap: woolTwill([6, 6]),
      bumpScale: 1.6,
      roughness: 0.9,
      sheen: 0.18,
      sheenColor: new THREE.Color("#2a3870"),
      sheenRoughness: 0.7,
    });
    const gold = new THREE.MeshStandardMaterial({ color: "#d6ad4c", metalness: 1, roughness: 0.32, envMap: env, envMapIntensity: 1.2 });
    const shirt = new THREE.MeshStandardMaterial({ color: "#efe9dc", roughness: 0.7 });
    return { wool, gold, shirt };
  }, [env]);
  const s = new THREE.Vector3(...shoulder);
  const w = new THREE.Vector3(...pose.wrist);
  const e = solveElbow(s, w, 0.3, 0.27, new THREE.Vector3(...pole));
  const handQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(...pose.handRot));
  // a manga termina um pouco antes do punho da luva
  const dirFw = w.clone().sub(e).normalize();
  const sleeveEnd = w.clone().sub(dirFw.clone().multiplyScalar(0.035));
  const cuffQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirFw);
  return (
    <group>
      <Limb from={s} to={e} r0={0.058} r1={0.05} mat={mats.wool} />
      <mesh position={e} material={mats.wool} castShadow>
        <sphereGeometry args={[0.05, 20, 16]} />
      </mesh>
      <Limb from={e} to={sleeveEnd} r0={0.05} r1={0.047} mat={mats.wool} />
      {/* galões dourados no punho da manga */}
      {[0.012, 0.03].map((o) => (
        <mesh
          key={o}
          position={sleeveEnd.clone().sub(dirFw.clone().multiplyScalar(o))}
          quaternion={cuffQ}
          material={mats.gold}
          castShadow
        >
          <torusGeometry args={[0.048, 0.0035, 8, 32]} />
        </mesh>
      ))}
      {/* punho da camisa aparecendo */}
      <mesh position={sleeveEnd.clone().add(dirFw.clone().multiplyScalar(0.006))} quaternion={cuffQ} material={mats.shirt}>
        <cylinderGeometry args={[0.042, 0.044, 0.012, 24, 1, true]} />
      </mesh>
      <group position={w} quaternion={handQ}>
        <GlovedHand pose={pose.hand} side={side} />
        {children}
      </group>
    </group>
  );
};

import { useThree } from "@react-three/fiber";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useMemo, useState } from "react";
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
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { DOOR_Z } from "../dims";
import { Envelope } from "../Envelope";
import { Fisheye } from "../Fisheye";
import { Hotel, HotelState } from "../Hotel";
import { FilmLook } from "../Overlays";
import { fontsReady } from "../theme";
import { Arm, ArmPose } from "./Arm";
import { warmEnvScene, woolColor, woolTwill } from "./materials";

/*
 * PROVA (rota A) — Plano do olho mágico, 4 s (96 quadros a 24 fps).
 * Ver docs/spoiler-01/ficha-olho-magico.md. Tudo derivado do número do quadro.
 */

export const MB_SAMPLES = 4;
const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CAM_Z = DOOR_Z + 0.04;
const ease = Easing.bezier(0.4, 0, 0.2, 1);

/** Euler a partir de uma base: imagens no mundo dos eixos locais X, Y, Z da mão. */
const basis = (x: THREE.Vector3Tuple, y: THREE.Vector3Tuple, z: THREE.Vector3Tuple): [number, number, number] => {
  const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(...x), new THREE.Vector3(...y), new THREE.Vector3(...z));
  const e = new THREE.Euler().setFromRotationMatrix(m);
  return [e.x, e.y, e.z];
};

// Punho de batida: dorso para a lateral (+X), dedos (nós) para a porta (-Z).
const KNOCK_ROT = basis([0, -1, 0], [1, 0, 0], [0, 0, 1]);
// Mão segurando o convite: dedos para baixo atrás do cartão, palma para a câmera.
const HOLD_ROT = basis([-1, 0, 0], [0, 0, 1], [0, 1, 0]);

/** Mão direita: entra, duas batidas com recuo e contato, sai por baixo. */
const rightArm = (f: number): ArmPose => {
  // distância do nó dos dedos até a lente (m)
  const z = interpolate(
    f,
    [0, 8, 11, 13, 14, 17, 22, 25, 26, 29, 33, 52, 66],
    [0.17, 0.2, 0.23, 0.105, 0.11, 0.17, 0.2, 0.115, 0.12, 0.17, 0.2, 0.2, 0.42],
    { ...C, easing: Easing.bezier(0.45, 0, 0.55, 1) },
  );
  const y = interpolate(f, [0, 8, 52, 66], [1.6, 1.59, 1.6, 1.25], { ...C, easing: ease });
  const x = interpolate(f, [0, 8, 52, 66], [0.0, -0.005, 0.005, 0.3], { ...C, easing: ease });
  // flexão do punho no contato (o punho "quebra" levemente)
  const flex = interpolate(f, [11, 13, 15, 23, 25, 27], [0.18, -0.08, 0.05, 0.16, -0.05, 0.05], C);
  const r = new THREE.Euler(...KNOCK_ROT);
  const q = new THREE.Quaternion().setFromEuler(r).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(flex, 0, 0)));
  const e = new THREE.Euler().setFromQuaternion(q);
  return {
    wrist: [x, y, CAM_Z + z + 0.085],
    handRot: [e.x, e.y, e.z],
    hand: {
      curl: interpolate(f, [0, 54, 64], [1, 1, 0.55], C),
      thumb: interpolate(f, [0, 54, 64], [1, 1, 0.4], C),
      fingerBias: [0, 0.05, 0.1, 0.15],
    },
  };
};

/** Mão esquerda: sobe com o convite, desacelera e segura; respiração. */
const leftArm = (f: number) => {
  const t = interpolate(f, [28, 52], [0, 1], { ...C, easing: Easing.bezier(0.2, 0.7, 0.25, 1) });
  const settle = f > 52 ? Math.sin(((f - 52) / 56) * Math.PI) * 0.004 : 0;
  const breathe = Math.sin(f / 11) * 0.0025;
  const y = THREE.MathUtils.lerp(1.12, 1.725, t) + settle + breathe;
  const z = THREE.MathUtils.lerp(0.58, 0.36, t);
  const x = THREE.MathUtils.lerp(-0.16, -0.008, t);
  const roll = interpolate(f, [28, 52, 108], [0.2, 0.035, 0.015], C) + Math.sin(f / 17) * 0.008;
  const r = new THREE.Euler(...HOLD_ROT);
  const q = new THREE.Quaternion().setFromEuler(r).premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0, roll)));
  const e = new THREE.Euler().setFromQuaternion(q);
  const pose: ArmPose = {
    wrist: [x, y, CAM_Z + z],
    handRot: [e.x, e.y, e.z],
    hand: { curl: 0.1, thumb: 0.95, fingerBias: [0, 0.03, 0.08, 0.14], spread: 0.02 },
  };
  return { pose, roll, t };
};

/** Tronco do mensageiro (lã azul-marinho, botões de latão, galão), sem cabeça visível. */
const Torso: React.FC<{ f: number; env: THREE.Texture }> = ({ f, env }) => {
  const mats = useMemo(
    () => ({
      wool: new THREE.MeshPhysicalMaterial({
        map: woolColor([3, 3]),
        bumpMap: woolTwill([10, 10]),
        bumpScale: 1.6,
        roughness: 0.9,
        sheen: 0.18,
        sheenColor: new THREE.Color("#2a3870"),
        sheenRoughness: 0.7,
      }),
      gold: new THREE.MeshStandardMaterial({ color: "#d6ad4c", metalness: 1, roughness: 0.3, envMap: env, envMapIntensity: 1.3 }),
      skin: new THREE.MeshStandardMaterial({ color: "#b98468", roughness: 0.7 }),
    }),
    [env],
  );
  const breathe = Math.sin(f / 11) * 0.004;
  const z = CAM_Z + 0.7;
  return (
    <group position={[0, breathe, z]}>
      <mesh position={[0, 1.18, 0]} scale={[1.2, 1, 0.75]} material={mats.wool} castShadow receiveShadow>
        <capsuleGeometry args={[0.19, 0.44, 10, 24]} />
      </mesh>
      {/* ombros */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 1.45, 0]} material={mats.wool} castShadow>
          <sphereGeometry args={[0.075, 20, 16]} />
        </mesh>
      ))}
      {/* carcela e botões */}
      <mesh position={[0, 1.18, -0.142]} material={mats.wool}>
        <boxGeometry args={[0.02, 0.5, 0.004]} />
      </mesh>
      {[-0.07, 0.07].map((x) =>
        [1.0, 1.1, 1.2, 1.3].map((y) => (
          <mesh key={`${x}${y}`} position={[x, y, -0.145]} material={mats.gold} castShadow>
            <sphereGeometry args={[0.012, 14, 10]} />
          </mesh>
        )),
      )}
      {/* gola alta com galão */}
      <mesh position={[0, 1.56, 0.0]} material={mats.wool} castShadow>
        <cylinderGeometry args={[0.075, 0.095, 0.1, 24]} />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.gold}>
        <torusGeometry args={[0.087, 0.004, 8, 32]} />
      </mesh>
      {/* cabeça e quepe: ficam atrás do punho e do convite (como na referência) */}
      <mesh position={[0, 1.7, 0]} scale={[0.92, 1.1, 0.98]} material={mats.skin} castShadow>
        <sphereGeometry args={[0.1, 28, 20]} />
      </mesh>
      <group position={[0.01, 1.8, -0.005]} rotation={[0.1, 0, -0.12]}>
        <mesh material={mats.wool} castShadow>
          <cylinderGeometry args={[0.09, 0.093, 0.085, 32]} />
        </mesh>
        <mesh position={[0, -0.026, 0]} material={mats.gold}>
          <cylinderGeometry args={[0.095, 0.095, 0.016, 32]} />
        </mesh>
      </group>
    </group>
  );
};

const Rig: React.FC<{ shake: [number, number] }> = ({ shake }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(shake[0], 1.55 + shake[1], CAM_Z);
  // olhando para o corredor, levemente para baixo; o rosto fica coberto pelo punho e depois pelo convite
  camera.lookAt(shake[0], 1.55 - Math.tan(0.13) * 1, CAM_Z + 1);
  camera.fov = 84;
  camera.near = 0.02;
  camera.far = 60;
  camera.updateProjectionMatrix();
  return null;
};

/** Luz principal com sombra: luminária do teto, à frente da porta. */
const KeyLight: React.FC = () => {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 1.45, CAM_Z + 0.42);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={[0.18, 2.8, CAM_Z + 0.16]}
        target={target}
        angle={0.9}
        penumbra={0.8}
        intensity={30}
        distance={6}
        decay={1.6}
        color="#ffc98a"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-radius={6}
      />
    </>
  );
};

const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [h] = useState(() => delayRender("fontes-prova"));
  useEffect(() => {
    fontsReady.then(() => document.fonts.ready).then(() => {
      setReady(true);
      continueRender(h);
    });
  }, [h]);
  return ready;
};

const WarmEnv: React.FC<{ children: (env: THREE.Texture) => React.ReactNode }> = ({ children }) => {
  const gl = useThree((s) => s.gl);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(warmEnvScene(), 0.02).texture;
    pm.dispose();
    return t;
  }, [gl]);
  return <>{children(env)}</>;
};

const HOTEL: HotelState = {
  doorKick: 0,
  sconce: 1,
  shadowX: 9,
  envelope: -1,
  flap: 0,
  roomLight: 0,
  gapLight: 1,
  bellhop: null,
};

const Frame3D: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const ready = useFontsReady();
  // tremor da porta (câmera) no contato de cada batida
  const hit = (a: number, amp: number) => (f >= a && f < a + 8 ? Math.exp(-(f - a) / 1.8) * amp : 0);
  const k = hit(13, 1) + hit(25, 0.65);
  const shake: [number, number] = [Math.sin(f * 3.1) * 0.0022 * k, Math.cos(f * 2.3) * 0.0018 * k];
  const L = leftArm(f);
  if (!ready) return null;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.45 }}
      style={{ backgroundColor: "#000" }}
    >
      <Rig shake={shake} />
      <Hotel s={HOTEL} />
      <KeyLight />
      <hemisphereLight args={["#2b3a74", "#120d08", 0.35]} />
      <pointLight position={[-0.3, 0.6, CAM_Z + 0.25]} intensity={0.9} distance={2} decay={2} color="#ffb06a" />
      <WarmEnv>
        {(env) => (
          <>
            <Torso f={f} env={env} />
            {f < 68 ? (
              <Arm shoulder={[0.2, 1.45, CAM_Z + 0.7]} pose={rightArm(f)} side={1} pole={[0.8, -1, 0.2]} env={env} />
            ) : (
              <Arm
                shoulder={[0.2, 1.45, CAM_Z + 0.7]}
                pose={{ wrist: [0.27, 1.0, CAM_Z + 0.62], handRot: [0, 0, 0], hand: { curl: 0.35, thumb: 0.3 } }}
                side={1}
                pole={[0.3, -1, 0.5]}
                env={env}
              />
            )}
            <Arm shoulder={[-0.2, 1.45, CAM_Z + 0.7]} pose={L.pose} side={-1} pole={[-0.8, -1, 0.3]} env={env} />
            {/* convite: borda superior entre o polegar (frente) e os dedos (atrás) */}
            <group
              position={[L.pose.wrist[0] + 0.005, L.pose.wrist[1] - 0.045, L.pose.wrist[2] - 0.05]}
              rotation={[-Math.PI / 2 - 0.08, 0, L.roll]}
            >
              <group position={[0, 0, -0.1]}>
                <Envelope envOverride={env} />
              </group>
            </group>
          </>
        )}
      </WarmEnv>
    </ThreeCanvas>
  );
};

export const ProvaOlhoMagico: React.FC = () => {
  const { height } = useVideoConfig();
  const r = height * 0.47;
  const f = useCurrentFrame();
  const flick = random(`lf${Math.floor(f / 3)}`) * 0.04;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Fisheye radius={r} strength={0.4}>
        <CameraMotionBlur samples={MB_SAMPLES} shutterAngle={180}>
          <Frame3D />
        </CameraMotionBlur>
      </Fisheye>
      {/* lente: bordas escurecidas, franja cromática e reflexo no vidro */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${r * 0.58}px, rgba(0,0,0,${0.55 + flick}) ${r * 0.93}px, #000 ${r}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(0,0,0,0) ${r * 0.86}px, rgba(70,110,255,0.16) ${r * 0.95}px, rgba(255,120,60,0.12) ${r * 0.985}px, rgba(0,0,0,0) ${r}px)`,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 22% 9% at 38% 24%, rgba(255,240,215,0.08), rgba(255,240,215,0) 70%)`,
          mixBlendMode: "screen",
        }}
      />
      <FilmLook />
      <Audio name="Áudio provisório da prova" src={staticFile("audio/prova_olho_magico.wav")} />
    </AbsoluteFill>
  );
};

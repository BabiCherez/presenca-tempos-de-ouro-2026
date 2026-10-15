import type React from "react";
import {
  Interactive,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";

type Mode = "flare" | "burst" | "flash" | "fan" | "flicker-in";

/**
 * Transições motivadas (p. 21), posicionadas por quadro sobre o corte:
 *  flare      – 3.3→3.4: 8 quadros de branco com dissolve (4 sobe, 4 desce)
 *  burst      – 3.6→3.7 e 5.4→5.5: exposição sobe em 6 quadros e corta no pico
 *  flash      – 4.2→4.3: 2 quadros brancos e corte seco
 *  fan        – 2.7→2.8: o leque cobre a lente por 4 quadros
 *  flicker-in – 1.1→1.2: fade-in com flicker de projetor
 */
const LightOverlayInner: React.FC<{ readonly mode: Mode }> = ({ mode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  if (mode === "flare") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#FFF6E4",
          opacity: interpolate(frame, [0, 4, 8], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    );
  }
  if (mode === "burst") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 45%, #FFF3D6 0%, #F2C46A 55%, #E8A33D 100%)",
          mixBlendMode: "screen",
          opacity: interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    );
  }
  if (mode === "flash") {
    return <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }} />;
  }
  if (mode === "fan") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#0B1A4F",
          boxShadow: "inset 0 0 220px rgba(201,161,59,0.55)",
        }}
      />
    );
  }
  // flicker-in: preto que se abre com três pulsos irregulares de projetor
  const flick = random(`flicker-${frame}`) > 0.45 ? 0.25 : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0A0A0C",
        opacity: Math.max(0, interpolate(frame, [0, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) - flick),
      }}
    />
  );
};

const lightSchema = {
  mode: {
    type: "enum",
    default: "flare",
    description: "Tipo de transição",
    variants: { flare: {}, burst: {}, flash: {}, fan: {}, "flicker-in": {} },
  },
} as const satisfies InteractivitySchema;

export const LightOverlay = Interactive.withSchema({
  Component: LightOverlayInner,
  componentName: "LightOverlay",
  schema: lightSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});

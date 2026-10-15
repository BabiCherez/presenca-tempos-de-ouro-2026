import type React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/**
 * Grão de película animado (um padrão novo por quadro) + vinheta.
 * Atos 1–2: grão 35 mm visível. Atos 3–6: grão mais fino (p. 5).
 */
export const FilmLook: React.FC<{ readonly past: boolean }> = ({ past }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`grain-${frame}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: past ? 0.42 : 0.22 }}>
        <filter id={`grain-${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency={past ? 0.85 : 1.2} numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${frame})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: past
            ? "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(20,10,0,0.55) 100%)"
            : "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(4,8,30,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

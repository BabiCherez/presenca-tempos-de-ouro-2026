import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BLACK, CHAMPAGNE, DECO, END_DATE, END_TITLE, GOLD, SANS } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Grão de película animado + vinheta, sobre todo o vídeo. */
export const FilmLook: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.32 }}>
        <filter id={`grain${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${frame})`} />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Cartela final: EM BREVE + data provisória da próxima revelação. */
export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const k = width / 1920;
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK, alignItems: "center", justifyContent: "center" }}>
      {/* leque dourado (assinatura discreta da identidade) */}
      <svg
        width={140 * k}
        height={80 * k}
        viewBox="-70 -70 140 80"
        style={{
          position: "absolute",
          top: "30%",
          opacity: interpolate(f, [0.2 * fps, 1 * fps], [0, 1], clamp),
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const a = Math.PI + (i * Math.PI) / 6;
          const len = i === 3 ? 62 : i % 2 ? 44 : 54;
          return (
            <line
              key={i}
              x1={0}
              y1={0}
              x2={Math.cos(a) * len}
              y2={Math.sin(a) * len}
              stroke={GOLD}
              strokeWidth={2.4}
              strokeDasharray={70}
              strokeDashoffset={interpolate(f, [0.2 * fps + i * 2, 0.9 * fps + i * 2], [70, 0], clamp)}
            />
          );
        })}
        <line x1={-70} y1={2} x2={-14} y2={2} stroke={GOLD} strokeWidth={1.5} />
        <line x1={14} y1={2} x2={70} y2={2} stroke={GOLD} strokeWidth={1.5} />
      </svg>
      <div
        style={{
          fontFamily: DECO,
          fontSize: 150 * k,
          letterSpacing: "0.32em",
          color: GOLD,
          paddingLeft: "0.32em",
          clipPath: `inset(-20% ${interpolate(f, [0.6 * fps, 0.6 * fps + 12], [100, 0], { ...clamp, easing: Easing.bezier(0.33, 0, 0.2, 1) })}% -20% 0%)`,
        }}
      >
        {END_TITLE}
      </div>
      <div
        style={{
          position: "absolute",
          top: "64%",
          fontFamily: SANS,
          fontWeight: 300,
          fontSize: 54 * k,
          letterSpacing: "0.5em",
          paddingLeft: "0.5em",
          color: CHAMPAGNE,
          opacity: interpolate(f, [1.6 * fps, 2.2 * fps], [0, 1], clamp),
        }}
      >
        {END_DATE}
      </div>
      <AbsoluteFill
        style={{ backgroundColor: BLACK, opacity: interpolate(f, [3.8 * fps, 4.5 * fps], [0, 1], clamp) }}
      />
    </AbsoluteFill>
  );
};

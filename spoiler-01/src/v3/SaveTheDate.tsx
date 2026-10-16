import React from "react";
import { AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAMPAGNE, GOLD, SANS } from "../theme";

const C = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const out = Easing.bezier(0.16, 1, 0.3, 1);

// Dourado metálico (mesmo tom das peças oficiais) aplicado como gradiente com brilho que passa uma vez
const goldFill = (sweep: number) =>
  `linear-gradient(100deg, #9c7424 0%, #d9b45a 22%, #f6e2a4 ${30 + sweep * 40}%, #c9a13b ${48 + sweep * 40}%, #a07a22 100%)`;

/** Leque Art Déco (motivo do logo/convite). Reservado para outras peças. */
export const Fan: React.FC<{ size: number; progress: number }> = ({ size, progress }) => (
  <svg width={size * 2.4} height={size} viewBox="-120 -60 240 66">
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = Math.PI + ((i + 0.5) * Math.PI) / 7;
      const len = i === 3 ? 56 : i % 2 ? 40 : 48;
      return (
        <line
          key={i}
          x1={0}
          y1={2}
          x2={Math.cos(a) * len}
          y2={Math.sin(a) * len + 2}
          stroke={GOLD}
          strokeWidth={2.2}
          strokeDasharray={60}
          strokeDashoffset={60 - 60 * Math.min(1, Math.max(0, progress * 1.6 - i * 0.08))}
        />
      );
    })}
    <line x1={-120} y1={4} x2={-120 + 100 * progress} y2={4} stroke={GOLD} strokeWidth={1.4} />
    <line x1={120} y1={4} x2={120 - 100 * progress} y2={4} stroke={GOLD} strokeWidth={1.4} />
  </svg>
);

/** Moldura em degraus (cantos zigurate), desenhada progressivamente. */
const Frame: React.FC<{ w: number; h: number; inset: number; step: number; progress: number; width: number; opacity?: number }> = ({
  w,
  h,
  inset,
  step,
  progress,
  width,
  opacity = 1,
}) => {
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const s = step;
  const d = `M ${x0 + 2 * s} ${y0} H ${x1 - 2 * s} V ${y0 + s} H ${x1 - s} V ${y0 + 2 * s} H ${x1} V ${y1 - 2 * s} H ${x1 - s} V ${y1 - s} H ${x1 - 2 * s} V ${y1} H ${x0 + 2 * s} V ${y1 - s} H ${x0 + s} V ${y1 - 2 * s} H ${x0} V ${y0 + 2 * s} H ${x0 + s} V ${y0 + s} H ${x0 + 2 * s} Z`;
  const per = 2 * (w + h);
  return (
    <path d={d} fill="none" stroke={GOLD} strokeWidth={width} opacity={opacity} strokeDasharray={per} strokeDashoffset={per * (1 - progress)} />
  );
};

/**
 * Cartela final — SAVE THE DATE · 05.12.2026, com o logotipo oficial
 * (extraído do arquivo IDENTIDADE_VISUAL.ai, versão horizontal) em dourado.
 * Duração prevista: 3,5 s. Entrada ~1 s; leitura plena ≥ 2,5 s.
 */
export const SaveTheDate: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const frameP = interpolate(f, [0, 0.9 * fps], [0, 1], { ...C, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const logoO = interpolate(f, [0.15 * fps, 0.75 * fps], [0, 1], { ...C, easing: out });
  const logoY = interpolate(f, [0.15 * fps, 0.85 * fps], [14, 0], { ...C, easing: out });
  const sweep = interpolate(f, [0.7 * fps, 2.2 * fps], [-0.6, 1.4], C);
  const fanP = interpolate(f, [0.45 * fps, 1.05 * fps], [0, 1], { ...C, easing: out });
  const stdO = interpolate(f, [0.6 * fps, 1.0 * fps], [0, 1], { ...C, easing: out });
  const dateO = interpolate(f, [0.75 * fps, 1.15 * fps], [0, 1], { ...C, easing: out });
  const k = width / 1920;
  return (
    <AbsoluteFill style={{ backgroundColor: "#070d26", alignItems: "center", justifyContent: "center" }}>
      {/* fundo azul-marinho com vinheta e textura de papel sutil */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #13265f 0%, #0b1a4f 45%, #050a1f 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "overlay" }}>
        <svg width="100%" height="100%">
          <filter id="papel">
            <feTurbulence type="fractalNoise" baseFrequency={0.75} numOctaves={3} seed={7} />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#papel)" />
        </svg>
      </AbsoluteFill>
      {/* moldura em degraus, dupla */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <Frame w={width} h={height} inset={60 * k} step={28 * k} progress={frameP} width={3 * k} />
        <Frame w={width} h={height} inset={84 * k} step={20 * k} progress={frameP} width={1.2 * k} opacity={0.7} />
      </svg>
      {/* partículas de brilho discretas */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {new Array(40).fill(0).map((_, i) => {
          const x = random(`x${i}`) * width;
          const y = ((random(`y${i}`) * height - f * (0.3 + random(`v${i}`) * 0.6) * k) % height + height) % height;
          const o = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(f / 7 + i));
          return <circle key={i} cx={x} cy={y} r={(1 + random(`r${i}`) * 1.6) * k} fill={GOLD} opacity={o * frameP} />;
        })}
      </svg>
      {/* logotipo oficial em dourado (máscara do arquivo original) */}
      <div
        style={{
          width: 980 * k,
          height: (980 * k * 1936) / 4788,
          marginTop: -150 * k,
          opacity: logoO,
          translate: `0px ${logoY * k}px`,
          backgroundImage: goldFill(sweep),
          WebkitMaskImage: `url(${staticFile("brand/logo_presenca_tempos_de_ouro_branco.png")})`,
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskImage: `url(${staticFile("brand/logo_presenca_tempos_de_ouro_branco.png")})`,
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          filter: "drop-shadow(0 0 18px rgba(201,161,59,0.25))",
        }}
      />
      {/* filete fino entre o logo e o texto */}
      <div style={{ position: "absolute", top: 700 * k, width: 420 * k * fanP, height: 1.5 * k, backgroundColor: GOLD, opacity: 0.8 }} />
      <div
        style={{
          position: "absolute",
          top: 735 * k,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 64 * k,
          letterSpacing: "0.32em",
          paddingLeft: "0.32em",
          color: CHAMPAGNE,
          opacity: stdO,
        }}
      >
        SAVE THE DATE
      </div>
      <div
        style={{
          position: "absolute",
          top: 832 * k,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: 76 * k,
          letterSpacing: "0.16em",
          paddingLeft: "0.16em",
          color: GOLD,
          opacity: dateO,
        }}
      >
        05.12.2026
      </div>
    </AbsoluteFill>
  );
};

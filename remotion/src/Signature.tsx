import type React from "react";
import {
  Easing,
  Img,
  Interactive,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { BLACK, CHAMPAGNE, DECO, GOLD, NAVY, SANS } from "./theme";

type SignatureProps = {
  readonly logo: string;
  readonly dateLine: string;
  readonly placeLine: string;
};

/** Revelação em linha de 12 quadros, da esquerda para a direita (p. 21). */
const reveal = (frame: number, start: number) =>
  `inset(-20% ${interpolate(frame, [start, start + 12], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 0, 0.2, 1),
  })}% -20% 0%)`;

/**
 * Plano 6.1 — Moldura Art Déco azul-marinho desenhada em linhas douradas; partículas de ouro;
 * PRESENÇA / TEMPOS DE OURO / 2026 e, abaixo, data, horário e local. Fade lento na saída.
 * `logo`: caminho em public/ do logotipo oficial. Vazio = marca tipográfica provisória.
 */
const SignatureInner: React.FC<SignatureProps> = ({ logo, dateLine, placeLine }) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const vertical = height > width;
  const m = vertical ? 70 : 90;
  const top = vertical ? 250 : 80;
  const bottom = vertical ? height - 400 : height - 80;
  const W = width - 2 * m;
  const H = bottom - top;
  const c = vertical ? 56 : 64; // chanfro dos cantos
  const outline = `M ${m + c} ${top} H ${m + W - c} L ${m + W} ${top + c} V ${bottom - c} L ${m + W - c} ${bottom} H ${m + c} L ${m} ${bottom - c} V ${top + c} Z`;
  const perim = 2 * (W + H);
  // Vertical: proporcional à largura × 1,3 (texto 30% maior, p. 22), com mínimo de 44 px no texto de apoio
  const k = vertical ? 0.74 : 1;
  const support = vertical ? 44 : 40;
  const cy = (top + bottom) / 2;
  const particles = new Array(160).fill(0).map((_, i) => ({
    x: random(`px${i}`) * width,
    y: random(`py${i}`) * height,
    s: 1 + random(`ps${i}`) * 3,
    v: 8 + random(`pv${i}`) * 30,
    ph: random(`pp${i}`) * Math.PI * 2,
  }));

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${NAVY} 0%, #06102F 55%, ${BLACK} 100%)`,
        }}
      />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <path
          d={outline}
          fill="none"
          stroke={GOLD}
          strokeWidth={3}
          strokeDasharray={perim}
          strokeDashoffset={interpolate(frame, [0, 2 * fps], [perim, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          })}
        />
        <rect
          x={m + 18}
          y={top + 18}
          width={W - 36}
          height={H - 36}
          fill="none"
          stroke={GOLD}
          strokeOpacity={0.55}
          strokeWidth={1}
          strokeDasharray={perim}
          strokeDashoffset={interpolate(frame, [12, 2.4 * fps], [perim, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.65, 0, 0.35, 1),
          })}
        />
        {/* Leques nos quatro cantos, motivo do convite */}
        {[
          [m + 18, top + 18, 0],
          [m + W - 18, top + 18, 90],
          [m + W - 18, bottom - 18, 180],
          [m + 18, bottom - 18, 270],
        ].map(([x, y, rot], i) => (
          <g
            key={i}
            transform={`translate(${x} ${y}) rotate(${rot})`}
            opacity={interpolate(frame, [1.8 * fps, 2.4 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
          >
            {[0, 1, 2, 3, 4].map((j) => {
              const a0 = (j * 18 * Math.PI) / 180;
              const a1 = ((j * 18 + 14) * Math.PI) / 180;
              const r = 70;
              return (
                <path
                  key={j}
                  d={`M 0 0 L ${r * Math.cos(a0)} ${r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`}
                  fill="none"
                  stroke={GOLD}
                  strokeWidth={1.2}
                />
              );
            })}
          </g>
        ))}
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={(((p.y - (frame / fps) * p.v) % height) + height) % height}
            r={p.s}
            fill={GOLD}
            opacity={0.25 + 0.6 * (0.5 + 0.5 * Math.sin(frame / 6 + p.ph))}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: m,
          right: m,
          top: cy - 300,
          height: 280,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          clipPath: reveal(frame, 2.1 * fps),
        }}
      >
        {logo ? (
          <Img src={staticFile(logo)} style={{ maxWidth: "70%", maxHeight: "100%", objectFit: "contain" }} />
        ) : (
          <div style={{ fontFamily: DECO, fontSize: 150 * k * (vertical ? 1.12 : 1), letterSpacing: "0.08em", color: GOLD, lineHeight: 1 }}>
            PRESENÇA
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy - 10,
          textAlign: "center",
          fontFamily: DECO,
          fontSize: 78 * k,
          letterSpacing: "0.12em",
          color: CHAMPAGNE,
          clipPath: reveal(frame, 2.65 * fps),
        }}
      >
        TEMPOS DE OURO
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy + 100,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 300,
          fontSize: 58 * k,
          letterSpacing: "0.3em",
          color: GOLD,
          clipPath: reveal(frame, 3.2 * fps),
        }}
      >
        2026
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy + 210,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: support,
          letterSpacing: "0.14em",
          color: CHAMPAGNE,
          clipPath: reveal(frame, 4.0 * fps),
        }}
      >
        {dateLine}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: cy + 270,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: support,
          letterSpacing: "0.14em",
          color: CHAMPAGNE,
          clipPath: reveal(frame, 4.3 * fps),
        }}
      >
        {placeLine}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: BLACK,
          opacity: interpolate(frame, [durationInFrames - 0.8 * fps, durationInFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </>
  );
};

const signatureSchema = {
  logo: { type: "string", default: "", description: "Logotipo oficial (arquivo em public/)" },
  dateLine: { type: "string", default: "11 DE DEZEMBRO · 19H", description: "Data e horário" },
  placeLine: { type: "string", default: "ESPAÇO WOOD — SÃO PAULO", description: "Local" },
} as const satisfies InteractivitySchema;

export const Signature = Interactive.withSchema({
  Component: SignatureInner,
  componentName: "Signature",
  schema: signatureSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});

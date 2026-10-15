import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { BLACK, CHAMPAGNE, GOLD, SANS } from "./theme";

/** Cartela do Ato 5 (texto, sem voz): dourado #C9A13B sobre preto, revelação em linha de 12 quadros. */
const TitleCardInner: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, backgroundColor: BLACK }} />
      <div
        style={{
          position: "absolute",
          left: vertical ? 90 : 240,
          right: vertical ? 90 : 240,
          top: vertical ? 250 : 0,
          bottom: vertical ? 400 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 300,
          fontSize: vertical ? 84 : 66,
          lineHeight: 1.35,
          letterSpacing: "0.06em",
          color: GOLD,
          clipPath: `inset(-10% ${interpolate(frame, [0, 12], [100, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.2, 1),
          })}% -10% 0%)`,
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: "38%",
          bottom: "38%",
          width: 2,
          backgroundColor: CHAMPAGNE,
          boxShadow: `0 0 18px ${GOLD}`,
          left: `${interpolate(frame, [0, 12], [8, 92], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.33, 0, 0.2, 1),
          })}%`,
          opacity: interpolate(frame, [0, 2, 11, 13], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      />
    </>
  );
};

const titleCardSchema = {
  ...Interactive.childrenSchema,
} as const satisfies InteractivitySchema;

export const TitleCard = Interactive.withSchema({
  Component: TitleCardInner,
  componentName: "TitleCard",
  schema: titleCardSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});

import { Video } from "@remotion/media";
import type React from "react";
import {
  Easing,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { FilmLook } from "./FilmLook";

type ShotProps = {
  readonly clip: string;
  readonly past: boolean;
  readonly verticalPan: boolean;
};

/**
 * Um plano do trailer. Hoje `clip` aponta para o clipe provisório do animatic;
 * troque pelo clipe gerado (TDO_<plano>_v<n>.mp4) quando ele for aprovado.
 * A cor de época é aplicada aqui, igual para clipes de qualquer origem.
 */
const ShotInner: React.FC<ShotProps> = ({ clip, past, verticalPan }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const vertical = height > width;
  return (
    <>
      <Video
        name="Clipe"
        src={staticFile(clip)}
        premountFor={fps}
        muted
        objectFit="cover"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectPosition:
            vertical && verticalPan
              ? interpolate(frame, [0, durationInFrames], ["0% 50%", "100% 50%"], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.45, 0, 0.55, 1),
                })
              : "50% 50%",
          // Look Atos 1–2: contraste suave, saturação 80%, sépia leve. Atos 3–6: pretos profundos.
          filter: past
            ? "sepia(0.28) saturate(0.8) contrast(0.9) brightness(1.04)"
            : "contrast(1.12) saturate(1.06) brightness(0.98)",
        }}
      />
      {past ? null : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#0B1A4F",
            mixBlendMode: "soft-light",
            opacity: 0.35,
          }}
        />
      )}
      <FilmLook past={past} />
    </>
  );
};

const shotSchema = {
  clip: { type: "string", default: "clips/TDO_1.2.mp4", description: "Clipe (pasta public/)" },
  past: { type: "boolean", default: true, description: "Look de época (Atos 1–2)" },
  verticalPan: { type: "boolean", default: false, description: "Pan lento no 9:16" },
} as const satisfies InteractivitySchema;

export const Shot = Interactive.withSchema({
  Component: ShotInner,
  componentName: "Shot",
  schema: shotSchema,
  wrapInSequence: true,
  layout: "absolute-fill",
});

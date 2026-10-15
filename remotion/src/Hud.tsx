import type React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { DATA } from "./data/shots";
import { CHAMPAGNE, GOLD, SANS } from "./theme";

const tc = (t: number, fps: number) => {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const fr = Math.round((t - Math.floor(t)) * fps);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(fr).padStart(2, "0")}`;
};

/** Camada de controle do ANIMATIC: plano, tempo, ação, câmera, ref. e narração. Nunca entra no vídeo final. */
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const shot = DATA.shots.find((s) => t >= s.t0 && t < s.t1) ?? DATA.shots[DATA.shots.length - 1];
  const act = shot.id.split(".")[0] as keyof typeof DATA.acts;
  const vo = DATA.vo.find((v) => t >= v.t0 && t <= v.t1 + 0.6);
  const k = width / 1920;
  const vertical = height > width;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: `${14 * k}px ${24 * k}px`,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          justifyContent: "space-between",
          fontSize: (vertical ? 30 : 28) * k,
          fontWeight: 600,
        }}
      >
        <span style={{ color: GOLD }}>ATO {act} — {DATA.acts[act].toUpperCase()}</span>
        <span style={{ color: CHAMPAGNE }}>
          PLANO {shot.id} · {tc(shot.t0, fps)}–{tc(shot.t1, fps)}
        </span>
      </div>
      {vo ? (
        <div
          style={{
            position: "absolute",
            left: 60 * k,
            right: 60 * k,
            bottom: (vertical ? 420 : 170) * k,
            textAlign: "center",
            color: "white",
            fontSize: (vertical ? 44 : 34) * k,
            textShadow: "0 0 6px black, 0 0 2px black",
          }}
        >
          VO: “{vo.text}”
        </div>
      ) : null}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: `${14 * k}px ${24 * k}px`,
          background: "rgba(0,0,0,0.65)",
          color: CHAMPAGNE,
          fontSize: (vertical ? 30 : 24) * k,
          lineHeight: 1.35,
        }}
      >
        <div style={{ color: GOLD }}>
          {shot.frame} · Câmera: {shot.camera} · Ref.: {shot.ref}
        </div>
        <div>{shot.action}</div>
        <div style={{ textAlign: "right", opacity: 0.75, fontSize: 20 * k }}>TC {tc(t, fps)} · ANIMATIC — não é o vídeo final</div>
      </div>
    </AbsoluteFill>
  );
};

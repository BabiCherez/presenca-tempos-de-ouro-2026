import "./theme";
import { Composition, Folder } from "remotion";
import { Signature } from "./Signature";
import { TitleCard } from "./TitleCard";
import { Trailer } from "./Trailer";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Trailer">
        <Composition
          id="Trailer-16x9"
          component={Trailer}
          durationInFrames={2880}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ showHud: false, logo: "" }}
        />
        <Composition
          id="Trailer-9x16"
          component={Trailer}
          durationInFrames={2880}
          fps={24}
          width={1080}
          height={1920}
          defaultProps={{ showHud: false, logo: "" }}
        />
        <Composition
          id="Animatic-16x9"
          component={Trailer}
          durationInFrames={2880}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ showHud: true, logo: "" }}
        />
      </Folder>
      <Folder name="Cenas">
        <Composition
          id="Assinatura"
          component={Signature}
          durationInFrames={168}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ logo: "", dateLine: "11 DE DEZEMBRO · 19H", placeLine: "ESPAÇO WOOD — SÃO PAULO" }}
        />
        <Composition
          id="Assinatura-9x16"
          component={Signature}
          durationInFrames={168}
          fps={24}
          width={1080}
          height={1920}
          defaultProps={{ logo: "", dateLine: "11 DE DEZEMBRO · 19H", placeLine: "ESPAÇO WOOD — SÃO PAULO" }}
        />
        <Composition
          id="Cartela"
          component={TitleCard}
          durationInFrames={38}
          fps={24}
          width={1920}
          height={1080}
          defaultProps={{ children: "E QUANDO VOCÊ ACHAR QUE A NOITE NÃO PODE FICAR MELHOR…" }}
        />
      </Folder>
    </>
  );
};

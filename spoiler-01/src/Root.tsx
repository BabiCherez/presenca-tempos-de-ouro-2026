import "./theme";
import { Composition, Still } from "remotion";
import { Spoiler } from "./Spoiler";
import { HandTest } from "./prova/HandTest";
import { ProvaConviteChao } from "./prova/ProvaConviteChao";
import { ProvaOlhoMagico } from "./prova/ProvaOlhoMagico";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Spoiler01" component={Spoiler} durationInFrames={720} fps={24} width={1920} height={1080} />
      <Composition id="ProvaOlhoMagico" component={ProvaOlhoMagico} durationInFrames={108} fps={24} width={1920} height={1080} />
      <Still id="ProvaConviteChao" component={ProvaConviteChao} width={1920} height={1080} />
      <Still id="TesteMao" component={HandTest} width={1600} height={900} />
    </>
  );
};

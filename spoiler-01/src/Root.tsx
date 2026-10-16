import "./theme";
import { Composition, Still } from "remotion";
import { Spoiler } from "./Spoiler";
import { HandTest } from "./prova/HandTest";
import { ProvaConviteChao } from "./prova/ProvaConviteChao";
import { ProvaOlhoMagico } from "./prova/ProvaOlhoMagico";
import { SaveTheDate } from "./v3/SaveTheDate";
import { SpoilerV3 } from "./v3/SpoilerV3";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Spoiler01" component={Spoiler} durationInFrames={720} fps={24} width={1920} height={1080} />
      <Composition id="Spoiler01v3" component={SpoilerV3} durationInFrames={348} fps={24} width={1920} height={1080} />
      <Composition id="SaveTheDate" component={SaveTheDate} durationInFrames={84} fps={24} width={1920} height={1080} />
      <Composition id="ProvaOlhoMagico" component={ProvaOlhoMagico} durationInFrames={108} fps={24} width={1920} height={1080} />
      <Still id="ProvaConviteChao" component={ProvaConviteChao} width={1920} height={1080} />
      <Still id="TesteMao" component={HandTest} width={1600} height={900} />
    </>
  );
};

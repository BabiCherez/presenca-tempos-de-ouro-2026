import "./theme";
import { Composition } from "remotion";
import { Spoiler } from "./Spoiler";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="Spoiler01" component={Spoiler} durationInFrames={720} fps={24} width={1920} height={1080} />
  );
};

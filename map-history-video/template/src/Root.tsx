import React from "react";
import { Composition, Still, continueRender, delayRender } from "remotion";
import { HistoryVideo, totalFrames } from "./Video";
import { Thumbnail } from "./Thumbnail";
import { Short, SW, SH, shortFrames } from "./Short";
import { VShort, vshortFrames } from "./VShort";
import { W, H, FPS } from "./lib/anim";

// Hold rendering until the custom fonts are loaded, so no frame uses a fallback font.
if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all([document.fonts.load('bold 52px "Comic Relief"'), document.fonts.load('110px "Anton"'), document.fonts.load('52px "Patrick Hand"')])
    .catch((e) => console.warn("Font load failed", e))
    .finally(() => continueRender(handle));
}

export const Root: React.FC = () => (
  <>
    <Composition id="HistoryVideo" component={HistoryVideo} durationInFrames={Math.max(1, totalFrames(FPS))} fps={FPS} width={W} height={H} />
    <Composition id="Short" component={Short as any} durationInFrames={1} fps={FPS} width={SW} height={SH} defaultProps={{ id: "bangladesh" }}
      calculateMetadata={({ props }: any) => ({ durationInFrames: shortFrames(props.id, FPS) })} />
    <Composition id="VShort" component={VShort as any} durationInFrames={1} fps={FPS} width={SW} height={SH} defaultProps={{ id: "pk-v1" }}
      calculateMetadata={({ props }: any) => ({ durationInFrames: vshortFrames(props.id, FPS) })} />
    <Still id="Thumbnail" component={Thumbnail} width={W} height={H} />
  </>
);

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { MapScene } from "./scenes/MapScene";
import { RoomScene } from "./scenes/RoomScene";
import { InfoScene, ImageScene, QuestionsScene, QuoteScene } from "./scenes/Cards";
import { Captions } from "./components/Overlays";
import { DateTag, KeywordLabels, Guide } from "./components/Chrome";
import { BOLD, W, H, ease, prog, cueTime } from "./lib/anim";
import { resolveShots, ResolvedShot } from "./lib/shots";
import timeline from "./timeline.json";

export type Scene = any & { duration: number; words: { w: string; start: number; end: number }[]; audio: string | null };
const TL: any = timeline;

const TitleCard: React.FC<{ text: string }> = ({ text }) => {
  const t = useCurrentFrame() / useVideoConfig().fps;
  const e = ease(prog(t, 0.1, 0.8));
  // wrap long titles into lines of ~22 characters so they stay on screen
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + word).length <= 22) lines[lines.length - 1] = last + " " + word;
    else lines.push(word);
  }
  const size = 110, gap = size * 1.1;
  const y0 = H / 2 + size * 0.35 - ((lines.length - 1) * gap) / 2;
  return (
    <svg width={W} height={H}><rect width={W} height={H} fill="#111" />
      <text textAnchor="middle" fontFamily={BOLD} fontSize={size} fill="#fff" opacity={e}>
        {lines.map((l, i) => <tspan key={i} x={W / 2} y={y0 + i * gap}>{l}</tspan>)}
      </text>
    </svg>
  );
};

/** One visual inside a scene. Runs on its own clock (frame 0 = when its cue word is spoken). */
/** crossfade length between shots, in frames */
const XF = 10;

const ShotView: React.FC<{ s: ResolvedShot; idx: string; first: boolean }> = ({ s, idx, first }) => {
  const frame = useCurrentFrame();
  const t = frame / useVideoConfig().fps;
  const len = s.end - s.start;
  const p = { ...s, duration: len, idx };
  const fadeIn = first ? 1 : interpolate(frame, [0, XF], [0, 1], { extrapolateRight: "clamp" });
  const showGuide = s.guide ?? (s.type === "map" && TL.guide !== false);
  const guideMood = typeof s.guide === "string" ? s.guide : s.guideMood;
  const fps = useVideoConfig().fps;
  // a soft "pop" whenever a keyword label appears
  const pops = (s.labels ?? []).map((l: any) => l.at ?? cueTime(s.words, l.cue, -1)).filter((x: number) => x >= 0);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      {!first && <Audio src={staticFile("sfx/whoosh.wav")} volume={0.16} />}
      {pops.map((a: number, i: number) => (
        <Sequence key={`pop${i}`} from={Math.round(a * fps)} durationInFrames={10}><Audio src={staticFile("sfx/pop.wav")} volume={0.22} /></Sequence>
      ))}
      {s.type === "map" && <MapScene {...(p as any)} />}
      {s.type === "room" && <RoomScene {...(p as any)} />}
      {s.type === "info" && <InfoScene {...p} />}
      {s.type === "image" && <ImageScene {...p} />}
      {s.type === "questions" && <QuestionsScene {...p} />}
      {s.type === "quote" && <QuoteScene {...p} />}
      {s.type === "title" && <TitleCard text={s.text} />}
      <AbsoluteFill><svg width={W} height={H}>
        {showGuide && <Guide t={t} mood={guideMood} side={s.guideSide} />}
        {s.labels && <KeywordLabels labels={s.labels} words={s.words} t={t} />}
        {s.date && s.type !== "title" && <DateTag text={s.date} t={first ? t : t + 1} />}
      </svg></AbsoluteFill>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: Scene; idx: number }> = ({ s, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dip = interpolate(frame, [0, 4], [0.85, 0], { extrapolateRight: "clamp" });
  const shots = resolveShots(s);
  return (
    <AbsoluteFill>
      {shots.map((sh, i) => {
        // each shot runs XF frames into the next one, which fades in on top: a real crossfade
        const from = Math.round(sh.start * fps), len = Math.max(1, Math.round(sh.end * fps) - from) + (i < shots.length - 1 ? XF : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={len}>
            <ShotView s={sh} idx={`${idx}-${i}`} first={i === 0} />
          </Sequence>
        );
      })}
      <AbsoluteFill><svg width={W} height={H}>
        {TL.captions && s.type !== "title" && <Captions words={s.words} t={t} />}
        {idx > 0 && <rect width={W} height={H} fill="#000" opacity={dip} />}
      </svg></AbsoluteFill>
      {s.audio && <Audio src={staticFile(s.audio)} />}
      {s.type === "title" ? <Audio src={staticFile("sfx/hit.wav")} volume={0.45} />
        : idx > 0 && <Audio src={staticFile("sfx/whoosh.wav")} volume={0.2} />}
    </AbsoluteFill>
  );
};

export const HistoryVideo: React.FC = () => {
  const { fps } = useVideoConfig();
  let from = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {(TL.scenes as Scene[]).map((s, i) => {
        const len = Math.round(s.duration * fps);
        const el = <Sequence key={i} from={from} durationInFrames={len}><SceneView s={s} idx={i} /></Sequence>;
        from += len;
        return el;
      })}
    </AbsoluteFill>
  );
};

export const totalFrames = (fps: number) =>
  (TL.scenes as Scene[]).reduce((a, s) => a + Math.round(s.duration * fps), 0);

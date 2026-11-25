import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import brand from "./brand.json";
import { BOLD, HAND, backOut, clamp01 } from "./lib/anim";
import shorts from "./shorts.json";

/**
 * Vertical 1080x1920 YouTube Short cut from a finished episode:
 * blurred backdrop, hook title on top, the episode (cropped to fit) in the middle,
 * big captions under it and a "full video" call-to-action at the end.
 *   node scripts/shorts.mjs && npx remotion render Short out/short-<id>.mp4 --props='{"id":"<id>"}'
 */
export const SW = 1080, SH = 1920;
type Cfg = { cta?: string[]; video: string; segments: [number, number][]; title: string[]; duration: number; captions: { a: number; z: number; text: string }[] };
const ALL = shorts as unknown as Record<string, Cfg>;
export const shortFrames = (id: string, fps: number) => Math.round((ALL[id]?.duration ?? 1) * fps);

const VW = 1404, VH = 790, VY = 560; // episode scaled 1.3x then cropped to the 1080 width

const Clip: React.FC<{ src: string; from: number; frames: number; blur?: boolean }> = ({ src, from, frames, blur }) => {
  const { fps } = useVideoConfig();
  const fade = (f: number) => Math.min(1, f / 3, (frames - f) / 3);
  return blur ? (
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * fps)} muted
      style={{ position: "absolute", height: SH, width: (SH * 16) / 9, left: (SW - (SH * 16) / 9) / 2, top: 0, filter: "blur(28px) brightness(0.45)" }} />
  ) : (
    <OffthreadVideo src={staticFile(src)} startFrom={Math.round(from * fps)} volume={fade}
      style={{ position: "absolute", width: VW, height: VH, left: (SW - VW) / 2, top: 0 }} />
  );
};

/** red SUBSCRIBE pill that pops in, gets tapped by a hand and turns into SUBSCRIBED + bell */
export const Subscribe: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const pop = backOut(clamp01(f / 9)) * (1 - clamp01((f - (durationInFrames - 8)) / 8));
  const tap = Math.round(1.3 * fps), done = f >= tap;
  const hand = clamp01((f - 10) / 14), press = done ? 1 - clamp01((f - tap) / 5) * 0.06 : 1;
  return (
    <div style={{ position: "absolute", top: 1745, width: SW, display: "flex", justifyContent: "center", transform: `scale(${pop * (f >= tap && f < tap + 5 ? 0.94 : 1)})` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: done ? "#3a3a3a" : "#e62117", borderRadius: 60, padding: "18px 46px",
        fontFamily: BOLD, fontSize: 64, letterSpacing: 2, color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", border: "4px solid #fff" }}>
        <span>{done ? "SUBSCRIBED" : "SUBSCRIBE"}</span>
        {done && <span style={{ fontSize: 58, transform: `rotate(${Math.sin((f - tap) / 2.5) * 18 * (1 - clamp01((f - tap) / 30))}deg)` }}>🔔</span>}
      </div>
      <div style={{ position: "absolute", left: SW / 2 + 150 + (1 - hand) * 260, top: 40 + (1 - hand) * 160, fontSize: 110, opacity: hand * pop, transform: `scale(${press})` }}>👆</div>
    </div>
  );
};

export const Short: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c = ALL[id];
  const t = frame / fps;
  let off = 0;
  const seqs = c.segments.map(([a, b]) => { const s = { a, from: Math.round(off * fps), frames: Math.round((b - a) * fps) }; off += b - a; return s; });
  const cap = c.captions.find((q) => t >= q.a && t < q.z + 0.15);
  const capIn = cap ? backOut(clamp01((t - cap.a) / 0.18)) : 0;
  const ctaIn = clamp01((frame - (durationInFrames - 3.5 * fps)) / 10);
  const titleIn = backOut(clamp01(frame / 12));

  return (
    <AbsoluteFill style={{ background: "#0b1626", overflow: "hidden" }}>
      {seqs.map((s, i) => <Sequence key={"b" + i} from={s.from} durationInFrames={s.frames}><Clip src={c.video} from={s.a} frames={s.frames} blur /></Sequence>)}

      {/* hook title */}
      <div style={{ position: "absolute", top: 150, width: SW, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, transform: `scale(${titleIn})` }}>
        {c.title.map((l, i) => (
          <div key={i} style={{ fontFamily: BOLD, fontSize: 104, lineHeight: 1.05, color: i === 1 ? "#ffd400" : "#fff", background: "#111", border: "5px solid #fff", padding: "6px 34px", letterSpacing: 2 }}>{l}</div>
        ))}
      </div>

      {/* the episode */}
      <div style={{ position: "absolute", top: VY, left: 0, width: SW, height: VH, overflow: "hidden", boxShadow: "0 0 0 6px #fff, 0 20px 60px rgba(0,0,0,0.6)" }}>
        {seqs.map((s, i) => <Sequence key={"v" + i} from={s.from} durationInFrames={s.frames}><Clip src={c.video} from={s.a} frames={s.frames} /></Sequence>)}
      </div>

      {/* captions */}
      {cap && (
        <div style={{ position: "absolute", top: VY + VH + 70, width: SW, padding: "0 60px", boxSizing: "border-box", textAlign: "center",
          fontFamily: HAND, fontSize: 92, lineHeight: 1.1, color: "#fff", WebkitTextStroke: "3px #000", paintOrder: "stroke fill",
          textShadow: "0 6px 0 #000", transform: `scale(${0.85 + 0.15 * capIn})`, opacity: capIn }}>{cap.text}</div>
      )}

      {/* animated subscribe button: once around the middle, again at the end */}
      {[Math.round(durationInFrames * 0.4), durationInFrames - Math.round(3.5 * fps)].map((at, i) => (
        <Sequence key={"s" + i} from={at} durationInFrames={Math.round(3.2 * fps)}><Subscribe /></Sequence>
      ))}

      {/* channel name, then a big "watch the full video" card over the last 3.5 s */}
      {ctaIn < 0.5 && (
        <div style={{ position: "absolute", bottom: 200, width: SW, textAlign: "center", fontFamily: BOLD, letterSpacing: 2, fontSize: 44, color: "rgba(255,255,255,0.75)" }}>{brand.channel.toUpperCase()}</div>
      )}
      {ctaIn > 0 && (
        <div style={{ position: "absolute", top: VY + 120, left: 70, width: SW - 140, padding: "40px 30px", boxSizing: "border-box", textAlign: "center",
          background: "#111", border: "6px solid #ffd400", borderRadius: 26, boxShadow: "0 20px 60px rgba(0,0,0,0.7)", transform: `scale(${backOut(ctaIn)})` }}>
          <div style={{ fontFamily: BOLD, fontSize: 96, color: "#ffd400", lineHeight: 1.05 }}>{(c.cta ?? ["▶ WATCH THE", "FULL VIDEO"]).slice(0, 2).map((l, i) => <div key={i}>{l}</div>)}</div>
          <div style={{ fontFamily: HAND, fontSize: 52, color: "#fff", marginTop: 18 }}>{c.cta?.[2] ?? `on ${brand.channel}`}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

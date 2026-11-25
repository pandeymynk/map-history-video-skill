import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import brand from "./brand.json";
import { BOLD, HAND, backOut, clamp01, ease, prog, cueTime, Word } from "./lib/anim";
import { resolveShots, ResolvedShot } from "./lib/shots";
import { MapScene } from "./scenes/MapScene";
import { Subscribe } from "./Short";
import vshorts from "./vshorts.json";

/**
 * Native vertical Short (1080x1920), built from its own narrated script instead of a cropped episode clip:
 * full-screen real photos, big animated graphics (stats, versus bars, icon grids, step lists), vertical maps
 * and word-by-word captions.  Data: src/vshorts.json  { id: { title: [a, b], scenes: [...] } }
 *   npx remotion render VShort out/vshort-<id>.mp4 --props='{"id":"<id>"}'
 *
 * Shot types:  photo {src, caption?, sub?, move?, focus?, old?}
 *              map   {focus, highlight?, color?, markers?, routes?, margin?, mapScale?, mapX?}
 *              stat  {value, count?, prefix?, suffix?, decimals?, label, sub?, color?, bg?}
 *              vs    {title, unit?, left:{name,value,num,color}, right:{...}, bg?}
 *              bars  {title, items:[{label, pct, text}], color?, bg?}
 *              icons {icon, n, of?, label, sub?, bg?}
 *              steps {title?, items:[{text, cue}], bg?}
 *              text  {text, by?, bg?}
 */
const VW = 1080, VH = 1920;
type Cfg = { title: string[]; scenes: any[] };
const ALL = vshorts as unknown as Record<string, Cfg>;
const total = (c: Cfg) => c.scenes.reduce((a, s) => a + s.duration, 0);
const TAIL = 2.6; // seconds after the narration for the "full story" card
export const vshortFrames = (id: string, fps: number) => Math.round(((ALL[id] && total(ALL[id]) + TAIL) || 1) * fps);

const useT = () => useCurrentFrame() / useVideoConfig().fps;
const stroke = { WebkitTextStroke: "4px #000", paintOrder: "stroke fill" as any, textShadow: "0 8px 0 rgba(0,0,0,0.85)" };

/** darkened, slowly zooming real photo behind a graphic */
const Backdrop: React.FC<{ src?: string; dim?: number }> = ({ src, dim = 0.62 }) => {
  const t = useT();
  return (
    <AbsoluteFill style={{ background: "#0b1626", overflow: "hidden" }}>
      {src && <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: VW, height: VH, objectFit: "cover",
        transform: `scale(${1.08 + 0.004 * t})`, filter: `blur(6px) brightness(${1 - dim}) saturate(1.1)` }} />}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

const Photo: React.FC<any> = ({ src, caption, sub, move = "in", focus = [0.5, 0.45], old, fit, duration = 4 }) => {
  const t = useT();
  const k = ease(prog(t, 0, Math.max(3, duration + 0.3)));
  const z = move === "out" ? 1.22 - 0.12 * k : 1.06 + 0.14 * k;
  const dx = move === "left" ? -70 * k : move === "right" ? 70 * k : 0;
  const capIn = backOut(prog(t, 0.35, 0.8));
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: -40, width: VW + 80, height: VH + 80, objectFit: "cover", filter: "blur(30px) brightness(0.45)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px) scale(${z})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` }}>
        <Img src={staticFile(src)} style={{ width: VW, height: VH, objectFit: fit === "contain" ? "contain" : "cover", objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
          filter: old ? "grayscale(1) sepia(0.3) contrast(1.15)" : "contrast(1.07) saturate(1.12)" }} />
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.7) 100%)" }} />
      {caption && (
        <div style={{ position: "absolute", left: 60, top: 1120, transform: `scale(${capIn})`, transformOrigin: "0 50%", display: "flex" }}>
          <div style={{ width: 14, background: "#ffd400" }} />
          <div style={{ background: "rgba(10,10,10,0.88)", padding: "14px 30px 16px 24px" }}>
            <div style={{ fontFamily: BOLD, fontSize: 62, color: "#fff", letterSpacing: 1.5, lineHeight: 1.05 }}>{caption}</div>
            {sub && <div style={{ fontFamily: HAND, fontSize: 40, color: "#ffd400", marginTop: 4 }}>{sub}</div>}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const VMap: React.FC<any> = (p) => {
  // full-height map by default; with mapScale < 1.78 it becomes a framed map card over a real photo
  const full = VH / 1080, sc = p.mapScale ?? full, x = p.mapX ?? 0.5;
  const card = sc < full - 0.01, h = Math.min(VH, 1080 * sc), top = card ? 250 : 0;
  return (
    <AbsoluteFill style={{ background: "#0b2a55", overflow: "hidden" }}>
      {card && <Backdrop src={p.bg} dim={0.6} />}
      <div style={{ position: "absolute", left: 0, top, width: VW, height: h, overflow: "hidden", boxShadow: card ? "0 0 0 6px #fff, 0 20px 60px rgba(0,0,0,0.6)" : undefined }}>
        <div style={{ position: "absolute", left: VW / 2 - 1920 * sc * x, top: 0, width: 1920, height: 1080, transform: `scale(${sc})`, transformOrigin: "0 0" }}>
          <MapScene {...p} />
        </div>
      </div>
      {!card && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.6) 100%)" }} />}
      {p.caption && <Tag text={p.caption} y={card ? top + h - 130 : 1130} />}
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string; y: number; color?: string }> = ({ text, y, color = "#ffd400" }) => {
  const k = backOut(prog(useT(), 0.3, 0.7));
  return (
    <div style={{ position: "absolute", top: y, width: VW, display: "flex", justifyContent: "center", transform: `scale(${k})` }}>
      <div style={{ fontFamily: BOLD, fontSize: 70, background: color, color: "#000", padding: "6px 34px", border: "5px solid #000", letterSpacing: 2 }}>{text}</div>
    </div>
  );
};

const fmt = (v: number, d = 0) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const Stat: React.FC<any> = ({ value, count, prefix = "", suffix = "", decimals = 0, label, sub, color = "#ffd400", bg }) => {
  const t = useT();
  const k = ease(prog(t, 0.15, 1.3));
  const pop = backOut(prog(t, 0, 0.45));
  const shown = count != null ? `${prefix}${fmt(count * k, decimals)}${suffix}` : value;
  return (
    <AbsoluteFill>
      <Backdrop src={bg} />
      <div style={{ position: "absolute", top: 560, width: VW, textAlign: "center", transform: `scale(${pop})` }}>
        <div style={{ fontFamily: BOLD, fontSize: count != null && shown.length > 6 ? 230 : 290, lineHeight: 1, color, ...stroke }}>{shown}</div>
        <div style={{ fontFamily: BOLD, fontSize: 84, color: "#fff", marginTop: 28, letterSpacing: 2, padding: "0 60px", ...stroke }}>{label}</div>
        {sub && <div style={{ fontFamily: HAND, fontSize: 46, color: "rgba(255,255,255,0.85)", marginTop: 14 }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Versus: React.FC<any> = ({ title, unit, left, right, bg }) => {
  const t = useT();
  const max = Math.max(left.num, right.num);
  const Bar: React.FC<{ d: any; i: number }> = ({ d, i }) => {
    const g = ease(prog(t, 0.3 + i * 0.5, 1.2 + i * 0.5));
    const h = 500 * (d.num / max) * g;
    return (
      <div style={{ width: 340, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 900 }}>
        <div style={{ fontFamily: BOLD, fontSize: 96, color: "#fff", opacity: clamp01(g * 2), marginBottom: 14, ...stroke }}>{d.value}</div>
        <div style={{ width: 250, height: h, background: d.color, border: "6px solid #fff", borderBottom: "none", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }} />
        <div style={{ width: 340, height: 8, background: "#fff" }} />
        <div style={{ fontFamily: BOLD, fontSize: 72, color: "#fff", marginTop: 16, ...stroke }}>{d.name}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      <Backdrop src={bg} dim={0.7} />
      <div style={{ position: "absolute", top: 330, width: VW, textAlign: "center", fontFamily: BOLD, fontSize: 76, color: "#ffd400", letterSpacing: 2, ...stroke,
        transform: `scale(${backOut(prog(t, 0, 0.4))})` }}>{title}</div>
      {unit && <div style={{ position: "absolute", top: 430, width: VW, textAlign: "center", fontFamily: HAND, fontSize: 44, color: "#ddd" }}>{unit}</div>}
      <div style={{ position: "absolute", top: 400, left: 0, width: VW, display: "flex", justifyContent: "center", gap: 80 }}>
        <Bar d={left} i={0} /><Bar d={right} i={1} />
      </div>
    </AbsoluteFill>
  );
};

const Bars: React.FC<any> = ({ title, items, color = "#e11d1d", bg }) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Backdrop src={bg} dim={0.72} />
      <div style={{ position: "absolute", top: 380, width: VW, textAlign: "center", fontFamily: BOLD, fontSize: 76, color: "#ffd400", ...stroke }}>{title}</div>
      <div style={{ position: "absolute", top: 560, left: 80, width: VW - 160 }}>
        {items.map((it: any, i: number) => {
          const g = ease(prog(t, 0.3 + i * 0.7, 1.1 + i * 0.7));
          return (
            <div key={i} style={{ marginBottom: 54, opacity: clamp01(g * 3) }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: BOLD, fontSize: 64, color: "#fff", ...stroke }}>
                <span>{it.label}</span><span style={{ color: "#ffd400" }}>{it.text}</span>
              </div>
              <div style={{ height: 66, background: "rgba(255,255,255,0.18)", border: "5px solid #fff", marginTop: 10 }}>
                <div style={{ width: `${it.pct * g}%`, height: "100%", background: it.color ?? color }} />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Person: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size * 0.8} height={size} viewBox="0 0 80 100"><circle cx="40" cy="22" r="17" fill="#ffd400" stroke="#000" strokeWidth="4" />
    <path d="M10 98 Q10 50 40 46 Q70 50 70 98 Z" fill="#ffd400" stroke="#000" strokeWidth="4" /></svg>
);

const Icons: React.FC<any> = ({ icon, n, of, label, sub, bg, cols = 6 }) => {
  const t = useT();
  const shown = of ?? n;
  const size = shown > 30 ? 92 : 120;
  return (
    <AbsoluteFill>
      <Backdrop src={bg} dim={0.72} />
      <div style={{ position: "absolute", top: 400, left: 70, width: VW - 140, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
        {Array.from({ length: shown }, (_, i) => {
          const k = backOut(prog(t, 0.1 + i * 0.035, 0.35 + i * 0.035));
          const on = i < n;
          return <div key={i} style={{ fontSize: size, width: (VW - 140) / cols - 14, textAlign: "center", transform: `scale(${k})`,
            filter: on ? "none" : "grayscale(1) brightness(0.45)", opacity: on ? 1 : 0.6 }}>{icon === "person" ? <Person size={size} /> : icon}</div>;
        })}
      </div>
      <div style={{ position: "absolute", top: 1040, width: VW, textAlign: "center", transform: `scale(${backOut(prog(t, 0.8, 1.2))})` }}>
        <div style={{ fontFamily: BOLD, fontSize: 96, color: "#ffd400", ...stroke }}>{label}</div>
        {sub && <div style={{ fontFamily: HAND, fontSize: 46, color: "#eee" }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

const Steps: React.FC<any> = ({ title, items, bg, words }) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Backdrop src={bg} dim={0.72} />
      {title && <div style={{ position: "absolute", top: 360, width: VW, textAlign: "center", fontFamily: BOLD, fontSize: 80, color: "#ffd400", ...stroke }}>{title}</div>}
      <div style={{ position: "absolute", top: 520, left: 70, width: VW - 140 }}>
        {items.map((it: any, i: number) => {
          const at = it.at ?? cueTime(words ?? [], it.cue, i * 1.5);
          const k = backOut(prog(t, at, at + 0.35));
          const past = items[i + 1] && t > (items[i + 1].at ?? cueTime(words ?? [], items[i + 1].cue, 999));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 34, transform: `scale(${k})`, transformOrigin: "0 50%", opacity: past ? 0.55 : 1 }}>
              <div style={{ width: 104, height: 104, borderRadius: 52, background: "#e11d1d", border: "5px solid #fff", color: "#fff", fontFamily: BOLD, fontSize: 64,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ background: "rgba(10,10,10,0.85)", border: "4px solid #fff", padding: "14px 26px", fontFamily: BOLD, fontSize: 56, color: "#fff", lineHeight: 1.1 }}>{it.text}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Text: React.FC<any> = ({ text, by, bg }) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Backdrop src={bg} dim={0.68} />
      <div style={{ position: "absolute", top: 560, left: 70, width: VW - 140, textAlign: "center", transform: `scale(${backOut(prog(t, 0, 0.45))})` }}>
        <div style={{ fontFamily: BOLD, fontSize: 110, lineHeight: 1.08, color: "#fff", ...stroke }}>{text}</div>
        {by && <div style={{ fontFamily: HAND, fontSize: 48, color: "#ffd400", marginTop: 26 }}>{by}</div>}
      </div>
    </AbsoluteFill>
  );
};

const ShotV: React.FC<{ s: ResolvedShot; idx: string; first: boolean }> = ({ s, idx, first }) => {
  const f = useCurrentFrame();
  const p = { ...s, duration: s.end - s.start, idx };
  const fade = first ? 1 : clamp01(f / 6);
  const punch = first ? 1 : 1.06 - 0.06 * ease(clamp01(f / 8)); // small zoom-punch on every cut
  return (
    <AbsoluteFill style={{ opacity: fade, transform: `scale(${punch})` }}>
      {!first && <Audio src={staticFile("sfx/whoosh.wav")} volume={0.18} />}
      {(s.type === "stat" || s.type === "icons") && <Sequence from={4}><Audio src={staticFile("sfx/pop.wav")} volume={0.25} /></Sequence>}
      {s.type === "photo" && <Photo {...p} />}
      {s.type === "map" && <VMap {...p} />}
      {s.type === "stat" && <Stat {...p} />}
      {s.type === "vs" && <Versus {...p} />}
      {s.type === "bars" && <Bars {...p} />}
      {s.type === "icons" && <Icons {...p} />}
      {s.type === "steps" && <Steps {...p} />}
      {s.type === "text" && <Text {...p} />}
    </AbsoluteFill>
  );
};

/** captions: 3-word chunks, the word being spoken turns yellow and pops */
const Karaoke: React.FC<{ words: Word[]; t: number }> = ({ words, t }) => {
  const chunks: Word[][] = [];
  words.forEach((w) => {
    const last = chunks[chunks.length - 1];
    const gap = last && w.start - last[last.length - 1].end > 0.35;
    if (!last || last.length >= 3 || gap || /[.,!?;:]$/.test(last[last.length - 1].w)) chunks.push([w]);
    else last.push(w);
  });
  const ch = chunks.find((c, i) => t >= c[0].start - 0.05 && t < (chunks[i + 1]?.[0].start ?? c[c.length - 1].end + 0.4) - 0.05);
  if (!ch) return null;
  const k = backOut(clamp01((t - ch[0].start + 0.05) / 0.15));
  return (
    <div style={{ position: "absolute", top: 1330, left: 50, width: VW - 100, textAlign: "center", transform: `scale(${0.8 + 0.2 * k})` }}>
      {ch.map((w, i) => {
        const on = t >= w.start - 0.03 && t < w.end + 0.08;
        return <span key={i} style={{ fontFamily: BOLD, fontSize: 104, lineHeight: 1.12, color: on ? "#ffd400" : "#fff", textTransform: "uppercase",
          display: "inline-block", margin: "0 20px", transform: `scale(${on ? 1.08 : 1})`, ...stroke }}>{w.w.replace(/[.,;:]$/, "")}</span>;
      })}
    </div>
  );
};

const Scene: React.FC<{ s: any; idx: number }> = ({ s, idx }) => {
  const { fps } = useVideoConfig();
  const t = useCurrentFrame() / fps;
  const shots = resolveShots(s);
  return (
    <AbsoluteFill>
      {shots.map((sh, i) => {
        const from = Math.round(sh.start * fps), len = Math.max(1, Math.round(sh.end * fps) - from) + (i < shots.length - 1 ? 6 : 0);
        return <Sequence key={i} from={from} durationInFrames={len}><ShotV s={sh} idx={`v${idx}-${i}`} first={i === 0 && idx === 0} /></Sequence>;
      })}
      <Karaoke words={s.words} t={t} />
      {s.audio && <Audio src={staticFile(s.audio)} />}
    </AbsoluteFill>
  );
};

export const VShort: React.FC<{ id: string }> = ({ id }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const c = ALL[id];
  const t = frame / fps;
  // hook title: huge for the first 2.5 s, then it shrinks into a header that stays on screen
  const small = ease(prog(t, 2.3, 2.8));
  const titleIn = backOut(clamp01(frame / 10));
  const ctaIn = clamp01((frame - (durationInFrames - TAIL * fps)) / 8);
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {c.scenes.map((s, i) => {
        const len = Math.round((s.duration + (i === c.scenes.length - 1 ? TAIL : 0)) * fps);
        const el = <Sequence key={i} from={from} durationInFrames={len}><Scene s={s} idx={i} /></Sequence>;
        from += len;
        return el;
      })}

      <div style={{ position: "absolute", top: 130 - 40 * small, width: VW, display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        transform: `scale(${titleIn * (1 - 0.42 * small)})`, transformOrigin: "50% 0" }}>
        {c.title.map((l, i) => (
          <div key={i} style={{ fontFamily: BOLD, fontSize: 112, lineHeight: 1.04, color: i === 1 ? "#ffd400" : "#fff", background: "#111", border: "6px solid #fff", padding: "4px 36px", letterSpacing: 2 }}>{l}</div>
        ))}
      </div>

      {/* progress bar */}
      <div style={{ position: "absolute", top: 0, left: 0, height: 14, width: VW * (frame / durationInFrames), background: "#ffd400" }} />

      {[Math.round(durationInFrames * 0.45), durationInFrames - Math.round(TAIL * fps)].map((at, i) => (
        <Sequence key={"s" + i} from={at} durationInFrames={Math.round(Math.min(3.2, TAIL) * fps)}><Subscribe /></Sequence>
      ))}
      {ctaIn < 0.5 && <div style={{ position: "absolute", bottom: 60, width: VW, textAlign: "center", fontFamily: BOLD, letterSpacing: 2, fontSize: 40, color: "rgba(255,255,255,0.7)" }}>{brand.channel.toUpperCase()}</div>}
      {ctaIn > 0 && (
        <div style={{ position: "absolute", top: 520, left: 70, width: VW - 140, padding: "40px 30px", boxSizing: "border-box", textAlign: "center",
          background: "#111", border: "6px solid #ffd400", borderRadius: 26, boxShadow: "0 20px 60px rgba(0,0,0,0.7)", transform: `scale(${backOut(ctaIn)})` }}>
          <div style={{ fontFamily: BOLD, fontSize: 96, color: "#ffd400", lineHeight: 1.05 }}>▶ FULL STORY</div>
          <div style={{ fontFamily: BOLD, fontSize: 80, color: "#fff", lineHeight: 1.05 }}>ON THE CHANNEL</div>
          <div style={{ fontFamily: HAND, fontSize: 52, color: "#ddd", marginTop: 14 }}>{brand.channel}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

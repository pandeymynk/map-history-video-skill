import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { W, H, INK, HAND, BOLD, ease, prog, backOut } from "../lib/anim";

const PAPER = "#f3ead7", ORANGE = "#e8762b";
const useT = () => useCurrentFrame() / useVideoConfig().fps;

const Heading: React.FC<{ text?: string; sub?: string; dark?: boolean; t: number }> = ({ text, sub, dark, t }) =>
  text ? (
    <g opacity={ease(prog(t, 0, 0.4))}>
      <text x={W / 2} y={150} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={56} fill={dark ? "#fff" : INK}>{text}</text>
      {sub && <text x={W / 2} y={205} textAnchor="middle" fontFamily={HAND} fontSize={34} fill={dark ? "#ddd" : "#6b5a48"}>{sub}</text>}
    </g>
  ) : null;

/* ---------------------------------------------------------------- INFO ---- */
/**
 * kind "bars":    { title, items: [{ label, value, color? }], unit? }
 * kind "units":   { title, per: "1 figure = 1 million people", groups: [{ label, count, color? }] }
 * kind "compare": { title, items: [{ label, value, sub?, color? }] }   (big numbers side by side)
 * kind "line":    { title, points: [[x, y], ...], xlabels?: string[], marker?: { x, label } }
 */
export const InfoScene: React.FC<any> = (p) => {
  const t = useT();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill={PAPER} />
      <Heading text={p.title} sub={p.sub} t={t} />
      {p.kind === "bars" && <Bars {...p} t={t} />}
      {p.kind === "units" && <Units {...p} t={t} />}
      {p.kind === "compare" && <Compare {...p} t={t} />}
      {p.kind === "line" && <Line {...p} t={t} />}
    </svg>
  );
};

const fmt = (v: number) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString("en-US") : (Math.round(v * 10) / 10).toString());

const Bars: React.FC<any> = ({ items, unit = "", t }) => {
  const max = Math.max(...items.map((i: any) => i.value));
  const n = items.length, gap = 40, bw = Math.min(220, (W - 400 - gap * (n - 1)) / n);
  const x0 = (W - (bw * n + gap * (n - 1))) / 2, base = 900, hmax = 560;
  return (
    <g>
      <line x1={x0 - 30} y1={base} x2={W - x0 + 30} y2={base} stroke={INK} strokeWidth={5} />
      {items.map((it: any, i: number) => {
        const k = ease(prog(t, 0.3 + i * 0.25, 1.1 + i * 0.25));
        const h = (it.value / max) * hmax * k, x = x0 + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={base - h} width={bw} height={h} fill={it.color ?? ORANGE} stroke={INK} strokeWidth={4} />
            <text x={x + bw / 2} y={base - h - 18} textAnchor="middle" fontFamily={BOLD} fontSize={46} fill={INK} opacity={k}>{fmt(it.value * k)}{unit}</text>
            <text x={x + bw / 2} y={base + 56} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={36} fill={INK}>{it.label}</text>
          </g>
        );
      })}
    </g>
  );
};

const Figure: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <circle cx={0} cy={-34} r={12} fill={color} stroke={INK} strokeWidth={2.5} />
    <path d="M-17,-16 Q0,-26 17,-16 L17,10 L-17,10Z" fill={color} stroke={INK} strokeWidth={2.5} />
  </g>
);

const Units: React.FC<any> = ({ groups, per, t }) => {
  const cols = 15, cell = 64;
  let idx = 0;
  const gx = groups.length > 1 ? W / groups.length : W;
  return (
    <g>
      {per && <text x={W / 2} y={260} textAnchor="middle" fontFamily={HAND} fontSize={32} fill="#6b5a48">{per}</text>}
      {groups.map((g: any, gi: number) => {
        const c = Math.min(cols, g.count), rows = Math.ceil(g.count / c);
        const width = c * cell, cx = groups.length > 1 ? gx * gi + gx / 2 : W / 2, x0 = cx - width / 2 + cell / 2;
        const scale = groups.length > 1 ? 0.8 : 1;
        return (
          <g key={gi}>
            {Array.from({ length: g.count }, (_, i) => {
              const k = backOut(prog(t, 0.3 + (idx++) * 0.035, 0.55 + idx * 0.035));
              return <Figure key={i} x={x0 + (i % c) * cell * scale + (1 - scale) * width / 2} y={360 + Math.floor(i / c) * 80 * scale} s={k * scale} color={g.color ?? ORANGE} />;
            })}
            <text x={cx} y={360 + rows * 80 * scale + 60} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={42} fill={INK}>{g.label}</text>
          </g>
        );
      })}
    </g>
  );
};

const Compare: React.FC<any> = ({ items, t }) => {
  const n = items.length, cw = W / n;
  return (
    <g>
      {items.map((it: any, i: number) => {
        const k = ease(prog(t, 0.3 + i * 0.5, 1.6 + i * 0.5));
        const cx = cw * i + cw / 2, num = typeof it.value === "number" ? fmt(it.value * k) : it.value;
        // shrink long values (e.g. "$2.6k vs $1.5k") so they always fit their column
        const finalLen = String(typeof it.value === "number" ? fmt(it.value) : it.value).length;
        const size = Math.min(170, (cw * 0.86) / (finalLen * 0.5));
        const labelSize = Math.min(48, (cw * 0.9) / (String(it.label).length * 0.45));
        return (
          <g key={i} opacity={ease(prog(t, 0.2 + i * 0.5, 0.6 + i * 0.5))}>
            <text x={cx} y={460} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={labelSize} fill={INK}>{it.label}</text>
            <text x={cx} y={570 + size * 0.42} textAnchor="middle" fontFamily={BOLD} fontSize={size} fill={it.color ?? ORANGE} stroke={INK} strokeWidth={4} paintOrder="stroke">{num}</text>
            {it.sub && <text x={cx} y={720} textAnchor="middle" fontFamily={HAND} fontSize={36} fill="#6b5a48">{it.sub}</text>}
            {i > 0 && <line x1={cw * i} y1={380} x2={cw * i} y2={760} stroke={INK} strokeWidth={3} strokeDasharray="12 10" />}
          </g>
        );
      })}
    </g>
  );
};

const Line: React.FC<any> = ({ points, points2, names = [], colors = [ORANGE, "#2c7a7b"], xlabels = [], marker, t }) => {
  const x0 = 300, x1 = W - 300, y0 = 880, y1 = 330;
  const all = points2 ? [...points, ...points2] : points;
  const xs = all.map((p: number[]) => p[0]), ys = all.map((p: number[]) => p[1]);
  const mx = Math.min(...xs), Mx = Math.max(...xs), My = Math.max(...ys) || 1;
  const px = (x: number) => x0 + ((x - mx) / (Mx - mx || 1)) * (x1 - x0), py = (y: number) => y0 - (y / My) * (y0 - y1);
  const d = points.map((p: number[], i: number) => `${i ? "L" : "M"}${px(p[0])},${py(p[1])}`).join(" ");
  const k = ease(prog(t, 0.3, 2.2));
  return (
    <g>
      <rect x={x0 - 60} y={y1 - 60} width={x1 - x0 + 120} height={y0 - y1 + 130} rx={14} fill="#fffaf0" stroke={INK} strokeWidth={4} />
      <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={INK} strokeWidth={3} />
      <path d={d} fill="none" stroke={colors[0]} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />
      {points2 && <path d={points2.map((p: number[], i: number) => `${i ? "L" : "M"}${px(p[0])},${py(p[1])}`).join(" ")} fill="none" stroke={colors[1]} strokeWidth={8} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - k} />}
      {names.map((n: string, i: number) => {
        const last = (i ? points2 : points)?.at(-1); if (!last) return null;
        return <text key={n} x={px(last[0]) - 14} y={py(last[1]) + (i ? -22 : 52)} textAnchor="end" fontFamily={BOLD} fontSize={40} fill={colors[i]} opacity={k}>{n}</text>;
      })}
      {xlabels.map((l: string, i: number) => (
        <text key={i} x={x0 + (i / Math.max(1, xlabels.length - 1)) * (x1 - x0)} y={y0 + 48} textAnchor="middle" fontFamily={HAND} fontSize={28} fill={INK}>{l}</text>
      ))}
      {marker && (() => {
        const p = points.reduce((a: number[], b: number[]) => (Math.abs(b[0] - marker.x) < Math.abs(a[0] - marker.x) ? b : a));
        const s = backOut(prog(t, 2.0, 2.4));
        return (
          <g opacity={s > 0 ? 1 : 0}>
            <circle cx={px(p[0])} cy={py(p[1])} r={16 * s} fill="#f4c542" stroke={INK} strokeWidth={4} />
            <text x={px(p[0])} y={py(p[1]) - 36} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={40} fill="#c2410c">{marker.label}</text>
          </g>
        );
      })()}
    </g>
  );
};

/* --------------------------------------------------------------- IMAGE ---- */
/**
 * { src: "images/rembrandt.jpg", caption?, credit?, zoom?: "in" | "out", focus?: [0..1, 0..1], frame?: "paper" | "dark" }
 * Public-domain photo/engraving/painting with a slow Ken Burns move.
 */
export const ImageScene: React.FC<any> = (props) => (props.frame === "dark" || props.frame === "paper") ? <FramedImage {...props} /> : <FullImage {...props} />;

/**
 * Full-screen documentary photo: { src, caption?, sub?, credit?, move?: "in"|"out"|"left"|"right"|"up"|"down",
 *   focus?: [x,y] (0-1, what to keep in frame), old?: true (b/w + grain), fit?: "contain" (portraits: blurred backdrop) }
 */
const FullImage: React.FC<any> = ({ src, caption, sub, credit, move = "in", focus = [0.5, 0.45], old, fit, duration = 5 }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const k = ease(prog(t, 0, Math.max(3, duration + 0.4)));
  const z = move === "out" ? 1.16 - 0.1 * k : move === "in" ? 1.06 + 0.1 * k : 1.12;
  const d = 60 * (k - 0.5) * 2;
  const [dx, dy] = move === "left" ? [-d, 0] : move === "right" ? [d, 0] : move === "up" ? [0, -d * 0.6] : move === "down" ? [0, d * 0.6] : [0, 0];
  const grade = old ? "grayscale(1) sepia(0.35) contrast(1.12) brightness(0.95)" : "contrast(1.06) saturate(1.08)";
  const img = (style: React.CSSProperties) => <Img src={staticFile(src)} style={{ position: "absolute", ...style }} />;
  const capIn = ease(prog(t, 0.5, 1.1));
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0d0d0d" }}>
      {fit === "contain" && img({ inset: -60, width: W + 120, height: H + 120, objectFit: "cover", filter: `blur(40px) brightness(0.45) ${old ? "grayscale(1)" : ""}` })}
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${z})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` }}>
        {img({ inset: 0, width: W, height: H, objectFit: fit === "contain" ? "contain" : "cover", objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`, filter: grade })}
      </div>
      {/* vignette + film grain for archive photos */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      {old && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.22, mixBlendMode: "overlay" }}>
          <filter id={`grain${frame % 6}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 6} /></filter>
          <rect width={W} height={H} filter={`url(#grain${frame % 6})`} />
        </svg>
      )}
      {/* lower third */}
      {caption && (
        <div style={{ position: "absolute", left: 90, bottom: 110, transform: `translateX(${(1 - capIn) * -40}px)`, opacity: capIn, display: "flex", alignItems: "stretch" }}>
          <div style={{ width: 10, background: "#f4c542" }} />
          <div style={{ background: "rgba(12,12,12,0.82)", padding: "14px 30px 16px 24px" }}>
            <div style={{ fontFamily: BOLD, fontSize: 48, color: "#fff", letterSpacing: 1.5, lineHeight: 1.05 }}>{caption}</div>
            {sub && <div style={{ fontFamily: HAND, fontSize: 32, color: "#f4c542", marginTop: 6 }}>{sub}</div>}
          </div>
        </div>
      )}
      {credit && <div style={{ position: "absolute", right: 28, bottom: 18, color: "rgba(255,255,255,0.7)", fontFamily: HAND, fontSize: 20, textShadow: "0 1px 3px #000" }}>{credit}</div>}
    </div>
  );
};

const FramedImage: React.FC<any> = ({ src, caption, credit, zoom = "in", focus = [0.5, 0.45], frame = "dark", duration = 5 }) => {
  const t = useT();
  const k = ease(prog(t, 0, Math.max(3, duration)));
  const s = zoom === "in" ? 1 + 0.12 * k : 1.12 - 0.12 * k;
  const bg = frame === "paper" ? PAPER : "#1b1712";
  return (
    <div style={{ width: W, height: H, background: bg, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 160, top: 90, width: W - 320, height: H - 230, overflow: "hidden",
        border: `10px solid ${frame === "paper" ? INK : "#e9dcbc"}`, boxShadow: "0 18px 50px rgba(0,0,0,0.5)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${s})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`, filter: "sepia(0.18) contrast(1.05)" }} />
      </div>
      {caption && (
        <div style={{ position: "absolute", right: 200, bottom: 110, background: "rgba(20,20,20,0.85)", color: "#fff",
          fontFamily: HAND, fontWeight: "bold", fontSize: 36, padding: "10px 26px", borderRadius: 6 }}>{caption}</div>
      )}
      {credit && <div style={{ position: "absolute", left: 170, bottom: 92, color: "#bbb", fontFamily: HAND, fontSize: 20 }}>{credit}</div>}
    </div>
  );
};

/* ----------------------------------------------------------- QUESTIONS ---- */
/** { items: ["How did it get so rich?", "Why did it fall?"], done?: [0], show?: number } — the video's spine. */
export const QuestionsScene: React.FC<any> = ({ items, done = [], show }) => {
  const t = useT();
  const n = show ?? items.length, top = H / 2 - (n * 130) / 2 + 20;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#d9d4cb" />
      {items.slice(0, n).map((q: string, i: number) => {
        const k = backOut(prog(t, 0.2 + i * 0.6, 0.6 + i * 0.6)), y = top + i * 130, w = Math.max(760, q.length * 26 + 220);
        const isDone = done.includes(i);
        return (
          <g key={i} opacity={k > 0 ? 1 : 0} transform={`translate(${W / 2},${y}) scale(${k}) translate(${-W / 2},${-y})`}>
            <rect x={W / 2 - w / 2} y={y - 50} width={w} height={100} rx={14} fill="#fff" stroke={INK} strokeWidth={4} />
            <circle cx={W / 2 - w / 2 + 60} cy={y} r={30} fill={isDone ? "#2f9e44" : ORANGE} stroke={INK} strokeWidth={3} />
            <text x={W / 2 - w / 2 + 60} y={y + 13} textAnchor="middle" fontFamily={BOLD} fontSize={36} fill="#fff">{isDone ? "✓" : i + 1}</text>
            <text x={W / 2 - w / 2 + 115} y={y + 15} fontFamily={HAND} fontWeight="bold" fontSize={44} fill={INK}
              textDecoration={isDone ? "line-through" : undefined} opacity={isDone ? 0.55 : 1}>{q}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* --------------------------------------------------------------- QUOTE ---- */
/** { text, by?, mood?: "paper" | "dark", candle?: true } — a statement card or a somber beat. */
export const QuoteScene: React.FC<any> = ({ text, by, mood = "paper", candle }) => {
  const t = useT();
  const dark = mood === "dark";
  const words = text.split(" "), lines: string[] = [];
  for (const w of words) { const l = lines[lines.length - 1]; if (l && (l + " " + w).length <= 34) lines[lines.length - 1] = l + " " + w; else lines.push(w); }
  const y0 = H / 2 - ((lines.length - 1) * 74) / 2 + (candle ? 250 : 0);
  const flick = 1 + 0.06 * Math.sin(t * 13) + 0.04 * Math.sin(t * 7.3);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs><radialGradient id="glowc"><stop offset="0" stopColor="#ffcf73" stopOpacity="0.55" /><stop offset="1" stopColor="#ffcf73" stopOpacity="0" /></radialGradient></defs>
      <rect width={W} height={H} fill={dark ? "#0e0d0c" : PAPER} />
      {candle && (
        <g transform={`translate(${W / 2},${H / 2 - 60})`}>
          <circle r={220 * flick} fill="url(#glowc)" />
          <rect x={-22} y={0} width={44} height={150} rx={6} fill="#efe6d2" />
          <path d={`M0,${-70 * flick} Q22,-20 0,-2 Q-22,-20 0,${-70 * flick}Z`} fill="#ffb648" />
          <line x1={0} y1={0} x2={0} y2={-12} stroke="#333" strokeWidth={3} />
        </g>
      )}
      <g opacity={ease(prog(t, 0.3, 1.2))}>
        {lines.map((l, i) => (
          <text key={i} x={W / 2} y={y0 + i * 74} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={candle ? 40 : 58} fill={dark ? "#e8e2d6" : INK}>{l}</text>
        ))}
        {by && <text x={W / 2} y={y0 + lines.length * 74 + 20} textAnchor="middle" fontFamily={HAND} fontSize={34} fill={dark ? "#aaa" : "#6b5a48"}>— {by}</text>}
      </g>
    </svg>
  );
};

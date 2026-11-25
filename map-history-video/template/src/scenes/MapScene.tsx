import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { COUNTRIES, find, pathFor, projectionFor } from "../lib/geo";
import { viewKey } from "../lib/mapkey";
import readyMaps from "../mapviews.json";
import { W, H, INK, HAND, ease, prog, backOut, cueTime, Word } from "../lib/anim";
import { LabelBox } from "../components/Overlays";

export type Flag =
  | { kind: "circle"; bg: string; fg: string }
  | { kind: "stripes"; dir: "h" | "v"; colors: string[] }
  | { kind: "solid"; color: string };

/** route: animated line with arrowhead; marker: pin with a label. Coordinates are [lon, lat]. */
export type Route = { path: [number, number][]; cue?: string; at?: number; color?: string; label?: string };
export type Marker = { pos: [number, number]; label: string; cue?: string; at?: number };

export type MapSceneProps = {
  label?: string; sublabel?: string; focus: string[]; highlight?: string[]; flag?: Flag; color?: string;
  routes?: Route[]; markers?: Marker[]; style?: "terrain" | "flat"; margin?: number;
  duration: number; idx: number | string; words?: Word[]; date?: string;
};

const FlagFill: React.FC<{ flag: Flag; box: [[number, number], [number, number]]; grow: number }> = ({ flag, box, grow }) => {
  const [[x0, y0], [x1, y1]] = box;
  const w = x1 - x0, h = y1 - y0;
  if (flag.kind === "solid") return <rect x={x0} y={y0} width={w} height={h} fill={flag.color} />;
  if (flag.kind === "circle") {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    return <><rect x={x0 - 50} y={y0 - 50} width={w + 100} height={h + 100} fill={flag.bg} />
      <circle cx={cx} cy={cy} r={Math.min(w, h) * 0.32 * backOut(grow)} fill={flag.fg} /></>;
  }
  const n = flag.colors.length;
  return <>{flag.colors.map((c, i) => flag.dir === "h"
    ? <rect key={i} x={x0 - 50} y={y0 + (h * i) / n} width={w + 100} height={h / n + 1} fill={c} />
    : <rect key={i} x={x0 + (w * i) / n} y={y0 - 50} width={w / n + 1} height={h + 100} fill={c} />)}</>;
};

export const MapScene: React.FC<MapSceneProps> = ({
  label, sublabel, focus, highlight = focus, flag, color = "#e8352b", routes = [], markers = [],
  style = "terrain", margin = 0.2, duration, idx, words = [], date,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const { others, hl, proj } = useMemo(() => {
    const p = projectionFor(focus, margin);
    const gen = pathFor(p);
    const hlNames = new Set(highlight.map((n) => n.toLowerCase()));
    const others = COUNTRIES.filter((c) => !hlNames.has(c.name.toLowerCase())).map((c) => gen(c.f) ?? "").join("");
    const hl = find(highlight).map((c) => ({ d: gen(c.f) ?? "", box: gen.bounds(c.f) as [[number, number], [number, number]] }));
    return { others, hl, proj: p };
  }, [focus.join(), highlight.join(), margin]);

  const z = 1 + 0.12 * ease(t / duration);
  const red = ease(prog(t, 0.6, 1.4));
  const fl = flag ? ease(prog(t, 1.8, 2.6)) : 0;
  const id = String(idx);
  const terrain = style === "terrain";
  const when = (x: { cue?: string; at?: number }, dflt: number) => x.at ?? cueTime(words, x.cue, dflt);
  const land = terrain ? "#7da23c" : "#cdbf8e";
  // real satellite background (NASA Blue Marble) when one has been generated for this view (npm run maps)
  const key = viewKey(focus, margin);
  const sat = terrain && (readyMaps as string[]).includes(key);
  const zoomT = `translate(${W / 2},${H / 2}) scale(${z}) translate(${-W / 2},${-H / 2})`;

  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden", background: "#0b2a55" }}>
    {sat && <Img src={staticFile(`maps/${key}.jpg`)} style={{ position: "absolute", left: 0, top: 0, width: W, height: H,
      transform: `scale(${z})`, transformOrigin: "50% 50%" }} />}
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <radialGradient id={`sea-${id}`} cx="50%" cy="45%" r="75%">
          <stop offset="0" stopColor={terrain ? "#1f6fd1" : "#3f86a8"} /><stop offset="1" stopColor={terrain ? "#0d3a8a" : "#173f5c"} />
        </radialGradient>
        {hl.map((h, i) => <clipPath key={i} id={`hl-${id}-${i}`}><path d={h.d} /></clipPath>)}
        <filter id={`ripple-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves={2} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.7  0 0 0 0 1  0 0 0 1.2 -0.5" />
        </filter>
        <filter id={`terrain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves={4} seed={9} result="n" />
          <feComponentTransfer in="n" result="k"><feFuncR type="linear" slope="2.2" intercept="-0.6" /></feComponentTransfer>
          <feColorMatrix in="k" type="matrix" result="c" values="0.75 0 0 0 0.22  0.18 0 0 0 0.5  0 0 0 0 0.12  0 0 0 0 1" />
          <feComposite in="c" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8" /></filter>
        <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#fff" />
        </marker>
      </defs>
      {!sat && <rect width={W} height={H} fill={`url(#sea-${id})`} />}
      {terrain && !sat && <rect width={W} height={H} filter={`url(#ripple-${id})`} opacity={0.45} />}
      <g transform={zoomT}>
        {sat
          ? <path d={others} fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth={1.1} strokeLinejoin="round" />
          : <path d={others} fill={land} stroke={terrain ? "#3b4a22" : "#7a6a48"} strokeWidth={1.2}
              strokeLinejoin="round" filter={terrain ? `url(#terrain-${id})` : undefined} />}
        {terrain && !sat && <path d={others} fill="none" stroke="rgba(40,40,30,0.45)" strokeWidth={1.2} />}
        {hl.map((h, i) => (
          <g key={i}>
            {terrain && <path d={h.d} fill="none" stroke="#fff" strokeWidth={16} opacity={0.5 * red} filter={`url(#glow-${id})`} />}
            {!sat && <path d={h.d} fill={land} />}
            <path d={h.d} fill={color} opacity={red * (1 - fl) * (sat ? 0.88 : 1)} />
            {flag && <g clipPath={`url(#hl-${id}-${i})`} opacity={fl}><FlagFill flag={flag} box={h.box} grow={prog(t, 2.2, 3.0)} /></g>}
            <path d={h.d} fill="none" stroke={terrain ? "#fff" : INK} strokeWidth={terrain ? 2 + 2 * red : 1.5 + 1.5 * red} strokeLinejoin="round" />
          </g>
        ))}
        {routes.map((r, i) => {
          const pts = r.path.map((ll) => proj(ll) as number[]);
          const d = pts.map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
          const a = when(r, 1 + i * 1.2), k = ease(prog(t, a, a + 2));
          if (k <= 0) return null;
          const end = pts[pts.length - 1];
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={11} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
              <path d={d} fill="none" stroke={r.color ?? "#fff"} strokeWidth={6} strokeLinecap="round" pathLength={1}
                strokeDasharray={`${k} 1`} markerEnd={k > 0.98 ? `url(#arrow-${id})` : undefined} />
              {r.label && k > 0.98 && (
                <text x={end[0]} y={end[1] - 22} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={34} fill="#fff" stroke="#1a1a1a" strokeWidth={7} paintOrder="stroke">{r.label}</text>
              )}
            </g>
          );
        })}
        {markers.map((m, i) => {
          const [x, y] = proj(m.pos) as number[];
          const a = when(m, 1.2 + i * 0.8), s = backOut(prog(t, a, a + 0.4));
          if (s <= 0.01) return null;
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
              <path d="M0,0 C-14,-20 -18,-30 -18,-40 A18,18 0 1 1 18,-40 C18,-30 14,-20 0,0Z" fill="#f4c542" stroke={INK} strokeWidth={3} />
              <circle cx={0} cy={-40} r={6} fill={INK} />
              <text x={26} y={-30} fontFamily={HAND} fontWeight="bold" fontSize={36} fill="#fff" stroke="#1a1a1a" strokeWidth={7} paintOrder="stroke">{m.label}</text>
            </g>
          );
        })}
      </g>
      {label && <LabelBox label={label} sublabel={sublabel} t={t} dy={date ? 64 : 0} />}
    </svg>
    </div>
  );
};

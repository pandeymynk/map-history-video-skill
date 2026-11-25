import React, { useMemo } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { COUNTRIES, find } from "./lib/geo";
import { W, H, INK, BOLD } from "./lib/anim";
import { Person } from "./components/Person";
import { staticFile } from "remotion";
import { viewKey } from "./lib/mapkey";
import readyMaps from "./mapviews.json";
import timeline from "./timeline.json";
import { ThumbFlags, ThumbPhotos, ThumbMap } from "./ThumbFlags";
const TL: any = timeline;

/**
 * YouTube thumbnail in the "Why X rich, Y poor" split style:
 * two map halves (textured sea + terrain), hero country in a glowing colour,
 * black label boxes on top, a big character on each side, white divider.
 */
const MID = W / 2;

type Half = { x0: number; x1: number; focus: string; fill: string; fit: [[number, number], [number, number]] };

function useHalf({ focus, fit }: Half) {
  return useMemo(() => {
    const p = geoMercator().fitExtent(fit, { type: "FeatureCollection", features: find([focus]).map((c) => c.f) } as any);
    const gen = geoPath(p);
    const land = COUNTRIES.filter((c) => c.name !== focus).map((c) => gen(c.f) ?? "").join("");
    const hero = find([focus]).map((c) => gen(c.f) ?? "").join("");
    return { land, hero };
  }, [focus]);
}

/** key of the satellite background for a thumbnail half (made by npm run maps) */
export const thumbKey = (h: { focus: string; fit: number[][] }) => "t" + viewKey([h.focus], JSON.stringify(h.fit) as any);

const MapHalf: React.FC<{ h: Half; id: string }> = ({ h, id }) => {
  const { land, hero } = useHalf(h);
  const key = thumbKey(h);
  const sat = (readyMaps as string[]).includes(key);
  return (
    <g clipPath={`url(#clip-${id})`}>
      {sat ? <image href={staticFile(`maps/${key}.jpg`)} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
        : <>
          <rect x={h.x0} y={0} width={h.x1 - h.x0} height={H} fill="#1556c9" />
          <rect x={h.x0} y={0} width={h.x1 - h.x0} height={H} filter="url(#ripple)" opacity={0.55} />
        </>}
      {sat ? <path d={land} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.4} strokeLinejoin="round" />
        : <path d={land} fill="#7da23c" stroke="#33461a" strokeWidth={1.5} strokeLinejoin="round" filter="url(#terrain)" />}
      {/* hero country: glow, fill, texture, white edge */}
      <path d={hero} fill="none" stroke="#fff" strokeWidth={22} opacity={0.55} filter="url(#glow)" />
      <path d={hero} fill={h.fill} />
      <path d={hero} fill={h.fill} filter="url(#heroTex)" opacity={0.5} />
      <path d={hero} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

const Label: React.FC<{ cx: number; text: string; sub: string }> = ({ cx, text, sub }) => {
  const w = text.length * 92 + 70, ws = sub.length * 46 + 50;
  return (
    <g>
      <rect x={cx - w / 2} y={36} width={w} height={175} fill="#111" stroke="#fff" strokeWidth={5} />
      <text x={cx} y={180} textAnchor="middle" fontFamily={BOLD} fontSize={160} fill="#fff" letterSpacing={4}>{text}</text>
      <rect x={cx - ws / 2} y={218} width={ws} height={92} fill="#111" stroke="#fff" strokeWidth={4} />
      <text x={cx} y={292} textAnchor="middle" fontFamily={BOLD} fontSize={80} fill="#fff" letterSpacing={2}>{sub}</text>
    </g>
  );
};

export const Thumbnail: React.FC = () => {
  // per-episode settings come from the timeline's "thumbnail" field (falls back to the Japan/China episode)
  const c = { left: "Japan", right: "China", top: ["RICH", "POOR"], leftChar: { hat: "topknot", coat: "#23365c" }, rightChar: { hat: "cap", coat: "#8b1e1e" }, ...(TL.thumbnail ?? {}) };
  const left: Half = { x0: 0, x1: MID, focus: c.left, fill: "#ff1a1a", fit: c.leftFit ?? [[40, 230], [600, 1060]] };
  if (c.style === "flags") return <ThumbFlags c={c} />;
  if (c.style === "photos") return <ThumbPhotos c={c} />;
  if (c.style === "map") return <ThumbMap c={c} ready={readyMaps as string[]} />;
  const right: Half = { x0: MID, x1: W, focus: c.right, fill: "#5d6470", fit: c.rightFit ?? [[MID + 40, 250], [W - 80, 1000]] };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <clipPath id="clip-L"><rect x={0} y={0} width={MID} height={H} /></clipPath>
        <clipPath id="clip-R"><rect x={MID} y={0} width={MID} height={H} /></clipPath>
        {/* water ripples */}
        <filter id="ripple" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves={3} seed={4} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.6  0 0 0 0 1  0 0 0 1.4 -0.55" />
        </filter>
        {/* green / yellow / brown relief on land */}
        <filter id="terrain">
          {/* low noise = green lowlands, high noise = ochre/orange highlands */}
          <feTurbulence type="fractalNoise" baseFrequency="0.0045" numOctaves={6} seed={9} result="n" />
          <feComponentTransfer in="n" result="k"><feFuncR type="linear" slope="2.2" intercept="-0.6" /></feComponentTransfer>
          <feColorMatrix in="k" type="matrix" result="c"
            values="0.75 0 0 0 0.22  0.18 0 0 0 0.5  0 0 0 0 0.12  0 0 0 0 1" />
          <feComposite in="c" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="heroTex">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={4} seed={2} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0.9 -0.35" />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
        {/* white sticker outline around characters */}
        <filter id="sticker" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d" />
          <feFlood floodColor="#fff" /><feComposite in2="d" operator="in" result="o" />
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.45" result="s" />
          <feMerge><feMergeNode in="s" /><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <MapHalf h={left} id="L" />
      <MapHalf h={right} id="R" />

      {c.leftPhoto && c.rightPhoto ? (
        <>{[c.leftPhoto, c.rightPhoto].map((ph: any, i: number) => {
          // round "sticker" portrait: ph = { src, w, h, fx, fy, cx, cy, r } (fx/fy = face centre as a fraction of the image)
          const r = ph.r ?? 290, cx = ph.cx ?? (i ? 1560 : 640), cy = ph.cy ?? 760;
          return (
            <g key={i} filter="url(#sticker)">
              <clipPath id={`ph${i}`}><circle cx={cx} cy={cy} r={r} /></clipPath>
              <circle cx={cx} cy={cy} r={r} fill={i ? "#fff" : "#333"} />
              <image href={staticFile(ph.src)} x={cx - ph.w * ph.fx} y={cy - ph.h * ph.fy} width={ph.w} height={ph.h} clipPath={`url(#ph${i})`} preserveAspectRatio="none" />
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={i ? "#f4a024" : "#de2910"} strokeWidth={14} />
            </g>
          );
        })}</>
      ) : (<>
      {/* Meiji samurai, confident — Qing official, despairing */}
      <g filter="url(#sticker)">
        <Person x={700} y={790} scale={4.4} hat={c.leftChar.hat} coat={c.leftChar.coat} mood="happy" flip />
      </g>
      <g filter="url(#sticker)">
        <Person x={1580} y={790} scale={4.4} hat={c.rightChar.hat} coat={c.rightChar.coat} mood="worried" sweat={1} />
        {/* tears */}
        {[-1, 1].map((s) => (
          <path key={s} d={`M${1580 + s * 62},${738} q${s * 6},40 0,96 q${-s * 10},-6 -6,-30 q-2,-30 6,-66Z`} fill="#7cc4f0" stroke={INK} strokeWidth={3} />
        ))}
      </g>

      </>)}
      <rect x={MID - 7} y={0} width={14} height={H} fill="#fff" />
      <Label cx={MID / 2} text={c.top[0]} sub={(c.leftLabel ?? c.left).toUpperCase()} />
      <Label cx={MID + MID / 2} text={c.top[1]} sub={(c.rightLabel ?? c.right).toUpperCase()} />
    </svg>
  );
};

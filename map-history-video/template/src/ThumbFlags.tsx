import React from "react";
import { staticFile } from "remotion";
import { W, H, BOLD } from "./lib/anim";
import { geoMercator, geoPath } from "d3-geo";
import { COUNTRIES, find } from "./lib/geo";

/**
 * "Flags + faces" thumbnail (the style the top China-vs-India videos use):
 * two waving flags split down the middle, a big cut-out face on each side,
 * one-word labels in yellow/black boxes and a red "WHY?" tag in the centre.
 * Config (timeline.thumbnail): { style: "flags", leftFlag, rightFlag, left/rightFace: { src, x, y, w }, top: [a, b], center }
 */
const MID = W / 2;

const Star: React.FC<{ cx: number; cy: number; r: number; rot?: number; fill?: string }> = ({ cx, cy, r, rot = 0, fill = "#ffde00" }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2 + (rot * Math.PI) / 180, rr = i % 2 ? r * 0.382 : r;
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} />;
};

const Flag: React.FC<{ kind: string; x: number; w: number }> = ({ kind, x, w }) => {
  if (kind === "china") {
    const u = H / 20;
    return (
      <g>
        <rect x={x} y={-60} width={w} height={H + 120} fill="#de2910" />
        <Star cx={x + 5 * u + 140} cy={5 * u + 40} r={3 * u + 30} />
        {[[10, 2, 23], [12, 4, 45], [12, 7, 0], [10, 9, 20]].map(([sx, sy, rot], i) => (
          <Star key={i} cx={x + sx * u + 260} cy={sy * u + 60} r={u + 14} rot={rot} />
        ))}
      </g>
    );
  }
  if (kind === "pakistan") {
    // white band at the hoist, dark green field with a white crescent and star
    const band = w * 0.25, cx = x + band + (w - band) * 0.5, cy = H / 2;
    return (
      <g>
        <rect x={x} y={-60} width={w} height={H + 120} fill="#01411c" />
        <rect x={x} y={-60} width={band} height={H + 120} fill="#ffffff" />
        <circle cx={cx} cy={cy} r={230} fill="#ffffff" />
        <circle cx={cx + 70} cy={cy - 55} r={200} fill="#01411c" />
        <Star cx={cx + 120} cy={cy - 130} r={90} rot={-35} fill="#ffffff" />
      </g>
    );
  }
  // India
  const sh = (H + 120) / 3, cx = x + w / 2 - 230, cy = H / 2, r = sh * 0.4;
  return (
    <g>
      <rect x={x} y={-60} width={w} height={sh} fill="#ff9933" />
      <rect x={x} y={sh - 60} width={w} height={sh} fill="#ffffff" />
      <rect x={x} y={2 * sh - 60} width={w} height={sh} fill="#138808" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#000080" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r * 0.17} fill="#000080" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#000080" strokeWidth={4} />;
      })}
    </g>
  );
};

const Box: React.FC<{ x: number; y: number; text: string; bg: string; fg: string; size: number; anchor?: "start" | "middle" | "end" }> = ({ x, y, text, bg, fg, size, anchor = "middle" }) => {
  const w = text.length * size * 0.55 + 60, h = size * 1.15;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  return (
    <g filter="url(#drop)">
      <rect x={x0} y={y} width={w} height={h} fill={bg} stroke="#000" strokeWidth={6} />
      <text x={x0 + w / 2} y={y + h * 0.84} textAnchor="middle" fontFamily={BOLD} fontSize={size} fill={fg} letterSpacing={3}>{text}</text>
    </g>
  );
};

export const ThumbFlags: React.FC<{ c: any }> = ({ c }) => {
  const L = c.leftFace, R = c.rightFace;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        {/* cloth: displace the flags with soft noise, then add light/dark folds */}
        <filter id="wave" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.006" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={70} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <linearGradient id="folds" x1="0" y1="0" x2="1" y2="0.35">
          {Array.from({ length: 13 }, (_, i) => (
            <stop key={i} offset={i / 12} stopColor={i % 2 ? "#000" : "#fff"} stopOpacity={i % 2 ? 0.22 : 0.1} />
          ))}
        </linearGradient>
        <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.6} /></radialGradient>
        <filter id="drop" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.55" /></filter>
        <filter id="face" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="18" floodColor="#000" floodOpacity="0.7" />
        </filter>
        <clipPath id="cl"><rect x={-100} y={-100} width={MID + 100} height={H + 200} /></clipPath>
        <clipPath id="cr"><rect x={MID} y={-100} width={MID + 100} height={H + 200} /></clipPath>
      </defs>

      <g filter="url(#wave)">
        <g clipPath="url(#cl)"><Flag kind={c.leftFlag ?? "china"} x={-80} w={MID + 120} /></g>
        <g clipPath="url(#cr)"><Flag kind={c.rightFlag ?? "india"} x={MID - 40} w={MID + 120} /></g>
      </g>
      <rect width={W} height={H} fill="url(#folds)" />
      <rect width={W} height={H} fill="url(#vig)" />

      {L && <image href={staticFile(L.src)} x={L.x} y={L.y} width={L.w} height={L.h} filter="url(#face)" />}
      {R && <image href={staticFile(R.src)} x={R.x} y={R.y} width={R.w} height={R.h} filter="url(#face)" />}

      <Box x={60} y={40} text={c.top?.[0] ?? "RICH"} bg="#ffd400" fg="#000" size={150} anchor="start" />
      <Box x={W - 60} y={40} text={c.top?.[1] ?? "POOR"} bg="#111" fg="#fff" size={150} anchor="end" />
      {c.center && <Box x={MID} y={H - 250} text={c.center} bg="#e11d1d" fg="#fff" size={170} />}
    </svg>
  );
};

/**
 * "Then vs now" photo thumbnail: { style: "photos", leftPhoto, rightPhoto, leftOld?: true, top: [a, b], center?, face?: { src, x, y, w, h } }
 */
export const ThumbPhotos: React.FC<{ c: any }> = ({ c }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <clipPath id="pl"><polygon points={`0,0 ${MID + 90},0 ${MID - 90},${H} 0,${H}`} /></clipPath>
      <clipPath id="pr"><polygon points={`${MID + 90},0 ${W},0 ${W},${H} ${MID - 90},${H}`} /></clipPath>
      <filter id="bw"><feColorMatrix type="saturate" values="0" /><feComponentTransfer><feFuncR type="linear" slope="1.15" intercept="-0.05" /><feFuncG type="linear" slope="1.1" intercept="-0.05" /><feFuncB type="linear" slope="0.95" intercept="-0.05" /></feComponentTransfer></filter>
      <filter id="pop"><feColorMatrix type="saturate" values="1.35" /><feComponentTransfer><feFuncR type="linear" slope="1.1" /><feFuncG type="linear" slope="1.08" /><feFuncB type="linear" slope="1.1" /></feComponentTransfer></filter>
      <radialGradient id="vg" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.55} /></radialGradient>
      <filter id="drop" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.55" /></filter>
      <filter id="face" x="-10%" y="-10%" width="120%" height="120%">
        <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d" /><feFlood floodColor="#fff" /><feComposite in2="d" operator="in" result="o" />
        <feDropShadow dx="0" dy="10" stdDeviation="14" floodOpacity="0.6" result="s" /><feMerge><feMergeNode in="s" /><feMergeNode in="o" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <g clipPath="url(#pl)"><image href={staticFile(c.leftPhoto)} x={-80} y={0} width={MID + 260} height={H} preserveAspectRatio="xMidYMid slice" filter={c.leftOld ? "url(#bw)" : undefined} /></g>
    <g clipPath="url(#pr)"><image href={staticFile(c.rightPhoto)} x={MID - 120} y={0} width={MID + 120} height={H} preserveAspectRatio="xMidYMid slice" filter="url(#pop)" /></g>
    <line x1={MID + 90} y1={0} x2={MID - 90} y2={H} stroke="#fff" strokeWidth={14} />
    <rect width={W} height={H} fill="url(#vg)" />
    {c.face && <image href={staticFile(c.face.src)} x={c.face.x} y={c.face.y} width={c.face.w} height={c.face.h} filter="url(#face)" />}
    <Box x={60} y={40} text={c.top?.[0] ?? "THEN"} bg="#111" fg="#fff" size={130} anchor="start" />
    <Box x={W - 60} y={40} text={c.top?.[1] ?? "NOW"} bg="#ffd400" fg="#000" size={130} anchor="end" />
    {c.center && <Box x={c.centerX ?? MID + 330} y={c.centerY ?? H - 260} text={c.center} bg="#e11d1d" fg="#fff" size={c.centerSize ?? 150} />}
  </svg>
);

/**
 * "Glowing country on a vivid map" thumbnail:
 * { style: "map", focus: [names], highlight?: [names], fit?: [[x0,y0],[x1,y1]], labels: [big, small?], face?: { src, x, y, w, h },
 *   tags?: [{ text, x, y, to: [x, y] }] }   (tags: extra label boxes with a curved arrow pointing at the map)
 */
export const mapThumbFit = (c: any) => c.fit ?? [[80, 170], [1180, 1020]];
export const mapThumbKey = (c: any) => "m" + viewKeyLocal(c.focus, JSON.stringify(mapThumbFit(c)) + (c.fitBox ? JSON.stringify(c.fitBox) : ""));
/** what the projection is fitted to: the focus countries, or a lon/lat box (for countries crossing the 180th meridian) */
export const mapThumbTarget = (c: any) => c.fitBox ? { type: "MultiPoint", coordinates: c.fitBox } : { type: "FeatureCollection", features: find(c.focus).map((x) => x.f) };
function viewKeyLocal(focus: string[], m: string) {
  const s = `${focus.join("|")}@${m}`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export const ThumbMap: React.FC<{ c: any; ready: string[] }> = ({ c, ready }) => {
  const fit = mapThumbFit(c);
  const hlNames = c.highlight ?? c.focus;
  const { land, hero, all, hero2 } = React.useMemo(() => {
    const p = geoMercator().fitExtent(fit, mapThumbTarget(c) as any);
    const gen = geoPath(p);
    const set = new Set([...hlNames, ...(c.green ?? [])].map((n: string) => n.toLowerCase()));
    return {
      land: COUNTRIES.filter((x) => !set.has(x.name.toLowerCase())).map((x) => gen(x.f) ?? "").join(""),
      hero: find(hlNames).map((x) => gen(x.f) ?? "").join(""),
      all: COUNTRIES.map((x) => gen(x.f) ?? "").join(""),
      hero2: find(c.green ?? []).map((x) => gen(x.f) ?? "").join(""),
    };
  }, [c.focus.join(), hlNames.join()]);
  const key = mapThumbKey(c);
  const sat = ready.includes(key) ? staticFile(`maps/${key}.jpg`) : null;
  const [big, small] = c.labels ?? [];
  const F = c.face;
  const LBL = "'Arial Black', 'Archivo Black', Impact, sans-serif";
  const box = (text: string, size: number, color = "#fff"): React.ReactNode => (
    <div style={{ alignSelf: "flex-start", background: "#000", color, fontFamily: LBL, fontSize: size, lineHeight: 1.12, padding: `${size * 0.04}px ${size * 0.16}px ${size * 0.02}px`, letterSpacing: -0.5,
      textShadow: "0 3px 0 rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>{text}</div>
  );
  return (
    <div style={{ width: W, height: H, position: "relative", overflow: "hidden" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="vivid"><feColorMatrix type="saturate" values="1.9" />
          <feComponentTransfer><feFuncR type="linear" slope="1.05" /><feFuncG type="linear" slope="1.12" /><feFuncB type="linear" slope="1.35" intercept="0.04" /></feComponentTransfer></filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d" /><feGaussianBlur in="d" stdDeviation="14" result="b" />
          <feFlood floodColor="#ff2020" floodOpacity="0.95" /><feComposite in2="b" operator="in" result="red" />
          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="w0" /><feGaussianBlur in="w0" stdDeviation="2.5" result="w1" />
          <feFlood floodColor="#ffffff" /><feComposite in2="w1" operator="in" result="white" />
          <feDropShadow in="SourceGraphic" dx="10" dy="14" stdDeviation="10" floodOpacity="0.55" result="sh" />
          <feMerge><feMergeNode in="red" /><feMergeNode in="white" /><feMergeNode in="sh" /></feMerge>
        </filter>
        <filter id="glowG" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d" /><feGaussianBlur in="d" stdDeviation="14" result="b" />
          <feFlood floodColor="#3dff4a" floodOpacity="0.9" /><feComposite in2="b" operator="in" result="g" />
          <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="w0" /><feGaussianBlur in="w0" stdDeviation="2.5" result="w1" />
          <feFlood floodColor="#ffffff" /><feComposite in2="w1" operator="in" result="white" />
          <feDropShadow in="SourceGraphic" dx="10" dy="14" stdDeviation="10" floodOpacity="0.55" result="sh" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="white" /><feMergeNode in="sh" /></feMerge>
        </filter>
        <linearGradient id="greenFill" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#3fe04a" /><stop offset="1" stopColor="#14a828" /></linearGradient>
        <clipPath id="greenClip"><path d={hero2} /></clipPath>
        <linearGradient id="heroFill" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#ff2a1f" /><stop offset="1" stopColor="#e00b14" /></linearGradient>
        <radialGradient id="seaT" cx="0.4" cy="0.45" r="0.85"><stop offset="0" stopColor="#2f8cff" /><stop offset="1" stopColor="#0b4fc4" /></radialGradient>
        <filter id="waves" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.03" numOctaves={3} seed={3} />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.2 -1" /><feComposite in2="SourceGraphic" operator="in" /></filter>
        <clipPath id="heroClip"><path d={hero} /></clipPath>
        <radialGradient id="mvig" cx="0.45" cy="0.5" r="0.8"><stop offset="0.7" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.25} /></radialGradient>
        <filter id="faceT" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="10" stdDeviation="16" floodOpacity="0.6" /></filter>
        <marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#fff" stroke="#000" strokeWidth="1" /></marker>
      </defs>
      <rect width={W} height={H} fill="#1565d8" />
      {sat ? <image href={sat} x={0} y={0} width={W} height={H} preserveAspectRatio="none" filter="url(#vivid)" />
        : <path d={land} fill="#7da23c" stroke="#3d5a1a" strokeWidth={2} />}
      {/* bright "travel poster" sea over the dark satellite ocean */}
      <path d={`M0,0H${W}V${H}H0Z${all}`} fillRule="evenodd" fill="url(#seaT)" />
      <path d={`M0,0H${W}V${H}H0Z${all}`} fillRule="evenodd" fill="#fff" filter="url(#waves)" opacity={0.16} />
      <path d={land} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      {/* hero country: glowing red with the terrain showing through */}
      <g filter="url(#glow)"><path d={hero} fill="url(#heroFill)" /></g>
      {sat && <image href={sat} x={0} y={0} width={W} height={H} preserveAspectRatio="none" clipPath="url(#heroClip)" style={{ mixBlendMode: "multiply" } as any} opacity={0.28} filter="url(#vivid)" />}
      <path d={hero} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      {hero2 && <>
        <g filter="url(#glowG)"><path d={hero2} fill="url(#greenFill)" /></g>
        {sat && <image href={sat} x={0} y={0} width={W} height={H} preserveAspectRatio="none" clipPath="url(#greenClip)" style={{ mixBlendMode: "multiply" } as any} opacity={0.35} filter="url(#vivid)" />}
        <path d={hero2} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
      </>}
      <rect width={W} height={H} fill="url(#mvig)" />
      {(c.tags ?? []).map((t: any, i: number) => (
        <g key={i}>
          <path d={`M${t.x},${t.y + 70} Q${(t.x + t.to[0]) / 2 + 60},${(t.y + t.to[1]) / 2} ${t.to[0]},${t.to[1]}`} fill="none" stroke="#000" strokeWidth={22} />
          <path d={`M${t.x},${t.y + 70} Q${(t.x + t.to[0]) / 2 + 60},${(t.y + t.to[1]) / 2} ${t.to[0]},${t.to[1]}`} fill="none" stroke="#fff" strokeWidth={12} markerEnd="url(#ah)" />
          <rect x={t.x - t.text.length * 44 - 30} y={t.y - 72} width={t.text.length * 88 + 60} height={138} fill="#000" />
          <text x={t.x} y={t.y + 40} textAnchor="middle" fontFamily="'Arial Black', Impact, sans-serif" fontSize={104} fill="#fff" letterSpacing={-1}>{t.text}</text>
        </g>
      ))}
    </svg>
    {F && <img src={staticFile(F.src)} style={{ position: "absolute", left: F.x, top: F.y, width: F.w, height: F.h, objectFit: "contain", objectPosition: "50% 100%",
      filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.55)) saturate(1.15) contrast(1.06)" }} />}
    <div style={{ position: "absolute", left: 34, top: 30, display: "flex", flexDirection: "column" }}>
      {big && box(big, c.bigSize ?? 118)}
      {small && box(small, c.smallSize ?? 62, c.smallColor ?? "#fff")}
    </div>
    </div>
  );
};

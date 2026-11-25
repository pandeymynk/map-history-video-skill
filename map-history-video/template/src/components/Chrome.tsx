import React from "react";
import { W, H, INK, HAND, BOLD, backOut, ease, prog, cueTime, Word } from "../lib/anim";
import { Person, Mood } from "./Person";

/** Small dark tag top-left: "TODAY", "1602", "2,000 YEARS AGO". */
export const DateTag: React.FC<{ text: string; t: number }> = ({ text, t }) => {
  const k = ease(prog(t, 0.05, 0.4));
  const w = text.length * 17 + 40;
  return (
    <g opacity={k} transform={`translate(${-20 * (1 - k)},0)`}>
      <rect x={36} y={32} width={w} height={52} rx={8} fill="rgba(14,30,62,0.80)" />
      <text x={36 + w / 2} y={68} textAnchor="middle" fontFamily={HAND} fontSize={32} letterSpacing={1} fill="#fff">{text.toUpperCase()}</text>
    </g>
  );
};

/**
 * Keyword labels that pop in as a word is spoken, handwritten style.
 * labels: [{ cue: "tulip", text: "tulip craze", x?, y?, badge? }]
 * badge: true draws a small dark pill (for "reportedly", "according to legend").
 */
export type LabelSpec = { cue?: string; at?: number; text: string; x?: number; y?: number; hold?: number; badge?: boolean; color?: string };

export const KeywordLabels: React.FC<{ labels: LabelSpec[]; words: Word[]; t: number }> = ({ labels, words, t }) => (
  <>
    {labels.map((l, i) => {
      const a = l.at ?? cueTime(words, l.cue, -1);
      if (a < 0) return null;
      const b = a + (l.hold ?? 3.2);
      const k = prog(t, a, a + 0.25) * (1 - prog(t, b, b + 0.25));
      if (k <= 0.01) return null;
      const s = backOut(prog(t, a, a + 0.3));
      const x = l.x ?? W / 2, y = l.y ?? 130;
      if (l.badge) {
        const w = l.text.length * 17 + 44;
        return (
          <g key={i} opacity={k} transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`}>
            <rect x={x - w / 2} y={y - 30} width={w} height={44} rx={22} fill="rgba(25,25,25,0.85)" />
            <text x={x} y={y + 1} textAnchor="middle" fontFamily={HAND} fontSize={30} fill="#fff">{l.text}</text>
          </g>
        );
      }
      return (
        <text key={i} x={x} y={y} textAnchor="middle" opacity={k} fontFamily={HAND} fontSize={64}
          fill={l.color ?? "#fff"} stroke="rgba(0,0,0,0.55)" strokeWidth={6} paintOrder="stroke" strokeLinejoin="round"
          transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`}>{l.text}</text>
      );
    })}
  </>
);

/**
 * The channel's recurring guide: a map-maker in a pith helmet with a rolled map.
 * Slides in at the bottom-right of map shots and reacts (mood) / points.
 */
export const Guide: React.FC<{ t: number; mood?: Mood; side?: "left" | "right"; talk?: boolean }> = ({ t, mood = "normal", side = "right", talk }) => {
  const k = ease(prog(t, 0.2, 0.8));
  const baseX = side === "right" ? W - 210 : 210;
  const x = side === "right" ? baseX + 400 * (1 - k) : baseX - 400 * (1 - k);
  const bob = 4 * Math.sin(t * 2.4);
  return (
    <g>
      <Person x={x} y={H - 300 + bob} scale={2.1} hat="explorer" coat="#2c7a7b" mood={mood} flip={side === "right"}
        talk={talk && Math.floor(t * 8) % 2 === 0} blink={(t % 3.4) < 0.12} />
    </g>
  );
};

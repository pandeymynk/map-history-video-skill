import React from "react";
import { BOLD, HAND, INK, W, H, backOut, prog, Word } from "../lib/anim";

export const LabelBox: React.FC<{ label: string; sublabel?: string; t: number; dy?: number }> = ({ label, sublabel, t, dy = 0 }) => {
  const k = backOut(prog(t, 0.2, 0.8));
  const w1 = label.length * 44 + 60;
  return (
    <g transform={`translate(${-(w1 + 80) * (1 - k)},${dy})`}>
      <rect x={60} y={60} width={w1} height={110} fill="#111" />
      <text x={84} y={148} fontFamily={BOLD} fontSize={88} fill="#fff">{label}</text>
      {sublabel && (
        <>
          <rect x={60} y={176} width={sublabel.length * 26 + 44} height={64} fill="#111" />
          <text x={80} y={226} fontFamily={BOLD} fontSize={48} fill="#f4c542">{sublabel}</text>
        </>
      )}
    </g>
  );
};

/** Subtitles built from word timings: chunks of ~7 words, split at sentence ends. */
export function chunk(words: Word[]) {
  const out: { text: string; start: number; end: number }[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({ text: cur.map((w) => w.w).join(" "), start: cur[0].start, end: cur[cur.length - 1].end });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    if (cur.length >= 7 || /[.!?]$/.test(w.w) || (cur.length >= 4 && /[,;:]$/.test(w.w))) flush();
  }
  flush();
  return out;
}

export const Captions: React.FC<{ words: Word[]; t: number }> = ({ words, t }) => {
  const chunks = chunk(words);
  const c = chunks.find((c, i) => t >= c.start - 0.05 && t < (chunks[i + 1]?.start ?? c.end + 0.6));
  if (!c) return null;
  return (
    <text x={W / 2} y={H - 70} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={52} fill="#fff"
      stroke="#1a1a1a" strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">
      {c.text}
    </text>
  );
};

export const Bubble: React.FC<{ x: number; y: number; text: string; k: number; size?: number }> = ({ x, y, text, k, size = 50 }) => {
  if (k <= 0.01) return null;
  const s = backOut(k);
  const w = Math.max(170, text.length * size * 0.56 + 70), h = size + 58;
  // keep the bubble body on screen; the tail still points at the speaker
  const bx = Math.min(W - 30 - w / 2, Math.max(30 + w / 2, x));
  return (
    <g transform={`translate(${x},${y}) scale(${s}) translate(${-x},${-y})`}>
      <rect x={bx - w / 2} y={y - h} width={w} height={h} rx={32} fill="#fff" stroke={INK} strokeWidth={4} />
      <path d={`M${x - 20},${y - 3} L${x - 30},${y + 44} L${x + 20},${y - 3}Z`} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <rect x={x - 17} y={y - 9} width={36} height={9} fill="#fff" />
      <text x={bx} y={y - h / 2 + size * 0.36} textAnchor="middle" fontFamily={HAND} fontWeight="bold" fontSize={size} fill={INK}>{text}</text>
    </g>
  );
};

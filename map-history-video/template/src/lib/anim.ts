export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const INK = "#3a2a1e";
export const HAND = "'Patrick Hand', 'Comic Relief', 'Comic Sans MS', cursive";
export const BOLD = "Anton, Impact, 'Arial Black', sans-serif";

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const ease = (t: number) => { t = clamp01(t); return t * t * (3 - 2 * t); };
export const backOut = (t: number) => { t = clamp01(t); const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
export const prog = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

export type Word = { w: string; start: number; end: number };

/** Time (seconds) when the first word starting with `cue` is spoken. */
export function cueTime(words: Word[], cue: string | undefined, fallback = 0) {
  if (!cue) return fallback;
  const c = cue.toLowerCase();
  const hit = words.find((w) => w.w.toLowerCase().replace(/[^a-z0-9']/g, "").startsWith(c));
  return hit ? hit.start : fallback;
}

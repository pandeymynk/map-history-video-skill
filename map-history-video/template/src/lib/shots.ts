import { Word, cueTime } from "./anim";

/**
 * A scene is one narration block (one audio file). It can show several visuals ("shots")
 * that switch on cue words, so the picture changes every few seconds while the voice runs on.
 *
 *   { "type": "map", ..., "shots": [ { "cue": "ships", "type": "image", ... }, ... ] }
 *
 * The scene's own fields are the first shot; each entry in `shots` starts at its cue word.
 * A shot inherits `date` from the scene unless it sets its own.
 */
export type Shot = { type: string; cue?: string; at?: number; date?: string; [k: string]: any };
export type ResolvedShot = Shot & { start: number; end: number; words: Word[] };

export function resolveShots(scene: any): ResolvedShot[] {
  const words: Word[] = scene.words ?? [];
  const { shots = [], words: _w, audio: _a, narration: _n, duration, ...first } = scene;
  const list: Shot[] = [first, ...shots.map((s: Shot) => ({ date: first.date, ...s }))];
  const starts = list.map((s, i) => (i === 0 ? 0 : s.at ?? cueTime(words, s.cue, NaN)));
  const out: ResolvedShot[] = [];
  list.forEach((s, i) => {
    const start = starts[i];
    if (isNaN(start)) return; // unknown cue: skipped (the checker reports it)
    const next = starts.slice(i + 1).find((x) => !isNaN(x) && x > start);
    const end = next ?? duration;
    // words re-based to the shot's own clock, so cues inside the shot (bubbles, labels) still line up
    const local = words.filter((w) => w.start >= start - 0.05).map((w) => ({ ...w, start: w.start - start, end: w.end - start }));
    out.push({ ...s, start, end, words: local });
  });
  return out.sort((a, b) => a.start - b.start);
}

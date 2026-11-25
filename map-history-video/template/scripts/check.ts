/**
 * Pacing + cue checker for src/timeline.json.     npm run check
 *
 * Target from the style guide: a new visual every 4–6 s, nothing static for more than ~8 s.
 * Reports: average seconds per visual, the longest shots, and any cue word that isn't in its narration.
 */
import fs from "node:fs";
import path from "node:path";
import { resolveShots } from "../src/lib/shots";
import { cueTime } from "../src/lib/anim";

const tl = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/timeline.json"), "utf8"));
const MAX = Number(process.env.MAX_SHOT ?? 8);
let total = 0, count = 0, problems = 0;
const long: string[] = [];
let clock = 0;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

tl.scenes.forEach((s: any, i: number) => {
  const shots = resolveShots(s);
  const declared = 1 + (s.shots?.length ?? 0);
  if (shots.length < declared) {
    for (const sh of s.shots ?? []) if (sh.cue && isNaN(cueTime(s.words, sh.cue, NaN))) {
      console.warn(`! scene ${i + 1} (${mmss(clock)}): shot cue "${sh.cue}" not in narration`); problems++;
    }
  }
  const declaredStarts = (s.shots ?? []).map((sh: any) => sh.at ?? cueTime(s.words, sh.cue, NaN));
  declaredStarts.forEach((v: number, k: number) => {
    if (k > 0 && !isNaN(v) && v < declaredStarts[k - 1]) { console.warn(`! scene ${i + 1} (${mmss(clock)}): shot "${s.shots[k].cue}" starts before the shot listed above it (cue word appears earlier in the narration)`); problems++; }
  });
  for (const sh of shots) {
    for (const l of [...(sh.labels ?? []), ...(sh.dialogue ?? []), ...(sh.events ?? []), ...(sh.routes ?? []), ...(sh.markers ?? [])]) {
      if (l.cue && isNaN(cueTime(sh.words, l.cue, NaN))) { console.warn(`! scene ${i + 1} (${mmss(clock + sh.start)}): cue "${l.cue}" not found after its shot starts`); problems++; }
    }
    const d = sh.end - sh.start;
    total += d; count++;
    if (d > MAX) long.push(`  ${mmss(clock + sh.start)}  ${d.toFixed(1)}s  scene ${i + 1} ${sh.type}${sh.label ? " " + sh.label : ""}`);
  }
  clock += s.duration;
});

console.log(`\n${count} visuals over ${mmss(clock)} → one every ${(total / count).toFixed(1)}s (target 4–6s)`);
if (long.length) console.log(`${long.length} shots longer than ${MAX}s:\n${long.slice(0, 25).join("\n")}${long.length > 25 ? "\n  …" : ""}`);
if (problems) { console.log(`${problems} cue problem(s)`); process.exitCode = 1; }

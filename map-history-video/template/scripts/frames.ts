// Print a good preview frame for every shot: npx tsx scripts/frames.ts
import fs from "node:fs";
import path from "node:path";
import { resolveShots } from "../src/lib/shots";
const tl = JSON.parse(fs.readFileSync(path.join(__dirname, "../src/timeline.json"), "utf8"));
let off = 0;
for (const s of tl.scenes) {
  for (const sh of resolveShots(s)) console.log(Math.round((off + sh.start + Math.min(2.6, (sh.end - sh.start) * 0.8)) * 30), sh.type, sh.kind ?? "");
  off += Math.round(s.duration * 30) / 30;
}

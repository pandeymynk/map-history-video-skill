// Build out/captions.srt from src/timeline.json (same chunking as the on-screen captions).
import fs from "node:fs";
const t = JSON.parse(fs.readFileSync(new URL("../src/timeline.json", import.meta.url)));
const FPS = 30, ts = (s) => { const ms = Math.round(s * 1000); const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
let off = 0, n = 0; const out = [];
for (const s of t.scenes) {
  let cur = [];
  const flush = () => { if (!cur.length) return;
    out.push({ a: off + cur[0].start, b: off + cur.at(-1).end + 0.25, text: cur.map((w) => w.w).join(" ") }); cur = []; };
  for (const w of s.words) { cur.push(w); if (cur.length >= 7 || /[.!?]["”]?$/.test(w.w) || (cur.length >= 4 && /[,;:]$/.test(w.w))) flush(); }
  flush();
  off += Math.round(s.duration * FPS) / FPS;
}
out.forEach((c, i) => { if (out[i + 1]) c.b = Math.min(c.b, out[i + 1].a - 0.02); });
fs.writeFileSync(new URL("../out/captions.srt", import.meta.url),
  out.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.text}\n`).join("\n"));
n = out.length;
console.log(n, "cues");

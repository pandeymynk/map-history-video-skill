// Builds src/shorts.json (segments + captions re-timed to each Short) from shorts/config.json.
//   node scripts/shorts.mjs      then   npx remotion render Short out/short-<id>.mp4 --props='{"id":"<id>"}'
import fs from "node:fs";
const cfg = JSON.parse(fs.readFileSync("shorts/config.json", "utf8"));
const t = (s) => { const [h, m, r] = s.trim().split(":"); return +h * 3600 + +m * 60 + parseFloat(r.replace(",", ".")); };
const out = {};
for (const [id, c] of Object.entries(cfg)) {
  const cues = fs.readFileSync(c.srt, "utf8").trim().split(/\n\s*\n/).map((b) => {
    const l = b.split("\n"); const [a, z] = l[1].split("-->"); return { a: t(a), z: t(z), text: l.slice(2).join(" ").trim() };
  });
  let off = 0; const caps = [];
  for (const [s, e] of c.segments) {
    for (const q of cues) if (q.a >= s - 0.05 && q.a < e) caps.push({ a: q.a - s + off, z: Math.min(q.z, e) - s + off, text: q.text });
    off += e - s;
  }
  out[id] = { ...c, duration: off, captions: c.noCaptions ? [] : caps };
}
fs.writeFileSync("src/shorts.json", JSON.stringify(out, null, 1));
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.duration.toFixed(1)}s, ${v.captions.length} captions`).join("\n"));

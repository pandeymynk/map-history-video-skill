// Merge episode/<name>/{1,2,3…}.json (+ meta.json) into episode/<name>.json.   node scripts/build-episode.mjs korea
import fs from "node:fs";
const name = process.argv[2];
const dir = `episode/${name}`;
const meta = fs.existsSync(`${dir}/meta.json`) ? JSON.parse(fs.readFileSync(`${dir}/meta.json`)) : {};
const parts = fs.readdirSync(dir).filter((f) => /^\d+\.json$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
const scenes = parts.flatMap((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`)));
fs.writeFileSync(`episode/${name}.json`, JSON.stringify({ ...meta, scenes }, null, 1));
const words = scenes.reduce((a, s) => a + (s.narration || "").split(/\s+/).filter(Boolean).length, 0);
console.log(`${scenes.length} scenes, ${words} words ≈ ${(words / 155).toFixed(0)} min`);

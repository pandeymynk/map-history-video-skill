/**
 * Lists every map view used by src/timeline.json and its exact Mercator parameters,
 * so scripts/make_maps.py can paint a matching satellite background for each one.
 *   npx tsx scripts/map-views.ts && .venv-tts/bin/python scripts/make_maps.py      (= npm run maps)
 */
import fs from "node:fs";
import path from "node:path";
import { resolveShots } from "../src/lib/shots";
import { projectionFor } from "../src/lib/geo";
import { viewKey } from "../src/lib/mapkey";
import { geoMercator } from "d3-geo";
import { find } from "../src/lib/geo";
import { mapThumbFit, mapThumbKey, mapThumbTarget } from "../src/ThumbFlags";

const ROOT = path.join(__dirname, "..");
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, "src/timeline.json"), "utf8"));
const views: Record<string, { k: number; tx: number; ty: number; focus: string[] }> = {};
// vertical Shorts (src/vshorts.json) use the same map backgrounds
const vs = fs.existsSync(path.join(ROOT, "src/vshorts.json")) ? JSON.parse(fs.readFileSync(path.join(ROOT, "src/vshorts.json"), "utf8")) : {};
const allScenes = [...tl.scenes, ...Object.values(vs).flatMap((v: any) => v.scenes)];
for (const s of allScenes) {
  for (const sh of resolveShots(s)) {
    if (sh.type !== "map" || sh.style === "flat") continue;
    const margin = sh.margin ?? 0.2;
    const key = viewKey(sh.focus, margin);
    if (views[key]) continue;
    const p = projectionFor(sh.focus, margin);
    const [tx, ty] = p.translate();
    views[key] = { k: p.scale(), tx, ty, focus: sh.focus };
  }
}
// "map" style thumbnail: one view with the same fit as src/ThumbFlags.tsx
if (tl.thumbnail?.style === "map") {
  const c = tl.thumbnail, fit = mapThumbFit(c);
  const p = geoMercator().fitExtent(fit, mapThumbTarget(c) as any);
  const [tx, ty] = p.translate();
  views[mapThumbKey(c)] = { k: p.scale(), tx, ty, focus: c.focus };
}
// thumbnail halves (same fits as src/Thumbnail.tsx)
if (tl.thumbnail && !tl.thumbnail.style) {
  const W = 1920, MID = 960, c = tl.thumbnail;
  for (const [focus, fit] of [[c.left ?? "Japan", c.leftFit ?? [[40, 230], [600, 1060]]], [c.right ?? "China", c.rightFit ?? [[MID + 40, 250], [W - 80, 1000]]]] as any) {
    const key = "t" + viewKey([focus], JSON.stringify(fit) as any);
    const p = geoMercator().fitExtent(fit, { type: "FeatureCollection", features: find([focus]).map((x) => x.f) } as any);
    const [tx, ty] = p.translate();
    views[key] = { k: p.scale(), tx, ty, focus: [focus] };
  }
}
fs.mkdirSync(path.join(ROOT, "public/maps"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "public/maps/views.json"), JSON.stringify(views, null, 1));
console.log(`${Object.keys(views).length} map views`);

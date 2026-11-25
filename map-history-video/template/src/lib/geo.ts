import { geoMercator, geoPath, GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
// @ts-ignore json import
import topo from "world-atlas/countries-50m.json";
import { W, H } from "./anim";

const fc: any = feature(topo as any, (topo as any).objects.countries);
export const COUNTRIES: { name: string; f: any }[] = fc.features.map((f: any) => ({ name: f.properties.name, f }));

export function find(names: string[]) {
  const set = new Set(names.map((n) => n.toLowerCase()));
  const hits = COUNTRIES.filter((c) => set.has(c.name.toLowerCase()));
  const missing = names.filter((n) => !hits.some((h) => h.name.toLowerCase() === n.toLowerCase()));
  if (missing.length) console.warn("Unknown country names:", missing, "— see world-atlas names");
  return hits;
}

/** Projection framing the focus countries with some margin. */
export function projectionFor(focus: string[], margin = 0.18): GeoProjection {
  const feats = find(focus).map((c) => c.f);
  const p = geoMercator();
  const mx = W * margin, my = H * margin;
  p.fitExtent([[mx, my], [W - mx, H - my]], { type: "FeatureCollection", features: feats } as any);
  return p;
}

export function pathFor(p: GeoProjection) {
  return geoPath(p);
}

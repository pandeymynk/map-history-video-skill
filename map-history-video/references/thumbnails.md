# Thumbnails

The style that gets clicks for this niche: a vivid satellite map (bright blue sea, saturated land), the subject country glowing red with a white outline, big black label boxes in a heavy font, and often a large colour cut-out of a person on the right. It reads instantly at phone size.

Render with `scripts/mapthumb.sh <name> '<json>'` → `out/<name>-thumbnail.png` (1920×1080). It paints the satellite background for that exact framing, renders, and restores your timeline. Convert to JPG under 2 MB for YouTube: `sips -s format jpeg -s formatOptions 88 out/<name>-thumbnail.png --out out/<name>-thumbnail.jpg` (macOS) or `ffmpeg -i in.png -q:v 3 out.jpg`.

## Layout A — one country, label + face

```bash
sh scripts/mapthumb.sh pakistan '{"style":"map","focus":["Pakistan"],"fit":[[90,230],[1060,1030]],
  "labels":["PAKISTAN","1947 - 2026"],
  "face":{"src":"images/pakistan/leader-cut.png","x":1180,"y":110,"w":760,"h":1010}}'
```
- `fit` is the box `[[x0,y0],[x1,y1]]` the focus countries are fitted into — keep it on the left so the face has room.
- `labels`: big name + a smaller line (a date range like "1880 - 2026" works well; `smallSize`, `bigSize` adjust).
- `face`: a transparent PNG cut-out. On macOS make one with `swift scripts/cutout.swift photo.jpg person-cut.png` (Vision framework). Elsewhere use any background-removal tool. Crop away podiums, logos and other people (e.g. with Pillow) so only the person remains, and let the image run off the bottom edge.

## Layout B — comparison with arrows

```bash
sh scripts/mapthumb.sh haiti '{"style":"map","focus":["Haiti","Dominican Rep."],"highlight":["Haiti"],"green":["Dominican Rep."],
  "fit":[[160,360],[1760,1000]],
  "tags":[{"text":"POOR","x":430,"y":230,"to":[720,640]},{"text":"RICHER","x":1430,"y":230,"to":[1300,560]}]}'
```
- `highlight` glows red, `green` glows green.
- `tags`: label boxes with a curved white arrow from the box to the point `to` (pixel coordinates). After rendering, check each arrow ends on the right country's land, not in the sea, and adjust `to`.

## Gotchas
- Countries that cross the date line or have far-away islands (Russia, USA, France, Chile) break automatic framing. Use `"fitBox": [[lonW, latS], [lonE, latN]]` to frame a longitude/latitude box instead, e.g. Russia: `"fitBox":[[28,42],[178,74]]`.
- Keep text to 1–3 words per box. Use CAPS. Avoid the bottom-right corner (YouTube's duration badge).
- Credit the face photo in the video description ("Thumbnail: … licence").
- Always open the PNG and look at it before using it.

## Updating thumbnails of older videos
Re-render old episodes in this style and replace their thumbnails in YouTube Studio (Video details → Thumbnail → Upload file → Save). Consistent thumbnails help a channel look professional.

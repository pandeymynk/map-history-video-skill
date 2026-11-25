# Native vertical Shorts (`VShort`)

Cropped clips of the long video do poorly as Shorts. Instead, write 3–4 standalone Shorts per topic, each telling one surprising mini-story in 30–50 seconds, built from full-screen graphics and real photos.

## Writing a Short

- **60–90 words.** First sentence is the hook and must make sense on its own ("In 1913, Argentina was richer than France.").
- One idea per Short: a shocking number, a twist, a "why".
- End with a question or a cliffhanger; the composition adds a "FULL STORY ON THE CHANNEL" card and an animated subscribe button automatically.
- 4–6 scenes; each scene = one visual (optionally more via `shots` with cue words, same rules as the long video).

Write a generator like `examples/make_vshorts_haiti.py` that writes `episode/vshorts/<id>.json`, then:

```bash
python3 scripts/make_vshorts_<name>.py
sh scripts/vshorts.sh <id1> <id2> <id3>          # voices each Short (TL_OUT keeps src/timeline.json untouched) and rebuilds src/vshorts.json
npm run maps                                      # if the Shorts use new map views
npx remotion render VShort out/vshort-<id>.mp4 --props='{"id":"<id>"}'
sh scripts/finalize.sh out/vshort-<id>.mp4 out/vshort-<id>-final.mp4
sh scripts/shrink.sh "$PWD/out/vshort-<id>-final.mp4" "$PWD/out/vshort-<id>-upload.mp4"   # ~9 MB copy if an uploader needs < 10 MB
```

## File format

```json
{
 "title": "SAME ISLAND, / TWO FATES",
 "shortTitle": ["SAME ISLAND,", "TWO FATES"],      // hook title: big for 2.5 s, then a small header
 "localVoice": "am_michael", "localSpeed": 1.08,
 "scenes": [ { "type": "...", ..., "narration": "...", "shots": [] } ]
}
```

## Visual types

| type | fields | use for |
|---|---|---|
| `photo` | `src`, `caption`, `sub`, `move` (in/out/left/right), `focus`, `old`, `fit: "contain"` | real people and places, full screen |
| `map` | like the long video (`focus`, `highlight`, `color`, `margin`, `markers`, `routes`) + `caption`; default fills the full height (good for tall countries). `mapScale: 1.0` + `bg` photo = a framed map card for wide regions | where it happened |
| `stat` | `value` or `count` (animated count-up) + `prefix`/`suffix`/`decimals`, `label`, `sub`, `bg` | one shocking number |
| `vs` | `title`, `unit`, `left`/`right`: `{name, value, num, color}`, `bg` | two-bar comparison |
| `bars` | `title`, `items: [{label, pct (0–100), text, color?}]`, `bg` | 2–4 horizontal bars |
| `icons` | `icon` ("person" or an emoji), `n` (highlighted), `of` (total), `cols`, `label`, `sub`, `bg` | "22 families", "16 : 1" |
| `steps` | `title`, `items: [{text, cue}]`, `bg` | numbered cycle / causes, each appears on its cue word |
| `text` | `text`, `by`, `bg` | a big statement |

`bg` is a darkened, slowly zooming real photo behind a graphic — always set it, it keeps Shorts feeling real instead of flat.

Captions are automatic (3-word chunks, the spoken word turns yellow). The brand name comes from `src/brand.json`.

## Checks before publishing
- Grab 4–5 frames per Short (`ffmpeg -ss <t> -i file.mp4 -frames:v 1 frame.jpg`) and look: maps fully in frame, numbers readable, no text hidden behind the subscribe button.
- Photo paths need the file extension (`images/<name>/key.jpg`) — a missing extension fails the render with a 404.
- Title on YouTube: ≤60 characters, ends with `#shorts`; description: 2 sentences, link to the long video, credits.

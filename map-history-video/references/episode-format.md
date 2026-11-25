# Episode format (`episode/<name>.json`)

An episode is a JSON file that `npm run voice:local -- episode/<name>.json` turns into `src/timeline.json` (adds audio files, word timings and durations). Write it with a small Python generator (see `examples/make_haiti.py`) rather than by hand: helper functions keep 40 scenes readable and let you reuse colours and map views.

## Top level

```json
{
  "title": "Why Haiti Is Poor While the Dominican Republic Is Rich",
  "localVoice": "am_michael",     // Kokoro voice (am_michael, af_heart, bm_george, am_adam, bf_emma…)
  "localSpeed": 1.08,             // 1.0–1.15 sounds natural
  "captions": false,              // burnt-in captions on the long video (subtitles go in the .srt instead)
  "guide": true,                  // small explorer character on map shots
  "scenes": [ ... ]
}
```

## Scenes and shots

A **scene** is one block of narration (one audio file). Its own fields are the *first* visual. Extra visuals go in `shots`; each starts when its `cue` word is spoken (the first word that *starts with* the cue, case-insensitive), or at `at` seconds into the scene.

```json
{
  "type": "map", "focus": ["Haiti", "Dominican Rep."], "highlight": ["Haiti"], "color": "#d1343a", "date": "1804",
  "narration": "On the first of January 1804, Haiti declared independence. It was the first free Black republic in the world.",
  "shots": [
    { "cue": "free", "type": "image", "src": "images/haiti/dessalines.jpg", "caption": "Jean-Jacques Dessalines", "sub": "1804", "old": true, "fit": "contain" }
  ]
}
```

Rules that keep it working:
- Cues must be in the scene's narration and in the order the shots are listed. `npm run check` flags cues that are missing or out of order.
- Pick a cue word that is not said earlier in the same scene (a cue of `"haiti"` fires on the first "Haiti", which is often too early). Numbers work as cues (`"1914"`).
- Every shot inherits the scene's `date` tag unless it sets its own.
- One shot every 4–6 s. A 15-second narration block usually wants 2–3 shots.

## Visual types

### `map`
```json
{ "type": "map", "focus": ["Argentina", "Uruguay", "Paraguay"], "highlight": ["Argentina"], "color": "#2f7fd1",
  "margin": 0.2, "label": "THE PAMPAS",
  "markers": [{ "cue": "rosario", "pos": [-60.64, -32.95], "label": "Rosario" }],
  "routes": [{ "cue": "beef", "path": [[-58.4, -34.6], [-30, 0], [-0.13, 51.5]], "label": "beef to Britain" }],
  "flag": { "kind": "stripes", "dir": "h", "colors": ["#74acdf", "#ffffff", "#74acdf"] } }
```
- `focus` decides the framing (countries fitted into the frame with `margin`, default 0.2); `highlight` gets the colour. Coordinates are `[longitude, latitude]`.
- Country names follow the Natural Earth / world-atlas set: e.g. `"United States of America"`, `"United Kingdom"`, `"Dominican Rep."`, `"Falkland Is."`, `"Czechia"`, `"Bosnia and Herz."`, `"Central African Rep."`, `"S. Sudan"`. If a name is wrong the console warns "Unknown country names".
- Countries with far-flung islands stretch the frame (Chile → Easter Island, France and the Netherlands → overseas territories, USA → Alaska/Hawaii, Denmark → Greenland, Russia crosses the date line, Ecuador → Galápagos). Leave them out of `focus` and frame with neighbours instead.
- `markers`/`routes` animate at their `cue`/`at`. `flag` fills the highlighted country with a flag pattern (`solid`, `stripes`, `circle`).
- After adding map views run `npm run maps` to paint their satellite backgrounds (cached by view).

### `image` (real photo, full screen with slow zoom)
```json
{ "type": "image", "src": "images/<name>/<key>.jpg", "caption": "Avenida de Mayo, Buenos Aires", "sub": "around 1910",
  "move": "in", "old": true, "fit": "contain", "focus": [0.5, 0.4] }
```
`move`: in / out / left / right / up / down. `old: true` gives black-and-white + film grain for archive photos. `fit: "contain"` for tall portraits (blurred backdrop fills the sides). `focus` is the point to keep in frame (0–1).

### `info` (animated infographic on paper)
- `kind: "bars"` — `{ "title", "sub", "items": [{ "label", "value", "color" }] }`
- `kind: "compare"` — two big numbers side by side: `{ "title", "items": [{ "label", "value": "~$1,700", "sub", "color" }, {...}] }`
- `kind: "units"` — rows of little figures: `{ "title", "per": "1 figure = 1 million", "groups": [{ "label", "count": 15, "color" }] }`
- `kind: "line"` — `{ "title", "sub", "points": [[2021, 9], [2023, 38]], "points2"?, "names"?, "xlabels": ["2021","2023"], "marker": { "x": 2023, "label": "~38%" } }`

### `quote`
`{ "type": "quote", "text": "Tariff = a tax on goods from abroad.", "by": "in simple words", "mood": "paper" | "dark" }` — use "in simple words" cards whenever a term may be unfamiliar.

### `questions` (the video's spine / checklists)
`{ "type": "questions", "items": ["Was it geography?", "Was it history?", "Or choices?"], "show": 2, "done": [0] }` — `show` reveals the first N items, `done` ticks items off. Use it in the intro and again in the final answer.

### `title` (chapter card)
Its own scene with empty narration: `{ "type": "title", "text": "CHAPTER 2 · THE RICHEST COLONY", "narration": "", "hold": 2 }`. Chapter cards also become the YouTube chapters.

### Extras
- `labels`: handwritten keyword pop-ups on any shot — `[{ "cue": "tiny", "text": "smaller than West Virginia", "y": 150 }]`.
- `guide`: `false` hides the explorer character on a map; a string like `"surprised"` sets its mood.
- `type: "room"` (cartoon characters with speech bubbles) exists for dialogue scenes; see `src/scenes/RoomScene.tsx`.

## Working with the timeline

`npm run voice:local` writes `src/timeline.json` — that is what the renderer and `npm run srt` read. Keep a copy per episode (`cp src/timeline.json episode/<name>.timeline.json`) so you can switch between episodes without re-voicing. If you only change visuals, copy the new `shots`/scene fields from the regenerated episode into the saved timeline (match scenes by index and check the narration is unchanged) instead of running the voice again.

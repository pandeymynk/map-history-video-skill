# Style guide — "Entire History" explainer format

Reference studied: a popular 48-minute "entire history of a country" explainer.
Measured from the actual file: 48:28 long, 7,106 words (~146 words/min), 618 visual cuts
(a new visual every **4.7 s**, steady from minute 0 to minute 48 — the pace never drops).

---

## 1. Script structure

| Part | Length | What it does |
|---|---|---|
| **Cold-open hook** | ~90 s | Rapid list of 12–15 surprising present-day facts, then an "And yet…" twist |
| **The spine** | ~10 s | 2–3 big questions shown on screen as a numbered checklist (rise? fall? rise again?) |
| **"To find out, we go back…"** | 1 line | Jump to the starting point in time |
| **Chapters** | 4–8 min each | Chronological, each ends on a cliffhanger line |
| **Payoff** | ~2 min | Answer the spine questions explicitly ("Partly because… partly because… and partly because…") |
| **Nuance beat** | ~30 s | "But here's the thing. Both things are true." — the dark side, told plainly |
| **Closing line** | 1 line | A quotable saying / callback ("God created the world, but the Dutch created the Netherlands") |
| **CTA** | 1 line | Point at the end-screen video: "If you thought this was wild, wait till you see this one" |

### Hook recipe (the most important 90 seconds)
1. Open on **today**, not on the past. Concrete, visual, slightly unbelievable facts.
2. Make numbers relatable: "smaller than West Virginia", "fewer people than Texas", "a bulb sold for the price of a house".
3. Use superlatives and records: "probably the richest place on earth", "second biggest food exporter in the world".
4. Pivot with **"And yet…"** to set up the mystery.
5. Ask the spine questions out loud **and** show them as a checklist card.

### Sentence-level rules
- Short declarative sentences. One idea per sentence. ~146 wpm when read.
- Turn often: "but" ~every 190 words, "so" ~every 250. ~34 questions per 48 min.
- **Mini-dialogue gags** inside narration (two characters, 2–4 lines, deadpan):
  *"Excuse me, is this your house?" "Yes, welcome."*
- **Myth vs. reality**: "According to the famous story… The real story is more complicated." Builds trust.
- Hedge uncertain claims with "reportedly", "probably", "historians still argue" — and show a small **"reportedly"** badge on screen.
- **Present-day payoffs**: connect the past to things the viewer knows (Brooklyn, Wall Street, cookie, Santa Claus).
- **Chapter cliffhangers**: "But by the 1670s, the Republic had too many enemies — and one year would almost destroy it."
- **Cross-promote**: "as we saw in our video about the Medway Raid".
- Tone shifts are allowed: comedy → somber (Anne Frank = a single candle on black, no jokes).

---

## 2. Visual & editing style

**Pace:** a new visual every 4–6 s, the whole video. Every sentence or two gets its own image.

**Mix of media (all in one video):**
- Satellite-terrain maps (realistic land texture, deep blue sea), focus country in **red/orange**, animated route lines and arrows.
- Flat cartoon characters (simple stick limbs, period clothing, big heads) acting out scenes in simple sets (courtroom, office, palace, street).
- **Recurring mascot narrator**: one character who appears beside maps, points, reacts, is surprised — continuity across the whole video.
- Real photos (airport sign, bikes, tulip fields, aerial shots) and **public-domain engravings, paintings, B&W archive photos**.
- Infographics: unit icons ("1 figure = 1 million people"), bar charts, line chart with "GOLDEN AGE ?" marker, height ruler comparisons, podium (1st/2nd), cross-section diagrams (sea level).
- Object close-ups: microscope, tulip bulb, coins, documents.
- Question checklist cards (orange numbered pills).
- Timeline scroll / coins with years.

**Text on screen:**
- Small **date tag** top-left on every scene: `TODAY`, `1602`, `2,000 YEARS AGO`.
- Handwritten-style lowercase **keyword labels** that appear as the word is spoken ("a quarter below sea level", "the microscope", "tulip craze").
- **No full burned-in subtitles** — full captions live in YouTube CC instead.

**Camera:** slow pans/zooms on maps and stills; characters slide in; labels pop in.

---

## 3. Gap list — our first video vs. the reference

| Area | Reference | Ours (Japan vs China) | Fix |
|---|---|---|---|
| Shot length | **4.7 s** | ~24 s per scene | Split every scene into beats; change visual every 1–2 sentences |
| Visual types | 8+ kinds | 3 (map, room, title) | Add: infographic, photo/engraving, diagram, object, timeline, checklist card |
| Hook | 90 s fact barrage + spine card | 30 s, no checklist | Write 12+ "today" facts, show spine questions on screen |
| Mascot | Recurring guide character | None | Add one narrator character who appears on maps |
| On-screen text | Date tag + keyword labels | Full subtitles at bottom | Date tag on every scene, keyword pops; captions → YouTube CC |
| Myth-busting | "famous story… real story" | Once (stone boat) | 2–3 per video |
| Present-day payoffs | Many | Few | Add "you still see this today" beats |
| Ending | Answer + nuance + quote + CTA | Answer + "another video" | Add quotable line + end-screen CTA |
| Length | 37–70 min (channel norm) | 14 min | Target 35–45 min for this format |

---

## 4. Script tags for this pipeline (implemented — see README "Fast pacing")

Keep `[MAP]`, `[ROOM]`, `[TITLE]` and add:
- `[INFO]` infographic — `kind: bars | units | ruler | podium | line`
- `[IMAGE]` public-domain photo/engraving — `src`, `caption`, slow zoom
- `[DIAGRAM]` simple labelled diagram
- `[QUESTIONS]` the spine checklist card (re-shown at each chapter, ticking items off)
- `[BEAT]` inside any scene: a new visual or label keyed to a cue word, to hit the 4–6 s rhythm
- `date:` on every scene for the top-left tag

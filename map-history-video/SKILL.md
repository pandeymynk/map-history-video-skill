---
name: map-history-video
description: Make complete YouTube explainer videos about history, geography and economics in the "animated map documentary" style — e.g. "Why Haiti is poor while the Dominican Republic is rich", "How Dubai got rich without oil", "The entire history of X in 10 minutes". Covers topic research (find topics whose videos already got 400k+ views), writing a clear chaptered script, real public-domain/CC photos from Wikimedia Commons, NASA satellite maps with highlighted countries, a free local AI voice-over (Kokoro, no API key or credits), rendering a 1080p video with Remotion, -14 LUFS audio, subtitles, chapters, a click-worthy map thumbnail, and native vertical YouTube Shorts with graphics and word-by-word captions. Use this skill whenever someone wants to make a history/geography/economy/"why is country X rich or poor" video, a faceless educational YouTube video or Short, an animated map video, or a thumbnail with a glowing country on a map — even if they don't mention Remotion or this skill by name.
---

# Map History Video

Turn a topic into a finished, upload-ready package:

- `out/<name>-final.mp4` — 1920×1080 video, 7–12 min, a new visual every ~5 s, loudness −14 LUFS
- `out/<name>-captions.srt` — English subtitles
- `out/<name>-thumbnail.png` — glowing-country map thumbnail
- `out/<name>-youtube.txt` — title, description with chapters and photo credits, tags
- `out/vshort-<id>-final.mp4` — 3–4 vertical Shorts (1080×1920, 30–50 s)

Everything runs locally and free: Remotion renders the video, Kokoro speaks the narration, maps are painted from NASA's public-domain Blue Marble image, photos come from Wikimedia Commons.

## 0. Set up the project (once)

The ready-made project lives in this skill's `template/` folder. Copy it to a working folder the user chooses (for example `~/map-videos`) — never edit the skill folder itself — then run setup:

```bash
cp -R <skill-dir>/template ~/map-videos && cd ~/map-videos
sh scripts/setup.sh      # npm install, Python venv with Kokoro, sound effects, NASA map image, demo voice
```

Needs Node.js 18+, Python 3.10–3.12 and ffmpeg. The first voice run downloads the Kokoro model (~330 MB). Then ask the user for their channel name and put it in `src/brand.json` (`channel`, `handle`) — it appears on Shorts end cards and in the subscribe line. Check the install with `npx remotion render HistoryVideo out/demo.mp4` (≈40 s demo).

All commands below run from the project folder.

## 1. Pick a topic that already proves demand

Don't guess. Search YouTube for the topic family and look at view counts and upload dates. A good topic has **several videos with 400k+ views, ideally at least one from a small channel in the last few months** (that proves the audience is there now, not just for a big brand). Read `references/research.md` for a quick script that lists search results with views, and for the formats that work best ("Why X is rich/poor", "X vs Y on the same island", "How X went from rich to poor", "The entire history of X").

Tell the user which topic you picked and why (the numbers), then continue.

## 2. Research the facts and write the script

The video lives or dies on clarity. Write for a curious 14-year-old: short sentences, one idea each, every number made concrete ("about six times more", "smaller than West Virginia"). Follow `references/style-guide.md` for structure (hook on today → 3 spine questions → chapters → explicit answer → hopeful close) and pacing.

Accuracy matters because viewers fact-check in the comments. Use round, sourced figures (World Bank, IMF, UN, Maddison Project), say "about"/"by some estimates" when sources disagree, and avoid disputed claims as facts.

Write the episode as a small Python generator, `scripts/make_<name>.py`, that writes `episode/<name>.json`. Copy the structure of `examples/make_haiti.py` — it has helper functions (`M` map, `P` photo, `C` compare, `B` bars, `U` units, `Q` quote, `T` chapter title, `c(cue, shot)`) that keep scripts readable. The JSON format — scenes, shots, cue words, every visual type and its options — is documented in `references/episode-format.md`. Read it before writing the first script.

Key ideas:
- A **scene** = one narration block (one audio file). Each scene shows several **shots** that switch when a **cue word** is spoken, so the picture changes every 4–6 s.
- Aim for ~1,100–1,500 words (8–10 min), 15–30 map shots, 12–20 photos, chapter title cards.
- Cue words must appear in that scene's narration, in order. `npm run check` reports problems.
- End with a question for the comments and a subscribe card using the brand name from `src/brand.json`.

## 3. Collect real photos (free licences only)

```bash
python3 scripts/commons_search.py "Toussaint Louverture portrait" "Port-au-Prince 2010 earthquake"
python3 scripts/commons_fetch.py <name> "toussaint=Portrait de Toussaint Louverture, à cheval1.jpg" "quake=Earthquake damage in Port-au-Prince 2010-01-15.jpg"
```

Only use results marked Public domain, CC0, CC BY or CC BY-SA, and credit every one in the description (`public/images/<name>/credits.json` collects author + licence automatically). Prefer historical photos of the people and places in the story, plus a few vivid present-day photos. Look at a contact sheet of what you downloaded before using it — some files are scans of the wrong thing. Reference photos in the script as `images/<name>/<key>.jpg`.

## 4. Voice, maps, check, render

```bash
npm run voice:local -- episode/<name>.json     # Kokoro voice + word timings → src/timeline.json
cp src/timeline.json episode/<name>.timeline.json
npm run maps                                    # paints a satellite background for every map view
npm run check                                   # pacing + cue-word order; fix any "!" lines
npx remotion render HistoryVideo out/<name>.mp4
sh scripts/finalize.sh out/<name>.mp4 out/<name>-final.mp4   # optional music bed + −14 LUFS
npm run srt && cp out/captions.srt out/<name>-captions.srt
```

The voice defaults to `am_michael` (warm US male). Other good free voices: `af_heart` (female, highest quality), `bm_george` (British). Set `"localVoice"`/`"localSpeed"` in the episode JSON. If the user wants to pick, generate a 10-second sample of 3–5 voices and let them listen.

A 10-minute render takes roughly 20–40 minutes; run it in the background. If the render log shows almost no progress for several minutes and CPU is idle, it is stuck: stop it and run it again.

**Review before you call it done.** Pull ~24 evenly spaced frames into a contact sheet and look at them: maps should frame the right region, photos should be the right people, no empty or broken cards. Common fixes are in `references/troubleshooting.md` (for example, a map that shows the whole world because a country in `focus` has far-away islands — drop that country from `focus` and frame with its neighbours).

After visual-only fixes (shots, maps, photos), patch the shots into `episode/<name>.timeline.json` and `src/timeline.json` instead of re-voicing, since the narration and timings did not change.

## 5. Thumbnail

Bright satellite map, the country glowing red (and the richer one green for comparisons), black label boxes, an optional big colour cut-out face on the right. See `references/thumbnails.md` for the two layouts ("COUNTRY / 1880 - 2026" with a face, and "POOR → / ← RICHER" arrows) and exact commands. Always look at the rendered PNG: check arrows point at land, labels don't cover the country, and no logos from the source photo leak in.

## 6. Shorts (native vertical, not cropped clips)

Write 3–4 standalone Shorts per video, each with its own 60–90-word script and a strong hook in the first line. They use the `VShort` composition: full-screen real photos, big animated numbers, versus bars, icon grids, step lists, vertical maps and word-by-word captions. Format and commands: `references/shorts.md`. Cropped clips of the long video perform much worse than native Shorts.

## 7. Upload package

Write `out/<name>-youtube.txt` with: title (≤70 characters, one or two CAPITALISED key words), a two-paragraph description, chapters from the chapter title cards (`0:00 Intro` first), "Figures are rounded and approximate", the channel line, 3–5 hashtags, photo credits from `credits.json`, "Satellite imagery: NASA Blue Marble (public domain)", and tags. `references/upload.md` has the template and a scheduling routine (space uploads about 2 hours apart; Shorts before and after the main video).

Uploading itself is the user's call. If you help through a browser, the user picks large video files in the file dialog themselves, and always check that the file name and duration shown by YouTube match the intended video before filling in details.

## Ground rules

- Free and local by default. Don't add paid APIs or ask for keys unless the user asks.
- Licences: only free-licence photos, credited; no copyrighted music (the user can drop their own royalty-free tracks into `assets/music/`). Fonts are OFL, maps are public domain, sound effects are generated.
- Keep the user's private details (channel IDs, emails, file paths) out of any files you share.
- Report honestly: say what was rendered and checked, and what wasn't.

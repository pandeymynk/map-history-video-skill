# Upload package and scheduling

## `out/<name>-youtube.txt` template

```
TITLE
Why HAITI Is Poor While the DOMINICAN REPUBLIC Is Rich

DESCRIPTION
<2–3 sentences: the paradox with one or two concrete numbers, then "Why?">

<1 sentence listing the story beats, ending "explained step by step with maps.">

Chapters
0:00 Intro: <hook in 3–5 words>
0:54 One Island, Two Halves
...                                   ← from the chapter title cards (time where each title scene starts)

Figures are rounded and approximate (World Bank, IMF, UN and other public estimates).

<One line about the channel>
Subscribe for new videos every week: <handle from src/brand.json>

#topic #history #geography #economy

Photo credits (Wikimedia Commons)
- <file title>: <author>, <licence>          ← one line per entry in public/images/<name>/credits.json
- Thumbnail: <file title>: <author>, <licence>
Satellite imagery: NASA Blue Marble (public domain).

TAGS
<12–16 comma-separated search phrases people actually type>
```

Chapter times: sum the `duration` of scenes before each `type: "title"` scene in the saved timeline (a small Python loop over `episode/<name>.timeline.json`). YouTube needs the first chapter at 0:00 and at least three chapters of 10 s+.

## Upload checklist (YouTube Studio)
1. Upload the `-final.mp4`. **Before typing anything, check the file name and duration YouTube shows** — picking the wrong file (an old Short instead of the new video) is the most common mistake.
2. Title, description, thumbnail (JPG < 2 MB), "No, it's not made for kids", tags under "Show more".
3. Video elements: Subtitles → Upload file → With timing → the `.srt`; End screen → import from an earlier video or use the "1 video, 1 subscribe" template.
4. Visibility → Schedule (or Publish). If YouTube is still "checking", you can schedule anyway; it finishes before the publish time.

## A posting rhythm that works
- Space every upload (video or Short) **about 2 hours apart**; many uploads at once compete with each other.
- One long video a day or every other day, in the evening of the main audience's time zone.
- Two Shorts before the long video (morning/afternoon) and two after it (evening). Shorts posted after the video can link to it in the description.
- Wrong uploads that were never published can stay as private drafts; delete them only when you're sure (deletion is permanent).

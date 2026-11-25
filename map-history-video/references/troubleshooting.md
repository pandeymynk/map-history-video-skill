# Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| A map shows the whole world / the country is tiny | A country in `focus` has far-away territory (Chile → Easter Island, France, the Netherlands → Caribbean islands, USA, UK, Denmark → Greenland, Ecuador → Galápagos, Norway → Svalbard) or crosses the date line (Russia, Fiji) | Drop it from `focus` and frame with neighbours; for thumbnails use `fitBox` |
| "Unknown country names" warning, nothing highlighted | Name not in Natural Earth spelling | Use e.g. `Dominican Rep.`, `United States of America`, `Falkland Is.`, `Bosnia and Herz.`, `Côte d'Ivoire` |
| Map has no satellite image (flat green) | `npm run maps` not run after adding the view | Run `npm run maps`, then render again |
| Render fails: "Error loading image … 404" | Photo path wrong or missing `.jpg` | Check `public/images/<name>/` and the `src` value |
| Render progress stops, CPU near 0 % for minutes | Chrome renderer hung | Stop it and render again (`--timeout=60000` helps) |
| `npm run check` says a shot starts before the one above | Cue word appears earlier in the narration | Pick a later, unique cue word |
| A shot never appears | Cue word not in the narration | Change the cue, or use `"at": <seconds>` |
| Voice step exits with an espeak "phontab" error | espeak-ng can't read data from very long paths | `scripts/tts_local.py` copies it to a short temp path automatically; if it still fails, move the project to a shorter folder |
| Voice step: "No virtual environment found" / spaCy download error | English model missing | `uv pip install --python .venv-tts/bin/python en_core_web_sm@https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl` |
| `kokoro` won't install | Python too new/old | Kokoro needs Python 3.10–3.12; install `uv` and rerun `sh scripts/setup.sh` |
| Wikimedia downloads fail with 429 | Rate limit | Wait a minute; `commons_fetch.py` already backs off and retries |
| Audio too quiet/loud on YouTube | Not normalised | Always run `scripts/finalize.sh` (−14 LUFS) |
| Words in two captions run together | Very long words at large size | Shorten the narration word or lower the caption size in `src/VShort.tsx` |

Contact sheet for review (24 frames of a video):
```bash
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/<name>-final.mp4)
mkdir -p out/sheet; for i in $(seq 0 23); do ffmpeg -v error -y -ss $(python3 -c "print($D*($i+0.5)/24)") -i out/<name>-final.mp4 -frames:v 1 -vf scale=480:-1 out/sheet/$(printf %02d $i).jpg; done
.venv-tts/bin/python -c "from PIL import Image;import glob;f=sorted(glob.glob('out/sheet/*.jpg'));im=Image.new('RGB',(1920,1620));[im.paste(Image.open(x),((i%4)*480,(i//4)*270)) for i,x in enumerate(f)];im.save('out/sheet.jpg')"
```

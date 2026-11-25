# sh scripts/vshorts.sh pk-v1 pk-v2 ...  -> voices each episode/vshorts/<id>.json (Kokoro, free) and rebuilds src/vshorts.json
cd "$(dirname "$0")/.."
for id in "$@"; do
  TL_OUT=episode/vshorts/$id.timeline.json npm run -s voice:local -- episode/vshorts/$id.json > /dev/null || exit 1
done
python3 - <<'PY'
import json, glob, os
out = {}
for f in sorted(glob.glob("episode/vshorts/*.timeline.json")):
    id = os.path.basename(f).replace(".timeline.json", "")
    src = json.load(open(f"episode/vshorts/{id}.json"))
    tl = json.load(open(f))
    out[id] = {"title": src["shortTitle"], "scenes": tl["scenes"]}
    print(id, round(sum(s["duration"] for s in tl["scenes"]), 1), "s")
json.dump(out, open("src/vshorts.json", "w"), ensure_ascii=False)
PY

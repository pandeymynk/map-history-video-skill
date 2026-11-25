# sh scripts/mapthumb.sh <name> '<thumbnail json>'  -> out/<name>-thumbnail.png in the vivid "map" style
cd "$(dirname "$0")/.."
cp src/timeline.json out/.timeline-keep.json
python3 - "$1" "$2" <<'PY' || exit 1
import json, os, sys
f = f"episode/{sys.argv[1]}.timeline.json"
t = json.load(open(f if os.path.exists(f) else "src/timeline.json"))
t["thumbnail"] = json.loads(sys.argv[2])
json.dump(t, open("src/timeline.json", "w"), ensure_ascii=False)
PY
npm run -s maps > /dev/null && npx remotion still Thumbnail "out/$1-thumbnail.png" --log=error
cp out/.timeline-keep.json src/timeline.json

"""
Check demand before making a video: list the top YouTube search results for each query with
views, age and channel, so you can see which topics already pull 400k+ views.

  python3 scripts/yt_research.py "why argentina is poor" "haiti vs dominican republic" "why poland got rich"
  python3 scripts/yt_research.py --min 400000 "why is X poor" ...      (only show videos above a view count)

Uses YouTube's public search page (no API key). If it ever returns nothing (consent page, layout
change), search in a browser instead and read the view counts from the results.
"""
import json, re, sys, urllib.parse, urllib.request

def views(text):
    m = re.match(r"([\d,.]+)\s*([KMB]?)", (text or "").replace(" ", " "))
    if not m: return 0
    n = float(m.group(1).replace(",", "")); return int(n * {"": 1, "K": 1e3, "M": 1e6, "B": 1e9}[m.group(2)])

def search(q):
    url = "https://www.youtube.com/results?hl=en&gl=US&search_query=" + urllib.parse.quote(q)
    html = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en-US"}), timeout=30).read().decode("utf-8", "ignore")
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    if not m: return []
    data = json.loads(m.group(1)); out = []
    def walk(o):
        if isinstance(o, dict):
            v = o.get("videoRenderer")
            if v:
                out.append({"title": v["title"]["runs"][0]["text"], "channel": (v.get("ownerText") or {}).get("runs", [{}])[0].get("text", ""),
                            "views": views((v.get("viewCountText") or {}).get("simpleText", "")), "age": (v.get("publishedTimeText") or {}).get("simpleText", ""),
                            "id": v.get("videoId")})
            for x in o.values(): walk(x)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(data)
    return out

def main():
    args = sys.argv[1:]; mn = 0
    if args[:1] == ["--min"]: mn, args = int(args[1]), args[2:]
    if not args: sys.exit(__doc__)
    for q in args:
        print(f"## {q}")
        for v in search(q)[:12]:
            if v["views"] >= mn:
                print(f"  {v['views']:>11,}  {v['age']:<14} {v['title'][:70]}  — {v['channel']}")
if __name__ == "__main__":
    main()

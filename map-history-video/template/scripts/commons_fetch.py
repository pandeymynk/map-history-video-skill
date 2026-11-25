"""
Download free-licence photos from Wikimedia Commons and record their credits.

  python3 scripts/commons_fetch.py <topic> "key=File title.jpg" "key2=Other file.jpg" ...
  python3 scripts/commons_fetch.py <topic> --list examples/haiti_photos.txt     (lines of key=File title)

Saves public/images/<topic>/<key>.jpg (1920 px wide) and adds each file's author + licence to
public/images/<topic>/credits.json, so you can paste exact credits into the video description.
Find candidate titles first with:  python3 scripts/commons_search.py "query one" "query two"
Only use files whose licence is Public domain, CC0, CC BY or CC BY-SA (credit them!) — the
search script prints the licence next to every result.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "map-history-video/1.0 (educational video tool)"}

def get(url, binary=False):
    for i in range(8):
        try:
            data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
            return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code == 429:  # Commons rate limit: back off and retry
                time.sleep(15 * (i + 1)); continue
            raise
    raise SystemExit("rate limited by Wikimedia, try again in a few minutes: " + url)

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    topic, args = sys.argv[1], sys.argv[2:]
    if args[0] == "--list": args = [l.strip() for l in open(args[1]) if "=" in l]
    out = os.path.join("public/images", topic); os.makedirs(out, exist_ok=True)
    cf = os.path.join(out, "credits.json")
    credits = json.load(open(cf)) if os.path.exists(cf) else {}
    with open(os.path.join(out, "list.txt"), "a") as lst:
        for arg in args:
            key, title = arg.split("=", 1)
            path = os.path.join(out, key + ".jpg")
            if not os.path.exists(path):
                url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + urllib.parse.quote(title) + "?width=1920"
                open(path, "wb").write(get(url, binary=True))
                lst.write(f"{key}={title}\n")
            q = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "titles": "File:" + title,
                "prop": "imageinfo", "iiprop": "extmetadata", "format": "json"})
            page = list(get(q)["query"]["pages"].values())[0]
            if "imageinfo" not in page: print("MISSING on Commons:", title); continue
            m = page["imageinfo"][0]["extmetadata"]
            artist = re.sub("<[^>]+>", "", m.get("Artist", {}).get("value", "unknown")).strip()
            artist = re.sub(r"(Unknown author)+", "unknown", artist)[:70] or "unknown"
            credits[key] = {"file": title, "artist": artist, "license": m.get("LicenseShortName", {}).get("value", "?")}
            print(f"{key}: {credits[key]['artist']} | {credits[key]['license']}", flush=True)
            time.sleep(3)  # be polite to Wikimedia
    json.dump(credits, open(cf, "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()

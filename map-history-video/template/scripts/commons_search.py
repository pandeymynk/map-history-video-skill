# Search Wikimedia Commons for free-licence photos (prints title, size and licence):  python3 scripts/commons_search.py "query one" "query two" ...
import json, sys, urllib.request, urllib.parse
UA = {"User-Agent": "map-history-video/1.0 (educational video tool)"}
def get(params):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({**params, "format": "json"})
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30))
for q in sys.argv[1:]:
    d = get({"action": "query", "generator": "search", "gsrsearch": q + " filetype:bitmap", "gsrnamespace": 6, "gsrlimit": 6,
             "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1600})
    print("##", q)
    for p in sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0)):
        ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
        lic = m.get("LicenseShortName", {}).get("value", "?")
        print(f'  {p["title"][5:]} | {ii["width"]}x{ii["height"]} | {lic}')

# Writes the native vertical Haiti / Dominican Republic Shorts: episode/vshorts/ht-v1..4.json (voice: sh scripts/vshorts.sh ht-v1 ...)
import json, pathlib
I = "images/haiti/"
HT, DR = "#d1343a", "#2e9e4f"
ISL = ["Haiti", "Dominican Rep."]
META = {"localVoice": "am_michael", "localSpeed": 1.08, "captions": False, "guide": False}

def sc(first, narration, *shots): return {**first, "narration": narration, "shots": list(shots)}
def c(cue, shot): return {"cue": cue, **shot}
def photo(src, caption=None, sub=None, **k): return {"type": "photo", "src": I + (src if "." in src else src + ".jpg"), "caption": caption, "sub": sub, **k}
def imap(hl, color, bg, caption=None, **k): return {"type": "map", "focus": ISL, "highlight": hl, "color": color, "margin": 0.32, "mapScale": 1.0, "bg": I + bg, "caption": caption, **k}

SHORTS = {
 "ht-v1": {"title": ["SAME ISLAND,", "TWO FATES"], "scenes": [
  sc(imap(ISL, "#c98a1b", "puntacana.jpg", "HISPANIOLA"),
     "This island is split between two countries. Haiti on the west, and the Dominican Republic on the east.",
     c("haiti", imap(["Haiti"], HT, "portauprince.jpg", "HAITI")), c("dominican", imap(["Dominican Rep."], DR, "santodomingo.jpg", "DOMINICAN REPUBLIC"))),
  sc({"type": "vs", "title": "INCOME PER PERSON", "unit": "2023, US$ a year, approx.", "bg": I + "santodomingo.jpg",
      "left": {"name": "HAITI", "value": "$1,700", "num": 1700, "color": HT}, "right": {"name": "DOMINICAN", "value": "$10,700", "num": 10700, "color": DR}},
     "Same island, same sun, same hurricanes. But the average Dominican earns about six times more."),
  sc(photo("border", "The border from space", "Haiti left, Dominican Republic right", move="in"),
     "You can even see it from space. The Haitian side is brown and bare. The Dominican side is green."),
  sc({"type": "steps", "title": "WHY?", "bg": I + "citadelle.jpg", "items": [
        {"text": "A DRIER, STEEPER HALF", "cue": "drier"}, {"text": "A HUGE DEBT FOR FREEDOM", "cue": "debt"}, {"text": "DICTATORS WHO LOOTED", "cue": "dictators"}, {"text": "LOST FORESTS", "cue": "forests"}]},
     "Why? Haiti got the drier, steeper half. It paid a huge debt for its freedom. Its dictators looted. And it lost its forests."),
 ]},
 "ht-v2": {"title": ["HAITI PAID FOR", "ITS FREEDOM?!"], "scenes": [
  sc(photo("battle", "Haiti's war of independence", "1802–1803", old=True),
     "In 1804, Haiti's former slaves defeated Napoleon's army and created the first free Black republic.",
     c("first", photo("dessalines", "Jean-Jacques Dessalines", "declared independence, 1804", old=True, fit="contain"))),
  sc({"type": "text", "text": "THEN FRANCE CAME BACK", "by": "1825", "bg": I + "fire1791.jpg"},
     "But in 1825, French warships arrived with a demand."),
  sc({"type": "stat", "value": "150M", "label": "FRANCS", "sub": "to pay the former slave owners", "bg": I + "plantation.jpg"},
     "Pay one hundred and fifty million francs to the former slave owners, or face a new war."),
  sc({"type": "stat", "count": 122, "label": "YEARS OF PAYMENTS", "sub": "1825 to 1947", "bg": I + "citadelle.jpg"},
     "Haiti had to borrow from French banks to pay. It kept paying those debts until 1947. One hundred and twenty two years."),
  sc(photo("portauprince", "Haiti today", "the poorest country in the Americas", move="left"),
     "Today, Haiti is the poorest country in the Americas. That debt is one big reason why."),
 ]},
 "ht-v3": {"title": ["THE RICHEST COLONY", "ON EARTH"], "scenes": [
  sc(imap(["Haiti"], "#1f4fa8", "plantation.jpg", "SAINT-DOMINGUE"),
     "In the seventeen eighties, this small French colony was the richest in the world."),
  sc({"type": "bars", "title": "EUROPE'S SUPPLY, 1780s", "bg": I + "plantation.jpg", "items": [
        {"label": "SUGAR", "pct": 40, "text": "~40%"}, {"label": "COFFEE", "pct": 60, "text": "~60%", "color": "#8b5a2b"}]},
     "By some estimates, it grew forty percent of Europe's sugar, and more than half of its coffee."),
  sc({"type": "icons", "icon": "person", "n": 16, "of": 17, "cols": 6, "label": "16 ENSLAVED : 1 WHITE", "sub": "Saint-Domingue, 1789, approx.", "bg": I + "planter.jpg"},
     "But it ran on slavery. For every white colonist, there were about sixteen enslaved people."),
  sc(photo("fire1791", "The uprising", "August 1791", old=True),
     "In 1791 they rose up, burned the plantations, and won. The richest colony became Haiti.",
     c("won", photo("toussaint", "Toussaint Louverture", "leader of the revolution", old=True, fit="contain"))),
  sc({"type": "text", "text": "SO WHY IS HAITI POOR TODAY?", "bg": I + "portauprince.jpg"},
     "So how did the richest colony become the poorest country?"),
 ]},
 "ht-v4": {"title": ["WHY HAITI", "LOST ITS TREES"], "scenes": [
  sc(photo("border", "Haiti–Dominican border", "seen from space", move="in"),
     "This is the border between Haiti and the Dominican Republic, seen from space."),
  sc({"type": "vs", "title": "HOW FAMILIES COOK", "unit": "roughly, today", "bg": I + "portauprince.jpg",
      "left": {"name": "HAITI", "value": "CHARCOAL", "num": 7, "color": HT}, "right": {"name": "DOMINICAN", "value": "GAS", "num": 7, "color": DR}},
     "Most Haitian families cook with charcoal, made from trees. Most Dominicans cook with gas."),
  sc(imap(["Dominican Rep."], DR, "santodomingo.jpg", "1967: LOGGING BANNED"),
     "In 1967, the Dominican president banned commercial logging and sent the army to enforce it. Later, he made cooking gas cheap."),
  sc(imap(["Haiti"], "#8a6d3b", "quake.jpg", "TREES CUT FOR FUEL"),
     "In Haiti, poverty meant cutting trees to survive. Without trees, rain washes the soil away, and floods get worse."),
  sc({"type": "text", "text": "POVERTY CUTS THE FOREST", "by": "and the lost forest deepens poverty", "bg": I + "border.jpg"},
     "Poverty cuts the forest, and the lost forest deepens the poverty."),
 ]},
}

out = pathlib.Path("episode/vshorts"); out.mkdir(parents=True, exist_ok=True)
for k, v in SHORTS.items():
    scenes = []
    for s in v["scenes"]:
        s = {kk: vv for kk, vv in s.items() if vv is not None}
        s["shots"] = [{kk: vv for kk, vv in x.items() if vv is not None} for x in s["shots"]]
        scenes.append(s)
    (out / f"{k}.json").write_text(json.dumps({"title": " / ".join(v["title"]), "shortTitle": v["title"], **META, "scenes": scenes}, ensure_ascii=False, indent=1))
    print(k, sum(len(s["narration"].split()) for s in scenes), "words")

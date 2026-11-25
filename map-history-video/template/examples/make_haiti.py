# Writes episode/haiti/{meta,1,2,3,4}.json — "Why Haiti Is Poor While the Dominican Republic Is Rich"
# (clear step-by-step explanations, lots of maps, real photos). Free Kokoro voice.
# Run from the project root:  python3 examples/make_haiti.py && npm run voice:local -- episode/haiti.json
import json, os
BRAND = json.load(open("src/brand.json"))["channel"]
os.makedirs("episode/haiti", exist_ok=True)
ISL = ["Haiti", "Dominican Rep."]
CAR = ["Cuba", "Haiti", "Dominican Rep.", "Jamaica", "Puerto Rico"]
ATL = ["France", "Spain", "Haiti", "Dominican Rep.", "Senegal", "Cuba"]
HT, DR, BOTH = "#d1343a", "#2e9e4f", "#c98a1b"
PAP, SDQ, CAP, PUJ = [-72.34, 18.54], [-69.93, 18.49], [-72.2, 19.76], [-68.37, 18.58]

def M(focus, hl, color=BOTH, **k): return {"type": "map", "focus": focus, "highlight": hl, "color": color, **k}
def P(key, cap=None, sub=None, **k):
    d = {"type": "image", "src": f"images/haiti/{key}.jpg", **k}
    if cap: d["caption"] = cap
    if sub: d["sub"] = sub
    return d
def U(title, label, n, color=HT, per=""): return {"type": "info", "kind": "units", "title": title, "per": per, "groups": [{"label": label, "count": n, "color": color}]}
def C(title, a, b, sub="approx."): return {"type": "info", "kind": "compare", "title": title, "items": [{"label": a[0], "value": a[1], "sub": sub, "color": a[2]}, {"label": b[0], "value": b[1], "sub": sub, "color": b[2]}]}
def B(title, sub, items): return {"type": "info", "kind": "bars", "title": title, "sub": sub, "items": [{"label": l, "value": v, "color": c} for l, v, c in items]}
def Q(text, by="", mood="paper"): return {"type": "quote", "mood": mood, "text": text, "by": by}
def T(text): return {"type": "title", "text": text, "narration": "", "hold": 2}
def c(cue, shot): return {"cue": cue, **shot}
QS = ["Was it geography?", "Was it history?", "Or was it choices?"]
FIVE = ["1. A drier, steeper half", "2. A colony built on slavery", "3. A huge debt for freedom", "4. Dictators who looted", "5. Lost forests and disasters"]

meta = {"title": "Why Haiti Is Poor While the Dominican Republic Is Rich", "localVoice": "am_michael", "localSpeed": 1.08,
        "captions": False, "guide": True}

p1 = [
 {**M(ISL, ISL, BOTH, date="TODAY", guide=False, margin=0.12),
  "narration": "There is an island in the Caribbean that is split between two countries. Same island, same sun, same hurricanes. On the west is Haiti. On the east is the Dominican Republic.",
  "labels": [{"cue": "caribbean", "text": "Hispaniola", "y": 150}],
  "shots": [c("west", M(ISL, ["Haiti"], HT, margin=0.12, label="HAITI")),
            c("east", M(ISL, ["Dominican Rep."], DR, margin=0.12, label="DOMINICAN REPUBLIC"))]},
 {**C("income per person, 2023", ("Haiti", "~$1,700", HT), ("Dominican Rep.", "~$10,700", DR), sub="US$ a year, approx."), "date": "TODAY",
  "narration": "But the average Dominican earns about six times more than the average Haitian. Dominicans live about ten years longer. And while the Dominican Republic is full of tourists, much of Haiti's capital is now controlled by gangs.",
  "shots": [c("live", C("life expectancy", ("Haiti", "~64 years", HT), ("Dominican Rep.", "~74 years", DR))),
            c("tourists", P("puntacana", "Punta Cana, Dominican Republic", "millions of tourists a year", move="left")),
            c("haiti's", P("portauprince", "Port-au-Prince, Haiti", "the capital", move="right"))]},
 {**P("border", "The border, seen from space", "Haiti on the left, the Dominican Republic on the right", move="in"),
  "narration": "You can even see the difference from space. In this NASA photo, the land on the Haitian side is brown and bare, while the Dominican side is green with forest.",
  "shots": []},
 {**M(CAR, ISL, BOTH, date="TODAY"),
  "narration": "So how did two countries on the same island end up so different? Was it geography? Was it history? Or was it the choices their leaders made? Let's go step by step.",
  "shots": [c("geography", {"type": "questions", "items": QS, "show": 1}), c("history", {"type": "questions", "items": QS, "show": 2}),
            c("choices", {"type": "questions", "items": QS})]},

 T("CHAPTER 1 · ONE ISLAND, TWO HALVES"),

 {**M(ISL, ISL, BOTH, date="GEOGRAPHY", margin=0.12, routes=[{"cue": "wind", "path": [[-66.6, 20.6], [-68.6, 19.6], [-70.4, 19.0]], "label": "rain from the trade winds"}]),
  "narration": "Start with the land itself. The wind and the rain here mostly come from the east. The clouds hit the island's mountains, and drop most of their rain on the Dominican side.",
  "labels": [{"cue": "mountains", "text": "Cordillera Central", "y": 150}]},
 {**M(ISL, ["Haiti"], HT, margin=0.12, label="DRIER · STEEPER"),
  "narration": "Haiti, on the west, is drier and much more mountainous. Even its name comes from the old Taino word for land of mountains. That means less flat land for farming, and soil that washes away easily.",
  "shots": [c("name", Q("Ayiti = \"land of mountains\"", "in the Taino language")),
            c("less", C("share of the island", ("Haiti", "about 1/3", HT), ("Dominican Rep.", "about 2/3", DR), sub="of the land"))]},
 {**P("columbus", "Columbus lands on Hispaniola", "December 1492", old=True, move="in"), "date": "1492",
  "narration": "In 1492, Christopher Columbus landed here and claimed the whole island for Spain. Within a few decades, most of the native Taino people had died from war, forced labour and European diseases.",
  "shots": [c("whole", M(ATL, ["Spain", "Haiti", "Dominican Rep."], "#c60b1e", routes=[{"at": 0.2, "path": [[-6, 37], [-40, 28], [-70, 19.5]], "label": "Spain claims the island"}]))]},
 {**M(ISL, ISL, "#c60b1e", date="1500s", margin=0.12, markers=[{"cue": "santo", "pos": SDQ, "label": "Santo Domingo"}]),
  "narration": "The Spanish built their capital, Santo Domingo, on the south east coast. But when they found richer lands in Mexico and Peru, most of them left. The western part of the island was almost empty.",
  "shots": [c("coast", P("zonacolonial", "Santo Domingo's colonial streets", "the oldest European city in the Americas", move="left")),
            c("western", M(ISL, ["Haiti"], "#7d7d7d", margin=0.12, label="ALMOST EMPTY"))]},
 {**M(ISL, ["Haiti"], "#1f4fa8", date="1697", margin=0.12, label="FRANCE"),
  "narration": "French pirates and settlers moved into that empty western part. And in 1697, Spain officially gave it to France. From now on, the island had two owners, and they would build two very different colonies.",
  "shots": [c("two", M(ISL, ["Dominican Rep."], "#c60b1e", margin=0.12, label="SPAIN"))]},

 T("CHAPTER 2 · THE RICHEST COLONY ON EARTH"),

 {**P("plantation", "Plantations near Port-au-Prince", "a French map of the 1700s", move="in"), "date": "1700s",
  "narration": "The French turned their side, called Saint-Domingue, into a giant sugar and coffee factory. By the 1780s, it was the richest colony in the world. By some estimates, it produced around forty percent of the sugar and more than half of the coffee drunk in Europe.",
  "shots": [c("1780s", B("Europe's supply from Saint-Domingue", "by some estimates, 1780s", [("sugar", 40, BOTH), ("coffee", 60, "#6f4e37")])),
            c("europe", M(ATL, ["Haiti", "France"], "#1f4fa8", routes=[{"at": 0.1, "path": [[-72.3, 19.2], [-40, 35], [-1.5, 46.5]], "label": "sugar & coffee to France"}]))]},
 {**M(ATL, ["Haiti"], HT, date="1700s", routes=[{"cue": "africa", "path": [[-16, 14.5], [-45, 15], [-72.3, 19]], "label": "enslaved Africans"}]),
  "narration": "But this wealth was built on slavery. Ships brought hundreds of thousands of people from Africa. By 1789, around half a million enslaved people lived in Saint-Domingue, against only around thirty thousand white colonists.",
  "shots": [c("half", B("people in Saint-Domingue, 1789", "approx.", [("enslaved", 500, HT), ("free people of colour", 28, "#9b6b3a"), ("white colonists", 31, "#1f4fa8")]))]},
 {**P("planter", "A French colonial planter", "1700s", old=True, move="in"),
  "narration": "They worked in brutal conditions. So many died that the colony needed a constant supply of new captives. All the profits went to France. Almost nothing was built for the people who did the work.",
  "shots": [c("profits", Q("The profits went to France. Almost nothing stayed.", "Saint-Domingue, 1700s", mood="dark"))]},
 {**M(ISL, ["Dominican Rep."], "#c60b1e", date="1700s", margin=0.12, label="SANTO DOMINGO"),
  "narration": "The Spanish side was very different. It was poor and quiet, with cattle ranches, small farms and far fewer slaves. Remember this, because it will matter later.",
  "shots": [c("fewer", C("population, 1789", ("French side", "~560,000", HT), ("Spanish side", "~125,000", DR), sub="approx."))]},
]

p2 = [
 T("CHAPTER 3 · THE PRICE OF FREEDOM"),

 {**P("fire1791", "The uprising of 1791", "a German engraving", old=True, move="in"), "date": "1791",
  "narration": "In 1791, the enslaved people of Saint-Domingue rose up. It became the only slave revolt in history that created a whole new country. Its greatest leader was a former slave named Toussaint Louverture.",
  "shots": [c("toussaint", P("toussaint", "Toussaint Louverture", "leader of the revolution", old=True, fit="contain"))]},
 {**M(ATL, ["Haiti", "France"], "#1f4fa8", date="1802", routes=[{"cue": "napoleon", "path": [[-1.5, 46.5], [-40, 32], [-72.2, 19.7]], "label": "Napoleon's army"}]),
  "narration": "In 1802, Napoleon sent a huge army to take the colony back and bring back slavery. But the former slaves fought on, and yellow fever killed thousands of French soldiers.",
  "shots": [c("former", P("battle", "The war for independence", "a Polish painting, 1845", old=True, move="left"))]},
 {**P("dessalines", "Jean-Jacques Dessalines", "declared independence, 1804", old=True, fit="contain"), "date": "1 JANUARY 1804",
  "narration": "On the first of January 1804, General Jean-Jacques Dessalines declared independence. The new country took back the old Taino name, Haiti. It was the first free Black republic in the world.",
  "shots": [c("free", M(ISL, ["Haiti"], HT, margin=0.12, label="HAITI · 1804"))]},
 {**P("citadelle", "Citadelle Laferrière", "built to defend against a French return", move="out"),
  "narration": "But Haiti was born in ruins. The plantations had burned, and a huge part of the population had died. The country was so afraid France would return that it built this giant mountain fortress.",
  "shots": [c("died", Q("Haiti was born in ruins.", "1804", mood="dark"))]},
 {**M(ATL, ["Haiti", "France"], "#1f4fa8", date="1825", routes=[{"cue": "warships", "path": [[-1.5, 46.5], [-40, 32], [-72.3, 18.6]], "label": "French warships"}]),
  "narration": "Then, in 1825, France sent warships and made an incredible demand. Haiti had to pay one hundred and fifty million francs to the former slave owners, or face a new war.",
  "shots": [c("one", Q("150 million francs", "France's demand, 1825, later cut to 90 million", mood="dark"))]},
 {**C("Haiti's 'independence debt'", ("first demand", "150m francs", HT), ("later cut to", "90m francs", HT), sub="1825 / 1838"),
  "narration": "In simple words, Haiti was forced to pay for its own freedom. The sum was many times what the government earned in a year. To pay it, Haiti borrowed from French banks, and kept paying those debts until 1947.",
  "shots": [c("borrowed", M(ATL, ["Haiti", "France"], "#1f4fa8", routes=[{"at": 0.1, "path": [[-72.3, 18.6], [-40, 32], [2.35, 48.85]], "label": "payments to Paris, until 1947"}])),
            c("1947", Q("Haiti kept paying for 122 years.", "1825 to 1947", mood="dark"))]},
 {**M(ISL, ISL, HT, date="1822–1844", margin=0.12, label="ONE ISLAND, ONE COUNTRY"),
  "narration": "Meanwhile, in 1822, Haiti took over the Spanish side too, and ruled the whole island for twenty two years. The Dominicans hated it. In 1844, they rose up and declared their own independence, not from Spain, but from Haiti.",
  "shots": [c("1844", M(ISL, ["Dominican Rep."], DR, margin=0.12, label="DOMINICAN REPUBLIC · 1844"))]},
 {**Q("Two neighbours, born from a war with each other.", "1844", mood="dark"),
  "narration": "So the two countries were born as rivals. Haiti was bigger in population, but poor, in debt and isolated. The United States did not even recognise Haiti until 1862, because it feared a free Black republic.",
  "shots": [c("united", M(["United States of America", "Haiti", "Dominican Rep.", "Cuba"], ["Haiti"], HT, label="NOT RECOGNISED UNTIL 1862"))]},
]

p3 = [
 T("CHAPTER 4 · DICTATORS ON BOTH SIDES"),

 {**M(["United States of America", "Haiti", "Dominican Rep.", "Cuba"], ISL, "#3c3b6e", date="1915–1934", routes=[{"cue": "marines", "path": [[-77, 38.9], [-74, 28], [-72.3, 18.6]], "label": "US Marines"}]),
  "narration": "In the early 1900s, both countries were unstable and in debt. So the United States sent in the marines. It occupied Haiti from 1915 to 1934, and the Dominican Republic from 1916 to 1924.",
  "shots": [c("haiti", C("US occupations", ("Haiti", "1915–1934", HT), ("Dominican Rep.", "1916–1924", DR), sub="years"))]},
 {**P("trujillo", "Rafael Trujillo", "ruled the Dominican Republic 1930–1961", old=True, fit="contain"), "date": "1930–1961",
  "narration": "After the Americans left, the Dominican Republic fell under Rafael Trujillo, one of the most brutal dictators in Latin America. He ruled for thirty one years, killed his opponents, and in 1937 his soldiers massacred thousands of Haitians along the border.",
  "shots": [c("1937", M(ISL, ISL, HT, margin=0.12, label="1937 · BORDER MASSACRE"))]},
 {**Q("He looted, but he also built.", "Trujillo's Dominican Republic", mood="dark"),
  "narration": "But Trujillo also built roads, ports, power plants and factories. He ran the country like his own company, but he did build things. When he was shot in 1961, the Dominican Republic had a working state to build on.",
  "shots": [c("shot", Q("Trujillo was assassinated in 1961.", "", mood="dark"))]},
 {**P("duvalier", "François 'Papa Doc' Duvalier", "ruled Haiti 1957–1971", old=True, fit="contain"), "date": "1957–1986",
  "narration": "Haiti got the Duvaliers. Papa Doc Duvalier, and then his son, Baby Doc, ruled from 1957 to 1986. Their secret police terrorised the country, and they stole huge amounts of money.",
  "shots": [c("baby", C("the Duvaliers", ("Papa Doc", "1957–1971", HT), ("Baby Doc", "1971–1986", HT), sub="years in power"))]},
 {**M(["United States of America", "Canada", "France", "Haiti", "Dominican Rep."], ["Haiti"], HT, date="1960s–80s",
      routes=[{"cue": "doctors", "path": [[-72.3, 18.6], [-73.6, 45.5]], "label": "Montreal"}, {"cue": "teachers", "path": [[-72.3, 18.6], [-74, 40.7]], "label": "New York"}, {"cue": "engineers", "path": [[-72.3, 18.6], [2.35, 48.85]], "label": "Paris"}]),
  "narration": "The difference is what they left behind. Trujillo looted, but he built. The Duvaliers mostly just looted. Thousands of Haiti's doctors, teachers and engineers fled abroad, and the country lost the very people it needed most.",
  "shots": []},

 T("CHAPTER 5 · THE GREEN BORDER"),

 {**P("border", "The Haiti–Dominican border from space", "brown on the left, green on the right", move="in"),
  "narration": "Now back to that photo from space. Why is one side so bare? Most Haitian families are poor, and cook with charcoal made from trees. Over decades, millions of trees were cut down for fuel and farmland.",
  "shots": [c("charcoal", U("how most Haitian families cook", "charcoal & wood", 7, "#5b4636", per="roughly 7 in 10 homes")),
            c("millions", M(ISL, ["Haiti"], "#8a6d3b", margin=0.12, label="FORESTS CUT FOR FUEL"))]},
 {**M(ISL, ["Dominican Rep."], DR, date="1967", margin=0.12, label="LOGGING BANNED"),
  "narration": "The Dominican Republic made a different choice. In 1967, President Balaguer banned commercial logging, and used the army to enforce it. Later, the government made cooking gas cheap, so families didn't need to burn trees.",
  "shots": [c("gas", C("how families cook", ("Haiti", "mostly charcoal", HT), ("Dominican Rep.", "mostly gas", DR), sub="today"))]},
 {**M(ISL, ["Haiti"], "#8a6d3b", margin=0.12, routes=[{"cue": "rains", "path": [[-72.6, 19.4], [-72.4, 18.8], [-72.34, 18.55]], "label": "soil washes away"}]),
  "narration": "Without trees, the heavy rains wash the soil off Haiti's steep hills. Farms produce less, rivers flood, and every hurricane does more damage. Poverty cuts the forest, and the lost forest deepens the poverty.",
  "shots": [c("poverty", Q("Poverty cuts the forest. The lost forest deepens poverty.", "the trap", mood="dark"))]},
]

p4 = [
 T("CHAPTER 6 · TWO ROADS"),

 {**M(ISL, ["Dominican Rep."], DR, date="1970s → TODAY", margin=0.12, markers=[{"at": 0.4, "pos": PUJ, "label": "Punta Cana"}, {"at": 0.9, "pos": SDQ, "label": "Santo Domingo"}]),
  "narration": "From the 1970s, the Dominican Republic bet on two things: tourism, and factories in special free trade zones. Beach resorts like Punta Cana grew from almost nothing. Santo Domingo became a modern city.",
  "shots": [c("beach", P("puntacana", "Bávaro beach, Punta Cana", "tourism became a giant industry", move="left")),
            c("santo", P("santodomingo", "Santo Domingo today", "the Dominican capital", move="right"))]},
 {**B("visitors to the Dominican Republic", "millions a year, approx.", [("1980", 0.5, DR), ("2000", 3, DR), ("2023", 10, DR)]), "date": "TODAY",
  "narration": "Today, around ten million visitors come every year. And for decades, the Dominican economy grew around five percent a year, one of the fastest in all of Latin America.",
  "shots": [c("decades", C("economic growth, recent decades", ("Dominican Rep.", "~5% a year", DR), ("Haiti", "~1% a year", HT), sub="approx."))]},
 {**M(ISL, ["Haiti"], HT, date="1986 → 2010", margin=0.12, markers=[{"at": 0.5, "pos": PAP, "label": "Port-au-Prince"}]),
  "narration": "Haiti never got that stable start. After the Duvaliers fell, it went through coups, foreign interventions and weak governments. Investors stayed away. Then, in January 2010, a huge earthquake struck right next to Port-au-Prince.",
  "shots": [c("earthquake", P("quake", "Port-au-Prince, January 2010", "after the earthquake", move="in"))]},
 {**P("palace", "Haiti's National Palace", "destroyed in the 2010 earthquake", move="out"), "date": "12 JANUARY 2010",
  "narration": "Over two hundred thousand people were killed. The presidential palace collapsed. The damage was bigger than Haiti's entire economy for a whole year.",
  "shots": [c("damage", C("2010 earthquake", ("damage", "~$8 billion", HT), ("Haiti's economy", "~$7 billion a year", "#5d6470"), sub="approx."))]},
 {**M(ISL, ["Haiti"], "#5d1a1a", date="2021 → TODAY", margin=0.12, markers=[{"cue": "capital", "pos": PAP, "label": "gangs control most of the capital"}]),
  "narration": "In 2021, Haiti's president was assassinated in his own home. Since then, armed gangs have taken over most of the capital. Hundreds of thousands of people have fled their homes.",
  "shots": [c("hundreds", U("Haitians forced from their homes", "hundreds of thousands", 7, HT, per="1 figure = 100,000"))]},

 T("CHAPTER 7 · SO, WHY?"),

 {**M(ISL, ISL, BOTH, date="1492 → TODAY", margin=0.12),
  "narration": "So, why is Haiti poor while the Dominican Republic is richer? It isn't one single reason. Haiti got the drier, steeper half. It was a colony built on slavery, that had to pay a huge debt for its freedom. Its dictators looted instead of building. And it lost its forests, then got hit by disaster after disaster.",
  "shots": [c("drier", {"type": "questions", "items": FIVE, "done": [0]}), c("colony", {"type": "questions", "items": FIVE, "done": [0, 1]}),
            c("pay", {"type": "questions", "items": FIVE, "done": [0, 1, 2]}), c("dictators", {"type": "questions", "items": FIVE, "done": [0, 1, 2, 3]}),
            c("forests", {"type": "questions", "items": FIVE, "done": [0, 1, 2, 3, 4]})]},
 {**P("citadelle", "Citadelle Laferrière, Haiti", "a symbol of what Haiti achieved", move="in"),
  "narration": "But remember, Haiti is the country that defeated Napoleon and ended slavery on its own. Its people built this fortress on a mountain top. With safety, honest government and trees on its hills again, Haiti could rise too.",
  "shots": [c("safety", {"type": "questions", "items": ["Safety on the streets", "Honest government", "Trees back on the hills"], "done": [0, 1, 2]})]},
 {**Q("Can Haiti rise again? Tell us in the comments.", BRAND),
  "narration": "What do you think? Can Haiti rise again? Tell us in the comments, and subscribe for more stories about how countries got rich, and why some fell behind.",
  "shots": [c("subscribe", {"type": "title", "text": "SUBSCRIBE · " + BRAND.upper()})]},
]

json.dump(meta, open("episode/haiti/meta.json", "w"), indent=1)
for i, part in enumerate([p1, p2, p3, p4], 1):
    json.dump(part, open(f"episode/haiti/{i}.json", "w"), indent=1, ensure_ascii=False)
parts = [p1, p2, p3, p4]
json.dump({**meta, "scenes": [s for p in parts for s in p]}, open("episode/haiti.json", "w"), indent=1, ensure_ascii=False)
print(sum(len(s["narration"].split()) for p in parts for s in p), "words,",
      sum(1 for p in parts for s in p for x in [s] + s.get("shots", []) if x.get("type") == "map"), "map shots,",
      sum(1 for p in parts for s in p for x in [s] + s.get("shots", []) if x.get("type") == "image"), "photo shots")

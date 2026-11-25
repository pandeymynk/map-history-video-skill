# Picking a topic that people already want

The cheapest way to get views is to make a better version of a video people are already watching. Check demand first, every time.

## 1. List what's out there

```bash
python3 scripts/yt_research.py "why argentina is poor" "haiti vs dominican republic" "why poland got rich"
python3 scripts/yt_research.py --min 400000 "why is the philippines poor"     # only big hits
```

Each line shows views, age, title and channel. If the script returns nothing (consent page, layout change), search YouTube in a browser and read the numbers off the results page.

Search 10–20 candidate queries at once. Good seeds: "why X is poor", "why X is rich", "how X got rich", "X vs Y", "why X collapsed", "X went from rich to poor", "the entire history of X", "why X has no …", "why X is so empty".

## 2. What a good topic looks like

- **Proven:** several videos at **400k+ views** on the same question.
- **Fresh demand:** at least one big result from the **last 1–6 months**, ideally from a small or mid-size channel. A 2M-view video from 7 years ago on a giant channel proves less than a 400k video from last month on a 20k-subscriber channel.
- **Not saturated this week:** if three channels posted the exact same title in the last few days, pick another angle or wait.
- **Map-friendly:** borders, neighbours, routes, islands, resources — something a map explains better than talking.
- **A clear question with a satisfying answer:** "Same island, why is one side 6× richer?" beats "The history of Haiti".

Formats that keep working:
| Format | Example |
|---|---|
| Rich vs poor neighbours | Why Haiti is poor while the Dominican Republic is rich |
| Fall from the top | Why Argentina went from rich to poor |
| Rich against the odds | How Dubai got rich without oil · How Switzerland got rich with no resources |
| Resource paradox | Why Russia is poor with so much land and oil · Why Nigeria is poor despite oil |
| Split countries | Why South Korea got rich and North Korea didn't · Bangladesh vs Pakistan |
| Collapse | Why Sri Lanka went bankrupt · Why Venezuela collapsed |

## 3. Decide and say why

Tell the user the topic, the evidence (e.g. "1.45M views in 1 month on a 50k channel; 8.6M on Vox"), and the angle you'll take. Then research facts from primary or well-known sources (World Bank, IMF, UN, Maddison Project for historical GDP, encyclopaedias) and keep a short list of the numbers you'll use with their source, so the description can say where figures come from.

"""
Free, local voice-over with Kokoro (Apache-2.0, OK for monetized videos). No API key, no credits.

  .venv-tts/bin/python scripts/tts_local.py episode/<name>.json [--voice bm_lewis] [--speed 1.0]

Each scene is synthesized on its own, one sentence at a time, with a natural pause between
sentences — so nothing is ever cut out of a longer recording and no word can be clipped.
Word timings come straight from Kokoro. Output: public/audio/<name>/scene-N.mp3 + src/timeline.json.

Voices: bm_lewis, bm_george, bm_fable, bm_daniel (British male), am_michael, am_adam (US male),
bf_emma, af_heart (female). Pin a choice with "localVoice" / "localSpeed" in the script JSON.
"""
import argparse, json, os, re, subprocess, pathlib
import numpy as np
import soundfile as sf
# espeak-ng (used by Kokoro for unusual words) cannot read its data from a very long folder path (it resolves
# links too) and then exits silently. If this project sits deep in the file system, use a short copy instead.
import os, shutil, tempfile
import espeakng_loader
_dp = espeakng_loader.get_data_path()
if len(_dp) > 120:
    _short = os.path.join(tempfile.gettempdir(), "espeak-ng-data-mhv")
    if not os.path.isdir(_short): shutil.copytree(_dp, _short)
    espeakng_loader.get_data_path = lambda: _short
from kokoro import KPipeline

ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("script", nargs="?", default="episode/script.json")
ap.add_argument("--voice"); ap.add_argument("--speed", type=float)
a = ap.parse_args()

script = json.loads((ROOT / a.script).read_text())
name = pathlib.Path(a.script).stem
voice = a.voice or script.get("localVoice", "am_michael")
speed = a.speed or script.get("localSpeed", 1.08)
SR = 24000
LEAD, SENT_GAP, TAIL, PAD_AFTER = 0.05, 0.12, 0.12, 0.08  # seconds
outdir = ROOT / "public/audio" / name
outdir.mkdir(parents=True, exist_ok=True)
pipe = KPipeline(lang_code=voice[0], repo_id="hexgrad/Kokoro-82M")

def sentences(text: str):
    parts = re.split(r'(?<=[.!?])\s+|(?<=[.!?]["”])\s+', text.strip())
    return [p for p in parts if p]

def clean(w): return re.sub(r"[^a-z0-9']", "", w.lower())

scenes, total = [], 0.0
for i, s in enumerate(script["scenes"]):
    text = (s.get("narration") or "").strip()
    if not text:
        scenes.append({**s, "audio": None, "words": [], "duration": s.get("hold", 3)})
        continue
    audio = [np.zeros(int(SR * LEAD), np.float32)]
    t, words = LEAD, []
    for sent in sentences(text):
        cur = None
        for r in pipe(sent, voice=voice, speed=speed, split_pattern=None):
            seg = r.audio.cpu().numpy() if hasattr(r.audio, "cpu") else np.asarray(r.audio, np.float32)
            for tok in r.tokens or []:
                if tok.start_ts is None:
                    continue
                if cur is None:
                    cur = {"w": "", "start": t + tok.start_ts, "end": t + tok.end_ts}
                cur["w"] += tok.text
                cur["end"] = t + (tok.end_ts or tok.start_ts)
                if tok.whitespace:
                    words.append(cur); cur = None
            audio.append(seg); t += len(seg) / SR
        if cur: words.append(cur)
        audio.append(np.zeros(int(SR * SENT_GAP), np.float32)); t += SENT_GAP
    audio[-1] = np.zeros(int(SR * TAIL), np.float32)  # last gap becomes the tail
    wav = np.concatenate(audio)
    # punctuation-only "words" (a stray quote mark) are merged into the previous word
    merged = []
    for w in words:
        if merged and not clean(w["w"]):
            merged[-1]["w"] += w["w"]; merged[-1]["end"] = w["end"]
        else:
            merged.append(w)
    words = [{"w": w["w"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in merged]
    file = f"audio/{name}/scene-{i}.mp3"
    tmp = outdir / f"scene-{i}.wav"
    sf.write(tmp, wav, SR)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-ar", "44100", "-b:a", "192k", str(ROOT / "public" / file)], check=True)
    tmp.unlink()
    dur = len(wav) / SR + PAD_AFTER
    for d in s.get("dialogue", []):  # let the last speech bubble finish before the cut
        hit = next((w for w in words if d.get("cue") and clean(w["w"]).startswith(d["cue"].lower())), None)
        dur = max(dur, (d.get("at") if d.get("at") is not None else (hit["start"] if hit else 0)) + d.get("hold", 2) + 0.3)
    scenes.append({**s, "audio": file, "words": words, "duration": round(dur, 3)})
    total += dur
    print(f"scene {i + 1}: {len(wav) / SR:.1f}s, {len(words)} words", flush=True)

meta = {k: script.get(k) for k in ("title", "captions", "guide", "thumbnail")}
meta["captions"] = meta["captions"] or False
meta["guide"] = True if meta["guide"] is None else meta["guide"]
(ROOT / os.environ.get("TL_OUT", "src/timeline.json")).write_text(json.dumps({**meta, "episode": name, "voice": voice, "scenes": scenes}, ensure_ascii=False, indent=1))
print(f"done: {sum(x['duration'] for x in scenes) / 60:.1f} min, voice {voice}, 0 credits")

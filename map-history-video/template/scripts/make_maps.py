"""
Paint a satellite background (NASA Blue Marble, public domain) for every map view in public/maps/views.json.
Each image is reprojected to the exact Mercator view d3 uses, so country borders line up perfectly.
Source image: assets/bluemarble-24000.jpg (NASA "Whole world - land and oceans 12000", Wikimedia Commons, public domain; downloaded by scripts/get_bluemarble.sh).
Writes public/maps/<key>.jpg (skips ones that already exist) and src/mapviews.json (list of ready keys).
"""
import json, math, pathlib
import numpy as np
from PIL import Image, ImageEnhance

ROOT = pathlib.Path(__file__).resolve().parent.parent
W, H, PAD = 1920, 1080, 0  # the scene zooms in (max 1.12x) around the centre, so 1:1 coverage is enough
views = json.loads((ROOT / "public/maps/views.json").read_text())
todo = {k: v for k, v in views.items() if not (ROOT / f"public/maps/{k}.jpg").exists()}
if todo:
    Image.MAX_IMAGE_PIXELS = None
    src = np.asarray(Image.open(ROOT / "assets/bluemarble-24000.jpg").convert("RGB"))
    SH, SW, _ = src.shape
    xs, ys = np.meshgrid(np.arange(W) + 0.5, np.arange(H) + 0.5)
    for key, v in todo.items():
        k, tx, ty = v["k"], v["tx"], v["ty"]
        lam = (xs - tx) / k                                   # d3: x = tx + k*λ
        phi = 2 * np.arctan(np.exp((ty - ys) / k)) - math.pi / 2  # d3: y = ty - k*ln(tan(π/4 + φ/2))
        u = ((np.degrees(lam) + 180) % 360) / 360 * SW - 0.5
        w = (90 - np.clip(np.degrees(phi), -89.99, 89.99)) / 180 * SH - 0.5
        x0 = np.floor(u).astype(int); y0 = np.clip(np.floor(w).astype(int), 0, SH - 2)
        fx = (u - x0)[..., None]; fy = np.clip(w - y0, 0, 1)[..., None]
        x0 %= SW; x1 = (x0 + 1) % SW
        img = (src[y0, x0] * (1 - fx) * (1 - fy) + src[y0, x1] * fx * (1 - fy)
               + src[y0 + 1, x0] * (1 - fx) * fy + src[y0 + 1, x1] * fx * fy)
        out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
        out = ImageEnhance.Color(out).enhance(1.15)
        out = ImageEnhance.Contrast(out).enhance(1.08)
        out.save(ROOT / f"public/maps/{key}.jpg", quality=90)
        print("map", key, "+".join(v["focus"]), flush=True)
ready = sorted(p.stem for p in (ROOT / "public/maps").glob("*.jpg"))
(ROOT / "src/mapviews.json").write_text(json.dumps(ready))
print(f"{len(todo)} new, {len(ready)} ready")

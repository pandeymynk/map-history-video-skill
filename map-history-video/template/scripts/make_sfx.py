"""Synthesise the three small sound effects the videos use (whoosh, pop, hit) into public/sfx/.
Generated from scratch with numpy, so there are no licence questions.   python scripts/make_sfx.py"""
import pathlib, numpy as np, soundfile as sf
SR = 44100; out = pathlib.Path(__file__).resolve().parent.parent / "public/sfx"; out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
def env(n, a, r): t = np.linspace(0, 1, n); return np.minimum(t / a, 1) * np.exp(-t / r)
# whoosh: band-passed noise sweeping up then down
n = int(0.45 * SR); noise = rng.standard_normal(n)
k = np.fft.rfft(noise); f = np.fft.rfftfreq(n, 1 / SR); k *= np.exp(-((f - 1800) / 1400) ** 2); w = np.fft.irfft(k, n)
w *= np.sin(np.linspace(0, np.pi, n)) ** 2; sf.write(out / "whoosh.wav", (w / np.abs(w).max() * 0.6).astype(np.float32), SR)
# pop: short pitch-dropping sine blip
n = int(0.09 * SR); t = np.arange(n) / SR; p = np.sin(2 * np.pi * (900 - 4000 * t) * t) * env(n, 0.02, 0.25)
sf.write(out / "pop.wav", (p * 0.7).astype(np.float32), SR)
# hit: low boom + noise transient for chapter titles
n = int(1.6 * SR); t = np.arange(n) / SR
h = np.sin(2 * np.pi * (70 - 25 * t) * t) * np.exp(-t * 2.5) + 0.3 * rng.standard_normal(n) * np.exp(-t * 30)
sf.write(out / "hit.wav", (h / np.abs(h).max() * 0.8).astype(np.float32), SR)
print("sfx written to", out)

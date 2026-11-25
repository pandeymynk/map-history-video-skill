#!/bin/sh
# One-time setup:  sh scripts/setup.sh
# Needs: Node.js 18+, ffmpeg (brew install ffmpeg / apt install ffmpeg), and either uv (recommended)
# or Python 3.10-3.12.
set -e
cd "$(dirname "$0")/.."
command -v node >/dev/null || { echo "Install Node.js 18+ first (https://nodejs.org)"; exit 1; }
command -v ffmpeg >/dev/null || { echo "Install ffmpeg first (macOS: brew install ffmpeg, Ubuntu: sudo apt install ffmpeg)"; exit 1; }
echo "1/4 npm install"; npm install --no-fund --no-audit
echo "2/4 Python env for the free Kokoro voice (needs Python 3.10-3.12)"
# en_core_web_sm is the English model Kokoro's text front-end needs; installing it here avoids a
# runtime download that fails inside uv-made environments.
PKGS='kokoro>=0.9.4 soundfile numpy pillow en_core_web_sm@https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl'
if [ ! -x .venv-tts/bin/python ]; then
  if command -v uv >/dev/null; then
    uv venv --python 3.12 .venv-tts            # uv downloads Python 3.12 by itself if needed
  else
    PY=""
    for c in python3.12 python3.11 python3.10 python3; do
      if command -v $c >/dev/null && $c -c 'import sys; sys.exit(0 if (3,10) <= sys.version_info[:2] <= (3,12) else 1)'; then PY=$c; break; fi
    done
    [ -n "$PY" ] || { echo "Need Python 3.10-3.12. Easiest: install uv (curl -LsSf https://astral.sh/uv/install.sh | sh) and run this again."; exit 1; }
    "$PY" -m venv .venv-tts
  fi
fi
if command -v uv >/dev/null; then uv pip install -q --python .venv-tts/bin/python $PKGS
else .venv-tts/bin/python -m pip install -q --upgrade pip && .venv-tts/bin/python -m pip install -q $PKGS; fi
echo "3/4 sound effects + satellite image"; .venv-tts/bin/python scripts/make_sfx.py; sh scripts/get_bluemarble.sh
echo "4/4 demo voice + maps (first run downloads the Kokoro model, ~330 MB)"
npm run -s voice:local -- episode/demo.json
npm run -s maps
echo "Done. Preview with: npm run studio    Render with: npx remotion render HistoryVideo out/demo.mp4"

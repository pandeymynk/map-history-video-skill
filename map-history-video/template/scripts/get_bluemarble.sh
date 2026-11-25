#!/bin/sh
# Downloads NASA's Blue Marble world image (public domain) used for the satellite map backgrounds.
cd "$(dirname "$0")/.."
[ -f assets/bluemarble-24000.jpg ] && { echo "Blue Marble already present"; exit 0; }
mkdir -p assets
curl -L -A "map-history-video/1.0 (educational video tool)" -o assets/bluemarble-24000.jpg \
  "https://upload.wikimedia.org/wikipedia/commons/8/8f/Whole_world_-_land_and_oceans_12000.jpg"
ls -la assets/bluemarble-24000.jpg

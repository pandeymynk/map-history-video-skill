#!/bin/sh
# Re-encode a Short to ~9 MB (Chrome upload limit is 10 MB):  sh scripts/shrink.sh in.mp4 out.mp4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"); B=$(echo "8.8*8000/$D - 128" | bc)
T=$(mktemp -d); cd "$T"
ffmpeg -v error -y -i "$1" -c:v libx264 -preset slow -b:v ${B}k -pass 1 -an -f mp4 /dev/null && ffmpeg -v error -y -i "$1" -c:v libx264 -preset slow -b:v ${B}k -pass 2 -c:a aac -b:a 128k -movflags +faststart "$2"
cd /; rm -rf "$T"

#!/bin/sh
# Final audio pass:  sh scripts/finalize.sh in.mp4 out.mp4
#  1. lays a background-music bed (assets/music/*.mp3, YouTube Audio Library, no attribution needed)
#     under the narration, ducking it automatically whenever the voice speaks;
#  2. two-pass loudness normalisation to YouTube level (-14 LUFS) without pumping.
set -e
IN="$1"; OUT="$2"; DIR=$(cd "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
MIXED="$IN"
if ls "$DIR"/assets/music/*.mp3 >/dev/null 2>&1; then
  # music bed: every track once, joined with 4 s crossfades (cached)
  BED="$DIR/assets/music/bed.wav"
  if [ ! -f "$BED" ]; then
    LIST="$TMP/list.txt"; : > "$LIST"
    n=0; for f in "$DIR"/assets/music/*.mp3; do n=$((n+1)); done
    FILTER="[0:a]anull[a0]"; k=1
    while [ $k -lt $n ]; do FILTER="$FILTER;[a$((k-1))][$k:a]acrossfade=d=4[a$k]"; k=$((k+1)); done
    set --
    for f in "$DIR"/assets/music/*.mp3; do set -- "$@" -i "$f"; done
    ffmpeg -v error -y "$@" -filter_complex "$FILTER" -map "[a$((n-1))]" -ar 48000 -ac 2 "$BED"
  fi
  FADE=$(echo "$DUR - 4" | bc)
  ffmpeg -v error -y -i "$IN" -stream_loop -1 -i "$BED" -filter_complex \
    "[0:a]aresample=48000,asplit=2[voice][key];[1:a]volume=0.045,afade=t=in:d=3[m];[m][key]sidechaincompress=threshold=0.015:ratio=6:attack=25:release=450[duck];[voice][duck]amix=inputs=2:duration=first:normalize=0,afade=t=out:st=$FADE:d=4[a]" \
    -map 0:v -map "[a]" -c:v copy -c:a pcm_s16le -t "$DUR" "$TMP/mixed.mov"
  MIXED="$TMP/mixed.mov"
fi
J=$(ffmpeg -hide_banner -i "$MIXED" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -vn -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
ffmpeg -v error -y -i "$MIXED" -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -c:a aac -b:a 192k -ar 48000 "$OUT"
rm -rf "$TMP"

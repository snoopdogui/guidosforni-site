#!/usr/bin/env bash
#
# Turn a screen recording into a looping /work card cover.
#
#   scripts/make-cover.sh <recording> <slug> [--trim-top N] [--anchor left|center|right]
#                         [--start S] [--duration S] [--boomerang] [--crf N]
#
# Writes public/work/<slug>/cover.mp4 and poster.jpg.
#
# Sizing: the card cover is `aspect-ratio: 3 / 2` (app/work/work.module.css).
# Its widest on-screen size is 560 CSS px, in the single-column grid at a 600px
# viewport (600 minus two 20px gutters), so x2 for retina is 1120. The nearest
# exact 3:2 size with even sides (needed for yuv420p) is 1122x748.
#
#   --trim-top N  remove N source pixels from the top before cropping, e.g. a
#                 browser's address bar (Safari's is 104px in a Retina recording)
#   --anchor A    horizontal position of the 3:2 crop: left, center (default)
#                 or right. Use left to keep a page title on the left edge.
#   --start S     skip the first S seconds of the recording
#   --duration S  use only S seconds (from --start)
#   --boomerang   play forwards then backwards, so the loop has no jump cut
#   --crf N       x264 quality for the MP4 (default 28; higher = smaller)
#
# No WebM: at these settings VP9 came out larger than H.264 for most clips.
# components/WorkCover still accepts an optional `webm` source if that changes.
#
# The recording is only read, never modified.
set -euo pipefail

W=1122
H=748
FPS=24
CRF=28
BOOMERANG=0
TRIM_TOP=0
ANCHOR=center
START=
DURATION=

usage() { sed -n '3,29p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --boomerang) BOOMERANG=1; shift ;;
    --crf) CRF="$2"; shift 2 ;;
    --trim-top) TRIM_TOP="$2"; shift 2 ;;
    --anchor) ANCHOR="$2"; shift 2 ;;
    --start) START="$2"; shift 2 ;;
    --duration) DURATION="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) POSITIONAL+=("$1"); shift ;;
  esac
done
[[ ${#POSITIONAL[@]} -eq 2 ]] || usage
INPUT="${POSITIONAL[0]}"
SLUG="${POSITIONAL[1]}"

for bin in ffmpeg ffprobe; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "error: $bin is not installed (try: brew install ffmpeg)" >&2
    exit 1
  fi
done
[[ -f "$INPUT" ]] || { echo "error: no such file: $INPUT" >&2; exit 1; }
[[ "$TRIM_TOP" =~ ^[0-9]+$ ]] || { echo "error: --trim-top takes a whole number of pixels" >&2; exit 1; }
case "$ANCHOR" in
  left) CROP_X=0 ;;
  center) CROP_X='(iw-ow)/2' ;;
  right) CROP_X='iw-ow' ;;
  *) echo "error: --anchor must be left, center or right" >&2; exit 1 ;;
esac

# Input-side seeking, so --start/--duration also skip decoding the cut parts.
SEEK=()
[[ -n "$START" ]] && SEEK+=(-ss "$START")
[[ -n "$DURATION" ]] && SEEK+=(-t "$DURATION")

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/work/$SLUG"
mkdir -p "$OUT"

# Drop to 24fps first (screen recordings are often 120fps), trim the top, then
# crop the largest 3:2 box that fits (even sides, vertically centred, placed
# horizontally by --anchor), then scale.
TRIM="crop=iw:ih-$TRIM_TOP:0:$TRIM_TOP"
CROP="crop='trunc(min(iw,ih*3/2)/2)*2':'trunc(min(ih,iw*2/3)/2)*2':'$CROP_X':'(ih-oh)/2'"
BASE="fps=$FPS,$TRIM,$CROP,scale=$W:$H:flags=lanczos,setsar=1,format=yuv420p"

if [[ $BOOMERANG -eq 1 ]]; then
  # The reversed half drops its first frame so the turn doesn't hold a frame.
  FILTER="[0:v]$BASE,split[f][b];[b]reverse,trim=start_frame=1,setpts=PTS-STARTPTS[r];[f][r]concat=n=2:v=1:a=0[v]"
else
  FILTER="[0:v]$BASE[v]"
fi

echo "→ $SLUG: ${W}x${H} @ ${FPS}fps, crf $CRF, trim-top $TRIM_TOP, anchor $ANCHOR$([[ -n "$START$DURATION" ]] && echo ", start ${START:-0}s, duration ${DURATION:-all}")$([[ $BOOMERANG -eq 1 ]] && echo ', boomerang')"

ffmpeg -hide_banner -loglevel error -y ${SEEK[@]+"${SEEK[@]}"} -i "$INPUT" \
  -filter_complex "$FILTER" -map '[v]' -an \
  -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p -movflags +faststart \
  "$OUT/cover.mp4"

# Poster from about 1s into the finished MP4, so it matches the crop exactly.
ffmpeg -hide_banner -loglevel error -y -ss 1 -i "$OUT/cover.mp4" \
  -frames:v 1 -q:v 3 "$OUT/poster.jpg"

for f in cover.mp4 poster.jpg; do
  printf '  %-11s %6s KB\n' "$f" "$(( $(stat -f%z "$OUT/$f" 2>/dev/null || stat -c%s "$OUT/$f") / 1024 ))"
done

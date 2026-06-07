#!/usr/bin/env bash
# Used by GitHub Actions: reads current-entry.json and uploads with Groq meta
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"

ENTRY_FILE="$DIR/out/current-entry.json"
VIDEO="$DIR/out/all-reels-compilation.mp4"

if [ ! -f "$ENTRY_FILE" ]; then
  echo "No current-entry.json found, uploading without meta"
  python3 "$DIR/upload-youtube.py" "$VIDEO" --privacy public || true
  python3 "$DIR/social-upload.py" "$VIDEO" --platforms facebook --delete || true
  exit 0
fi

NAME=$(python3 -c "import json; print(json.load(open('$ENTRY_FILE'))['name'])")
QUOTE=$(python3 -c "import json; print(json.load(open('$ENTRY_FILE'))['quote'])")

echo "Uploading: $NAME — ${QUOTE:0:40}..."

python3 "$DIR/upload-youtube.py" "$VIDEO" --name "$NAME" --quote "$QUOTE" --privacy public || true
python3 "$DIR/social-upload.py" "$VIDEO" --name "$NAME" --quote "$QUOTE" --platforms facebook --delete || true

rm -f "$ENTRY_FILE"

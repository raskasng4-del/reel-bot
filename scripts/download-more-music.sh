#!/usr/bin/env bash
# Download more no-copyright music tracks for each mood
# Usage: bash scripts/download-more-music.sh
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$DIR/music"

download() {
  local query="$1"
  echo "=== Searching: $query ==="
  yt-dlp -f bestaudio -x --audio-format mp3 \
    --output "$DIR/music/%(title)s.%(ext)s" \
    --max-filesize 50M \
    --playlist-end 1 \
    "ytsearch1:$query" 2>&1 | grep -E "Destination|Finished"
  echo ""
}

# Dark ambient / mysterious
download "dark ambient background music no copyright royalty free"
download "mysterious suspense background music no copyright"

# Sad piano / emotional  
download "emotional piano music no copyright sad"
download "sad cinematic piano background free"

# Epic / dramatic
download "epic orchestral music no copyright royalty free trailer"
download "dramatic cinematic background music no copyright"

# Meditative / peaceful
download "stoic meditation music no copyright background"
download "calm ambient study music no copyright"

# Greek / ancient
download "ancient greek music no copyright philosophy"
download "greek lyre instrumental background no copyright"

# Thoughtful
download "philosophical background music no copyright thoughtful"

echo "=== Done! ==="
ls -lhS "$DIR/music"/*.mp3 2>/dev/null | head -20

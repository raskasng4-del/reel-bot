#!/usr/bin/env bash
# Download music for GitHub Actions (runs before pipeline)
# Uses yt-dlp to search for each MOOD_MAP entry and download first result
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
MUSIC_DIR="$DIR/music"
mkdir -p "$MUSIC_DIR"

# Each line: search term
# These match the MOOD_MAP prefixes in download-music.ts
SEARCH_TERMS=(
  "Dark Cinematic Ambient No Copyright Music"
  "Dark Cinematic Ambient Soundtrack Babel Royalty Free Background Music"
  "No Copyright Dark Cinematic Ambient Music Ravage by Argsound"
  "Aliaksei Yukhnevich Deliverance Epic Dark Orchestral Trailer Music Copyright Free"
  "Dreamy Ambient Cinematic Beautiful Soundtrack Inspiring Royalty Free Download Music"
  "Dark Ambient Music Mix Royalty Free Suspenseful Background Music"
  "Dark Atmospheric Cinematic Thoughtful Piano Music For Trailers and Videos"
  "Emotional Sad Piano Music Touch Download and Royalty FREE"
  "Crying Sad Emotional Background Music No Copyright Music Free Sad Music"
  "Sad and Emotional Piano by Alex Productions No Copyright Music"
  "Life Blossom by Keys of Moon Music Cinematic Classical Emotional Piano"
  "Epic Heroic Orchestral Music Compilation Cinematic Royalty Free Soundtracks"
  "Sad Dramatic Emotional Epic Music My Spirit Is Free Royalty Free"
  "Ancient Greek Background Music for Philosophy Videos No Copyright"
  "Philosophy Background Music no copyright Royalty Free Rhythms"
  "End Sad Non Copyright Background music"
  "Sad Cinematic Documentary Music by Infraction No Copyright Music"
  "Philosophy MuktoDMI Free copyright"
  "IN MEMORIAM by Onycs ambient royalty free"
  "Helen 2 Nikos Spiliotis ambient no copyright"
  "Shattered Glass Cjbeards mysterious dark piano"
  "Undertow Scott Buckley sad piano ambient"
  "Purpose Jonny Easton piano royalty free"
  "Awakening Steffen Daum epic piano no copyright"
  "Growing Up Scott Buckley piano no copyright"
  "Fuzzeke We Built This World epic orchestral trailer music"
  "Monumental Alex Productions cinematic motivational orchestral"
  "Farewell sad piano emotional royalty free"
  "Stoic and the Sailor Unicorn Heads ambient background"
  # Sad piano variety — added for diversity
  "Alone Sad Emotional Piano Royalty Free Music"
  "Rainy Day Sad Piano Background Music No Copyright"
  "Last Goodbye Emotional Piano Free Music"
  "Melancholic Night Sad Piano Ambient"
  "Tears of Hope Sad Piano Instrumental Royalty Free"
  "Broken Heart Sad Emotional Piano Music"
  "Forgotten Memories Sad Piano Ambient"
  "Lost in Thought Melancholic Piano Free Music"
  "Winter Sadness Piano Instrumental No Copyright"
  "Letting Go Emotional Piano Royalty Free"
  "Fading Light Sad Ambient Piano"
  "Empty Room Melancholic Piano Background Music"
  "Deep Sorrow Piano Music Free Download"
  "Sadness and Hope Emotional Piano Instrumental"
  "Whisper of Tears Piano Ambient No Copyright"
)

echo "=== Downloading music for GitHub Actions ==="
for term in "${SEARCH_TERMS[@]}"; do
  # Check if any file already matches
  matched=0
  for f in "$MUSIC_DIR"/*.mp3 "$MUSIC_DIR"/*.webm; do
    base=$(basename "$f")
    if [[ "$base" == "$term"* ]]; then
      matched=1
      break
    fi
  done
  if [ "$matched" -eq 1 ]; then
    echo "  Already have: $term"
    continue
  fi

  echo "  Searching: $term"
  yt-dlp -f bestaudio -x --audio-format mp3 \
    --output "$MUSIC_DIR/%(title)s.%(ext)s" \
    --max-filesize 30M \
    --playlist-end 1 \
    --socket-timeout 15 \
    --retries 2 \
    --no-check-certificate \
    "ytsearch1:$term" 2>/dev/null | grep -E "Destination|has already been" || echo "    (failed)"
done

echo "=== Music download complete ==="
ls "$MUSIC_DIR"/*.mp3 2>/dev/null | wc -l

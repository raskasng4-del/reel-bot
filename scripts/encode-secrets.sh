#!/usr/bin/env bash
# Encode files for GitHub Actions secrets
# Run this locally, then paste output into GitHub repo secrets

set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Run these commands and paste output into GitHub Secrets ==="
echo ""
echo "--- GROQ_API_KEY ---"
echo "  (paste the key directly, no encoding needed)"
echo ""
echo "--- SOCIAL_CONFIG_JSON ---"
if [ -f "$DIR/social_config.json" ]; then
  echo "  Secret value:"
  base64 -w0 < "$DIR/social_config.json"
  echo ""
else
  echo "  File not found: $DIR/social_config.json"
fi
echo ""
echo "--- YOUTUBE_TOKEN_PICKLE_B64 ---"
if [ -f "$DIR/youtube_token.pickle" ]; then
  echo "  Secret value:"
  base64 -w0 < "$DIR/youtube_token.pickle"
  echo ""
else
  echo "  File not found: $DIR/youtube_token.pickle (generate by authenticating locally first)"
fi
echo ""
echo "--- CLIENT_SECRET_JSON ---"
if [ -f "$DIR/client_secret.json" ]; then
  echo "  Secret value:"
  base64 -w0 < "$DIR/client_secret.json"
  echo ""
else
  echo "  File not found: $DIR/client_secret.json"
fi

#!/usr/bin/env bash
# Publish index.html to the tiles.hakanai.ai webroot.
# The Caddy vhost + the *.hakanai.ai wildcard DNS already exist; this only
# swaps the file, so it is safe to re-run.
set -euo pipefail
ROOT=/var/www/tiles
SRC="$(cd "$(dirname "$0")" && pwd)/index.html"

# Syntax-gate the deploy. Extract to a REAL temp file: `node --check <(...)`
# cannot stat a process-substitution pipe, so it fails for the wrong reason
# and reads as a passing guard that never actually ran.
tmp=$(mktemp /tmp/tile-parlour.XXXXXX.js)
trap 'rm -f "$tmp"' EXIT
# Concatenate EVERY <script> block. A naive sed range keeps the intervening
# </script><script> tags once there is more than one block, which yields
# invalid JS and fails the gate on a perfectly good file.
awk '/^<script>/{inb=1; next} /^<\/script>/{if(inb) print ";"; inb=0; next} inb' "$SRC" > "$tmp"
[ -s "$tmp" ] || { echo "FAILED: extracted no JS from $SRC"; exit 1; }
node --check "$tmp" || { echo "FAILED: index.html contains invalid JS"; exit 1; }
echo "js syntax ok ($(wc -l < "$tmp") lines)"

sudo mkdir -p "$ROOT"
sudo cp "$SRC" "$ROOT/index.html"
sudo chmod 644 "$ROOT/index.html"

code=$(curl -s -o /dev/null -w '%{http_code}' https://tiles.hakanai.ai/)
echo "https://tiles.hakanai.ai -> $code"
[ "$code" = "200" ] || { echo "deploy verify FAILED"; exit 1; }

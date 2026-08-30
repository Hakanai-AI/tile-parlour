#!/usr/bin/env bash
# Publish index.html to the tiles.hakanai.ai webroot.
# The Caddy vhost + the *.hakanai.ai wildcard DNS already exist; this only
# swaps the file, so it is safe to re-run.
set -euo pipefail
ROOT=/var/www/tiles
SRC="$(cd "$(dirname "$0")" && pwd)/index.html"

node --check <(sed -n '/^<script>/,/^<\/script>/p' "$SRC" | sed '1d;$d') \
  && echo "js syntax ok"

sudo mkdir -p "$ROOT"
sudo cp "$SRC" "$ROOT/index.html"
sudo chmod 644 "$ROOT/index.html"

code=$(curl -s -o /dev/null -w '%{http_code}' https://tiles.hakanai.ai/)
echo "https://tiles.hakanai.ai -> $code"
[ "$code" = "200" ] || { echo "deploy verify FAILED"; exit 1; }

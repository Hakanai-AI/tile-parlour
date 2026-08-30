# Tile Parlour · 連連看

A tile-matching game (連連看 / Onet / Mahjong Connect) in **one HTML file**.
No build step, no dependencies, no image files, no audio files.

**Play: <https://tiles.hakanai.ai>**

## The rule

Two identical tiles clear when a path joins them using **at most two turns**.
The path may travel through empty cells *and around the outside of the board* —
that border route is why two tiles on opposite edges can often still match.

## Features

- ≤2-turn matching with the connecting route drawn on each clear
- `可消除` live count of currently-matchable pairs (also powers the hint and the deadlock check)
- Auto-hint after 9s of no progress; manual hint on demand
- Combo chain: match again within 3.5s to build a multiplier
  - every level returns **+1s** (capped at +5s)
  - every **5th** level clears a pair for **free**
  - score is `100 × combo`, so chaining beats plodding by a wide margin
- Auto-reshuffle when no legal move remains, with a staggered card-flip animation
- Synthesised audio — every sound is generated at runtime via WebAudio, so the
  whole game ships with zero media assets. Separate SFX / music toggles, remembered.

## Why no assets

Emoji tile faces and synthesised sound keep the entire game a single ~25KB file.
It loads instantly, has no licensing questions, and works under strict CSPs that
block external media. Procedurally-drawn SVG tile art is the intended next step —
still assetless, but bespoke.

## Tests

The interesting logic is the path-finder and the combo economy, both pure functions
and both tested without a browser:

```sh
node test/connect.test.mjs   # ≤2-turn rule, border routing, blocked lines, 3-turn rejection
node test/solvable.test.mjs  # simulates 200 complete boards — proves winnable, no deadlock
node test/combo.test.mjs     # combo ladder, bonus cap, gift cadence, chain reset
```

## Deploy

The site is a static file served by Caddy from `/var/www/tiles` on the host that
`*.hakanai.ai` resolves to.

```sh
./deploy.sh
```

## Licence

MIT — see `LICENSE`.

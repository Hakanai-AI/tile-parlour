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
- **Time is the resource.** The board starts with 90s and cannot be finished by
  playing slowly: every match returns +3s, so you clear it by keeping matches
  coming. The clock caps at 120s, so a good run banks a buffer rather than a fortune.
- Combo chain, with a window that **tightens as the chain grows** (3.5s at ×1 down
  to 2.0s by ×10) — a long chain is earned rather than automatic
  - each level adds up to **+5s** on top of the base
  - every **5th** level clears a pair for **free**
  - score is `100 × combo`: a fast run scores ~15× a slow one for the same board
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
node test/economy.test.mjs   # difficulty curve: which player paces win, which run out
```

## Difficulty

Modelled in `test/economy.test.mjs`, by pace (seconds per match):

| pace | result | score | peak combo |
|-----:|:------:|------:|-----------:|
| 1.5s | win, full clock | 60,100 | ×34 |
| 2.5s | win, full clock | 14,500 | ×7 |
| 3.5s | win, 70s spare | 4,000 | ×1 |
| 5.0s | win, 10s spare | 4,000 | ×1 |
| 6.0s | **loses** at 28 pairs | 2,800 | ×1 |

The losing boundary sits near 5.5s per match.

## Deploy

The site is a static file served by Caddy from `/var/www/tiles` on the host that
`*.hakanai.ai` resolves to.

```sh
./deploy.sh
```

## Licence

MIT — see `LICENSE`.

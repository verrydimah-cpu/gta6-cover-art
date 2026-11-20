# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**VICE COVER STUDIO** — a static, fully offline web app that turns your photos and a caption into poster-style cover art on a canvas. Load photos, cast your crew across gold-framed panels, pick a photographic grade, and export a finished cover as a PNG. One render function drives both the live preview and every export, so what you see is exactly what you download.

## What it does

- **Ensemble Poster** (the default): ten gold-framed cast panels on a dark plum-brown backdrop around one dominant central portrait — THE DRIVER in the centre, THE GETAWAY, THE RIDE, THE FIXER and THE RACER down the left, THE CAPTAIN, THE MUSCLE and THE INSIDER down the right, and THE RIDER with THE LOOKOUT along the bottom row.
- **Seven layouts** in total, including a Vice Classic multi-panel collage with angled dividers, Solo Hero, Duo Split, Trio Strip, Quad Grid and Mosaic Six — with gold, white, black or no divider keylines.
- **Four photographic grades** — Vice Sunset, Neon Night, Golden Hour and Ocean Drive — built from multi-stop sky gradients, a soft sun glow screened across every panel, and split toning that keeps skin tones natural.
- **Full casting control**: photo loading for several photos at once, per-panel crop, position, zoom and punch, and editable per-panel role tags drawn as black slash-tags with a gold rule on a shared baseline grid.
- **Three caption styles**, an editable cover title, script subtitle, ribbon tagline and review line, plus original poster furniture: five gold stars, a VOL. 1 corner box, a retro-chrome stacked title, a BEST CAST seal, a barcode block, a COMING SOON block and a tiny fictional billing block.
- **Film finish**: seeded luminance-only film grain, a gentle vignette, and an in-app Sharp (unsharp) finish, default 0.62, shared by the preview and the exports.
- **Surprise Me**: nine one-click recipes that recast the whole poster.
- **Exports** at exactly 1080×1080, 1080×1350 and 1920×1080 px from the app's own export buttons.
- **Zero network**: no external requests anywhere — the app, its font and its sample cast all ship in this repository and run from local files.

Round 8 is a finesse pass over the round 7 studio: dithered gradients with no visible banding, finer and softer grain, a gentler vignette, cleaner chrome lettering with a softer, more even neon glow, balanced punch across all ten ensemble panels with natural skin tones, and micro-spaced poster furniture — subtitle, ribbon and billing on one optical rhythm — checked at thumbnail size as well as full size.

## Run it

```sh
node serve.ts
# then open http://localhost:8417/app/ in a browser
```

To build the hand-in bundle (app + screenshots + dossier.json) into an output directory:

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

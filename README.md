# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** — a fully offline web app that turns a photo and a caption into GTA-poster-style cover art. Drop in your own photos (they are read on your machine and never uploaded), cast them across a multi-panel collage, frame each panel by dragging and scrolling, pick a colour grade, set the caption, and export a finished PNG in the common post sizes: 1080 × 1080, 1080 × 1350 and 1920 × 1080.

What is inside:

- **One renderer for preview and export** — `app/src/render.js` draws the live preview and the exported PNG through the same `renderCover`, so what you see is exactly what you post.
- **Seven layouts** — the Ensemble Poster (one dominant central portrait with a cast of side panels, slash role tags, review strip, billing block, seal and barcode, all drawn by the app) plus Vice Classic, Duo Feature, Quad Grid, Top Strip, Story Strips and Mosaic Six, with angled dividers and per-panel crop/position "punch" tuned per subject.
- **Four photographic grades** — Vice Sunset, Neon Night, Golden Hour and Ocean Drive — with believable sky gradients, sun glow, film grain, a vignette and an in-app Sharp finish (0.6 by default).
- **Caption craft** — Anton display lettering with tight letterfit and chrome, neon or gallery-caps styles; a script subtitle on a dark underlay with a neon glow; a ribbon tagline strip; three divider styles plus clean white.
- **Surprise Me** — nine house recipes that deal a complete, coherent poster in one click.
- **Eight bundled sample photos — a full cast** — the driver, a speedboat getaway, a sunset supercar and a yacht captain, plus a silver-haired fixer, a street racer, a bodyguard and a glamorous insider, all made for this studio and free to post — so the first cover is thirty seconds away even before you upload anything of your own. The Ensemble Poster seats all eight around one dominant central portrait, each with its own role tag.
- **Original throughout** — every word, name and ornament is the studio's own; no Rockstar logos, wordmarks, artwork, characters or fonts. The Anton typeface ships under the SIL Open Font License (`app/fonts/OFL.txt`).

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. There is no build step and no network: serve the `app/` folder with any static file server and `app/index.html` just works. To hand the entry in the way the grader runs it:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory — resolving them from its own location, so it works from any working directory — clears only the output directory's contents (never the directory itself, which may be a mount), and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`.

---

Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards

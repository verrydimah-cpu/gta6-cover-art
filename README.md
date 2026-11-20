# gta6-cover-art

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/verrydimah-cpu/gta6-cover-art/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** is a static, fully offline web app that turns a photo and a caption into GTA-poster-style cover art: a multi-panel collage with angled or gold-framed dividers, retro-chrome Anton lettering, and a Vice City sunset or neon grade — exported as a PNG in the three common post sizes.

The default cover is an *ensemble movie poster*: one dominant central portrait framed by four cast panels with thin gold frames and black slash role-tags (The Driver, The Getaway, The Ride, The Captain), a five-star review strip and VOL. 1 box at the top, and a billing block, BEST CAST seal and barcode along the bottom — all drawn by the app's own canvas renderer, all of it editable.

Round 5 is a realism pass: richer multi-stop skies with a soft shared sun glow, fine luminance film grain instead of coloured noise, tighter chrome letterfit with a deeper shadow stack, and a slightly stronger default Sharp finish that still stays halo-free.

## What it does

- **Any photo** — upload your own picture (it is read locally and never leaves your machine) or start from the four bundled AI-made samples. Fill the panels with several photos, or stretch one photo across all of them.
- **Seven collage layouts** — Ensemble Poster, Vice Classic, Duo Feature, Quad Grid, Top Strip, Story Strips and Mosaic Six, all sliced with angled dividers.
- **Per-panel control** — pick each panel's photo (or leave it as sunset sky), type its role tag, drag the photo inside its frame, scroll to zoom, and tune each panel's punch.
- **Four photographic grades** — Vice Sunset, Neon Night, Golden Hour and Ocean Drive: multi-stop skies, a soft shared sun glow, split toning, fine luminance film grain and a gentle vignette, kept natural on skin and paintwork.
- **Three caption styles** — Chrome poster (orange-to-pink foil title, neon script subtitle, ribbon tagline), Bottom banner and Top billing, with editable title, subtitle and tagline.
- **Divider styles** — thin gold frames, ink and paper, neon glow, or a chrome edge.
- **Film finish** — a grain/vignette strength control and a Sharp finish unsharp mask (default 0.62) baked into the preview and every export.
- **Surprise Me** — nine art-directed recipes that set layout, grade, caption, dividers and punch in one click.
- **Exports** — one `renderCover` canvas function drives the live preview and the PNG exports at exactly 1080 × 1080, 1080 × 1350 and 1920 × 1080.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
```

Any static file server pointed at `app/` works just as well — the app is plain files with no build step and makes no network requests. Photos are read on your own machine via the file picker and are never uploaded anywhere.

## Handing it in

`main.ts` is the make.fun hand-in program: it copies `app/` and `screenshots/` into the output directory (`/output`, or `MAKEFUN_OUTPUT_DIR` outside the grader) and writes `dossier.json` with `buildDossier` from `vendor/makefun-app.ts`. The output directory is treated as a mount point — it is created if needed and only its contents are cleared, never the directory itself.

## Files

- `app/index.html`, `app/style.css` — the editor page and its styling.
- `app/src/render.js` — the one canvas renderer behind preview and exports: panels, grades, dividers, role tags, chrome lettering, poster furniture, grain and vignette.
- `app/src/layouts.js` — collage geometry: band-sliced layouts plus the explicit ensemble poster grid.
- `app/src/grades.js` — the four colour grades. `app/src/decor.js` — palms, sun disc and caption glow. `app/src/shots.js` — the nine Surprise Me recipes. `app/src/main.js` — editor state, controls, drag/zoom and export.
- `app/fonts/` — Anton (SIL Open Font License, see `OFL.txt`) and `app/samples/` — four AI-made sample photos.
- `shots.json` — the screenshot specification the captures in `screenshots/` follow.

---

<sub>Entered on [make.fun](https://make.fun/?ref=hz6kvzj2&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
